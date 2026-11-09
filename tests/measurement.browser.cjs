// Provider transports are synthetic. No real Google/Meta SDK or collector is contacted.
const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
const base='http://127.0.0.1:8791';
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const evidence=[];
 async function session({approved=true,gpc=false,host='webtellisense.com'}={}){
  const c=await browser.newContext({reducedMotion:'reduce',viewport:{width:1440,height:1000}});const calls=[];
  if(gpc)await c.addInitScript(()=>Object.defineProperty(navigator,'globalPrivacyControl',{value:true}));
  await c.route('**/*',async r=>{
   const u=new URL(r.request().url());
   if(u.hostname==='www.googletagmanager.com'){
    calls.push({provider:'ga-sdk',url:u.origin+u.pathname});
    return r.fulfill({contentType:'text/javascript',body:`(()=>{const q=window.dataLayer;const send=a=>{if(a[0]==='event')fetch('https://www.google-analytics.com/g/collect?'+new URLSearchParams({event:a[1],payload:JSON.stringify(a[2])}));};q.forEach(send);q.push=function(a){Array.prototype.push.call(this,a);send(a);};})();`});
   }
   if(u.hostname==='connect.facebook.net'){
    calls.push({provider:'meta-sdk',url:u.origin+u.pathname});
    return r.fulfill({contentType:'text/javascript',body:`(()=>{const f=window.fbq;const send=(...a)=>{if(['trackSingle','trackSingleCustom'].includes(a[0]))fetch('https://www.facebook.com/tr?'+new URLSearchParams({event:a[2],payload:JSON.stringify(a[3]||{})}));};f.queue.forEach(a=>send(...a));f.callMethod=send;})();`});
   }
   if(['www.google-analytics.com','www.facebook.com'].includes(u.hostname)){calls.push({provider:u.hostname,event:u.searchParams.get('event'),payload:JSON.parse(u.searchParams.get('payload'))});return r.fulfill({status:204});}
   if(u.hostname===host){
    if(u.pathname==='/assets/js/measurement-config.js')return r.fulfill({contentType:'text/javascript',body:`window.WTS_MEASUREMENT={releaseApproved:${approved},ga4:'G-PS5FNQCJRN',metaPixel:'806267492040936',consentVersion:'fixture'};`});
    // A public URL fixture never enables a real payment. Used to test only the handoff event.
    if(u.pathname==='/assets/js/heroes-config.js')return r.fulfill({contentType:'text/javascript',body:fs.readFileSync('assets/js/heroes-config.js','utf8').replace('v1: { monthly: null, three: null, six: null }','v1: { monthly: "https://paystack.com/pay/fixture-only", three: null, six: null }')});
    return r.fulfill({response:await r.fetch({url:base+u.pathname+u.search})});
   }
   return r.abort(); // Fonts and all unrelated external resources remain blocked.
  });
  const p=await c.newPage();return{c,p,calls,origin:'https://'+host};
 }
 let s=await session({approved:false});await s.p.goto(s.origin+'/heroes?email=must-not-leak@example.invalid');await s.p.locator('[data-measurement-settings]').click();assert.equal(s.calls.length,0,'Release gate blocks all providers');await s.c.close();
 s=await session({gpc:true});await s.p.goto(s.origin+'/heroes');assert.equal(s.calls.length,0,'GPC blocks all optional requests');await s.c.close();
 s=await session({host:'deploy-preview-5--webtellisense.netlify.app'});await s.p.goto(s.origin+'/heroes');assert.equal(s.calls.length,0,'Deploy previews never pollute production measurement');await s.c.close();
 s=await session();await s.p.goto(s.origin+'/heroes?email=must-not-leak@example.invalid');assert.equal(s.calls.length,0,'No request before consent');
 await s.p.getByRole('checkbox',{name:'Allow analytics'}).check();await s.p.getByRole('checkbox',{name:'Allow advertising measurement'}).check();await s.p.getByRole('button',{name:'Save my choices'}).click();
 await s.p.waitForFunction(()=>window.dataLayer?.some(a=>a[0]==='event'&&a[1]==='page_view'));await s.p.waitForTimeout(100);
 await s.p.locator('input[name="billing-view"][value="three"]').check();
 await s.p.evaluate(()=>{const sales=[...document.querySelectorAll('a')].find(a=>a.textContent.includes('Talk to Sales'));sales.addEventListener('click',e=>e.preventDefault(),{once:true});sales.click();});
 await s.p.locator('[data-choice-link="v2"]').click();await s.p.locator('#heroes-tier').selectOption('v3');await s.p.locator('#heroes-period').selectOption('six');
 await s.p.evaluate(()=>{for(const selector of ['a[href^="tel:"]','a[href^="https://wa.me/"]']){const el=document.querySelector(selector);el.addEventListener('click',e=>e.preventDefault(),{once:true});el.click();}const sales=[...document.querySelectorAll('a')].find(a=>a.textContent.includes('Talk to Sales'));if(sales){sales.addEventListener('click',e=>e.preventDefault(),{once:true});sales.click();}});
 // Attempt malicious/unapproved events and extra PII through the public helper.
 await s.p.evaluate(()=>{WTSMeasurement.track('Purchase',{email:'must-not-leak@example.invalid',value:350000});WTSMeasurement.track('heroes_tier_select',{tier:'v1',email:'must-not-leak@example.invalid',reference:'FAKE',period:'six',url:'https://evil.invalid'});});
 await s.p.waitForTimeout(100);
 assert.equal(s.calls.filter(x=>x.provider==='ga-sdk').length,2,'One GA script on each of the two page loads, not GA plus GTM');
 const encoded=JSON.stringify(s.calls);assert.doesNotMatch(encoded,/must-not-leak|Purchase|FAKE|revenue|reference|email/);
 for(const event of ['heroes_period_select','heroes_tier_select','heroes_talk_to_sales','heroes_call_click','heroes_whatsapp_click'])assert.ok(s.calls.some(x=>x.event===event),event);
 assert.equal(s.calls.filter(x=>x.event==='PageView').length,2,'One per page per configured Meta destination');
 await s.p.locator('#heroes-tier').selectOption('v1');await s.p.locator('#heroes-period').selectOption('monthly');
 assert.equal(await s.p.locator('#paystack-link').isVisible(),true,'Synthetic hosted-page fixture only');
 await s.p.locator('#paystack-link').evaluate(el=>{el.addEventListener('click',e=>e.preventDefault(),{once:true});el.click();});
 await s.p.waitForTimeout(100);assert.ok(s.calls.some(x=>x.event==='heroes_paystack_handoff'),'Handoff is a custom click, never Purchase');
 await s.p.locator('[data-measurement-settings]').click();await s.p.getByRole('button',{name:'Keep optional tracking off'}).click();const count=s.calls.length;
 await s.p.locator('#heroes-tier').selectOption('v1');await s.p.waitForTimeout(100);assert.equal(s.calls.length,count,'Withdrawal suppresses later interaction events');
 evidence.push({scenario:'Consent, custom events, URL/PII minimization, pageview dedupe, withdrawal',calls:s.calls});await s.c.close();
 s=await session();await s.p.goto(s.origin+'/heroes-welcome.html?verified=true&reference=FAKE');assert.equal(s.calls.length,0,'Onboarding unmeasured even with configured module');await s.c.close();
 fs.writeFileSync('docs/completion-measurement-validation.json',JSON.stringify({method:'Synthetic SDKs/collectors, not provider validation. Configured production release remains OFF. Tests do not establish account ownership, actual provider event processing or legal approval.',scenarios:['Release gate','No requests before opt-in','GPC','Preview suppression','Consent and sanitized events','One pageview per enabled destination/page','Withdrawal','Onboarding excluded'],evidence},null,2)+'\n');
 await browser.close();console.log('Measurement browser checks passed with synthetic transports only.');
})().catch(e=>{console.error(e);process.exit(1)});
