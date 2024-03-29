/// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import { ERC20 } from "./ERC20.sol";

contract bKES is ERC20{

    /// @notice variable to track owner address
    address private owner;
    ERC20 token;

    /// @notice event to track mint events
    event Mint(address account, uint256 amount);
    /// @notice event to track burn events
    event Burn(address account, uint256 amount);

    constructor() ERC20("BitKES", "bKES"){}

    // modifier onlyOwner() {
    //     require(msg.sender == owner, "Unauthorized address");
    //     _;
    // }

    /// @notice function to mint bKES
    function mintbKES(address account, uint256 _amount) external {
        
        mint(account, _amount);

        totalSupply += _amount;

        emit Mint(account, _amount);
    }

    /// @notice function to burn bKES
    function burnbKES(address account, uint256 _amount) external {
        burn(account, _amount);

        totalSupply -= _amount;

        emit Burn(account, _amount);
    }
}