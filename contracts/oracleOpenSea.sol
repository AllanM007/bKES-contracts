// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract OpenSeaAPIConsumer is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 public price;
    bytes32 private jobId;
    uint256 private fee;

    event RequestNFTPrice(bytes32 indexed requestId, uint256 price);

    /**
     * @notice Initialize the link token and target oracle
     *
     * Network: Polygon Mumbai Testnet
     * Oracle: 0x58bbdbfb6fca3129b91f0dbe372098123b38b5e9
     * Job ID: da20aae0e4c843f6949e5cb3f7cfe8c4
     * LINK address: 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
     * Fee: 0.01 LINK
     */
    constructor() ConfirmedOwner(msg.sender){
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0xc8D925525CA8759812d0c299B90247917d4d4b7C);
        jobId = 'bbf0badad29d49dc887504bacfbb905b';
        fee = 10**16; //0.01
    }

    /**
     * Create a Chainlink request to retrieve API response, find the target price
     * data, then multiply by 100 (to remove decimal places from price).
     */
    function requestNFTPrice(string memory nftAddressEndpoint) public returns (bytes32 requestId) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        // Set the URL to perform the GET request on
        // NOTE: If this oracle gets more than 5 requests from this job at a time, it will not return. 
        request.add("get",
         nftAddressEndpoint);
        
        // Set the path to find the desired data in the API response, where the response format is:
        // {
        //     "Realtime Currency Exchange Rate": {
        //       "1. From_Currency Code": "BTC",
        //       "2. From_Currency Name": "Bitcoin",
        //       "3. To_Currency Code": "CNY",
        //       "4. To_Currency Name": "Chinese Yuan",
        //       "5. Exchange Rate": "207838.88814500",
        //       "6. Last Refreshed": "2021-01-26 11:11:07",
        //       "7. Time Zone": "UTC",
        //      "8. Bid Price": "207838.82343000",
        //       "9. Ask Price": "207838.88814500"
        //     }
        //     }
        string[] memory path = new string[](2);
        path[0] = "collection";
        path[1] = "stats";
        path[2] = "";
        request.addStringArray("path", path);
        
        // Multiply the result by 10000000000 to remove decimals
        request.addInt("times", 10000000000);
        
        // Sends the request
        return sendChainlinkRequest(request, fee);
    }
    
    /**
     * Receive the response in the form of uint256
     */ 
    function fulfill(bytes32 _requestId, uint256 _price) public recordChainlinkFulfillment(_requestId)
    {
        price = _price;
        emit RequestNFTPrice(_requestId, _price);
    }

    /**
     * Send Link to the contract
     */

    function sendLink(uint256 _amount) public {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(address(this), _amount), 'Unable to transfer');
    }

    /**
     * Allow withdraw of Link tokens from the contract
     */
    function withdrawLink() public {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), 'Unable to transfer');
    }
}
