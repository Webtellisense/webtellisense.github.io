import fs from 'node:fs';
import path from 'node:path';
import {parseDocument} from 'yaml';
export const ORIGIN='https://webtellisense.com';
export const AUTHOR='Webtellisense Editorial Team';
export const CATEGORIES=['Local Business','Business Growth','Energy and Solar','Digital Marketing','Technology and AI','Money and Funding','Industry Insights','Case Studies'];
export const categorySlug=s=>s.toLowerCase().replaceAll(' and ','-and-').replaceAll(' ','-');
export const categoryURL=c=>'/blog/category/'+categorySlug(c);
export const normalRoute=url=>url.replace(/\.html$/,'').replace(/\/$/,'')||'/';
export function auditRoutes(root){return new Set([...fs.readFileSync(path.join(root,'docs/blog/AUDIT.md'),'utf8').matchAll(/^\| `([^`]+)` \| `[^`]+\.html`.*\| Yes \|$/gm)].map(m=>m[1]));}
export const dateOK=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
export function localAsset(root, value) {
 if(typeof value!=='string'||!value.startsWith('/assets/img/')||/[?#\\]/.test(value)||value.split('/').includes('..'))throw Error(`Image must be a root-relative /assets/img/ path: ${value}`);
 const file=path.join(root,value);if(!fs.existsSync(file)||!fs.statSync(file).isFile())throw Error(`Image not found: ${value}`);return file;
}
export function parseArticle(source,file,root) {
 const fail=message=>{throw Error(`${file}: ${message}`);};
 const match=source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);if(!match)fail('expected YAML frontmatter between --- lines');
 const doc=parseDocument(match[1],{uniqueKeys:true});if(doc.errors.length)fail('invalid YAML: '+doc.errors.map(e=>e.message).join('; '));const a=doc.toJS({maxAliasCount:0});
 if(!a||Array.isArray(a)||typeof a!=='object')fail('frontmatter must be a mapping');
 const fields=['title','slug','category','primaryKeyword','secondaryKeywords','metaTitle','metaDescription','excerpt','publishedAt','updatedAt','author','heroImage','heroAlt','heroCredit','quickAnswer','faqs','sources','related','status'];
 for(const k of Object.keys(a))if(!fields.includes(k))fail(`unknown field "${k}"`);
 for(const k of ['title','slug','category','primaryKeyword','metaTitle','metaDescription','excerpt','heroImage','status'])if(typeof a[k]!=='string'||!a[k].trim())fail(`${k} must be a non-empty string`);
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.slug))fail('slug must be lowercase words separated by hyphens, without extension or slash');
 if(!CATEGORIES.includes(a.category))fail('category must be one of: '+CATEGORIES.join(', '));
 if(!['draft','ready'].includes(a.status))fail('status must be draft or ready');
 if(!dateOK(a.publishedAt))fail('publishedAt must be a real ISO YYYY-MM-DD date');
 if(a.updatedAt!=null&&(!dateOK(a.updatedAt)||a.updatedAt<a.publishedAt))fail('updatedAt must be null or an ISO date on/after publishedAt');
 for(const k of ['secondaryKeywords','sources'])if(!Array.isArray(a[k]))fail(`${k} must be an array`);
 for(const k of ['secondaryKeywords','related'])if(a[k]!=null&&(!Array.isArray(a[k])||a[k].some(x=>typeof x!=='string'||!x.trim())))fail(`${k} must contain non-empty strings`);
 a.author??=AUTHOR;if(a.author!==AUTHOR)fail(`author must be "${AUTHOR}" until an evidence-backed author policy is added`);
 for(const k of ['heroAlt','heroCredit'])if(typeof a[k]!=='string')fail(`${k} must be a string`);
 if(a.heroImage!=='MISSING'){try{localAsset(root,a.heroImage);}catch(e){fail(e.message);}if(!a.heroAlt.trim()||!a.heroCredit.trim())fail('heroAlt and heroCredit are required for an image');}
 if(a.quickAnswer!=null&&(typeof a.quickAnswer!=='string'||!a.quickAnswer.trim()))fail('quickAnswer must be a non-empty string when supplied');
 if(a.faqs!=null&&(!Array.isArray(a.faqs)||a.faqs.some(q=>!q||typeof q.q!=='string'||!q.q.trim()||typeof q.a!=='string'||!q.a.trim())))fail('faqs must contain {q,a} strings');
 for(const s of a.sources){if(!s||typeof s.title!=='string'||!s.title.trim()||!dateOK(s.checked))fail('sources require title, url and ISO checked date');try{const u=new URL(s.url);if(!['https:','http:'].includes(u.protocol))throw Error();}catch{fail('source URL must be http(s): '+s.url);}}
 if(!match[2].trim())fail('Markdown body is empty');
 return {...a,body:match[2],url:'/'+a.slug,source:file,legacy:false};
}
export function relatedFor(article, articles) {
 const keys=a=>new Set([a.primaryKeyword,...(a.secondaryKeywords||[]),...(a.keywords||[])].filter(Boolean).flatMap(s=>s.toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]).filter(s=>s.length>2&&!['the','and','for','your','how'].includes(s)));
 const own=keys(article),explicit=article.related||[];
 return articles.filter(a=>a.slug!==article.slug).map(a=>({a,score:(explicit.includes(a.slug)?100:0)+(a.category===article.category?10:0)+[...keys(a)].filter(k=>own.has(k)).length})).filter(x=>x.score>0).sort((x,y)=>y.score-x.score||y.a.publishedAt.localeCompare(x.a.publishedAt)||x.a.slug.localeCompare(y.a.slug)).slice(0,3).map(x=>x.a);
}
