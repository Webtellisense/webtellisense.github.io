import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {chromium} from 'playwright';
import {ROOT,buildBlog} from '../scripts/build-blog.mjs';
import {resolveFile} from '../scripts/check-blog.mjs';
import {fixture,markdown} from './blog-fixture.mjs';
const require=createRequire(import.meta.url),temp=fs.mkdtempSync(path.join(os.tmpdir(),'wts-blog-browser-')),output=path.join(temp,'output'),contentDir=path.join(temp,'content');
let browser,server;
const results=[],violations=[];
try {
 fs.cpSync(path.join(ROOT,'public'),output,{recursive:true});fs.mkdirSync(contentDir);
 const long=fixture(100);fs.writeFileSync(path.join(contentDir,'fixture.md'),markdown(long));
 const missing=fixture(101,{heroImage:'MISSING',heroAlt:'',heroCredit:'',status:'draft'});fs.writeFileSync(path.join(contentDir,'missing.md'),markdown(missing));
 await buildBlog({output,contentDir,includeDrafts:true,warn:()=>{}});
 const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.otf':'font/otf','.woff2':'font/woff2','.xml':'application/xml','.json':'application/json'};
 server=http.createServer((req,res)=>{if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}const u=new URL(req.url,'http://localhost'),file=resolveFile(output,u.pathname);if(!file){res.writeHead(404);return res.end();}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(req.method==='HEAD'?'':fs.readFileSync(file));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const executable=fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined;
 browser=await chromium.launch({executablePath:executable,headless:true,args:['--no-sandbox']});
 const ctx=await browser.newContext();await ctx.route('**/*',route=>route.request().url().startsWith(origin+'/')&&route.request().method()==='GET'?route.continue():route.abort());
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
 const paths=['/blog','/blog/category/local-business','/how-to-grow-your-business-online-2026','/10-essential-tips-for-businesses-2025','/business-not-showing-up-online','/top-features-for-a-school-website','/value-of-a-digital-agency','/synthetic-check-100','/synthetic-check-101'];
 for(const width of [390,768,1440])for(const url of paths){await page.setViewportSize({width,height:900});await page.goto(origin+url,{waitUntil:'networkidle'});await page.addScriptTag({content:axe});
  const result=await page.evaluate(async()=>{const article=document.querySelector('.blog-article'),table=document.querySelector('.blog-table-scroll'),toc=document.querySelector('[data-blog-toc]');const axe=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return {overflow:document.documentElement.scrollWidth>innerWidth,h1:document.querySelectorAll('h1').length,articleWidth:article?.getBoundingClientRect().width,bodyFont:article?getComputedStyle(article).fontSize:null,tocOpen:toc?.open,tableScrollable:table?table.scrollWidth>table.clientWidth:null,newsletter:document.querySelectorAll('form').length,axe:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))};});
  assert.equal(result.overflow,false,url+' overflow at '+width);assert.equal(result.h1,1);assert.equal(result.newsletter,0);
  if(width===1440&&result.articleWidth)assert(result.articleWidth>=680&&result.articleWidth<=760,url+' article body width');
  if(url.includes('synthetic-check'))assert.equal(result.tableScrollable,true,'wide table must scroll inside its container');
  results.push({url,width,...result});for(const v of result.axe)violations.push({url,width,...v});
 }
 assert.deepEqual(errors,[],'page-load exceptions');
 // Synthetic events are queued locally; all provider SDK requests remain blocked.
 await page.goto(origin+'/synthetic-check-100',{waitUntil:'networkidle'});
 await page.evaluate(()=>{window.dataLayer=[];window.scrollTo(0,document.body.scrollHeight);});await page.waitForTimeout(150);
 await page.evaluate(()=>{window.scrollTo(0,0);});await page.waitForTimeout(100);
 await page.evaluate(()=>{window.scrollTo(0,document.body.scrollHeight);});await page.waitForTimeout(150);
 await page.locator('[data-article-cta]').evaluate(a=>a.addEventListener('click',e=>e.preventDefault()));await page.locator('[data-article-cta]').click();
 await page.locator('[data-blog-share]').evaluate(a=>a.addEventListener('click',e=>e.preventDefault()));await page.locator('[data-blog-share]').click();
 const counts=await page.evaluate(()=>{const events=window.dataLayer.filter(a=>a[0]==='event').map(a=>a[1]);return Object.fromEntries([...new Set(events)].map(n=>[n,events.filter(x=>x===n).length]));});
 for(const depth of [25,50,75,90])assert.equal(counts['scroll_'+depth],1,'scroll event dedup '+depth);assert.equal(counts.article_cta_click,1);assert.equal(counts.whatsapp_click,1);
 await page.evaluate(()=>Object.defineProperty(navigator,'doNotTrack',{value:'1',configurable:true}));await page.locator('[data-article-cta]').click();
 assert.equal(await page.evaluate(()=>window.dataLayer.filter(a=>a[0]==='event'&&a[1]==='article_cta_click').length),1,'DNT suppresses new event');
 await page.evaluate(()=>Object.defineProperty(navigator,'doNotTrack',{value:'0',configurable:true}));
 await page.goto(origin+'/how-to-grow-your-business-online-2026',{waitUntil:'networkidle'});await page.evaluate(()=>{window.dataLayer=[];});
 await page.locator('.blog-audit-cta a').evaluate(a=>a.addEventListener('click',e=>e.preventDefault()));await page.locator('.blog-audit-cta a').click();
 const auditEvents=await page.evaluate(()=>window.dataLayer.filter(a=>a[0]==='event').map(a=>a[1]));
 assert.equal(auditEvents.filter(n=>n==='article_cta_click').length,1);assert.equal(auditEvents.filter(n=>n==='audit_tool_start').length,1);

 // Query variants keep base canonical and set client-side noindex.
 await page.goto(origin+'/blog?category=test',{waitUntil:'networkidle'});assert((await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'));assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://webtellisense.com/blog');
 // Menu / TOC have native keyboard access, visible focus and correct disclosure state.
 await page.setViewportSize({width:390,height:900});await page.goto(origin+'/synthetic-check-100',{waitUntil:'networkidle'});await page.locator('[data-blog-toc] summary').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('[data-blog-toc]').getAttribute('open'),'');
 await page.locator('[data-copy-link]').focus();assert.notEqual(await page.locator('[data-copy-link]').evaluate(el=>getComputedStyle(el).outlineStyle),'none');
 const report={viewports:[390,768,1440],pages:results,errors,violations,eventCounts:counts,auditEvents};fs.writeFileSync('/tmp/wts-blog-browser-results.json',JSON.stringify(report,null,2));
 console.log(`Blog browser: ${results.length} page/viewport checks; ${errors.length} page exceptions; ${violations.length} axe violations; events ${JSON.stringify(counts)}; audit ${JSON.stringify(auditEvents)}`);
 if(violations.length){console.log(JSON.stringify(violations,null,2));process.exitCode=1;}
} catch(e){console.error(e.stack);process.exitCode=1;}finally{await browser?.close();server?.close();fs.rmSync(temp,{recursive:true,force:true});}
