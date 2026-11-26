import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {ROOT,read} from './build-blog.mjs';
import {ORIGIN,parseArticle,categoryURL} from './blog/model.mjs';
import {nodes,inner,text,decode} from './blog/html.mjs';
export function resolveFile(output,pathname){
 let p;try{p=decodeURIComponent(pathname);}catch{return null;}
 if(p.split('/').includes('..')||p.includes('\\'))return null;
 const base=path.join(output,p),options=[base,base+'.html',path.join(base,'index.html')];if(p==='/')options.unshift(path.join(output,'index.html'));
 return options.find(f=>fs.existsSync(f)&&fs.statSync(f).isFile())||null;
}
export async function checkBlog({root=ROOT,output=path.join(root,'public'),contentDir=path.join(root,'content/blog'),quiet=false}={}){
 const errors=[],warnings=[],assert=(condition,message)=>{if(!condition)errors.push(message);};
 const manifest=JSON.parse(fs.readFileSync(path.join(output,'blog-build.json'),'utf8'));
 assert(!manifest.preview,'Production check refuses a preview/draft build');
 const sourceArticles=[...JSON.parse(read(root,'content/blog/legacy.json')),...fs.readdirSync(contentDir).filter(f=>f.endsWith('.md')).map(f=>parseArticle(fs.readFileSync(path.join(contentDir,f),'utf8'),f,root)).filter(a=>a.status==='ready'&&a.heroImage!=='MISSING')];
 const expected=new Set(sourceArticles.map(a=>a.url));
 assert(manifest.articles.length===sourceArticles.length,'Manifest article count disagrees with source registry/frontmatter');
 for(const a of sourceArticles){const built=manifest.articles.find(b=>b.slug===a.slug);assert(built&&built.url===a.url&&built.publishedAt===a.publishedAt&&(built.updatedAt??null)===(a.updatedAt??null),'Manifest disagrees with source: '+a.slug);}

 const metaTitles=new Map(),descriptions=new Map();
 const inspected=[...manifest.articles.map(a=>a.url),...manifest.listings];
 const metadata=new Map();
 for(const url of inspected){
  const file=resolveFile(output,url);if(!file){errors.push(url+': output missing');continue;}
  const html=fs.readFileSync(file,'utf8'),ns=nodes(html),metas=new Map();for(const n of ns.filter(n=>n.tag==='meta')){const key=n.attrs.name||n.attrs.property;if(metas.has(key))errors.push(`${url}: repeated meta ${key}`);metas.set(key,n.attrs.content);}
  assert(ns.filter(n=>n.tag==='h1').length===1,`${url}: expected exactly one H1`);
  const ts=ns.filter(n=>n.tag==='title');assert(ts.length===1,`${url}: expected one title`);const title=ts[0]?text(inner(html,ts[0])):'';
  const description=metas.get('description');for(const [value,map,label]of [[title,metaTitles,'title'],[description,descriptions,'description']]){assert(Boolean(value),`${url}: missing ${label}`);assert(!map.has(value),`${url}: duplicate ${label} with ${map.get(value)}`);map.set(value,url);}
  const canon=ns.filter(n=>n.tag==='link'&&n.attrs.rel==='canonical');assert(canon.length===1&&canon[0].attrs.href===ORIGIN+url,`${url}: canonical must self-reference ${ORIGIN+url}`);
  for(const key of ['og:title','og:description','og:url','og:type','og:image','og:image:alt','og:image:width','og:image:height','twitter:card','twitter:title','twitter:description','twitter:image','twitter:image:alt'])assert(Boolean(metas.get(key)),`${url}: missing ${key}`);
  assert(metas.get('og:url')===ORIGIN+url,`${url}: OG URL mismatch`);
  assert(!metas.get('robots')?.includes('noindex'),`${url}: published page unexpectedly noindex`);
  const schemas=[];for(const n of ns.filter(n=>n.tag==='script'&&n.attrs.type==='application/ld+json')){try{schemas.push(JSON.parse(inner(html,n)));}catch(e){errors.push(`${url}: JSON-LD parse error: ${e.message}`);}}
  const article=manifest.articles.find(a=>a.url===url);
  if(article){const posting=schemas.filter(s=>s['@type']==='BlogPosting');assert(posting.length===1,`${url}: expected one BlogPosting`);assert(schemas.some(s=>s['@type']==='BreadcrumbList'),`${url}: BreadcrumbList missing`);assert(metas.get('robots')?.includes('max-image-preview:large'),`${url}: max-image-preview missing`);if(posting[0]){assert(posting[0].datePublished===article.publishedAt&&(posting[0].dateModified??null)===(article.updatedAt??null),`${url}: structured dates disagree`);assert(posting[0].author?.name==='Webtellisense Editorial Team',`${url}: author mismatch`);}
   const prose=ns.find(n=>'data-blog-prose'in n.attrs);const headings=nodes(inner(html,prose)).filter(n=>/^h[1-6]$/.test(n.tag));let previous=1;for(const h of headings){assert(['h2','h3'].includes(h.tag),`${url}: prose headings must be H2/H3`);assert(+h.tag[1]<=previous+1,`${url}: heading level skipped before ${text(inner(inner(html,prose),h))}`);previous=+h.tag[1];}
   assert(!ns.some(n=>n.tag==='form'),`${url}: newsletter/form present on article`);
  }
  const ids=new Set();for(const n of ns){if(n.attrs.id){assert(!ids.has(n.attrs.id),`${url}: duplicate id ${n.attrs.id}`);ids.add(n.attrs.id);}}
  for(const n of ns){
   if(n.tag==='a'&&n.attrs.href){const href=n.attrs.href;let target;try{target=new URL(href,ORIGIN+url);}catch{errors.push(`${url}: malformed link ${href}`);continue;}
    if(target.origin===ORIGIN||target.hostname==='www.webtellisense.com'){const dest=resolveFile(output,target.pathname);assert(dest,`${url}: internal link does not resolve ${href}`);if(dest&&target.hash&&target.hash!=='#'){const ds=nodes(fs.readFileSync(dest,'utf8'));assert(ds.some(n=>n.attrs.id===decodeURIComponent(target.hash.slice(1))),`${url}: fragment missing ${href}`);}}
   }
   if(n.tag==='img'){
    const src=n.attrs.src||'';
    if(/^https:\/\/www\.facebook\.com\/tr\?/.test(src)){warnings.push(`${url}: unchanged legacy noscript tracking pixel excluded from content-image checks`);continue;}
    assert('alt'in n.attrs,`${url}: image alt missing ${src}`);assert(+n.attrs.width>0&&+n.attrs.height>0,`${url}: image dimensions missing ${src}`);
    assert(!/^https?:|^\/\//.test(src),`${url}: hotlinked content image ${src}`);
    assert(Boolean(resolveFile(output,new URL(src,ORIGIN+url).pathname)),`${url}: missing image ${src}`);
    for(const v of (n.attrs.srcset||'').split(',').filter(Boolean)){const variant=v.trim().split(/\s+/)[0];assert(Boolean(resolveFile(output,new URL(variant,ORIGIN+url).pathname)),`${url}: missing image variant ${variant}`);}
   }
   if(['script','link'].includes(n.tag)){const src=n.tag==='script'?n.attrs.src:n.attrs.rel==='stylesheet'?n.attrs.href:null;if(src&&!/^https?:|^\/\//.test(src))assert(Boolean(resolveFile(output,new URL(src,ORIGIN+url).pathname)),`${url}: missing local script/style ${src}`);}
  }
  const social=metas.get('og:image');if(social){try{const f=resolveFile(output,new URL(social).pathname),m=await sharp(f).metadata();assert(m.width===1200&&m.height===630,`${url}: social image must be 1200x630`);}catch(e){errors.push(`${url}: social image unreadable`);}}
  metadata.set(url,{html,metas});
 }
 const sitemap=read(output,'sitemap.xml'),rss=read(output,'blog/rss.xml'),related=read(output,'blog/related.json');
 const locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>decode(m[1]));assert(new Set(locs).size===locs.length,'Sitemap has duplicate URLs');
 for(const a of manifest.articles){const block=[...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].find(m=>m[1].includes('<loc>'+ORIGIN+a.url+'</loc>'));assert(Boolean(block),`Sitemap missing ${a.url}`);assert(block?.[1].includes('<lastmod>'+(a.updatedAt||a.publishedAt)+'</lastmod>'),`Sitemap lastmod mismatch ${a.url}`);assert(rss.includes('<link>'+ORIGIN+a.url+'</link>'),`RSS missing ${a.url}`);}
 const archiveUpdatedAt=JSON.parse(read(root,'content/blog/settings.json')).archiveUpdatedAt;
 for(const url of manifest.listings){const category=sourceArticles.map(a=>a.category).find(c=>url===categoryURL(c)||url.startsWith(categoryURL(c)+'/'));const items=category?sourceArticles.filter(a=>a.category===category):sourceArticles;const last=[archiveUpdatedAt,...items.map(a=>a.updatedAt||a.publishedAt)].sort().at(-1);const block=[...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].find(m=>m[1].includes('<loc>'+ORIGIN+url+'</loc>'));assert(block?.[1].includes('<lastmod>'+last+'</lastmod>'),'Archive sitemap lastmod mismatch: '+url);}
 const rssItems=[...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)];assert(rssItems.length===manifest.articles.length,'RSS item count disagrees with published articles');for(const item of rssItems){const link=item[1].match(/<link>(.*?)<\/link>/)?.[1];assert(expected.has(new URL(decode(link)).pathname),'RSS contains non-published article '+link);}
 const publishedRoutes=new Set([...expected,...manifest.listings]);
 for(const loc of locs){if(new URL(loc).pathname.startsWith('/blog'))assert(publishedRoutes.has(new URL(loc).pathname),'Sitemap contains stale blog archive '+loc);assert(Boolean(resolveFile(output,new URL(loc).pathname)),'Sitemap file missing '+loc);}
 for(const f of fs.readdirSync(contentDir).filter(f=>f.endsWith('.md'))){const a=parseArticle(fs.readFileSync(path.join(contentDir,f),'utf8'),f,root);if(a.status==='draft'||a.heroImage==='MISSING'){
  assert(!resolveFile(output,a.url),`Draft route leaked: ${a.url}`);for(const [name,body] of [['sitemap',sitemap],['RSS',rss],['related',related],['manifest',JSON.stringify(manifest)],...[...metadata].map(([url,o])=>[url,o.html])])assert(!body.includes(a.url+'"')&&!body.includes(a.url+'<')&&!body.includes(a.url+'&'),`Draft reference leaked into ${name}: ${a.url}`);
 }}
 // Existing non-blog sitemap entries must be preserved exactly.
 const legacyURLs=new Set(JSON.parse(read(root,'content/blog/legacy.json')).map(a=>ORIGIN+a.url));
 for(const loc of [...read(root,'sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>decode(m[1])))if(!legacyURLs.has(loc)&&loc!==ORIGIN+'/blog')assert(locs.includes(loc),'Non-blog sitemap entry removed: '+loc);
 const robots=read(output,'robots.txt');assert(!/^Disallow:\s*\/(?:\s*$|blog)/im.test(robots),'robots.txt blocks blog crawling');
 if(!quiet){for(const message of errors)console.error('FAIL '+message);console.log(`Blog check: ${inspected.length} pages, ${manifest.articles.length} articles, ${rssItems.length} RSS items; ${errors.length} failure(s), ${warnings.length} unchanged tracking-pixel exception(s).`);}
 return {errors,warnings,pages:inspected.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const i=process.argv.indexOf('--out');try{const r=await checkBlog({output:i>=0?path.resolve(process.argv[i+1]):path.join(ROOT,'public')});if(r.errors.length)process.exitCode=1;}catch(e){console.error('Blog check failed: '+e.message);process.exitCode=1;}}
