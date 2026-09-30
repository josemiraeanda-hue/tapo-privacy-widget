const express=require("express");
const fs=require("fs");
const path=require("path");
const app=express();
const VAULT_TOKEN=process.env.VAULT_TOKEN;
const AUTO_DEV_API_KEY=process.env.AUTO_DEV_API_KEY;
const KNOWLEDGE_PATH=path.join(__dirname,"knowledge.json");

function loadKnowledge(){
  return JSON.parse(fs.readFileSync(KNOWLEDGE_PATH,"utf8"));
}
function norm(value){
  return String(value||"").toLocaleLowerCase("pt-PT").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}
function scoreEntry(entry,q){
  const query=norm(q).split(/\s+/).filter(Boolean);
  const hay=norm([entry.title,entry.category,entry.status,entry.tags?.join(" "),entry.summary].join(" "));
  let score=0;
  for(const token of query){
    if(!token) continue;
    if(norm(entry.title).includes(token)) score+=8;
    if(norm(entry.tags?.join(" ")).includes(token)) score+=5;
    if(norm(entry.category).includes(token)) score+=3;
    if(norm(entry.summary).includes(token)) score+=2;
    if(hay.includes(token)) score+=1;
  }
  return score;
}

app.get("/health",(req,res)=>res.status(200).json({status:"ok"}));

app.use((req,res,next)=>{
  if(!VAULT_TOKEN || req.get("authorization")!==`Bearer ${VAULT_TOKEN}`) return res.status(404).end();
  next();
});

app.get("/",(req,res)=>res.status(200).json({
  service:"JM API Vault",
  status:"ok",
  capabilities:["auto.vin","knowledge.search","knowledge.item","knowledge.categories"]
}));

app.get("/knowledge/search",(req,res)=>{
  const q=String(req.query.q||"").trim();
  if(!q) return res.status(400).json({error:"Missing q"});
  const limit=Math.min(Math.max(Number(req.query.limit)||10,1),50);
  const kb=loadKnowledge();
  const results=kb.entries
    .map(entry=>({...entry,_score:scoreEntry(entry,q)}))
    .filter(entry=>entry._score>0)
    .sort((a,b)=>b._score-a._score || a.title.localeCompare(b.title))
    .slice(0,limit)
    .map(({_score,...entry})=>entry);
  res.json({query:q,count:results.length,results});
});

app.get("/knowledge/categories",(req,res)=>{
  const kb=loadKnowledge();
  const counts={};
  for(const e of kb.entries) counts[e.category]=(counts[e.category]||0)+1;
  res.json({version:kb.version,updated_at:kb.updated_at,categories:counts});
});

app.get("/knowledge/item/:id",(req,res)=>{
  const kb=loadKnowledge();
  const item=kb.entries.find(e=>e.id===req.params.id);
  if(!item) return res.status(404).json({error:"Knowledge item not found"});
  res.json(item);
});

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
