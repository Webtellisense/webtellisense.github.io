import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Marked} from 'marked';
import {ORIGIN,AUTHOR,CATEGORIES,categoryURL,auditRoutes,parseArticle,relatedFor,normalRoute,dateOK} from './blog/model.mjs';
import {escapeHTML as e,text,nodes,hasClass,inner,outer,replaceRanges,attrs} from './blog/html.mjs';
import {prepareImage,defaultSocial,processBodyImages} from './blog/images.mjs';
import {headFrom,shell,articlePage,cards,relatedHTML,minutes} from './blog/template.mjs';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const read=(root,file)=>fs.readFileSync(path.join(root,file),'utf8');
const write=(output,file,data)=>{const target=path.join(output,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);};
export function legacyBody(html){
 const ns=nodes(html),existing=ns.find(n=>'data-blog-prose' in n.attrs);if(existing)return inner(html,existing);
 const article=ns.find(n=>n.tag==='article');if(!article)throw Error('Legacy article not found');
 const content=ns.find(n=>hasClass(n,'content')&&n.start>article.start&&n.end<=article.end);if(content)return inner(html,content);
 let body=inner(html,article);const remove=nodes(body).filter(n=>hasClass(n,'post-footer')||hasClass(n,'author'));return replaceRanges(body,remove.map(n=>[n.start,n.end,'']));
}
export function legacyFAQs(body){return nodes(body).filter(n=>n.tag==='details'&&hasClass(n,'faq-item')).map(n=>{const h=inner(body,n),parts=nodes(h),q=parts.find(x=>x.tag==='summary'),a=parts.find(x=>x.tag==='p');return {q:text(inner(h,q)),a:text(inner(h,a))};});}
export function validateBodyLinks(body,a,allowed,articleRoutes,root){
 for(const n of nodes(body).filter(n=>n.tag==='a'&&n.attrs.href)){const h=n.attrs.href;if(h.startsWith('#'))continue;let u;try{u=new URL(h,ORIGIN+a.url);}catch{throw Error(`${a.source||a.slug}: invalid link ${h}`);}if(!['http:','https:','mailto:','tel:'].includes(u.protocol))throw Error(`${a.slug}: unsafe link protocol ${h}`);
 if(u.origin===ORIGIN){const route=normalRoute(u.pathname);if(!allowed.has(route)&&!articleRoutes.has(route))throw Error(`${a.slug}: internal link is not an approved route: ${h}`);if(u.hash&&allowed.has(route)){const file=route==='/'?'index.html':route.slice(1)+'.html';if(fs.existsSync(path.join(root,file))&&!nodes(read(root,file)).some(n=>n.attrs.id===decodeURIComponent(u.hash.slice(1))))throw Error(`${a.slug}: missing fragment ${h}`);}}
 }
}
export async function markdownBody(a,root,output){
 const markdown=new Marked({gfm:true});
 markdown.use({walkTokens(token){if(token.type==='html')throw Error(`${a.source}: raw HTML is not allowed; use Markdown`);if(token.type==='heading'&&![2,3].includes(token.depth))throw Error(`${a.source}: use H2 and H3 only`);}});
 let body=markdown.parse(a.body);body=await processBodyImages(body,root,output);
 body=body.replace(/<p>\s*(<figure>[\s\S]*?<\/figure>)\s*<\/p>/g,'$1');
 body=body.replace(/<table>([\s\S]*?)<\/table>/g,'<div class="blog-table-scroll" role="region" aria-label="Article table" tabindex="0"><table>$1</table></div>');
 body=body.replace(/<blockquote>\s*<p><strong>(Note|Warning):<\/strong>/g,(m,kind)=>`<blockquote class="blog-${kind.toLowerCase()}"><p><strong>${kind}:</strong>`);return body;
}
export function validateLegacy(a,root){
 if(!CATEGORIES.includes(a.category)||!dateOK(a.publishedAt)||!dateOK(a.updatedAt)||a.updatedAt<a.publishedAt||!/^\/[a-z0-9-]+$/.test(a.url)||a.url!=='/'+a.slug)throw Error(`legacy.json: invalid route/category/date for ${a.slug}`);
 if(!fs.existsSync(path.join(root,a.slug+'.html')))throw Error('legacy.json: source missing '+a.slug);
 for(const k of ['title','metaTitle','metaDescription','excerpt','primaryKeyword'])if(typeof a[k]!=='string'||!a[k].trim())throw Error(`legacy.json: ${a.slug} requires ${k}`);
 if(a.author!==AUTHOR)throw Error('legacy.json: organisation byline required');
}
export async function buildBlog({root=ROOT,output=path.join(root,'public'),contentDir=path.join(root,'content/blog'),includeDrafts=false,warn=console.warn}={}){
 if(includeDrafts&&(process.env.CONTEXT||process.env.CI))throw Error('Draft preview is local only; unset CI/CONTEXT and use a separate output directory');
 if(includeDrafts&&path.resolve(output)===path.join(root,'public'))throw Error('Draft preview must use a separate --out directory, never public');
 if(!fs.existsSync(output))throw Error('Build the static site first, or provide an existing --out directory');
 const allowed=auditRoutes(root),legacy=JSON.parse(read(root,'content/blog/legacy.json'));
 const ctas=JSON.parse(read(root,'content/blog/cta.json'));for(const [cat,cta] of Object.entries(ctas)){if(!CATEGORIES.includes(cat)||!allowed.has(normalRoute(cta.destination)))throw Error('Invalid category CTA destination: '+cat+' '+cta.destination);}
 const md=fs.readdirSync(contentDir).filter(f=>f.endsWith('.md')).sort().map(f=>parseArticle(fs.readFileSync(path.join(contentDir,f),'utf8'),f,root));
 const slugs=new Set(),excluded=[];
 for(const a of [...legacy,...md]){if(slugs.has(a.slug))throw Error(`Duplicate article slug: ${a.slug}`);slugs.add(a.slug);if(!a.url)a.url='/'+a.slug;if(!a.legacy&&md.includes(a)&&fs.existsSync(path.join(root,a.slug+'.html')))throw Error(`${a.source}: slug collides with existing HTML route`);}
 for(const a of legacy)validateLegacy(a,root);
 for(const a of md){if(a.heroImage==='MISSING'){warn(`${a.source}: hero MISSING; neutral placeholder in local preview`);if(a.status==='ready'){warn(`${a.source}: ready downgraded to draft because hero is MISSING`);a.status='draft';}}if(a.status==='draft')excluded.push(a);}
 const published=[...legacy.map(a=>({...a,legacy:true,status:'ready'})),...md.filter(a=>a.status==='ready')].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)||a.slug.localeCompare(b.slug));
 const previews=includeDrafts?excluded.map(a=>({...a,preview:true})):[];
 const routes=new Set(published.map(a=>a.url));
 // Validate explicit relations even when an article is a draft; unknown slugs are typos.
 for(const a of md)for(const slug of a.related||[])if(!slugs.has(slug)||slug===a.slug)throw Error(`${a.source}: invalid related slug ${slug}`);
 // Delete only files recorded as owned by a previous blog build, not unrelated output.
 const manifestFile=path.join(output,'blog-build.json');if(fs.existsSync(manifestFile)){const previous=JSON.parse(fs.readFileSync(manifestFile));for(const file of previous.files||[]){if(typeof file!=='string'||file.includes('..')||path.isAbsolute(file))throw Error('Unsafe previous blog output manifest');if(file==='blog.html'||file.startsWith('blog/')||previous.generatedSlugs?.some(s=>file===s+'.html'))fs.rmSync(path.join(output,file),{force:true});}}
 const owned=[],emit=(file,data)=>{write(output,file,data);owned.push(file);};
 const generatedDir=path.join(output,'assets/img/blog/generated');
 fs.rmSync(generatedDir,{recursive:true,force:true});
 const sourceImages=path.join(root,'assets/img/blog/generated');
 if(fs.existsSync(sourceImages))fs.cpSync(sourceImages,generatedDir,{recursive:true});
 const defaultImage=await defaultSocial(output);
 for(const a of [...published,...previews]){
  const image=a.legacy?a.image:a.heroImage;
  if(image&&image!=='MISSING')a.imageData=await prepareImage(root,output,image);
  a.socialImage=a.imageData?.social||defaultImage;
  const html=a.legacy?legacyBody(read(root,a.slug+'.html')):await markdownBody(a,root,output);
  a.renderedBody=html;a.readingTime=minutes(html);a.author??=AUTHOR;
  if(a.legacy)a.faqs=legacyFAQs(html);
  validateBodyLinks(html,a,allowed,routes,root);
 }
 const head=headFrom(read(root,'business-not-showing-up-online.html'));
 for(const a of [...published,...previews]){
  const related=relatedFor(a,published);
  if(a.legacy){let source=read(root,a.slug+'.html');if(!source.includes('data-blog-prose'))throw Error(`Patch legacy source before building: ${a.slug}`);
   // Build-time chrome replacement may restore a newsletter: always render blog variant.
   source=articlePage(root,headFrom(source),a,a.renderedBody,related,null,{legacy:true});
   emit(a.slug+'.html',source);
  }else emit(a.slug+'.html',articlePage(root,head,a,a.renderedBody,related,ctas[a.category]));
 }
 const activeCategories=CATEGORIES.filter(c=>published.some(a=>a.category===c));
 const categoryNav=`<nav class="blog-categories" aria-label="Blog categories">${activeCategories.map(c=>`<a href="${categoryURL(c)}">${e(c)}</a>`).join('')}</nav>`;
 const listings=[];
 const listing=(items,category=null)=>{
  const base=category?categoryURL(category):'/blog',pages=Math.max(1,Math.ceil(items.length/12));
  for(let page=1;page<=pages;page++){
   const url=page===1?base:base+'/page/'+page,title=(category?category+' articles':'Blog')+(page>1?' — Page '+page:'')+' | Webtellisense';
   const description=(category?`Read ${category.toLowerCase()} articles and practical guides for Nigerian business owners.`:'Practical business, technology and marketing insights for business owners in Eket, Uyo, Akwa Ibom and Nigeria.')+(page>1?' Page '+page+'.':'');
   const slice=items.slice((page-1)*12,page*12),featured=!category&&page===1?slice[0]:null;
   const pagination=pages>1?`<nav class="blog-pagination" aria-label="Pagination">${Array.from({length:pages},(_,i)=>i+1).map(n=>n===page?`<span aria-current="page">${n}</span>`:`<a href="${n===1?base:base+'/page/'+n}" aria-label="Page ${n}">${n}</a>`).join('')}</nav>`:'';
   const main=`<div class="blog-listing"><nav aria-label="Breadcrumb"><a href="/">Home</a> / ${category?'<a href="/blog">Blog</a> / '+e(category):'Blog'}</nav><header><h1>${e(category||'Business insights and practical guides')}${page>1?' — Page '+page:''}</h1><p>${e(description)}</p><a href="/blog/rss.xml">Subscribe via RSS</a></header>${categoryNav}${featured?`<section class="blog-featured" aria-label="Featured article"><p class="blog-category">Featured</p>${cards([featured])}</section>`:''}<section aria-label="Latest articles"><div class="blog-grid">${cards(featured?slice.slice(1):slice)}</div></section>${pagination}</div>`;
   emit(url.slice(1)+'.html',shell(root,head,{title,description,url,image:defaultImage},main));listings.push({url,lastmod:items.reduce((d,a)=>[d,a.updatedAt||a.publishedAt].sort().at(-1),'1970-01-01')});
  }
 };
 listing(published);for(const c of activeCategories)listing(published.filter(a=>a.category===c),c);
 emit('blog/related.json',JSON.stringify(Object.fromEntries(published.map(a=>[a.slug,relatedFor(a,published).map(r=>({slug:r.slug,title:r.title,url:r.url}))])),null,2)+'\n');
 const blogURLs=new Set(['/blog',...legacy.map(a=>a.url)]);
 const base=read(root,'sitemap.xml').replace(/<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g,(entry,loc)=>blogURLs.has(new URL(loc).pathname)?'':entry).replace(/\s*<\/urlset>\s*$/,'');
 const entries=[...published.map(a=>({url:a.url,lastmod:a.updatedAt||a.publishedAt})),...listings];
 emit('sitemap.xml',base+'\n'+entries.map(a=>`  <url><loc>${ORIGIN+e(a.url)}</loc><lastmod>${a.lastmod}</lastmod></url>`).join('\n')+'\n</urlset>\n');
 const last=published.map(a=>a.updatedAt||a.publishedAt).sort().at(-1);
 emit('blog/rss.xml',`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Webtellisense Blog</title><link>${ORIGIN}/blog</link><description>Business insights and practical guides from Webtellisense.</description><language>en-NG</language><atom:link href="${ORIGIN}/blog/rss.xml" rel="self" type="application/rss+xml"/>${last?`<lastBuildDate>${new Date(last+'T00:00:00Z').toUTCString()}</lastBuildDate>`:''}${published.map(a=>`<item><title>${e(a.title)}</title><link>${ORIGIN+e(a.url)}</link><guid isPermaLink="true">${ORIGIN+e(a.url)}</guid><description>${e(a.excerpt)}</description><category>${e(a.category)}</category><pubDate>${new Date(a.publishedAt+'T00:00:00Z').toUTCString()}</pubDate></item>`).join('')}</channel></rss>\n`);
 emit('blog-build.json',JSON.stringify({version:1,preview:includeDrafts,articles:published.map(({slug,url,title,category,publishedAt,updatedAt})=>({slug,url,title,category,publishedAt,updatedAt})),listings: listings.map(a=>a.url),generatedSlugs:md.filter(a=>a.status==='ready'||includeDrafts).map(a=>a.slug),files:owned},null,2)+'\n');
 console.log(`Blog: ${published.length} published, ${excluded.length} excluded draft(s), ${previews.length} local preview(s); ${listings.length} archive page(s).`);
 return {published,excluded,listings,output};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),out=args.indexOf('--out');
 try{await buildBlog({includeDrafts:args.includes('--preview-drafts'),output:out>=0?path.resolve(args[out+1]):path.join(ROOT,'public')});}catch(e){console.error('Blog build failed: '+e.message);process.exitCode=1;}
}
