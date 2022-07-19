/// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import { bKES } from "./bKESDispatcher.sol";
import { ERC20 } from "./ERC20.sol";
// import { APIConsumer } from "./oraclePriceFeed.sol";

contract CollateralAdapter is ERC20, bKES{
    
    bKES bKESContract = new bKES();
    uint256 public collateralPrice;

    mapping(address => uint256) public Vault;
    mapping(address => uint256) public ActiveDebtAmount;
    mapping(address => mapping(uint256 => uint256)) public HealthFactor;

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
        uint256 bKESDeposit = bKESVal / 10**6;

        //update user's bKES Vault balance
        Vault[_account] += bKESDeposit;

        emit SuccesfulERC20Valuation(_account, bKESDeposit);
        return bKESDeposit;
    }

    function withdrawTokenCollateral(address _account, uint _amount) public returns(uint){

        // revert bKES back to collateral value
        uint256 collateralWithdrawal = _amount * 100 / 65;
        
        // transfer collateral back to the user's wallet
        token.transferFrom(address(this), msg.sender, collateralWithdrawal);

        // burn bKES token to remove them from circulation
        bKESContract.burnbKES(_account, _amount);

        emit SuccesfulERC20Withdrawal(_account, _amount);
        return _amount;
    }

    function calculateHealthFactor() public returns(uint){}

    function initiateMint(address _account, uint _amount) public returns(bool){
        uint VaultAmount = Vault[_account];

        require( VaultAmount > _amount, "Cannot mint more than vault amount");

        bKESContract.mintbKES(_account, _amount);

        emit successfulbKESMint(_account, _amount);

        uint newVaultBalance = VaultAmount - _amount;

        Vault[_account] = newVaultBalance;

        uint currentDebt = ActiveDebtAmount[_account];
        
        currentDebt += _amount;

        return true;
    }

    function initiateBurn(address _account, uint _amount) public returns(bool){}

}