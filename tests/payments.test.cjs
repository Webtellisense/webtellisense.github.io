const {test}=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {quote,createService,matchTransaction,authenticateWebhook}=require('../server/payments.cjs');
const {makeHandler,config,paystackClient}=require('../server/runtime.cjs');
const {createStore}=require('../server/store.cjs');
const {newDb}=require('pg-mem');
const fs=require('node:fs');
// Fictional test-only rules; these are NOT Webtellisense offers or approved terms.
const rules={version:'fixture-only',packages:{single:{approved:true,billingMode:'one_time',discountBpsByMonths:{1:0},tiers:{basic:{feeKobo:10000,adMinKobo:0,adMaxKobo:0}}},monthly:{approved:true,billingMode:'prepaid_months',minimumMonths:3,allowedMonths:[3,6],discountBpsByMonths:{3:0,6:1000},tiers:{basic:{feeKobo:10000,adMinKobo:5000,adMaxKobo:10000}}}}};
const customer={name:'Test User',email:'test@example.invalid',phone:'+2340000000000'};
const input={packageId:'single',tier:'basic',durationMonths:1,adBudgetKobo:0,customer,requestKey:'ab'.repeat(32),amount:1};
const env={PAYSTACK_SECRET_KEY:'sk_test_mockonly',PAYMENT_SITE_ORIGIN:'https://test.example.invalid',PAYSTACK_WEBHOOK_SECRETS:'whsec_fixture'};
async function fixture() {
 const db=newDb();db.public.none(fs.readFileSync('migrations/001_orders.sql','utf8'));const {Pool}=db.adapters.createPg();const pool=new Pool();const store=createStore(pool);let init=0;
 const provider={initialize:async o=>{init++;return {reference:o.reference,authorization_url:'https://checkout.paystack.com/fixture'};},verify:async ref=>transaction(await store.get(ref))};
 const service=createService({store,paystack:provider,rules});
 return {store,provider,service,pool,get init(){return init;}};
}
function transaction(o,overrides={}) {return {status:'success',domain:'test',reference:o.reference,amount:Number(o.amount_kobo),currency:'NGN',id:'9007199254740999',customer:{email:o.customer.email},metadata:{order_reference:o.reference,package_id:o.quote.packageId,tier:o.quote.tier,catalog_version:o.quote.catalogVersion,duration_months:o.quote.durationMonths},...overrides};}
const event=(body,headers={})=>({httpMethod:'POST',headers:{origin:env.PAYMENT_SITE_ORIGIN,'content-type':'application/json',...headers},body:JSON.stringify(body)});
test('server quote ignores client amount; one-time cannot multiply; unapproved packages fail closed',()=>{
 assert.equal(quote(input,rules).amountKobo,10000);
 assert.throws(()=>quote({...input,durationMonths:3},rules),/One-time/);
 assert.throws(()=>quote({...input,packageId:'heroes',tier:'v1'}),/awaiting approval/);
 for(const packageId of ['__proto__','constructor','missing']) assert.throws(()=>quote({...input,packageId},rules));
});
test('monthly rules enforce minimum, allowed months, ad range, explicit discounts and integer inputs',()=>{
 const i={...input,packageId:'monthly',durationMonths:3,adBudgetKobo:5000};
 assert.equal(quote(i,rules).amountKobo,45000);
 assert.equal(quote({...i,durationMonths:6},rules).amountKobo,84000);
 for(const extra of [{durationMonths:1},{durationMonths:4},{adBudgetKobo:4999},{adBudgetKobo:10001},{adBudgetKobo:NaN},{durationMonths:3.5}])assert.throws(()=>quote({...i,...extra},rules));
 const absent=structuredClone(rules);delete absent.packages.monthly.discountBpsByMonths[3];assert.throws(()=>quote(i,absent),/approval/);
});
test('durable initialization idempotency and payload binding, across service instances',async()=>{
 const f=await fixture();const a=await f.service.initialize(input);const b=await createService({store:f.store,paystack:f.provider,rules}).initialize(input);
 assert.equal(a.reference,b.reference);assert.equal(f.init,1);
 await assert.rejects(f.service.initialize({...input,customer:{...customer,name:'Different'}}),/another selection/);
 assert.equal((await f.store.get(a.reference)).amount_kobo,10000);
 await f.pool.end();
});
test('every order verification invariant rejects mismatches',async()=>{
 const f=await fixture();const r=await f.service.initialize(input);const o=await f.store.get(r.reference);
 for(const extra of [{status:'failed'},{domain:'live'},{reference:'other'},{amount:1},{currency:'USD'},{customer:{email:'other@example.invalid'}},{metadata:{...transaction(o).metadata,package_id:'monthly'}},{metadata:{...transaction(o).metadata,tier:'wrong'}},{metadata:{...transaction(o).metadata,duration_months:99}},{metadata:{...transaction(o).metadata,catalog_version:'wrong'}},{id:'garbage'}])assert.throws(()=>matchTransaction(o,transaction(o,extra)),/does not match/);
 await f.pool.end();
});
test('callback and webhook retries settle once with durable outbox; pending and foreign browser denied',async()=>{
 const f=await fixture();const r=await f.service.initialize(input);
 await assert.rejects(f.service.status(r.reference,'cd'.repeat(32)),/cannot access/);
 f.provider.verify=async ref=>transaction(await f.store.get(ref),{status:'abandoned'});
 assert.equal((await f.service.status(r.reference,input.requestKey)).status,'pending');
 f.provider.verify=async ref=>transaction(await f.store.get(ref));
 await f.service.settle(r.reference);await f.service.settle(r.reference);
 assert.equal((await f.service.status(r.reference,input.requestKey)).status,'paid');
 assert.equal((await f.pool.query('SELECT * FROM payment_outbox')).rowCount,1);
 const other=await f.service.initialize({...input,requestKey:'cd'.repeat(32)});
 await assert.rejects(f.service.settle(other.reference)); // same Paystack transaction ID cannot pay another order
 await f.pool.end();
});
function signature(raw,t=Math.floor(Date.now()/1000),secret='whsec_fixture'){return `t=${t},v1=whk_fixture:${crypto.createHmac('sha512',secret).update(t+'.').update(raw).digest('hex')}`;}
test('current documented signature: exact bytes, timestamp, rotation and no legacy downgrade',()=>{
 const raw=Buffer.from('{ "event": "charge.success" }');const good=signature(raw);
 assert.equal(authenticateWebhook(raw,{'paystack-signature':good},env),true);
 assert.equal(authenticateWebhook(Buffer.from('{}'),{'paystack-signature':good},env),false);
 assert.equal(authenticateWebhook(raw,{'paystack-signature':signature(raw,Math.floor(Date.now()/1000)-301)},env),false);
 assert.equal(authenticateWebhook(raw,{'paystack-signature':signature(raw,Math.floor(Date.now()/1000)+301)},env),false);
 assert.equal(authenticateWebhook(raw,{'paystack-signature':'t=1,t=2,v1=bad'},env),false);
 const legacy=crypto.createHmac('sha512',env.PAYSTACK_SECRET_KEY).update(raw).digest('hex');
 assert.equal(authenticateWebhook(raw,{'x-paystack-signature':legacy},env),false);
 assert.equal(authenticateWebhook(raw,{'x-paystack-signature':legacy},{...env,PAYSTACK_ALLOW_LEGACY_WEBHOOK:'true'}),true);
 assert.equal(authenticateWebhook(raw,{'paystack-signature':'bad','x-paystack-signature':legacy},{...env,PAYSTACK_ALLOW_LEGACY_WEBHOOK:'true'}),false);
 assert.equal(authenticateWebhook(raw,{'paystack-signature':signature(raw,undefined,'whsec_next')},{...env,PAYSTACK_WEBHOOK_SECRETS:'whsec_fixture,whsec_next'}),true);
});
test('Netlify handlers require origin/cookie; webhook accepts base64 raw bytes and is idempotent',async()=>{
 const f=await fixture();const deps={env,store:f.store,paystack:f.provider,rules};
 const initialize=makeHandler('initialize',deps), status=makeHandler('status',deps), webhook=makeHandler('webhook',deps);
 assert.equal((await initialize(event(input,{origin:'https://attacker.invalid'}))).statusCode,403);
 const r=await initialize(event(input));assert.equal(r.statusCode,200);assert.match(r.headers['Set-Cookie'],/HttpOnly; Secure; SameSite=Lax/);
 const {reference}=JSON.parse(r.body);
 assert.equal((await status(event({reference}))).statusCode,403);
 const raw=Buffer.from(JSON.stringify({event:'charge.success',data:{reference}}));
 const hook={httpMethod:'POST',headers:{'paystack-signature':signature(raw)},isBase64Encoded:true,body:raw.toString('base64')};
 assert.equal((await webhook({...hook,headers:{}})).statusCode,401);
 assert.equal((await webhook(hook)).statusCode,200);assert.equal((await webhook(hook)).statusCode,200);
 const paid=await status(event({reference},{cookie:r.headers['Set-Cookie'].split(';')[0]}));assert.equal(JSON.parse(paid.body).status,'paid');
 assert.equal((await f.pool.query('SELECT * FROM payment_outbox')).rowCount,1);
 await f.pool.end();
});
test('test-only configuration and API transport: no live keys, correct metadata, 64-bit transaction IDs preserved',async()=>{
 assert.throws(()=>config({...env,PAYSTACK_SECRET_KEY:'sk_live_no'}),/Test payment/);
 const f=await fixture();const r=await f.service.initialize(input);const o=await f.store.get(r.reference);let sent;
 const client=paystackClient(env,env.PAYMENT_SITE_ORIGIN,async(url,options)=>{sent={url,options};return {ok:true,text:async()=>'{"status":true,"data":{"id":9007199254740999}}'};});
 await client.initialize(o);const body=JSON.parse(sent.options.body);assert.equal(body.amount,'10000');assert.equal(JSON.parse(body.metadata).package_id,'single');assert.equal(body.plan,undefined);
 assert.equal((await client.verify(r.reference)).id,'9007199254740999');await f.pool.end();
});
test('publish output excludes private sources and welcome has no client-side proof or early iframe',()=>{
 const {execFileSync}=require('node:child_process');execFileSync(process.execPath,['scripts/build-public.cjs']);
 for(const path of ['server','migrations','tests','netlify','node_modules','package.json','.env'])assert.equal(fs.existsSync('public/'+path),false);
 const welcome=fs.readFileSync('welcome.html','utf8');assert.doesNotMatch(welcome,/atob|session_id|<iframe[^>]*\ssrc=/);
 assert.doesNotMatch(fs.readFileSync('packages.html','utf8'),/pk_live_|PaystackPop|btoa/);
});
test('provider failures never confirm payment or acknowledge webhook',async()=>{
 const f=await fixture();f.provider.initialize=async()=>{throw new Error('provider timeout');};
 await assert.rejects(f.service.initialize(input),/timeout/);
 const o=(await f.pool.query('SELECT * FROM payment_orders')).rows[0];
 f.provider.verify=async()=>{throw new Error('provider timeout');};
 const raw=Buffer.from(JSON.stringify({event:'charge.success',data:{reference:o.reference}}));
 const r=await makeHandler('webhook',{env,store:f.store,paystack:f.provider})({httpMethod:'POST',headers:{'paystack-signature':signature(raw)},body:raw.toString()});
 assert.equal(r.statusCode,503);assert.equal(r.headers['Cache-Control'],'no-store');
 assert.equal((await f.store.get(o.reference)).status,'pending');assert.equal((await f.pool.query('SELECT * FROM payment_outbox')).rowCount,0);
 await f.pool.end();
});
