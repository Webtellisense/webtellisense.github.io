const{chromium}=require('playwright');const fs=require('node:fs');const path=require('node:path');
const origins={before:'http://127.0.0.1:8792',after:'http://127.0.0.1:8791'},routes=['index','web-design','education-marketing','about','contact'];
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const ctx=await browser.newContext({reducedMotion:'reduce'});await ctx.route('**/*',r=>Object.values(origins).includes(new URL(r.request().url()).origin)&&r.request().method()==='GET'?r.continue():r.abort());const page=await ctx.newPage(),evidence=[];
 async function settle(){await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.allSettled([...document.images].map(i=>i.decode()));window.bootstrap?.Carousel.getInstance(document.querySelector('#hero-carousel'))?.pause();});for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=800){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(65);}await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);}
 for(const[phase,origin]of Object.entries(origins)){
  if(process.env.CAPTURE_PHASE&&phase!==process.env.CAPTURE_PHASE)continue;
  const dir=`docs/experience-previews/${phase}`;fs.mkdirSync(dir,{recursive:true});
  for(const route of routes)for(const width of[1440,390]){
   await page.setViewportSize({width,height:1000});await page.goto(origin+'/'+(route==='index'?'':route));await settle();
   const file=path.join(dir,`${route}-${width}.jpg`);await page.screenshot({path:file,fullPage:true,quality:85,animations:'disabled'});evidence.push({phase,route,width,file});
   if(route==='index'){
    await page.screenshot({path:path.join(dir,`homepage-opening-${width}.jpg`),quality:88,animations:'disabled'});
    for(const[id,name]of [['portfolio','portfolio'],['reviews','testimonials'],['footer','footer']]){
     const el=page.locator('#'+id);const height=Math.ceil(await el.evaluate(e=>e.getBoundingClientRect().height))+220;await page.setViewportSize({width,height});await el.evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-110));await el.screenshot({path:path.join(dir,`${name}-${width}.jpg`),quality:85,animations:'disabled'});
    }
    if(phase==='after'){
     const reviews=page.locator('[data-review-marquee]');const height=Math.ceil(await reviews.evaluate(e=>e.getBoundingClientRect().height))+220;
     await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'no-preference'});await reviews.evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-110));await page.mouse.move(0,0);await page.locator('h1').evaluate(e=>{e.tabIndex=-1;e.focus({preventScroll:true});});await page.waitForTimeout(1300);
     await reviews.screenshot({path:path.join(dir,`testimonials-motion-${width}.jpg`),quality:85});await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
    }
    await page.setViewportSize({width,height:1000});await page.evaluate(()=>scrollTo(0,0));
    if(width===390)await page.locator(phase==='after'?'.chrome-menu':'.design-menu-toggle').click();
    for(const[selector,name]of phase==='after'?[['[data-mega="services"]','services'],['[data-mega="industries"]','industries']]:[['.nav-disclosure:nth-of-type(1)','services'],['.nav-disclosure:nth-of-type(2)','industries']]){
     await page.locator(selector).evaluate(e=>e.open=true);await page.waitForTimeout(70);await page.screenshot({path:path.join(dir,`navigation-${name}-${width}.jpg`),quality:88,animations:'disabled'});await page.locator(selector).evaluate(e=>e.open=false);
    }
   }
  }
 }
 const manifest='docs/experience-previews/captures.json',prior=process.env.CAPTURE_PHASE&&fs.existsSync(manifest)?JSON.parse(fs.readFileSync(manifest)).captures:[];
 fs.writeFileSync(manifest,JSON.stringify({baseline:'118ece7986c552f5e2b0f3e7885ca1801ce70a2e',method:'Actual Chromium local renders, 1440/390 width, fonts/images decoded and full pages scrolled. Providers and non-GET requests blocked. Reduced motion for stable captures; animation tested separately. Detail viewport height expands to fit the complete section. No hosted/provider test inferred.',captures:prior.filter(x=>!evidence.some(e=>e.phase===x.phase&&e.route===x.route&&e.width===x.width)).concat(evidence)},null,2)+'\n');
 await browser.close();console.log(`Captured ${evidence.length} full pages and requested navigation/footer/gallery/review details.`);
})().catch(e=>{console.error(e);process.exit(1)});
