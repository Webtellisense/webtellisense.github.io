/* Server quotes are authoritative; package-card prices are display copy only. */
let quoteGeneration = 0;
let activeQuote = null;
let requestKey = null;
let requestPayload = null;
function checkoutSelection() {
  const monthly = !['swagger','frontline'].includes(currentCart.packageId);
  const duration = document.querySelector('input[name="wt_duration"]:checked');
  return {packageId:currentCart.packageId,tier:currentCart.tier,durationMonths:monthly?Number(duration?.value || 1):1,adBudgetKobo:currentCart.adBudgetMin>0?Math.round(Number(document.getElementById('wt-ad-budget-input').value)*100):0};
}
async function paymentRequest(action,body) {
  const res = await fetch('/.netlify/functions/payment-'+action,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Payment service unavailable.');
  return data;
}
function money(kobo) {return new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN'}).format(kobo/100);}
async function calculateInvoiceTotal() {
  const generation=++quoteGeneration;
  activeQuote=null;
  const button=document.querySelector('.wt-btn-submit-pay');
  const message=document.getElementById('wt-payment-message');
  button.disabled=true;
  document.getElementById('wt-commitment-container').style.display=['swagger','frontline'].includes(currentCart.packageId)?'none':'block';
  document.getElementById('inv-grand-total').textContent='Awaiting approved quote';
  document.getElementById('inv-service-fee').textContent='—';
  document.getElementById('inv-ad-row').style.display='none';
  document.getElementById('inv-discount-row').style.display='none';
  message.textContent='Checking billing availability…';
  try {
    const selection=checkoutSelection();
    const q=await paymentRequest('quote',selection);
    if(generation!==quoteGeneration)return;
    activeQuote={selection,quote:q};
    document.getElementById('inv-service-fee').textContent=money(q.serviceKobo);
    document.getElementById('inv-grand-total').textContent=money(q.amountKobo);
    document.getElementById('inv-ad-row').style.display=q.mediaKobo?'flex':'none';
    document.getElementById('inv-ad-fee').textContent=money(q.mediaKobo);
    document.getElementById('inv-discount-row').style.display=q.discountKobo?'flex':'none';
    document.getElementById('inv-discount-fee').textContent='−'+money(q.discountKobo);
    message.textContent='Test checkout. No automatic renewal is created.';
    button.disabled=false;
  } catch(error) {if(generation===quoteGeneration)message.textContent=error.message;}
}
async function executePaystackPayment(event) {
  event.preventDefault();
  if(!activeQuote || JSON.stringify(activeQuote.selection)!==JSON.stringify(checkoutSelection()))return;
  const button=document.querySelector('.wt-btn-submit-pay');
  button.disabled=true;
  const payload={...activeQuote.selection,customer:{name:document.getElementById('wt-client-name').value,email:document.getElementById('wt-client-email').value,phone:document.getElementById('wt-client-phone').value}};
  // Reuse a key for double-clicks/retries; never reuse it for a different selection/customer.
  const fingerprint=JSON.stringify(payload);
  if(requestPayload!==fingerprint){requestKey=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');requestPayload=fingerprint;}
  try {
    const data=await paymentRequest('initialize',{...payload,requestKey});
    if(data.paid)location.assign('/welcome.html?reference='+encodeURIComponent(data.reference));
    else location.assign(data.authorizationUrl);
  } catch(error) {document.getElementById('wt-payment-message').textContent=error.message;button.disabled=false;}
}
