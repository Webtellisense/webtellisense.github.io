const JSONbig = require('json-bigint')({storeAsString:true});
const {createService,PaymentError,fail,quote,authenticateWebhook} = require('./payments.cjs');
const {productionStore,getPool} = require('./store.cjs');
const {heroesDetails}=require('./heroes.cjs');
const {createAlertDispatcher}=require('./purchase-alerts.cjs');
function config(env) {
  // Deliberately no live-mode escape hatch in this PR.
  if (!/^sk_test_[A-Za-z0-9]+$/.test(env.PAYSTACK_SECRET_KEY || '')) fail(503,'Test payment credentials are not configured.');
  let origin;
  try { const u = new URL(env.PAYMENT_SITE_ORIGIN); if (u.protocol !== 'https:' || u.origin !== env.PAYMENT_SITE_ORIGIN) throw new Error(); origin=u.origin; }
  catch { fail(503,'Payment site origin is not configured.'); }
  return origin;
}
function paystackClient(env, origin, fetchImpl = fetch) {
  async function api(path,body) {
    const response = await fetchImpl('https://api.paystack.co'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+env.PAYSTACK_SECRET_KEY,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(8000)});
    const data = JSONbig.parse(await response.text());
    if (!response.ok || data.status !== true || !data.data) fail(502,'Payment provider is unavailable. Please retry verification later.');
    return data.data;
  }
  return {
    initialize:o=>api('/transaction/initialize',{email:o.customer.email,amount:String(o.amount_kobo),currency:o.currency,reference:o.reference,callback_url:origin+'/welcome.html',metadata:JSON.stringify({order_reference:o.reference,package_id:o.quote.packageId,tier:o.quote.tier,catalog_version:o.quote.catalogVersion,duration_months:o.quote.durationMonths})}),
    verify:ref=>api('/transaction/verify/'+encodeURIComponent(ref))
  };
}
const headers = {'Content-Type':'application/json','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
const response = (status,body,extra={})=>({statusCode:status,headers:{...headers,...extra},body:JSON.stringify(body)});
const cookieName = '__Host-wt-order';
function readCookie(headers) { return (headers.cookie || '').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1); }
function makeHandler(action, dependencies={}) {
  return async event => {
    try {
      const env = dependencies.env || process.env;
      const origin = config(env);
      const h = Object.fromEntries(Object.entries(event.headers || {}).map(([k,v])=>[k.toLowerCase(),v]));
      if (event.httpMethod !== 'POST') return response(405,{error:'Method not allowed'},{Allow:'POST'});
      const raw = Buffer.from(event.body || '',event.isBase64Encoded?'base64':'utf8');
      if (raw.length > 16384) return response(413,{error:'Request too large'});
      if (action === 'webhook') {
        if (!authenticateWebhook(raw,h,env)) return response(401,{error:'Invalid signature'});
      } else if (h.origin !== origin || !h['content-type']?.startsWith('application/json')) return response(403,{error:'Invalid request origin or content type'});
      let body;
      try {body=JSONbig.parse(raw.toString('utf8'));} catch {return response(400,{error:'Invalid JSON'});}
      if (!body || Array.isArray(body) || typeof body !== 'object') return response(400,{error:'Invalid request'});
      if (action === 'quote') return response(200,quote(body,dependencies.rules));
      const store = dependencies.store || productionStore(env);
      const service = createService({store,paystack:dependencies.paystack || paystackClient(env,origin),rules:dependencies.rules});
      if (action === 'initialize') {
        const result = await service.initialize(body);
        return response(200,result,{'Set-Cookie':`${cookieName}=${body.requestKey}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`});
      }
      async function alertVerifiedHeroes(ref) {
        try {
          const order=await store.get(ref);
          if(order?.status==='paid' && order.quote.packageId==='heroes') {
            const dispatch=dependencies.dispatchAlerts || createAlertDispatcher(getPool(env),env);
            await dispatch(ref);
          }
        } catch {console.error('Heroes alert dispatch pending; inspect payment outbox.');}
      }
      if (action === 'status') {
        if (!/^WT-[a-f0-9-]{36}$/.test(body.reference || '')) return response(400,{error:'Invalid reference'});
        const result=await service.status(body.reference,readCookie(h));
        if(result.status==='paid' && result.packageId==='heroes') {
          await alertVerifiedHeroes(body.reference);
          result.heroes=heroesDetails(await store.get(body.reference),env);
        }
        return response(200,result);
      }
      if (action === 'webhook') {
        if (body.event !== 'charge.success') return response(200,{received:true});
        const ref=body.data?.reference;
        if (!/^WT-[a-f0-9-]{36}$/.test(ref || '') || !await store.get(ref)) return response(200,{received:true});
        const settled=await service.settle(ref);
        if(settled.status !== 'paid') return response(503,{error:'Payment awaiting verification'});
        await alertVerifiedHeroes(ref);
        return response(200,{received:true});
      }
      return response(404,{error:'Not found'});
    } catch (error) {
      // Do not log provider responses, secrets, customer details or cookies.
      return response(error instanceof PaymentError?error.status:503,{error:error instanceof PaymentError?error.message:'Payment service unavailable. Please retry later.'});
    }
  };
}
module.exports={makeHandler,config,paystackClient};
