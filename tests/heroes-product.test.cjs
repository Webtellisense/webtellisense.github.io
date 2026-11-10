const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const baseline = 'ec5d24a90138a040b4d4f14b28452d20e906fa26';
const read = f => fs.readFileSync(f, 'utf8');
const before = f => execFileSync('git', ['show', `${baseline}:${f}`], {encoding:'utf8'});
const between = (s, from, to) => {
  const a=s.indexOf(from), b=s.indexOf(to,a+from.length);
  assert.ok(a>=0 && b>a, `${from} → ${to}`);
  return s.slice(a,b);
};
test('product explanation preserves deployed hero, pricing, onboarding, portfolio and customer journeys', () => {
  const now=read('heroes.html'), old=before('heroes.html');
  for(const [from,to] of [
    ['<body','    <section class="responsibility-section'],
    ['    <section id="plans"','    <section class="shell heroes-faq"'],
    ['    <section class="shell final-activation','</html>']
  ]) {
    const target=from==='<body'?'    <section id="team-responsibilities"':to;
    assert.equal(between(now,from,target),between(old,from,to));
  }
  for(const file of ['assets/css/heroes.css','assets/css/design-refinement.css','assets/js/heroes.js','assets/js/heroes-config.js','assets/js/heroes-shared.js','assets/js/design-refinement.js','assets/js/measurement.js','assets/js/measurement-config.js','heroes-start.html','heroes-welcome.html','heroes-profile-received.html','packages.html','welcome.html','netlify.toml','_redirects','sitemap.xml']) {
    assert.equal(read(file),before(file),file);
  }
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
