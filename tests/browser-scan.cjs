// All third-party requests and local non-GET requests are blocked: no analytics/forms/payments.
const {chromium}=require('playwright');const fs=require('node:fs');const {execFileSync}=require('node:child_process');
const pages=JSON.parse(fs.readFileSync('docs/technical-before.json')).pages.map(p=>p.page);
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const results=[];
 for(const phase of ['before','after']){
  const ctx=await browser.newContext({reducedMotion:'reduce'});
  await ctx.route('**/*',r=>{const u=new URL(r.request().url());return u.hostname==='127.0.0.1' && r.request().method()==='GET'?r.continue():r.abort();});
  for(const name of pages){
   const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(`http://127.0.0.1:${phase==='before'?8782:8781}/${name}`,{waitUntil:'load'});await page.waitForTimeout(150);
   const styles=await page.evaluate(()=>{const style=el=>{if(!el)return null;const c=getComputedStyle(el);return {color:c.color,background:c.backgroundColor,font:c.fontFamily,fontSize:c.fontSize};};return {body:style(document.body),header:style(document.querySelector('#header')),nav:style(document.querySelector('#navmenu a')),overflow:document.documentElement.scrollWidth>innerWidth};});
   let mobile;await page.setViewportSize({width:390,height:844});mobile=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth}));
   let axe=[];
   if(phase==='after' && !['nigeria/solar.html','bahamas/solar.html'].includes(name)){
    await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
    axe=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length,examples:v.nodes.slice(0,3).map(n=>n.target)}));});
   }
   results.push({phase,page:name,errors,styles,mobile,axe});await page.close();
  }
  await ctx.close();
 }
 fs.writeFileSync('docs/browser-validation.json',JSON.stringify(results,null,2)+'\n');
 console.log(JSON.stringify(results.filter(r=>r.errors.length||r.mobile.overflow||(r.phase==='after'&&r.axe.length)).map(r=>({phase:r.phase,page:r.page,errors:r.errors,mobileOverflow:r.mobile.overflow,axe:r.axe})),null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
