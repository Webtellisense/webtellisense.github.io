// Presentation-specific regression tests. Requests to providers and all writes are blocked.
const{chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
const origin=process.env.HEROES_TEST_ORIGIN||'http://127.0.0.1:8791';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 await context.route('**/*',r=>new URL(r.request().url()).origin===origin&&r.request().method()==='GET'?r.continue():r.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();await page.goto(origin+'/heroes');
 const visible=page.locator('[data-activity-message]:not([hidden])');
 const type=()=>visible.locator('.message-type').innerText();
 await page.mouse.move(0,0);await page.waitForTimeout(100);
 assert.equal(await visible.count(),1);const types=[await type()];
 for(let i=0;i<5;i++){await page.clock.runFor(6000);types.push(await type());assert.equal(await visible.count(),1);}
 assert.deepEqual(types,['New customer enquiry','Consultation request','Quote request','Callback request','Order enquiry','New customer enquiry']);
 await page.locator('[data-activity-demo]').hover();const held=await type();await page.clock.runFor(15000);assert.equal(await type(),held,'Hover pauses');
 await page.mouse.move(0,0);await page.locator('[data-activity-next]').focus();await page.clock.runFor(15000);assert.equal(await type(),held,'Keyboard focus pauses');
 await page.locator('[data-activity-next]').click();assert.notEqual(await type(),held);assert.equal(await page.locator('[data-activity-pause]').innerText(),'Play demo');
 await page.locator('[data-activity-next]').blur();await page.mouse.move(0,0);const manual=await type();await page.clock.runFor(15000);assert.equal(await type(),manual,'Manual control pauses');
 await page.emulateMedia({reducedMotion:'reduce'});await page.clock.runFor(15000);assert.equal(await type(),manual);assert.equal(await page.locator('[data-activity-pause]').isDisabled(),true);
 assert.equal(await visible.evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.locator('[data-activity-next]').click();assert.notEqual(await type(),manual,'Manual next works with reduced motion');
 await page.goto(origin+'/education-marketing');
 assert.equal(await page.locator('[data-school-panel]:not([hidden])').count(),1);
 for(let i=0;i<5;i++){await page.locator('[data-school-view]').nth(i).click();assert.equal(await page.locator('[data-school-view]').nth(i).getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-school-panel]').nth(i).isVisible(),true);assert.equal(await page.locator('[data-school-panel]:not([hidden])').count(),1);}
 assert.equal(await page.locator('[data-school-journey] input,[data-school-journey] form').count(),0,'Concepts collect no data');
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});await page.reload();
  const toggle=page.locator('.chrome-menu');if(width===390){await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');}
  await page.locator('[data-mega] summary').first().focus();await page.keyboard.press('Enter');assert.equal(await page.locator('[data-mega]').first().getAttribute('open'),'');
  assert.equal(await page.locator('.primary-navigation>a[href="/packages"]').isVisible(),true);
  await page.keyboard.press('Escape');assert.equal(await page.locator('[data-mega][open]').count(),0);
  if(width===390){assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.equal(await toggle.evaluate(e=>e===document.activeElement),true);}
 }
 await context.close();
 const reduced=await browser.newContext({reducedMotion:'reduce'});await reduced.route('**/*',r=>new URL(r.request().url()).origin===origin&&r.request().method()==='GET'?r.continue():r.abort());
 const check=await reduced.newPage(),layouts=[];
 for(const route of ['heroes','industries','education-marketing','solar-and-home-services-marketing','home-technical-services-marketing','retail-specialty-store-marketing','food-supplier-marketing','construction-property-marketing','']){
  await check.goto(origin+'/'+route);await check.evaluate(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.allSettled([...document.images].map(i=>i.decode()));});
  for(const width of [320,390,768,1440]){await check.setViewportSize({width,height:1000});assert.equal(await check.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' '+width);}
  assert.deepEqual(await check.evaluate(()=>[...document.images].filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src'))),[],route+' loaded images');layouts.push(route||'index');
 }
 await check.goto(origin+'/industries');assert.equal(await check.locator('.sector-photo').count(),8);
 await reduced.close();
 const plain=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:1000}});await plain.route('**/*',r=>new URL(r.request().url()).origin===origin&&r.request().method()==='GET'?r.continue():r.abort());const nojs=await plain.newPage();
 await nojs.goto(origin+'/heroes');assert.equal(await nojs.locator('[data-activity-message]:not([hidden])').count(),1);assert.equal(await nojs.locator('.activity-toolbar').isVisible(),false);assert.equal(await nojs.locator('.stage-gallery li').count(),4);
 await nojs.goto(origin+'/education-marketing');assert.equal(await nojs.locator('[data-school-panel]:visible').count(),5);assert.equal(await nojs.locator('[data-site-header] nav').isVisible(),true);await nojs.locator('[data-mega] summary').first().click();assert.equal(await nojs.locator('.primary-navigation>a[href="/packages"]').isVisible(),true);
 for(const route of layouts){await nojs.goto(origin+'/'+(route==='index'?'':route));assert.equal(await nojs.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No-JS '+route);assert.equal(await nojs.locator('h1').isVisible(),true,route);}
 await nojs.goto(origin+'/');assert.equal(await nojs.locator('[data-aos]').first().evaluate(e=>getComputedStyle(e).opacity),'1','Homepage content readable without AOS/JavaScript');
 assert.deepEqual(errors,[]);await browser.close();
 fs.writeFileSync('docs/design-led-browser-validation.json',JSON.stringify({method:'Local Chromium, providers/writes blocked; functional, responsive and no-JavaScript presentation checks. No provider verification.',activity:{types,oneAtATime:true,hoverAndFocusPause:true,manualPause:true,reducedMotion:true},school:{fiveSteps:true,noDataCollection:true,noJavaScriptAllPanels:true},navigation:{desktopAndMobileKeyboard:true,noJavaScriptNativeDisclosures:true},layouts,widths:[320,390,768,1440],errors},null,2)+'\n');console.log('Passed activity sequencing/pause/reduced motion, school journey, keyboard/mobile navigation, 9-page image/reflow and no-JavaScript checks.');
})().catch(e=>{console.error(e);process.exit(1)});
