const{test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const{execFileSync,spawnSync}=require('node:child_process');const{render,pages}=require('../scripts/site-chrome.cjs');
const read=f=>fs.readFileSync(f,'utf8');
test('all standard pages use the same build-time header/footer; intentional conversion exceptions stay separate',()=>{
 assert.equal(pages.standard.length,35);assert.equal(Object.keys(pages.exceptions).length,13);
 for(const file of pages.standard){const text=read(file);assert.equal(render(text,file),text,file+' chrome synchronization');for(const part of['header','footer'])assert.equal(text.split(`<!-- site-${part}:start -->`).length,2,file);assert.match(text,/site-experience\.js/);}
 const header=read('partials/site-header.html');assert.doesNotMatch(header,/href="\/pricing/);assert.equal((header.match(/href="\/packages"/g)||[]).length,1);const service=header.slice(header.indexOf('data-mega="services"'),header.indexOf('data-mega="industries"'));assert.doesNotMatch(service,/href="\/(?:packages|pricing)/);
 for(const file of Object.keys(pages.exceptions))assert.doesNotMatch(read(file),/site-header:start/,file);
});
test('old central pricing routes/fragments remain intact while inbound navigation is retired',()=>{
 const old=execFileSync('git',['show','118ece7:pricing.html'],{encoding:'utf8'}),now=read('pricing.html');
 const ids=s=>[...s.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]).filter(x=>!['header','footer','navmenu','mobile-nav-toggle'].includes(x));
 for(const id of ids(old).filter(x=>!/^footer|scroll-top/.test(x)))assert.ok(ids(now).includes(id),id);
 assert.equal(read('_redirects'),execFileSync('git',['show','118ece7:_redirects'],{encoding:'utf8'}));
 for(const name of['web-design','google-business-profile','ppc','branding','graphics-design','social-media-management','social-media-marketing','content-marketing','email-marketing','conversion-rate-optimization']){
  const file=name+'.html',old=execFileSync('git',['show','118ece7:'+file],{encoding:'utf8'}),prices=s=>s.match(/₦\s*[\d,]+(?:\s*-\s*₦?[\d,]+)?/g)||[];
  assert.deepEqual(prices(read(file)),prices(old),file+' original commercial amounts');
 }
 for(const row of JSON.parse(read('docs/completion-page-matrix.json')).pages)assert.doesNotMatch(read(row.page),/href=["']\/?pricing(?:\.html)?(?:[?#][^"']*)?["']/i,row.page);
});
test('homepage quotes and attribution match the existing owner-approved records; no invented Google branding',()=>{
 const data=JSON.parse(read('docs/experience-testimonial-source.json')),html=read('index.html');assert.equal(data.testimonials.length,6);
 const decode=s=>s.replaceAll('&amp;','&').replaceAll('&#x27;',"'").replaceAll('&quot;','"').replaceAll('&gt;','>').replaceAll('&lt;','<');
 const section=decode(html.slice(html.indexOf('<section id="reviews"'),html.indexOf('</section>',html.indexOf('<section id="reviews"'))));
 for(const r of data.testimonials)for(const key of['author','headline','quote'])assert.ok(section.includes(key==='quote'?r[key].replace('*me*','<em>me</em>'):r[key]),r.author+' '+key);
 assert.equal((section.match(/class="review-card"/g)||[]).length,6);assert.doesNotMatch(section,/Google Reviews|Trustpilot|verified review/i);
});
test('gallery retains the twelve original artwork targets, not invented case studies',()=>{
 const records=JSON.parse(read('docs/experience-portfolio-source.json')).projects,html=read('index.html');assert.equal(records.length,12);
 for(const row of records){assert.ok(html.includes('href="/'+row.original+'"'));assert.ok(fs.existsSync(row.original));}
 const gallery=html.slice(html.indexOf('<section id="portfolio"'),html.indexOf('</section>',html.indexOf('<section id="portfolio"')));assert.doesNotMatch(gallery,/See case study|120%/);assert.match(gallery,/data-project-filter="websites"/);
});
test('legal candidates are clearly linked but cannot enter a Netlify production build without completed-copy sign-off',()=>{
 assert.equal(JSON.parse(read('config/legal-release.json')).copyApprovedForProduction,false);
 for(const file of['privacy-policy.html','service-terms.html']){assert.match(read(file),/noindex, follow/);assert.doesNotMatch(read(file),/draft for review|Not a final policy|NOT FINAL CONTRACT TERMS/);}
 const result=spawnSync(process.execPath,['scripts/build-static.cjs'],{env:{...process.env,CONTEXT:'production'},encoding:'utf8'});assert.notEqual(result.status,0);assert.match(result.stderr,/Production release blocked/);
 assert.ok(fs.existsSync('public/heroes.html'),'Failed release must not remove existing local preview output');
});
