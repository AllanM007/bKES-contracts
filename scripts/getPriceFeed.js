// const { ethers } = require("ethers")
// const provider = new ethers.providers.JsonRpcProvider("https://kovan.infura.io/v3/<infura_project_id>")
// const aggregatorV3InterfaceABI = [{ "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "description", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint80", "name": "_roundId", "type": "uint80" }], "name": "getRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "latestRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }]
// const addr = "0x9326BFA02ADD2366b30bacB125260Af641031331"
// const priceFeed = new ethers.Contract(addr, aggregatorV3InterfaceABI, provider)
// priceFeed.latestRoundData()
//     .then((roundData) => {
//         // Do something with roundData
//         console.log("Latest Round Data", roundData)
//     })

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

buyToken();