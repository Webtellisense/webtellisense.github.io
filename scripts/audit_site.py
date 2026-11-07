"""Read-only static checks; extensionless HTML routes resolve via Netlify Pretty URLs.
No fetching, form submission, analytics, payment or source mutation.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
from collections import Counter
import re,json,sys,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__(convert_charrefs=True);self.tags=[];self.feed(text)
 def handle_starttag(self,t,a):self.tags.append((t,dict(a),self.getpos()[0]))
def scan(root=ROOT):
 files={p.relative_to(root).as_posix():p for p in root.rglob('*.html') if not any(x in p.parts for x in ['node_modules','public','.git'])};ps={k:Page(p.read_text()) for k,p in files.items()}
 counts=Counter();pages=[];broken=[];fragments=[];bad_schema=[];meta=[];forms=[];tracking=[]
 for name,p in files.items():
  s=p.read_text();tags=ps[name].tags;indexable=not any(t=='meta' and a.get('name')=='robots' and 'noindex'in a.get('content','') for t,a,l in tags)
  canon=[a.get('href')for t,a,l in tags if t=='link' and a.get('rel')=='canonical'];descs=[a.get('content','')for t,a,l in tags if t=='meta' and a.get('name')=='description'];titles=re.findall(r'<title[^>]*>(.*?)</title>',s,re.S|re.I)
  expected='https://webtellisense.com/'+(''if name in ['index.html','indexxx.html'] else name.removesuffix('.html'))
  if indexable and (len(canon)!=1 or canon[0]!=expected):counts['canonical_defective_pages']+=1;meta.append({'page':name,'field':'canonical','actual':canon,'expected':expected})
  if len(descs)!=1 or not descs[0].strip():counts['description_defective_pages']+=1;meta.append({'page':name,'field':'description','actual':descs})
  if len(titles)!=1 or not titles[0].strip() or 'Bootstrap Template'in titles[0]:counts['title_defective_pages']+=1
  for m in re.finditer(r'<a\b([^>]*)>(.*?)</a>',s,re.S|re.I):
   if re.search(r'privacy|terms',re.sub('<[^>]+>','',m[2]),re.I) and re.search(r'href=[\"\']#(?:privacy|terms)?[\"\']',m[1]):counts['unresolved_legal_links']+=1
  h1=[l for t,a,l in tags if t=='h1'];counts['h1_defective_pages']+=int(len(h1)!=1)
  for m in re.finditer(r'<script\b([^>]*)>(.*?)</script>',s,re.S|re.I):
   if 'application/ld'not in m[1]:continue
   if 'application/ld+json'not in m[1]:counts['schema_mime_errors']+=1
   try:json.loads(m[2])
   except ValueError as e:counts['invalid_jsonld_blocks']+=1;bad_schema.append({'page':name,'error':str(e)})
  for t,a,line in tags:
   if t=='form' and a.get('action','').endswith('.php') and not(root/a['action']).exists():forms.append({'page':name,'line':line,'action':a['action']});counts['missing_form_backend_references']+=1
   if t=='iframe' and not a.get('title'):counts['untitled_iframes']+=1
   if t in ['input','textarea','select'] and a.get('type')not in ['hidden','submit','button','radio','checkbox'] and not a.get('aria-label') and not a.get('aria-labelledby') and not any(tt=='label'and aa.get('for')==a.get('id') for tt,aa,_ in tags):counts['unlabelled_field_candidates']+=1
   attr='href'if t in ['a','link']else 'src'if t in ['img','script','iframe']else None
   if not attr or attr not in a:continue
   u=urlsplit(a[attr]);
   if u.scheme not in ['','http','https']or(u.netloc and u.netloc not in ['webtellisense.com','www.webtellisense.com']):continue
   if not u.path and not u.fragment:continue
   import posixpath
   target=posixpath.normpath(unquote(u.path).lstrip('/')if u.path.startswith('/')else posixpath.join(posixpath.dirname(name),unquote(u.path)))if u.path else name
   if target=='.':target='index.html'
   if(root/target).is_dir():target=target.rstrip('/')+'/index.html'
   if not(root/target).exists()and(root/(target+'.html')).exists():target+='.html'
   if not(root/target).exists():broken.append({'page':name,'line':line,'kind':'link'if t=='a'else'asset_or_head','target':a[attr]});continue
   if t=='a'and u.fragment and target in ps and not any(aa.get('id')==u.fragment or(tt=='a'and aa.get('name')==u.fragment)for tt,aa,_ in ps[target].tags):fragments.append({'page':name,'line':line,'target':a[attr]})
  pixel_ids=[];events=Counter()
  for m in re.finditer(r"fbq\(\s*['\"](init|track|trackSingle)['\"]\s*,\s*['\"]([^'\"]+)['\"](?:\s*,\s*['\"]([^'\"]+)['\"])?",s):
   op,a,b=m.groups()
   if op=='init':pixel_ids.append(a)
   if op=='track'and a=='PageView':events.update(pixel_ids)
   if op=='trackSingle'and b=='PageView':events[a]+=1
  duplicates=sum(max(0,n-1)for n in events.values());counts['duplicate_pixel_destination_pageviews']+=duplicates
  tracking.append({'page':name,'pixel_ids':pixel_ids,'pageviews_per_destination':dict(events),'ga_ids':re.findall(r"gtag\(['\"]config['\"],\s*['\"]([^'\"]+)",s),'gtm_ids':sorted(set(re.findall('GTM-[A-Z0-9]+',s)))})
  if 'GTM-' in s and re.search(r'gtag\([\"\']config',s):counts['ga_gtm_overlap_pages']+=1
  pages.append({'page':name,'indexable':indexable,'canonical':canon,'descriptions':descs,'titles':titles,'h1_count':len(h1)})
 desc_groups=Counter(r['descriptions'][0].strip() for r in pages if r['descriptions'] and r['descriptions'][0].strip())
 counts['duplicate_description_pages']=sum(n for n in desc_groups.values() if n>1)
 locs=[x.text for x in ET.parse(root/'sitemap.xml').iter() if x.tag.endswith('}loc')]
 counts.update({'html_pages':len(files),'broken_file_references':len(broken),'broken_fragment_references':len(fragments),'sitemap_duplicate_urls':len(locs)-len(set(locs))})
 # Missing sitemap locations, resolving the same Pretty URL aliases as page links.
 missing=[]
 for loc in locs:
  f=urlsplit(loc).path.lstrip('/')or'index.html'
  if not(root/f).exists()and not(root/(f+'.html')).exists():missing.append(loc)
 counts['sitemap_missing_routes']=len(missing)
 for key in ['canonical_defective_pages','description_defective_pages','title_defective_pages','h1_defective_pages','invalid_jsonld_blocks','schema_mime_errors','duplicate_pixel_destination_pageviews','untitled_iframes','unlabelled_field_candidates','missing_form_backend_references']:counts.setdefault(key,0)
 return {'method':'Static checks with Netlify Pretty URL alias resolution; no live provider validation. Unlabelled fields are candidates, not a WCAG verdict.','counts':dict(counts),'pages':pages,'broken_files':broken,'broken_fragments':fragments,'metadata':meta,'schema_errors':bad_schema,'missing_form_backends':forms,'tracking':tracking,'sitemap':locs,'missing_sitemap_routes':missing}
if __name__=='__main__':
 data=scan();out=json.dumps(data,indent=2,ensure_ascii=False)+'\n'
 if len(sys.argv)>1:Path(sys.argv[1]).write_text(out)
 else:print(out)
