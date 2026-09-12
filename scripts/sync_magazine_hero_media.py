#!/usr/bin/env python3
from pathlib import Path
import json,re

ROOT=Path(__file__).resolve().parents[1]
seed=json.loads((ROOT/'seed.json').read_text(encoding='utf-8'))
spots=seed.get('spots',[])
by_id={s['spot_id']:s for s in spots if s.get('spot_id')}
by_slug={s.get('slug'):s for s in spots if s.get('slug')}
VERSION='201902'

def hero_src(spot,prefix):
    url=(spot.get('hero_image') or {}).get('url') or 'assets/og-kibuntrip.png'
    if re.match(r'^https?://',url) or url.startswith('/'):
        return url
    return prefix+url.lstrip('./')

def set_attr(tag,name,value):
    pat=re.compile(rf'\b{re.escape(name)}=["\'][^"\']*["\']',re.I)
    if pat.search(tag):
        return pat.sub(f'{name}="{value}"',tag,count=1)
    ending='/>' if tag.rstrip().endswith('/>') else '>'
    core=tag.rstrip()[:-len(ending)].rstrip()
    return f'{core} {name}="{value}"{ending}'

def update_data_hero_imgs(text,prefix):
    pat=re.compile(r'<img\b(?=[^>]*\bdata-hero-spot=["\']([^"\']+)["\'])[^>]*>',re.I)
    def repl(m):
        tag=m.group(0); spot=by_id.get(m.group(1))
        if not spot:return tag
        tag=set_attr(tag,'src',hero_src(spot,prefix))
        tag=set_attr(tag,'data-hero-clean','1')
        return tag
    return pat.sub(repl,text)

def add_spot_feature_media(text,prefix):
    pat=re.compile(r'(<article class="spot-feature">)(.*?)(<a href="/spots/([^/]+)/">)',re.S)
    def repl(m):
        if 'spot-feature-media' in m.group(2):return m.group(0)
        spot=by_slug.get(m.group(4))
        if not spot:return m.group(0)
        img=(f'<div class="spot-feature-media"><img alt="{spot.get("name","")}" '
             f'data-hero-clean="1" data-hero-spot="{spot["spot_id"]}" loading="lazy" '
             f'src="{hero_src(spot,prefix)}"></div>')
        return m.group(1)+img+m.group(2)+m.group(3)
    return pat.sub(repl,text)

def ensure_article_script(text):
    if 'magazine-media.js' not in text:
        return text.replace('</body>',f'<script src="/config.js?v={VERSION}"></script><script src="/magazine/magazine-media.js?v={VERSION}"></script></body>')
    return text

# JP pages and hub
for p in (ROOT/'magazine').rglob('index.html'):
    rel=p.relative_to(ROOT/'magazine')
    prefix='../' if len(rel.parts)==1 else '../../'
    text=p.read_text(encoding='utf-8')
    text=update_data_hero_imgs(text,prefix)
    if len(rel.parts)>1:
        text=add_spot_feature_media(text,prefix)
        if 'magazine-media.js' in text and 'config.js' not in text:
            text=text.replace('<script src="../magazine-media.js',f'<script src="../../config.js?v={VERSION}"></script><script src="../magazine-media.js')
    text=re.sub(r'magazine\.css\?v=\d+','magazine.css?v='+VERSION,text)
    text=re.sub(r'magazine-media\.js\?v=\d+','magazine-media.js?v='+VERSION,text)
    p.write_text(text,encoding='utf-8')

# EN article hero and spot media
for p in (ROOT/'en/magazine').glob('*/index.html'):
    text=p.read_text(encoding='utf-8')
    ja_match=re.search(r'https://kibuntrip\.com/magazine/([^/]+)/',text)
    jp=(ROOT/'magazine'/ja_match.group(1)/'index.html') if ja_match else None
    hero_sid=None
    if jp and jp.exists():
        m=re.search(r'article-hero-media[^>]*>\s*<img[^>]*data-hero-spot="([^"]+)"',jp.read_text(encoding='utf-8'),re.S)
        if m:hero_sid=m.group(1)
    if not hero_sid:
        m=re.search(r'href="/en/spots/([^/]+)/"',text)
        if m and m.group(1) in by_slug: hero_sid=by_slug[m.group(1)]['spot_id']
    if hero_sid in by_id:
        pat=re.compile(r'(<div class="article-hero-media">\s*)(<img[^>]*>)',re.S)
        def hero_repl(m):
            tag=set_attr(m.group(2),'src',hero_src(by_id[hero_sid],'/'))
            tag=set_attr(tag,'data-hero-clean','1');tag=set_attr(tag,'data-hero-spot',hero_sid)
            return m.group(1)+tag
        text=pat.sub(hero_repl,text,count=1)
    pat=re.compile(r'(<section class="article-spot">.*?<div class="article-spot-media">)(<img[^>]*>)(.*?<a href="/en/spots/([^/]+)/">)',re.S)
    def spot_repl(m):
        spot=by_slug.get(m.group(4));tag=m.group(2)
        if not spot:return m.group(0)
        tag=set_attr(tag,'src',hero_src(spot,'/'));tag=set_attr(tag,'data-hero-clean','1');tag=set_attr(tag,'data-hero-spot',spot['spot_id'])
        return m.group(1)+tag+m.group(3)
    text=pat.sub(spot_repl,text)
    text=ensure_article_script(text)
    text=re.sub(r'/magazine/magazine\.css\?v=\d+',f'/magazine/magazine.css?v={VERSION}',text)
    p.write_text(text,encoding='utf-8')

# EN hub: derive representative spot from each article
hub=ROOT/'en/magazine/index.html'
text=hub.read_text(encoding='utf-8')
pat=re.compile(r'(<a class="magazine-preview-card[^"]*" href="/en/magazine/([^/]+)/">.*?<div class="magazine-preview-media image-shell">)(<img[^>]*>)(</div>)',re.S)
def hub_repl(m):
    article=ROOT/'en/magazine'/m.group(2)/'index.html';sid=None
    if article.exists():
        at=article.read_text(encoding='utf-8')
        mm=re.search(r'article-hero-media[^>]*>.*?data-hero-spot="([^"]+)"',at,re.S)
        if mm:sid=mm.group(1)
        if not sid:
            lm=re.search(r'href="/en/spots/([^/]+)/"',at)
            if lm and lm.group(1) in by_slug:sid=by_slug[lm.group(1)]['spot_id']
    if sid not in by_id:return m.group(0)
    tag=set_attr(m.group(3),'src',hero_src(by_id[sid],'/'));tag=set_attr(tag,'data-hero-clean','1');tag=set_attr(tag,'data-hero-spot',sid)
    return m.group(1)+tag+m.group(4)
text=pat.sub(hub_repl,text)
text=ensure_article_script(text)
hub.write_text(text,encoding='utf-8')

# Expand runtime resolver to every hero spot used in magazine pages.
ids=set()
for base in [ROOT/'magazine',ROOT/'en/magazine']:
    for p in base.rglob('*.html'):
        ids.update(re.findall(r'data-hero-spot="([^"]+)"',p.read_text(encoding='utf-8')))
hero_map={}
for sid in sorted(ids):
    spot=by_id.get(sid)
    if not spot:continue
    gp=((spot.get('media_strategy') or {}).get('google_places') or {})
    hero_map[sid]={
        'name':spot.get('name',''),'address':spot.get('address',''),'query':gp.get('query') or spot.get('name',''),
        'placeId':gp.get('place_id') or (spot.get('routing') or {}).get('google_place_id') or '',
        'photoIndex':gp.get('photo_index_override') if isinstance(gp.get('photo_index_override'),int) else None,
        'useAddress':gp.get('use_address') is not False,
    }
media=ROOT/'magazine/magazine-media.js';mt=media.read_text(encoding='utf-8')
mt=re.sub(r'const HERO_SPOTS = \{.*?\};','const HERO_SPOTS = '+json.dumps(hero_map,ensure_ascii=False,separators=(',',':'))+';',mt,count=1,flags=re.S)
media.write_text(mt,encoding='utf-8')
print(f'Synced magazine hero media for {len(hero_map)} referenced spots.')
