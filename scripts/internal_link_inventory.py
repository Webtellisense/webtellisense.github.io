"""Read-only editorial inventory and matrix; no provider access or website mutation.

Baseline is PR #4 before this editorial follow-up, not main before technical repairs.
Only embedded cross-document links in prose/list items count. Navigation, headings,
service/article cards, sidebars, forms and replaceable hook prompts do not count.
"""
import csv
import json
import posixpath
import subprocess
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
BASELINE = '730650461a4cff3124a40034bd731b632d186a7c'
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())
SKIP_TAGS = {'nav', 'footer', 'header', 'aside', 'script', 'style', 'form', 'button'}
SKIP_CLASSES = set('sidebar breadcrumbs services-list meta-top meta-bottom toc tags cats '
                   'pricing-card wt-pkg-card blog-posts post-item portfolio-info '
                   'lure-options audit-card social-links footer-links'.split())


def clean(text):
    return ' '.join(text.split())


class Node:
    def __init__(self, tag='', attrs=None, parent=None, line=0):
        self.tag, self.attrs, self.parent, self.line = tag, attrs or {}, parent, line
        self.children = []

    @property
    def text(self):
        return ''.join(c.text if isinstance(c, Node) else c for c in self.children)

    def ancestors(self):
        node = self.parent
        while node:
            yield node
            node = node.parent


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = Node('document')
        self.stack, self.nodes = [self.root], []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        node = Node(tag, dict(attrs), self.stack[-1], self.getpos()[0])
        self.stack[-1].children.append(node)
        self.nodes.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                return

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def destination(page, href):
    url = urlsplit(href)
    if url.scheme not in ('', 'http', 'https') or url.netloc not in ('', 'webtellisense.com', 'www.webtellisense.com'):
        return None
    if not url.path:
        return None  # Same-document fragments do not count as cross-page context.
    path = unquote(url.path)
    path = path.lstrip('/') if path.startswith('/') else posixpath.join(posixpath.dirname(page), path)
    path = posixpath.normpath(path)
    if path == '.':
        path = 'index.html'
    if (ROOT / (path + '.html')).is_file():
        path += '.html'
    if not path.endswith('.html') or path == page:
        return None
    return path + ('#' + url.fragment if url.fragment else '')


def inspect(page, source):
    doc = Document(source)
    has_main = any(n.tag == 'main' for n in doc.nodes)
    links = []
    for node in doc.nodes:
        if node.tag != 'a' or not node.attrs.get('href'):
            continue
        target = destination(page, node.attrs['href'])
        if not target:
            continue
        ancestors = list(node.ancestors())
        prose = next((a for a in ancestors if a.tag in ('p', 'li')), None)
        if not prose or (has_main and not any(a.tag == 'main' for a in ancestors)):
            continue
        if any(a.tag in SKIP_TAGS or SKIP_CLASSES.intersection(a.attrs.get('class', '').split()) for a in ancestors):
            continue
        if any(a.attrs.get('id') in ('hook-question', 'hook-options-container') for a in ancestors):
            continue
        if set(node.attrs.get('class', '').split()).intersection({'btn', 'button-57', 'stretched-link'}):
            continue
        text = clean(node.text)
        if not text or clean(prose.text) == text:
            # Short editorial list items (e.g. Professional branding) still count.
            if prose.tag != 'li' or not any(a.tag == 'article' for a in ancestors):
                continue
        links.append({'source': page, 'destination': target, 'anchor': text,
                      'line': node.line, 'context': clean(prose.text)})
    robots = [n.attrs.get('content', '') for n in doc.nodes if n.tag == 'meta' and n.attrs.get('name', '').lower() == 'robots']
    canonical = [n.attrs.get('href', '') for n in doc.nodes if n.tag == 'link' and n.attrs.get('rel') == 'canonical']
    headings = [clean(n.text) for n in doc.nodes if n.tag in ('h1', 'h2', 'h3')]
    return {'indexable_in_source': not any('noindex' in v.lower() for v in robots),
            'canonical': canonical, 'headings': headings, 'links': links}


def build():
    topics = json.loads((ROOT / 'docs/content-topics.json').read_text())
    additions = json.loads((ROOT / 'docs/editorial-link-additions.json').read_text())
    reasons = {(a['source'], a['destination'], a['anchor']): a['reason'] for a in additions}
    existing_reasons = {
        ('branding.html', 'web-design.html'): 'Retain website application of the logo; clarify the anchor to website headers.',
        ('email-marketing.html', 'web-design.html'): 'Retain the website prerequisite for visitor signups; clarify the anchor.',
        ('conversion-rate-optimization.html', 'web-design.html'): 'Retain the owned-site reference in the traffic and conversion discussion.',
        ('business-not-showing-up-online.html', 'google-business-profile.html'): 'Retain profile management as a response to the local discovery gap.',
        ('how-to-grow-your-business-online-2026.html', 'google-business-profile.html'): 'Retain the first growth step’s local-search service recommendation.',
        ('top-features-for-a-school-website.html', 'web-design.html'): 'Retain the school design next step; add underlining and focus styling.',
    }
    pages, matrix = [], []
    for page, topic in topics.items():
        before_source = subprocess.check_output(['git', 'show', BASELINE + ':' + page], cwd=ROOT, text=True)
        before = inspect(page, before_source)
        after = inspect(page, (ROOT / page).read_text())
        old = {(a['destination'], a['anchor']) for a in before['links']}
        old_destinations = {a['destination'] for a in before['links']}
        for link in after['links']:
            key = (page, link['destination'], link['anchor'])
            if key in reasons:
                link['status'], link['reason'] = 'New', reasons[key]
            else:
                assert (link['destination'], link['anchor']) in old or link['destination'] in old_destinations, link
                link['status'] = 'Existing' if (link['destination'], link['anchor']) in old else 'Existing; anchor refined'
                link['reason'] = existing_reasons[(page, link['destination'])]
            matrix.append(link)
        pages.append({'page': page, **topic, **{k: v for k, v in after.items() if k != 'links'},
                      'links_before': before['links'], 'links_after': after['links']})
    assert sum(a['status'] == 'New' for a in matrix) == len(additions), 'Addition count differs from actual prose anchors'
    assert len(topics) == 36
    core = {p['page'] for p in pages if p['scope'] == 'core'}
    core_matrix = [a for a in matrix if a['source'] in core]
    new = [a for a in matrix if a['status'] == 'New']
    summary = {
        'html_pages_inventoried': len(pages),
        'source_indexable_pages': sum(p['indexable_in_source'] for p in pages),
        'core_pages': len(core),
        'core_contextual_links_before': sum(len(p['links_before']) for p in pages if p['page'] in core),
        'core_contextual_links_after': len(core_matrix),
        'new_contextual_links': len(new),
        'improved_articles': sorted({a['source'] for a in new if topics[a['source']]['kind'] == 'article'}),
        'improved_services': sorted({a['source'] for a in new if topics[a['source']]['kind'] == 'service'}),
        'improved_other_pages': sorted({a['source'] for a in new if topics[a['source']]['kind'] not in ('article', 'service')}),
        'new_links_by_destination': dict(sorted(Counter(a['destination'].split('#')[0] for a in new).items())),
        'all_core_links_by_destination': dict(sorted(Counter(a['destination'].split('#')[0] for a in core_matrix).items())),
        'repeated_new_anchors': {k: v for k, v in Counter(a['anchor'].casefold() for a in new).items() if v > 1},
        'core_pages_without_inbound_context': sorted(core - {a['destination'].split('#')[0] for a in core_matrix}),
        'core_pages_without_outbound_context': sorted(core - {a['source'] for a in core_matrix}),
    }
    return {'baseline': BASELINE, 'method': __doc__.strip(), 'summary': summary, 'pages': pages}, matrix


def write():
    inventory, matrix = build()
    (ROOT / 'docs/internal-linking-inventory.json').write_text(json.dumps(inventory, indent=2, ensure_ascii=False) + '\n')
    (ROOT / 'docs/contextual-links.json').write_text(json.dumps(matrix, indent=2, ensure_ascii=False) + '\n')
    with (ROOT / 'docs/internal-linking-matrix.csv').open('w') as f:
        writer = csv.DictWriter(f, fieldnames=['source', 'destination', 'anchor', 'status', 'reason', 'line', 'context'], lineterminator='\n')
        writer.writeheader()
        writer.writerows(matrix)
    print(json.dumps(inventory['summary'], indent=2))


if __name__ == '__main__':
    write()
