require("dotenv").config();
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

const API_KEY = process.env.ALCHEMY_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const collateralAdapter = process.env.collateralAdapter_ADDRESS;
const oracleAddress = process.env.oracleContract_ADDRESS;
const openseaOracleAddress = process.env.openseaOracle_ADDRESS;

// const { json } = require("hardhat/internal/core/par
const { ethers } = require("ethers");
const openseaOracleContractABI = require("../artifacts/contracts/oracleOpenSea.sol/OpenSeaAPIConsumer.json");
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

// OpenseaOracle Contract
const OpenseaOracleContract = new ethers.Contract(
  openseaOracleAddress,
  openseaOracleContractABI.abi,
  signer
);

// Collateral Contract
const collateralAdapterContract = new ethers.Contract(
  collateralAdapter,
  collateralAdapterABI.abi,
  signer
);

router.get('/', function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});

router.get('/transfer', function(req,res){
  res.sendFile(path.join(__dirname+'/transfer.html'));
});

router.get('/mint', function(req,res){
  res.sendFile(path.join(__dirname+'/mint.html'));
});

router.get('/burn', function(req,res){
  res.sendFile(path.join(__dirname+'/burn.html'));
});

router.get('/debtPosition', function(req,res){
  res.sendFile(path.join(__dirname+'/debtPositions.html'));
});

//add the router
app.use('/', router);
app.listen(process.env.port || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(__dirname + '/js'));

console.log('Running at Port 3000');