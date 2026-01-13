from html.parser import HTMLParser
from collections import Counter

class IDParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
    def handle_starttag(self, tag, attrs):
        for k,v in attrs:
            if k == 'id':
                self.ids.append(v)

p = IDParser()
with open('index.html','r',encoding='utf-8') as f:
    p.feed(f.read())
counts = Counter(p.ids)
duplicates = {k:v for k,v in counts.items() if v>1}
print('found_ids=', len(p.ids))
if duplicates:
    print('DUPLICATE_IDS:')
    for k,v in duplicates.items():
        print(k, v)
else:
    print('No duplicate ids found')
