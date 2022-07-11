/// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import { bKES } from "./bKESDispatcher.sol";
import { ERC20 } from "./ERC20.sol";
import { APIConsumer } from "./oraclePriceFeed.sol";

contract CollateralAdapter{
    
    APIConsumer public priceFeed;
    ERC20 public token;
    bKES public bKESDispatcher;

    mapping(address => uint256) public Vault;
    mapping(address => uint256) public ActiveDebtAmount;
    mapping(address => mapping(uint256 => uint256)) public HealthFactor;

    constructor(){
        // token = bKES(address(0x0000000000000000000000000000000000001010));
    }

    event SuccesfulERC20Valuation(address account, uint256 amount);
    event SuccesfulERC20Withdrawal(address account, uint256 amount);

    function collateralValuation(address _account, uint256 _amount) public payable returns(uint256){

        // get MATIC-KES Exchange rate
        uint256 currentMATICKSHPrice = priceFeed.price();

        // calculate total colateral value in kes
        uint256 collateralValue = currentMATICKSHPrice * _amount;

        //get 2/3 value of collateral deposit to transfer to user wallet as bKES
        uint256 bKESVal = collateralValue * 65 / 100;

        // convert bKES price to 18 decimal places ERC20 standard for mminting
        uint256 bKESDeposit = bKESVal / 10**6;

        //update user's Vault balance
        Vault[_account] += _amount;

        // bKESDispatcher.mintbKES(_account, bKESDeposit);

        emit SuccesfulERC20Valuation(_account, bKESDeposit);
        return bKESDeposit;
    }

    function withdrawTokenCollateral(address _account, uint256 _amount) public returns(bool){

        // revert bKES back to collateral value
        uint256 collateralWithdrawal = _amount * 100 / 65;
        
        // transfer collateral back to the user's wallet
        token.transferFrom(address(this), msg.sender, collateralWithdrawal);

        // burn bKES token to remove them from circulation
        bKESDispatcher.burnbKES(_account, _amount);

        emit SuccesfulERC20Withdrawal(_account, _amount);
        return true;
    }

    function depositbKES(address _account, uint _amount) external payable returns(bool){}

    function checkERC20Deposit() public {}

    function calculateHealthFactor() public returns(uint){}

}