const {test}=require('node:test');
const assert=require('node:assert/strict');
const {callbackPolicy,heroesDetails}=require('../server/heroes.cjs');
const {deliverAlert}=require('../server/purchase-alerts.cjs');
const {makeHandler}=require('../server/runtime.cjs');
const order={reference:'WT-12345678-1234-1234-1234-123456789012',status:'paid',quote:{packageId:'heroes',tier:'v2'},amount_kobo:12300,currency:'NGN',paid_at:'2026-11-06T09:00:00Z',customer:{name:'Test Person',email:'test@example.invalid',phone:'0000000'},created_at:new Date(),request_hash:require('../server/payments.cjs').hash('ab'.repeat(32))};
test('Lagos callback boundaries: before opening, opening, last minute, closing, midnight and year rollover',()=>{
 const now=new Date('2026-11-06T00:00:00Z');
 for(const [at,start,deadline] of [
 ['2026-11-06T06:59:00Z','2026-11-06T07:00:00.000Z',null],
 ['2026-11-06T07:00:00Z','2026-11-06T08:00:00.000Z','2026-11-06T09:00:00.000Z'],
 ['2026-11-06T17:59:00Z','2026-11-06T18:59:00.000Z','2026-11-06T19:59:00.000Z'],
 ['2026-11-06T18:00:00Z','2026-11-07T07:00:00.000Z',null],
 ['2026-11-06T23:00:00Z','2026-11-07T07:00:00.000Z',null],
 ['2026-12-31T22:59:00Z','2027-01-01T07:00:00.000Z',null]
 ]){const p=callbackPolicy(at,{},now);assert.equal(p.startsAt,start);assert.equal(p.deadline,deadline);assert.match(p.hours,/every day.*Africa\/Lagos/);}
});
test('callback uses verified timestamp, configurable hours and signals overdue without restarting clock',()=>{
 const a=callbackPolicy(order.paid_at,{},new Date('2026-11-06T10:00Z')),b=callbackPolicy(order.paid_at,{},new Date('2026-11-06T12:00Z'));
 assert.equal(a.deadline,b.deadline);assert.equal(a.overdue,false);assert.equal(b.overdue,true);
 assert.equal(callbackPolicy('2026-11-06T07:00Z',{HEROES_CONTACT_START:'09:00'}).startsAt,'2026-11-06T08:00:00.000Z');
 assert.throws(()=>callbackPolicy(order.paid_at,{HEROES_CONTACT_START:'19:00',HEROES_CONTACT_END:'08:00'}));
 assert.throws(()=>heroesDetails({...order,status:'pending'}));assert.throws(()=>heroesDetails({...order,quote:{packageId:'swagger'}}));
 assert.equal(heroesDetails(order).tier,'Heroes V2');
});
const env={HEROES_ALERT_EMAIL_KEY:'test-key',HEROES_ALERT_FROM:'team@example.invalid',HEROES_ALERT_TO:'ops@example.invalid',HEROES_ALERT_FALLBACK_URL:'https://fallback.example.invalid/alerts'};
test('verified Heroes alerts: primary success, fallback on failure, both fail stays retryable; no alert for pending/unrelated',async()=>{
 let calls=[];
 const ok=async(url,options)=>{calls.push({url,options});return {ok:true};};
 assert.equal(await deliverAlert(order,env,ok),'email');assert.equal(calls.length,1);assert.match(calls[0].options.body,/30–60-minute/);
 calls=[];assert.equal(await deliverAlert(order,env,async(url,o)=>{calls.push(url);return {ok:!url.includes('resend')};}),'fallback');assert.equal(calls.length,2);
 await assert.rejects(deliverAlert(order,env,async()=>({ok:false})));
 await assert.rejects(deliverAlert(order,{},ok));
 calls=[];assert.equal(await deliverAlert({...order,status:'pending'},env,ok),null);assert.equal(await deliverAlert({...order,quote:{packageId:'swagger'}},env,ok),null);assert.equal(calls.length,0);
});
test('status exposes Heroes detail/dispatch only after authenticated paid verification; pending/foreign sessions cannot trigger alerts',async()=>{
 let dispatches=0;
 const store={get:async()=>order};
 const deps={env:{PAYSTACK_SECRET_KEY:'sk_test_mock',PAYMENT_SITE_ORIGIN:'https://test.example.invalid'},store,paystack:{},dispatchAlerts:async()=>{dispatches++;}};
 const request=(key)=>({httpMethod:'POST',headers:{origin:deps.env.PAYMENT_SITE_ORIGIN,'content-type':'application/json',cookie:'__Host-wt-order='+key},body:JSON.stringify({reference:order.reference})});
 const handler=makeHandler('status',deps);
 assert.equal((await handler(request('cd'.repeat(32)))).statusCode,403);assert.equal(dispatches,0);
 const result=await handler(request('ab'.repeat(32)));assert.equal(result.statusCode,200);assert.equal(JSON.parse(result.body).heroes.tier,'Heroes V2');assert.equal(dispatches,1);
 const pendingHandler=makeHandler('status',{...deps,store:{get:async()=>({...order,status:'pending'})},paystack:{verify:async()=>({status:'pending'})}});
 const pending=await pendingHandler(request('ab'.repeat(32)));assert.equal(JSON.parse(pending.body).status,'pending');assert.equal(JSON.parse(pending.body).heroes,undefined);assert.equal(dispatches,1);
});
