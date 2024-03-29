require("dotenv").config();
const express = require("express");
const app = express();
const url = require('url');
const path = require("path");
const axios = require("axios");
const bodyParser = require("body-parser");

const router = express.Router();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const API_KEY = process.env.ALCHEMY_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const POLYGONSCAN_KEY = process.env.POLYGONSCAN_KEY;
const collateralAdapter = process.env.collateralAdapter_ADDRESS;
const oracleAddress = process.env.oracleContract_ADDRESS;
const openseaOracleAddress = process.env.openseaOracle_ADDRESS;
const bKESTokenAddress = process.env.bKES_ADDRESS;

// const { json } = require("hardhat/internal/core/par
const { ethers } = require("ethers");
const tokenABI = require("../artifacts/contracts/ERC20.sol/ERC20.json");
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

// Token Contract
const bKESTokenContract = new ethers.Contract(
  bKESTokenAddress,
  tokenABI.abi,
  signer
);

router.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
  //__dirname : It will resolve to your project folder.
});

router.get("/transfer", function (req, res) {
  res.sendFile(path.join(__dirname + "/transferNFT.html"));
  //__dirname : It will resolve to your project folder.
});

router.post("/valueCollateral", function (req, res) {
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

async function collateralValuation(address, amount) {
  const gasPrice = await alchemyProvider.getGasPrice();

  const formattedGasPrice = gasPrice.toString();

  console.log(formattedGasPrice);

  const collateralPrice = await oracleContract.price();

  const fmtCollateralPrice = collateralPrice.toString();

  console.log(fmtCollateralPrice);

  try {
    const collateralAdaptertx = await collateralAdapterContract
      .connect(signer)
      .collateralValuation(address, amount, fmtCollateralPrice, {
        gasLimit: 50000,
      });

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

router.get("/valueNFTCollateral", function (req, res) {
  var data = req.body;

  var usrAddress = data.address;
  // var transactionID = data.txID;
   let transactionID = "0x3493a31c09aef35411f89507a2ae84e6739a57a826c661552d328b296f8c0a78"

  // console.log("70.", usrAddress, transactionID);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(nftCollateralValuation(usrAddress, transactionID));
    }, 2000);
  });
});

async function nftCollateralValuation(address, transactionID) {

  let payload = { 
    module:'transaction',
    action: 'gettxreceiptstatus',
    txhash: transactionID,
    apikey: POLYGONSCAN_KEY
  
  };

  const params = new url.URLSearchParams(payload);

  let res = await axios.get(`https://api-testnet.polygonscan.com/api?${params}`);

  let data = res.data;
  console.log(data['result']['status']);

  // return data;
  if (data['result']['status'] == 1) {

    let Payload = { 
      include_orders : 'false'
    
    };
  
    const parameters = new url.URLSearchParams(Payload);
  
    let response = await axios.get(`https://api.opensea.io/api/v1/asset/0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb/1/?${params}`);
  
    let data = response.data;
    console.log(data);
    
  } else {
    
  }

  // const gasPrice = await alchemyProvider.getGasPrice();

  // const formattedGasPrice = gasPrice.toString();

  // console.log(formattedGasPrice);

  // const collateralPrice = await oracleContract.price();

  // const fmtCollateralPrice = collateralPrice.toString();

  // console.log(fmtCollateralPrice);

  // try {
  //   const collateralAdaptertx = await collateralAdapterContract
  //     .connect(signer)
  //     .collateralValuation(address, amount, fmtCollateralPrice, {
  //       gasLimit: 50000,
  //     });

  //   console.log(collateralAdaptertx);

  //   const collateralAdapterObject = await collateralAdaptertx.wait();

  //   console.log(collateralAdapterObject);

  //   const valuationObject = collateralAdapterObject.events.find(
  //     (event) => event.event === "SuccesfulERC20Valuation"
  //   );

  //   const [to, value] = valuationObject.args;

  //   console.log(to, value.toString());
  // } catch (error) {
  //   console.log(error);
  // }
}

router.get("/transfer", function (req, res) {
  res.sendFile(path.join(__dirname + "/transfer.html"));
});

router.get("/mint", function (req, res) {
  res.sendFile(path.join(__dirname + "/mint.html"));
});

router.get("/getVaultBalance", async function (req, res) {
  const vault = await collateralAdapterContract.Vault(
    "0x15cdCBB08cd5b2543A8E009Dbf5a6C6d7D2aB53d"
  );

  const fmtVaultBalance = vault.toString() / 10 ** 6;
  var context = {
    vaultAmount: fmtVaultBalance,
  };
  console.log("Vault Balance:", fmtVaultBalance);

  res.json(context);
});

router.get("/getAccountbKESBalance", async function (req, res) {
  const bkesBalance = await bKESTokenContract.balanceOf(
    "0x15cdCBB08cd5b2543A8E009Dbf5a6C6d7D2aB53d"
  );

  const fmtBKESBalance = bkesBalance.toString();

  var context = {
    bKESAmount: fmtBKESBalance,
  };
  console.log("Vault Balance:", fmtBKESBalance);

  res.json(context);
});

router.get("/getActiveDebtBalance", async function (req, res) {
  const activeDebt = await collateralAdapterContract.ActiveDebtAmount(
    "0x15cdCBB08cd5b2543A8E009Dbf5a6C6d7D2aB53d"
  );
  var context = {
    activeDebtAmount: activeDebt.toString(),
  };
  console.log("Active Debt:", activeDebt.toString());

  res.json(context);
});

router.post("/mintbKES", function (req, res) {
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

async function calculatePositionHealthFactor(usrAddress) {

  const collateralPrice = await oracleContract.price();

  try {
    const calculateHealthFactortx = await collateralAdapterContract
      .connect(signer)
      .calculateHealthFactor(usrAddress, collateralPrice, { gasLimit: 1000000 });

    console.log(calculateHealthFactortx);

    const calculateHealthFactortxObject = await calculateHealthFactortx.wait();

    console.log(calculateHealthFactortxObject);

    return "Calculation Succesful";
  } catch (error) {
    console.log(error);

    return error;
  }
}

async function mintbKES(usrAddress, mintAmount) {
  const gasPrice = await alchemyProvider.getGasPrice();

  const formattedGasPrice = gasPrice.toString();

  console.log(formattedGasPrice);

  try {
    const mintbKEStx = await collateralAdapterContract
      .connect(signer)
      .initiateMint(usrAddress, mintAmount, { gasLimit: 1000000 });

    console.log(mintbKEStx);

    const mintbKESObject = await mintbKEStx.wait();

    console.log(mintbKESObject);

    const mintObject = mintbKESObject.events.find(
      (event) => event.event === "successfulbKESMint"
    );

    const [to, value] = mintObject.args;

    console.log(to, value.toString());

    // calculatePositionHealthFactor(usrAddress);

    // return "Mint Succesful";
    res.jsonp({success : true})
  } catch (error) {
    console.log(error);

    return error;
  }
}

router.get("/burn", function (req, res) {
  res.sendFile(path.join(__dirname + "/burn.html"));
});

router.post("/burnbKES", function (req, res) {
  var data = req.body;
  console.log(data);

  var usrAddress = data.address;
  var amount = data.amount;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(burnbKES(usrAddress, amount));
    }, 2000);
  });
});

async function burnbKES(usrAddress, burnAmount) {
  const gasPrice = await alchemyProvider.getGasPrice();

  const formattedGasPrice = gasPrice.toString();

  console.log(formattedGasPrice);

  try {
    // const bKESTransferApproval = await bKESTokenContract.approve(
    //   usrAddress,
    //   burnAmount
    // );

    // const approvalConfirmation = bKESTransferApproval.wait();

    if (1 == 1) {
      const bKESTransfer = await bKESTokenContract.transferFrom(
        usrAddress,
        bKESTokenAddress,
        burnAmount
      );

      const bKESTransferTx = await bKESTransfer.wait();

      console.log(bKESTransferTx);

      if (bKESTransferTx.status == 1) {
        const burnbKEStx = await collateralAdapterContract
          .connect(signer)
          .initiateBurn(usrAddress, burnAmount, { gasLimit: 1000000 });

        console.log(burnbKEStx);

        const burnbKESObject = await burnbKEStx.wait();

        console.log(burnbKESObject);

        const burnObject = burnbKESObject.events.find(
          (event) => event.event === "successfulbKESBurn"
        );

        const [to, value] = burnObject.args;

        console.log(to, value.toString());

        return "Burn Succesful";
      } else {
        console.log("unsuccesful bKES transfer");
      }
    } else {
    }
  } catch (error) {
    console.log(error);

    return error;
  }
}

router.get("/debtPositions", function (req, res) {
  res.sendFile(path.join(__dirname + "/debtPositions.html"));
});

router.get("/getActiveDebtPositions", async function (req, res) {
  positions = []

  const positionsCount = await collateralAdapterContract.positionsCount();

  for (let item = 0; item < positionsCount; item++) {
    const activepositions = await collateralAdapterContract.getPositionHealthFactor(item, { gasLimit: 1000000 });

    var positionsToString = activepositions.toString();

    var fmtPositions = positionsToString.split(',');

    const positionsMap = [];
    const keyArray = ["id", "usrAddress", "debt", "dcr"];

    fmtPositions.map(function (value, index) {
      positionsMap.push(value)
    })

    const positionsArray = Object.assign.apply({}, keyArray.map( (v, i) => ( {[v]: fmtPositions[i]} ) ) );

    positions.push(positionsArray);

  }

  var context = {
    data: positions,
  };

  res.json(context);
});

router.post("/liquidatePosition", function (req, res) {
  var data = req.body;
  console.log(data);

  var usrAddress = data.usrAddress;
  var liquidatorAddress = "0x391E3567e8Da8018f592e1855A4459629c0E1d8A";;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(liquidatePosition(usrAddress, liquidatorAddress));
    }, 2000);
  });
});

async function liquidatePosition(usrAddress, liquidatorAddress) {
  const gasPrice = await alchemyProvider.getGasPrice();

  const formattedGasPrice = gasPrice.toString();

  console.log(formattedGasPrice);

  try {
    const liquidatePositiontx = await collateralAdapterContract
      .connect(signer)
      .liquidatePosition(usrAddress, liquidatorAddress, { gasLimit: 1000000 });

    console.log(liquidatePositiontx);

    const liquidatePositionObject = await liquidatePositiontx.wait();

    console.log(liquidatePositionObject);

    return "Liquidation Succesful";
  } catch (error) {
    console.log(error);
    return error;
  }
}

//add the router
app.use("/", router);
app.listen(process.env.port || 3000);
app.use(express.static(path.join(__dirname, "public")));
app.use("/js", express.static(__dirname + "/js"));

console.log("Running at Port 3000");
