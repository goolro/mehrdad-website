#!/usr/bin/env python3
"""Extract all content from mehrdad.ir WordPress REST API"""
import json, time, urllib.request, sys

BASE = "https://mehrdad.ir/wp-json/wp/v2"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

def get(path, retries=3):
    url = f"{BASE}{path}"
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.loads(r.read().decode("utf-8"))
                total = r.headers.get("X-WP-TotalPages", "1")
                return data, int(total)
        except Exception as e:
            print(f"  retry {i+1} {url}: {e}", flush=True)
            time.sleep(2)
    return [], 0

def fetch_all(endpoint, page_size=100):
    results, pages = get(f"{endpoint}?per_page={page_size}&page=1")
    for p in range(2, pages + 1):
        time.sleep(1)
        more, _ = get(f"{endpoint}?per_page={page_size}&page={p}")
        results.extend(more)
    return results

def main():
    out = {}
    print("1/6 Categories...", flush=True)
    out["categories"] = fetch_all("/categories?per_page=100&_fields=id,name,slug,description,count,parent")
    print(f"   -> {len(out['categories'])} categories")
    
    print("2/6 Tags...", flush=True)
    out["tags"] = fetch_all("/tags?per_page=100&_fields=id,name,slug,count")
    print(f"   -> {len(out['tags'])} tags")
    
    print("3/6 Posts...", flush=True)
    out["posts"] = fetch_all("/posts?per_page=100&_fields=id,date,modified,slug,link,status,type,title,content,excerpt,author,categories,tags,featured_media,jetpack_featured_media_url,password")
    print(f"   -> {len(out['posts'])} posts")
    
    print("4/6 Pages...", flush=True)
    out["pages"] = fetch_all("/pages?per_page=100&_fields=id,date,modified,slug,link,title,content,parent,featured_media,password")
    print(f"   -> {len(out['pages'])} pages")
    
    print("5/6 Services CPT...", flush=True)
    out["services"] = fetch_all("/services?per_page=100&_fields=id,date,slug,link,title,content,excerpt,featured_media")
    print(f"   -> {len(out['services'])} services")
    
    print("6/6 Portfolios + Web Stories CPT...", flush=True)
    out["portfolios"] = fetch_all("/portfolios?per_page=100&_fields=id,slug,link,title,content,featured_media")
    out["web_stories"] = fetch_all("/web-story?per_page=100&_fields=id,date,slug,link,title,content,featured_media")
    if not out["web_stories"]:
        out["web_stories"] = fetch_all("/web_stories?per_page=100&_fields=id,date,slug,link,title,content,featured_media")
    print(f"   -> {len(out['portfolios'])} portfolios, {len(out['web_stories'])} web stories")
    
    with open("/home/z/my-project/analysis/wp_content.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)
    total_items = sum(len(v) for v in out.values())
    print(f"DONE. Total items: {total_items}")

if __name__ == "__main__":
    main()
