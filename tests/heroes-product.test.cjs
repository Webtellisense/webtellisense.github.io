const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const read = f => fs.readFileSync(f, 'utf8');
const between = (s, from, to) => {
  const a=s.indexOf(from), b=s.indexOf(to,a+from.length);
  assert.ok(a>=0 && b>a, `${from} → ${to}`);
  return s.slice(a,b);
};
test('product explanation preserves deployed hero, pricing, onboarding, portfolio and customer journeys', () => {
  const now=read('heroes.html'), approved=execFileSync('git',['show','42bbcf4:heroes.html'],{encoding:'utf8'});
  // Only copy/accessible labels and the two explicitly requested label removals
  // may change. Preserve the approved DOM, media, classes, destinations and IDs.
  const frame=s=>between(s,'<body','</body>')
    .replace(/<span class="care-example">Example search preview<\/span>/,'')
    .replace('<br>Illustrative collaboration, not a Webtellisense team portrait.','')
    .replace(/\s(?:alt|aria-label)="[^"]*"/g,'')
    .replace(/>[^<]*</g,'><').replace(/\s+</g,'<');
  assert.equal(frame(now),frame(approved));
  for(const [from,to] of [['    <section id="included"','    <section id="plans"'],['    <section id="plans"','    <section id="how-it-works"']])assert.equal(between(now,from,to),between(approved,from,to));
  for(const file of ['assets/css/heroes.css','assets/css/heroes-product.css','assets/js/heroes-product.js','assets/css/design-refinement.css','assets/js/heroes.js','assets/js/heroes-config.js','assets/js/heroes-shared.js','assets/js/design-refinement.js','heroes-start.html','heroes-welcome.html','heroes-profile-received.html','packages.html','welcome.html','netlify.toml','_redirects','sitemap.xml','index.html']) {
    const old=execFileSync('git',['show',`42bbcf4:${file}`],{encoding:'utf8'});
    const privacySpacing="\n/* Keep consent withdrawal reachable above the fixed mobile contact controls. */\n@media (max-width:760px) {\n  .flagship-page .review-links, .checkout-page .review-links { padding-bottom: 100px; }\n}\n/* Consent checkboxes must not inherit the full-width profile-field styling. */\n.heroes-site .measurement-choice label { display: flex; align-items: center; gap: 10px; min-height: 44px; margin: 0; padding-block: 6px; cursor: pointer; }\n.heroes-site .measurement-choice input[type=\"checkbox\"] { flex: none; width: 20px; height: 20px; min-height: 20px; padding: 0; margin: 0; appearance: auto; }\n";
    const current=file==='assets/css/heroes.css'?read(file).replace(privacySpacing,''):file==='assets/js/design-refinement.js'?read(file).replaceAll('Play messages','Play demo').replaceAll('Pause messages','Pause demo'):read(file);
    assert.equal(current,old,file);
  }
});
test('marketing copy uses concrete customer journeys and descriptive neutral photography labels',()=>{
  const page=read('heroes.html');
  // Class names remain stable CSS hooks; review visible copy and accessible labels.
  const customerCopy=page.replace(/<script\b[\s\S]*?<\/script>/g,'').replace(/\b(?:class|id)="[^"]*"/g,'');
  assert.doesNotMatch(customerCopy,/illustrat|\bmock\b|\bexample(?:s)?\b|demonstration only|not live customer data/i);
  assert.match(page,/Cleaning services in Uyo/);assert.match(page,/How customer enquiries can begin/);
  assert.match(page,/Colleagues reviewing a brief together/);assert.doesNotMatch(page,/alt="Webtellisense (?:team|staff)/);
});
test('capabilities explain scope, support and client sales ownership; provisional figures stay visibly qualified', () => {
  const page=read('heroes.html');
  assert.equal((page.match(/class="care-number"/g)||[]).length,8);
  for(const text of ['indicative planning ranges, not automatic allowances','A publishing day may use adapted material','Your written scope confirms','One named account lead','A living Heroes Plan','A monthly report + next actions','Your team handles replies, quotes and sales unless separately agreed','supported platforms','quoted separately'])assert.ok(page.includes(text),text);
  const allocations=[...page.matchAll(/Included monthly advertising allocation<strong>₦([\d,]+)<\/strong>/g)].map(m=>m[1]);
  assert.deepEqual(allocations,['100,000','300,000','550,000']);
  assert.doesNotMatch(between(page,'    <section id="team-responsibilities"','    <section id="plans"'),/Frontline|Vibes|Cashflow|Fireshot|Deeproots|Swagger|₦240,000|₦400,000|unlimited|guaranteed rankings/i);
});
test('FAQ structured data matches the visible revised tier explanation', () => {
  const page=read('heroes.html'), schema=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const faq=schema['@graph'].find(g=>g['@type']==='FAQPage');
  const answer=faq.mainEntity.find(q=>q.name==='What is included in my tier?').acceptedAnswer.text;
  assert.ok(page.includes(`<summary>What is included in my tier?</summary><p>${answer}</p>`));
});
