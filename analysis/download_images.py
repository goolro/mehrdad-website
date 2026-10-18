#!/usr/bin/env python3
"""Download all images (featured + content) from mehrdad.ir"""
import json, os, re, time, urllib.request, urllib.parse

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"
OUT = "/home/z/my-project/public/media"
os.makedirs(OUT, exist_ok=True)

urls = set()

with open('/home/z/my-project/analysis/wp_content.json') as f:
    data = json.load(f)
with open('/home/z/my-project/analysis/featured_media.json') as f:
    fmedia = json.load(f)
with open('/home/z/my-project/analysis/post_images.json') as f:
    content_imgs = json.load(f)

for v in fmedia.values():
    if v.get('url'): urls.add(v['url'])
for u in content_imgs:
    urls.add(u)

print("unique urls:", len(urls))

def fname(url):
    # decode persian names, make safe
    u = urllib.parse.unquote(url.split('?')[0])
    name = u.rstrip('/').split('/')[-1]
    name = re.sub(r'[^\w.\-]', '_', name)
    if not re.search(r'\.(jpe?g|png|gif|webp|svg|ico)$', name, re.I):
        name += '.png'
    return name

def enc_url(url):
    """Encode non-ascii chars in URL path"""
    parts = urllib.parse.urlsplit(url)
    path = urllib.parse.quote(parts.path)
    return urllib.parse.urlunsplit((parts.scheme, parts.netloc, path, parts.query, ''))

ok, fail = 0, 0
mapping = {}
for url in sorted(urls):
    name = fname(url)
    path = os.path.join(OUT, name)
    mapping[url] = f"/media/{name}"
    if os.path.exists(path) and os.path.getsize(path) > 100:
        ok += 1
        continue
    try:
        req = urllib.request.Request(enc_url(url), headers={"User-Agent": UA, "Referer": "https://mehrdad.ir/"})
        with urllib.request.urlopen(req, timeout=30) as r:
            blob = r.read()
        with open(path, 'wb') as f:
            f.write(blob)
        ok += 1
        time.sleep(0.2)
    except Exception as e:
        fail += 1
        mapping[url] = None
        print("FAIL:", url[:90], e)

with open('/home/z/my-project/analysis/image_map.json', 'w') as f:
    json.dump(mapping, f, ensure_ascii=False)
print(f"DONE ok={ok} fail={fail}")
