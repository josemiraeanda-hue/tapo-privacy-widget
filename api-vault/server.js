const express=require("express");
const app=express();
const VAULT_TOKEN=process.env.VAULT_TOKEN;
const AUTO_DEV_API_KEY=process.env.AUTO_DEV_API_KEY;

app.get("/health",(req,res)=>res.status(200).json({status:"ok"}));

app.use((req,res,next)=>{
  if(!VAULT_TOKEN || req.get("authorization")!==`Bearer ${VAULT_TOKEN}`) return res.status(404).end();
  next();
});

app.get("/",(req,res)=>res.status(200).json({service:"JM API Vault",status:"ok"}));

app.get("/auto/vin/:vin",async(req,res)=>{
  if(!AUTO_DEV_API_KEY) return res.status(503).json({error:"AUTO_DEV_API_KEY not configured"});
  const vin=req.params.vin;
  if(!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return res.status(400).json({error:"Invalid VIN"});
  try{
    const r=await fetch(`https://api.auto.dev/vin/${encodeURIComponent(vin)}`,{
      headers:{Authorization:`Bearer ${AUTO_DEV_API_KEY}`,Accept:"application/json"}
    });
    const body=await r.text();
    res.status(r.status).type("application/json").send(body);
  }catch(e){
    res.status(502).json({error:"Auto.dev request failed"});
  }
});

const port=process.env.PORT||10000;
app.listen(port,"0.0.0.0",()=>console.log("JM API Vault running"));
// deploy sync
