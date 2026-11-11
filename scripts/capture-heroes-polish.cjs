// Actual production-origin fixture, local source, all external traffic/writes blocked.
const {chromium}=require('playwright'),fs=require('node:fs');
const base=process.env.HEROES_TEST_ORIGIN||'http://127.0.0.1:8795';
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const captures=[];fs.mkdirSync('docs/heroes-polish-previews',{recursive:true});
 for(const width of [1440,390]){
  const c=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  await c.route('**/*',async r=>new URL(r.request().url()).origin==='https://webtellisense.com'&&r.request().method()==='GET'?r.fulfill({response:await r.fetch({url:base+new URL(r.request().url()).pathname})}):r.abort());
  const p=await c.newPage();await p.goto('https://webtellisense.com/heroes');
  await p.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.allSettled([...document.images].map(i=>i.decode()));});
  const capture=async(name,locator)=>{
   const file=`docs/heroes-polish-previews/${name}-${width}.jpg`;
   if(locator){const el=p.locator(locator);await p.setViewportSize({width,height:Math.max(1000,Math.ceil(await el.evaluate(e=>e.getBoundingClientRect().height))+180)});await el.screenshot({path:file,quality:88,animations:'disabled'});await p.setViewportSize({width,height:1000});}
   else await p.screenshot({path:file,quality:85,fullPage:true,animations:'disabled'});
   captures.push({name,width,file});
  };
  await capture('consent','.measurement-choice');
  await p.getByRole('button',{name:'Keep optional tracking off',exact:true}).click();
  for(let y=0;y<await p.evaluate(()=>document.documentElement.scrollHeight);y+=750){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(40);}
  await p.evaluate(()=>scrollTo(0,0));await capture('heroes');await capture('opening','.flagship-hero');await capture('responsibilities','#team-responsibilities');
  if(width===390){for(let i=0;i<4;i++){await p.locator('[data-activity-next]').click();await capture('enquiry-'+(i+2),'.activity-demo');}}
  // A real pointer action proves the mobile fixed bar does not cover withdrawal.
  await p.locator('[data-measurement-settings]').click();await capture('preferences','.measurement-choice');
  await c.close();
 }
 await browser.close();fs.writeFileSync('docs/heroes-polish-previews/captures.json',JSON.stringify({baseline:'42bbcf4980bfb6084db5703e68b07869dca421f2',method:'Genuine Chromium 1440/390 screenshots. HTTPS production-origin fixture served from current local static build; provider traffic/writes blocked. Initial consent shown; full-page/content captures follow explicit reject-all. Fonts/images awaited, page actually scrolled, reduced motion. Section viewport fitted so contact controls do not obscure captured copy. Not a deployed preview.',captures},null,2)+'\n');console.log(`Captured ${captures.length} current copy and preference views.`);
})().catch(e=>{console.error(e);process.exit(1)});
