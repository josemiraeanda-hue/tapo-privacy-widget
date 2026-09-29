const express=require("express");
const app=express();
const VAULT_TOKEN=process.env.VAULT_TOKEN;
app.get("/health",(req,res)=>res.status(200).json({status:"ok"}));
app.use((req,res,next)=>{
  if(!VAULT_TOKEN || req.get("authorization")!==`Bearer ${VAULT_TOKEN}`) return res.status(404).end();
  next();
});
app.get("/",(req,res)=>res.status(200).json({service:"JM API Vault",status:"ok"}));
const port=process.env.PORT||10000;
app.listen(port,"0.0.0.0",()=>console.log("JM API Vault running"));