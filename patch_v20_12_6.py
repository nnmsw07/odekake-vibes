from pathlib import Path
import json, re

root = Path('.')
seed_path = root/'seed.json'
data_path = root/'data.js'
index_path = root/'index.html'
mag_index_path = root/'magazine'/'index.html'
mag_media_path = root/'magazine'/'magazine-media.js'
delta_path = root/'HERO_OVERRIDES_v20_12_6_DELTA.json'

for p in [seed_path,data_path,index_path,mag_index_path,mag_media_path,delta_path]:
    if not p.exists(): raise SystemExit(f'Missing required file: {p}')

delta=json.loads(delta_path.read_text(encoding='utf-8'))
seed=json.loads(seed_path.read_text(encoding='utf-8'))
by_id={s['spot_id']:s for s in seed['spots']}
for sid,idx in delta['photo_index_overrides'].items():
    s=by_id.get(sid)
    if not s: raise SystemExit(f'{sid} not found')
    s.setdefault('media_strategy',{}).setdefault('google_places',{})['photo_index_override']=idx
for sid,info in delta['place_overrides'].items():
    s=by_id.get(sid)
    if not s: raise SystemExit(f'{sid} not found')
    gp=s.setdefault('media_strategy',{}).setdefault('google_places',{})
    gp.update({
        'query':info['query'],'place_id':info['place_id'],
        'matched_name':info['matched_name'],'matched_address':info['matched_address'],
        'use_address':info['use_address'],'status':'resolved_manual'
    })
    s.setdefault('routing',{})['google_place_id']=info['place_id']

md=seed.setdefault('metadata',{})
md['version']='0.20.12.6'
md['updated_at']='2026-09-06'
md['dataset_name']='kibun_kanto_izu_seed_v20_12_6_473spots_pet_audience'
md['hero_audit_note']='2026-09-06: latest Hero Audit delta applied for LARBOARD and newly added spots. Homepage and Magazine thumbnails now avoid showing stale generic artwork before Places hero resolution.'
md.setdefault('image_policy',{})['hero_selection']='2026-09-06: latest user Hero Audit delta applied for spot_219 and spots 459/460/461/463/465/467/469; manual Google Place matches pinned for spots 459 and 460.'
seed_path.write_text(json.dumps(seed,ensure_ascii=False,indent=2),encoding='utf-8')
data_path.write_text('window.ODEKAKE_SEED = '+json.dumps(seed,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')

html=index_path.read_text(encoding='utf-8')
html=html.replace('src="assets/editorial/special.webp" alt="まだ帰りたくない日の、外ごはん。東京・横浜のテラス6選"','src="assets/editorial/terrace-after-sunset.webp" alt="まだ帰りたくない日の、外ごはん。東京・横浜のテラス6選"')
html=html.replace('469スポットから探せます。','473スポットから探せます。')
html=re.sub(r'(<div class="magazine-preview-media image-shell" data-media-spot="spot_\d+"><img\b)(?![^>]*data-hero-clean=)',r'\1 data-hero-clean="1"',html)
style='''<style id="magazine-preview-hero-clean">\n.magazine-preview-media img[data-hero-clean="1"]{opacity:0;transition:opacity .18s ease}\n.magazine-preview-media img[data-hero-clean="1"][data-hero-state="ready"],\n.magazine-preview-media img[data-hero-clean="1"][data-hero-state="fallback"]{opacity:1}\n</style>'''
if 'id="magazine-preview-hero-clean"' not in html: html=html.replace('</head>',style+'</head>')
if 'data.js?v=201240&amp;h=201260' not in html: html=html.replace('data.js?v=201240','data.js?v=201240&amp;h=201260')
preview='<script src="preview-hero-clean.js?v=201260"></script>'
if preview not in html: html=html.replace('<script src="app.js?v=201125&amp;h=201240"></script>',preview+'<script src="app.js?v=201125&amp;h=201240"></script>')
index_path.write_text(html,encoding='utf-8')

mag=mag_index_path.read_text(encoding='utf-8')
mag=re.sub(r'(<img\b[^>]*data-hero-spot="spot_\d+"(?![^>]*data-hero-clean)[^>]*?)\s*/?>',r'\1 data-hero-clean="1">',mag)
mag=mag.replace('magazine-media.js?v=201250','magazine-media.js?v=201250&amp;h=201260')
mag_index_path.write_text(mag,encoding='utf-8')

mm=mag_media_path.read_text(encoding='utf-8')
mm=mm.replace('    const fallbackTimer=setTimeout(()=>revealFallback(img),2200);\n','')
mm=mm.replace('clearTimeout(fallbackTimer);','')
mag_media_path.write_text(mm,encoding='utf-8')

preview_js='''(function(){\n  const imgs=[...document.querySelectorAll('.magazine-preview-media img[data-hero-clean="1"]')];\n  imgs.forEach(img=>{\n    const node=img.closest('[data-media-spot]');\n    if(!node)return;\n    if(!img.dataset.heroState)img.dataset.heroState='loading';\n    const sync=()=>{\n      const state=node.dataset.placeEnhanced||'';\n      if(state==='1'){img.dataset.heroState='ready';return;}\n      if(state==='fallback'){img.dataset.heroState='fallback';return;}\n    };\n    new MutationObserver(sync).observe(node,{attributes:true,attributeFilter:['data-place-enhanced']});\n    sync();\n  });\n})();\n'''
(root/'preview-hero-clean.js').write_text(preview_js,encoding='utf-8')
print('v20.12.6 patch applied')
