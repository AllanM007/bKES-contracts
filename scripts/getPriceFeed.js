require("dotenv").config();
const API_KEY = process.env.ALCHEMY_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const METAMASK_ADDRESS = process.env.ETH_DEV_ACCOUNT_ADDRESS

const { json } = require("hardhat/internal/core/params/argumentTypes");
const { ethers} = require("ethers");
const contract = require("../artifacts/contracts/oraclePriceFeed.sol/APIConsumer.json");

// Provider
const alchemyProvider = new ethers.providers.AlchemyProvider(network="mumbai", API_KEY);

// Signer
const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);

console.log(signer.getGasPrice());

// Contract
const oracleFeedContract = new ethers.Contract("0x1b0bE1E7E37624F94b3FB70D49119d265555E8fC", contract.abi, signer);
// const gammaTokenContract = new ethers.Contract(process.env.GammaToken_ADDRESS, GammaTokenContractABI.abi, signer );

async function getPriceData() {

    try {
        
        const getPriceTransaction = await oracleFeedContract.requestPriceData({ gasLimit: 250000 });
        const getPriceTxLog = await getPriceTransaction.wait();

        const priceTxObject = getPriceTxLog.events.find(event => event.event === 'Bought');

        const [to, value] = priceTxObject.args;
            
        console.log(to, value.toString());
              

    } catch (error) {
        console.log(error);
    }
}

getPriceData();