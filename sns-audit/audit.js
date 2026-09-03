(function(){
  const KEY='kibun-sns-audit-v20101';
  const OLD_KEY='kibun-sns-audit-v2091';
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

  function load(){
    for(const key of [KEY,OLD_KEY]){
      try{
        const x=JSON.parse(localStorage.getItem(key)||'null');
        if(x?.posts){
          const value={version:'20.10.1',posts:x.posts.map(normalizePost)};
          if(key===OLD_KEY)localStorage.setItem(KEY,JSON.stringify(value));
          return value;
        }
      }catch(_e){}
    }
    return {version:'20.10.1',posts:clone(seed.posts||[]).map(normalizePost)};
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
    const u=s?.hero_image?.url||'';if(!u)return'';
    if(/^https?:\/\//.test(u)||u.startsWith('data:')||u.startsWith('../'))return u;
    return '../'+u.replace(/^\.\//,'').replace(/^\//,'');
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
  function spotBlurb(s,audience){
    const base=firstSentence(s?.public_copy)||firstSentence(s?.editorial?.lead)||`${s?.name||'この場所'}で過ごす時間。`;
    const e=s?.experience_seed||{};
    if(audience.includes('family')&&num(e.parent_rest)>=78)return truncate(`${base} 親もひと息つきやすい候補。`,86);
    if(audience.includes('family')&&num(e.baby_fit)>=82)return truncate(`${base} 小さい子とのおでかけにも合わせやすい。`,86);
    return truncate(base,86);
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
  function draftForIdea(i){
    const ss=i.spotIds.map(spotById).filter(Boolean);
    const slides=[{kind:'cover',label:'COVER',title:i.hook,body:'保存して、次の休日の候補に。'}];
    ss.forEach((s,idx)=>slides.push({kind:'spot',label:`SPOT ${String(idx+1).padStart(2,'0')}`,title:s.name,body:spotBlurb(s,i.audience),spot:s}));
    slides.push({kind:'summary',label:'HOW TO CHOOSE',title:'迷ったら、こんな使い分け。',body:useCaseLines(i,ss).join('\n')});
    slides.push({kind:'cta',label:'KIBUN',title:'まだ決まらない？',body:`${ctaText(i)}\n${i.destination?.label||''}`});
    const names=ss.map((s,idx)=>`${String(idx+1).padStart(2,'0')} ${s.name}`).join('\n');
    const intro=i.reason.replace(/。.*$/,'。');
    const ig=`${i.hook}\n\n${intro}\n\n${names}\n\n${useCaseLines(i,ss).join('\n')}\n\nあとで見返せるように保存しておくと便利です。\n${ctaText(i)}\n\n${hashtagsFor(i).join(' ')}`;
    const compactNames=ss.slice(0,5).map(s=>`・${truncate(s.name,20)}`).join('\n');
    const x=`${truncate(i.hook,64)}\n\n${compactNames}${ss.length>5?`\nほか${ss.length-5}スポット`:''}\n\n${ctaText(i)}\n${hashtagsFor(i).slice(0,3).join(' ')}`;
    const timing=i.type==='seasonal'?'今週〜今月。週末前の木〜金曜が第一候補。':i.type==='save'?'木〜金曜。週末の行き先検討が始まる前に。':'平日夜〜木曜。次の休日を考え始めるタイミングに。';
    return {slides,instagram:ig,x,timing,hashtags:hashtagsFor(i)};
  }
  function slideHtml(slide,idx){
    const media=slide.spot?mediaUrl(slide.spot):'';
    return `<article class="slide-card"><div class="slide-no"><span>SLIDE ${idx+1}</span><span>${esc(slide.label)}</span></div><h4>${esc(slide.title)}</h4><p>${esc(slide.body)}</p>${media?`<div class="slide-media"><img src="${esc(media)}" alt="" loading="lazy"></div><span class="slide-media-label">推奨画像 · ${esc(slide.spot.name)} Hero</span>`:''}</article>`;
  }
  function openIdea(id){
    const i=ideas.find(x=>x.id===id);if(!i)return;
    const d=draftForIdea(i),ss=i.spotIds.map(spotById).filter(Boolean);
    $('ideaDetail').innerHTML=`<section class="detail-head"><div class="idea-kicker"><span class="idea-badge">${esc(typeLabel(i))}</span><span class="idea-badge source">${esc(sourceLabel(i))}${i.source==='generated'&&i.destination?.type==='article'?' · 記事導線あり':''}</span></div><h2 class="detail-title">${esc(i.title)}</h2><p class="detail-lead">${esc(i.reason)}</p><div class="detail-meta"><span>対象 · ${esc(audienceText(i))}</span><span>目的 · ${esc(i.objective)}</span><span>おすすめ · ${esc(d.timing)}</span><span>Priority · ${i.scores.priority}</span>${i.destination?.url?`<a href="${esc(i.destination.url)}" target="_blank" rel="noopener">遷移先を確認 →</a>`:''}</div><div class="detail-actions"><button class="primary-btn" type="button" data-dialog-add="${esc(i.id)}">この企画を運用に追加</button><button class="secondary-btn" type="button" data-copy-value="${esc(d.instagram)}">Instagram原稿をコピー</button></div></section>
      <section class="draft-section"><div class="draft-section-head"><div><h3>Instagram Carousel</h3><p class="note">スポット数に応じて基本8枚前後。最後だけKibun導線。</p></div></div><div class="carousel-grid">${d.slides.map(slideHtml).join('')}</div></section>
      <section class="draft-section"><div class="draft-section-head"><h3>Instagram Caption</h3></div><div class="copy-box"><button class="copy-btn" type="button" data-copy-value="${esc(d.instagram)}">コピー</button><pre>${esc(d.instagram)}</pre></div></section>
      <section class="draft-section"><div class="draft-section-head"><h3>X Draft</h3></div><div class="copy-box"><button class="copy-btn" type="button" data-copy-value="${esc(d.x)}">コピー</button><pre>${esc(d.x)}</pre></div></section>
      <section class="draft-section"><div class="draft-section-head"><h3>Hashtags</h3></div><div class="hashtags">${d.hashtags.map(x=>`<span>${esc(x)}</span>`).join('')}</div></section>
      <section class="draft-section"><div class="draft-section-head"><h3>使用スポット / 推奨画像</h3></div><div class="used-spots">${ss.map(s=>`<div class="used-spot">${mediaUrl(s)?`<img src="${esc(mediaUrl(s))}" alt="" loading="lazy">`:''}<span><strong>${esc(s.name)}</strong><small>${esc(s.spot_id)} · ${esc(s.city||s.prefecture||'')}</small></span></div>`).join('')}</div></section>`;
    $('ideaDetail').querySelectorAll('[data-copy-value]').forEach(b=>b.addEventListener('click',()=>copyText(b.dataset.copyValue,'原稿をコピーしました')));
    $('ideaDetail').querySelector('[data-dialog-add]')?.addEventListener('click',()=>addIdeaToOperations(i.id));
    $('ideaDialog').showModal();
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
    return `<details class="draft-box"><summary>投稿原稿（企画から生成）</summary><div class="draft-copy">${post.draft.instagram?`<label>Instagram<textarea data-field="draft.instagram" rows="8">${esc(post.draft.instagram)}</textarea><span class="draft-copy-actions"><button class="secondary-btn" type="button" data-copy-draft="instagram">Instagramをコピー</button></span></label>`:''}${post.draft.x?`<label>X<textarea data-field="draft.x" rows="6">${esc(post.draft.x)}</textarea><span class="draft-copy-actions"><button class="secondary-btn" type="button" data-copy-draft="x">Xをコピー</button></span></label>`:''}</div></details>`;
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
  function exportData(){return {version:'20.10.1',exported_at:new Date().toISOString(),posts:state.posts};}
  async function copyText(text,msg){try{await navigator.clipboard.writeText(text)}catch(_e){const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}flash(msg);}
  function flash(msg){const el=$('flash');if(!el)return;el.textContent=msg;clearTimeout(flash.t);flash.t=setTimeout(()=>el.textContent='',2400);}
  function switchWorkspace(name){
    document.querySelectorAll('[data-workspace-panel]').forEach(p=>p.hidden=p.dataset.workspacePanel!==name);
    document.querySelectorAll('[data-workspace]').forEach(b=>{const active=b.dataset.workspace===name;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
  }

  document.querySelectorAll('[data-workspace]').forEach(b=>b.addEventListener('click',()=>switchWorkspace(b.dataset.workspace)));
  ['ideaTextFilter','ideaTypeFilter','ideaAudienceFilter','ideaAreaFilter','ideaSourceFilter'].forEach(id=>$(id).addEventListener(id==='ideaTextFilter'?'input':'change',renderIdeas));
  $('ideaDialogClose').addEventListener('click',()=>$('ideaDialog').close());
  $('ideaDialog').addEventListener('click',e=>{if(e.target===$('ideaDialog'))$('ideaDialog').close();});
  $('addPost').addEventListener('click',()=>{state.posts.unshift(newPost());persist();$('statusFilter').value='all';render();flash('投稿を追加しました')});
  $('copyJson').addEventListener('click',()=>copyText(JSON.stringify(exportData(),null,2),'設定JSONをコピーしました'));
  $('downloadJson').addEventListener('click',()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(exportData(),null,2)],{type:'application/json'}));a.download='kibun-sns-audit-v20.10.1.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);flash('JSONを保存しました')});
  $('importJson').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const obj=JSON.parse(await f.text());if(!Array.isArray(obj.posts))throw new Error();state={version:'20.10.1',posts:obj.posts.map(normalizePost)};persist();render();flash('JSONを読み込みました')}catch(_e){flash('JSONを読み込めませんでした')}e.target.value='';});
  $('resetLocal').addEventListener('click',()=>{if(!confirm('SNS Auditの端末保存を初期化しますか？'))return;localStorage.removeItem(KEY);localStorage.removeItem(OLD_KEY);state={version:'20.10.1',posts:clone(seed.posts||[]).map(normalizePost)};render();flash('初期状態に戻しました')});
  $('textFilter').addEventListener('input',render);$('statusFilter').addEventListener('change',render);
  renderIdeaSummary();renderIdeas();render();
})();
