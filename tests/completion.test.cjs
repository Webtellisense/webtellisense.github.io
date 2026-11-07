const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const read=f=>fs.readFileSync(f,'utf8');
test('completion source matrix covers all pages, share tags and review links without claiming provider checks',()=>{
  const r=JSON.parse(read('docs/completion-page-matrix.json'));
  assert.equal(r.pages.length,45);assert.equal(r.summary.share_complete_pages,45);
  for(const p of r.pages){assert.ok(p.legal.privacy_link,p.page);assert.ok(p.legal.service_link || p.page==='service-terms.html',p.page);assert.deepEqual(p.broken_local_targets,[],p.page);}
  for(const page of ['privacy-policy','service-terms','heroes-start','heroes-welcome','heroes-profile-received'])assert.ok(!read('sitemap.xml').includes('/'+page+'<'));
  assert.equal((read('sitemap.xml').match(/<loc>https:\/\/webtellisense.com\/heroes<\/loc>/g)||[]).length,1);
});
test('existing flagship pricing comparison remains exactly as reviewed before the completion pass',()=>{
  const old=execFileSync('git',['show','1a3941a:heroes.html'],{encoding:'utf8'});
  const pricing=s=>s.slice(s.indexOf('<section id="plans"'),s.indexOf('<section id="how-it-works"'));
  assert.equal(pricing(read('heroes.html')),pricing(old));
});
test('new measurement is staged off, uses one GA4 destination, never a guessed Meta destination',()=>{
  const context={window:{}};vm.runInNewContext(read('assets/js/measurement-config.js'),context);
  assert.equal(context.window.WTS_MEASUREMENT.releaseApproved,false);
  assert.equal(context.window.WTS_MEASUREMENT.ga4,'G-PS5FNQCJRN');
  assert.equal(context.window.WTS_MEASUREMENT.metaPixel,null);
  for(const page of ['heroes','heroes-start','industries','education-marketing','solar-and-home-services-marketing','construction-property-marketing']){
    const s=read(page+'.html');assert.equal((s.match(/src="\/?assets\/js\/measurement.js"/g)||[]).length,1);
    assert.doesNotMatch(s,/gtag\('config'|GTM-NJ6L82XR|fbq\('init'/);
  }
  assert.doesNotMatch(read('solar.html'),/fbq\('track', 'Lead'|toastMessages|value: 300000/);
});
test('optional audit proxy rejects credential/query URLs without sending them; ordinary public sites still work',async()=>{
  const source=read('audit.html').match(/async function pingWebsite\(\) \{[\s\S]*?\n    \}/)[0];
  const result={},input={value:''},requests=[];
  const context={URL,AbortSignal,websiteLive:null,businessData:{},document:{getElementById:id=>id==='f-url'?input:result},fetch:async url=>{requests.push(url);return{json:async()=>({status:{http_code:200}})}}};
  vm.createContext(context);vm.runInContext(source,context);
  for(const value of ['https://user:secret@example.com','https://example.com?email=private@example.invalid','https://example.com/#access-token','javascript:alert(1)','http://localhost']){
    input.value=value;await context.pingWebsite();assert.equal(requests.length,0,value);assert.match(result.textContent,/No check was sent/);
  }
  input.value='example.com';await context.pingWebsite();assert.equal(requests.length,1);assert.equal(new URL(requests[0]).searchParams.get('url'),'https://example.com/');assert.equal(context.websiteLive,true);
});
