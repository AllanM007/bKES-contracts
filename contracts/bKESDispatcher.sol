/// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import { ERC20 } from "./ERC20.sol";
import { CollateralAdapter } from "./collateralAdapter.sol";

contract bKES is ERC20{

    address private owner;
    ERC20 token;
    CollateralAdapter collateralAdapt;

    // mapping(address => uint256) VaultDebtPositions;

    event Mint(address account, uint256 amount);
    event Burn(address account, uint256 amount);

    constructor() ERC20("BitKES", "bKES"){}

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized address");
        _;
    }

    function mintbKES(address account, uint256 _amount) external {

        uint VaultAmnt = collateralAdapt.Vault(account);

        require( VaultAmnt > _amount, "Cannot mint more than vault amount");
        
        mint(account, _amount);

        totalSupply += _amount;

        uint currentDebt = collateralAdapt.ActiveDebtAmount(account);
        
        currentDebt += _amount;

        emit Mint(account, _amount);
    }

    function burnbKES(address account, uint256 _amount) external {
        burn(account, _amount);

        totalSupply -= _amount;

        emit Burn(account, _amount);
    }
}