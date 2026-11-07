// Local static preview only. It implements this repo's routing rules, not Netlify Forms.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(process.argv[2] || 'public');
const port = Number(process.argv[3] || 8791);
const rules = fs.existsSync(path.join(root, '_redirects')) ? fs.readFileSync(path.join(root, '_redirects'), 'utf8').split('\n').filter(line => line.trim() && !line.startsWith('#')).map(line => line.trim().split(/\s+/)) : [];
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.otf':'font/otf','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain'};
http.createServer((req,res) => {
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405,{'Content-Type':'text/plain'}); return res.end('Local preview has no provider form storage.'); }
  const url = new URL(req.url,'http://localhost');
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400);return res.end(); }
  const rule = rules.find(([from]) => from === pathname);
  if (rule) {
    const [,to,code] = rule, status = parseInt(code);
    if (status >= 300) {res.writeHead(status,{Location:to+url.search});return res.end();}
    pathname = to;
  }
  let file = path.resolve(root,'.'+pathname);
  if (!file.startsWith(root+path.sep) && file !== root) {res.writeHead(403);return res.end();}
  if (pathname.endsWith('/')) file = path.join(file,'index.html');
  if (!fs.existsSync(file) && fs.existsSync(file+'.html')) file += '.html';
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404);return res.end('Not found');}
  const headers = {'Content-Type':mime[path.extname(file)] || 'application/octet-stream'};
  if (/\/(?:heroes-welcome|heroes-start|welcome)/.test(pathname)) headers['Referrer-Policy']='no-referrer';
  if (/\/(?:heroes-welcome|welcome)/.test(pathname)) headers['Cache-Control']='no-store';
  res.writeHead(200,headers);
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}).listen(port,'127.0.0.1',() => console.log(`Static-only preview: http://127.0.0.1:${port}`));
