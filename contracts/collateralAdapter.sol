// SPDX-Licence-Identifier:MIT
pragma solidity ^0.8.0;

import { bKES } from "./bKESDispatcher.sol";
import { ERC20 } from "./ERC20.sol";
import { APIConsumer } from "./oraclePriceFeed.sol";

contract CollateralAdapter{
    
    APIConsumer public priceFeed;
    ERC20 public token;
    bKES public bKESDispatcher;

    mapping(address => uint256) VaultDebtPositions;
    // mapping(address => uint256) VaultDeposit

    constructor(){
        token = bKES(address(0x0000000000000000000000000000000000001010));
    }

    event SuccesfulERC20Deposit(address account, uint256 amount);
    event SuccesfulERC20Withdrawal(address account, uint256 amount);

    function erc20Deposit(address _account, uint256 _amount) public returns(bool){

        // get MATIC-KES Exchange rate
        uint256 currentMATICKSHPrice = priceFeed.price();

        // calculate total colateral value in kes
        uint256 collateralValue = currentMATICKSHPrice * _amount;

        //get 2/3 value of collateral deposit to transfer to user wallet as bKES
        uint bKESDeposit = (collateralValue * 65) / 100;

        bKESDispatcher.mintbKES(_account, bKESDeposit);

        emit SuccesfulERC20Deposit(_account, _amount);
        return true;
    }

    function erc20Withdrawal(address _account, uint256 _amount) public returns(bool){

        // revert bKES back to collateral value
        uint256 collateralWithdrawal = (_amount * 100) / 65;
        
        // transfer collateral back to the user's wallet
        token.transferFrom(address(this), msg.sender, collateralWithdrawal);

        // burn bKES token to remove them from circulation
        bKESDispatcher.burnbKES(_account, _amount);

        emit SuccesfulERC20Withdrawal(_account, _amount);
        return true;
    }

    function checkERC20Deposit() public {}

}