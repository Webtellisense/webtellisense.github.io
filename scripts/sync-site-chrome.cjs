const fs=require('node:fs');const {render,pages}=require('./site-chrome.cjs');
let changed=0;
for(const file of pages.standard){const before=fs.readFileSync(file,'utf8'),after=render(before,file);if(before!==after){changed++;if(!process.argv.includes('--check'))fs.writeFileSync(file,after);}}
if(process.argv.includes('--check')&&changed)throw Error(`${changed} pages need npm run chrome:sync`);
console.log(`${pages.standard.length} standard pages; ${changed} shared-chrome updates${process.argv.includes('--check')?' needed':''}.`);
