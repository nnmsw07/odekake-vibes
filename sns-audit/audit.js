(function(){
  const KEY='kibun-sns-audit-v20114-editors';
  const LEGACY_KEYS=['kibun-sns-audit-v20112-editors','kibun-sns-audit-v20111-editors','kibun-sns-audit-v20101','kibun-sns-audit-v2091'];
  const seed=window.KIBUN_SNS_AUDIT_SEED||{posts:[]};
  const spotSeed=window.ODEKAKE_SEED||{spots:[]};
  const spots=spotSeed.spots||[];
  const editorial=window.KIBUN_SNS_EDITORIAL_DATA||{articles:[],plans:[]};
  const aff=window.KIBUN_AFFILIATE_CONFIG||{};
  const affAudit=window.KIBUN_AFFILIATE_AUDIT_STATUS?.spots||{};
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone=x=>JSON.parse(JSON.stringify(x));
  const clamp=(x,lo=0,hi=100)=>Math.max(lo,Math.min(hi,x));
  const TYPE_LABEL={save:'保存系',seasonal:'季節・旬',mood:'気分・シーン',area:'エリア攻略',discovery:'発見・穴場',plan:'プラン'};
  const SOURCE_LABEL={generated:'データ生成',article:'記事',plan:'プラン'};
  const AUDIENCE_LABEL={family:'子どもと',partner:'ふたりで',solo:'ひとり',friends:'友だちと'};
  const AREA_LABEL={yokohama:'横浜',tokyo:'東京',kanagawa:'神奈川','tokyo-kanagawa':'東京・神奈川',hakone:'箱根',other:'その他'};
  const spotMap=new Map(spots.map(s=>[s.spot_id,s]));
  const articleMap=new Map((editorial.articles||[]).map(a=>[a.slug,a]));
  const ARTICLE_POSTERS={
    'tokyo-rainy-family':{url:'../assets/sns/article-posters/tokyo-rainy-family.webp',title:'雨の日の東京。親子で楽しめる室内スポット3選'},
    'oyako-rest-indoor':{url:'../assets/sns/article-posters/oyako-rest-indoor.webp',title:'親も休める遊び場へ。東京・横浜の室内スポット3選'},
    'yokohama-family-cafe':{url:'../assets/sns/article-posters/yokohama-family-cafe.webp',title:'子どもとでも、ちゃんとくつろげる横浜カフェ3選'},
    'yokohama-small-holiday':{url:'../assets/sns/article-posters/yokohama-small-holiday.webp',title:'2〜3時間だけ空いた日に。横浜の小さな休日3選'},
    'art-and-cafe':{url:'../assets/sns/article-posters/art-and-cafe.webp',title:'アートのあとに、ひと休み。半日アイデア3選'},
    'hakone-stay-story':{url:'../assets/sns/article-posters/hakone-stay-story.webp',title:'箱根、今日は帰らない。日帰りから1泊へつなぐ3選'},
    'make-something':{url:'../assets/sns/article-posters/make-something.webp',title:'見るだけじゃない休日。ものづくり体験3選'},
    'japanese-culture-experience':{url:'../assets/sns/article-posters/japanese-culture-experience.webp',title:'日本文化を、見るだけで終わらせない体験3選'},
    'terrace-after-sunset':{url:'../assets/sns/article-posters/terrace-after-sunset.webp',title:'まだ帰りたくない日の、外ごはん3選'},
    'night-starts-after-five':{url:'../assets/sns/article-posters/night-starts-after-five.webp',title:'日が落ちてから、出かける。17時から始める夜3選'}
  };
  const AI_DISCLOSURE='※投稿内の画像は生成AIによるイメージです。実際の施設・景観とは異なる場合があります。';
  const ARTICLE_CAPTION_LEADS=Object.freeze({
    'tokyo-rainy-family':'雨でも、子どもにはちゃんと遊んでほしい。\nそんな日に頼れる東京の室内スポットを3つまとめました。',
    'oyako-rest-indoor':'子どもは遊びたい。でも親も少し休みたい。\nそんな日に覚えておきたい、親子で過ごしやすい室内スポットを3つ。',
    'yokohama-family-cafe':'子連れでも、ちゃんとくつろぎたい。\nそんな日に行きたい横浜カフェを3つまとめました。\n景色も、居心地も、ごはん時間も大事にしたい日に。',
    'yokohama-small-holiday':'予定を詰め込まず、2〜3時間だけ気分転換したい。\nそんな日にちょうどいい横浜の小さな休日を3つ。',
    'art-and-cafe':'アートを見たあと、その余韻のままひと休みしたい。\n展示とカフェをゆるくつなげる半日候補を3つ選びました。',
    'hakone-stay-story':'せっかく箱根まで来たなら、今日は帰らない選択も。\n日帰り気分から1泊へつなげやすい3つの候補です。',
    'make-something':'見るだけじゃなく、今日は手を動かしたい。\n大人も子どもも夢中になれる、ものづくり体験を3つ。',
    'japanese-culture-experience':'日本文化を、見るだけで終わらせない。\n食・装い・手仕事まで、体験として楽しめる3つを選びました。',
    'terrace-after-sunset':'まだ帰りたくない夜は、外でごはんにしよう。\n夜風と景色まで楽しめる東京・横浜の外ごはんを3つ。',
    'night-starts-after-five':'休日は、17時からでもまだ間に合う。\n日が落ちてから楽しみたい東京・横浜の夜スポットを3つ。'
  });
  const ARTICLE_SPOT_IMAGES=Object.freeze(Object.fromEntries(Object.keys(ARTICLE_POSTERS).map(slug=>[slug,[1,2,3].map(n=>`../assets/sns/article-spot-images/${slug}-${String(n).padStart(2,'0')}.webp`)])));
  // Official Instagram accounts are intentionally conservative: only accounts that have
  // been verified via an official site / official SNS policy / official press material are
  // included here. Unknown or ambiguous accounts are omitted rather than guessed.
  const OFFICIAL_INSTAGRAM_BY_NAME=Object.freeze({
    '日本科学未来館':'miraikan',
    'チームラボボーダレス':'teamlab',
    'スモールワールズ':'smallworlds_official',
    '国立科学博物館':'kahaku_nmns',
    '横浜美術館':'yokohama_museum_of_art',
    '新江ノ島水族館':'enosui_com',
    '箱根小涌園ユネッサン':'yunessun_hakone',
    'chano-ma 横浜':'chanoma_yokohama',
    'bills 横浜赤レンガ倉庫':'billsjapan',
    'THE WHARF HOUSE YAMASHITA KOEN':'the_wharf_house_yamashita_koen'
  });
  const cfg=window.KIBUN_CONFIG||{};
  const heroCache=new Map();
  const autoSnsImageCache=new Map();
  const heroUrlCounts=spots.reduce((m,s)=>{const u=s?.hero_image?.url||'';if(u)m.set(u,(m.get(u)||0)+1);return m;},new Map());

  function fallbackHeroUrl(s){
    const u=s?.hero_image?.url||'';
    if(!u)return '../assets/editorial/special.webp';
    if(/^https?:\/\//.test(u)||u.startsWith('data:')||u.startsWith('../'))return u;
    return '../'+u.replace(/^\.\//,'').replace(/^\//,'');
  }
  function auditPhotoIndex(s){
    const v=s?.media_strategy?.google_places?.photo_index_override;
    return Number.isInteger(v)?v:null;
  }
  function heroAuditLabel(s){
    const idx=auditPhotoIndex(s);
    return Number.isInteger(idx)?`監査Hero #${idx}`:'自動Hero';
  }
  function staticHeroSafeForSocial(s){
    if(!s)return false;
    if(s?.hero_image?.type==='ai')return true;
    if(s?.media_strategy?.current_provider==='official_permission')return true;
    return Boolean(s?.hero_image?.license);
  }
  function isSharedGenericHero(s){
    const raw=s?.hero_image?.url||'';
    if(!raw)return true;
    const count=heroUrlCounts.get(raw)||0;
    return count>=4 || /^images\/ai\//.test(raw) || /^assets\/(editorial|plans)\//.test(raw);
  }
  function socialSafeHeroUrl(s,opts={}){
    if(!staticHeroSafeForSocial(s))return'';
    if(!opts.allowShared && isSharedGenericHero(s))return'';
    return fallbackHeroUrl(s);
  }
  async function fetchResolvedHeroData(spot){
    if(!spot)return null;
    const idx=auditPhotoIndex(spot);
    const key=`${spot.spot_id||spot.name}:${idx??'auto'}`;
    if(heroCache.has(key))return heroCache.get(key);
    const task=(async()=>{
      try{
        const data=await window.KibunMedia?.resolvePlacePhoto?.(spot);
        if(data?.photoUri)return data;
      }catch(_e){}
      return {photoUri:fallbackHeroUrl(spot),source:'fallback',matchConfidence:'fallback'};
    })();
    heroCache.set(key,task);
    return task;
  }
  function heroCreditText(data){
    if(!data||data.source!=='google_places')return'';
    const names=(data.authors||[]).map(a=>a.displayName).filter(Boolean);
    return names.length?`Google Places photo · ${names.join(' / ')}`:'Google Places photo';
  }
  async function resolveHeroImages(root=document,opts={}){
    const safeOnly=opts.safeOnly===true;
    const imgs=[...root.querySelectorAll('img[data-hero-spot]')];
    await Promise.all(imgs.map(async img=>{
      const spot=spotById(img.dataset.heroSpot);if(!spot)return;
      if(safeOnly){
        img.src=fallbackHeroUrl(spot);img.dataset.heroResolved='safe';img.dataset.heroSource=staticHeroSafeForSocial(spot)?'sns-safe':'fallback';return;
      }
      if(img.dataset.heroResolved==='1')return;
      const data=await fetchResolvedHeroData(spot);
      if(data?.photoUri){
        img.src=data.photoUri;img.dataset.heroResolved='1';img.dataset.heroSource=data.source||'google_places';
        const creditTarget=img.closest('[data-hero-wrap]')?.querySelector('[data-hero-credit]');
        if(creditTarget){const credit=heroCreditText(data);creditTarget.textContent=credit;creditTarget.hidden=!credit;}
      }
    }));
  }

  function mergeSeedPosts(posts){
    const saved=Array.isArray(posts)?posts.map(normalizePost):[];
    const byId=new Map(saved.map(p=>[p.id,p]));
    for(const p of (seed.posts||[])){
      const normalized=normalizePost(clone(p));
      if(!byId.has(normalized.id))byId.set(normalized.id,normalized);
    }
    return Array.from(byId.values());
  }
  function load(){
    for(const key of [KEY,...LEGACY_KEYS]){
      try{
        const x=JSON.parse(localStorage.getItem(key)||'null');
        if(x?.posts){
          const value={version:'20.11.14',posts:mergeSeedPosts(x.posts)};
          if(key!==KEY)localStorage.setItem(KEY,JSON.stringify(value));
          return value;
        }
      }catch(_e){}
    }
    return {version:'20.11.14',posts:mergeSeedPosts([])};
  }
  function normalizePost(p){
    return {
      ...p,
      result:{impressions:'',reach:'',saves:'',clicks:'',profile_visits:'',notes:'',...(p.result||{})},
      draft:{instagram:'',x:'',...(p.draft||{})},
      spot_ids:Array.isArray(p.spot_ids)?p.spot_ids:(p.spot_id?[p.spot_id]:[])
    };
  }
  let state=load();
  function persist(){localStorage.setItem(KEY,JSON.stringify(state));}
  function spotById(id){return spotMap.get(id)||null;}
  function firstSentence(text){const t=String(text||'').replace(/\s+/g,' ').trim();if(!t)return'';const m=t.match(/^(.+?[。！？])/);return (m?m[1]:t).trim();}
  function truncate(text,n){const t=String(text||'').trim();return t.length>n?t.slice(0,n-1)+'…':t;}
  function num(v,d=0){const n=Number(v);return Number.isFinite(n)?n:d;}
  function hasTag(s,tag){return (s?.ui_tags||[]).some(t=>String(t).includes(tag));}
  function visualScore(s){return num(s?.buzz?.visual_appeal,s?.hero_image?.type==='photo'?86:70);}
  function freshnessScore(s){return num(s?.buzz?.freshness,35);}
  function familyScore(s){return num(s?.audience_fit?.family,50);}
  function adultScore(s){return num(s?.adult_enjoyment_seed,60);}
  function isYokohama(s){return s?.prefecture==='神奈川県'&&String(s?.city||'').startsWith('横浜市');}
  function isHakone(s){return /箱根/.test(`${s?.city||''} ${s?.address||''}`);}
  function isTokyo(s){return s?.prefecture==='東京都';}
  function isKanagawa(s){return s?.prefecture==='神奈川県';}
  function isTokyoKanagawa(s){return isTokyo(s)||isKanagawa(s);}
  function categoryText(s){return [s?.category_primary,...(s?.categories||[])].join('|').toLowerCase();}
  function isFoodLike(s){const t=categoryText(s);return /cafe|restaurant|dining|food|lounge|afternoon/.test(t);}
  function isStayLike(s){const t=categoryText(s);return /hotel_stay|overnight|ryokan|glamping|camp_stay/.test(t);}
  function isFamilyCafe(s){return /family_cafe|family_restaurant/.test(categoryText(s));}
  function broadKind(s){const t=categoryText(s);if(isStayLike(s))return'stay';if(isFoodLike(s))return'food';if(/pool|water_park|beach|seaside|aquarium/.test(t))return'water';if(/indoor_play|playground|theme|amusement|zoo|toy/.test(t))return'play';if(/museum|gallery|library|culture|art|performing|architecture/.test(t))return'culture';if(/workshop|craft|experience|factory|pottery|glass/.test(t))return'experience';if(/park|garden|nature|farm/.test(t))return'nature';if(/shopping|mall|market|outlet/.test(t))return'shopping';if(/spa|onsen|bath|relax/.test(t))return'relax';return'other';}
  function isChildDestination(s){const e=s?.experience_seed||{};return familyScore(s)>=66&&(num(e.toddler_fit)>=68||num(e.baby_fit)>=68||num(e.hands_on)>=68||num(e.physical_activity)>=62||['play','culture','experience','water','nature'].includes(broadKind(s)));}
  function isYoungChildDestination(s){const e=s?.experience_seed||{};return isChildDestination(s)&&(num(e.toddler_fit)>=65||num(e.baby_fit)>=65);}
  function areaOfSpots(ss){
    if(!ss.length)return'other';
    if(ss.every(isHakone))return'hakone';
    if(ss.every(isYokohama))return'yokohama';
    if(ss.every(isTokyo))return'tokyo';
    if(ss.every(isKanagawa))return'kanagawa';
    if(ss.every(isTokyoKanagawa))return'tokyo-kanagawa';
    return'other';
  }
  function mediaUrl(s){
    return fallbackHeroUrl(s);
  }
  function snsImageRecord(spot){return spot?window.KibunSnsImages?.getSafe?.(spot.spot_id)||null:null;}
  function captureImageUrl(spot,imageMode,opts={}){
    if(!spot)return'';
    if(imageMode==='audit')return mediaUrl(spot);
    const selected=snsImageRecord(spot);
    if(selected?.image_url)return selected.image_url;
    return socialSafeHeroUrl(spot,{allowShared:opts.allowShared===true});
  }
  function captureImageCredit(spot,imageMode){
    if(imageMode!=='safe')return'';
    const selected=snsImageRecord(spot);
    return selected?window.KibunSnsImages?.attribution?.(selected)||'':'';
  }
  function captureImageIsSelected(spot,imageMode){return imageMode==='safe'&&Boolean(snsImageRecord(spot));}
  async function autoSnsImageForSpot(spot){
    if(!spot||!window.KibunSnsImages?.autoFindSafe)return null;
    if(autoSnsImageCache.has(spot.spot_id))return autoSnsImageCache.get(spot.spot_id);
    const task=window.KibunSnsImages.autoFindSafe(spot).catch(()=>null);
    autoSnsImageCache.set(spot.spot_id,task);return task;
  }
  async function resolveAutoSnsImages(root=document){
    const targets=[...root.querySelectorAll('[data-auto-sns-spot]')];
    if(!targets.length)return;
    const queue=[...targets];
    const worker=async()=>{
      while(queue.length){
        const el=queue.shift();if(!el)continue;
        const spot=spotById(el.dataset.autoSnsSpot);if(!spot)continue;
        const rec=await autoSnsImageForSpot(spot);if(!rec?.image_url)continue;
        const credit=window.KibunSnsImages?.attribution?.(rec)||'';
        if(el.matches('img')){
          el.src=rec.image_url;el.dataset.autoResolved='1';
          const wrap=el.closest('[data-hero-wrap]');
          const c=wrap?.querySelector('[data-auto-sns-credit]');if(c&&credit){c.textContent=credit;c.hidden=false;}
          wrap?.classList.add('auto-open-image');
        }else{
          el.classList.remove('ig-editorial-visual','ig-editorial-note','note-statement','note-reasons','note-moment');el.classList.add('ig-auto-image','ig-media');
          el.innerHTML=`<img src="${esc(rec.image_url)}" alt="" loading="eager"><small class="sns-image-credit">${esc(credit)}</small>`;
          el.closest('.ig-spot')?.classList.remove('no-media');el.closest('.ig-spot')?.classList.add('has-media');
        }
      }
    };
    await Promise.all([worker(),worker(),worker()]);
  }
  function kindLabel(kind){
    return ({stay:'泊まり・ホテル',food:'グルメ・カフェ',water:'水辺・アクティブ',play:'遊び・体験',culture:'ミュージアム',experience:'ものづくり',nature:'自然・公園',shopping:'ショッピング',relax:'温泉・リラックス',other:'おでかけスポット'})[kind]||'おでかけスポット';
  }
  function categoryDisplay(spot){
    const raw=String(spot?.category_primary||'').toLowerCase();
    const exact={
      science_museum:'科学ミュージアム',digital_art_museum:'デジタルアート',art_museum:'アート',museum:'ミュージアム',
      aquarium:'水族館',zoo:'動物園',indoor_play:'室内あそび',playground:'あそび場',theme_park:'テーマパーク',
      cafe:'カフェ',restaurant:'レストラン',hotel_stay:'ホテル',spa:'温浴・スパ',garden:'庭園',park:'公園',workshop:'体験'
    };
    if(exact[raw])return exact[raw];
    return kindLabel(broadKind(spot));
  }
  function spotCardFacts(spot){
    if(!spot)return[];
    const facts=[];
    const area=spot.city||spot.prefecture||'';
    if(area)facts.push(area);
    facts.push(kindLabel(broadKind(spot)));
    const tags=(spot.ui_tags||[]).map(String).filter(Boolean).filter(t=>!/^[A-Z0-9_]+$/.test(t));
    for(const tag of tags){
      if(!facts.includes(tag))facts.push(tag);
      if(facts.length>=4)break;
    }
    return facts.slice(0,4);
  }
  function metricMark(score){
    const n=num(score,0);
    if(n>=88)return'◎';
    if(n>=72)return'○';
    return'△';
  }
  function editorialMetrics(spot){
    const e=spot?.experience_seed||{},v=spot?.vibes_seed||{};
    const pool=[
      {label:'雨の日',score:num(e.rain_resilience)},
      {label:'小さな子',score:Math.max(num(e.toddler_fit),num(e.baby_fit))},
      {label:'体験・発見',score:Math.max(num(e.hands_on),num(e.creative_sensory))},
      {label:'ゆったり',score:Math.max(num(e.parent_rest),num(v.relax))},
      {label:'非日常',score:num(v.extraordinary)},
      {label:'歩きやすさ',score:100-num(e.walking_load,50)}
    ];
    return pool.sort((a,b)=>b.score-a.score).slice(0,3).map(x=>({...x,mark:metricMark(x.score)}));
  }
  function editorialNote(spot){
    const e=spot?.experience_seed||{},v=spot?.vibes_seed||{};
    const rain=num(e.rain_resilience),young=Math.max(num(e.toddler_fit),num(e.baby_fit)),hands=Math.max(num(e.hands_on),num(e.creative_sensory));
    if(rain>=88&&young>=82)return'天気を気にせず、小さな子とじっくり過ごしたい日に。';
    if(rain>=88&&hands>=88)return'雨の日でも、感覚を使って非日常を楽しみたい日に。';
    if(num(e.parent_rest)>=72)return'親も急がず、ゆったり回したい日の候補に。';
    if(hands>=82)return'見るだけでなく、手を動かして楽しみたい日に。';
    if(num(v.extraordinary)>=88)return'いつもの休日を、少し特別にしたい日に。';
    return'その日の気分に合わせて選びたい、Kibun編集部の候補。';
  }
  function noteVariantForSlide(idx){
    return ['statement','reasons','moment'][Math.max(0,idx-1)%3];
  }
  function noteHeadline(spot){
    const e=spot?.experience_seed||{},v=spot?.vibes_seed||{};
    const rain=num(e.rain_resilience),young=Math.max(num(e.toddler_fit),num(e.baby_fit));
    if(rain>=90&&young>=82)return'雨の日でも、ちゃんと楽しい。';
    if(num(v.extraordinary)>=90)return'いつもの休日を、少し特別に。';
    if(Math.max(num(e.hands_on),num(e.creative_sensory))>=88)return'見るだけじゃない、体験する休日。';
    if(num(e.parent_rest)>=75)return'親も急がず、ゆっくり過ごせる。';
    return'“今度行こう” に入れておきたい。';
  }
  function bestForItems(spot){
    const given=(spot?.editorial?.best_for||[]).map(String).filter(Boolean).slice(0,3);
    if(given.length>=2)return given;
    return editorialMetrics(spot).map(m=>m.label).slice(0,3);
  }
  function reasonLine(label){
    return ({
      '雨の日':'天気を気にせず予定を立てやすい',
      '小さな子':'小さな子と一緒でも過ごしやすい',
      '体験・発見':'見るだけで終わらない楽しさがある',
      'ゆったり':'親も急がず、ひと息つきやすい',
      '非日常':'いつもの休日から少し気分を変えられる',
      '歩きやすさ':'移動の負担を抑えて楽しみやすい'
    })[label]||label;
  }
  function noteCardHtml(spot,idx,imageMode){
    const variant=noteVariantForSlide(idx),metrics=editorialMetrics(spot),note=editorialNote(spot);
    const facts=spotCardFacts(spot).slice(0,2),best=bestForItems(spot);
    const autoAttr=imageMode==='safe'?` data-auto-sns-spot="${esc(spot.spot_id)}"`:'';
    if(variant==='statement'){
      return `<div class="ig-media ig-editorial-note note-statement"${autoAttr}><div class="ig-note-kicker">Kibunのひとこと</div><p class="ig-note-main">${esc(noteHeadline(spot))}</p><div class="ig-note-meta">${facts.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>`;
    }
    if(variant==='reasons'){
      return `<div class="ig-media ig-editorial-note note-reasons"${autoAttr}><div class="ig-note-kicker">ここがいい</div><div class="ig-note-reason-list">${metrics.map(m=>`<div><i></i><span>${esc(reasonLine(m.label))}</span></div>`).join('')}</div><p class="ig-note-tail">${esc(note)}</p></div>`;
    }
    const moment=spot?.editorial?.moment||noteHeadline(spot),collection=spot?.editorial?.collection||categoryDisplay(spot);
    return `<div class="ig-media ig-editorial-note note-moment"${autoAttr}><div class="ig-note-kicker">こんな日に</div><p class="ig-note-main">${esc(moment)}</p><div class="ig-note-bottom"><span>${esc(collection)}</span><small>${best.slice(0,2).map(esc).join(' · ')}</small></div></div>`;
  }
  function ideaSpotScore(s,audience='family'){
    const e=s?.experience_seed||{};
    const aud=audience==='family'?familyScore(s):num(s?.audience_fit?.[audience],60);
    const content=Math.max(num(e.hands_on),num(e.food_experience),num(e.parent_rest),num(e.rain_resilience),num(s?.vibes_seed?.culture),num(s?.vibes_seed?.extraordinary));
    return .30*visualScore(s)+.22*freshnessScore(s)+.24*aud+.14*content+.10*num(s?.buzz?.score,60);
  }
  function selectSpots(filter,count=5,audience='family',options={}){
    const ranked=spots.filter(filter).sort((a,b)=>ideaSpotScore(b,audience)-ideaSpotScore(a,audience));
    const maxPerKind=options.maxPerKind??2,selected=[],kindCounts={};
    for(const s of ranked){const kind=broadKind(s);if((kindCounts[kind]||0)>=maxPerKind)continue;selected.push(s);kindCounts[kind]=(kindCounts[kind]||0)+1;if(selected.length>=count)break;}
    if(selected.length<count&&options.fill!==false){for(const s of ranked){if(selected.includes(s))continue;selected.push(s);if(selected.length>=count)break;}}
    return selected;
  }
  function avg(ss,fn,fallback=0){if(!ss.length)return fallback;return ss.reduce((sum,s)=>sum+num(fn(s),fallback),0)/ss.length;}
  function scorePack(ss,opts={}){
    const save=opts.save??4.2;
    const seasonal=opts.seasonal??3.2;
    const traffic=opts.traffic??4.0;
    const visual=opts.visual??clamp(avg(ss,visualScore,70)/20,1,5);
    const depth=opts.depth??clamp(2.5+ss.length*.42,1,5);
    const priority=Math.round((save*.30+seasonal*.20+traffic*.20+visual*.15+depth*.15)*20);
    return {save:+save.toFixed(1),seasonal:+seasonal.toFixed(1),traffic:+traffic.toFixed(1),visual:+visual.toFixed(1),depth:+depth.toFixed(1),priority:clamp(priority,0,100)};
  }
  function browseDestination(area){
    const region={yokohama:'yokohama',tokyo:'tokyo23',hakone:'hakone'}[area];
    return region?{type:'browse',label:`${AREA_LABEL[area]}のスポット一覧`,url:`../?region=${region}&source=sns`}:{type:'browse',label:'Kibunで条件を変えて探す',url:'../?browse=1&source=sns'};
  }
  function articleDestination(slug){const a=articleMap.get(slug);return a?{type:'article',label:'関連するKibun記事',url:a.url,slug}:null;}
  function monthSeasonalFilter(month){
    if([6,7,8,9].includes(month))return s=>isTokyoKanagawa(s)&&num(s?.experience_seed?.heat_resilience)>=75&&visualScore(s)>=72;
    if([10,11].includes(month))return s=>isTokyoKanagawa(s)&&(num(s?.vibes_seed?.nature)>=65||num(s?.vibes_seed?.culture)>=75)&&visualScore(s)>=70;
    if([12,1,2].includes(month))return s=>isTokyoKanagawa(s)&&num(s?.experience_seed?.indoor)>=75&&visualScore(s)>=70;
    return s=>isTokyoKanagawa(s)&&(num(s?.vibes_seed?.nature)>=55||num(s?.experience_seed?.hands_on)>=70)&&visualScore(s)>=70;
  }
  function ruleDefinitions(){
    const month=new Date().getMonth()+1;
    return [
      {id:'rain-yokohama',type:'save',area:'yokohama',audience:['family'],count:5,title:c=>`雨の日でも困らない 横浜の室内スポット${c}選`,hook:c=>`雨の休日、もう困らない。横浜の室内スポット${c}選`,reason:'天気で予定を変えたい日に保存されやすい、子連れの定番ニーズ。',filter:s=>isYokohama(s)&&!isFoodLike(s)&&!isStayLike(s)&&isYoungChildDestination(s)&&num(s?.experience_seed?.rain_resilience)>=82&&num(s?.experience_seed?.indoor)>=72,scores:{save:5,seasonal:4.0,traffic:4.6}},
      {id:'rain-tokyo',type:'save',area:'tokyo',audience:['family'],count:7,title:c=>`雨の日の東京。親子で楽しめる室内スポット${c}選`,hook:c=>`「仕方なく室内」じゃなく、雨だから行きたい東京${c}選`,reason:'雨予報の週末にそのまま使える、検索・保存需要の強いテーマ。',filter:s=>isTokyo(s)&&!isFoodLike(s)&&!isStayLike(s)&&isChildDestination(s)&&num(s?.experience_seed?.rain_resilience)>=82&&num(s?.experience_seed?.indoor)>=75,scores:{save:5,seasonal:4.2,traffic:4.9},article:'tokyo-rainy-family',useArticleSpots:true},
      {id:'baby-yokohama',type:'save',area:'yokohama',audience:['family'],count:5,title:c=>`赤ちゃん連れで行きやすい 横浜スポット${c}選`,hook:c=>`赤ちゃん連れでも動きやすい。横浜のおでかけ先${c}選`,reason:'年齢が具体的な投稿は「自分向け」と判断されやすく保存につながる。',filter:s=>isYokohama(s)&&!isFoodLike(s)&&!isStayLike(s)&&isYoungChildDestination(s)&&num(s?.experience_seed?.baby_fit)>=74&&num(s?.experience_seed?.stroller_fit)>=68,scores:{save:4.9,seasonal:3.2,traffic:4.4}},
      {id:'parent-rest',type:'save',area:'tokyo-kanagawa',audience:['family'],count:5,title:c=>`子どもは遊ぶ、親は少し休める。親子スポット${c}選`,hook:c=>`子どもだけじゃなく、親も疲れにくい場所${c}選`,reason:'「子ども向け＋親の負担軽減」はKibunらしい差別化テーマ。',filter:s=>isTokyoKanagawa(s)&&(!isFoodLike(s)||isFamilyCafe(s))&&!isStayLike(s)&&isChildDestination(s)&&num(s?.experience_seed?.parent_rest)>=68,scores:{save:5,seasonal:3.4,traffic:4.7},article:'oyako-rest-indoor',useArticleSpots:true},
      {id:'adult-family',type:'discovery',area:'tokyo-kanagawa',audience:['family'],count:5,title:c=>`大人もちゃんと楽しい 子連れスポット${c}選`,hook:c=>`「子どものためだけ」じゃない。大人も行きたい親子スポット${c}選`,reason:'子連れサイトに寄りすぎず、親自身も行きたくなるKibunの世界観を出せる。',filter:s=>isTokyoKanagawa(s)&&!isFoodLike(s)&&!isStayLike(s)&&isChildDestination(s)&&adultScore(s)>=76&&visualScore(s)>=72,scores:{save:4.8,seasonal:3.2,traffic:4.5}},
      {id:'small-yokohama',type:'mood',area:'yokohama',audience:['family','partner','solo'],count:6,title:c=>`2〜3時間だけ空いた日に。横浜の小さな休日${c}選`,hook:c=>`丸一日は空いてない。でも家にいるのはもったいない。横浜${c}選`,reason:'「半日未満」という時間制約から入る、Kibunのプラン思想と相性のよい投稿。',filter:s=>isYokohama(s)&&!isStayLike(s)&&num(s?.stay_minutes_seed,999)<=180&&visualScore(s)>=65,scores:{save:4.6,seasonal:3.1,traffic:4.9},article:'yokohama-small-holiday',useArticleSpots:true},
      {id:'monthly-picks',type:'seasonal',area:'tokyo-kanagawa',audience:['family','partner','friends'],count:5,title:c=>`${month}月に行きたい 東京・神奈川のおでかけ${c}選`,hook:c=>`${month}月の休日、次はここ。東京・神奈川のおでかけ${c}選`,reason:'月単位で更新できる定番枠。旬のある候補を優先してフィードに季節感を出す。',filter:s=>monthSeasonalFilter(month)(s)&&!isFoodLike(s)&&!isStayLike(s)&&freshnessScore(s)>=40,scores:{save:4.4,seasonal:5,traffic:4.3}},
      {id:'heat-escape',type:'seasonal',area:'tokyo-kanagawa',audience:['family','partner','friends'],count:5,title:c=>`まだ暑い日に行きたい 涼しく過ごせるスポット${c}選`,hook:c=>`外はまだ暑い。ちゃんと涼しく楽しめるおでかけ${c}選`,reason:'残暑の時期に即時性があり、室内・涼スポットの検索需要を拾える。',filter:s=>isTokyoKanagawa(s)&&!isFoodLike(s)&&!isStayLike(s)&&num(s?.experience_seed?.heat_resilience)>=88&&num(s?.experience_seed?.indoor)>=70&&visualScore(s)>=68,scores:{save:4.7,seasonal:[6,7,8,9].includes(month)?4.9:2.2,traffic:4.2}},
      {id:'extraordinary',type:'mood',area:'tokyo-kanagawa',audience:['partner','family','friends'],count:5,title:c=>`ちょっと非日常を感じたい休日のスポット${c}選`,hook:c=>`遠くへ行かなくても、景色が変わる。非日常スポット${c}選`,reason:'「場所」ではなく気分から始める、Kibunらしさを一番出しやすいテーマ。',filter:s=>isTokyoKanagawa(s)&&num(s?.vibes_seed?.extraordinary)>=82&&visualScore(s)>=78,scores:{save:4.3,seasonal:3.0,traffic:4.5}},
      {id:'make-something',type:'discovery',area:'tokyo-kanagawa',audience:['partner','friends','family'],count:6,title:c=>`見るだけじゃない休日。東京・横浜のものづくり体験${c}選`,hook:c=>`作品より「手を動かした時間」が残る。ものづくり体験${c}選`,reason:'体験の具体性が高く、カルーセルで一つずつ見せやすい保存型コンテンツ。',filter:s=>isTokyoKanagawa(s)&&(num(s?.experience_seed?.hands_on)>=82||/workshop|craft|pottery|glass|experience/.test(String(s?.category_primary||'')))&&visualScore(s)>=62,scores:{save:4.7,seasonal:3.2,traffic:4.9},article:'make-something',useArticleSpots:true,selectOptions:{maxPerKind:6}},
      {id:'yokohama-afternoontea',type:'mood',area:'yokohama',audience:['partner','solo','friends'],count:7,title:c=>`横浜で、午後をちゃんと楽しむ。アフタヌーンティー${c}選`,hook:c=>`「どこへ行く？」ではなく、午後そのものを目的地に。横浜${c}選`,reason:'写真の強さと予約導線を両立しやすく、大人向けKibunを育てるテーマ。',filter:s=>isYokohama(s)&&(String(s?.category_primary||'').includes('hotel_lounge')||hasTag(s,'記念日'))&&num(s?.experience_seed?.food_experience)>=70,scores:{save:4.5,seasonal:3.4,traffic:5,visual:4.8},article:'yokohama-afternoon-tea',useArticleSpots:true,selectOptions:{maxPerKind:7}},
      {id:'waterside',type:'area',area:'tokyo-kanagawa',audience:['family','partner','friends'],count:5,title:c=>`水辺で気分を変えたい日の 東京・神奈川スポット${c}選`,hook:c=>`海・川・運河のそばへ。水辺で過ごす休日${c}選`,reason:'Kibunの写真映えと「散歩＋食事」の組み合わせにつなげやすい。',filter:s=>isTokyoKanagawa(s)&&!isFoodLike(s)&&!isStayLike(s)&&!/pool/.test(categoryText(s))&&num(s?.vibes_seed?.waterside)>=72&&(((s?.ui_tags||[]).includes('水辺・水遊び'))||['water','nature'].includes(broadKind(s))||/cruise|ship|boat|aquarium|seaside|waterfront|beach/.test(categoryText(s)))&&visualScore(s)>=68,scores:{save:4.3,seasonal:3.8,traffic:4.3}},
      {id:'local-discovery',type:'discovery',area:'tokyo-kanagawa',audience:['family','partner','solo'],count:5,title:c=>`こんなところあったの？東京・神奈川の発見スポット${c}選`,hook:c=>`定番の次に知りたい。「こんなところあったの？」な${c}スポット`,reason:'既視感の少ない候補を混ぜ、フォローする理由をつくる発見系の柱。',filter:s=>isTokyoKanagawa(s)&&!isFoodLike(s)&&!isStayLike(s)&&hasTag(s,'近場穴場')&&visualScore(s)>=60,scores:{save:4.4,seasonal:3.6,traffic:4.2}},
      {id:'hakone-stay',type:'mood',area:'hakone',audience:['family','partner'],count:6,title:c=>`箱根、今日は帰らない。日帰りから1泊へつなぐ${c}つの行き先`,hook:c=>`「もう一つ見る」をやめる。箱根でそのまま泊まりたい${c}つの行き先`,reason:'昼の体験から宿へつなぐことで、Kibunのプラン・宿泊導線を自然に見せられる。',filter:s=>isHakone(s)&&(s?.overnight||String(s?.category_primary||'').includes('hotel')||num(s?.vibes_seed?.culture)>=65||num(s?.experience_seed?.water_contact)>=60),scores:{save:4.2,seasonal:3.3,traffic:5},article:'hakone-stay-story',useArticleSpots:true,selectOptions:{maxPerKind:6}}
    ];
  }
  function makeRuleIdea(def){
    const articleSpots=def.useArticleSpots&&def.article?((articleMap.get(def.article)?.spot_ids||[]).map(spotById).filter(Boolean)):[];
    const chosen=(articleSpots.length>=3?articleSpots.slice(0,def.count):selectSpots(def.filter,def.count,def.audience[0]||'family',def.selectOptions||{}));
    if(chosen.length<3)return null;
    const destination=articleDestination(def.article)||browseDestination(def.area);
    const scores=scorePack(chosen,{...(def.scores||{}),traffic:destination?.type==='article'?Math.max(def.scores?.traffic||0,4.8):(def.scores?.traffic||4)});
    return {
      id:`idea_${def.id}`,source:'generated',type:def.type,area:def.area,audience:def.audience,
      title:def.title(chosen.length),hook:def.hook(chosen.length),reason:def.reason,spotIds:chosen.map(s=>s.spot_id),
      destination,scores,objective:def.type==='seasonal'?'保存・今週末需要':'保存・Kibun流入'
    };
  }
  function articleType(a){const t=`${a.title} ${a.lead}`;if(/雨|室内|親も休める|カフェ[0-9０-９]*選/.test(t))return'save';if(/ものづくり|日本文化|器|道具/.test(t))return'discovery';if(/高輪|小さな休日|半日アイデア|箱根/.test(t))return'area';return'mood';}
  function audienceFromSpots(ss){
    const out=[];for(const a of ['family','partner','solo','friends'])if(avg(ss,s=>s?.audience_fit?.[a],0)>=60)out.push(a);
    return out.length?out:['partner'];
  }
  function articleIdea(a){
    const ss=(a.spot_ids||[]).map(spotById).filter(Boolean);if(ss.length<2)return null;
    const area=areaOfSpots(ss),type=articleType(a),aud=audienceFromSpots(ss);
    const scores=scorePack(ss,{save:type==='save'?4.8:4.3,seasonal:3.2,traffic:5,visual:clamp(avg(ss,visualScore,72)/20,1,5)});
    scores.priority=Math.min(96,scores.priority+4);
    return {id:`article_${a.slug}`,source:'article',type,area,audience:aud,title:a.title,hook:a.title,reason:a.lead,spotIds:a.spot_ids||[],destination:{type:'article',label:'この記事へ',url:a.url,slug:a.slug},scores,objective:'保存・記事流入'};
  }
  function planIdea(p){
    const ss=(p.spot_ids||[]).map(spotById).filter(Boolean);if(ss.length<2)return null;
    const area=areaOfSpots(ss),aud=(p.audience||[]).length?p.audience:['partner'];
    const scores=scorePack(ss,{save:4.1,seasonal:3.0,traffic:4.8,visual:clamp(avg(ss,visualScore,72)/20,1,5),depth:3.8});
    return {id:`plan_${p.id}`,source:'plan',type:'plan',area,audience:aud,title:p.title,hook:p.title,reason:p.lead,spotIds:p.spot_ids||[],destination:{type:'plan',label:'このプランへ',url:p.url,planId:p.id},scores,objective:'保存・プラン流入',plan:p};
  }
  function buildIdeas(){
    const generated=ruleDefinitions().map(makeRuleIdea).filter(Boolean);
    const linkedArticleSlugs=new Set(generated.map(i=>i.destination?.slug).filter(Boolean));
    const articleIdeas=(editorial.articles||[]).filter(a=>!linkedArticleSlugs.has(a.slug)).map(articleIdea).filter(Boolean);
    const planIdeas=(editorial.plans||[]).map(planIdea).filter(Boolean);
    return [...generated,...articleIdeas,...planIdeas].sort((a,b)=>b.scores.priority-a.scores.priority||a.title.localeCompare(b.title,'ja'));
  }
  const ideas=buildIdeas();
  window.KIBUN_SNS_IDEAS=ideas;
  window.KIBUN_SNS_DRAFT_FOR_IDEA=draftForIdea;
  function typeLabel(i){return TYPE_LABEL[i.type]||i.type;}
  function sourceLabel(i){return SOURCE_LABEL[i.source]||i.source;}
  function audienceText(i){return (i.audience||[]).map(a=>AUDIENCE_LABEL[a]||a).join('・');}
  function scoreText(n){return `${Number(n||0).toFixed(1)} / 5`;}
  function ideaPreviewImages(i){
    const ss=i.spotIds.map(spotById).filter(Boolean),visible=ss.slice(0,3);
    return `<div class="spot-preview">${visible.map(s=>{const u=mediaUrl(s);return `<span class="spot-avatar">${u?`<img src="${esc(u)}" alt="" loading="lazy">`:''}</span>`}).join('')}${ss.length>3?`<span class="spot-avatar more">+${ss.length-3}</span>`:''}<span class="spot-preview-text">${ss.length}スポット · ${esc(AREA_LABEL[i.area]||'複数エリア')}</span></div>`;
  }
  function ideaCard(i,index){
    const top=index<3?' top-pick':'';
    return `<article class="idea-card${top}" data-idea-id="${esc(i.id)}">
      <div class="idea-card-head"><div><div class="idea-kicker"><span class="idea-badge${i.type==='seasonal'?' seasonal':''}">${esc(typeLabel(i))}</span><span class="idea-badge source">${esc(sourceLabel(i))}${i.source==='generated'&&i.destination?.type==='article'?' · 記事導線あり':''}</span></div><h3>${esc(i.title)}</h3></div><div class="priority-ring"><span><strong>${i.scores.priority}</strong><small>PRIORITY</small></span></div></div>
      <p class="idea-reason">${esc(i.reason)}</p>
      <div class="score-row"><div class="score-item"><small>保存</small><strong>${esc(scoreText(i.scores.save))}</strong></div><div class="score-item"><small>旬</small><strong>${esc(scoreText(i.scores.seasonal))}</strong></div><div class="score-item"><small>流入</small><strong>${esc(scoreText(i.scores.traffic))}</strong></div><div class="score-item"><small>Visual</small><strong>${esc(scoreText(i.scores.visual))}</strong></div></div>
      ${ideaPreviewImages(i)}
      <div class="idea-actions"><button class="primary-btn" type="button" data-open-idea="${esc(i.id)}">投稿を作る</button><button class="secondary-btn" type="button" data-add-idea="${esc(i.id)}">運用に追加</button></div>
    </article>`;
  }
  function visibleIdeas(){
    const q=$('ideaTextFilter').value.trim().toLowerCase(),type=$('ideaTypeFilter').value,aud=$('ideaAudienceFilter').value,area=$('ideaAreaFilter').value,source=$('ideaSourceFilter').value;
    return ideas.filter(i=>{
      if(type!=='all'&&i.type!==type)return false;
      if(aud!=='all'&&!i.audience.includes(aud))return false;
      if(area!=='all'){const ok=i.area===area||(area==='kanagawa'&&['yokohama','hakone','kanagawa'].includes(i.area))||(area==='tokyo-kanagawa'&&['yokohama','hakone','kanagawa','tokyo','tokyo-kanagawa'].includes(i.area));if(!ok)return false;}
      if(source!=='all'&&i.source!==source)return false;
      if(q){const names=i.spotIds.map(id=>spotById(id)?.name||'').join(' '),hay=`${i.title} ${i.reason} ${names} ${audienceText(i)} ${AREA_LABEL[i.area]||''}`.toLowerCase();if(!hay.includes(q))return false;}
      return true;
    });
  }
  function renderIdeaSummary(){
    const generated=ideas.filter(i=>i.source==='generated').length,article=ideas.filter(i=>i.source==='article').length,plan=ideas.filter(i=>i.source==='plan').length,top=ideas[0]?.scores.priority||0;
    $('ideaSummary').innerHTML=`<div class="summary-card"><small>企画候補</small><strong>${ideas.length}</strong><span>スポット＋記事＋プラン</span></div><div class="summary-card"><small>自動生成</small><strong>${generated}</strong><span>データからテーマ化</span></div><div class="summary-card"><small>既存コンテンツ</small><strong>${article+plan}</strong><span>記事 ${article} · プラン ${plan}</span></div><div class="summary-card"><small>TOP PRIORITY</small><strong>${top}</strong><span>100点満点</span></div>`;
  }
  function renderIdeas(){
    const rows=visibleIdeas();
    $('ideaList').innerHTML=rows.length?rows.slice(0,30).map(ideaCard).join(''):`<div class="empty-card">この条件に合う投稿企画はありません。条件を1つ広げてみてください。</div>`;
    document.querySelectorAll('[data-open-idea]').forEach(b=>b.addEventListener('click',()=>openIdea(b.dataset.openIdea)));
    document.querySelectorAll('[data-add-idea]').forEach(b=>b.addEventListener('click',()=>addIdeaToOperations(b.dataset.addIdea)));
  }
  function normalizeInstagramHandle(value){
    const raw=String(value||'').trim();if(!raw)return'';
    const direct=raw.replace(/^@/,'');
    if(/^[A-Za-z0-9._]{1,30}$/.test(direct))return direct;
    try{
      const u=new URL(raw,location.href);
      if(!/(^|\.)instagram\.com$/i.test(u.hostname))return'';
      const part=(u.pathname.split('/').filter(Boolean)[0]||'').replace(/^@/,'');
      const reserved=new Set(['p','reel','reels','stories','explore','accounts','direct','about','developer','legal']);
      if(!part||reserved.has(part.toLowerCase())||!/^[A-Za-z0-9._]{1,30}$/.test(part))return'';
      return part;
    }catch(_e){return'';}
  }
  function officialInstagramHandle(spot){
    if(!spot)return'';
    const social=spot.social||spot.social_media||{};
    const values=[
      social.instagram_handle,social.official_instagram_handle,
      social.instagram_url,social.instagram,
      spot.instagram_handle,spot.official_instagram_handle,spot.instagram_url
    ];
    for(const value of values){const h=normalizeInstagramHandle(value);if(h)return h;}
    return OFFICIAL_INSTAGRAM_BY_NAME[spot.name]||'';
  }
  function captionSpotLine(spot,idx){
    const handle=officialInstagramHandle(spot);
    return `${String(idx+1).padStart(2,'0')} ${spot.name}${handle?` @${handle}`:''}`;
  }
  function officialInstagramCount(ss){return ss.filter(s=>officialInstagramHandle(s)).length;}
  function spotBlurb(s,audience){
    const base=firstSentence(s?.public_copy)||firstSentence(s?.editorial?.lead)||`${s?.name||'この場所'}で過ごす時間。`;
    const e=s?.experience_seed||{};
    if(audience.includes('family')&&num(e.parent_rest)>=78)return truncate(`${base} 親もひと息つきやすい候補。`,86);
    if(audience.includes('family')&&num(e.baby_fit)>=82)return truncate(`${base} 小さい子とのおでかけにも合わせやすい。`,86);
    return truncate(base,86);
  }
  function spotCaptionBlurb(s,i){
    const raw=String(s?.public_copy||s?.editorial?.lead||spotBlurb(s,i.audience)||'').trim();
    const e=s?.experience_seed||{},v=s?.vibes_seed||{};
    let extra='';
    if(i.audience.includes('family')&&num(e.parent_rest)>=90)extra='親も座ってひと息つきやすいのがうれしいポイント。';
    else if(num(v.scenic)>=90)extra='景色まで含めて気分転換したい日に。';
    else if(num(e.hands_on)>=80)extra='見るだけでなく、手を動かして楽しめるのも魅力。';
    else if(num(e.rain_resilience)>=95)extra='天気を気にせず予定を立てやすいのも◎。';
    else if(num(e.food_experience)>=90)extra='食事そのものも、おでかけの楽しみにできます。';
    const base=truncate(raw,118);
    return truncate(`${base}${extra?` ${extra}`:''}`,172);
  }
  function spotGridBlurb(s,i){
    return truncate(spotCaptionBlurb(s,i),72);
  }
  function articleSpotImage(slug,idx){
    return ARTICLE_SPOT_IMAGES[slug]?.[idx]||'../images/ai/culture-interior.jpg';
  }
  function articleCaptionLead(i,poster){
    return ARTICLE_CAPTION_LEADS[i?.destination?.slug]||`${poster.title}\n次のおでかけ候補にしたい3スポットをまとめました。`;
  }
  function useCaseLines(i,ss){
    if(!ss.length)return[];
    if(i.audience.includes('family')){
      const baby=[...ss].sort((a,b)=>num(b?.experience_seed?.baby_fit)-num(a?.experience_seed?.baby_fit))[0];
      const active=[...ss].sort((a,b)=>num(b?.experience_seed?.physical_activity)-num(a?.experience_seed?.physical_activity))[0];
      const rest=[...ss].sort((a,b)=>num(b?.experience_seed?.parent_rest)-num(a?.experience_seed?.parent_rest))[0];
      return [`小さい子となら → ${baby.name}`,`しっかり遊ぶなら → ${active.name}`,`親もひと息つくなら → ${rest.name}`];
    }
    const scenic=[...ss].sort((a,b)=>num(b?.vibes_seed?.scenic)-num(a?.vibes_seed?.scenic))[0];
    const culture=[...ss].sort((a,b)=>num(b?.vibes_seed?.culture)-num(a?.vibes_seed?.culture))[0];
    const food=[...ss].sort((a,b)=>num(b?.experience_seed?.food_experience)-num(a?.experience_seed?.food_experience))[0];
    return [`景色を楽しむなら → ${scenic.name}`,`文化・展示なら → ${culture.name}`,`食も楽しむなら → ${food.name}`];
  }
  function hashtagsFor(i){
    const tags=['#KibunTrip'];
    if(i.area==='yokohama')tags.unshift('#横浜おでかけ');
    else if(i.area==='tokyo')tags.unshift('#東京おでかけ');
    else if(i.area==='hakone')tags.unshift('#箱根旅行');
    else if(i.area==='tokyo-kanagawa')tags.unshift('#東京神奈川おでかけ');
    if(i.audience.includes('family'))tags.push('#子連れおでかけ','#子連れスポット');
    if(i.type==='save')tags.push('#週末おでかけ','#おでかけ情報');
    if(i.type==='seasonal')tags.push('#今週末どこ行く');
    if(i.type==='mood')tags.push('#休日の過ごし方');
    if(i.type==='discovery')tags.push('#おでかけスポット');
    return [...new Set(tags)].slice(0,8);
  }
  function ctaText(i){
    if(i.destination?.type==='article')return'詳しい選び方や、ほかの候補はプロフィールのKibunから。';
    if(i.destination?.type==='plan')return'この流れをそのまま使いたい人は、プロフィールのKibunでプランを見られます。';
    return'条件を変えて探したい人は、プロフィールのKibunからどうぞ。';
  }
  function articlePosterForIdea(i){
    if(i?.destination?.type!=='article')return null;
    return ARTICLE_POSTERS[i.destination.slug]||null;
  }
  function kibunIntroSlide(){
    return {kind:'kibun-intro',label:'SITE UI',title:'Kibun Tripの使い方',body:'サイトの実際のUIに近い見せ方で、気分・同行者・時間から3つの過ごし方を探せることを紹介。'};
  }
  function articlePosterDraft(i,ss,poster){
    const featured=ss.slice(0,3);
    const slides=[
      {kind:'article-poster',label:'COVER',title:poster.title,body:'気を引くイメージ＋タイトル。',image:poster.url,slug:i.destination.slug},
      {kind:'article-spots',label:'SPOT PICKS',title:'気になる3つを、まずは保存。',body:'スポットごとの魅力を、1枚で見比べる。',spots:featured,slug:i.destination.slug,idea:i}
    ];
    const blocks=featured.map((s,idx)=>`${captionSpotLine(s,idx)}\n${spotCaptionBlurb(s,i)}`).join('\n\n');
    const ig=`${articleCaptionLead(i,poster)}\n\n${blocks}\n\n気になる場所は保存して、次のおでかけ候補に。\n${ctaText(i)}\n\n${AI_DISCLOSURE}\n\n${hashtagsFor(i).join(' ')}`;
    const x=`${poster.title}\n\n${featured.map(x=>`・${truncate(x.name,20)}`).join('\n')}\n\n${ctaText(i)}\n${hashtagsFor(i).slice(0,3).join(' ')}`;
    const timing=i.type==='seasonal'?'今週〜今月。週末前の木〜金曜が第一候補。':i.type==='save'?'木〜金曜。週末の行き先検討が始まる前に。':'平日夜〜木曜。次の休日を考え始めるタイミングに。';
    return {slides,instagram:ig,x,timing,hashtags:hashtagsFor(i),usesGeneratedPoster:true};
  }
  function draftForIdea(i){
    const ss=i.spotIds.map(spotById).filter(Boolean);
    const poster=articlePosterForIdea(i);
    if(poster)return articlePosterDraft(i,ss,poster);
    const slides=[{kind:'cover',label:'COVER',title:i.hook,body:'保存して、次の休日の候補に。'}];
    ss.forEach((s,idx)=>slides.push({kind:'spot',label:`SPOT ${String(idx+1).padStart(2,'0')}`,title:s.name,body:spotBlurb(s,i.audience),spot:s}));
    slides.push({kind:'summary',label:'HOW TO CHOOSE',title:'迷ったら、こんな使い分け。',body:useCaseLines(i,ss).join('\n')});
    slides.push({kind:'cta',label:'KIBUN',title:'まだ決まらない？',body:`${ctaText(i)}\n${i.destination?.label||''}`});
    const names=ss.map((s,idx)=>captionSpotLine(s,idx)).join('\n');
    const intro=i.reason.replace(/。.*$/,'。');
    const ig=`${i.hook}\n\n${intro}\n\n${names}\n\n${useCaseLines(i,ss).join('\n')}\n\nあとで見返せるように保存しておくと便利です。\n${ctaText(i)}\n\n${hashtagsFor(i).join(' ')}`;
    const compactNames=ss.slice(0,5).map(s=>`・${truncate(s.name,20)}`).join('\n');
    const x=`${truncate(i.hook,64)}\n\n${compactNames}${ss.length>5?`\nほか${ss.length-5}スポット`:''}\n\n${ctaText(i)}\n${hashtagsFor(i).slice(0,3).join(' ')}`;
    const timing=i.type==='seasonal'?'今週〜今月。週末前の木〜金曜が第一候補。':i.type==='save'?'木〜金曜。週末の行き先検討が始まる前に。':'平日夜〜木曜。次の休日を考え始めるタイミングに。';
    return {slides,instagram:ig,x,timing,hashtags:hashtagsFor(i)};
  }
  function slideHtml(slide,idx){
    if(slide.kind==='article-poster'){
      return `<article class="slide-card slide-card-poster"><div class="slide-no"><span>SLIDE ${idx+1}</span><span>AI EDITORIAL</span></div><h4>${esc(slide.title)}</h4><div class="slide-media editorial-poster-thumb"><img src="${esc(slide.image)}" alt="" loading="lazy"></div><small class="slide-ai-note">${esc(AI_DISCLOSURE)}</small></article>`;
    }
    if(slide.kind==='article-spots'){
      return `<article class="slide-card slide-card-article-spots"><div class="slide-no"><span>SLIDE ${idx+1}</span><span>3 SPOTS</span></div><h4>${esc(slide.title)}</h4><p>${esc(slide.body)}</p><div class="article-spots-mini">${slide.spots.map((s,j)=>`<div><img src="${esc(articleSpotImage(slide.slug,j))}" alt="" loading="lazy"><strong>${esc(s.name)}</strong><small>${esc(spotGridBlurb(s,slide.idea))}</small></div>`).join('')}</div></article>`;
    }
    if(slide.kind==='kibun-intro'){
      return `<article class="slide-card slide-card-kibun"><div class="slide-no"><span>SLIDE ${idx+1}</span><span>SITE UI</span></div><h4>${esc(slide.title)}</h4><p>${esc(slide.body)}</p><div class="mini-site-ui"><div class="mini-site-brand"><span class="mini-brand-dots"><i></i><i></i><i></i></span><b>Kibun Trip</b></div><strong>今日は、どんな気分？</strong><div class="mini-site-chips"><span>子どもと</span><span>のんびり</span><span>半日くらい</span></div><button type="button" tabindex="-1">今日の過ごし方を見る →</button><small>→ あなた向けの3つを提案</small></div></article>`;
    }
    const media=slide.spot?mediaUrl(slide.spot):'';
    const area=slide.spot?`${slide.spot.city||slide.spot.prefecture||''}`:'';
    const audit=slide.spot?heroAuditLabel(slide.spot):'';
    return `<article class="slide-card"><div class="slide-no"><span>SLIDE ${idx+1}</span><span>${esc(slide.label)}</span></div><h4>${esc(slide.title)}</h4><p>${esc(slide.body)}</p>${media?`<div class="slide-media" data-hero-wrap><img src="${esc(media)}" alt="" loading="lazy" data-hero-spot="${esc(slide.spot.spot_id)}"><small class="hero-credit" data-hero-credit hidden></small></div><div class="slide-media-meta"><span class="slide-media-label">${esc(audit)} · ${esc(slide.spot.name)}</span>${area?`<span class="slide-media-area">${esc(area)}</span>`:''}</div>`:''}</article>`;
  }
  function coverSpotForSource(source,imageMode='safe'){
    const ss=source.slides.filter(x=>x.kind==='spot'&&x.spot).map(x=>x.spot);
    if(!ss.length)return null;
    const pool=imageMode==='safe'?(ss.filter(s=>captureImageUrl(s,'safe',{allowShared:true}))||ss):ss;
    return [...(pool.length?pool:ss)].sort((a,b)=>{
      const ai=(captureImageIsSelected(a,imageMode)?80:0)+(Number.isInteger(auditPhotoIndex(a))?18:0)+visualScore(a)+(staticHeroSafeForSocial(a)?4:0);
      const bi=(captureImageIsSelected(b,imageMode)?80:0)+(Number.isInteger(auditPhotoIndex(b))?18:0)+visualScore(b)+(staticHeroSafeForSocial(b)?4:0);
      return bi-ai;
    })[0];
  }
  function coverTitleForSource(source,slide){
    const t=String(source.title||slide.title||'').trim();
    return t.length<=32?t:String(slide.title||t).trim();
  }
  function coverThemeImage(source){
    const text=`${source?.title||''} ${source?.idea?.hook||''} ${source?.idea?.reason||''}`.toLowerCase();
    if(/いちご|苺|strawberry/.test(text))return '../images/ai/strawberry-greenhouse.jpg';
    if(/温泉|スパ|サウナ|onsen|spa/.test(text))return '../images/ai/onsen-garden.jpg';
    if(/川|渓流|river/.test(text))return '../images/ai/kiyokawa-river.jpg';
    if(/海|水辺|プール|水遊び|aquarium|beach|water/.test(text))return '../images/ai/cool-water.jpg';
    if(/カフェ|グルメ|ランチ|アフタヌーン|cafe|food|restaurant/.test(text))return '../images/ai/cafe-interior.jpg';
    if(/公園|自然|緑|庭園|森|nature|garden|park/.test(text))return '../images/ai/forest-path.jpg';
    if(/雨|室内|ミュージアム|美術館|アート|科学|museum|indoor|art/.test(text))return '../images/ai/culture-interior.jpg';
    if(/子ども|親子|キッズ|遊び|体験|family|kids|play/.test(text))return '../images/ai/kids-play-b.jpg';
    return '../images/ai/culture-interior.jpg';
  }
  function captureSlideHtml(slide,idx,total,source,imageMode){
    const brand='Kibun Trip';
    if(slide.kind==='article-poster'){
      return `<section class="capture-item"><article class="ig-canvas ig-poster-slide"><img class="ig-poster-image" src="${esc(slide.image)}" alt="" loading="eager"><span class="ig-poster-count">${idx+1}/${total}</span><div class="ig-poster-footer"><div class="ig-real-brand"><img src="../favicon.svg" alt=""><strong>Kibun Trip</strong></div><div class="ig-ai-meta"><span>AIイメージ</span><small>※画像は生成AIによるイメージです。実際の施設・景観とは異なる場合があります。</small></div></div></article></section>`;
    }
    if(slide.kind==='article-spots'){
      return `<section class="capture-item"><article class="ig-canvas ig-article-spots"><div class="ig-article-spots-top"><div><p>SPOT GUIDE · ${esc(AREA_LABEL[source.area]||'おでかけ')}</p><h2>${esc(slide.title)}</h2></div><span class="ig-count">${idx+1}/${total}</span></div><p class="ig-article-spots-lead">${esc(slide.body)}</p><div class="ig-article-spots-grid">${slide.spots.map((s,j)=>`<article class="ig-article-spot-card"><img src="${esc(articleSpotImage(slide.slug,j))}" alt="" loading="eager"><div><span>${String(j+1).padStart(2,'0')} · ${esc(s.city||s.prefecture||'')}</span><h3>${esc(s.name)}</h3><p>${esc(spotGridBlurb(s,slide.idea))}</p></div></article>`).join('')}</div><div class="ig-article-spots-footer"><div class="ig-real-brand"><img src="../favicon.svg" alt=""><strong>Kibun Trip</strong></div><div><span>保存して、次のおでかけ候補に。</span><small>${esc(AI_DISCLOSURE)}</small></div></div></article></section>`;
    }
    if(slide.kind==='kibun-intro'){
      return `<section class="capture-item"><article class="ig-canvas ig-kibun-ui"><div class="ig-ui-brandbar"><div class="ig-real-brand"><img src="../favicon.svg" alt=""><strong>Kibun Trip</strong></div><span class="ig-count">${idx+1}/${total}</span></div><div class="ig-ui-copy"><p>MOOD FIRST. PLACE SECOND.</p><h2>サイトでは、<br>こんなふうに探せます。</h2></div><div class="ig-ui-window"><div class="ig-ui-window-head"><div class="ig-ui-window-brand"><span class="ig-brand-dots"><i></i><i></i><i></i></span><b>Kibun Trip</b></div><small>MOOD → DAY</small></div><div class="ig-ui-window-body"><p class="ig-ui-eyebrow">今日は、<em>どんな気分？</em></p><div class="ig-ui-section"><div class="ig-ui-label"><span>01</span><strong>誰と過ごす？</strong></div><div class="ig-ui-chip-row"><span class="selected">子どもと</span><span>ふたりで</span><span>ひとりで</span></div></div><div class="ig-ui-section"><div class="ig-ui-label"><span>02</span><strong>今日を組み立てる</strong><small>最大3つ</small></div><div class="ig-ui-vibes"><span class="selected">のんびり</span><span>非日常</span><span>体験したい</span></div></div><div class="ig-ui-condition-row"><span>TIME <b>半日くらい</b></span><span>WEATHER <b>雨</b></span></div><div class="ig-ui-button">今日の過ごし方を見る <b>→</b></div><div class="ig-ui-results"><small>TODAY'S PLANS</small><strong>今日のあなたなら、こんな3つ。</strong><div><span>01<br><b>ゆっくり</b></span><span>02<br><b>非日常</b></span><span>03<br><b>体験</b></span></div></div></div></div><div class="ig-ui-bottom"><span>プロフィールのリンクから</span><strong>kibuntrip.com →</strong></div></article></section>`;
    }
    if(slide.kind==='cover'){
      const spot=coverSpotForSource(source,imageMode);
      const media=imageMode==='safe'?coverThemeImage(source):(spot?captureImageUrl(spot,imageMode,{allowShared:true}):'');
      const preview=imageMode==='audit',selected=imageMode==='audit'&&captureImageIsSelected(spot,imageMode),credit=imageMode==='audit'?captureImageCredit(spot,imageMode):'';
      const heroAttr=preview&&spot?` data-hero-spot="${esc(spot.spot_id)}"`:'';
      return `<section class="capture-item"><article class="ig-canvas ig-cover ${media?'has-cover-image':''}">${media?`<div class="ig-cover-media" data-hero-wrap><img src="${esc(media)}" alt="" loading="eager"${heroAttr}>${preview?'<span class="preview-watermark">HERO PREVIEW · 権利確認</span>':''}${selected?'<span class="sns-image-badge">SNS IMAGE</span>':''}${credit?`<small class="sns-image-credit">${esc(credit)}</small>`:(preview?'<small class="hero-credit capture-credit" data-hero-credit hidden></small>':'')}</div>`:''}<div class="ig-cover-shade"></div><div class="ig-top"><span class="ig-chip">保存版</span><span class="ig-count">${idx+1}/${total}</span></div><div class="ig-cover-copy"><p class="ig-kicker">${esc(typeLabel(source.idea||{}))} · ${esc(AREA_LABEL[source.area]||'おでかけ')}</p><h2>${esc(coverTitleForSource(source,slide))}</h2><p>${esc(slide.body)}</p></div><div class="ig-footer"><strong>${brand}</strong><span>${imageMode==='safe'?'次の休日の候補に':(spot?esc(spot.name):'次の休日の候補に')}</span></div></article></section>`;
    }
    if(slide.kind==='summary'){
      const lines=String(slide.body||'').split(/\n+/).filter(Boolean);
      return `<section class="capture-item"><article class="ig-canvas ig-summary"><div class="ig-top"><span class="ig-chip">使い分け</span><span class="ig-count">${idx+1}/${total}</span></div><div class="ig-copy"><h2>${esc(slide.title)}</h2><p class="ig-sub">迷ったときの選び方を、ひと目で。</p><div class="ig-bullets">${lines.map(line=>`<div class="ig-bullet">${esc(line)}</div>`).join('')}</div></div><div class="ig-footer"><strong>${brand}</strong><span>保存してあとで見返す</span></div></article></section>`;
    }
    if(slide.kind==='cta'){
      const lines=String(slide.body||'').split(/\n+/).filter(Boolean);
      return `<section class="capture-item"><article class="ig-canvas ig-cta"><div class="ig-top"><span class="ig-chip">Kibunへ</span><span class="ig-count">${idx+1}/${total}</span></div><div class="ig-copy"><p class="ig-kicker">今日の気分から探す</p><h2>${esc(slide.title)}</h2><div class="ig-bullets simple">${lines.map(line=>`<div class="ig-bullet">${esc(line)}</div>`).join('')}</div></div><div class="ig-brand-block"><strong>Kibun Trip</strong><span>東京・神奈川のおでかけヒント</span><small>kibuntrip.com</small></div></article></section>`;
    }
    const media=slide.spot?captureImageUrl(slide.spot,imageMode):'';
    const area=[slide.spot?.city,slide.spot?.prefecture].filter(Boolean)[0]||'';
    const preview=imageMode==='audit',selected=captureImageIsSelected(slide.spot,imageMode),credit=captureImageCredit(slide.spot,imageMode);
    const heroAttr=preview?` data-hero-spot="${esc(slide.spot.spot_id)}"`:(imageMode==='safe'&&!selected?` data-auto-sns-spot="${esc(slide.spot.spot_id)}"`:'');
    const mediaBlock=media?`<div class="ig-media" data-hero-wrap><img src="${esc(media)}" alt="" loading="eager"${heroAttr}>${preview?'<span class="preview-watermark">HERO PREVIEW · 権利確認</span>':''}${selected?'<span class="sns-image-badge">SNS IMAGE</span>':''}${credit?`<small class="sns-image-credit">${esc(credit)}</small>`:(imageMode==='safe'?'<small class="sns-image-credit" data-auto-sns-credit hidden></small>':'<small class="hero-credit capture-credit" data-hero-credit hidden></small>')}</div>`:noteCardHtml(slide.spot,idx,imageMode);
    const bodyText=media?slide.body:truncate(slide.body,38);
    return `<section class="capture-item"><article class="ig-canvas ig-spot ${media?'has-media':'no-media'}"><div class="ig-top"><span class="ig-chip">${esc(slide.label)}</span><span class="ig-count">${idx+1}/${total}</span></div><div class="ig-copy"><p class="ig-kicker">${area?esc(area)+' · ':''}${esc(categoryDisplay(slide.spot))}</p><h2>${esc(slide.title)}</h2><p>${esc(bodyText)}</p></div>${mediaBlock}<div class="ig-footer"><strong>${brand}</strong><span>保存してあとで見返す</span></div></article></section>`;
  }
  function captureSourceById(id){
    const post=state.posts.find(x=>x.id===id);
    if(post){
      const idea=post.idea_id?ideas.find(x=>x.id===post.idea_id):null;
      const refreshed=idea?draftForIdea(idea):null;
      const forceEditorial=Boolean(idea&&articlePosterForIdea(idea));
      const carousel=forceEditorial?refreshed.slides:(Array.isArray(post.draft?.carousel)&&post.draft.carousel.length?post.draft.carousel:(refreshed?.slides||[]));
      const caption=forceEditorial?refreshed.instagram:(post.draft?.instagram||refreshed?.instagram||'');
      return {kind:'post',id:post.id,title:forceEditorial?articlePosterForIdea(idea).title:(post.title||idea?.title||'Instagram Draft'),slides:carousel,caption,area:idea?.area||areaOfSpots((post.spot_ids||[]).map(spotById).filter(Boolean)),idea};
    }
    const idea=ideas.find(x=>x.id===id);
    if(!idea)return null;
    const d=draftForIdea(idea);
    return {kind:'idea',id:idea.id,title:articlePosterForIdea(idea)?.title||idea.title,slides:d.slides,caption:d.instagram,area:idea.area,idea};
  }
  function captionWithImageCredits(source,imageMode){
    let base=String(source.caption||'').trim();
    const hasGeneratedPoster=(source.slides||[]).some(x=>x.kind==='article-poster');
    if(hasGeneratedPoster&&!base.includes('生成AIによるイメージ'))base=`${base}\n\n${AI_DISCLOSURE}`.trim();
    if(imageMode!=='safe'||!window.KibunSnsImages)return base;
    const credits=[];
    const seen=new Set();
    for(const slide of source.slides||[]){
      const spot=slide.spot;if(!spot||seen.has(spot.spot_id))continue;seen.add(spot.spot_id);
      const rec=snsImageRecord(spot);if(!rec)continue;
      const line=window.KibunSnsImages.captionCredit?.(rec)||'';if(line)credits.push(`${spot.name}: ${line}`);
    }
    return credits.length?`${base}\n\nPhoto credits\n${credits.join('\n')}`:base;
  }
  function renderCaptureMode(id){
    const source=captureSourceById(id);
    if(!source){
      document.body.innerHTML=`<main class="capture-page"><section class="capture-missing"><h1>投稿データが見つかりません</h1><p>URLが古い可能性があります。SNS Auditに戻って、もう一度開いてください。</p><a class="primary-btn" href="./">SNS Auditへ戻る</a></section></main>`;
      document.body.classList.add('capture-mode');
      return true;
    }
    const params=new URLSearchParams(location.search),imageMode=params.get('imageMode')==='audit'?'audit':'safe';
    const modeUrl=mode=>`./?capture=${encodeURIComponent(id)}&imageMode=${mode}`;
    const editorialPoster=(source.slides||[]).some(x=>x.kind==='article-poster');
    const captureCaption=captionWithImageCredits(source,imageMode);
    const captionBlock=captureCaption?`<section class="capture-caption" id="captureCaption"><div class="capture-caption-head"><h2>Instagram Caption</h2><button class="secondary-btn" type="button" id="copyCaptureCaption">キャプションをコピー</button></div><pre>${esc(captureCaption)}</pre></section>`:'';
    const helpText=editorialPoster?'記事投稿は2枚構成です。1枚目は気を引く生成AIイメージ＋タイトル、2枚目は3スポットを紹介する保存用カード。キャプションでも各スポットの魅力を短く補足し、公式Instagramを確認済みの施設は施設名の横に @メンションを入れます。':(imageMode==='safe'?'SNS投稿用は、1枚目をKibunの生成AIイメージにします。2枚目以降はIMAGE / RIGHTSで採用済みの実写真を最優先し、条件を満たさない場合はKibun編集ノートに切り替えます。':'Hero監査で選んだGoogle Places写真を確認するプレビューです。SNSへの画像再利用権は別途確認してください。');
    const modeSwitch=editorialPoster?'<div class="capture-mode-switch"><a class="active" href="./?capture='+encodeURIComponent(id)+'">SNS投稿用 · 2枚構成</a></div>':`<div class="capture-mode-switch"><a class="${imageMode==='safe'?'active':''}" href="${modeUrl('safe')}">SNS投稿用</a><a class="${imageMode==='audit'?'active':''}" href="${modeUrl('audit')}">監査Hero確認</a><a href="./?workspace=images">実写真を探す →</a></div>`;
    document.body.classList.add('capture-mode');
    document.body.classList.toggle('capture-preview-mode',!editorialPoster&&imageMode==='audit');
    document.body.innerHTML=`<main class="capture-page"><header class="capture-header"><a class="capture-back" href="./">← SNS Audit</a><button class="secondary-btn" type="button" id="toggleCaptureHelp">説明を隠す</button></header><section class="capture-intro" id="captureHelp"><p class="eyebrow">SCREENSHOT MODE</p><h1>${esc(source.title)}</h1><p>${esc(helpText)}</p>${modeSwitch}<div class="capture-meta"><span>${source.slides.length} slides</span><span>${esc(source.kind==='post'?'投稿下書き':'企画プレビュー')}</span>${editorialPoster?'<span class="rights-safe">AI表記あり</span><span class="rights-safe">2枚目 スポット紹介</span>':(imageMode==='audit'?'<span class="rights-warning">画像権利 要確認</span>':'<span class="rights-safe">SNS-safe優先</span>')}</div></section><section class="capture-stack">${source.slides.map((slide,idx)=>captureSlideHtml(slide,idx,source.slides.length,source,imageMode)).join('')}</section>${captionBlock}</main>`;
    document.getElementById('toggleCaptureHelp')?.addEventListener('click',()=>{
      document.body.classList.toggle('capture-clean');
      const btn=document.getElementById('toggleCaptureHelp');
      if(btn)btn.textContent=document.body.classList.contains('capture-clean')?'説明を表示':'説明を隠す';
    });
    document.getElementById('copyCaptureCaption')?.addEventListener('click',()=>copyText(captureCaption,'キャプションをコピーしました'));
    resolveHeroImages(document,{safeOnly:imageMode==='safe'});
    if(imageMode==='safe')resolveAutoSnsImages(document);
    return true;
  }
  function openIdea(id){
    const i=ideas.find(x=>x.id===id);if(!i)return;
    const d=draftForIdea(i),ss=i.spotIds.map(spotById).filter(Boolean);
    $('ideaDetail').innerHTML=`<section class="detail-head"><div class="idea-kicker"><span class="idea-badge">${esc(typeLabel(i))}</span><span class="idea-badge source">${esc(sourceLabel(i))}${i.source==='generated'&&i.destination?.type==='article'?' · 記事導線あり':''}</span></div><h2 class="detail-title">${esc(i.title)}</h2><p class="detail-lead">${esc(i.reason)}</p><div class="detail-meta"><span>対象 · ${esc(audienceText(i))}</span><span>目的 · ${esc(i.objective)}</span><span>おすすめ · ${esc(d.timing)}</span><span>Priority · ${i.scores.priority}</span>${officialInstagramCount(i.spotIds.map(spotById).filter(Boolean))?`<span>公式Instagram · ${officialInstagramCount(i.spotIds.map(spotById).filter(Boolean))}/${i.spotIds.length}件メンション</span>`:''}${i.destination?.url?`<a href="${esc(i.destination.url)}" target="_blank" rel="noopener">遷移先を確認 →</a>`:''}</div><div class="detail-actions"><button class="primary-btn" type="button" data-dialog-add="${esc(i.id)}">この企画を運用に追加</button><button class="secondary-btn" type="button" data-copy-value="${esc(d.instagram)}">Instagram原稿をコピー</button><a class="secondary-btn" href="./?capture=${encodeURIComponent(i.id)}">スクショ用ページを開く</a><a class="secondary-btn" href="./?workspace=images&imageSpot=${encodeURIComponent(i.spotIds[0]||'')}">SNS実写真を探す</a></div></section>
      <section class="draft-section"><div class="draft-section-head"><div><h3>Instagram Carousel</h3><p class="note">${d.usesGeneratedPoster?'記事投稿は2枚。1枚目＝AIイメージ＋タイトル、2枚目＝3スポット紹介。':'スポット数に応じて基本8枚前後。最後だけKibun導線。'}</p></div></div><div class="carousel-grid">${d.slides.map(slideHtml).join('')}</div></section>
      <section class="draft-section"><div class="draft-section-head"><h3>Instagram Caption</h3></div><div class="copy-box"><button class="copy-btn" type="button" data-copy-value="${esc(d.instagram)}">コピー</button><pre>${esc(d.instagram)}</pre></div></section>
      <section class="draft-section"><div class="draft-section-head"><h3>X Draft</h3></div><div class="copy-box"><button class="copy-btn" type="button" data-copy-value="${esc(d.x)}">コピー</button><pre>${esc(d.x)}</pre></div></section>
      <section class="draft-section"><div class="draft-section-head"><h3>Hashtags</h3></div><div class="hashtags">${d.hashtags.map(x=>`<span>${esc(x)}</span>`).join('')}</div></section>
      <section class="draft-section"><div class="draft-section-head"><h3>使用スポット / 推奨画像</h3></div><div class="used-spots">${ss.map(s=>{const snsRec=snsImageRecord(s);return `<div class="used-spot">${snsRec?.image_url?`<img src="${esc(snsRec.image_url)}" alt="" loading="lazy">`:mediaUrl(s)?`<img src="${esc(mediaUrl(s))}" alt="" loading="lazy" data-hero-spot="${esc(s.spot_id)}">`:''}<span><strong>${esc(s.name)}</strong><small>${esc(s.spot_id)} · ${esc(s.city||s.prefecture||'')}</small><a class="used-spot-image-link" href="./?workspace=images&imageSpot=${encodeURIComponent(s.spot_id)}">${snsRec?'SNS画像設定済み':'SNS実写真を探す'} →</a></span></div>`}).join('')}</div></section>`;
    $('ideaDetail').querySelectorAll('[data-copy-value]').forEach(b=>b.addEventListener('click',()=>copyText(b.dataset.copyValue,'原稿をコピーしました')));
    $('ideaDetail').querySelector('[data-dialog-add]')?.addEventListener('click',()=>addIdeaToOperations(i.id));
    $('ideaDialog').showModal();
    resolveHeroImages($('ideaDetail'));
  }
  function newPost(){const id='post_'+Date.now();return normalizePost({id,date:'',channel:'Instagram',title:'新しい投稿',status:'planned',destination_type:'',destination_url:'',spot_id:'',spot_ids:[],hero_ref:'',instagram_route:'',instagram_url:'',affiliate_status:'',result:{}});}
  function postFromIdea(i){
    const d=draftForIdea(i),first=spotById(i.spotIds[0]);
    const destinationType=i.destination?.type==='article'?'article':i.destination?.type==='plan'?'plan':'';
    return normalizePost({
      id:'post_'+Date.now(),date:'',channel:'Instagram',title:i.title,status:'draft',idea_id:i.id,content_source:i.source,
      destination_type:destinationType,destination_url:i.destination?.url||'',spot_id:i.spotIds[0]||'',spot_ids:i.spotIds,
      hero_ref:first?.hero_image?.url||'',instagram_route:'search',instagram_url:'',affiliate_status:'',draft:{instagram:d.instagram,x:d.x,carousel:d.slides},result:{}
    });
  }
  function addIdeaToOperations(id){
    const i=ideas.find(x=>x.id===id);if(!i)return;
    if(state.posts.some(p=>p.idea_id===id)){switchWorkspace('operations');$('statusFilter').value='all';render();flash('この企画はすでに運用にあります');$('ideaDialog').open&&$('ideaDialog').close();return;}
    state.posts.unshift(postFromIdea(i));persist();switchWorkspace('operations');$('statusFilter').value='all';render();$('ideaDialog').open&&$('ideaDialog').close();flash('企画と投稿原稿を運用に追加しました');
  }

  function affiliateSummary(spot){if(!spot)return 'スポット未指定';const links=[...(aff.links?.[spot.spot_id]||[]),...(aff.sourceLinks?.[spot.spot_id]||[])];if(links.length)return `リンク設定あり · ${links.length}件`;const a=affAudit[spot.spot_id];if(a?.status==='recheck_needed')return '再調査';if(a?.status==='researched_no_partner')return 'ASP商品なし確認';if(a?.status==='direct_only')return '公式導線のみ';if(a?.status==='not_target')return '対象外';return a?.status||'未確認';}
  function instagramSuggestion(spot){if(!spot)return'';const s=spot.social||spot.social_media||{};return s.instagram_url||s.instagram||s.reel_url||'';}
  function heroSuggestion(spot){return spot?.hero_image?.url||'';}
  function destinationSuggestion(post,spot){if(post.destination_type==='spot'&&spot)return `../?spot=${encodeURIComponent(spot.spot_id)}`;return'';}
  function update(id,path,value){const p=state.posts.find(x=>x.id===id);if(!p)return;const parts=path.split('.');let o=p;while(parts.length>1){const k=parts.shift();o[k]??={};o=o[k];}o[parts[0]]=value;if(path==='spot_id'&&!p.spot_ids?.length)p.spot_ids=value?[value]:[];persist();renderSummary();}
  function statusLabel(x){return {planned:'予定',draft:'下書き',scheduled:'予約済み',published:'投稿済み'}[x]||x||'未設定';}
  function draftBox(post){
    if(!post.draft?.instagram&&!post.draft?.x)return'';
    const captureLink=Array.isArray(post.draft?.carousel)&&post.draft.carousel.length?`<a class="secondary-btn" href="./?capture=${encodeURIComponent(post.id)}">スクショ用ページを開く</a>`:'';
    return `<details class="draft-box"><summary>投稿原稿（企画から生成）</summary><div class="draft-copy">${post.draft.instagram?`<label>Instagram<textarea data-field="draft.instagram" rows="8">${esc(post.draft.instagram)}</textarea><span class="draft-copy-actions"><button class="secondary-btn" type="button" data-copy-draft="instagram">Instagramをコピー</button>${captureLink}</span></label>`:''}${post.draft.x?`<label>X<textarea data-field="draft.x" rows="6">${esc(post.draft.x)}</textarea><span class="draft-copy-actions"><button class="secondary-btn" type="button" data-copy-draft="x">Xをコピー</button></span></label>`:''}</div></details>`;
  }
  function card(post){
    const spot=spotById(post.spot_id),suggestHero=heroSuggestion(spot),suggestIg=instagramSuggestion(spot),suggestDest=destinationSuggestion(post,spot);
    return `<article class="post-card" data-id="${esc(post.id)}"><div class="post-head"><div><span class="post-id">${esc(post.id)}</span>${post.idea_id?`<span class="post-origin">Kibun Editors</span>`:''}<h2>${esc(post.title||'投稿')}</h2><span class="status-chip">${esc(statusLabel(post.status))}</span></div><button class="remove-post" type="button" data-remove>削除</button></div><div class="grid">
      <label class="field"><span>投稿日</span><input data-field="date" type="date" value="${esc(post.date)}"></label>
      <label class="field"><span>Channel</span><select data-field="channel"><option${post.channel==='Instagram'?' selected':''}>Instagram</option><option${post.channel==='X'?' selected':''}>X</option><option${post.channel==='Note'?' selected':''}>Note</option><option${post.channel==='Other'?' selected':''}>Other</option></select></label>
      <label class="field full"><span>投稿名 / テーマ</span><input data-field="title" value="${esc(post.title)}"></label>
      <label class="field"><span>状態</span><select data-field="status"><option value="planned"${post.status==='planned'?' selected':''}>予定</option><option value="draft"${post.status==='draft'?' selected':''}>下書き</option><option value="scheduled"${post.status==='scheduled'?' selected':''}>予約済み</option><option value="published"${post.status==='published'?' selected':''}>投稿済み</option></select></label>
      <label class="field"><span>遷移先</span><select data-field="destination_type"><option value=""${!post.destination_type?' selected':''}>未設定 / 検索</option><option value="article"${post.destination_type==='article'?' selected':''}>記事</option><option value="plan"${post.destination_type==='plan'?' selected':''}>プラン</option><option value="spot"${post.destination_type==='spot'?' selected':''}>スポット</option></select></label>
      <label class="field"><span>代表 spot ID</span><input data-field="spot_id" value="${esc(post.spot_id)}" placeholder="spot_001"><small>${spot?esc(spot.name):'代表画像・Affiliate判定に使用'}</small></label>
      <label class="field"><span>使用 spot IDs</span><input data-field="spot_ids_text" value="${esc((post.spot_ids||[]).join(', '))}" placeholder="spot_001, spot_002"><small>企画で使用する複数スポット</small></label>
      <label class="field full"><span>遷移URL</span><input data-field="destination_url" value="${esc(post.destination_url)}" placeholder="https://kibuntrip.com/..."><div class="mini-actions">${suggestDest?`<button type="button" data-fill="destination_url" data-value="${esc(suggestDest)}">スポットURLを補完</button>`:''}${post.destination_url?`<a href="${esc(post.destination_url)}" target="_blank" rel="noopener">開く →</a>`:''}</div></label>
      <label class="field full"><span>使用Hero</span><input data-field="hero_ref" value="${esc(post.hero_ref)}" placeholder="assets/... または Google Places 選択Hero"><div class="mini-actions">${suggestHero?`<button type="button" data-fill="hero_ref" data-value="${esc(suggestHero)}">現在のHeroを補完</button>`:''}</div></label>
      <label class="field"><span>Instagram導線</span><select data-field="instagram_route"><option value=""${!post.instagram_route?' selected':''}>未設定</option><option value="official"${post.instagram_route==='official'?' selected':''}>公式Instagram</option><option value="reel"${post.instagram_route==='reel'?' selected':''}>公式Reel</option><option value="search"${post.instagram_route==='search'?' selected':''}>投稿検索</option><option value="none"${post.instagram_route==='none'?' selected':''}>なし</option></select></label>
      <label class="field"><span>Instagram URL</span><input data-field="instagram_url" value="${esc(post.instagram_url)}" placeholder="https://www.instagram.com/..."><div class="mini-actions">${suggestIg?`<button type="button" data-fill="instagram_url" data-value="${esc(suggestIg)}">登録済み導線を補完</button>`:''}</div></label>
      <label class="field full"><span>Affiliate準備状況</span><input data-field="affiliate_status" value="${esc(post.affiliate_status)}" placeholder="自動判定を使うなら空欄"><div class="readiness">代表スポットの自動判定: <strong>${esc(affiliateSummary(spot))}</strong></div></label>
    </div>${draftBox(post)}<section class="result-box"><h3>投稿実績</h3><div class="result-grid">
      <label>Impressions<input data-field="result.impressions" inputmode="numeric" value="${esc(post.result?.impressions)}"></label><label>Reach<input data-field="result.reach" inputmode="numeric" value="${esc(post.result?.reach)}"></label><label>Saves<input data-field="result.saves" inputmode="numeric" value="${esc(post.result?.saves)}"></label><label>Clicks<input data-field="result.clicks" inputmode="numeric" value="${esc(post.result?.clicks)}"></label><label>Profile visits<input data-field="result.profile_visits" inputmode="numeric" value="${esc(post.result?.profile_visits)}"></label>
      </div><label class="field result-notes"><span>メモ</span><textarea data-field="result.notes" rows="3">${esc(post.result?.notes)}</textarea></label></section></article>`;
  }
  function visible(){const q=$('textFilter').value.trim().toLowerCase(),st=$('statusFilter').value;return state.posts.filter(p=>(st==='all'||p.status===st)&&(!q||`${p.title} ${p.spot_id} ${(p.spot_ids||[]).join(' ')} ${p.destination_url}`.toLowerCase().includes(q)));}
  function renderSummary(){const all=state.posts,pub=all.filter(x=>x.status==='published').length,drafts=all.filter(x=>x.status==='draft').length,missingDest=all.filter(x=>!x.destination_url).length,withIdea=all.filter(x=>x.idea_id).length;$('summary').innerHTML=`<span class="metric"><strong>${all.length}</strong> 投稿</span><span class="metric"><strong>${drafts}</strong> 下書き</span><span class="metric"><strong>${pub}</strong> 投稿済み</span><span class="metric"><strong>${withIdea}</strong> Editors企画</span><span class="metric"><strong>${missingDest}</strong> 遷移先未設定</span>`;}
  function bind(){
    document.querySelectorAll('.post-card').forEach(cardEl=>{
      const id=cardEl.dataset.id;
      cardEl.querySelectorAll('[data-field]').forEach(el=>el.addEventListener('change',()=>{
        if(el.dataset.field==='spot_ids_text'){
          const p=state.posts.find(x=>x.id===id);if(p){p.spot_ids=el.value.split(',').map(x=>x.trim()).filter(Boolean);persist();}
        }else update(id,el.dataset.field,el.value);
        render();
      }));
      cardEl.querySelectorAll('[data-fill]').forEach(btn=>btn.addEventListener('click',()=>{update(id,btn.dataset.fill,btn.dataset.value);render();flash('補完しました')}));
      cardEl.querySelectorAll('[data-copy-draft]').forEach(btn=>btn.addEventListener('click',()=>{const p=state.posts.find(x=>x.id===id);copyText(p?.draft?.[btn.dataset.copyDraft]||'','投稿原稿をコピーしました')}));
      cardEl.querySelector('[data-remove]')?.addEventListener('click',()=>{if(!confirm('この投稿を削除しますか？'))return;state.posts=state.posts.filter(x=>x.id!==id);persist();render();});
    });
  }
  function render(){renderSummary();const rows=visible();$('auditList').innerHTML=rows.length?rows.map(card).join(''):'<article class="post-card"><h2>該当する投稿はありません。</h2></article>';bind();}
  function exportData(){return {version:'20.11.14',exported_at:new Date().toISOString(),posts:state.posts};}
  async function copyText(text,msg){try{await navigator.clipboard.writeText(text)}catch(_e){const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}flash(msg);}
  function flash(msg){const el=$('flash');if(!el)return;el.textContent=msg;clearTimeout(flash.t);flash.t=setTimeout(()=>el.textContent='',2400);}
  function switchWorkspace(name){
    document.querySelectorAll('[data-workspace-panel]').forEach(p=>p.hidden=p.dataset.workspacePanel!==name);
    document.querySelectorAll('[data-workspace]').forEach(b=>{const active=b.dataset.workspace===name;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
  }

  const pageParams=typeof URLSearchParams!=='undefined'?new URLSearchParams(location.search):null;
  const captureId=pageParams?.get('capture')||null;
  if(captureId){renderCaptureMode(captureId);return;}

  document.querySelectorAll('[data-workspace]').forEach(b=>b.addEventListener('click',()=>switchWorkspace(b.dataset.workspace)));
  ['ideaTextFilter','ideaTypeFilter','ideaAudienceFilter','ideaAreaFilter','ideaSourceFilter'].forEach(id=>$(id).addEventListener(id==='ideaTextFilter'?'input':'change',renderIdeas));
  $('ideaDialogClose').addEventListener('click',()=>$('ideaDialog').close());
  $('ideaDialog').addEventListener('click',e=>{if(e.target===$('ideaDialog'))$('ideaDialog').close();});
  $('addPost').addEventListener('click',()=>{state.posts.unshift(newPost());persist();$('statusFilter').value='all';render();flash('投稿を追加しました')});
  $('copyJson').addEventListener('click',()=>copyText(JSON.stringify(exportData(),null,2),'設定JSONをコピーしました'));
  $('downloadJson').addEventListener('click',()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(exportData(),null,2)],{type:'application/json'}));a.download='kibun-sns-audit-v20.11.14.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);flash('JSONを保存しました')});
  $('importJson').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const obj=JSON.parse(await f.text());if(!Array.isArray(obj.posts))throw new Error();state={version:'20.11.14',posts:obj.posts.map(normalizePost)};persist();render();flash('JSONを読み込みました')}catch(_e){flash('JSONを読み込めませんでした')}e.target.value='';});
  $('resetLocal').addEventListener('click',()=>{if(!confirm('SNS Auditの端末保存を初期化しますか？'))return;localStorage.removeItem(KEY);LEGACY_KEYS.forEach(k=>localStorage.removeItem(k));state={version:'20.11.14',posts:mergeSeedPosts([])};persist();render();flash('初期状態に戻しました')});
  $('textFilter').addEventListener('input',render);$('statusFilter').addEventListener('change',render);
  renderIdeaSummary();renderIdeas();render();
  const requestedWorkspace=pageParams?.get('workspace');
  const requestedSpot=pageParams?.get('imageSpot');
  if(requestedSpot&&$('imageSpotFilter'))$('imageSpotFilter').value=requestedSpot;
  if(requestedWorkspace==='images'){switchWorkspace('images');window.KibunSnsImages?.render?.();}
})();
