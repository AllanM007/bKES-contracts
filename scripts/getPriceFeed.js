require("dotenv").config();
const API_KEY = process.env.ALCHEMY_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const METAMASK_ADDRESS = process.env.ETH_DEV_ACCOUNT_ADDRESS

const { json } = require("hardhat/internal/core/params/argumentTypes");
const { ethers} = require("ethers");
const contract = require("../artifacts/contracts/oraclePriceFeed.sol/APIConsumer.json");

// Provider
const alchemyProvider = new ethers.providers.AlchemyProvider(network="maticmum", API_KEY);

// Signer
const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);

console.log(signer.getGasPrice());

// Contract
const mintbKESContract = new ethers.Contract("0x1b0bE1E7E37624F94b3FB70D49119d265555E8fC", contract.abi, signer);

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
    "event Transfer(address indexed from, address indexed to, uint amount)"
  ];
const tokenAddress = "0x0000000000000000000000000000000000001010";
const walletAddress = "0x15cdCBB08cd5b2543A8E009Dbf5a6C6d7D2aB53d";

async function mintbKES() {

    const contract = new ethers.Contract(tokenAddress, minABI, signer);

    const getTokenBalance = await contract.transfer('0x391E3567e8Da8018f592e1855A4459629c0E1d8A', 1);

    const formattedBalance =  await getTokenBalance.wait();

    console.log(formattedBalance);

    // try {

    //     // Send 1 matic to an address.
    //     const sendMaticCollateral = signer.sendTransaction({
    //         to: "ricmoo.firefly.eth",
    //         value: 10,
    //     });

    //     const sendMatic = await sendMaticCollateral.wait();

    //     if (sendMatic.status == 1) {
    //         const mintbKESTransaction = await mintbKESContract.mintbKES({ gasLimit: 250000 });
    //         const mintbKESTransactionLog = await mintbKESTransaction.wait(); 
    //     } else {
            
    //     }

    //     // const mintbKESTxObject = mintbKESTransactionLog.events.find(event => event.event === 'Bought');

    //     // const [to, value] = mintbKESTxObject.args;
            
    //     // console.log(to, value.toString());
              

    // } catch (error) {
    //     console.log(error);
    // }
}

mintbKES();