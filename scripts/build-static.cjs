const fs = require("node:fs");
const {render:renderChrome}=require('./site-chrome.cjs');
if(process.env.CONTEXT==='production'&&!require('../config/legal-release.json').copyApprovedForProduction)
  throw new Error('Production release blocked: approve the completed Privacy Policy/Service Terms and operational facts in docs/experience-legal-review.md first. Local and draft Deploy Preview builds remain available.');
fs.rmSync("public", { recursive: true, force: true });
fs.mkdirSync("public");
for (const file of fs.readdirSync(".")) {
  if (
    /\.(html|png|ico)$/.test(file) ||
    [
      "assets",
      "nigeria",
      "bahamas",
      "robots.txt",
      "_redirects",
      "sitemap.xml",
      "site.webmanifest",
    ].includes(file)
  )
    if(file.endsWith('.html'))fs.writeFileSync(`public/${file}`,renderChrome(fs.readFileSync(file,'utf8'),file));
    else fs.cpSync(file, `public/${file}`, { recursive: true });
}
