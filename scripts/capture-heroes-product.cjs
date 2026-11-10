// Read-only local captures, with third-party requests and every write blocked.
const {chromium}=require('playwright');
const fs=require('node:fs');
const origins={before:process.env.PRODUCT_BEFORE_ORIGIN||'http://127.0.0.1:8794',after:process.env.HEROES_TEST_ORIGIN||'http://127.0.0.1:8795'};
(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  const context=await browser.newContext({reducedMotion:'reduce'});
  await context.route('**/*',r=>Object.values(origins).includes(new URL(r.request().url()).origin)&&r.request().method()==='GET'?r.continue():r.abort());
  const page=await context.newPage(), captures=[];
  for(const [phase,origin] of Object.entries(origins))for(const width of [1440,390]){
    await page.setViewportSize({width,height:1000});
    const response=await page.goto(origin+'/heroes');if(response.status()!==200)throw Error(response.status());
    await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.allSettled([...document.images].map(i=>i.decode()));});
    for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=700){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(40);}
    await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);
    const dir=`docs/heroes-product-previews/${phase}`;fs.mkdirSync(dir,{recursive:true});
    const capture=async(name,locator)=>{
      const file=`${dir}/${name}-${width}.jpg`;
      if(locator){
        // Fit the section in a real viewport so the fixed mobile contact bar sits
        // below the section, rather than cutting through an element capture.
        const target=page.locator(locator),height=Math.ceil(await target.evaluate(e=>e.getBoundingClientRect().height))+150;
        await page.setViewportSize({width,height:Math.max(1000,height)});
        await target.screenshot({path:file,quality:88,animations:'disabled'});
        await page.setViewportSize({width,height:1000});
      }
      else await page.screenshot({path:file,quality:85,fullPage:true,animations:'disabled'});
      captures.push({phase,width,file});
    };
    await capture('heroes');await capture('opening','.flagship-hero');await capture('pricing','#plans');
    if(phase==='before')await capture('responsibilities','.people-section');
    else{
      await capture('responsibilities','#team-responsibilities');await capture('standard','#heroes-standard');await capture('included','#included');
      if(width===390)for(const tier of ['v2','v3']){await page.selectOption('#scope-tier-choice',tier);await capture('included-'+tier,'#included');}
    }
  }
  fs.writeFileSync('docs/heroes-product-previews/captures.json',JSON.stringify({baseline:'ec5d24a90138a040b4d4f14b28452d20e906fa26',method:'Genuine local Chromium captures at 1440/390. Before is an unmodified git archive of deployed main. Fonts/images decoded, full real scroll, reduced motion. Providers and writes blocked. Not hosted/provider validation.',captures},null,2)+'\n');
  await browser.close();console.log(`Captured ${captures.length} images.`);
})().catch(e=>{console.error(e);process.exit(1)});
