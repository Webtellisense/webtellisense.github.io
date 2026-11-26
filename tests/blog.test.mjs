import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {stringify} from 'yaml';
import {ROOT,buildBlog,legacyBody} from '../scripts/build-blog.mjs';
import {checkBlog} from '../scripts/check-blog.mjs';
import {parseArticle,relatedFor,AUTHOR} from '../scripts/blog/model.mjs';
import {text} from '../scripts/blog/html.mjs';
import {execFileSync} from 'node:child_process';
import {fixture,markdown} from './blog-fixture.mjs';
function environment(){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'wts-blog-test-')),output=path.join(dir,'output'),contentDir=path.join(dir,'content');fs.cpSync(path.join(ROOT,'public'),output,{recursive:true});fs.mkdirSync(contentDir);return {dir,output,contentDir};}
function hashes(dir){return Object.fromEntries(fs.readdirSync(dir,{recursive:true}).sort().filter(f=>fs.statSync(path.join(dir,f)).isFile()).map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,f))).digest('hex')]));}
test('frontmatter reports field-specific errors, YAML duplicates, unsafe paths and date errors',()=>{
 for(const [patch,error]of [[{category:'Unknown'},/category/],[{publishedAt:'2026-02-30'},/publishedAt/],[{updatedAt:'2025-01-01'},/updatedAt/],[{author:'Invented expert'},/author/],[{slug:'../../other'},/slug/],[{sources:[{title:'Test',url:'javascript:alert(1)',checked:'2026-01-01'}]},/source URL/],[{heroImage:'https://example.com/photo.jpg'},/root-relative/],[{secondaryKeywords:'wrong'},/array/]])assert.throws(()=>parseArticle(markdown(fixture(1,patch)),'fixture.md',ROOT),error);
 assert.throws(()=>parseArticle(markdown(fixture(1)).replace('status: ready','status: ready\nstatus: draft'),'fixture.md',ROOT),/invalid YAML/);
 assert.throws(()=>parseArticle('no frontmatter','fixture.md',ROOT),/frontmatter/);
 const missing=fixture(1);delete missing.author;assert.equal(parseArticle(markdown(missing),'fixture.md',ROOT).author,AUTHOR);
});
test('legacy prose and analytics SDK snippets are preserved from the audit commit',()=>{
 const legacy=JSON.parse(fs.readFileSync(path.join(ROOT,'content/blog/legacy.json')));
 const tracking=s=>[...s.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>|<noscript>[\s\S]*?<\/noscript>/g)].map(m=>m[0]).filter(s=>/gtag\(|gtag\/js|fbq\(|facebook\.com\/tr/.test(s));
 for(const a of legacy){const before=execFileSync('git',['show','8a9c493:'+a.slug+'.html'],{cwd:ROOT,encoding:'utf8'}),after=fs.readFileSync(path.join(ROOT,a.slug+'.html'),'utf8');assert.equal(text(legacyBody(before)),text(legacyBody(after)),a.slug+' prose changed');assert.deepEqual(tracking(after),tracking(before),a.slug+' tracking changed');}
});
test('related selection is deterministic, excludes self and only uses published candidates',()=>{const a=fixture(1),b=fixture(2),c=fixture(3,{category:'Technology and AI',primaryKeyword:'unrelated',secondaryKeywords:[]});assert.deepEqual(relatedFor(a,[a,c,b]).map(a=>a.slug),[b.slug]);assert.deepEqual(relatedFor(a,[b,c,a]),relatedFor(a,[a,c,b]));});
test('production excludes drafts and missing heroes; archives paginate; checks pass; repeat build is byte-identical; stale output is removed',async()=>{
 const env=environment();try{
 for(let i=1;i<=9;i++)fs.writeFileSync(path.join(env.contentDir,i+'.md'),markdown(fixture(i)));
 fs.writeFileSync(path.join(env.contentDir,'draft.md'),markdown(fixture(90,{status:'draft'})));
 fs.writeFileSync(path.join(env.contentDir,'missing.md'),markdown(fixture(91,{heroImage:'MISSING',heroAlt:'',heroCredit:''})));
 const warnings=[];let result=await buildBlog({...env,warn:s=>warnings.push(s)});assert.equal(result.published.length,14);assert.equal(result.excluded.length,2);assert(warnings.some(s=>s.includes('downgraded')));
 assert(fs.existsSync(path.join(env.output,'blog/page/2.html')));assert(!fs.existsSync(path.join(env.output,'blog/category/local-business/page/2.html'))); // 10 in category, 14 total.
 assert(!fs.existsSync(path.join(env.output,'synthetic-check-90.html')));assert(!fs.existsSync(path.join(env.output,'synthetic-check-91.html')));
 const checks=await checkBlog({...env,quiet:true});assert.deepEqual(checks.errors,[]);
 const first=hashes(env.output);await buildBlog({...env,warn:()=>{}});assert.deepEqual(hashes(env.output),first,'second build changed output');
 for(let i=10;i<=13;i++)fs.writeFileSync(path.join(env.contentDir,i+'.md'),markdown(fixture(i)));
 await buildBlog({...env,warn:()=>{}});assert(fs.existsSync(path.join(env.output,'blog/category/local-business/page/2.html')));
 for(let i=1;i<=13;i++)fs.rmSync(path.join(env.contentDir,i+'.md'));
 await buildBlog({...env,warn:()=>{}});assert(!fs.existsSync(path.join(env.output,'blog/page/2.html')));assert(!fs.existsSync(path.join(env.output,'blog/category/local-business/page/2.html')));assert(!fs.existsSync(path.join(env.output,'synthetic-check-1.html')));
 assert.deepEqual((await checkBlog({...env,quiet:true})).errors,[]);
 }finally{fs.rmSync(env.dir,{recursive:true,force:true});}
});
test('raw HTML, H1, unknown internal routes and slug collisions fail instead of publishing',async()=>{const env=environment();try{const file=path.join(env.contentDir,'bad.md');for(const [source,error]of [[markdown(fixture(1))+'\n# Invalid H1',/H2 and H3/],[markdown(fixture(1))+'\n<script>alert(1)</script>',/raw HTML/],[markdown(fixture(1))+'\n[Invalid](/invented-route)',/approved route/],[markdown(fixture(1,{slug:'about'})),/collides/]]){fs.writeFileSync(file,source);await assert.rejects(buildBlog({...env}),error);}}finally{fs.rmSync(env.dir,{recursive:true,force:true});}});
test('local preview is explicit and cannot contaminate public output or hosted builds',async()=>{const env=environment();try{fs.writeFileSync(path.join(env.contentDir,'preview.md'),markdown(fixture(95,{status:'draft',heroImage:'MISSING',heroAlt:'',heroCredit:''})));await assert.rejects(buildBlog({...env,output:path.join(ROOT,'public'),includeDrafts:true}),/separate/);await buildBlog({...env,includeDrafts:true,warn:()=>{}});const preview=fs.readFileSync(path.join(env.output,'synthetic-check-95.html'),'utf8');assert(preview.includes('noindex, nofollow'));assert(preview.includes('No article photograph supplied'));assert(!fs.readFileSync(path.join(env.output,'blog/rss.xml'),'utf8').includes('synthetic-check-95'));assert(!fs.readFileSync(path.join(env.output,'sitemap.xml'),'utf8').includes('synthetic-check-95'));}finally{fs.rmSync(env.dir,{recursive:true,force:true});}});
