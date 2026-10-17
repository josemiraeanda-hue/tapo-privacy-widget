const express=require("express");
const fs=require("fs");
const path=require("path");
const {searchProducts,getCoupons}=require("./shopping-providers");
const {lookupPortugueseRegistration}=require("./vehicle-providers");
const {compareOffers}=require("./landed-cost");
const {searchTelepecas}=require("./telepecas-provider");
const app=express();
const VAULT_TOKEN=process.env.VAULT_TOKEN;
const AUTO_DEV_API_KEY=process.env.AUTO_DEV_API_KEY;
app.use(express.json({limit:"64kb"}));
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
  if(!VAULT_TOKEN || req.get("authorization")!=="Bearer "+VAULT_TOKEN) return res.status(404).end();
  next();
});

app.get("/",(req,res)=>res.status(200).json({
  service:"JM API Vault",
  status:"ok",
  capabilities:["auto.vin","knowledge.search","knowledge.item","knowledge.categories","shopping.status","shopping.products","shopping.coupons"]
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

app.get("/auto/registration/:plate",async(req,res)=>{
  try{
    const result=await lookupPortugueseRegistration({plate:req.params.plate});
    res.json(result);
  }catch(e){
    const status=Number.isInteger(e.statusCode)?e.statusCode:502;
    res.status(status).json({error:e.message||"Portuguese registration lookup failed"});
  }
});

app.get("/auto/vin/:vin",async(req,res)=>{
  if(!AUTO_DEV_API_KEY) return res.status(503).json({error:"AUTO_DEV_API_KEY not configured"});
  const vin=req.params.vin;
  if(!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return res.status(400).json({error:"Invalid VIN"});
  try{
    const r=await fetch("https://api.auto.dev/vin/"+encodeURIComponent(vin),{
      headers:{Authorization:"Bearer "+AUTO_DEV_API_KEY,Accept:"application/json"}
    });
    const body=await r.text();
    res.status(r.status).type("application/json").send(body);
  }catch(e){
    res.status(502).json({error:"Auto.dev request failed"});
  }
});

app.post("/shopping/landed-cost",(req,res)=>{
  const offers=req.body?.offers;
  if(!Array.isArray(offers)||offers.length===0) return res.status(400).json({error:"offers must be a non-empty array"});
  if(offers.length>100) return res.status(400).json({error:"A maximum of 100 offers is allowed"});
  res.json({count:offers.length,results:compareOffers(offers),note:"Only offers with verified shipping, tax/customs treatment and coupon state receive a verified delivered total."});
});

app.get("/shopping/telepecas",async(req,res)=>{
  try{
    const result=await searchTelepecas({q:req.query.q,maxPrice:req.query.maxPrice});
    res.json(result);
  }catch(e){
    const status=Number.isInteger(e.statusCode)?e.statusCode:502;
    res.status(status).json({error:e.message||"TelePeças search failed"});
  }
});

app.get("/shopping/status",(req,res)=>res.json({
  providers:{
    serpapi:{configured:Boolean(process.env.SERPAPI_API_KEY)},
    awin:{configured:Boolean(process.env.AWIN_PUBLISHER_ID&&process.env.AWIN_API_TOKEN)},
    telepecas:{configured:Boolean(process.env.TELEPECAS_API_TOKEN)}
  },
  mode:"staging-ready-check",
  production_safe:true
}));

app.get("/shopping/products",async(req,res)=>{
  try{
    const result=await searchProducts({
      q:req.query.q,
      location:req.query.location,
      maxPrice:req.query.maxPrice,
      sortBy:req.query.sortBy
    });
    res.json(result);
  }catch(e){
    const status=Number.isInteger(e.statusCode)?e.statusCode:502;
    res.status(status).json({error:e.message||"Product search failed"});
  }
});

app.get("/shopping/coupons",async(req,res)=>{
  try{
    const result=await getCoupons({
      q:req.query.q,
      country:req.query.country||"PT",
      type:req.query.type||"all"
    });
    res.json(result);
  }catch(e){
    const status=Number.isInteger(e.statusCode)?e.statusCode:502;
    res.status(status).json({error:e.message||"Coupon search failed"});
  }
});

const port=process.env.PORT||10000;
app.listen(port,"0.0.0.0",()=>console.log("JM API Vault running"));
