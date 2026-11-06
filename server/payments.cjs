const crypto = require('node:crypto');
const catalog = require('./catalog.json');
class PaymentError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const fail = (status, message) => { throw new PaymentError(status, message); };
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
function quote(input, rules = catalog) {
  const pkg = rules.packages[input.packageId];
  if (!pkg || !Object.hasOwn(rules.packages, input.packageId) || !Object.hasOwn(pkg.tiers, input.tier)) fail(400, 'Unknown package or tier.');
  if (pkg.approved !== true) fail(409, 'This package’s billing terms are awaiting approval. Please contact Webtellisense.');
  const tier = pkg.tiers[input.tier];
  const months = input.durationMonths;
  const ad = input.adBudgetKobo;
  if (!Number.isSafeInteger(months) || months < 1 || !Number.isSafeInteger(ad) || ad < 0) fail(400, 'Invalid duration or media budget.');
  if (!['one_time','prepaid_months'].includes(pkg.billingMode) || !Number.isSafeInteger(tier.feeKobo) || tier.feeKobo <= 0) fail(503, 'Billing configuration incomplete.');
  if (pkg.billingMode === 'one_time' && months !== 1) fail(400, 'One-time purchases cannot be multiplied by months.');
  if (pkg.billingMode === 'prepaid_months' && (!Number.isSafeInteger(pkg.minimumMonths) || pkg.minimumMonths < 1 || !Array.isArray(pkg.allowedMonths) || !pkg.allowedMonths.includes(months) || months < pkg.minimumMonths)) fail(400, 'Duration is not permitted for this package.');
  if (!Number.isSafeInteger(tier.adMinKobo) || !Number.isSafeInteger(tier.adMaxKobo) || ad < tier.adMinKobo || ad > tier.adMaxKobo) fail(400, 'Media budget is outside the approved range.');
  // Every accepted duration needs an explicit approved discount, including zero.
  const bps = pkg.discountBpsByMonths?.[months];
  if (!Number.isSafeInteger(bps) || bps < 0 || bps > 10000) fail(503, 'Discount rules require approval.');
  const service = BigInt(tier.feeKobo) * BigInt(pkg.billingMode === 'one_time' ? 1 : months);
  const discount = service * BigInt(bps) / 10000n;
  const media = BigInt(ad) * BigInt(pkg.billingMode === 'one_time' ? 1 : months);
  const amount = service - discount + media;
  if (amount <= 0n || amount > BigInt(Number.MAX_SAFE_INTEGER)) fail(400, 'Invalid invoice total.');
  return { catalogVersion: rules.version, packageId: input.packageId, tier: input.tier, billingMode: pkg.billingMode, durationMonths: months, adBudgetKobo: ad, serviceKobo: Number(service), discountKobo: Number(discount), mediaKobo: Number(media), amountKobo: Number(amount), currency: 'NGN' };
}
function validateCustomer(customer) {
  if (!customer || typeof customer.name !== 'string' || !customer.name.trim() || customer.name.length > 150 || typeof customer.email !== 'string' || customer.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) || typeof customer.phone !== 'string' || !/^[+\d ()-]{7,30}$/.test(customer.phone)) fail(400, 'Please enter valid contact details.');
  return { name: customer.name.trim(), email: customer.email.trim().toLowerCase(), phone: customer.phone.trim() };
}
function authenticateWebhook(raw, headers, env, now = Date.now()) {
  const modern = headers['paystack-signature'];
  if (modern !== undefined) {
    let timestamp;
    const signatures = [];
    for (const part of modern.split(',')) {
      const pos = part.indexOf('=');
      if (pos < 0) continue;
      const key = part.slice(0,pos).trim(), value = part.slice(pos+1).trim();
      if (key === 't') {
        if (timestamp !== undefined || !/^\d+$/.test(value)) return false;
        timestamp = Number(value);
      }
      if (key === 'v1') signatures.push(value.slice(value.indexOf(':')+1));
    }
    if (!Number.isSafeInteger(timestamp) || Math.abs(now / 1000 - timestamp) > 300) return false;
    const secrets = (env.PAYSTACK_WEBHOOK_SECRETS || '').split(',').filter(x => x.startsWith('whsec_'));
    return secrets.some(secret => {
      const expected = crypto.createHmac('sha512', secret).update(timestamp+'.').update(raw).digest();
      return signatures.some(sig => /^[0-9a-f]{128}$/.test(sig) && crypto.timingSafeEqual(expected, Buffer.from(sig,'hex')));
    });
  }
  // Explicit migration mode only; never downgrade an invalid modern signature.
  if (env.PAYSTACK_ALLOW_LEGACY_WEBHOOK !== 'true') return false;
  const sig = headers['x-paystack-signature'] || '';
  return /^[0-9a-f]{128}$/.test(sig) && crypto.timingSafeEqual(crypto.createHmac('sha512', env.PAYSTACK_SECRET_KEY).update(raw).digest(), Buffer.from(sig,'hex'));
}
function matchTransaction(order, tx) {
  let meta = tx.metadata;
  if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch { meta = null; } }
  if (tx.status !== 'success' || tx.domain !== 'test' || tx.reference !== order.reference || !Number.isSafeInteger(tx.amount) || tx.amount !== Number(order.amount_kobo) || tx.currency !== order.currency || String(tx.customer?.email).toLowerCase() !== order.customer.email || meta?.order_reference !== order.reference || meta?.package_id !== order.quote.packageId || meta?.tier !== order.quote.tier || meta?.catalog_version !== order.quote.catalogVersion || meta?.duration_months !== order.quote.durationMonths || !/^\d+$/.test(String(tx.id))) fail(409, 'Payment does not match the server order.');
  return String(tx.id);
}
function createService({store, paystack, rules = catalog}) {
  return {
    async initialize(body) {
      if (!/^[a-f0-9]{64}$/.test(body.requestKey || '')) fail(400,'Invalid checkout request key.');
      const customer = validateCustomer(body.customer);
      const invoice = quote(body, rules);
      const requestHash = hash(body.requestKey), payloadHash = hash(JSON.stringify({invoice,customer}));
      const {order, inserted} = await store.create({reference:'WT-'+crypto.randomUUID(), request_hash:requestHash, payload_hash:payloadHash, quote:invoice, customer, amount_kobo:invoice.amountKobo, currency:invoice.currency});
      if (order.payload_hash !== payloadHash) fail(409,'This checkout request belongs to another selection.');
      if (order.status === 'paid') return {reference:order.reference, paid:true};
      if (order.authorization_url) return {reference:order.reference, authorizationUrl:order.authorization_url};
      // Do not initialize the same reference twice after timeout/parallel invocation.
      if (!inserted) fail(409,'Checkout initialization is pending reconciliation. Please contact Webtellisense with your reference: '+order.reference);
      const data = await paystack.initialize(order);
      if (data.reference !== order.reference || !/^https:\/\/checkout\.paystack\.com\/[A-Za-z0-9_-]+$/.test(data.authorization_url)) fail(502,'Invalid payment provider response.');
      await store.saveAuthorization(order.reference, data.authorization_url);
      return {reference:order.reference, authorizationUrl:data.authorization_url};
    },
    async settle(reference) {
      const order = await store.get(reference);
      if (!order) fail(404,'Order not found.');
      // A retry never causes another settlement/outbox entry.
      if (order.status === 'paid') return order;
      const tx = await paystack.verify(reference);
      if (tx.status !== 'success') return order;
      const id = matchTransaction(order, tx);
      await store.markPaid(reference,id);
      return store.get(reference);
    },
    async status(reference, key) {
      const order = await store.get(reference);
      if (!order || Date.now() - new Date(order.created_at).getTime() > 86400000 || !/^[a-f0-9]{64}$/.test(key || '') || !crypto.timingSafeEqual(Buffer.from(order.request_hash,'hex'),Buffer.from(hash(key),'hex'))) fail(403,'This browser cannot access that order.');
      const verified = await this.settle(reference);
      return verified.status === 'paid' ? {status:'paid',reference,packageId:verified.quote.packageId,tier:verified.quote.tier,name:verified.customer.name} : {status:'pending',reference};
    }
  };
}
module.exports = {PaymentError,fail,hash,quote,validateCustomer,authenticateWebhook,matchTransaction,createService};
