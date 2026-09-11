from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
seed_path=ROOT/'seed.json'
seed=json.loads(seed_path.read_text(encoding='utf-8'))

def deep_copy(x):
    return json.loads(json.dumps(x, ensure_ascii=False))

BASE_VIBES={
    'cool':90,'nature':4,'extraordinary':91,'scenic':45,'stroll':48,'relax':55,
    'shopping':12,'food':25,'culture':100,'animals':0,'creative':92,'active':8,'waterside':5
}
BASE_EXP={
    'indoor':99,'outdoor':1,'physical_activity':5,'hands_on':6,'quietness':50,'parent_rest':76,
    'greenery':3,'water_contact':0,'animal_contact':0,'food_experience':10,'creative_sensory':95,
    'baby_fit':12,'toddler_fit':22,'stroller_fit':65,'rain_resilience':99,'heat_resilience':99,
    'walking_load':20,'planning_friction':86
}

def make_spot(spot_id, slug, name, aliases, prefecture, city, address, official_url, public_copy,
              editorial_title, editorial_lead, best_for, en_name, en_copy, en_city,
              genres, tags, family=40, partner=90, solo=93, friends=84, same_day=18,
              schedule_url=None, category_primary='performing_arts', extra_categories=None,
              vibe_patch=None, exp_patch=None, english_friendly=None, nearest_station=None):
    vibes=deep_copy(BASE_VIBES); vibes.update(vibe_patch or {})
    exp=deep_copy(BASE_EXP); exp.update(exp_patch or {})
    cats=['culture','theater','performing_arts'] + (extra_categories or [])
    return {
      'spot_id':spot_id,'slug':slug,'name':name,'aliases':aliases,
      'category_primary':category_primary,'categories':list(dict.fromkeys(cats)),
      'prefecture':prefecture,'city':city,'address':address,'official_url':official_url,
      'environment':'indoor','stay_minutes_seed':180,'experience_seed':exp,'vibes_seed':vibes,
      'editorial_reason':'公演ラインナップを「場所」ではなく、その日に観られる体験としてKibunから発見できるようにする劇場・ホール拡張。',
      'public_copy':public_copy,
      'dynamic_snapshot':{
        'opening_hours_text':'開館・開演時刻は公演ごとに変動。公式公演情報を確認。',
        'price_summary':'公演・席種により変動。公式チケット情報を確認。',
        'reservation_summary':'日時指定チケットの事前購入推奨。空席・当日券は公演ごとに確認。',
        'age_note':'未就学児の入場条件や推奨年齢は演目ごとに異なるため、各公演の案内を確認。',
        'temporary_note':None,'checked_at':'2026-09-11','source_url':schedule_url or official_url
      },
      'buzz':{
        'score':86,'freshness':94,'social_presence':72,'visual_appeal':88,'media_attention':82,'popularity_momentum':82,
        'reason':public_copy,'checked_at':'2026-09-11','metric_note':'編集ヒューリスティック。',
        'evidence':[{'kind':'official_current','date':'2026-09-11','url':schedule_url or official_url}]
      },
      'hero_image':{
        'url':'images/ai/culture-interior.jpg','type':'ai','alt':f'{name}で舞台を楽しむ時間をイメージした画像',
        'label':'イメージ','credit':'AI生成イメージ','source_url':None,'license':None,'exact_spot':False
      },
      'research_status':{'static_basic':'verified_or_high_confidence','dynamic_detail':'verified_current','needs_previsit_refresh':True},
      'audience_fit':{'family':family,'partner':partner,'solo':solo,'friends':friends,'dog':0},
      'adult_enjoyment_seed':99,
      'routing':{'municipality':city,'geocode_provider':'geolonia_japanese_addresses_v2','geocode_accuracy':'town_or_municipality_approximation','google_place_id':None},
      'media_strategy':{'hero_priority':['google_places','ai'],'current_provider':'ai','google_places':{'place_id':None,'status':'not_resolved','query':name,'photo_index_override':None,'force':False,'use_address':True}},
      'ui_tags':list(dict.fromkeys(tags+['観劇','雨の日','大人も楽しい'])),
      'monetization':{'affiliate_fit':'B','status':'candidate_only','channel_candidates':['公式チケット'],'product_match_required':True,'note':'公演ごとの公式チケット導線を優先。'},
      'editorial':{'title':editorial_title,'lead':editorial_lead,'moment':'舞台や音楽を一日の主役にしたい日','collection':'観る休日','best_for':best_for,'priority':40,'experience_feature':True},
      'recommendation_mode':'browse_only',
      'planning_profile':{'style':'plan_ahead','same_day_fit':same_day,'reservation_expected':True,'schedule_required':True},
      'performance_profile':{'genres':genres,'schedule_source_url':schedule_url or official_url,'checked_at':'2026-09-11','sync_mode':'manual_verified','note':'Kibunの公演一覧は公式情報を定期確認して更新。販売状況・開演時刻・休演日は公式を優先。'},
      'i18n':{'en':{'name':en_name,'public_copy':en_copy,'city':en_city,'prefecture':'Tokyo' if prefecture=='東京都' else 'Kanagawa','visitor_info':{
          'english_friendly':english_friendly,'reservation':'recommended','cashless':None,'nearest_station':nearest_station,
          'tattoo_policy':None,'halal':None,'vegan':None,'japanese_required':None
      }}}
    }

new_spots=[
make_spot('spot_479','new-national-theatre-tokyo','新国立劇場',['New National Theatre Tokyo','NNTT'],'東京都','渋谷区','東京都渋谷区本町1-1-1','https://www.nntt.jac.go.jp/',
          '初台にあるオペラ・バレエ＆ダンス・演劇の国立劇場。作品を先に選んで、舞台を一日の主役にできる。',
          '今日は、幕が上がる場所へ。','オペラもバレエも演劇も。その日に出会いたい作品から、初台へ出かける理由を選んで。',['バレエ','オペラ','演劇','ダンス'],
          'New National Theatre Tokyo','Japan’s national venue for opera, ballet, dance and theatre in Hatsudai. Choose the performance first and build the rest of the day around it.','Shibuya',
          ['opera','ballet','dance','theater'],['初台','バレエ','オペラ','演劇','ダンス'],schedule_url='https://www.nntt.jac.go.jp/performance/',english_friendly=True,nearest_station='Hatsudai'),
make_spot('spot_480','tokyo-metropolitan-theatre','東京芸術劇場',['Tokyo Metropolitan Theatre','Geigeki'],'東京都','豊島区','東京都豊島区西池袋1-8-1','https://www.geigeki.jp/',
          '池袋の舞台芸術拠点。演劇・ダンスからクラシック、パイプオルガンまで、その日の気分でジャンルをまたげる。',
          '池袋で、知らない舞台に寄り道する。','演劇を観る日も、オルガンを聴く日も。駅前で文化を主役にする午後へ。',['演劇','ダンス','クラシック'],
          'Tokyo Metropolitan Theatre','A major performing-arts venue in Ikebukuro spanning theatre, dance, classical music and its landmark pipe organ.','Toshima',
          ['theater','dance','classical'],['池袋','演劇','ダンス','クラシック','オルガン'],schedule_url='https://www.geigeki.jp/performance/',english_friendly=True,nearest_station='Ikebukuro'),
make_spot('spot_481','tokyu-theatre-orb','東急シアターオーブ',['TOKYU THEATRE Orb'],'東京都','渋谷区','東京都渋谷区渋谷2-21-1 渋谷ヒカリエ11階','https://theatre-orb.com/',
          '渋谷ヒカリエにあるミュージカル・舞台の劇場。大作ミュージカルを目的に、街の夜までつなげやすい。',
          '渋谷の夜を、ミュージカルから始める。','開演前の街歩きも、終演後の余韻も。渋谷で舞台を一日の中心に。',['ミュージカル','デート','夜のおでかけ'],
          'TOKYU THEATRE Orb','A major musical theatre above Shibuya Hikarie, especially strong for large-scale Japanese and international productions.','Shibuya',
          ['musical','theater'],['渋谷','ミュージカル','舞台','夜'],schedule_url='https://theatre-orb.com/lineup/calendar/',english_friendly=True,nearest_station='Shibuya',vibe_patch={'extraordinary':96,'cool':96}),
make_spot('spot_482','nissay-theatre','日生劇場',['Nissay Theatre'],'東京都','千代田区','東京都千代田区有楽町1-1-1 日本生命日比谷ビル','https://www.nissaytheatre.or.jp/',
          '日比谷にある劇場。ミュージカル、オペラ、ファミリー向け舞台まで幅広く、公演から休日を選びやすい。',
          '日比谷で、本格舞台を一本。','ミュージカルからオペラまで。観たい作品を決めたら、日比谷の街ごと一日に組み込んで。',['ミュージカル','オペラ','家族で舞台'],
          'Nissay Theatre','A Hibiya theatre presenting musicals, opera and family performing arts, with an English information section on its official site.','Chiyoda',
          ['musical','opera','theater','family'],['日比谷','ミュージカル','オペラ','ファミリー'],schedule_url='https://www.nissaytheatre.or.jp/',english_friendly=True,nearest_station='Hibiya',family=62),
make_spot('spot_483','tokyo-takarazuka-theatre','東京宝塚劇場',['Tokyo Takarazuka Theater'],'東京都','千代田区','東京都千代田区有楽町1-1-3','https://kageki.hankyu.co.jp/theater/tokyo/',
          '日比谷にある宝塚歌劇の東京拠点。華やかなレビューと芝居を、作品単位で選んで楽しめる。',
          '華やかな舞台に、午後を預ける。','きらびやかなレビューも物語も。日比谷で非日常に切り替わる数時間を。',['宝塚','レビュー','ミュージカル'],
          'Tokyo Takarazuka Theatre','The Tokyo home of the Takarazuka Revue in Hibiya, known for lavish musicals and revue productions.','Chiyoda',
          ['musical','theater'],['日比谷','宝塚','レビュー','ミュージカル'],schedule_url='https://kageki.hankyu.co.jp/schedule/',english_friendly=True,nearest_station='Hibiya',vibe_patch={'extraordinary':100,'cool':96}),
make_spot('spot_484','national-noh-theatre','国立能楽堂',['National Noh Theatre'],'東京都','渋谷区','東京都渋谷区千駄ヶ谷4-18-1','https://www.ntj.jac.go.jp/nou/',
          '能・狂言を専門に上演する国立劇場。字幕付き公演や外国人向け鑑賞教室もあり、日本の舞台芸術に触れる入口になる。',
          '静けさの中で、日本の舞台に会う。','能と狂言の時間へ。言葉が気になる日は字幕付き公演や鑑賞教室から選んで。',['能・狂言','日本文化','訪日ゲスト'],
          'National Noh Theatre','A national theatre dedicated to noh and kyogen in Sendagaya, including selected performances with Japanese and English subtitles.','Shibuya',
          ['noh_kyogen','traditional'],['千駄ヶ谷','能','狂言','日本文化','字幕'],schedule_url='https://www.ntj.jac.go.jp/nou/',english_friendly=True,nearest_station='Sendagaya',vibe_patch={'relax':72,'cool':92}),
make_spot('spot_485','yokohama-minato-mirai-hall','横浜みなとみらいホール',['Yokohama Minato Mirai Hall'],'神奈川県','横浜市西区','神奈川県横浜市西区みなとみらい2-3-6','https://yokohama-minatomiraihall.jp/',
          'みなとみらいのクラシック音楽ホール。オルガン、室内楽、ピアノから親子向けコンサートまで、街歩きと音楽をつなげられる。',
          '海辺の街で、音を聴く午後。','みなとみらいを歩いたあと、ホールの響きへ。短いオルガン公演から家族向けまで選べる。',['クラシック','オルガン','親子コンサート'],
          'Yokohama Minato Mirai Hall','A classical concert hall in Minato Mirai with organ, chamber music, piano and selected family-friendly programs.','Yokohama · Nishi Ward',
          ['classical','family'],['横浜','みなとみらい','クラシック','オルガン','親子'],schedule_url='https://yokohama-minatomiraihall.jp/',nearest_station='Minatomirai',family=72,vibe_patch={'scenic':78,'waterside':72,'relax':78}),
make_spot('spot_486','kanagawa-prefectural-music-hall','神奈川県立音楽堂',['Kanagawa Prefectural Music Hall'],'神奈川県','横浜市西区','神奈川県横浜市西区紅葉ケ丘9-2','https://www.kanagawa-ongakudo.com/',
          '紅葉ケ丘の「木のホール」でクラシックを聴く場所。室内楽・古楽・ピアノから子ども向け公演までラインナップが広い。',
          '木のホールで、音だけに浸る。','街の賑わいから少し離れて、響きのいいホールへ。クラシックを目的にした静かな休日を。',['クラシック','古楽','親子コンサート'],
          'Kanagawa Prefectural Music Hall','A historic wooden concert hall in Yokohama known for classical music, chamber music and selected programs for children.','Yokohama · Nishi Ward',
          ['classical','family'],['横浜','紅葉ケ丘','クラシック','木のホール','親子'],schedule_url='https://www.kanagawa-ongakudo.com/',english_friendly=True,nearest_station='Sakuragicho',family=68,vibe_patch={'relax':82,'cool':88}),
make_spot('spot_487','yokohama-noh-theatre','横浜能楽堂',['Yokohama Noh Theatre'],'神奈川県','横浜市西区','神奈川県横浜市西区紅葉ケ丘27-2','https://yokohama-nohgakudou.org/',
          '紅葉ケ丘で能・狂言を楽しめる専門劇場。改修を終えて2026年に再開し、解説付きの狂言公演など初めてでも選びやすい公演がある。',
          '横浜で、能と狂言に会いに行く。','難しそう、の一歩手前から。解説付き公演を選んで、日本の舞台芸術に入ってみる。',['能・狂言','日本文化','初めての伝統芸能'],
          'Yokohama Noh Theatre','A specialist noh and kyogen theatre in Yokohama’s Momijigaoka area, reopened after renovation in 2026.','Yokohama · Nishi Ward',
          ['noh_kyogen','traditional'],['横浜','能','狂言','日本文化','伝統芸能'],schedule_url='https://yokohama-nohgakudou.org/schedule/',nearest_station='Sakuragicho',vibe_patch={'relax':75,'culture':100}),
make_spot('spot_488','billboard-live-yokohama','Billboard Live YOKOHAMA',['Billboard Live Yokohama'],'神奈川県','横浜市中区','神奈川県横浜市中区北仲通5-57-2 KITANAKA BRICK&WHITE 1F','https://www.billboard-live.com/yokohama','横浜・北仲のライブレストラン。ジャズ、ポップス、ソウルなどの公演を食事やドリンクと一緒に楽しめる。',
          '夜は、ライブの予定から決める。','北仲で食事と音楽を一緒に。出演者から選んで、大人の夜をそのまま一つの予定に。',['ライブ','音楽','大人の夜'],
          'Billboard Live YOKOHAMA','A live-music club in Yokohama’s Kitanaka area where concerts are paired with food and drinks.','Yokohama · Naka Ward',
          ['live','jazz'],['横浜','北仲','ライブ','音楽','夜'],schedule_url='https://www.billboard-live.com/yokohama/schedules',nearest_station='Bashamichi',family=12,partner=96,solo=92,friends=94,vibe_patch={'food':78,'cool':100,'extraordinary':94}),
make_spot('spot_489','ariake-shiki-theatre','有明四季劇場',['Ariake Shiki Theatre'],'東京都','江東区','東京都江東区有明2-1-29','https://www.shiki.jp/theatres/4026/','有明にある劇団四季の専用劇場。ロングラン作品を目的に、家族やパートナーとの一日を組みやすい。',
          '物語の世界へ、家族で出かける。','舞台そのものを目的地に。ロングラン作品なら、行ける日から予定を組み立てやすい。',['ミュージカル','家族観劇','デート'],
          'Ariake Shiki Theatre','A dedicated Shiki Theatre Company venue in Ariake, home to long-running large-scale musicals.','Koto',
          ['musical','family'],['有明','劇団四季','ミュージカル','家族'],schedule_url='https://www.shiki.jp/stage_schedule/?aj=0&ggc=4026&rid=0057',nearest_station='Ariake Garden',family=78,partner=92,solo=82,friends=90,vibe_patch={'extraordinary':98})
]

by_id={s['spot_id']:s for s in seed['spots']}
for s in new_spots:
    by_id[s['spot_id']]=s

# Existing stage venues: add schedule metadata and reviewed English copy.
existing_updates={
 'spot_242':{
   'performance_profile':{'genres':['kabuki','traditional'],'schedule_source_url':'https://www.kabuki-bito.jp/theaters/kabukiza/','checked_at':'2026-09-11','sync_mode':'manual_verified','note':'月ごとの歌舞伎座公演を公式情報から更新。'},
 },
 'spot_243':{
   'performance_profile':{'genres':['musical','family'],'schedule_source_url':'https://www.shiki.jp/theatres/4023/','checked_at':'2026-09-11','sync_mode':'manual_verified','note':'劇団四季公式の東京公演スケジュールを更新。'},
   'i18n':{'en':{'name':'JR-East Shiki Theatre HARU','public_copy':'A dedicated Shiki Theatre Company venue in Takeshiba for large-scale musicals, with documented family viewing support at the theatre.','city':'Minato','prefecture':'Tokyo','visitor_info':{'english_friendly':None,'reservation':'recommended','cashless':None,'nearest_station':'Takeshiba','tattoo_policy':None,'halal':None,'vegan':None,'japanese_required':None}}},
   'family_profile':{'floor_seating':False,'shoes_off':False,'crawl_ok':False,'baby_space':False,'kids_space':False,'nursing_room':None,'diaper_changing':None,'baby_meal':False,'baby_chair':False,'childcare':True,'note':'劇団四季公式で親子観劇室、子ども用シートクッション、ベビーカー・大きな荷物の預かり、提携託児サービスを案内。対象年齢・利用条件は公演ごとに確認。','checked_at':'2026-09-11','source_url':'https://www.shiki.jp/theatres/4023/'}
 },
 'spot_244':{
   'performance_profile':{'genres':['theater','musical','kabuki'],'schedule_source_url':'https://www.shochiku.co.jp/play/theater/enbujyo/','checked_at':'2026-09-11','sync_mode':'manual_verified','note':'新橋演舞場の公演スケジュールを公式情報から更新。'},
   'i18n':{'en':{'name':'Shinbashi Enbujo Theatre','public_copy':'A historic theatre near Ginza presenting plays, musicals and Japanese stage productions throughout the year.','city':'Chuo','prefecture':'Tokyo','visitor_info':{'english_friendly':None,'reservation':'recommended','cashless':None,'nearest_station':'Higashi-ginza','tattoo_policy':None,'halal':None,'vegan':None,'japanese_required':None}}}
 },
 'spot_245':{
   'performance_profile':{'genres':['theater','dance','musical'],'schedule_source_url':'https://www.kaat.jp/','checked_at':'2026-09-11','sync_mode':'manual_verified','note':'KAAT主催・主要公演を公式ラインナップから更新。'},
   'i18n':{'en':{'name':'KAAT Kanagawa Arts Theatre','public_copy':'A performing-arts centre in Yokohama’s Yamashita area with theatre, dance and multidisciplinary productions.','city':'Yokohama · Naka Ward','prefecture':'Kanagawa','visitor_info':{'english_friendly':True,'reservation':'recommended','cashless':None,'nearest_station':'Nihon-odori','tattoo_policy':None,'halal':None,'vegan':None,'japanese_required':None}}}
 }
}
for sid,upd in existing_updates.items():
    if sid not in by_id: continue
    by_id[sid].update(upd)

# Keep stable spot order by numeric suffix.
seed['spots']=sorted(by_id.values(), key=lambda s:int(s['spot_id'].split('_')[1]))
meta=seed['metadata']
meta['version']='0.20.15.0'
meta['dataset_name']='kibun_kanto_izu_seed_v20_15_0_performances'
meta['updated_at']='2026-09-11'
meta['architecture']['layer_performances']='劇場・ホールに紐づく期間限定公演。performances.jsonを正とし、終了日を過ぎた公演はUIから自動非表示。販売状況・開演時刻は公式を優先。'
meta['performance_note']='v20.15.0: 劇場・ホール11件を追加し、既存4劇場と合わせて「venue + performance」体験を導入。バレエ、オペラ、演劇、ミュージカル、歌舞伎、能狂言、クラシック、ダンス、ライブ、家族向けを横断。'

# Performance data verified from official venue schedules on 2026-09-11.
def ev(pid, venue, title, title_en, genre, start, end=None, source=None, summary=None, duration=None, age=None, language=None, childcare=None, tags=None):
    return {'performance_id':pid,'venue_spot_id':venue,'title':title,'title_en':title_en,'genre':genre,'start_date':start,'end_date':end or start,
            'schedule_summary':summary,'duration_minutes':duration,'age_note':age,'language_note':language,'childcare':childcare,
            'official_url':source,'checked_at':'2026-09-11','tags':tags or []}

P=[]
add=P.append
NNT='https://www.nntt.jac.go.jp/performance/'
add(ev('perf_nntt_turco','spot_479','オペラ「イタリアのトルコ人」','Il turco in Italia','opera','2026-10-02','2026-10-12',NNT,'新国立劇場 主催オペラ'))
add(ev('perf_nntt_citylights','spot_479','バレエ「街の灯」','The City Lights','ballet','2026-10-23','2026-11-01',NNT,'バレエ＆ダンス'))
add(ev('perf_nntt_master','spot_479','演劇「巨匠とマルガリータ」','The Master and Margarita','theater','2026-11-07','2026-11-23',NNT,'演劇'))
add(ev('perf_nntt_grimes','spot_479','オペラ「ピーター・グライムズ」','Peter Grimes','opera','2026-11-23','2026-12-05',NNT,'新国立劇場 主催オペラ'))
add(ev('perf_nntt_dttf','spot_479','DANCE to the Future 2026','DANCE to the Future 2026','dance','2026-11-27','2026-11-29',NNT,'ダンス'))
add(ev('perf_nntt_nutcracker','spot_479','バレエ「くるみ割り人形」','The Nutcracker','ballet','2026-12-18','2027-01-03',NNT,'年末年始のバレエ'))

KAAT='https://www.kaat.jp/news_detail/2981'
add(ev('perf_kaat_jungle','spot_245','『ジャングル』','The Jungle','theater','2026-10-10','2026-11-01',KAAT,'KAAT×阿佐ヶ谷スパイダース'))
add(ev('perf_kaat_kaerushoten','spot_245','『蛙昇天』','Kaeru Shoten','theater','2026-10-24','2026-11-08',KAAT,'KAATプロデュース'))
add(ev('perf_kaat_closeup','spot_245','DANCE SERIES『Close Up -クローズ・アップ-』','Close Up','dance','2026-11-28','2026-11-29',KAAT,'ダンスと古楽器アンサンブル'))
add(ev('perf_kaat_jazzdaimyo','spot_245','『ジャズ大名』','Jazz Daimyo','theater','2026-12-19','2026-12-29',KAAT,'KAATプロデュース'))

GEIGEKI='https://www.geigeki.jp/performance/'
add(ev('perf_geigeki_lear','spot_480','『リア王 -KING LEAR-』','KING LEAR','theater','2026-09-21','2026-10-04',GEIGEKI,'演劇'))
add(ev('perf_geigeki_meteor','spot_480','舞台芸術祭「秋の隕石2026東京」','Autumn Meteor 2026 Tokyo','theater','2026-10-09','2026-11-03',GEIGEKI,'舞台芸術祭',tags=['festival']))
add(ev('perf_geigeki_trotter','spot_480','トーマス・トロッター オルガン・リサイタル','Thomas Trotter Organ Recital','classical','2026-10-09',source=GEIGEKI,summary='コンサートホールのパイプオルガン'))
add(ev('perf_geigeki_silence','spot_480','『静寂のガツンとした一撃』','A Powerful Blow of Silence','dance','2026-10-25',source=GEIGEKI,summary='約30分予定',duration=30))
add(ev('perf_geigeki_lunchorgan','spot_480','ランチタイム・パイプオルガンコンサート','Lunchtime Pipe Organ Concert','classical','2026-11-05',source=GEIGEKI,summary='昼の短時間コンサート'))

ORB='https://theatre-orb.com/lineup/calendar/'
add(ev('perf_orb_nine','spot_481','宝塚歌劇 月組公演『NINE』','Takarazuka Moon Troupe: NINE','musical','2026-09-10','2026-09-27',ORB,'渋谷ヒカリエ・東急シアターオーブ'))
add(ev('perf_orb_saigon','spot_481','ミュージカル『ミス・サイゴン』','Miss Saigon','musical','2026-10-16','2026-11-30',ORB,'プレビュー公演を含む'))

NISSAY='https://www.nissaytheatre.or.jp/'
add(ev('perf_nissay_funnygirl','spot_482','『ファニー・ガール』','Funny Girl','musical','2026-09-08','2026-09-29',NISSAY,'ミュージカル'))
add(ev('perf_nissay_fanfare','spot_482','KURUMU OKAMIYA 1st Concert『The Fanfare』','KURUMU OKAMIYA 1st Concert: The Fanfare','live','2026-10-03','2026-10-05',NISSAY,'コンサート'))
add(ev('perf_nissay_101','spot_482','ミュージカル『101ダルメシアンズ』','101 Dalmatians','musical','2026-10-13','2026-10-29',NISSAY,'ミュージカル'))
add(ev('perf_nissay_dongiovanni','spot_482','オペラ『ドン・ジョヴァンニ』','Don Giovanni','opera','2026-11-14','2026-11-15',NISSAY,'日生劇場主催オペラ'))
add(ev('perf_nissay_yuzuru','spot_482','オペラ『夕鶴』','Yuzuru','opera','2026-11-27','2026-11-29',NISSAY,'日本オペラ'))
add(ev('perf_nissay_cage','spot_482','『ラ・カージュ・オ・フォール』','La Cage aux Folles','musical','2026-12-09','2026-12-29',NISSAY,'ミュージカル'))

TAKARAZUKA='https://kageki.hankyu.co.jp/revue/2026/rrr/ticket_tokyo.html'
add(ev('perf_takarazuka_rrr','spot_483','星組『RRR × TAKA”R”AZUKA ～√Rama～』','Star Troupe: RRR × TAKA“R”AZUKA','musical','2026-10-31','2026-12-13',TAKARAZUKA,'東京宝塚劇場公演'))

NOH='https://www.ntj.jac.go.jp/nou/'
add(ev('perf_noh_kinno','spot_484','10月定例公演「禁野・熊坂」','October Regular Performance: Kinno / Kumasaka','noh_kyogen','2026-10-07',source=NOH,summary='13:00開演',language='日本語・英語字幕あり'))
add(ev('perf_noh_naruko','spot_484','10月普及公演「鳴子・夕顔」','October Introductory Performance: Naruko / Yugao','noh_kyogen','2026-10-10',source=NOH,summary='普及公演'))
add(ev('perf_noh_narayama','spot_484','10月企画公演「楢山節考・鐵門」','October Special Performance: Narayama Bushiko / Tetsumon','noh_kyogen','2026-10-15',source=NOH,summary='18:30開演',language='日本語・英語字幕あり'))
add(ev('perf_noh_discover','spot_484','外国人のための能楽鑑賞教室 Discover Noh & Kyogen','Discover Noh & Kyogen','noh_kyogen','2026-10-30',source=NOH,summary='「二人袴／安達原」',language='外国人向け鑑賞教室'))

KABUKI='https://www.kabuki-bito.jp/theaters/kabukiza/'
add(ev('perf_kabuki_sep','spot_242','秀山祭九月大歌舞伎','Shuzansai September Grand Kabuki','kabuki','2026-09-02','2026-09-26',KABUKI,'歌舞伎座'))
add(ev('perf_kabuki_oct','spot_242','錦秋十月大歌舞伎','October Grand Kabuki','kabuki','2026-10-02','2026-10-20',KABUKI,'歌舞伎座',childcare=True))
add(ev('perf_kabuki_nov','spot_242','吉例顔見世大歌舞伎','November Kaomise Grand Kabuki','kabuki','2026-11-01','2026-11-25',KABUKI,'歌舞伎座'))
add(ev('perf_kabuki_dec','spot_242','十二月大歌舞伎','December Grand Kabuki','kabuki','2026-12-02','2026-12-25',KABUKI,'歌舞伎座'))

ENBUJO='https://www.shochiku.co.jp/play/theater/enbujyo/'
add(ev('perf_enbujo_lear','spot_244','『リア王』','King Lear','theater','2026-09-06','2026-09-22',ENBUJO,'新橋演舞場'))
add(ev('perf_enbujo_impact','spot_244','『IMPACT26』','IMPACT26','theater','2026-10-02','2026-10-28',ENBUJO,'新橋演舞場',age='未就学児入場不可'))
add(ev('perf_enbujo_dokuro','spot_244','劇団☆新感線『髑髏城の七人 LAST STAND』','Seven Souls in the Skull Castle: LAST STAND','theater','2026-11-14','2026-12-25',ENBUJO,'新橋演舞場'))

SHIKI_H='https://www.shiki.jp/theatres/4023/'
add(ev('perf_shiki_frozen','spot_243','ミュージカル『アナと雪の女王』','Disney FROZEN','musical','2026-04-01','2027-01-17',SHIKI_H,'JR東日本四季劇場［春］',age='3歳未満入場不可。3歳以上はチケット必要。',childcare=True,tags=['family']))
ARI='https://www.shiki.jp/stage_schedule/?aj=0&ggc=4026&rid=0057'
add(ev('perf_shiki_lionking','spot_489','ミュージカル『ライオンキング』','Disney THE LION KING','musical','2026-07-01','2026-12-31',ARI,'有明四季劇場',duration=160,age='3歳未満入場不可。3歳以上はチケット必要。',tags=['family']))

MM='https://yokohama-minatomiraihall.jp/'
add(ev('perf_mm_organ_sep','spot_485','オルガン・1アワーコンサート','Organ 1-Hour Concert','classical','2026-09-18',source=MM,summary='約1時間で楽しむパイプオルガン'))
add(ev('perf_mm_dollar','spot_485','オルガン・1ドルコンサート','Organ 1-Dollar Concert','classical','2026-10-21',source=MM,summary='気軽に立ち寄れるオルガン公演'))
add(ev('perf_mm_strings','spot_485','Salon de Strings vol.6','Salon de Strings vol.6','classical','2026-10-21',source=MM,summary='室内楽'))
add(ev('perf_mm_piano','spot_485','第44回 横浜市招待国際ピアノ演奏会','44th Yokohama International Piano Concert','classical','2026-11-07',source=MM,summary='ピアノ'))
add(ev('perf_mm_animals','spot_485','親子で楽しむ「音と光の動物園」','Sound and Light Zoo for Families','family','2026-12-06',source=MM,summary='親子で楽しむ発達支援ワークショップ＆コンサート',tags=['family']))
add(ev('perf_mm_xmas','spot_485','クリスマス・パイプオルガン・コンサート2026','Christmas Pipe Organ Concert 2026','classical','2026-12-22',source=MM,summary='クリスマスのオルガン公演'))
add(ev('perf_mm_ishidagumi','spot_485','石田組 年末感謝祭2026','Ishida-gumi Year-End Festival 2026','classical','2026-12-30','2026-12-31',MM,'年末公演'))

ONGAKUDO='https://www.kanagawa-ongakudo.com/'
add(ev('perf_ongakudo_cello','spot_486','《究極チェロ・クァルテット》','Ultimate Cello Quartet','classical','2026-09-13',source=ONGAKUDO))
add(ev('perf_ongakudo_opera','spot_486','第35回神奈川オペラフェスティバル’26 オペラ・ガラコンサート','Kanagawa Opera Festival 2026: Opera Gala','opera','2026-09-20',source=ONGAKUDO))
add(ev('perf_ongakudo_miura','spot_486','三浦謙司: In Portrait','Kenji Miura: In Portrait','classical','2026-09-24',source=ONGAKUDO,summary='ピアノ'))
add(ev('perf_ongakudo_feast','spot_486','《至高の響宴》','A Supreme Musical Feast','classical','2026-10-12',source=ONGAKUDO))
add(ev('perf_ongakudo_biondi','spot_486','ファビオ・ビオンディ／エウローパ・ガランテ「四季」とイタリアの宝石','Fabio Biondi & Europa Galante','classical','2026-11-06',source=ONGAKUDO,summary='「四季」とイタリアの宝石'))
add(ev('perf_ongakudo_kids','spot_486','子どものための音楽堂 せかいはともだち！','Music Hall for Children: The World Is Our Friend!','family','2027-01-16',source=ONGAKUDO,tags=['family']))

YNOH='https://yokohama-nohgakudou.org/schedule/'
add(ev('perf_ynoh_71','spot_487','第71回 横浜能','71st Yokohama Noh','noh_kyogen','2026-09-13',source=YNOH))
add(ev('perf_ynoh_30sep','spot_487','開館30周年記念 特別公演','30th Anniversary Special Performance','noh_kyogen','2026-09-26',source=YNOH))
add(ev('perf_ynoh_kyogen_oct','spot_487','横浜狂言堂','Yokohama Kyogen-do','noh_kyogen','2026-10-11',source=YNOH,summary='狂言2曲＋解説'))
add(ev('perf_ynoh_30oct','spot_487','開館30周年記念 特別公演','30th Anniversary Special Performance','noh_kyogen','2026-10-24',source=YNOH))
add(ev('perf_ynoh_kyogen_nov','spot_487','横浜狂言堂','Yokohama Kyogen-do','noh_kyogen','2026-11-08',source=YNOH,summary='狂言＋解説'))
add(ev('perf_ynoh_kyogen_dec','spot_487','横浜狂言堂','Yokohama Kyogen-do','noh_kyogen','2026-12-13',source=YNOH,summary='狂言＋解説'))
add(ev('perf_ynoh_sleep','spot_487','眠くならずに楽しめる能の名曲','A Noh Masterpiece You Can Enjoy Without Dozing Off','noh_kyogen','2026-12-20',source=YNOH,summary='初めての能にも選びやすい企画'))

BILL='https://www.billboard-live.com/yokohama/schedules'
for pid,date,title,en in [
 ('perf_bill_mayumura','2026-09-12','眉村ちあき','Chiaki Mayumura'),
 ('perf_bill_travellers','2026-09-14','TRAVELLERS','TRAVELLERS'),
 ('perf_bill_dezolve','2026-09-16','DEZOLVE','DEZOLVE'),
 ('perf_bill_yonekura','2026-09-17','米倉利紀','Toshinori Yonekura'),
 ('perf_bill_honda','2026-09-20','本田雅人BAND','Masato Honda BAND'),
 ('perf_bill_kawabata','2026-09-21','川畑 要','Kaname Kawabata'),
 ('perf_bill_lagheads','2026-09-26','LAGHEADS','LAGHEADS'),
 ('perf_bill_aran','2026-09-27','安蘭けい','Kei Aran')]:
    add(ev(pid,'spot_488',title,en,'live',date,source=BILL,summary='Billboard Live YOKOHAMA'))

perf={'metadata':{
    'version':'0.20.15.0','checked_at':'2026-09-11','source_policy':'Official venue and organizer pages only.',
    'display_policy':'Events are hidden after end_date. Start times, ticket inventory and cancellations must be rechecked on the official page.',
    'genres':{'ballet':'バレエ','opera':'オペラ','musical':'ミュージカル','theater':'演劇','kabuki':'歌舞伎','noh_kyogen':'能・狂言','classical':'クラシック','dance':'ダンス','live':'ライブ','family':'親子向け'}
  },'performances':P}

seed_path.write_text(json.dumps(seed,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'data.js').write_text('window.ODEKAKE_SEED = '+json.dumps(seed,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
(ROOT/'performances.json').write_text(json.dumps(perf,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'performances.js').write_text('window.KIBUN_PERFORMANCES = '+json.dumps(perf,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print(f"v20.15 data ready: {len(seed['spots'])} spots / {len(P)} performances")
