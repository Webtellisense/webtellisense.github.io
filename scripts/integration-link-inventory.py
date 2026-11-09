"""Current integration graph, preserving PR #4's immutable 71-link baseline."""
import json
import csv
import subprocess
from collections import Counter
from pathlib import Path
from internal_link_inventory import inspect, destination
ROOT = Path(__file__).resolve().parents[1]
original = json.loads((ROOT/'docs/pr4-contextual-links.json').read_text())
key = lambda a: (a['source'], a['destination'], a['anchor'])
before = {key(a): a for a in original}
assert len(before) == 71
reasons = {(a['source'], destination(a['source'], '/'+a['destination']), a['anchor']):a['reason'] for a in json.loads((ROOT/'docs/integration-link-additions.json').read_text())}
pages, matrix = [], []
for file in sorted(ROOT.rglob('*.html')):
    if any(p in file.parts for p in ('public','node_modules','.git','partials')): continue
    name = file.relative_to(ROOT).as_posix()
    page = inspect(name,file.read_text())
    # Operational privacy notices/review drafts are audited separately, not inflated
    # into the indexable editorial service/article network.
    page['operational_links'] = [a for a in page['links'] if not page['indexable_in_source'] or a['destination'].split('#')[0] in ('privacy-policy.html','service-terms.html')]
    page['links'] = [a for a in page['links'] if a not in page['operational_links']]
    for a in page['links']:
        a['status'] = 'Retained PR #4' if key(a) in before else 'Added in integration'
        a['reason'] = before[key(a)]['reason'] if key(a) in before else reasons.get(key(a),'Flagship explanation, service context or next step.')
        matrix.append(a)
    pages.append({'page':name,**page})
assert set(before) <= {key(a) for a in matrix}, 'A PR #4 contextual link was lost'
heroes_inbound = len([a for a in matrix if a['destination'].split('#')[0]=='heroes.html' and a['status']=='Added in integration'])
assert heroes_inbound >= 10, 'Previously integrated Heroes connections were lost'
result = {'baseline':'1dab681492ea2f2cab18fde9d942acffce6211d5','preserved_pr4_links':71,'total_current_contextual_links':len(matrix),'new_heroes_inbound_links':heroes_inbound,'new_heroes_sources':sorted({a['source']for a in matrix if a['destination'].split('#')[0]=='heroes.html'}),'destinations':dict(sorted(Counter(a['destination'].split('#')[0]for a in matrix).items())),'pages':pages,'links':matrix}
(ROOT/'docs/integration-linking-inventory.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
# Completion-pass comparison is against the reviewed integration checkpoint, not main.
checkpoint=json.loads(subprocess.check_output(['git','show','1a3941a:docs/integration-linking-inventory.json'],cwd=ROOT,text=True))
retained={key(a) for a in checkpoint['links']}
assert retained <= {key(a) for a in matrix}, 'An earlier integration contextual link was lost'
added=[a for a in matrix if key(a) not in retained]
with (ROOT/'docs/completion-internal-linking-matrix.csv').open('w',newline='') as output:
    writer=csv.DictWriter(output,fieldnames=['source','destination','anchor','status','reason','line','context'],lineterminator='\n')
    writer.writeheader()
    for a in matrix:writer.writerow({**a,'status':'Added in completion pass'if key(a)not in retained else'Retained from PR #5 integration'})
summary={'before_contextual_links':len(retained),'after_all_prose_links':len(matrix),'new_prose_links':len(added),'preserved_pr4_links':71,'indexable_source_prose_links':len(matrix),'indexable_sources':len({a['source']for a in matrix}),'all_sources':len({a['source']for a in matrix}),'new_links_by_destination':dict(Counter(a['destination'].split('#')[0]for a in added)),'repeated_new_anchors':{k:v for k,v in Counter(a['anchor'].casefold()for a in added).items()if v>1},'source_pages_improved':sorted({a['source']for a in added}),'method':'Indexable cross-document prose/list links; exclude navigation, footer, forms, cards, CTAs, canonicals, social/email, noindex sources and operational privacy/review links.'}
(ROOT/'docs/completion-internal-linking-report.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({k:v for k,v in result.items()if k not in ('pages','links')},indent=2))
