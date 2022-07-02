/// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import {ERC20Permit} from "./ERC20.sol";
import "./oraclePriceFeed.sol";

contract bKES is ERC20Permit{

    address private owner;
    // uint256 totalSupply;
    ERC20Permit token;
    APIConsumer priceFeed;

    event Mint(address account, uint256 amount);
    event Burn(address account, uint256 amount);

    constructor() ERC20Permit("BitKES", "bKES"){}

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized address");
        _;
    }

    function mintbKES(address account, uint256 _amount) external onlyOwner {

        uint256 currentMATICKSHPrice = priceFeed.price();

        uint256 cValue = currentMATICKSHPrice * _amount;

        uint bKESDeposit = (cValue * 100) / 65;
        
        mint(account, bKESDeposit);

        totalSupply += bKESDeposit;

        emit Mint(account, bKESDeposit);
    }

    function burnbKES(address account, uint256 _amount) external onlyOwner{
        burn(account, _amount);

        totalSupply -= _amount;

        emit Burn(account, _amount);
    }
}