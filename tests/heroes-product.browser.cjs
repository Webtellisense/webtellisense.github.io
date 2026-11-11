// Local presentation/regression tests. No provider, analytics, form or payment writes.
const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const origin=process.env.HEROES_TEST_ORIGIN||'http://127.0.0.1:8795';
(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  const context=await browser.newContext({reducedMotion:'reduce'});
  let blocked=0;const errors=[],missing=[];
  await context.route('**/*',r=>{
    if(new URL(r.request().url()).origin===origin&&r.request().method()==='GET')return r.continue();
    blocked++;return r.abort();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)missing.push({url:r.url(),status:r.status()});});
  await page.goto(origin+'/heroes');
  await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.allSettled([...document.images].map(i=>i.decode()));});
  const layouts=[];
  for(const width of [320,360,390,768,1024,1440]){
    await page.setViewportSize({width,height:1000});
    await page.waitForFunction(width=>document.querySelectorAll('[data-scope-tier]:not([hidden])').length===(width<=760?1:3),width);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow ${width}`);
    assert.equal(await page.locator('[data-scope-tier]:visible').count(),width<=760?1:3);
    layouts.push({width,overflow:false,visibleTiers:width<=760?1:3});
  }
  await page.setViewportSize({width:390,height:1000});
  const choice=page.locator('#scope-tier-choice');await choice.waitFor({state:'visible'});await choice.focus();
  assert.equal(await choice.evaluate(e=>e===document.activeElement),true,'Keyboard input reaches the exposed mobile selector');
  await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
  assert.equal(await choice.inputValue(),'v2','Native selector is keyboard operable');
  assert.equal(await page.locator('[data-scope-tier]:visible h3').innerText(),'Growth');
  assert.equal(await page.locator('[data-scope-tier]:visible').innerText().then(s=>s.includes('₦300,000')),true);
  await page.selectOption('#scope-tier-choice','v3');assert.equal(await page.locator('[data-scope-tier]:visible h3').innerText(),'Complete');
  await page.locator('[data-scope-tier="v3"] .scope-price-link').click();assert.equal(new URL(page.url()).hash,'#plans');
  // The specification selector does not change the approved billing controls.
  assert.equal(await page.locator('input[name="billing-view"]:checked').inputValue(),'monthly');
  assert.equal(await page.locator('[data-view-tier][aria-pressed="true"]').getAttribute('data-view-tier'),'v1');
  await page.setViewportSize({width:1440,height:1000});assert.equal(await page.locator('[data-scope-tier]:visible').count(),3);
  await page.setViewportSize({width:390,height:1000});assert.equal(await choice.inputValue(),'v3');
  assert.equal(await page.locator('[data-scope-tier]:visible').getAttribute('data-scope-tier'),'v3','Choice survives responsive reflow');
  const disclosures=page.locator('.standard-details details');
  for(let i=0;i<5;i++){
    const summary=disclosures.nth(i).locator('summary');await summary.focus();
    const wasOpen=await disclosures.nth(i).getAttribute('open');await page.keyboard.press('Enter');
    assert.equal(await disclosures.nth(i).getAttribute('open'),wasOpen===null?'':null,'Native keyboard disclosure');
    if(wasOpen!==null){await page.keyboard.press('Enter');}
    assert.equal(await disclosures.nth(i).locator('p').isVisible(),true);
  }
  await choice.focus();assert.notEqual(await choice.evaluate(e=>getComputedStyle(e).outlineStyle),'none');
  assert.equal(await page.locator('#scope-planning-note').isVisible(),true);
  assert.equal(await page.locator('[data-activity-message]:not([hidden])').count(),1);
  assert.equal(await page.locator('[data-activity-message]:not([hidden])').evaluate(e=>getComputedStyle(e).animationName),'none');
  const current=await page.locator('[data-activity-message]:not([hidden]) .message-type').innerText();
  await page.waitForTimeout(6200);assert.equal(await page.locator('[data-activity-message]:not([hidden]) .message-type').innerText(),current,'Reduced motion does not cycle');
  await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const accessibility=[];
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:1000});
    const violations=await page.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)})));
    assert.deepEqual(violations,[],`${width} WCAG automated scan`);accessibility.push({width,violations});
  }
  assert.deepEqual(await page.evaluate(()=>[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)),[]);
  await context.close();
  const plain=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:1000}});
  await plain.route('**/*',r=>new URL(r.request().url()).origin===origin&&r.request().method()==='GET'?r.continue():r.abort());
  const nojs=await plain.newPage();await nojs.goto(origin+'/heroes');
  assert.equal(await nojs.locator('[data-scope-tier]:visible').count(),3);
  assert.equal(await nojs.locator('[data-scope-picker]').isVisible(),false);
  assert.equal(await nojs.locator('.care-number:visible').count(),8);
  assert.equal(await nojs.locator('#scope-planning-note').isVisible(),true);
  assert.equal(await nojs.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await nojs.locator('.standard-details details').nth(4).locator('summary').click();
  assert.equal(await nojs.locator('.standard-details details').nth(4).locator('p').isVisible(),true);
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  await browser.close();
  fs.writeFileSync('docs/heroes-product-browser-validation.json',JSON.stringify({method:'Local Chromium; external transports and writes blocked. Not Paystack, Netlify or analytics account validation.',layouts,keyboard:{nativeTierSelection:true,disclosures:true,visibleFocus:true},responsiveChoicePreserved:true,billingControlsIndependent:true,noJavaScript:{allThreeTiers:true,eightResponsibilities:true,nativeDisclosures:true,scopeNoteVisible:true},reducedMotion:true,accessibility,errors,missing,blockedRequests:blocked},null,2)+'\n');
  console.log('Passed six-width reflow, tier selection/reflow, keyboard disclosures/focus, no-JS, reduced motion, loaded assets and desktop/mobile axe.');
})().catch(e=>{console.error(e);process.exit(1)});
