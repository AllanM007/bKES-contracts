/// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import { bKES } from "./bKESDispatcher.sol";
import { ERC20 } from "./ERC20.sol";

contract CollateralAdapter is ERC20, bKES{
    
    bKES bKESContract = new bKES();

    mapping(address => uint256) public Vault;
    mapping(address => uint256) public ActiveDebtAmount;
    mapping(address => uint256) public HealthFactor;

    constructor(){
        // token = bKES(address(0x0000000000000000000000000000000000001010));
    }

    event SuccesfulERC20Valuation(address account, uint256 amount);
    event SuccesfulERC20Withdrawal(address account, uint256 amount);

    event successfulbKESMint(address account, uint amount);
    event successfulbKESBurn(address account, uint amount);

    function collateralValuation(address _account, uint256 _amount, uint256 _collateralPrice) public returns(uint256){

        // calculate total colateral value in kes
        uint256 collateralValue = _collateralPrice * _amount;

        //get 2/3 value of collateral deposit to transfer to user wallet as bKES
        uint256 bKESVal = collateralValue * 65 / 100;

        // convert bKES price to 18 decimal places ERC20 standard for minting
        uint256 collateralAmount = bKESVal / 10**6;

        //update user's bKES Vault balance
        Vault[_account] += collateralAmount;

        emit SuccesfulERC20Valuation(_account, collateralAmount);
        return collateralValue;
    }

    function withdrawTokenCollateral(address _account, address collateralAddress, uint _amount) public returns(bool){

        // revert bKES back to collateral value
        uint256 collateralWithdrawal = _amount * 100 / 65;
        
        // transfer collateral back to the user's wallet
        bKES(collateralAddress).transferFrom(address(this), _account, collateralWithdrawal);

        // burn bKES token to remove them from circulation
        bKESContract.burnbKES(_account, _amount);

        emit SuccesfulERC20Withdrawal(_account, _amount);
        return true;
    }

    function calculateHealthFactor(address _account, uint256 collateralPrice) public returns(uint256){

        uint256 currentDebt = ActiveDebtAmount[_account];

        uint256 collateralAmount = Vault[_account] * 100 / 65;

        uint256 collateralValue = collateralAmount * collateralPrice;

        uint256 debtRatio = currentDebt / collateralValue * 100;

        HealthFactor[_account] = debtRatio;

        return debtRatio;
    }

    function initiateMint(address _account, uint _amount) public returns(bool){
        uint VaultAmount = Vault[_account];

        require( VaultAmount > _amount, "Cannot mint more than vault amount");

        bKESContract.mintbKES(_account, _amount);

        emit successfulbKESMint(_account, _amount);

        uint newVaultBalance = VaultAmount - _amount;

        ActiveDebtAmount[_account] += _amount;

        Vault[_account] = newVaultBalance;

        return true;
    }

    function initiateBurn(address _account, uint _amount) public returns(bool){
        uint VaultAmount = Vault[_account];

        require( VaultAmount >= _amount , "Cannot burn more than vault amount");

        bKESContract.burnbKES(_account, _amount);

        emit successfulbKESBurn(_account, _amount);

        uint newVaultBalance = VaultAmount - _amount;

        Vault[_account] = newVaultBalance;

        ActiveDebtAmount[_account] -= _amount;       

        return true;
    }
    
    function liquidatePosition(address _owner, address _liquidator, uint256 _amount) public returns(bool){
        require(85 >=HealthFactor[_owner], "Position still valid");

        uint256 newVault = ActiveDebtAmount[_owner] - _amount;

        ActiveDebtAmount[_owner] = newVault;

        return true;
    }

}