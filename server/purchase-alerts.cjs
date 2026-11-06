const {randomUUID}=require('node:crypto');
const {callbackPolicy}=require('./heroes.cjs');
function httpsEndpoint(value){try {const u=new URL(value);return u.protocol==='https:' && !u.username && !u.password;}catch{return false;}}
async function deliverAlert(order,env,fetchImpl=fetch) {
 if(order.status!=='paid'||order.quote.packageId!=='heroes')return null;
 const policy=callbackPolicy(order.paid_at,env);
 const text=`Verified Heroes purchase (${order.quote.tier})\nReference: ${order.reference}\nCustomer: ${order.customer.name}\nPhone: ${order.customer.phone}\nEmail: ${order.customer.email}\nAmount: ${order.currency} ${(Number(order.amount_kobo)/100).toFixed(2)}\nConfirmed: ${order.paid_at}\nCallback: ${policy.windowLabel}\nFirst call: welcome the client and arrange a 30–60-minute onboarding session. Check the payment ledger before acting. Do not request passwords.`;
 async function send(url,headers,payload) {
  const r=await fetchImpl(url,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(payload),signal:AbortSignal.timeout(3000)});
  if(!r.ok)throw new Error('Alert provider did not accept notification');
 }
 try {
  if(!env.HEROES_ALERT_EMAIL_KEY || !env.HEROES_ALERT_FROM || !env.HEROES_ALERT_TO)throw new Error('Email alert configuration missing');
  await send('https://api.resend.com/emails',{Authorization:`Bearer ${env.HEROES_ALERT_EMAIL_KEY}`,'Idempotency-Key':`heroes-${order.reference}`},{from:env.HEROES_ALERT_FROM,to:env.HEROES_ALERT_TO.split(',').map(x=>x.trim()),subject:`Verified Heroes purchase — ${order.quote.tier.toUpperCase()}`,text});
  return 'email';
 }catch{
  if(!httpsEndpoint(env.HEROES_ALERT_FALLBACK_URL))throw new Error('Alert fallback unavailable');
  await send(env.HEROES_ALERT_FALLBACK_URL,env.HEROES_ALERT_FALLBACK_TOKEN?{Authorization:`Bearer ${env.HEROES_ALERT_FALLBACK_TOKEN}`}:{},{text,idempotency_key:`heroes-${order.reference}`});
  return 'fallback';
 }
}
function createAlertDispatcher(pool,env,fetchImpl=fetch) {
 return async function dispatch(reference=null) {
  const pending=await pool.query(`SELECT o.reference FROM payment_outbox x JOIN payment_orders o ON o.reference=x.reference WHERE o.status='paid' AND o.quote->>'packageId'='heroes' AND x.processed_at IS NULL AND (x.alert_lease_until IS NULL OR x.alert_lease_until<now()) AND (x.alert_next_attempt IS NULL OR x.alert_next_attempt<=now()) AND ($1::text IS NULL OR o.reference=$1) ORDER BY x.created_at LIMIT 5`,[reference]);
  let accepted=0;
  for(const item of pending.rows){
   const lease=randomUUID();
   const claim=await pool.query(`UPDATE payment_outbox SET alert_lease_id=$2,alert_lease_until=now()+interval '2 minutes',alert_attempts=alert_attempts+1 WHERE reference=$1 AND processed_at IS NULL AND (alert_lease_until IS NULL OR alert_lease_until<now()) AND (alert_next_attempt IS NULL OR alert_next_attempt<=now()) RETURNING reference`,[item.reference,lease]);
   if(!claim.rowCount)continue;
   try {
    const order=(await pool.query('SELECT * FROM payment_orders WHERE reference=$1',[item.reference])).rows[0];
    const via=await deliverAlert(order,env,fetchImpl);if(!via)throw new Error('Order not eligible');
    await pool.query('UPDATE payment_outbox SET processed_at=now(),alert_delivered_via=$3,alert_lease_until=NULL WHERE reference=$1 AND alert_lease_id=$2',[item.reference,lease,via]);accepted++;
   }catch{
    await pool.query("UPDATE payment_outbox SET alert_lease_until=NULL,alert_next_attempt=now()+interval '5 minutes' WHERE reference=$1 AND alert_lease_id=$2",[item.reference,lease]);
    console.error('Heroes purchase alert pending; inspect payment outbox.'); // No PII/provider payloads.
   }
  }
  return accepted;
 };
}
module.exports={deliverAlert,createAlertDispatcher};
