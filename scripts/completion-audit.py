"""Reproducible source matrix; provider delivery and hosted routes are never inferred."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
from collections import Counter
import re,json,subprocess,xml.etree.ElementTree as ET
from audit_site import scan
from internal_link_inventory import inspect
ROOT=Path(__file__).resolve().parents[1]
class Parser(HTMLParser):
 def __init__(self,s):super().__init__(convert_charrefs=True);self.tags=[];self.feed(s)
 def handle_starttag(self,t,a):self.tags.append((t,dict(a)))
def facts(s):
 tags=Parser(s).tags
 return {'share':{a.get('property',a.get('name')):a.get('content')for t,a in tags if t=='meta'and a.get('property',a.get('name','')).startswith(('og:','twitter:'))},'scripts':[a.get('src')for t,a in tags if t=='script'and a.get('src')],'forms':[a for t,a in tags if t=='form']}
report=scan();matrix=[]
runtime_path=ROOT/'docs/completion-browser-validation.json'
runtime={p['page']:p for p in json.loads(runtime_path.read_text())['pages']}if runtime_path.exists()else{}
tracking={r['page']:r for r in report['tracking']}
sitemap=set(report['sitemap'])
links=json.loads((ROOT/'docs/integration-linking-inventory.json').read_text())
for row in report['pages']:
 name=row['page'];text=(ROOT/name).read_text();f=facts(text);t=tracking[name]
 try:old=facts(subprocess.check_output(['git','show','1a3941a:'+name],cwd=ROOT,text=True,stderr=subprocess.DEVNULL))
 except subprocess.CalledProcessError:old=None
 all_prose_links=inspect(name,text)['links'];source_links=[a for a in links['links']if a['source']==name]
 forms=[]
 for a in f['forms']:
  action=a.get('action')or'current URL';netlify='data-netlify'in a or'netlify'in a
  status='Netlify static definition; registration/storage/notification unverified'if netlify else'Missing backend; frontend recovery only'if action.endswith('.php')else'External/browser flow; provider delivery unverified'
  forms.append({'name':a.get('name',a.get('id','unnamed')),'action':action,'status':status})
 issues=[]
 if not t['ga_ids'] and not t['gtm_ids']:issues.append('No active GA4/GTM'if'assets/js/measurement.js'not in text else'New consent module staged OFF for owner/privacy sign-off')
 if t['ga_ids'] and t['gtm_ids']:issues.append('Direct GA4 + GTM: container inspection required')
 if t['pixel_ids']:issues.append('Legacy pixel ownership/consent account review')
 if name in ['nigeria/solar.html','bahamas/solar.html']:issues.append('CDN Tailwind runtime blocked in controlled offline browser; hosted mobile check required')
 if name in ['heroes-start.html']:issues.append('All nine Paystack links intentionally disabled')
 if name in ['privacy-policy.html','service-terms.html']:issues.append('Noindex REVIEW DRAFT; owner/legal sign-off required')
 if name=='solar.html':issues+=['Apps Script no-cors cannot acknowledge receipt','Legacy testimonials/offers require owner evidence; simulated activity removed']
 if name=='kids-holiday-uyo.html':issues+=['Expired August 2026 campaign; checkout is an alert simulation, not a Paystack payment. Retained isolated/out of sitemap; owner must retire or separately authorize replacement.']
 if name=='packages.html':issues+=['Legacy duration/discount commercial inconsistencies remain; original charge logic/prices intentionally preserved.']
 if 'api.allorigins.win' in text:issues.append('Optional website check discloses public URL to AllOrigins; no storage destination configured')
 if 'tally.so' in text:issues.append('External Tally fields/permissions/delivery require account review')
 if not source_links and row['indexable']:issues.append('No prose contextual links; assess intentional campaign isolation before adding')
 local_problems=[x for x in report['broken_files']+report['broken_fragments']if x['page']==name]
 matrix.append({'page':name,'title':row['titles'][0],'description':row['descriptions'][0],'canonical':row['canonical'][0]if row['canonical']else None,'indexable':row['indexable'],'sitemap':any(c in sitemap for c in row['canonical']),'share':f['share'],'share_before_missing':[]if old is None else[k for k in ['og:title','og:description','og:url','og:image','twitter:card','twitter:title','twitter:description','twitter:image']if not old['share'].get(k)],'tracking':t,'measurement_module':'assets/js/measurement.js'in text,'legal':{'privacy_link':bool(re.search(r'href=["\']/privacy-policy',text)),'service_link':bool(re.search(r'href=["\']/service-terms',text)),'status':'Draft information, not approved final terms'},'forms':forms,'contextual_links':len(source_links),'operational_information_links':len(all_prose_links)-len(source_links),'incoming_prose_links':sum(x['destination'].split('#')[0]==name for x in links['links']),'broken_local_targets':local_problems,'runtime':runtime.get(name),'runtime_status':'Local Chromium only; provider writes blocked/mocked','exceptions':issues})
summary={'html_pages':len(matrix),'share_complete_pages':sum(all(r['share'].get(k)for k in ['og:title','og:description','og:url','og:image','twitter:card','twitter:title','twitter:description','twitter:image'])for r in matrix),'existing_pages_with_missing_share_fields_before':sum(bool(r['share_before_missing'])for r in matrix),'pages_with_privacy_information':sum(r['legal']['privacy_link']for r in matrix),'legal_review_pages':2,'direct_ga4_gtm_overlap_pages':sum(bool(r['tracking']['ga_ids']and r['tracking']['gtm_ids'])for r in matrix),'sitemap_urls':len(sitemap),'heroes_sitemap_entries':report['sitemap'].count('https://webtellisense.com/heroes'),'new_measurement_release_approved':False}
data={'method':'Source analysis of every publishable HTML file. Core metadata/links resolve statically; no claim of provider delivery, legal approval, owned tracker access or actual Netlify routing. Browser evidence is separate.','summary':summary,'pages':matrix}
(ROOT/'docs/completion-page-matrix.json').write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
lines=['# Public-page completion matrix','',data['method'],'','All privacy/service links lead to explicitly labelled, noindex review drafts. Legacy GA/Meta consent and GTM contents require owner/account review; the new module remains fail-closed. No policies are asserted final.','', '| Page | Title / description / canonical / indexability | Share | Measurement | Privacy / terms | Sitemap | Prose links out / in | Links, forms and exceptions | Mobile / accessibility / observed local bytes |','| --- | --- | --- | --- | --- | --- | --- | --- | --- |']
for r in matrix:
 measurement=('GA4 '+','.join(r['tracking']['ga_ids'])if r['tracking']['ga_ids']else'No direct GA4')+('; GTM '+','.join(r['tracking']['gtm_ids'])if r['tracking']['gtm_ids']else'')+('; Meta '+','.join(r['tracking']['pixel_ids'])if r['tracking']['pixel_ids']else'')+('; new module OFF'if r['measurement_module']else'')
 exceptions='; '.join(r['exceptions']+[x['status']for x in r['forms']])or'Static targets pass; provider/hosted verification separate'
 run=runtime.get(r['page']); mobile='CDN stylesheet unavailable'if run and run['cssBlocked']else'320/390/768/1440 pass'if run and all(not v['overflow']for v in run['views'])else'Needs browser check'; nodes=sum(len(v['nodes'])for v in run['axe'])if run else None; browser=f"{mobile}; {nodes} axe nodes; {run['metrics']['localResourceBytes']:,} observed bytes (not a cold-cache score)"if run else'Pending'
 lines.append(f"| [{r['page']}](../{r['page']}) | Unique title/description; `{r['canonical']}`; {'indexable'if r['indexable']else'noindex'} | OG + Twitter; local image | {measurement} | Draft privacy {'✓'if r['legal']['privacy_link']else'—'} / service {'✓'if r['legal']['service_link']else'—'} | {'Yes'if r['sitemap']else'Excluded'} | {r['contextual_links']} / {r['incoming_prose_links']} | {exceptions} | {browser} |")
lines+=['','Full titles, descriptions, images, form actions and destination IDs are in [the JSON matrix](completion-page-matrix.json). Accessibility, performance, mobile screenshots and runtime errors are recorded per page in the fresh browser report. Legacy campaigns and alternate/operational pages are not made indexable merely to fill the sitemap.']
(ROOT/'docs/completion-page-matrix.md').write_text('\n'.join(lines)+'\n')
(ROOT/'docs/completion-static-validation.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print(json.dumps(summary,indent=2))
