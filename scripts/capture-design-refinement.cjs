// Genuine local browser captures; no provider requests, writes, or production access.
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const routes=['heroes','industries','education-marketing','solar-and-home-services-marketing','home-technical-services-marketing','retail-specialty-store-marketing','food-supplier-marketing','construction-property-marketing','index'];
const origins={before:process.env.DESIGN_BEFORE_ORIGIN||'http://127.0.0.1:8792',after:process.env.HEROES_TEST_ORIGIN||'http://127.0.0.1:8791'};
const selectedRoutes=process.env.DESIGN_CAPTURE_ROUTES?routes.filter(r=>process.env.DESIGN_CAPTURE_ROUTES.split(',').includes(r)):routes;
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const context=await browser.newContext({reducedMotion:'reduce'});
 await context.route('**/*',r=>Object.values(origins).includes(new URL(r.request().url()).origin)&&r.request().method()==='GET'?r.continue():r.abort());
 const page=await context.newPage(),captures=[];
 async function settle(){
  await page.evaluate(async()=>{
   await document.fonts.ready;
   document.querySelectorAll('img').forEach(i=>i.loading='eager');
   await Promise.allSettled([...document.images].map(i=>i.decode()));
   window.bootstrap?.Carousel.getInstance(document.querySelector('#hero-carousel'))?.pause();
  });
  // Real scrolling triggers existing AOS/reveal and lazy-loaded content before full-page capture.
  for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=750){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(65);}
  await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(250);
 }
 for(const [phase,origin] of Object.entries(origins).filter(([phase])=>!process.env.DESIGN_CAPTURE_PHASE||process.env.DESIGN_CAPTURE_PHASE===phase)){
  const dir=path.join('docs/design-led-previews',phase);fs.mkdirSync(dir,{recursive:true});
  for(const route of selectedRoutes)for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   const response=await page.goto(origin+'/'+(route==='index'?'':route),{waitUntil:'load'});
   if(response.status()!==200)throw Error(`${phase} ${route}: ${response.status()}`);
   await settle();
   const file=path.join(dir,`${route}-${width}.jpg`);await page.screenshot({path:file,fullPage:true,quality:88,animations:'disabled'});
   captures.push({phase,route,width,height:1000,file,status:response.status(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
   if(['heroes','index'].includes(route))await page.screenshot({path:path.join(dir,`${route}-opening-${width}.jpg`),quality:90,animations:'disabled'});
   if(phase==='after'&&route==='education-marketing'){
    for(const [index,name]of [[2,'school-content'],[3,'school-enquiry'],[4,'school-admissions']]){
     await page.locator('[data-school-view]').nth(index).click();
     await page.locator('[data-school-journey]').screenshot({path:path.join(dir,`${name}-${width}.jpg`),quality:88,animations:'disabled'});
    }
   }
   if(phase==='after'&&route==='index'){
    const sector=page.locator('#industries');const height=Math.ceil(await sector.evaluate(e=>e.getBoundingClientRect().height))+200;
    await page.setViewportSize({width,height});await sector.evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-110));
    await sector.screenshot({path:path.join(dir,`homepage-industries-${width}.jpg`),quality:88,animations:'disabled'});
   }
  }
 }
 const manifest='docs/design-led-previews/captures.json';
 const prior=(process.env.DESIGN_CAPTURE_PHASE||process.env.DESIGN_CAPTURE_ROUTES)&&fs.existsSync(manifest)?JSON.parse(fs.readFileSync(manifest)).captures:[];
 const combined=prior.filter(old=>!captures.some(r=>r.phase===old.phase&&r.route===old.route&&r.width===old.width)).concat(captures);
 fs.writeFileSync(manifest,JSON.stringify({baselineCommit:'7e33d13a98695dade64b361a64b60f1cf3317ee2',method:'Chromium at 1440/390; reduced motion; fonts and image decoding awaited; actual scroll through every page; external providers and non-GET requests blocked. Before server is a git archive of the named commit; after is the current static build. Local captures, not hosted Netlify/provider tests.',captures:combined},null,2)+'\n');
 await browser.close();console.log(`Captured ${captures.length} before/after full-page images plus opening/interactive details.`);
})().catch(e=>{console.error(e);process.exit(1)});
