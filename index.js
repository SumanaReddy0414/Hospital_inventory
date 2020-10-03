var express=require("express")
var app = express()
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//connect to server file for API
let server=require("./server");
let middleware=require("./middleware");
//Connect to DB
const url = "mongodb://localhost:27017/";
const dbName="ProjectDB";
let db

MongoClient.connect(url,{useUnifiedTopology:true,useNewUrlParser:true},(err,client)=>{
    if(err) 
        return console.log(err+"Connected not established");
    else
        db=client.db(dbName);
        console.log("connected!!");
});


app.get('/gethospital',function (req,res){
        db.collection("hospitals").find().toArray((err,result)=>res.json(result));
});


app.get("/",(req,res)=>{
    res.send("Hello World!");
});


app.get('/getventilator',function (req,res){
        db.collection("ventilators").find().toArray((err,result)=>res.json(result));
    });


app.post('/addhospital',middleware.checkToken,function (req,res){
        db.collection("hospitals").insertOne(req.body,(err,result)=>{
            if(err)  return console.log(err)
            console.log("Hospital added!")
            res.send("Hospital added!")
        });
    });


app.post('/addventilator',middleware.checkToken,function (req,res){
        db.collection("ventilators").insertOne(req.body,(err,result)=>{
            if(err)  return console.log(err)
            console.log("Ventilator added!")
            var hid=req.body.hid;
            db.collection("hospitals").updateOne({"hid":hid},{$inc:{noOfVentilators:1}}
        ,(err,res)=>{
                if(err)  return console.log(err)
                
            });
            res.send("Ventilator added!")
        });
});

app.post('/updateventilator',middleware.checkToken,function (req,res){
   
    var hid=req.body.hid;
    var vid=req.body.vid;
    db.collection("ventilators").updateOne({"hid":hid,"vid":vid},{$set:req.body},(err,result)=>{
            if(err)  return console.log(err)
            console.log("Ventilator updated!")
            res.send("Ventilator updated!")
        });
});
app.post('/deleteventilator',function(req,res){
    var hid=req.body.hid;
    var vid=req.body.vid;
    db.collection("ventilators").deleteOne({"vid" : vid},(err,result)=>{
        if(err)  return console.log(err)
        console.log("Ventilator deleted!")
       
        db.collection("hospitals").updateOne({"hid":hid},{$inc:{noOfVentilators:-1}},(err,res)=>{
                if(err)  return console.log(err)    
            });     
    });
    res.send("ventilator deleted")
});
//Search Ventilator by VentilatorStatus & Hospitalname
app.post('/searchVStatusHname',middleware.checkToken,function(req,res){
    var status=req.body.status;
    var hname=req.body.hname;
    db.collection("ventilators").find({"hname":hname,"status":status}).toArray((err,result)=>res.json(result));
});
//Search Ventilator by Hospitalname
app.post('/searchHname',middleware.checkToken,function(req,res){
    var hname=req.body.hname;
        db.collection("ventilators").find({"hname":hname}).toArray((err,result)=>res.json(result));
});

app.listen(3000,(err,res)=>{
    console.log("Server listening @ Port 3000");
    
});
