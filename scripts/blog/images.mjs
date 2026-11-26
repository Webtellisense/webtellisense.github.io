import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {localAsset} from './model.mjs';
import {escapeHTML as e,attrs} from './html.mjs';
export async function prepareImage(root,output,src){
 const file=localAsset(root,src),bytes=await fs.readFile(file),hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,12),base=path.basename(src,path.extname(src)).replace(/[^a-zA-Z0-9-]/g,'-')+'-'+hash;
 const dir='/assets/img/blog/generated';await fs.mkdir(path.join(output,dir),{recursive:true});
 const meta=await sharp(bytes).rotate().metadata();const width=meta.autoOrient?.width||meta.width,height=meta.autoOrient?.height||meta.height;
 if(!width||!height)throw Error(`Cannot read image dimensions: ${src}`);
 const variants=[];for(const w of [...new Set([480,768,1200].map(w=>Math.min(w,width)))]){const name=`${dir}/${base}-${w}.webp`;const target=path.join(output,name);if(!await exists(target))await sharp(bytes).rotate().resize({width:w,withoutEnlargement:true}).webp({quality:78,effort:4}).toFile(target);variants.push({src:name,width:w,height:Math.round(height*w/width)});}
 const social=`${dir}/${base}-social.jpg`;if(!await exists(path.join(output,social)))await sharp(bytes).rotate().resize(1200,630,{fit:'cover',position:'centre'}).jpeg({quality:80,mozjpeg:true}).toFile(path.join(output,social));
 return {...variants.at(-1),variants,social,original:src};
}
async function exists(f){try{await fs.access(f);return true;}catch{return false;}}
export async function defaultSocial(output){const url='/assets/img/blog/generated/default-social.jpg';await fs.mkdir(path.dirname(path.join(output,url)),{recursive:true});if(!await exists(path.join(output,url)))await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#01033e"/><rect x="72" y="100" width="12" height="430" fill="#0033ff"/><text x="120" y="280" fill="white" font-family="sans-serif" font-size="76">Webtellisense</text><text x="124" y="370" fill="#d4d6e2" font-family="sans-serif" font-size="38">Business insights and practical guides</text></svg>')).jpeg({quality:85}).toFile(path.join(output,url));return url;}
export const imageHTML=(image,alt,{hero=false,caption=''}={})=>`<img src="${e(image.src)}" srcset="${image.variants.map(v=>`${e(v.src)} ${v.width}w`).join(', ')}" sizes="(max-width: 760px) calc(100vw - 40px), 736px" width="${image.width}" height="${image.height}" alt="${e(alt)}" loading="${hero?'eager':'lazy'}" decoding="async"${hero?' fetchpriority="high"':''}>${caption?`<figcaption>${e(caption)}</figcaption>`:''}`;
export async function processBodyImages(html,root,output){
 const matches=[...html.matchAll(/<img\b([^>]*)>/gi)];for(const m of matches.reverse()){const a=attrs(m[1]);if(!a.alt?.trim())throw Error('Body image requires meaningful alt text: '+a.src);const src=a.src.startsWith('/')?a.src:'/'+a.src;const image=await prepareImage(root,output,src);const figure=`<figure>${imageHTML(image,a.alt,{caption:a.title||''})}</figure>`;html=html.slice(0,m.index)+figure+html.slice(m.index+m[0].length);}return html;
}
