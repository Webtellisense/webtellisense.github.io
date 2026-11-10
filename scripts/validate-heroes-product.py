"""Read-only route, source-link and SEO regression comparison against deployed main.

The baseline must be an unmodified archive of ec5d24a, never a deployed website.
"""
import json
import sys
from pathlib import Path
from audit_site import scan
from internal_link_inventory import inspect

ROOT = Path(__file__).resolve().parents[1]
baseline = Path(sys.argv[1] if len(sys.argv) > 1 else '/workspace/scratch/heroes-product-before')
before, after = scan(baseline), scan(ROOT)
checks = ['html_pages', 'broken_file_references', 'broken_fragment_references',
          'canonical_defective_pages', 'description_defective_pages', 'title_defective_pages',
          'h1_defective_pages', 'invalid_jsonld_blocks', 'sitemap_duplicate_urls',
          'sitemap_missing_routes', 'duplicate_pixel_destination_pageviews']
for key in checks:
    assert after['counts'][key] == before['counts'][key], (key, before['counts'][key], after['counts'][key])
for key in checks[1:]:
    assert after['counts'][key] == 0, (key, after['counts'][key])
old_links = inspect('heroes.html', (baseline/'heroes.html').read_text())['links']
new_links = inspect('heroes.html', (ROOT/'heroes.html').read_text())['links']
identity = lambda link: (link['destination'], link['anchor'])
assert {identity(a) for a in old_links} <= {identity(a) for a in new_links}, 'Existing Heroes editorial link lost'
result = {
    'baseline': 'ec5d24a90138a040b4d4f14b28452d20e906fa26',
    'method': 'Fresh 48-page source scan, Pretty URL filesystem resolution and fragment checks; no live Netlify/provider validation.',
    'counts_before': {k: before['counts'][k] for k in checks},
    'counts_after': {k: after['counts'][k] for k in checks},
    'heroes_metadata_unchanged': before['pages'][[p['page'] for p in before['pages']].index('heroes.html')] == after['pages'][[p['page'] for p in after['pages']].index('heroes.html')],
    'heroes_contextual_links': {'before': len(old_links), 'after': len(new_links), 'all_retained': True, 'matrix': new_links},
    'existing_exceptions': {'missing_form_backend_references': after['missing_form_backends'], 'ga_gtm_overlap_pages': after['counts']['ga_gtm_overlap_pages']},
}
assert result['heroes_metadata_unchanged']
(ROOT/'docs/heroes-product-static-validation.json').write_text(json.dumps(result, indent=2, ensure_ascii=False)+'\n')
print(json.dumps({'static_counts': result['counts_after'], 'heroes_contextual_links': len(new_links), 'all_existing_links_retained': True}, indent=2))
