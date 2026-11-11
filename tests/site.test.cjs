const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const {execFileSync}=require('node:child_process');
const current=f=>fs.readFileSync(f,'utf8');const original=f=>execFileSync('git',['show','b639eebe83a9603f95f301b7e93fd47b095766b6:'+f],{encoding:'utf8',maxBuffer:10*1024*1024});
const before=JSON.parse(current('docs/technical-before.json')),after=JSON.parse(current('docs/completion-static-validation.json'));
test('all 48 completion pages reviewed; source SEO/JSON-LD/file targets repaired under documented Pretty URL policy',()=>{
 assert.equal(after.counts.html_pages,48);
 for(const k of ['canonical_defective_pages','description_defective_pages','title_defective_pages','h1_defective_pages','invalid_jsonld_blocks','schema_mime_errors','broken_file_references','sitemap_duplicate_urls','sitemap_missing_routes','duplicate_description_pages'])assert.equal(after.counts[k],0,k);
 assert.equal(after.counts.broken_fragment_references,0);assert.deepEqual(after.broken_fragments,[]);
 assert.ok(after.sitemap.every(u=>!u.endsWith('.html') && !/\/index$/.test(u)));
 assert.ok(!after.sitemap.some(u=>/kids-holiday|blog-details|welcome|indexxx/.test(u)));
 assert.ok(after.sitemap.includes('https://webtellisense.com/heroes'));
});
test('payment processing/prices preserved; approved neutral legacy handoff applied',()=>{
 const old=original('packages.html'),now=current('packages.html');
 const engine=s=>s.slice(s.indexOf('// ─── 3. LIVE INVOICE CALCULATION'),s.indexOf('</script>',s.indexOf('// ─── 3. LIVE INVOICE CALCULATION')));
 const withoutCallback=s=>s.replace(/callback: function \(response\) \{[\s\S]*?\n                \},\n                onClose:/, 'callback: reviewedNeutralReturn, onClose:');
 assert.equal(withoutCallback(engine(now)),withoutCallback(engine(old)));
 assert.match(now,/window.location.href = '\/welcome.html'/);assert.doesNotMatch(now,/session_id=\$\{sessionToken\}/);
 const drawer=s=>s.slice(s.indexOf('function openCheckout('),s.indexOf('// ─── 3. LIVE INVOICE CALCULATION'));
 assert.equal(drawer(now),drawer(old));
 const data=s=>s.slice(s.indexOf('const packageData ='),s.indexOf('/* ─── DYNAMIC TIER SWITCHER')).replaceAll('Deeproots_badge_t1.webp','deeproots_badge_t1.webp');
 assert.equal(data(now),data(old));
 assert.doesNotMatch(current('welcome.html'),/atob|Payment Confirmed|Access Denied/); assert.match(current('welcome.html'),/Payment check pending/);
 assert.equal(current('pricing.html').match(/<section id="pricing"[\s\S]*?<\/section>/)[0].replaceAll('href="contact.html"','href="#"'),original('pricing.html').match(/<section id="pricing"[\s\S]*?<\/section>/)[0]);
});
test('GA4/GTM and all intended Meta IDs are retained, duplicate PageViews scoped per destination',()=>{
 const b=new Map(before.tracking.map(x=>[x.page,x]));
 for(const a of after.tracking){if(!b.has(a.page)){assert.deepEqual(a.pixel_ids,[]);assert.deepEqual(a.ga_ids,[]);continue;}assert.deepEqual(a.pixel_ids,b.get(a.page).pixel_ids,a.page);assert.deepEqual(a.ga_ids,b.get(a.page).ga_ids,a.page);assert.deepEqual(a.gtm_ids,b.get(a.page).gtm_ids,a.page);}
 assert.equal(before.counts.duplicate_pixel_destination_pageviews,4);assert.equal(after.counts.duplicate_pixel_destination_pageviews,0);assert.equal(after.counts.ga_gtm_overlap_pages,2);
 assert.doesNotMatch(current('packages.html'),/class="wt-btn-submit-pay" onclick=/);
});
test('JS syntax: first-party shared code and every executable inline block',()=>{
 for(const file of ['assets/js/main.js','assets/js/theme-toggle.js','assets/js/heroes.js','assets/js/heroes-config.js','assets/js/heroes-shared.js','assets/js/measurement.js','assets/js/measurement-config.js','assets/js/design-refinement.js','assets/js/site-experience.js','scripts/site-chrome.cjs','scripts/sync-site-chrome.cjs','assets/vendor/php-email-form/validate.js'])execFileSync(process.execPath,['--check',file]);
 for(const r of after.pages){const text=current(r.page);for(const m of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  if(/\bsrc\s*=|type=["'](?:application\/|text\/template)/i.test(m[1]))continue;
  execFileSync(process.execPath,['--check'],{input:m[2],stdio:['pipe','pipe','pipe']});
 }}
});
test('no missing backend or policy is disguised as a new integration; audit does not promise storage/email',()=>{
 assert.equal(after.counts.missing_form_backend_references,1);assert.equal(after.counts.unresolved_legal_links || 0,0);
 assert.equal(current('config/legal-release.json'),execFileSync('git',['show','ec5d24a:config/legal-release.json'],{encoding:'utf8'}));assert.match(current('scripts/build-static.cjs'),/Production release blocked/);
 assert.doesNotMatch(current('audit.html'),/Your results have been saved|A summary has been sent|onclick="copyShare/);
 assert.match(current('audit.html'),/el.textContent = name/);assert.match(current('audit.html'),/addEventListener\('click', \(\) => copyShare\(shareText\)\)/);
 assert.match(current('assets/vendor/php-email-form/validate.js'),/querySelector\('\.error-message'\).textContent = error/);
 for(const dir of ['server','migrations','netlify/functions'])assert.equal(fs.existsSync(dir),false);
});
test('controlled all-page scan: no page-load exceptions, no mobile regression on local styles, core computed styles preserved',()=>{
 const runs=JSON.parse(current('docs/browser-validation.json'));const b=new Map(runs.filter(x=>x.phase==='before').map(x=>[x.page,x]));
 for(const a of runs.filter(x=>x.phase==='after')){
  assert.deepEqual(a.errors,[],a.page);if(b.has(a.page))assert.equal(a.mobile.overflow,b.get(a.page).mobile.overflow,a.page);
  if(!b.has(a.page)||a.page==='heroes.html')continue;
  for(const k of ['body','header','nav'])assert.deepEqual(a.styles[k],b.get(a.page).styles[k],a.page+' '+k);
  assert.ok(a.axe.every(v=>['color-contrast','link-in-text-block'].includes(v.id)),a.page);
 }
});
