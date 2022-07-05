require("dotenv").config();
const API_KEY = process.env.ALCHEMY_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const METAMASK_ADDRESS = process.env.ETH_DEV_ACCOUNT_ADDRESS;

const { json } = require("hardhat/internal/core/params/argumentTypes");
const { ethers } = require("ethers");
const contract = require("../artifacts/contracts/oraclePriceFeed.sol/APIConsumer.json");
const mintContract = require("../artifacts/contracts/bKESDispatcher.sol/bKES.json");

// Provider
const alchemyProvider = new ethers.providers.AlchemyProvider(
  (network = "maticmum"),
  API_KEY
);

// Signer
const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);

// gas limit
const gas_limit = "0x100000";

// Contract
const mintbKESContract = new ethers.Contract(
  "0x54B649fF50ed97311125e3BE21E3BA47463ec9c6",
  mintContract.abi,
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

async function mintbKES() {
  const wallet = new ethers.Wallet(PRIVATE_KEY);

  const walletSigner = wallet.connect(alchemyProvider);

  const gasPrice = await alchemyProvider.getGasPrice();
  
  console.log(gasPrice);

  try {
    const sendCollateraltx = {
      from: walletAddress,
      to: "0x391E3567e8Da8018f592e1855A4459629c0E1d8A",
      value: 1, //ethers.utils.parseEther(send_token_amount),
      nonce: alchemyProvider.getTransactionCount(walletAddress, "latest"),
      gasLimit: ethers.utils.hexlify(gas_limit), // 100000
      gasPrice: ethers.utils.hexlify(gasPrice),
    };

    const tokenTransfer = await walletSigner.sendTransaction(sendCollateraltx);

    const transferObject = await tokenTransfer.wait();

    if (transferObject.status == 1) {
        const mintbKESTx =  await mintbKESContract.mintbKES(walletAddress, 1, { gasLimit: 250000 });

        const mintbKESObject = await mintbKESTx.wait();

        console.log(mintbKESObject);
    } else {
        console.log();
    }
  } catch (error) {
    console.log(error);
  }
}

mintbKES();
