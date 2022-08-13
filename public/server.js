require("dotenv").config();
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const router = express.Router();

app.use(bodyParser.urlencoded({
  extended: true
}));

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

router.post('/valueCollateral', function(req,res){

  var data = req.body;
  console.log(data);

  var usrAddress = data.address;
  var amount = data.amount;

  console.log("71.", usrAddress, amount);

  return new Promise((resolve) => {
      setTimeout(() => {
          resolve(collateralValuation(usrAddress, amount));
      }, 2000);
  });
});

async function collateralValuation(address, amount){
  
  const gasPrice = await alchemyProvider.getGasPrice();

  const formattedGasPrice = gasPrice.toString();

  console.log(formattedGasPrice);

  const collateralPrice = await oracleContract.price()

  const fmtCollateralPrice = collateralPrice.toString();

  console.log(fmtCollateralPrice);

  try {

    const collateralAdaptertx = await collateralAdapterContract.connect(signer).collateralValuation(
      address,
      amount,
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
};

router.get('/transfer', function(req,res){
  res.sendFile(path.join(__dirname+'/transfer.html'));
});

router.get('/mint', function(req,res){
  res.sendFile(path.join(__dirname+'/mint.html'));
});

router.get('/getVaultBalance', async function(req,res){

  const vault = await collateralAdapterContract.Vault("0x15cdCBB08cd5b2543A8E009Dbf5a6C6d7D2aB53d");

  const fmtVaultBalance = vault.toString() / 10**6;
  var context = {
    vaultAmount: fmtVaultBalance
  };
  console.log("Vault Balance:", fmtVaultBalance);

  res.json(context);
});

router.get('/getActiveDebtBalance', async function(req,res){

  const activeDebt = await collateralAdapterContract.ActiveDebtAmount("0x15cdCBB08cd5b2543A8E009Dbf5a6C6d7D2aB53d");
  var context = {
    activeDebtAmount: activeDebt.toString()
  };
  console.log("Active Debt:", activeDebt.toString());

  res.json(context);
});

router.post('/mintbKES', function(req,res){

  var data = req.body;
  console.log(data);

  var usrAddress = data.address;
  var amount = data.amount;
  
  return new Promise((resolve) => {
    setTimeout(() => {
        resolve(mintbKES(usrAddress, amount));
    }, 2000);
  });
});

async function mintbKES(usrAddress, mintAmount) {
  const gasPrice = await alchemyProvider.getGasPrice();

  const formattedGasPrice = gasPrice.toString();

  console.log(formattedGasPrice);

  try {

    const mintbKEStx = await collateralAdapterContract.connect(signer).initiateMint(
      usrAddress,
      mintAmount,
      { gasLimit: 1000000 }
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