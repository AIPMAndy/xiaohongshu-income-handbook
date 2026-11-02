#!/usr/bin/env python3
"""Dependency-free structural checks for the public handbook."""
from pathlib import Path
import re
import json
from html.parser import HTMLParser

ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text(encoding='utf-8')
data=(ROOT/'assets/data.js').read_text(encoding='utf-8')
app=(ROOT/'assets/app.js').read_text(encoding='utf-8')
assert (ROOT/'LICENSE').exists()
assert (ROOT/'assets/social-preview.png').exists()
assert 'github.com/AIPMAndy/xiaohongshu-income-handbook' in html
assert 'metaver.vip' in html
assert 'window.HANDBOOK' in data
assert 'localStorage' in app
assert not re.search(r'\(发布后生效\)',html)

m=re.search(r'window\.HANDBOOK\s*=\s*(\{.*?\});?\s*$',data,re.S)
assert m, 'missing serialized handbook data'
book=json.loads(m.group(1))
assert len(book['chapters'])==26, len(book['chapters'])
assert sum(len(c['steps']) for c in book['chapters'])==78
print('OK: 26 chapters, 78 steps')

class Resources(HTMLParser):
    def __init__(self): super().__init__(); self.ids=set(); self.refs=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.add(a['id'])
        for key in ('src','href'):
            v=a.get(key,'')
            if v.startswith('#') and v!='#': self.refs.append(('anchor',v[1:]))
            elif v and not v.startswith(('http://','https://','mailto:','tel:','data:','javascript:','#','/')):
                self.refs.append(('file',v.split('#')[0].split('?')[0]))
r=Resources();r.feed(html)
for kind,v in r.refs:
    if kind=='anchor': assert v in r.ids, f'Broken anchor: #{v}'
    else: assert (ROOT/v).exists(), f'Missing file: {v}'
assert 'deploy-pages@v4' in (ROOT/'.github/workflows/pages.yml').read_text()
print(f'OK: {len(r.refs)} resource references, Pages workflow, local progress, MIT license')

# V4 practical launch kit, verified 2026-11-02
blueprints=(ROOT/'assets/blueprints.js').read_text(encoding='utf-8')
bm=re.search(r'window\.XHS_BLUEPRINTS\s*=\s*(\{.*?\});?\s*$',blueprints,re.S)
assert bm, 'missing 4-route launch kit'
kit=json.loads(bm.group(1))
assert len(kit['profiles'])==4
assert sum(len(x['notes']) for x in kit['profiles'].values())==12
assert len(kit['roadmap'])==30
assert all(x.get('action') and x.get('checkpoint') and x.get('artifact') for x in kit['roadmap'])
assert [x['day'] for x in kit['roadmap']]==list(range(1,31))
assert all(book['plan'][i]['task']==kit['roadmap'][i]['title'] for i in range(30)), 'plan mismatched with operational data'
assert 'id="launchChecklist"' in html and 'id="personaTabs"' in html and 'id="notesCards"' in html
assert 'window.XHS_BLUEPRINTS' in (ROOT/'assets/blueprints-ui.js').read_text(encoding='utf8')
assert (ROOT/'docs/从零起号到首单-逐步照做版.md').stat().st_size>20000
assert (ROOT/'templates/30-day-operations.csv').exists()
print('OK: 4 persona playbooks, 12 editable notes, 30 detailed days, long-form handbook')
