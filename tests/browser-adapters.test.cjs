const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function harness(file, response, search='') {
 const elements=new Map();const element=id=>{if(!elements.has(id))elements.set(id,{style:{},hidden:false,textContent:'',value:'',addEventListener(){}});return elements.get(id);};
 const storage=new Map();const context={console,Intl,crypto:require('node:crypto').webcrypto,URLSearchParams,location:{search,pathname:'/welcome.html'},history:{replaceState(){}},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},document:{getElementById:element,querySelector:selector=>selector.includes('wt_duration')?{value:'6'}:element('button')},fetch:async()=>response,currentCart:{packageId:'swagger',tier:'entry',adBudgetMin:0}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(file,'utf8'),context);return {context,element};
}
test('legacy Base64 query cannot unlock welcome or load third-party form',async()=>{
 const h=harness('assets/js/payment-welcome.js',null,'?session_id=eyJyZWYiOiJmYWtlIn0=');await flush();
 assert.equal(h.element('client-onboarding-view').style.display,undefined);assert.equal(h.element('tally-onboarding-frame').src,undefined);
});
test('welcome loads onboarding only following authenticated paid status, pending stays locked',async()=>{
 for(const status of ['pending','paid']) {
  const h=harness('assets/js/payment-welcome.js',{ok:true,json:async()=>({status,name:'Test Person'})},'?reference=WT-12345678-1234-1234-1234-123456789012');await flush();
  assert.equal(h.element('client-onboarding-view').style.display,status==='paid'?'block':undefined);
  assert.equal(Boolean(h.element('tally-onboarding-frame').src),status==='paid');
 }
});
test('unapproved quote disables payment and one-time browser selection never multiplies months',async()=>{
 const h=harness('assets/js/payment-checkout.js',{ok:false,json:async()=>({error:'Awaiting approval'})});
 assert.equal(vm.runInContext('checkoutSelection().durationMonths',h.context),1);
 await vm.runInContext('calculateInvoiceTotal()',h.context);
 assert.equal(h.element('button').disabled,true);assert.equal(h.element('wt-commitment-container').style.display,'none');assert.equal(h.element('wt-payment-message').textContent,'Awaiting approval');
});
