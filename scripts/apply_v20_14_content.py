import json, pathlib, copy, re
root=pathlib.Path(__file__).resolve().parents[1]
seed_path=root/'seed.json'
seed=json.loads(seed_path.read_text())
seed['metadata']['version']='0.20.14.0'
seed['metadata']['dataset_name']='kibun_kanto_izu_seed_v20_14_0_family_en_parity'
seed['metadata']['updated_at']='2026-09-10'

# Conservative, schema-complete restaurant spot builder. Dynamic facts are intentionally limited
# to facts already verified for this update.
def spot_obj(sid, slug, name, prefecture, city, address, official_url, source_url,
             public_copy, family, en_name, en_copy, tags, group,
             category='restaurant', cats=None, quiet=70, scenic=45, extra=55,
             baby_fit=95, toddler_fit=95, stroller_fit=85, planning=25,
             reservation='recommended', checked='2026-09-10', opening='最新の営業時間は公式情報を確認。',
             res_summary='混雑しやすい時間帯は事前確認・予約がおすすめ。', age_note='乳幼児連れの席・設備は来店前に最新情報を確認。',
             source_kind='official_current'):
    cats=cats or ['food','restaurant','cafe','family','kids']
    return {
      'spot_id': sid, 'slug':slug, 'name':name, 'aliases':[], 'category_primary':category,
      'categories':cats, 'prefecture':prefecture, 'city':city, 'address':address,
      'official_url':official_url, 'environment':'mostly_indoor', 'stay_minutes_seed':100,
      'experience_seed':{
        'indoor':92,'outdoor':20,'physical_activity':8,'hands_on':8,'quietness':quiet,'parent_rest':97,
        'greenery':18,'water_contact':0,'animal_contact':0,'food_experience':100,'creative_sensory':25,
        'baby_fit':baby_fit,'toddler_fit':toddler_fit,'stroller_fit':stroller_fit,'rain_resilience':96,
        'heat_resilience':96,'walking_load':10,'planning_friction':planning},
      'vibes_seed':{'cool':55,'nature':18,'extraordinary':extra,'scenic':scenic,'stroll':35,'relax':96,
        'shopping':20,'food':100,'culture':30,'animals':0,'creative':15,'active':5,'waterside':35},
      'editorial_reason':'赤ちゃん・子どもとの外食で、席や遊び場まで含めて選べる候補を増やすため追加。',
      'public_copy':public_copy,
      'dynamic_snapshot':{'opening_hours_text':opening,'price_summary':'メニュー・時間帯により異なる。','reservation_summary':res_summary,
        'age_note':age_note,'temporary_note':None,'checked_at':checked,'source_url':source_url},
      'hero_image':{'url':'assets/editorial/parents-eat-well.webp','type':'ai','alt':f'{name}の雰囲気をイメージした画像',
        'label':'イメージ','credit':'AI生成イメージ','source_url':None,'license':None,'exact_spot':False},
      'research_status':{'static_basic':'verified_or_high_confidence','dynamic_detail':'verified_current' if source_kind=='official_current' else 'reported_current','needs_previsit_refresh':True},
      'audience_fit':{'family':100,'partner':84,'solo':65,'friends':90,'dog':0},'adult_enjoyment_seed':90,
      'routing':{'municipality':city,'geocode_provider':'geolonia_japanese_addresses_v2','geocode_accuracy':'town_or_municipality_approximation','google_place_id':None},
      'media_strategy':{'hero_priority':['google_places','ai'],'current_provider':'ai','google_places':{'place_id':None,'status':'not_resolved','query':name,'photo_index_override':None,'force':False,'use_address':True}},
      'ui_tags':tags,'recommendation_group':group,
      'planning_profile':{'style':'bookable' if reservation in ('recommended','required') else 'walk_in_or_reservable','same_day_fit':82,'reservation_expected':reservation in ('recommended','required')},
      'monetization':{'affiliate_fit':'B','status':'candidate_only','channel_candidates':['OZmall','一休.comレストラン'],'product_match_required':True,'note':'個別の提携商品を確認できた場合のみ予約導線を表示。'},
      'buzz':{'score':82,'freshness':92,'social_presence':75,'visual_appeal':86,'media_attention':72,'popularity_momentum':80,'reason':public_copy,'checked_at':checked,'metric_note':'編集ヒューリスティック。','evidence':[{'kind':source_kind,'date':checked,'url':source_url}]},
      'family_profile':family,
      'i18n':{'en':{'name':en_name,'public_copy':en_copy,'city':city.replace('横浜市','Yokohama').replace('鎌倉市','Kamakura').replace('新宿区','Shinjuku').replace('世田谷区','Setagaya'),
        'prefecture':'Kanagawa' if prefecture=='神奈川県' else 'Tokyo',
        'visitor_info':{'english_friendly':True if slug=='aloha-food-factory-shin-yokohama' else None,'reservation':reservation,'cashless':None,'nearest_station':None,'tattoo_policy':None,'halal':None,'vegan':None,'japanese_required':False if slug=='aloha-food-factory-shin-yokohama' else None}}}
    }

new=[]
new.append(spot_obj(
 'spot_474','umi-zoi-kikori-shokudo','海沿いのキコリ食堂','神奈川県','鎌倉市','神奈川県鎌倉市材木座6-4-7 山ノ上ビル',
 'https://www.dd-holdings.jp/shops/kikorishokudo/kamakura','https://www.dd-holdings.jp/shops/kikorishokudo/kamakura',
 '材木座海岸を目の前に、広い畳の小上がりで靴を脱いで休める海辺の食堂。赤ちゃん連れでも、景色とごはんを同じ日に諦めにくい。',
 {'floor_seating':True,'shoes_off':True,'crawl_ok':True,'baby_space':False,'kids_space':None,'nursing_room':None,'diaper_changing':None,'baby_meal':None,'baby_chair':None,'childcare':False,'note':'公式サイトで広い畳の小上がり席を案内。席指定や乳幼児設備は予約時に確認。','checked_at':'2026-09-10','source_url':'https://www.dd-holdings.jp/shops/kikorishokudo/kamakura'},
 'Umi-zoi no Kikori Shokudo','A seaside restaurant by Zaimokuza Beach with a spacious tatami-style raised seating area where families can take off their shoes and slow down.',
 ['小上がり・座敷','靴を脱ぐ','親子ごはん','鎌倉','海辺','大人も楽しい'],'kikori-shokudo', scenic=95, extra=72))
new.append(spot_obj(
 'spot_475','kamakura-kaigan-table','鎌倉海岸テーブル','神奈川県','横浜市西区','神奈川県横浜市西区高島2-18-1 そごう横浜店10F',
 'https://www.sogo-seibu.jp/yokohama/','https://retty.me/area/PRE14/ARE38/SUB58702/100001765796/60538861/',
 '横浜駅直結の百貨店内で、子どもが遊べるスペースと食事を一緒にしやすいベビーウェルカムなダイニング。キッズスペース付き個室の利用条件は事前確認を。',
 {'floor_seating':False,'shoes_off':False,'crawl_ok':None,'baby_space':True,'kids_space':True,'nursing_room':None,'diaper_changing':None,'baby_meal':True,'baby_chair':None,'childcare':False,'note':'2026年の利用報告でボーネルンド監修キッズスペース、キッズスペース付き個室、離乳食メニューを確認。最新運用は店舗へ確認。','checked_at':'2026-09-10','source_url':'https://retty.me/area/PRE14/ARE38/SUB58702/100001765796/60538861/'},
 'Kamakura Kaigan Table','A baby-welcoming dining spot inside Sogo Yokohama, reported to have a supervised-style kids area, family rooms and baby-food options.',
 ['ベビースペース','キッズスペース','離乳食','横浜駅','親子ごはん'],'kamakura-kaigan-table', source_kind='recent_user_report'))
new.append(spot_obj(
 'spot_476','aloha-food-factory-shin-yokohama','Aloha Food Factory（アロハフードファクトリー）','神奈川県','横浜市港北区','神奈川県横浜市港北区新横浜2-100-45 キュービックプラザ新横浜9F',
 'https://www.cubicplaza.com/shopguide/shop_09_09-005/','https://www.cubicplaza.com/shopguide/shop_09_09-005/',
 '新横浜駅直結。ファミリー向けソファ席のそばに、小さい子が遊べるキッズスペースがあるハワイアン。食事と「ちょっと遊ぶ」を移動なしでつなげやすい。',
 {'floor_seating':False,'shoes_off':False,'crawl_ok':None,'baby_space':True,'kids_space':True,'nursing_room':True,'diaper_changing':None,'baby_meal':None,'baby_chair':None,'childcare':False,'note':'キュービックプラザ公式がキッズスペースとファミリー向けソファ席を案内。施設内に授乳室あり。','checked_at':'2026-09-10','source_url':'https://www.cubicplaza.com/shopguide/shop_09_09-005/'},
 'Aloha Food Factory Shin-Yokohama','A Hawaiian restaurant directly connected to Shin-Yokohama Station, with family sofa seating, a kids play space and an English menu.',
 ['ベビースペース','キッズスペース','ソファ席','新横浜','駅直結','英語メニュー'],'aloha-food-factory', scenic=40, extra=70, planning=15))
new.append(spot_obj(
 'spot_477','kichiri-mollis-shinjuku','KICHIRI MOLLIS 新宿三丁目','東京都','新宿区','東京都新宿区新宿3-26-13 新宿中村屋ビル6F',
 'https://www.kichiri.co.jp/mollis_lunch/','https://www.kichiri.co.jp/mollis_lunch/',
 '新宿三丁目で靴を脱いで、カーペット敷きの店内へ。授乳室・おむつ台・ベビーベッドもあり、赤ちゃん連れでも大人の外食感を残しやすい。',
 {'floor_seating':True,'shoes_off':True,'crawl_ok':True,'baby_space':True,'kids_space':False,'nursing_room':True,'diaper_changing':True,'baby_meal':True,'baby_chair':True,'childcare':False,'note':'公式のFamily Lunch案内で靴を脱ぐスタイル、カーペット床、授乳室、おむつ台、ベビーベッド、子ども椅子を確認。','checked_at':'2026-09-10','source_url':'https://www.kichiri.co.jp/mollis_lunch/'},
 'KICHIRI MOLLIS Shinjuku','A shoe-off restaurant in Shinjuku with carpeted seating areas plus a nursing room, diaper-changing room and baby beds.',
 ['小上がり・座敷','靴を脱ぐ','カーペット','授乳室','おむつ替え','ベビーベッド','新宿'],'kichiri-mollis', scenic=30, extra=58))
new.append(spot_obj(
 'spot_478','tatami-cafe-kumasanchi','畳cafe&BAR くまさん家','東京都','世田谷区','東京都世田谷区北沢2-34-8 KMビル3F',
 'https://kumasanchi.owst.jp/','https://kumasanchi.owst.jp/',
 '下北沢で、畳の上に赤ちゃんを下ろして過ごせる親子カフェ。授乳・おむつ替え、おもちゃや遊具まで近く、外食の途中で子どもが動きたくなる日にも。',
 {'floor_seating':True,'shoes_off':True,'crawl_ok':True,'baby_space':True,'kids_space':True,'nursing_room':True,'diaper_changing':True,'baby_meal':True,'baby_chair':None,'childcare':False,'note':'公式サイトで畳メイン、授乳室・おむつ室、おもちゃ・遊具のある子どもスペースを案内。','checked_at':'2026-09-10','source_url':'https://kumasanchi.owst.jp/'},
 'Tatami Cafe & Bar Kumasanchi','A parent-and-child café in Shimokitazawa with tatami flooring, a play area, toys, nursing facilities and diaper-changing space.',
 ['小上がり・座敷','畳','ねんね・ハイハイOK','ベビースペース','キッズスペース','授乳室','おむつ替え','下北沢'],'kumasanchi', scenic=20, extra=55))

existing={x['spot_id']:x for x in seed['spots']}
for s in new:
    existing[s['spot_id']]=s
seed['spots']=[existing[k] for k in sorted(existing, key=lambda x:int(x.split('_')[1]))]

# Refine already-present family profiles used by the new features.
by_slug={s.get('slug'):s for s in seed['spots']}
for slug in ['100spoons-azamino','100spoons-tachikawa','100spoons-toyosu']:
    s=by_slug.get(slug)
    if s:
        s.setdefault('categories',[])
        for c in ['family','kids','restaurant']:
            if c not in s['categories']: s['categories'].append(c)
        s.setdefault('ui_tags',[])
        for t in ['親子ごはん','ベビースペース']:
            if t not in s['ui_tags']: s['ui_tags'].append(t)

seed_path.write_text(json.dumps(seed,ensure_ascii=False,indent=2)+'\n')
(root/'data.js').write_text('window.ODEKAKE_SEED = '+json.dumps(seed,ensure_ascii=False,indent=2)+';\n')
print('spots',len(seed['spots']),'version',seed['metadata']['version'])
