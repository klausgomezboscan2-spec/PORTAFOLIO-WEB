from html.parser import HTMLParser
from urllib.parse import urlparse

class AnchorParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.anchors = []
        self.ids = set()
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag=='a' and 'class' in attrs and 'menu-nav-link' in attrs['class']:
            href = attrs.get('href','')
            self.anchors.append(href)
        if 'id' in attrs:
            self.ids.add(attrs['id'])

p = AnchorParser()
with open('index.html','r',encoding='utf-8') as f:
    p.feed(f.read())

missing = []
for a in p.anchors:
    if a.startswith('#'):
        target = a[1:]
        if target not in p.ids:
            missing.append(a)

print('anchors_found=', len(p.anchors))
if missing:
    print('MISSING_TARGETS:')
    for m in missing:
        print(m)
else:
    print('All menu anchors point to existing IDs')
