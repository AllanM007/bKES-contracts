/// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import {ERC20Permit} from "./ERC20.sol";
import "./priceFeed.sol";

contract bKES is ERC20Permit{

    address private owner;
    uint256 totalSupply;
    ERC20Permit token;
    PriceConsumerV3 priceFeed;

    event Mint(address account, uint256 amount);
    event Burn(address account, uint256 amount);

    constructor() ERC20Permit("BitKES", "bKES"){}

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized address");
        _;
    }

    function mintbKES(address account, uint _amount) external onlyOwner {

        // int256 currentMATICUSDPrice = priceFeed.getLatestPrice();

        // uint8 MaticDecimals = priceFeed.getDecimalPlaces();

        // uint256 MaticPrice = MaticDecimals * currentMATICUSDPrice;

        // uint kshMaticValue = MaticPrice * KshUSDXRate;

        // uint MaticKshValue = kshMaticValue * MaticAmount;
        
        mint(account, _amount);

        totalSupply += _amount;

        emit Mint(account, _amount);
    }

    function burnbKES(address account, uint256 _amount) external onlyOwner{
        burn(account, _amount);

        totalSupply -= _amount;

        emit Burn(account, _amount);
    }
}