// Actual release config + browser/network assertions; all SDKs/collectors are synthetic.
// No real provider SDK, event collector, Paystack or Netlify submission is contacted.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const base=process.env.HEROES_TEST_ORIGIN||'http://127.0.0.1:8795';
const configContext={window:{}};vm.runInNewContext(fs.readFileSync('assets/js/measurement-config.js','utf8'),configContext);
const config=configContext.window.WTS_MEASUREMENT,key='wts-measurement-choice',scenarios=[],evidence=[],accessibility=[];
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 async function session({host='webtellisense.com',gpc=false,dnt=false,saved,release=true,conflict=false,hold=false,storageBlocked=false,handoff=false}={}){
  const c=await browser.newContext({reducedMotion:'reduce',viewport:{width:1440,height:1000}}),calls=[],errors=[],releases=[];
  await c.addInitScript(({gpc,dnt,saved,key,storageBlocked})=>{
   if(gpc)Object.defineProperty(navigator,'globalPrivacyControl',{value:true});
   if(dnt)Object.defineProperty(navigator,'doNotTrack',{value:'1'});
   if(saved){try{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(saved));}catch{}}
   if(storageBlocked){Storage.prototype.getItem=()=>{throw Error('Storage unavailable')};Storage.prototype.setItem=()=>{throw Error('Storage unavailable')};}
  },{gpc,dnt,saved,key,storageBlocked});
  const gaSDK=`(()=>{window.google_tag_manager={'G-PS5FNQCJRN':{}};let granted=false;const run=a=>{if(a[0]==='consent')granted=a[2].analytics_storage==='granted';if(a[0]==='event'&&granted&&!window['ga-disable-G-PS5FNQCJRN'])fetch('https://www.google-analytics.com/g/collect?'+new URLSearchParams({event:a[1],payload:JSON.stringify(a[2])}));if(a[0]==='config'){document.cookie='_ga=fixture; path=/; Secure';document.cookie='_ga_PS5FNQCJRN=fixture; path=/; Secure';}};const q=dataLayer;q.forEach(run);q.push=function(a){Array.prototype.push.call(this,a);run(a)};window.__fixtureSDKs=(window.__fixtureSDKs||0)+1;})();`;
  const metaSDK=`(()=>{const child=document.createElement('script');child.src='https://connect.facebook.net/signals/config/806267492040936';document.head.append(child);let granted=false;const f=fbq,run=(...a)=>{if(a[0]==='consent')granted=a[1]==='grant';if(a[0]==='init'&&granted)document.cookie='_fbp=fixture; path=/; Secure';if(['trackSingle','trackSingleCustom'].includes(a[0])&&granted)fetch('https://www.facebook.com/tr?'+new URLSearchParams({pixel:a[1],event:a[2],payload:JSON.stringify(a[3]||{})}));};f.queue.forEach(a=>run(...a));f.callMethod=run;window.__fixtureSDKs=(window.__fixtureSDKs||0)+1;})();`;
  await c.route('**/*',async r=>{
   const req=r.request(),u=new URL(req.url());
   if(u.hostname==='connect.facebook.net'&&u.pathname.startsWith('/signals/config/')){calls.push({kind:'provider-config',url:u.href});return r.fulfill({contentType:'text/javascript',body:'/* Synthetic provider settings, no events. */'});}
   if(u.hostname==='www.googletagmanager.com'||u.hostname==='connect.facebook.net'){
    calls.push({kind:'sdk',url:u.href});
    if(u.pathname==='/gtm.js')return r.fulfill({contentType:'text/javascript',body:'/* Existing injected GTM fixture, not a new installation. */'});
    if(hold)await new Promise(resolve=>releases.push(resolve));
    return r.fulfill({contentType:'text/javascript',body:u.hostname==='connect.facebook.net'?metaSDK:gaSDK});
   }
   if(['www.google-analytics.com','www.facebook.com'].includes(u.hostname)){
    calls.push({kind:'event',provider:u.hostname,event:u.searchParams.get('event'),pixel:u.searchParams.get('pixel'),payload:JSON.parse(u.searchParams.get('payload'))});
    return r.fulfill({status:204});
   }
   if(u.hostname===host&&req.method()==='GET'){
    if(!release&&u.pathname==='/assets/js/measurement-config.js')return r.fulfill({contentType:'text/javascript',body:fs.readFileSync('assets/js/measurement-config.js','utf8').replace('releaseApproved: true','releaseApproved: false')});
    if(handoff&&u.pathname==='/assets/js/heroes-config.js')return r.fulfill({contentType:'text/javascript',body:fs.readFileSync('assets/js/heroes-config.js','utf8').replace('v1: { monthly: null, three: null, six: null }','v1: { monthly: "https://paystack.com/pay/test-fixture-only", three: null, six: null }')});
    const response=await r.fetch({url:base+u.pathname+u.search});
    if(conflict&&u.pathname==='/heroes')return r.fulfill({response,body:(await response.text()).replace('<head>','<head><script async src="https://www.googletagmanager.com/gtm.js?id=GTM-NJ6L82XR"></script>')});
    return r.fulfill({response});
   }
   return r.abort();
  });
  const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
  return{c,p,calls,errors,origin:'https://'+host,release:()=>releases.splice(0).forEach(resolve=>resolve())};
 }
 const settled=()=>new Promise(r=>setTimeout(r,120));
 const sdk=s=>s.calls.filter(x=>x.kind==='sdk');
 const events=(s,event,provider)=>s.calls.filter(x=>x.kind==='event'&&(!event||x.event===event)&&(!provider||x.provider===provider));
 const grant=async(s,a=true,m=true)=>{
  if(!await s.p.locator('.measurement-choice').isVisible())await s.p.locator('[data-measurement-settings]').click();
  await s.p.getByRole('checkbox',{name:'Allow analytics',exact:true}).setChecked(a);
  await s.p.getByRole('checkbox',{name:'Allow advertising measurement',exact:true}).setChecked(m);
  await s.p.getByRole('button',{name:'Save my choices',exact:true}).click();await settled();
 };
 const click=async(s,selector)=>s.p.locator(selector).first().evaluate(e=>{e.addEventListener('click',event=>event.preventDefault(),{once:true});e.click();});
 const done=async(s,name)=>{await settled();assert.deepEqual(s.errors,[],name);assert.doesNotMatch(JSON.stringify(s.calls),/must-not-leak|FAKE_REFERENCE|Purchase|qualified_lead|revenue|customer_email/);scenarios.push(name);evidence.push({scenario:name,calls:s.calls});await s.c.close();};
 const both={analytics:true,marketing:true,version:config.consentVersion};
 assert.equal(config.releaseApproved,true);assert.equal(config.ga4,'G-PS5FNQCJRN');assert.equal(config.metaPixel,'806267492040936');
 for(const opts of [{release:false},{gpc:true,saved:both},{dnt:true,saved:both},{host:'deploy-preview-6--webtellisense.netlify.app',saved:both},{host:'127.0.0.1',saved:both}]){
  const s=await session(opts);await s.p.goto(s.origin+'/heroes');await settled();assert.equal(s.calls.length,0);await done(s,'No providers: '+JSON.stringify(opts));
 }
 let s=await session();await s.p.goto(s.origin+'/heroes?email=must-not-leak@example.invalid#private');assert.equal(s.calls.length,0);
 await s.p.evaluate(()=>WTSMeasurement.track('heroes_tier_select',{tier:'v3'}));
 await s.p.getByRole('button',{name:'Keep optional tracking off',exact:true}).click();await s.p.reload();assert.equal(s.calls.length,0);
 assert.equal(await s.p.locator('.measurement-choice').isVisible(),false);await done(s,'Reject persists; no pre-consent events replay');
 for(const [a,m,label]of[[true,false,'Analytics only'],[false,true,'Meta only'],[true,true,'Both destinations']]){
  s=await session();await s.p.goto(s.origin+'/heroes?email=must-not-leak@example.invalid#private');await grant(s,a,m);
  assert.equal(sdk(s).length,Number(a)+Number(m));assert.equal(events(s,'page_view').length,Number(a));assert.equal(events(s,'PageView').length,Number(m));
  assert.equal(new URL(s.p.url()).search,'');assert.equal(new URL(s.p.url()).hash,'');
  if(a){const commands=await s.p.evaluate(()=>dataLayer.filter(a=>a[0]==='config').map(a=>Array.from(a)));assert.equal(commands.length,1);assert.equal(commands[0][1],config.ga4);assert.equal(commands[0][2].send_page_view,false);}
  if(m){const commands=await s.p.evaluate(()=>fbq.queue.map(a=>Array.from(a)));assert.deepEqual(commands.filter(a=>a[0]==='init'),[['init',config.metaPixel]]);assert.ok(commands.some(a=>a[0]==='set'&&a[1]==='autoConfig'&&a[2]===false));}
  assert.ok(!sdk(s).some(x=>x.url.includes('/gtm.js')));await done(s,label+'; one page view, exact IDs and URL minimization');
 }
 s=await session();await s.p.goto(s.origin+'/heroes');await grant(s);
 await s.p.setViewportSize({width:390,height:1000});await s.p.selectOption('#scope-tier-choice','v2');
 await s.p.locator('[data-view-tier="v3"]').click();await s.p.locator('input[name="billing-view"][value="three"]').check();
 await click(s,'.hero-text-link');await click(s,'a[href^="tel:"]');await click(s,'.finale-actions a[href^="mailto:"]');
 await settled();
 for(const [name,count] of [['heroes_tier_select',4],['heroes_period_select',2],['heroes_talk_to_sales',4],['heroes_call_click',2],['heroes_whatsapp_click',2]])assert.equal(events(s,name).length,count,name+' emits once per interaction per consented destination');
 await s.p.evaluate(()=>{WTSMeasurement.track('Purchase',{value:350000});WTSMeasurement.track('Lead',{customer_email:'must-not-leak@example.invalid'});WTSMeasurement.track('heroes_tier_select',{tier:'v1',period:'six',customer_email:'must-not-leak@example.invalid',reference:'FAKE_REFERENCE',url:location.href});});
 await settled();
 for(const event of ['heroes_period_select','heroes_tier_select','heroes_talk_to_sales','heroes_call_click','heroes_whatsapp_click'])assert.ok(events(s,event).length>=2,event+' reaches consented synthetic GA + Meta');
 for(const e of events(s)){for(const field of Object.keys(e.payload))assert.ok(['page_path','page_location','page_referrer','tier','period','channel'].includes(field),field);}
 const views=events(s,'page_view').length+events(s,'PageView').length;
 await s.p.addScriptTag({path:'assets/js/measurement.js'});await grant(s);assert.equal(sdk(s).length,2);assert.equal(events(s,'page_view').length+events(s,'PageView').length,views,'No duplicate when saving twice or executing module twice');
 const other=await s.c.newPage();await other.goto(s.origin+'/heroes');await settled();
 assert.equal(events(s,'page_view').length,2);assert.equal(events(s,'PageView').length,2,'One view per new document');
 await s.p.locator('[data-measurement-settings]').click();await s.p.getByRole('button',{name:'Keep optional tracking off',exact:true}).click();await settled();
 const count=events(s).length;
 await other.evaluate(()=>WTSMeasurement.track('heroes_call_click',{channel:'call'}));await click(s,'a[href^="tel:"]');await settled();assert.equal(events(s).length,count,'Withdrawal propagates to another open tab');
 assert.equal(await s.p.evaluate(()=>window['ga-disable-G-PS5FNQCJRN']),true);
 assert.deepEqual((await s.c.cookies()).filter(c=>['_ga','_ga_PS5FNQCJRN','_fbp','_fbc'].includes(c.name)),[]);
 await grant(s);assert.equal(events(s,'page_view').length,2);assert.equal(events(s,'PageView').length,2,'Regrant does not duplicate views already sent');
 await done(s,'Genuine controls, sanitized custom events, dedupe, withdrawal/cookie cleanup and cross-tab synchronization');
 s=await session({hold:true});await s.p.goto(s.origin+'/heroes');await grant(s);
 await s.p.evaluate(()=>WTSMeasurement.track('heroes_tier_select',{tier:'v2'}));
 await s.p.locator('[data-measurement-settings]').click();await s.p.getByRole('button',{name:'Keep optional tracking off',exact:true}).click();s.release();
 await s.p.waitForFunction(()=>window.__fixtureSDKs===2);await settled();assert.equal(events(s).length,0,'No late views/events after withdrawal during SDK loading');
 assert.deepEqual((await s.c.cookies()).filter(c=>['_ga','_ga_PS5FNQCJRN','_fbp'].includes(c.name)),[]);
 await grant(s);assert.equal(events(s,'page_view').length,1);assert.equal(events(s,'PageView').length,1,'Regrant sends a previously unsent view once');await done(s,'Withdrawal during SDK loading, cleared queues and regrant');
 s=await session();await s.p.goto(s.origin+'/heroes');await grant(s);await grant(s,true,false);
 const metaCount=events(s,null,'www.facebook.com').length;
 await s.p.locator('input[name="billing-view"][value="six"]').check();await settled();assert.equal(events(s,null,'www.facebook.com').length,metaCount);assert.equal(events(s,'heroes_period_select','www.google-analytics.com').length,1);await done(s,'Separate consent and partial withdrawal');
 s=await session({saved:{...both,version:'review-1'}});await s.p.goto(s.origin+'/heroes');assert.equal(s.calls.length,0);assert.equal(await s.p.locator('.measurement-choice').isVisible(),true);await done(s,'Previous review consent is not reused for newly confirmed destinations');
 s=await session({storageBlocked:true});await s.p.goto(s.origin+'/heroes');assert.equal(s.calls.length,0);await grant(s);assert.equal(events(s,'page_view').length,1);await s.p.reload();assert.equal(await s.p.locator('.measurement-choice').isVisible(),true);await done(s,'Blocked storage fails closed; opt-in works for the current document');
 s=await session({conflict:true});await s.p.goto(s.origin+'/heroes');assert.equal(sdk(s).length,1);assert.ok(sdk(s)[0].url.includes('/gtm.js'));await s.p.locator('[data-measurement-settings]').click();assert.equal(await s.p.getByRole('checkbox',{name:'Allow analytics',exact:true}).isDisabled(),true);await done(s,'Pre-existing GTM blocks an additional direct installation');
 s=await session({saved:both});await s.p.goto(s.origin+'/heroes',{referer:'https://webtellisense.com/?email=must-not-leak@example.invalid'});await settled();assert.equal(events(s,'page_view').length,1);assert.equal(sdk(s).length,1);assert.equal(events(s,'PageView').length,0);await done(s,'Sensitive incoming referrer suppresses Meta, GA referrer remains empty');
 s=await session({saved:both});await s.p.goto(s.origin+'/heroes-start.html?tier=v2&period=three&reference=FAKE_REFERENCE');await settled();assert.equal(sdk(s).length,2);assert.equal(events(s).length,0,'Public selection has no automatic page views');
 assert.equal(await s.p.locator('#heroes-tier').inputValue(),'v2');await s.p.selectOption('#heroes-tier','v3');await s.p.selectOption('#heroes-period','six');await settled();assert.equal(events(s,'heroes_tier_select').length,2);assert.equal(events(s,'heroes_period_select').length,2);
 assert.equal(await s.p.locator('#paystack-link').getAttribute('href'),null);await s.p.locator('#paystack-link').evaluate(e=>e.click());assert.equal(events(s,'heroes_paystack_handoff').length,0);await done(s,'Public payment selection: consented events only, no PageView, no unconfigured handoff');
 s=await session({saved:both,handoff:true});await s.p.goto(s.origin+'/heroes-start.html?tier=v1&period=monthly');await settled();await click(s,'#paystack-link');await settled();assert.equal(events(s,'heroes_paystack_handoff').length,2);assert.equal(events(s,'page_view').length+events(s,'PageView').length,0);await done(s,'Synthetic configured handoff is a custom click only; no Paystack navigation');
 for(const path of ['/heroes-welcome.html?verified=true&reference=FAKE_REFERENCE','/heroes-profile-received','/welcome.html?reference=FAKE_REFERENCE','/industries','/education-marketing','/privacy-policy','/service-terms']){
  s=await session({saved:both});await s.p.goto(s.origin+path);await settled();assert.equal(s.calls.length,0,path);if(path==='/privacy-policy'){await s.p.locator('[data-measurement-settings]').click();await s.p.getByRole('button',{name:'Keep optional tracking off',exact:true}).click();assert.equal(await s.p.evaluate(key=>JSON.parse(localStorage.getItem(key)).analytics,key),false);}await done(s,'Excluded provider page: '+path.split('?')[0]);
 }
 s=await session();await s.c.addCookies([{name:'_ga',value:'existing-legacy-cookie',domain:'webtellisense.com',path:'/',secure:true}]);await s.p.goto(s.origin+'/industries');assert.equal((await s.c.cookies()).find(c=>c.name==='_ga')?.value,'existing-legacy-cookie','Inactive pages preserve existing legacy measurement state');assert.equal(s.calls.length,0);await done(s,'Inactive pages do not clear unrelated legacy cookies on arrival');
 s=await session();await s.p.goto(s.origin+'/heroes');await s.p.locator('[data-measurement-settings]').focus();await s.p.keyboard.press('Enter');if(!await s.p.locator('.measurement-choice').isVisible())await s.p.keyboard.press('Enter');assert.equal(await s.p.getByRole('button',{name:'Keep optional tracking off',exact:true}).evaluate(e=>e===document.activeElement),true);await s.p.addScriptTag({path:require.resolve('axe-core/axe.min.js')});for(const width of [1440,390]){await s.p.setViewportSize({width,height:1000});const violations=await s.p.evaluate(async()=>(await axe.run('.measurement-choice',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>v.id));assert.deepEqual(violations,[]);assert.equal(await s.p.getByRole('checkbox',{name:'Allow analytics',exact:true}).evaluate(e=>getComputedStyle(e).width),'20px');accessibility.push({width,violations});}await s.p.keyboard.press('Escape');assert.equal(await s.p.locator('[data-measurement-settings]').evaluate(e=>e===document.activeElement),true);await done(s,'Preference controls: keyboard access, Escape and focus return');
 await browser.close();
 fs.writeFileSync('docs/heroes-analytics-browser-validation.json',JSON.stringify({method:'Actual release config, HTTPS production-origin fixture mapped to the local static build; synthetic GA/Meta SDKs and network collectors only. No real provider delivery, transaction or production deployment.',scenarios,accessibility,evidence},null,2)+'\n');console.log(`Passed ${scenarios.length} consent/network scenarios with actual release config and synthetic transports only.`);
})().catch(e=>{console.error(e);process.exit(1)});
