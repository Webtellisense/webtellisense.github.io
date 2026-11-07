// Every external request is blocked. Only explicitly mocked local form submissions can POST.
const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1')return r.abort();if(u.pathname==='/forms/contact.php')return r.fulfill({status:200,body:'<img src=x onerror="window.mailInjected=1">'});return r.request().method()==='GET'?r.continue():r.abort();});
 const go=name=>page.goto('http://127.0.0.1:8781/'+name,{waitUntil:'load'});
 await go('about.html');const nav=page.locator('.mobile-nav-toggle');await nav.focus();await page.keyboard.press('Enter');assert.equal(await nav.getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await nav.getAttribute('aria-expanded'),'false');
 assert.equal(await page.locator('[role="progressbar"][aria-label]').count(),6);
 await go('faq.html');const question=page.locator('.faq-question').first();await question.focus();const old=await question.getAttribute('aria-expanded');await page.keyboard.press('Space');assert.notEqual(await question.getAttribute('aria-expanded'),old);
 await go('index.html');await page.locator('.isotope-filters [data-filter=".filter-app"] button').focus();await page.keyboard.press('Enter');assert.match(await page.locator('.isotope-filters [data-filter=".filter-app"]').getAttribute('class'),/filter-active/);
 await go('audit.html');await page.evaluate(()=>{
  businessData.name='<img src=x onerror="window.auditInjected=1">';businessData.city='\"<svg onload="window.auditInjected=1">';businessData.email='malicious@example.invalid';
  renderResults([],45,getTier(45),[]);
  window.copiedScore='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedScore=value;}}});
 });
 assert.equal(await page.locator('#step-results img,#step-results [onerror],#step-results [onload]').count(),0);assert.equal(await page.evaluate(()=>window.auditInjected),undefined);
 assert.match(await page.locator('.result-name').textContent(),/<img src=x/);assert.doesNotMatch(await page.locator('.submit-notice').textContent(),/saved|sent to|emailed/);
 await page.locator('#audit-share-button').evaluate(e=>e.click());assert.match(await page.evaluate(()=>window.copiedScore),/<img src=x/);
 await go('freeguide.html');await page.evaluate(()=>{const height=document.body.scrollHeight-innerHeight;for(const percent of [26,27,51,52,76,77,90,99]){Object.defineProperty(window,'scrollY',{configurable:true,value:Math.ceil(height*percent/100)});window.dispatchEvent(new Event('scroll'));}});
 const scroll=await page.evaluate(()=>dataLayer.map(x=>Array.from(x)).filter(x=>x[0]==='event'&&/^scroll_/.test(x[1])).map(x=>x[1]));for(const n of [25,50,75])assert.equal(scroll.filter(x=>x==='scroll_'+n).length,1);
 await go('contact.html');const form=page.locator('form[action="forms/contact.php"]');await form.locator('[name=name]').fill('Test');await form.locator('[name=email]').fill('test@example.invalid');await form.locator('[name=subject]').fill('Test');await form.locator('[name=message]').fill('Test');await form.locator('button[type=submit]').click();await page.waitForFunction(()=>document.querySelector('form[action="forms/contact.php"] .error-message').classList.contains('d-block'));
 assert.equal(await page.evaluate(()=>window.mailInjected),undefined);assert.equal(await form.locator('.error-message img').count(),0);assert.equal(await form.locator('.sent-message').isVisible(),false);
 // The checkout is opened for a frontend smoke check only. Never submit or initialize Paystack.
 await page.addInitScript(()=>{window.fbq=()=>{};});await go('packages.html');await page.evaluate(()=>openCheckout('Swagger','swagger'));assert.equal(await page.locator('#wt-checkout-drawer').isVisible(),true);assert.match(await page.locator('#inv-grand-total').innerText(),/100,000/);await page.evaluate(()=>closeCheckout());
 for(const name of ['business-audit-tool.html','contact.html','faq.html','pricing.html','ppc.html','index.html'])for(const width of [320,768,1365]){await page.setViewportSize({width,height:900});await go(name);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name+' '+width);}
 assert.deepEqual(errors,[]);
 fs.mkdirSync('docs/technical-previews',{recursive:true});for(const name of ['contact.html','about.html','business-audit-tool.html']){await go(name);await page.screenshot({path:'docs/technical-previews/'+name.replace('.html','.png'),fullPage:true,animations:'disabled'});}
 await browser.close();console.log('Functional checks passed: nav/FAQ/filter keyboard, audit injection/share, once-only scrolls, safe form error, checkout drawer (no payment), 320/768/1365 reflow. Providers blocked/mocked.');
})().catch(e=>{console.error(e);process.exit(1)});
