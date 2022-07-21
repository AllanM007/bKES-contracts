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
const oracleContract = new ethers.Contract(
  oracleAddress,
  oracleContractABI.abi,
  signer
);

// Collateral Contract
const collateralAdapterContract = new ethers.Contract(
  collateralAdapter,
  collateralAdapterABI.abi,
  signer
);

const MaticAddress = "0x0000000000000000000000000000000000001010";
const walletAddress = "0x15cdCBB08cd5b2543A8E009Dbf5a6C6d7D2aB53d";

// async function collateralValuation(collateralValue) {
//   const gasPrice = await alchemyProvider.getGasPrice();

//   const formattedGasPrice = gasPrice.toString();

//   console.log(formattedGasPrice);

//   try {
//     const sendCollateraltx = {
//       from: walletAddress,
//       to: "0x391E3567e8Da8018f592e1855A4459629c0E1d8A",
//       value: collateralValue, //ethers.utils.parseEther(send_token_amount),
//       nonce: alchemyProvider.getTransactionCount(walletAddress, "latest"),
//       gasLimit: ethers.utils.hexlify(gas_limit), // 100000
//       gasPrice: ethers.utils.hexlify(gasPrice),
//     };

//     const tokenTransfer = await signer.sendTransaction(sendCollateraltx);

//     const transferObject = await tokenTransfer.wait();

//     console.log(transferObject);

//     if (transferObject.status == 1) {
//       const getCollateralPrice = await oracleContract.requestMATICKESPrice();

//       const collateralPriceTx = await getCollateralPrice.wait();

//       console.log(collateralPriceTx);

//       if (collateralPriceTx.status == 1) {
//         const collateralPrice = 0;

//         setTimeout((collateralPrice = await oracleContract.price()), 30000);

//         if (collateralPrice > 0) {
//           const mintbKEStx = await mintbKESContract.erc20Deposit(
//             walletAddress,
//             collateralValue,
//             { gasLimit: 50000 }
//           );

//           console.log(mintbKEStx);

//           const mintbKESObject = await mintbKEStx.wait();

//           console.log(mintbKESObject);

//           const depositObject = mintbKESObject.events.find(
//             (event) => event.event === "SuccesfulERC20Deposit"
//           );

//           const [to, value] = depositObject.args;

//           console.log(to, value.toString());
//         } else {
//           console.log("invalid collateral value");
//         }
//       } else {
//         console.log("invalid MATICKES price");
//       }
//     } else {
//       console.log("transaction failed");
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

async function testCollateralValuation(collateralValue) {
  const gasPrice = await alchemyProvider.getGasPrice();

  const formattedGasPrice = gasPrice.toString();

  console.log(formattedGasPrice);

  const collateralPrice = await oracleContract.price()

  const fmtCollateralPrice = collateralPrice.toString();

  console.log(fmtCollateralPrice);

  try {

    const collateralAdaptertx = await collateralAdapterContract.connect(signer).collateralValuation(
      walletAddress,
      collateralValue,
      fmtCollateralPrice,
      { gasLimit: 50000 }
    );

    console.log(collateralAdaptertx);

    const collateralAdapterObject = await collateralAdaptertx.wait();

    console.log(collateralAdapterObject);

    const valuationObject = collateralAdapterObject.events.find(
      (event) => event.event === "SuccesfulERC20Valuation"
    );

    const [to, value] = valuationObject.args;

    console.log(to, value.toString());
  } catch (error) {
    console.log(error);
  }
}

async function testMintbKES(mintAmount) {
  const gasPrice = await alchemyProvider.getGasPrice();

  const formattedGasPrice = gasPrice.toString();

  console.log(formattedGasPrice);

  try {

    // const vaultAmount = await collateralAdapterContract.connect(signer).ActiveDebtAmount(walletAddress);

    // console.log(vaultAmount.toString());

    const mintbKEStx = await collateralAdapterContract.connect(signer).initiateMint(
      walletAddress,
      mintAmount,
      { gasLimit: 100000 }
    );

    console.log(mintbKEStx);

    const mintbKESObject = await mintbKEStx.wait();

    console.log(mintbKESObject);

    const mintObject = mintbKESObject.events.find(
      (event) => event.event === "successfulbKESMint"
    );

    const [to, value] = mintObject.args;

    console.log(to, value.toString());
  } catch (error) {
    console.log(error);
  }
}

// testMintbKES(100);

testCollateralValuation(100);