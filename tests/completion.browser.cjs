// Fresh all-page scan and new-journey controls. External requests and writes never reach providers.
const {chromium}=require('playwright');
const fs=require('node:fs');const assert=require('node:assert/strict');
const base=process.env.HEROES_TEST_ORIGIN||'http://127.0.0.1:8791';
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 let externalBlocked=0;
 await context.route('**/*',r=>{if(new URL(r.request().url()).origin===base&&r.request().method()==='GET')return r.continue();externalBlocked++;return r.abort();});
 const matrix=JSON.parse(fs.readFileSync('docs/completion-page-matrix.json'));const results=[];
 for(const row of matrix.pages){
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(base+'/'+row.page,{waitUntil:'load'});assert.equal(response.status(),200,row.page);
  const views=[];
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});views.push(await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth})));}
  // Reveal once with reduced motion and allow lazy images into the current viewport.
  await page.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
  await page.setViewportSize({width:390,height:900});
  let axe=[];const cssBlocked=['nigeria/solar.html','bahamas/solar.html'].includes(row.page);
  if(!cssBlocked){await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});axe=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});}
  const metrics=await page.evaluate(()=>({htmlBytes:new TextEncoder().encode(document.documentElement.outerHTML).length,localResourceBytes:performance.getEntriesByType('resource').filter(r=>r.name.startsWith(location.origin)).reduce((n,r)=>n+r.transferSize,0),brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth&&!/^https?:/.test(i.getAttribute('src')||'')).map(i=>i.getAttribute('src')),forms:[...document.forms].map(f=>({name:f.name,action:f.getAttribute('action'),hasPrivacyLink:!!f.querySelector('a[href^="/privacy-policy"]')}))}));
  results.push({page:row.page,status:response.status(),errors,views,axe,cssBlocked,metrics});await page.close();
 }
 const page=await context.newPage();
 await page.goto(base+'/heroes');
 await page.locator('[data-carousel-track]').focus();await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>document.querySelector('[data-carousel-status]').textContent==='2 / 4');
 assert.equal(await page.locator('[data-carousel-play]').isVisible(),false,'Reduced motion hides optional slideshow');
 assert.equal(await page.locator('[data-activity-message]:not([hidden])').evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.reload();
 await page.locator('[data-carousel-play]').scrollIntoViewIfNeeded();
 await page.clock.install();await page.locator('[data-carousel-play]').click();
 await page.mouse.move(0,0);await page.locator('h1').evaluate(el=>{el.tabIndex=-1;el.focus({preventScroll:true});});
 await page.clock.runFor(9500);await page.waitForFunction(()=>document.querySelector('[data-carousel-status]').textContent==='2 / 4');
 await page.locator('[data-carousel-track]').hover();await page.clock.runFor(18000);assert.equal(await page.locator('[data-carousel-status]').innerText(),'2 / 4','Hover pauses slideshow');
 await page.locator('[data-carousel-next]').focus();await page.clock.runFor(18000);assert.equal(await page.locator('[data-carousel-status]').innerText(),'2 / 4','Focus pauses slideshow');
 await page.locator('[data-carousel-next]').click();assert.equal(await page.locator('[data-carousel-play]').getAttribute('aria-pressed'),'false','Manual action stops slideshow');
 await page.emulateMedia({reducedMotion:'reduce'});
 const screenshots=['heroes','heroes-start.html','industries','education-marketing','home-technical-services-marketing','retail-specialty-store-marketing','food-supplier-marketing','privacy-policy'];
 fs.mkdirSync('docs/completion-previews',{recursive:true});
 for(const route of screenshots){await page.goto(base+'/'+route);await page.evaluate(()=>document.querySelectorAll('.is-waiting').forEach(e=>e.classList.remove('is-waiting')));for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await page.screenshot({path:`docs/completion-previews/${route.replace('.html','')}-${width}.png`,fullPage:true,animations:'disabled'});if(route==='heroes')await page.screenshot({path:`docs/completion-previews/heroes-fold-${width}.png`,animations:'disabled'});}}
 const basic=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});await basic.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());const plain=await basic.newPage();
 for(const route of ['heroes','heroes-start.html','heroes-welcome.html','industries','education-marketing','privacy-policy']){await plain.goto(base+'/'+route);assert.equal(await plain.locator('h1').isVisible(),true,route);assert.equal(await plain.locator('a[href^="/privacy-policy"]').count()>0,true,route);assert.equal(await plain.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route);}
 await plain.goto(base+'/heroes');assert.equal(await plain.locator('[data-tier][data-period]').count(),9);assert.equal(await plain.locator('[data-carousel-track] figure').count(),4);await basic.close();
 const totals={pages:results.length,pageErrors:results.reduce((n,r)=>n+r.errors.length,0),localBrokenImages:results.reduce((n,r)=>n+r.metrics.brokenImages.length,0),axeNodes:results.reduce((n,r)=>n+r.axe.reduce((a,v)=>a+v.nodes.length,0),0),externalBlocked,providerSubmissions:0};
 fs.writeFileSync('docs/completion-browser-validation.json',JSON.stringify({method:'Local Chromium; providers/writes blocked. Layout at 320/390/768/1440; WCAG axe run with disclosures open. Not Lighthouse, legal certification or provider delivery validation.',totals,pages:results},null,2)+'\n');
 console.log(JSON.stringify(totals));console.log(JSON.stringify(results.filter(r=>r.errors.length||r.views.some(v=>v.overflow)||r.axe.length).map(r=>({page:r.page,errors:r.errors,overflow:r.views.filter(v=>v.overflow),axe:r.axe.map(v=>({id:v.id,count:v.nodes.length}))})),null,2));
 assert.equal(totals.pageErrors,0);assert.equal(totals.localBrokenImages,0);
 for(const r of results.filter(r=>!r.cssBlocked))assert.ok(r.views.every(v=>!v.overflow),'Overflow '+r.page);
 for(const r of results.filter(r=>/^(heroes|industries|education-marketing|solar-and-home-services-marketing|construction-property-marketing|home-technical-services-marketing|retail-specialty-store-marketing|food-supplier-marketing|privacy-policy|service-terms)/.test(r.page)))assert.deepEqual(r.axe,[],r.page);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
