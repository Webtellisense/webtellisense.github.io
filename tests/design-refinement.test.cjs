const{test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const{execFileSync}=require('node:child_process');
const baseline='7e33d13a98695dade64b361a64b60f1cf3317ee2';
test('design refinement leaves payment, measurement, general welcome, portfolio and package integrations untouched',()=>{
 for(const file of ['packages.html','pricing.html','welcome.html','heroes-start.html','heroes-welcome.html','heroes-profile-received.html','assets/js/heroes.js','assets/js/heroes-config.js','assets/js/heroes-shared.js','assets/js/measurement.js','assets/js/measurement-config.js','assets/js/main.js','assets/css/main.css','netlify.toml','_redirects'])assert.equal(fs.readFileSync(file,'utf8'),execFileSync('git',['show',baseline+':'+file],{encoding:'utf8'}),file);
 const portfolio=s=>{const from=s.indexOf('<section class="portfolio-story"'),to=s.indexOf('<section class="shell industry-intro');assert.ok(from>0&&to>from);return s.slice(from,to);};
 assert.equal(portfolio(fs.readFileSync('heroes.html','utf8')),portfolio(execFileSync('git',['show',baseline+':heroes.html'],{encoding:'utf8'})));
});
