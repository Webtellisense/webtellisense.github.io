// Local Chromium only. All verification/submission responses are synthetic; external requests blocked.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {callbackPolicy}=require('../server/heroes.cjs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || undefined,headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1100}});let state='paid',profileFails=false;const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const reference='WT-12345678-1234-1234-1234-123456789012';
 const paid={status:'paid',reference,packageId:'heroes',tier:'v2',name:'Partner Example',heroes:{tier:'Heroes V2',amountKobo:50000000,currency:'NGN',confirmedAt:'2026-11-06T09:00:00Z',callback:callbackPolicy('2026-11-06T09:00:00Z',{},new Date('2026-11-06T09:00:00Z'))}};
 await page.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.hostname!=='127.0.0.1')return route.abort();
  if(url.pathname==='/.netlify/functions/payment-status'){
   const code=state==='recovery'?403:state==='error'?503:200;
   return route.fulfill({status:code,json:state==='paid'?paid:state==='other'?{status:'paid',packageId:'swagger',name:'Partner Example'}:{status:'pending'}});
  }
  if(url.pathname==='/' && req.method()==='POST')return route.fulfill({status:profileFails?503:200,body:'mock Netlify handler'});
  return route.continue();
 });
 const visit=()=>page.goto(`http://127.0.0.1:8765/heroes-welcome.html?reference=${reference}`);
 for(const s of ['pending','error','recovery']) {
  state=s;await visit();await page.waitForFunction(()=>!document.getElementById('verification-message').textContent.includes('securely checking'));
  assert.equal(await page.locator('#verified-welcome').isVisible(),false);assert.equal(await page.locator('#contact').isVisible(),true);
  if(s==='pending'){fs.mkdirSync('docs/previews',{recursive:true});await page.screenshot({path:'docs/previews/heroes-pending.png',fullPage:true});}
 }
 state='paid';await visit();await page.locator('#verified-welcome').waitFor({state:'visible'});
 assert.match(await page.locator('#callback-title').textContent(),/within 1–2 hours/);assert.equal(await page.locator('#receipt-tier').textContent(),'Heroes V2');
 assert.equal(await page.locator('#heroes-profile-form').isVisible(),false);
 assert.equal(await page.locator('iframe').count(),0);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 fs.mkdirSync('docs/previews',{recursive:true});await page.screenshot({path:'docs/previews/heroes-desktop.png',fullPage:true});
 const daytime=paid.heroes.callback;paid.heroes.callback=callbackPolicy('2026-11-06T19:00:00Z',{},new Date('2026-11-06T19:00:00Z'));await visit();await page.locator('#verified-welcome').waitFor({state:'visible'});assert.match(await page.locator('#callback-title').textContent(),/8:00.*7 November/);await page.screenshot({path:'docs/previews/heroes-after-hours.png',fullPage:true});paid.heroes.callback=daytime;await visit();await page.locator('#verified-welcome').waitFor({state:'visible'});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'docs/previews/heroes-mobile.png',fullPage:true});
 await page.locator('summary').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#heroes-profile-form').isVisible(),true);
 await page.locator('[name="business-name"]').fill('Synthetic test business');await page.locator('[name="contact-email"]').fill('test@example.invalid');await page.locator('[name="priority"]').fill('Test profile only.');
 profileFails=true;await page.locator('#profile-submit').click();await page.waitForFunction(()=>document.getElementById('profile-status').textContent.includes('couldn’t confirm'));
 assert.equal(await page.locator('[name="business-name"]').inputValue(),'Synthetic test business');assert.equal(await page.locator('#profile-submit').isDisabled(),false);
 profileFails=false;await page.locator('#profile-submit').click();await page.waitForFunction(()=>document.getElementById('profile-status').textContent.includes('has been submitted'));
 assert.equal(await page.locator('#profile-submit').isDisabled(),true);
 for(const width of [320,768]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 // The shared page sends Heroes to the new experience only; other packages retain Tally.
 await page.goto(`http://127.0.0.1:8765/welcome.html?reference=${reference}`);await page.waitForURL('**/heroes-welcome.html');
 state='other';await page.goto(`http://127.0.0.1:8765/welcome.html?reference=${reference}`);await page.locator('#client-onboarding-view').waitFor({state:'visible'});assert.match(await page.locator('#tally-onboarding-frame').getAttribute('src'),/tally.so/);
 assert.deepEqual(errors,[]);
 await browser.close();console.log('Browser checks passed: paid/pending/error/recovery, mobile reflow, keyboard profile, submission retry, Heroes routing and unrelated Tally flow.');
})().catch(e=>{console.error(e);process.exit(1);});
