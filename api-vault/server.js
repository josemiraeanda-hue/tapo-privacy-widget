const express=require("express");
const app=express();
app.get("/",(req,res)=>res.status(200).json({service:"JM API Vault",status:"ok"}));
app.get("/health",(req,res)=>res.status(200).json({status:"ok"}));
const port=process.env.PORT||10000;
app.listen(port,"0.0.0.0",()=>console.log("JM API Vault running"));