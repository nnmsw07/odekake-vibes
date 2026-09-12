from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]

def page(title, desc, eyebrow, hero_spot, intro, sections, en_href):
    blocks=[]
    for heading, lead, items in sections:
        blocks.append(f'<h2>{heading}</h2><p>{lead}</p>')
        for small,name,copy,slug in items:
            blocks.append(f'<article class="spot-feature"><small>{small}</small><h3>{name}</h3><p>{copy}</p><a href="/spots/{slug}/">この場所を見る →</a></article>')
    return f'''<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f6f1e9"><title>{title}｜Kibun Trip</title><meta name="description" content="{desc}"><link rel="canonical" href="https://kibuntrip.com/magazine/{'floor-seating-with-baby' if '小上がり' in title else 'baby-kids-space-cafes'}/"><link rel="alternate" hreflang="ja" href="https://kibuntrip.com/magazine/{'floor-seating-with-baby' if '小上がり' in title else 'baby-kids-space-cafes'}/"><link rel="alternate" hreflang="en" href="{en_href}"><link rel="alternate" hreflang="x-default" href="https://kibuntrip.com/magazine/{'floor-seating-with-baby' if '小上がり' in title else 'baby-kids-space-cafes'}/"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:type" content="article"><meta property="og:site_name" content="Kibun Trip"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:image" content="https://kibuntrip.com/assets/og-v201125/{'floor-seating-with-baby-v201125.jpg' if '小上がり' in title else 'baby-kids-space-cafes-v201125.jpg'}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{title}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{title}"><meta name="twitter:description" content="{desc}"><meta name="twitter:image" content="https://kibuntrip.com/assets/og-v201125/{'floor-seating-with-baby-v201125.jpg' if '小上がり' in title else 'baby-kids-space-cafes-v201125.jpg'}"><link href="../../favicon.svg" rel="icon"><link href="../magazine.css?v=201901" rel="stylesheet"></head><body><header class="mag-top"><a class="brand" href="../../">Kibun Trip</a><div style="display:flex;gap:12px"><a class="top-link" href="../">記事一覧</a><a class="top-link" href="{en_href}">EN</a></div></header><main class="shell"><nav class="crumb"><a href="../../">トップ</a><span>›</span><a href="../">記事</a><span>›</span><span>{eyebrow}</span></nav><section class="article-hero"><p class="eyebrow">{eyebrow}</p><h1>{title}</h1><p class="lead">{desc}</p><div class="article-meta"><span>2026.09.10 更新</span><span>Kibun editorial</span></div><div class="article-hero-media"><img alt="{title}" data-hero-spot="{hero_spot}" loading="eager" src="../../assets/editorial/parents-eat-well.webp"></div></section><article class="article-body"><p class="article-intro">{intro}</p><section class="article-guide"><small>HOW TO CHOOSE</small><h2>赤ちゃんとの外食は、「入れるか」より「どう過ごせるか」。</h2><div class="article-guide-grid"><div class="article-guide-item"><b>床に下ろせる</b><span>小上がり・座敷・靴を脱ぐ席を確認。</span></div><div class="article-guide-item"><b>遊べる</b><span>ベビースペースやキッズスペースがあると親にも余白。</span></div><div class="article-guide-item"><b>食事を続けやすい</b><span>授乳室、おむつ替え、離乳食も合わせて見る。</span></div></div></section>{''.join(blocks)}<section class="article-editorial"><p class="eyebrow">KIBUN NOTE</p><h2>同じ「子連れOK」でも、助かる設備は違う。</h2><p>Kibunでは小上がり、靴を脱ぐ席、ねんね・ハイハイ、ベビースペース、キッズスペース、授乳室、おむつ替え、離乳食などを別々の属性として表示します。月齢とその日の気分から選べるよう、候補を増やしていきます。</p></section><div class="article-note">席・設備・利用条件は変更されることがあります。予約時または来店前に公式情報をご確認ください。</div><section class="article-cta"><p class="eyebrow">MOOD → PLACE</p><h2>まだ決めきれないなら、気分から。</h2><p>同行者・気分・使える時間から、今日の過ごし方を探せます。</p><a href="../../#mood">今日の気分から探す →</a></section></article></main><footer class="footer"><a href="../../privacy.html">プライバシー</a><a href="../../terms.html">利用規約</a><span>© Kibun Trip</span></footer><script src="../magazine-media.js?v=201901"></script></body></html>'''

floor_sections=[
 ('横浜・湘南で、床に下ろせる店','海や街歩きと組み合わせても、大人の食事時間を残しやすい店から。',[
  ('神奈川県 · 横浜市西区','24/7 restaurant','観覧車を眺める大きな窓と、小上がり席のあるみなとみらいのダイニング。子連れの日も「大人が食べたい」を諦めにくい。','247-restaurant-minatomirai'),
  ('神奈川県 · 横浜市中区','chano-ma 横浜','赤レンガを歩いたあと、靴を脱いでくつろげる小上がり席へ。子どもとの休憩にも使いやすい。','chano-ma-yokohama'),
  ('神奈川県 · 鎌倉市','海沿いのキコリ食堂','材木座海岸を目の前に、広い畳の小上がりで靴を脱いで休める海辺の食堂。景色とごはんを両立したい日に。','umi-zoi-kikori-shokudo'),
 ]),
 ('東京で、靴を脱いでひと休み','チェーン一色にせず、畳・カーペット・小上がりを横断して選べるようにしました。',[
  ('東京都 · 新宿区','KICHIRI MOLLIS 新宿三丁目','靴を脱ぐスタイルとカーペット敷きの店内。授乳室やおむつ台、ベビーベッドもあり、赤ちゃん連れで使いやすい。','kichiri-mollis-shinjuku'),
  ('東京都 · 世田谷区','畳cafe&BAR くまさん家','畳の上に赤ちゃんを下ろせる親子カフェ。授乳・おむつ替え、おもちゃや遊具まで近い。','tatami-cafe-kumasanchi'),
  ('東京都 · 立川市','100本のスプーン TACHIKAWA','赤ちゃんがゴロンとしやすい小上がりと親子向け設備を一緒に使いやすい。','100spoons-tachikawa'),
  ('東京都 · 江東区','100本のスプーン TOYOSU','小上がりとキッズスペース、離乳食を一つの店でつなげやすい。','100spoons-toyosu'),
 ]),
 ('マット席も候補に','chano-ma系は強い選択肢。ただし記事全体では他ブランドを主役に増やしました。',[
  ('東京都 · 新宿区','latte chano-mama','伊勢丹の中でベッド席やソファ席を選びながら親子で休めるカフェ。','latte-chano-mama-shinjuku'),
  ('東京都 · 台東区','和カフェyusoshi chano-ma 上野','上野散歩のあと、マット席で靴を脱いで落ち着きやすい和カフェ。','yusoshi-chano-ma-ueno'),
  ('東京都 · 世田谷区','chano-ma 二子玉川','買い物や遊びのあとに、マット席で親子の半日を無理なく締めやすい。','chano-ma-futakotamagawa'),
 ])
]
(root/'magazine/floor-seating-with-baby/index.html').write_text(page('赤ちゃんと外食。小上がり・座敷のある店10選','ねんね・ハイハイ期は、椅子より「床に下ろせる」が助かる。chano-maだけに偏らず、東京・神奈川の小上がり・畳・マット席を集めました。','FLOOR SEATING · TOKYO / KANAGAWA','spot_474','ベビーチェアがあるだけでは難しい日もある。抱っこから少し降ろせる、小上がりや畳、カーペット席まで含めて選びます。',floor_sections,'https://kibuntrip.com/en/magazine/floor-seating-cafes/'))

baby_sections=[
 ('横浜で、食事と遊びを一か所に','横浜駅・新横浜・あざみ野に、目的地として選びやすい店を追加しました。',[
  ('神奈川県 · 横浜市港北区','Aloha Food Factory','新横浜駅直結。ファミリー向けソファ席のそばに、小さい子が遊べるキッズスペースがあるハワイアン。','aloha-food-factory-shin-yokohama'),
  ('神奈川県 · 横浜市西区','鎌倉海岸テーブル','横浜駅直結の百貨店内で、キッズスペースや離乳食と食事を組み合わせやすいベビーウェルカムなダイニング。','kamakura-kaigan-table'),
  ('神奈川県 · 横浜市青葉区','100本のスプーン あざみ野ガーデンズ','「コドモの社交場」、無料離乳食、授乳室まで揃い、親子の食事そのものを予定にしやすい。','100spoons-azamino'),
  ('神奈川県 · 横浜市中区','べるべるパーク横浜関内店','遊ぶ・体験する・食べるを一か所にまとめやすい全天候型の親子拠点。','belbel-park-yokohama-kannai'),
 ]),
 ('東京で、親にも余白ができる店','遊ぶ場所だけでなく、食事や休憩まで同じ場所で完結しやすい候補。',[
  ('東京都 · 江東区','100本のスプーン TOYOSU','小上がり、キッズスペース、離乳食を組み合わせやすく、豊洲の一日を締めやすい。','100spoons-toyosu'),
  ('東京都 · 立川市','100本のスプーン TACHIKAWA','小上がりと親子設備があり、GREEN SPRINGSやPLAY! PARKのあとにも。','100spoons-tachikawa'),
  ('東京都 · 世田谷区','畳cafe&BAR くまさん家','畳、遊具、授乳・おむつ替えを近い距離で使える親子カフェ。','tatami-cafe-kumasanchi'),
  ('東京都 · 港区','CULAFUL（キュラフル）','自然をテーマにした屋内キッズパークとカフェ。子どもが動き、親も座りやすい。','culaful-takeshiba'),
  ('東京都 · 世田谷区','PLAY! PARK ERIC CARLE','絵本世界をテーマにアートや体遊びを楽しめる屋内キッズパーク。0歳から使いやすい。','play-park-eric-carle'),
  ('東京都 · 新宿区','べるべるパーク新宿本店','大型遊具や体験とカフェスペースを同じ場所で使いやすい雨の日の親子拠点。','belbel-park-shinjuku'),
 ])
]
(root/'magazine/baby-kids-space-cafes/index.html').write_text(page('遊べるから、親も食べられる。ベビースペース・キッズスペースのある店10選','子どもは少し遊びたい。大人はちゃんと座って食べたい。新横浜・横浜駅の新候補も加え、ベビースペースやキッズスペースのある店を集めました。','BABY & KIDS SPACE · TOKYO / KANAGAWA','spot_476','「子連れOK」より一歩先へ。遊ぶ場所、休む場所、食べる場所が近い店を中心に、親の余白まで含めて選びます。',baby_sections,'https://kibuntrip.com/en/magazine/baby-friendly-cafes/'))

# Update the Japanese magazine hub labels and home teaser labels.
for rel in ['magazine/index.html','index.html']:
    p=root/rel
    txt=p.read_text()
    txt=txt.replace('赤ちゃんと外食。小上がり・座敷のある店8選','赤ちゃんと外食。小上がり・座敷のある店10選')
    txt=txt.replace('ベビースペース・キッズスペースのある店8選','ベビースペース・キッズスペースのある店10選')
    txt=txt.replace('遊べるから、親も食べられる。ベビースペースのある店8選','遊べるから、親も食べられる。ベビースペースのある店10選')
    p.write_text(txt)
print('articles updated')
