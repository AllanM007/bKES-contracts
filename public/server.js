const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

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