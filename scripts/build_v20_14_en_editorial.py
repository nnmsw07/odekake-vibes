import json, html
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
seed=json.loads((ROOT/'seed.json').read_text())
spots={s.get('slug') or f"{s['spot_id']}-spot":s for s in seed['spots']}

def e(v): return html.escape(str(v or ''), quote=True)
def en(s): return s.get('i18n',{}).get('en',{})
def name(slug):
    s=spots[slug]; return en(s).get('name') or s['name']
def copy(slug):
    s=spots[slug]; return en(s).get('public_copy') or f"A Kibun outing spot in {loc(slug)}. Check the official venue for current details."
def loc(slug):
    s=spots[slug]; d=en(s); return ' · '.join(x for x in [d.get('city'), d.get('prefecture')] if x) or s.get('city','')
def head(title,desc,canonical,ja):
    return f'''<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)}</title><meta name="description" content="{e(desc)}"><link rel="canonical" href="{canonical}"><link rel="alternate" hreflang="en" href="{canonical}"><link rel="alternate" hreflang="ja" href="{ja}"><link rel="alternate" hreflang="x-default" href="{ja}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="stylesheet" href="/styles.css?v=201400"><link rel="stylesheet" href="/en/styles.css?v=201400">'''
def header(ja):
    return f'''<header class="topbar"><a class="brand" href="/en/"><span class="brand-dot"></span>Kibun Trip</a><span class="topbar-tag">MOOD → DAY</span><div class="topbar-actions"><a class="lang-switch" href="{ja}" hreflang="ja">JA</a></div></header>'''
footer='''<footer class="footer shell"><div>© Kibun Trip</div><div class="footer-links"><a href="/en/">Mood</a><a href="/en/spots/">Spots</a><a href="/en/magazine/">Features</a><a href="/en/plans/">Plans</a></div></footer>'''

def article(path,title,kicker,lead,slugs,ja,tip):
    cards=''.join(f'''<article class="en-feature-place"><div><small>{e(loc(slug))}</small><h2>{e(name(slug))}</h2><p>{e(copy(slug))}</p></div><a href="/en/spots/{e(slug)}/">View spot →</a></article>''' for slug in slugs)
    canonical='https://kibuntrip.com/en/magazine/'+path+'/'
    body=f'''<!doctype html><html lang="en"><head>{head(title+' | Kibun Trip',lead,canonical,ja)}</head><body class="en-site"><>{''}</>'''
    body=f'''<!doctype html><html lang="en"><head>{head(title+' | Kibun Trip',lead,canonical,ja)}</head><body class="en-site">{header(ja)}<main><article class="shell en-feature-article"><p class="eyebrow">{e(kicker)}</p><h1>{e(title)}</h1><p class="en-feature-lead">{e(lead)}</p><div class="note"><strong>Kibun note</strong><p>{e(tip)}</p></div><div class="en-feature-list">{cards}</div><p class="en-back"><a href="/en/magazine/">← All English features</a></p></article></main>{footer}</body></html>'''
    p=ROOT/'en'/'magazine'/path/'index.html';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(body)

floor=[
 '247-restaurant-minatomirai','chano-ma-yokohama','umi-zoi-kikori-shokudo','kichiri-mollis-shinjuku','tatami-cafe-kumasanchi','100spoons-tachikawa','100spoons-toyosu','latte-chano-mama-shinjuku','spot_063-spot','spot_069-spot'
]
# Last two are existing chano-ma / yusoshi fallback slugs in this repo; keep them after the new non-chain options.
# Replace with name-based matches if exact legacy slugs changed.
def slug_by_name(part, fallback):
    for k,s in spots.items():
        if part.lower() in str(s.get('name','')).lower(): return k
    return fallback
floor[-2]=slug_by_name('yusoshi chano-ma 上野',floor[-2])
floor[-1]=slug_by_name('chano-ma 二子玉川',floor[-1])
article('floor-seating-cafes','Floor & tatami seating with a baby: 10 places','WITH A BABY · TOKYO / KANAGAWA','Restaurants and cafés where shoe-off, raised or tatami-style seating can make a meal with a baby easier.',floor,'https://kibuntrip.com/magazine/floor-seating-with-baby/','Seat types and reservations can change. For floor or tatami seating, confirm the exact seat when booking — especially if lying down or crawling space matters.')

baby=[
 'aloha-food-factory-shin-yokohama','kamakura-kaigan-table','100spoons-azamino','belbel-park-yokohama-kannai','100spoons-toyosu','100spoons-tachikawa','tatami-cafe-kumasanchi','culaful-takeshiba','play-park-eric-carle','belbel-park-shinjuku'
]
article('baby-friendly-cafes','Eat while they play: 10 baby- and kids-space spots','FAMILY TABLE · PLAY SPACE','Places where food, rest and a baby or kids’ space are close enough to make the outing easier for everyone.',baby,'https://kibuntrip.com/magazine/baby-kids-space-cafes/','“Kids space” can mean anything from a small play corner to a dedicated play area. Kibun keeps these as separate family attributes so you can browse what actually matters.')

features=[
 ('floor-seating-cafes','Floor & tatami seating with a baby','Raised mats, tatami and shoe-off seating for easier meals with babies.','/assets/editorial/parents-eat-well.webp','warm'),
 ('baby-friendly-cafes','Eat while they play','Restaurants and cafés with baby or kids spaces nearby.','/assets/editorial/baby-first-outing.webp','green'),
 ('tokyo-with-toddler','Tokyo with a toddler','Low-pressure places that work when a young child sets the pace.','/assets/editorial/baby-first-outing.webp','green'),
 ('rainy-day-tokyo','A rainy day in Tokyo','Indoor places that still feel like a real day out.','/assets/editorial/culture.webp','blue'),
 ('japanese-culture','Japanese culture you can experience','Hands-on culture, craft, kimono, sumo and theatre.','/assets/editorial/culture.webp','warm'),
 ('quiet-yokohama','A quiet afternoon in Yokohama','Art, harbor views and unhurried food for a softer day.','/assets/editorial/scenic.webp','sand')
]
cards=''.join(f'''<a class="magazine-preview-card {theme}" href="/en/magazine/{slug}/"><div class="magazine-preview-media image-shell"><img src="{img}" alt="{e(title)}" loading="lazy"></div><div class="magazine-preview-copy"><small>KIBUN EDIT</small><strong>{e(title)}</strong><p>{e(desc)}</p><span>Read →</span></div></a>''' for slug,title,desc,img,theme in features)
hub=f'''<!doctype html><html lang="en"><head>{head('English features | Kibun Trip','Mood-first outing guides for international visitors and residents in Japan.','https://kibuntrip.com/en/magazine/','https://kibuntrip.com/magazine/')}</head><body class="en-site">{header('/magazine/')}<main><section class="hero shell en-editorial-hero"><p class="eyebrow">KIBUN MAGAZINE</p><h1>Start with<br><em>the kind of day.</em></h1><p class="hero-copy">Not a checklist of famous sights. These are small, practical ideas for how you might want the day to feel.</p></section><section class="shell"><div class="magazine-preview-grid en-magazine-grid">{cards}</div></section></main>{footer}</body></html>'''
(ROOT/'en/magazine/index.html').write_text(hub)

plans=[
 ('Yokohama: art, play, then dinner','A balanced family day with something for the adults, active play for the child, then a seated dinner in Minatomirai.',['Yokohama Museum of Art','BørneLund Play World MARK IS Minatomirai','24/7 restaurant']),
 ('Shinjuku: play first, sit down after','Keep the route simple: indoor play, then a shoe-off or baby-friendly meal without crossing the city.',['Belbel Park Shinjuku','KICHIRI MOLLIS Shinjuku']),
 ('Toyosu: immersive art and an easy family meal','Make teamLab the main event, then recover over a child-friendly meal nearby.',['teamLab Planets TOKYO','100 Spoons TOYOSU']),
 ('Shin-Yokohama: arrive, eat, let them play','A station-connected option when you want lunch and a small kids space in one stop.',['Aloha Food Factory Shin-Yokohama']),
 ('Asakusa: dress, watch, experience','A visitor-focused half day combining kimono and a sumo experience in the same neighborhood.',['YAE Kimono Rental Asakusa Tokyo','Asakusa Sumo Experience']),
 ('Yokohama waterfront reset','Walk by the harbor, browse slowly, then sit down somewhere comfortable instead of filling the day with attractions.',['Yamashita Park','MARINE & WALK YOKOHAMA','chano-ma Yokohama'])
]
plan_cards=''.join(f'''<article class="en-plan-card"><small>READY-MADE DAY</small><h2>{e(t)}</h2><p>{e(d)}</p><div class="chips">{''.join(f'<span class="mini-tag">{e(x)}</span>' for x in stops)}</div></article>''' for t,d,stops in plans)
planhub=f'''<!doctype html><html lang="en"><head>{head('6 ready-made day plans | Kibun Trip','Six easy day-plan ideas around Tokyo and Yokohama for families and international visitors.','https://kibuntrip.com/en/plans/','https://kibuntrip.com/plans/')}</head><body class="en-site">{header('/plans/')}<main><section class="hero shell en-editorial-hero"><p class="eyebrow">READY-MADE DAY</p><h1>Less planning.<br><em>More going.</em></h1><p class="hero-copy">Short sequences that already make geographic sense when you do not want to compare dozens of places.</p></section><section class="shell en-plan-grid">{plan_cards}</section></main>{footer}</body></html>'''
(ROOT/'en/plans/index.html').write_text(planhub)
print('English editorial hub, family features and plans rebuilt')
