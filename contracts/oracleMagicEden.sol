// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract MagicEdenAPIConsumer is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 public total_price;

    bytes32 private jobId;
    uint256 private fee;

    event RequestMagicEdenNFTData(bytes32 indexed requestId, uint256 total_price);

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
    function requestNFTData(string memory nftAddressEndpoint) public returns (bytes32 requestId) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        // Set the URL to perform the GET request on
        // NOTE: If this oracle gets more than 5 requests from this job at a time, it will not return. 
        request.add("get", nftAddressEndpoint);

        // [
        //     {
        //         "pdaAddress": "BaUX9EGhbqdEHhLDN3Ypd4M97P1czX8H87H8smcV3Ee4",
        //         "auctionHouse": "",
        //         "tokenAddress": "HP91KznvAa7unW6cE4ZG7cU3YNUjuJNeGg4PVGRa9byB",
        //         "tokenMint": "HdcrPMF4kHKqy5V9JibNSoWLNpqnxQUBDEBeimZkLf7u",
        //         "seller": "EWmtsfBA8EikR3vvhsXgxn7cBQCUZfXJ7jMwXUpYRzXY",
        //         "tokenSize": 1,
        //         "price": 99
        //     }
        // ]

        string[] memory path = new string[](2);
        path[0] = "0";
        path[1] = "price";
        request.addStringArray("path", path);

        request.add("get", nftAddressEndpoint);
        
        // Multiply the result by 10000000000 to remove decimals
        // request.addInt("times", 10000000000);
        
        // Sends the request
        return sendChainlinkRequest(request, fee);
    }
    
    /**
     * Receive the response in the form
     */ 
    function fulfill(bytes32 _requestId, uint256 _totalPrice) public recordChainlinkFulfillment(_requestId)
    {
        total_price = _totalPrice;

        emit RequestMagicEdenNFTData(_requestId, _totalPrice);
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
