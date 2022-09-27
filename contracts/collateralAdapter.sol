/// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import {bKES} from "./bKESDispatcher.sol";
import {ERC20} from "./ERC20.sol";

contract CollateralAdapter is ERC20, bKES {
    // bKES bKESContract = new bKES();

    address tokenAddress;

    /// @notice mapping to track member's assets in the protocol
    mapping(address => uint256) public Vault;
    /// @notice mapping to track member's active debt in the protocol
    mapping(address => uint256) public ActiveDebtAmount;

    /// @notice struct to track a user's debt positions healthfactor
    struct HealthFactor {
        uint id;
        address usrAddress;
        uint256 debtValue;
        uint256 dcr; //debt collateralization ratio
    }

    HealthFactor healthFactor;

    /// @notice mapping to index healthfactor's positions
    mapping(uint => HealthFactor) public positionHealthFactor;
    /// @notice unsigned integer to track current debt positions count
    uint public positionsCount;

    /// @notice pass bKES token address variable to instantiate contract
    constructor(address bKESTokenAddress) {
        tokenAddress = bKESTokenAddress;
        positionsCount = 0;
    }

    /// @notice event to track erc20 token collateral valuation
    event SuccesfulERC20Valuation(address account, uint256 amount);
    /// @notice event to track erc20 token withdrawal
    event SuccesfulERC20Withdrawal(address account, uint256 amount);

    /// @notice event to track bKES token mint action
    event successfulbKESMint(address account, uint256 amount);
    /// @notice event to track bKES token burn action
    event successfulbKESBurn(address account, uint256 amount);

    /// @notice function to value collateral a user deposits to determine the bKES amount they can mint
    function collateralValuation(
        address _account,
        uint256 _amount,
        uint256 _collateralPrice
    ) public returns (uint256) {
        // calculate total colateral value in kes
        uint256 collateralValue = _collateralPrice * _amount;

        //get 2/3 value of collateral deposit to transfer to user wallet as bKES
        uint256 bKESVal = (collateralValue * 65) / 100;

        // convert bKES price to 18 decimal places ERC20 standard for minting
        uint256 collateralAmount = bKESVal / 10**6;

        //update user's bKES Vault balance
        Vault[_account] += collateralAmount;

        emit SuccesfulERC20Valuation(_account, collateralAmount);
        return collateralValue;
    }

    /// @notice function to withdraw a user's collateral
    function withdrawTokenCollateral(
        address _account,
        address collateralAddress,
        uint256 _amount
    ) public returns (bool) {
        // revert bKES back to collateral value
        uint256 collateralWithdrawal = (_amount * 100) / 65;

        // transfer collateral back to the user's wallet
        bKES(collateralAddress).transferFrom(
            address(this),
            _account,
            collateralWithdrawal
        );

        // burn bKES token to remove them from circulation
        bKES(tokenAddress).burnbKES(_account, _amount);

        emit SuccesfulERC20Withdrawal(_account, _amount);
        return true;
    }

    /// @notice function to calculate a user's debt position health
    function calculateHealthFactor(address _account, uint256 collateralPrice)
        public
        returns (uint256)
    {
        uint256 currentDebt = ActiveDebtAmount[_account];

        uint256 collateralAmount = (Vault[_account] * 100) / 65;

        uint256 collateralValue = collateralAmount * collateralPrice;

        uint256 debtRatio = (currentDebt / collateralValue) * 100;

        // if (positionsCount == 0) {
        //     return 0;
        // } else if (_account == healthFactor.usrAddress) {
        //     healthFactor.debtValue = currentDebt;
        //     healthFactor.dcr = debtRatio;
        // } else {

        positionHealthFactor[positionsCount] = HealthFactor( positionsCount, _account, currentDebt, debtRatio);

        positionsCount++;

        return debtRatio;
    }

    /// @notice function to get a position's health factor
    function getPositionHealthFactor(uint id)
        public
        view
        returns (
            HealthFactor memory
        )
    {
        return positionHealthFactor[id];
    }

    /// @notice function to initiate a mint bKES action
    function initiateMint(address _account, uint256 _amount)
        public
        returns (bool)
    {
        uint256 VaultAmount = Vault[_account];

        require(VaultAmount > _amount, "Cannot mint more than vault amount");

        bKES(tokenAddress).mintbKES(_account, _amount);

        emit successfulbKESMint(_account, _amount);

        uint256 newVaultBalance = VaultAmount - _amount;

        ActiveDebtAmount[_account] += _amount;

        Vault[_account] = newVaultBalance;

        return true;
    }

    /// @notice function to initiate a burn bKES action
    function initiateBurn(address _account, uint256 _amount)
        public
        returns (bool)
    {
        uint256 VaultAmount = Vault[_account];

        require(VaultAmount >= _amount, "Cannot burn more than vault amount");

        bKES(tokenAddress).burnbKES(_account, _amount);

        emit successfulbKESBurn(_account, _amount);

        uint256 newVaultBalance = VaultAmount - _amount;

        Vault[_account] = newVaultBalance;

        ActiveDebtAmount[_account] -= _amount;

        return true;
    }

    /// @notice function to liquidate a user's undercollateralized position
    function liquidatePosition(address _owner, address _liquidator)
        public
        returns (bool)
    {
        if (healthFactor.usrAddress == _owner) {
            uint256 debtStatus = healthFactor.dcr;

            require(85 >= debtStatus, "Position still valid"); //only allow positions with more than 85 to be liquidated

            uint256 vaultBalance = Vault[_owner];

            uint256 liquidationReward = (vaultBalance / 100) * 10;

            ERC20(tokenAddress).transfer(_liquidator, liquidationReward);

            ActiveDebtAmount[_owner] = 0;
            Vault[_owner] = 0;

            return true;
        } else {
            return false;
        }
    }
}
