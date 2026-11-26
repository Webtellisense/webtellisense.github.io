// Rebuild committed legacy derivatives without changing shared original assets.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareImage,defaultSocial} from './blog/images.mjs';
import {nodes,attrs} from './blog/html.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
try {
 const legacy=JSON.parse(fs.readFileSync(path.join(root,'content/blog/legacy.json')));
 const paths=new Set(legacy.flatMap(a=>[a.image,...(a.bodyImages||[])]).filter(Boolean));
 for(const a of legacy){const html=fs.readFileSync(path.join(root,a.slug+'.html'),'utf8');for(const m of html.matchAll(/<img\b([^>]*)>/g)){const at=attrs(m[1]);if(at.src?.includes('/blog/')&&!at.src.includes('/generated/'))paths.add(at.src.startsWith('/')?at.src:'/'+at.src);}}
 for(const src of [...paths].sort())await prepareImage(root,root,src);
 await defaultSocial(root,root);console.log(`Prepared ${paths.size} legacy image source(s); originals unchanged.`);
} catch(e){console.error('Blog image preparation failed: '+e.message);process.exitCode=1;}
