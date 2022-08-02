// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract OpenSeaAPIConsumer is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 public total_price;
    uint256 public decimals;
    string public payment_token;

    bytes32 private jobId;
    uint256 private fee;

    event RequestNFTData(bytes32 indexed requestId, uint256 total_price);

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
    function requestNFTData() public returns (bytes32 requestId) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        // Set the URL to perform the GET request on
        // NOTE: If this oracle gets more than 5 requests from this job at a time, it will not return. 
        request.add("get", "https://api.opensea.io/api/v1/asset/0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb/1/?include_orders=false");
        
        // Set the path to find the desired data in the API response, where the response format is:
        // {
        //   "last_sale": {
        //     "asset": {
        //         "decimals": null,
        //         "token_id": "1"
        //     },
        //     "asset_bundle": null,
        //     "event_type": "successful",
        //     "event_timestamp": "2020-11-30T18:44:26",
        //     "auction_type": null,
        //     "total_price": "60000000000000000000",
        //     "payment_token": {
        //         "symbol": "ETH",
        //         "address": "0x0000000000000000000000000000000000000000",
        //         "image_url": "https://openseauserdata.com/files/6f8e2979d428180222796ff4a33ab929.svg",
        //         "name": "Ether",
        //         "decimals": 18,
        //         "eth_price": "1.000000000000000",
        //         "usd_price": "1097.799999999999955000"
        //     },
        // }

        // string[] memory path = new string[](2);
        request.add("path", "last_sale, total_price");

        // request.add("get", nftAddressEndpoint);
        
        // Multiply the result by 10000000000 to remove decimals
        request.addInt("times", 10000000000);
        
        // Sends the request
        return sendChainlinkRequest(request, fee);
    }
    
    /**
     * Receive the response in the form
     */ 
    function fulfill(bytes32 _requestId, uint256 _totalPrice) public recordChainlinkFulfillment(_requestId)
    {
        total_price = _totalPrice;
        // payment_token = _paymentToken;
        // decimals = _decimals;
        emit RequestNFTData(_requestId, _totalPrice);
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
