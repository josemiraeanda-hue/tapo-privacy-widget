const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
process.env.VAULT_TOKEN='local-fixture-only';
process.env.AUTO_DEV_API_KEY='provider-fixture-only';
const app=require('../server');
let server,base;
before(async()=>{server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));base=`http://127.0.0.1:${server.address().port}`;});
after(()=>new Promise(r=>server.close(r)));
function request(path,{auth=true,body,method='GET'}={}){
 return new Promise((resolve,reject)=>{
  const headers=auth?{Authorization:'Bearer local-fixture-only'}:{};
  if(body!==undefined) headers['Content-Type']='application/json';
  const req=http.request(base+path,{method,headers},res=>{let text='';res.on('data',d=>text+=d);res.on('end',()=>resolve({status:res.statusCode,text,headers:res.headers,json:()=>JSON.parse(text)}));});
  req.on('error',reject);req.end(body);
 });
}
test('public health and concealed unauthenticated routes',async()=>{
 assert.equal((await request('/health',{auth:false})).status,200);
 for(const p of ['/','/knowledge/categories','/auto/vin/INVALID','/shopping/status']) assert.equal((await request(p,{auth:false})).status,404);
});
test('authentication runs before JSON parsing',async()=>{
 const r=await request('/shopping/landed-cost',{auth:false,method:'POST',body:'{broken'});
 assert.equal(r.status,404);assert.equal(r.text,'');
});
test('malformed authenticated JSON returns safe JSON',async()=>{
 const r=await request('/shopping/landed-cost',{method:'POST',body:'{broken'});
 assert.equal(r.status,400);assert.match(r.headers['content-type'],/application\/json/);assert.doesNotMatch(r.text,/SyntaxError|node_modules|server.js/);
});
test('knowledge query, categories and item contracts',async()=>{
 const r=await request('/knowledge/search?q=TecDoc&limit=2');assert.equal(r.status,200);assert.ok(r.json().count>0&&r.json().count<=2);
 assert.equal((await request('/knowledge/search')).status,400);
 assert.equal((await request('/knowledge/item/does-not-exist')).status,404);
 assert.equal((await request('/knowledge/item/auto-dev-vin')).json().id,'auto-dev-vin');
 const cats=(await request('/knowledge/categories')).json().categories;assert.equal(Object.values(cats).reduce((a,b)=>a+b,0),117);
});
test('structured query parameter is rejected',async()=>assert.equal((await request('/knowledge/search?q[x]=TecDoc')).status,400));
test('invalid VIN never calls provider',async()=>{const original=global.fetch;global.fetch=()=>{throw Error('Must not call');};try{assert.equal((await request('/auto/vin/INVALID')).status,400);}finally{global.fetch=original;}});
test('VIN provider has timeout and normalizes lowercase VIN',async()=>{
 const original=global.fetch;let input,options;
 global.fetch=async(u,o)=>{input=u;options=o;return {status:200,text:async()=>'{}'};};
 try{assert.equal((await request('/auto/vin/wvwzzz1jzxw000001')).status,200);assert.ok(options.signal);assert.match(input,/WVWZZZ1JZXW000001$/);}finally{global.fetch=original;}
});
