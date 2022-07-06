require("dotenv").config();
const API_KEY = process.env.ALCHEMY_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const collateralAdapter = process.env.collateralAdapter_ADDRESS;
const oracleAddress = process.env.oracleContract_ADDRESS;

const { json } = require("hardhat/internal/core/params/argumentTypes");
const { ethers } = require("ethers");
const oracleContractABI = require("../artifacts/contracts/oraclePriceFeed.sol/APIConsumer.json");
const mintContract = require("../artifacts/contracts/bKESDispatcher.sol/bKES.json");
const collateralAdapterABI = require("../artifacts/contracts/collateralAdapter.sol/CollateralAdapter.json");

// Provider
const alchemyProvider = new ethers.providers.AlchemyProvider(
  (network = "maticmum"),
  API_KEY
);

// Signer
const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);

// gas limit
const gas_limit = "0x100000";

// Oracle Contract
const oracleContract = new ethers.Contract(oracleAddress, oracleContractABI.abi, signer);

// Minting Contract
const mintbKESContract = new ethers.Contract(
  collateralAdapter,
  collateralAdapterABI.abi,
  signer
);

// The minimum ABI required to get the ERC20 Token balance
const minABI = [
  // Some details about the token
  "function name() view returns (string)",
  "function symbol() view returns (string)",

  // Get the account balance
  "function balanceOf(address) view returns (uint)",

  // Send some of your tokens to someone else
  "function transfer(address to, uint amount)",

  // An event triggered whenever anyone transfers to someone else
  "event Transfer(address indexed from, address indexed to, uint amount)",
];
const MaticAddress = "0x0000000000000000000000000000000000001010";
const walletAddress = "0x15cdCBB08cd5b2543A8E009Dbf5a6C6d7D2aB53d";

async function mintbKES(collateralValue) {

  const wallet = new ethers.Wallet(PRIVATE_KEY);

  const walletSigner = wallet.connect(alchemyProvider);

  const gasPrice = await alchemyProvider.getGasPrice();

  const formattedGasPrice = new ethers.BigNumber.from(gasPrice);

  console.log(formattedGasPrice);

  try {
    // const sendCollateraltx = {
    //   from: walletAddress,
    //   to: "0x391E3567e8Da8018f592e1855A4459629c0E1d8A",
    //   value: collateralValue, //ethers.utils.parseEther(send_token_amount),
    //   nonce: alchemyProvider.getTransactionCount(walletAddress, "latest"),
    //   gasLimit: ethers.utils.hexlify(gas_limit), // 100000
    //   gasPrice: ethers.utils.hexlify(gasPrice),
    // };

    // const tokenTransfer = await walletSigner.sendTransaction(sendCollateraltx);

    // const transferObject = await tokenTransfer.wait();

    // console.log(transferObject);

    // if (transferObject.status == 1) {
    //   const getCollateralPrice = await oracleContract.requestMATICKESPrice();

    //   const collateralPriceTx = await getCollateralPrice.wait();

    //   console.log(collateralPriceTx);

    //   if (collateralPriceTx.status == 1) {

    //     const collateralPrice = 0;

    //     setTimeout((collateralPrice = await oracleContract.price()), 30000);

        const collateralPrice = await oracleContract.price();

        const fmtCollateral = (collateralPrice.toString() / 10**10);

        console.log(fmtCollateral);

        if (fmtCollateral != 0) {
          const mintbKESTx = await mintbKESContract.erc20Deposit(
            walletAddress,
            collateralValue,
            { gasLimit: 250000 }
          );

          const mintbKESObject = await mintbKESTx.wait();

          console.log(mintbKESObject);
        } else {
          console.log("invalid collateral value");
        }
    //   } else {
    //     console.log("invalid MATICKES price");
    //   }
    // } else {
    //   console.log("transaction failed");
    // }
  } catch (error) {
    console.log(error);
  }
}

mintbKES(1);
