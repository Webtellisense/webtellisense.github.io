const fs = require("node:fs");
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
      "sitemap.xml",
      "site.webmanifest",
    ].includes(file)
  )
    fs.cpSync(file, `public/${file}`, { recursive: true });
}
