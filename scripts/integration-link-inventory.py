"""Current integration graph, preserving PR #4's immutable 71-link baseline."""
import json
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
    if any(p in file.parts for p in ('public','node_modules','.git')): continue
    name = file.relative_to(ROOT).as_posix()
    page = inspect(name,file.read_text())
    for a in page['links']:
        a['status'] = 'Retained PR #4' if key(a) in before else 'Added in integration'
        a['reason'] = before[key(a)]['reason'] if key(a) in before else reasons.get(key(a),'Flagship explanation, service context or next step.')
        matrix.append(a)
    pages.append({'page':name,**page})
assert set(before) <= {key(a) for a in matrix}, 'A PR #4 contextual link was lost'
assert len([a for a in matrix if a['destination'].split('#')[0]=='heroes.html' and a['status']=='Added in integration']) == 10
result = {'baseline':'1dab681492ea2f2cab18fde9d942acffce6211d5','preserved_pr4_links':71,'total_current_contextual_links':len(matrix),'new_heroes_inbound_links':10,'new_heroes_sources':sorted({a['source']for a in matrix if a['destination'].split('#')[0]=='heroes.html'}),'destinations':dict(sorted(Counter(a['destination'].split('#')[0]for a in matrix).items())),'pages':pages,'links':matrix}
(ROOT/'docs/integration-linking-inventory.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({k:v for k,v in result.items()if k not in ('pages','links')},indent=2))
