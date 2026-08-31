(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./recommender.js'));
  else root.KibunPlans=factory(root.OdekakeRecommender);
})(typeof globalThis!=='undefined'?globalThis:this,function(Recommender){
  const {baseScores,hardFilterReason}=Recommender||{};
  const clamp=(x,lo=0,hi=100)=>Math.max(lo,Math.min(hi,x));
  function spotMap(seed){return new Map((seed.spots||[]).map(s=>[s.spot_id,s]));}
  function areaKey(s){
    const city=String(s.city||s.routing?.municipality||'').trim(),text=`${city} ${s.address||''}`;
    const majorWard=text.match(/(横浜市[^\s]{1,6}区|川崎市[^\s]{1,6}区)/);if(majorWard)return majorWard[1];
    if(/^[^\s]{1,8}区$/.test(city))return city;
    const tokyoWard=text.match(/東京都([^\s]{1,8}区)/);if(tokyoWard)return tokyoWard[1];
    for(const re of [/箱根町/,/鎌倉市/,/藤沢市/,/逗子市/,/三浦市/,/横須賀市/,/鴨川市/,/木更津市/,/浦安市/,/伊東市/,/東伊豆町/,/八王子市/,/町田市/,/立川市/,/飯能市/,/柏市/,/千葉市[^\s]{0,6}区/]){const m=text.match(re);if(m)return m[0];}
    return city||s.prefecture||'';
  }
  function planZone(s){
    if(s?.plan_profile?.zone)return String(s.plan_profile.zone);
    const text=`${s?.city||''} ${s?.address||''}`;
    if(/港区台場|江東区青海/.test(text))return'odaiba';
    if(/江東区豊洲/.test(text))return'toyosu';
    if(/品川区東品川2/.test(text))return'tennoz';
    if(/港区赤坂9|港区六本木|港区麻布台/.test(text))return'roppongi';
    if(/港区南青山|港区北青山/.test(text))return'aoyama';
    if(/世田谷区玉川[12]/.test(text))return'futakotamagawa';
    if(/世田谷区駒沢公園/.test(text))return'komazawa';
    if(/江東区(?:三好|清澄|平野)/.test(text))return'kiyosumi';
    if(/立川市緑町/.test(text))return'tachikawa';
    if(/新宿区(?:歌舞伎町|新宿3|内藤町)/.test(text))return'shinjuku';
    if(/新宿区神楽坂/.test(text))return'kagurazaka';
    if(/渋谷区(?:神南|宇田川町)/.test(text))return'shibuya';
    if(/豊島区(?:西池袋|東池袋)/.test(text))return'ikebukuro';
    if(/横浜市中区(?:末広町|伊勢佐木町|長者町)/.test(text))return'kannai';
    if(/日野市程久保/.test(text))return'tama_zoo';
    if(/足立区栗原/.test(text))return'nishiarai';
    if(/渋谷区猿楽町/.test(text))return'daikanyama';
    if(/川崎市川崎区殿町/.test(text))return'tonomachi';
    if(/横浜市中区(?:山下町|元町|新港|海岸通|北仲通|桜木町)|横浜市西区みなとみらい/.test(text))return'yokohama_bay';
    if(/横浜市(?:神奈川区金港町|西区(?:高島|南幸|北幸))/.test(text))return'yokohama_station';
    if(/横浜市青葉区大場町/.test(text))return'azamino';
    if(/鎌倉市(?:小町|雪ノ下|御成町)/.test(text))return'kamakura_center';
    if(/鎌倉市七里ガ浜/.test(text))return'shichirigahama';
    if(/藤沢市(?:江の島|片瀬海岸)/.test(text))return'enoshima';
    if(/箱根町宮ノ下/.test(text))return'miyanoshita';
    if(/箱根町(?:強羅|木賀)/.test(text))return'gora';
    if(/箱根町(?:元箱根|芦ノ湖)/.test(text))return'motohakone';
    if(/箱根町二ノ平/.test(text))return'kowakudani';
    if(/千葉市美浜区(?:磯辺|高浜)/.test(text))return'inage';
    if(/木更津市金田東/.test(text))return'kisarazu_outlet';
    return'';
  }
  function samePlanArea(a,b){const za=planZone(a),zb=planZone(b);if(za||zb)return Boolean(za&&zb&&za===zb);return areaKey(a)===areaKey(b);}
  function groupKey(s){return s.recommendation_group||s.spot_id;}
  function categoryKind(s){const p=String(s.category_primary||'').toLowerCase(),x=[s.category_primary,...(s.categories||[])].join('|').toLowerCase();if(s.overnight||/hotel_stay|overnight|ryokan/.test(p))return'stay';if(/creative|workshop|experience|craft|pottery|glass|fragrance|washi|interactive|music/.test(p))return'experience';if(/food|cafe|restaurant|market|dining/.test(p))return'food';if(/relax|spa|onsen|bath/.test(p))return'relax';if(/culture|museum|gallery|library|temple|stage|theater|art|architecture/.test(p))return'culture';if(/theme|zoo|aquarium|pool|play|amusement|water_resort|resort_pool/.test(p))return'activity';if(/park|nature|garden|waterside|beach/.test(p))return'nature';if(/shopping|mall/.test(p))return'shopping';if(/workshop|experience|craft|pottery|glass|fragrance|washi/.test(x))return'experience';if(/museum|gallery|library|temple|stage|theater|culture/.test(x))return'culture';if(/food|cafe|restaurant|market|dining/.test(x))return'food';if(/shopping|mall/.test(x))return'shopping';if(/theme|zoo|aquarium|pool|play|amusement|water_resort|resort_pool/.test(x))return'activity';if(/relax|spa|onsen|bath/.test(x))return'relax';if(/park|nature|garden|waterside|beach/.test(x))return'nature';return'other';}
  function isMealSpot(s){
    const p=String(s?.category_primary||'').toLowerCase(),x=[s?.category_primary,...(s?.categories||[])].join('|').toLowerCase();
    if(/food_museum|fruit_picking|farm_art_food|farm$/.test(p))return false;
    if(/cafe|restaurant|dining|food_market|food_district|bbq|hotel_lounge|food_complex/.test(p))return true;
    const e=s?.experience_seed||{};return Number(e.food_experience||0)>=88&&Number(s?.stay_minutes_seed||999)<=150&&/food|cafe|coffee|restaurant|dining/.test(x);
  }
  function childFocusScore(s,ctx={}){const e=s?.experience_seed||{},fit=Number(s?.audience_fit?.family||70),age=Number(ctx.childAgeMonths||18),ageFit=age<24?Number(e.baby_fit||70):Number(e.toddler_fit||70);return clamp(.34*fit+.24*ageFit+.20*Number(e.hands_on||0)+.14*Number(e.physical_activity||0)+.08*Number(e.animal_contact||0));}
  function adultFocusScore(s){const e=s?.experience_seed||{},v=s?.vibes_seed||{};return clamp(.46*Number(s?.adult_enjoyment_seed||70)+.20*Number(e.parent_rest||60)+.14*Number(e.food_experience||0)+.10*Number(v.scenic||0)+.10*Number(v.culture||0));}
  function familyBalanceScore(primary,s,ctx={}){if(isMealSpot(s))return 88;const pc=childFocusScore(primary,ctx),pa=adultFocusScore(primary),sc=childFocusScore(s,ctx),sa=adultFocusScore(s);if(pc+8<pa)return clamp(.72*sc+.28*sa);if(pa+8<pc)return clamp(.72*sa+.28*sc);return clamp(.5*Math.max(sc,sa)+.5*Math.min(sc,sa));}
  function complementScore(a,b){const ka=categoryKind(a),kb=categoryKind(b);if(ka===kb)return 12;if((ka==='activity'||ka==='culture'||ka==='experience'||ka==='nature')&&isMealSpot(b))return 100;if(isMealSpot(a)&&['culture','experience','nature','shopping','activity'].includes(kb))return 94;if(ka==='activity'&&kb==='relax')return 88;if(ka==='culture'&&['nature','shopping','experience'].includes(kb))return 84;if(ka==='experience'&&['shopping','nature','culture'].includes(kb))return 84;if(ka==='nature'&&['relax','culture','shopping'].includes(kb))return 80;if(ka==='shopping'&&isMealSpot(b))return 96;if(kb==='stay')return 94;return 62;}
  function durationLabel(minutes,type){if(type==='overnight')return'1泊プラン';if(minutes<=120)return'1〜2時間';if(minutes<=240)return'半日くらい';if(minutes<=390)return'たっぷり半日';return'1日プラン';}
  function requestedDurationLabel(minutes){return durationLabel(Number(minutes||180),'day');}
  function minCoverageMinutes(displayMinutes){const m=Number(displayMinutes||180);if(m<=120)return Math.max(45,m*.5);if(m<=240)return m*.62;if(m<=390)return m*.60;return m*.56;}
  function shouldStaySingle(s,displayMinutes){const stay=Number(s.stay_minutes_seed||120);if(s.overnight)return false;if(displayMinutes<=120)return true;if(stay>=Math.max(105,displayMinutes*.62))return true;if(stay>=150&&displayMinutes<=240)return true;return false;}
  function eligible(s,ctx,allowOvernight){if(!s)return false;const c={...ctx,allowOvernight,includeBrowseOnly:false};return typeof hardFilterReason==='function'?!hardFilterReason(s,c):s.recommendation_mode!=='browse_only'&&(allowOvernight||!s.overnight);}
  function companionContext(ctx={}){return {...ctx,selectedVibes:(ctx.selectedVibes||[]).filter(v=>v!=='shopping')};}
  function rankedCompanions(seed,primary,ctx,remaining,used,opts={}){
    if(remaining<45)return[];const primaryKind=categoryKind(primary);
    return (seed.spots||[]).filter(s=>{
      if(s.spot_id===primary.spot_id||used.has(s.spot_id)||groupKey(s)===groupKey(primary)||!samePlanArea(primary,s))return false;
      if(!eligible(s,companionContext(ctx),!!opts.allowOvernight))return false;
      const stay=Number(s.stay_minutes_seed||120);if(stay>Math.max(60,remaining+25)||stay<35)return false;
      if(!opts.allowSameKind&&categoryKind(s)===primaryKind&&!isMealSpot(s))return false;
      if(opts.mealOnly&&!isMealSpot(s))return false;
      if(opts.excludeMeal&&isMealSpot(s))return false;
      if(opts.familyRole&&!isMealSpot(s)){const pc=childFocusScore(primary,ctx),pa=adultFocusScore(primary),sc=childFocusScore(s,ctx),sa=adultFocusScore(s);if(pa>=pc+8&&sc<68)return false;if(pc>=pa+8&&sa<76)return false;}
      return true;
    }).map(s=>{
      const cctx=companionContext(ctx);const sc=typeof baseScores==='function'?baseScores(s,{...cctx,allowOvernight:!!opts.allowOvernight,availableMinutes:remaining}):{overall:70};
      const comp=complementScore(primary,s),family=ctx.audience==='family'?familyBalanceScore(primary,s,ctx):70;
      const sameKindPenalty=categoryKind(primary)===categoryKind(s)?28:0,mealBonus=opts.preferMeal&&isMealSpot(s)?18:0;
      const profileBonus=s.plan_profile?.role==='companion'?8:0,restBonus=opts.mealOnly&&s.plan_profile?.family_recovery?10:0;
      const shortPenalty=Math.max(0,Number(s.stay_minutes_seed||120)-remaining)*.3;
      return{s,score:.46*Number(sc.overall||70)+.28*comp+.26*family+mealBonus+profileBonus+restBonus-sameKindPenalty-shortPenalty};
    }).filter(x=>opts.mealOnly||complementScore(primary,x.s)>=58).sort((a,b)=>b.score-a.score);
  }
  function naturalSingleTitle(s,displayMinutes){if(s.editorial?.title)return s.editorial.title;const k=categoryKind(s),d=requestedDurationLabel(displayMinutes);if(k==='activity')return`${s.name}を主役に、今日は思いきり楽しむ。`;if(k==='culture')return`${s.name}で、気になるものをゆっくり見る。`;if(k==='experience')return`${s.name}で、いつもと違う体験をひとつ。`;if(k==='nature')return`${s.name}で、のんびり過ごす${d==='1〜2時間'?'時間':'半日'}。`;if(k==='relax')return`${s.name}で、予定を詰めない時間を。`;if(k==='food')return`${s.name}を目的地に、おいしい時間を。`;if(k==='shopping')return`${s.name}を、気ままに見て歩く。`;if(k==='stay')return`${s.name}で、今日はそのまま泊まる。`;return`${s.name}を主役に、今日はここへ。`;}
  function firstSentence(text){const t=String(text||'').trim();if(!t)return'';const m=t.match(/^(.+?[。！？])/);return(m?m[1]:t).trim();}
  function naturalSingleLead(s,displayMinutes){if(s.editorial?.lead)return s.editorial.lead;const fact=firstSentence(s.public_copy),d=requestedDurationLabel(displayMinutes),k=categoryKind(s);const tail=d==='1〜2時間'?'短い時間でも、ここを目的地にする過ごし方。':`${d}を使って、予定を詰め込みすぎずここを中心に。`;if(fact)return`${fact}${tail}`;if(k==='experience')return`見るだけで終わらず、体験そのものを楽しむ。${tail}`;if(k==='culture')return`気になったものの前で立ち止まりながら、急がず見て回る。${tail}`;return tail;}
  function comboTitle(a,b,type,displayMinutes,ctx={}){if(type==='overnight')return`${a.name}を楽しんだあと、${b.name}に泊まる。`;const d=requestedDurationLabel(displayMinutes);if(ctx.audience==='family'){if(isMealSpot(b))return`${a.name}を楽しんだら、${b.name}でひと休み。`;return`子どもも大人も楽しめる、${areaKey(a)}の${d}。`;}if(isMealSpot(b)){const ka=categoryKind(a);if(ka==='nature')return`歩いたあとは、${b.name}でひと休み。`;if(ka==='culture')return`じっくり見たあとは、${b.name}へ。`;if(ka==='experience')return`体験のあとは、${b.name}で余韻を。`;return`${a.name}を楽しんで、${b.name}でひと休み。`;}if(isMealSpot(a))return`${a.name}から始める、${areaKey(a)}の${d==='1〜2時間'?'寄り道':'半日'}。`;return`${a.name}を主役に、${areaKey(a)}でもうひとつ寄り道。`;}
  function comboLead(a,b,type,ctx={}){if(type==='overnight')return`昼は${a.name}へ。そのあとは${b.name}へ移って、夜まで急がず過ごす。`;if(ctx.audience==='family'){if(isMealSpot(b))return`まず${a.name}を今日の主役に。遊んだあとは${b.name}で座ってひと休み。`;const pChild=childFocusScore(a,ctx),pAdult=adultFocusScore(a);return pChild>=pAdult?`まずは子どもが夢中になれる${a.name}へ。そのあと${b.name}で、大人も楽しめる時間を。`:`まずは大人も楽しめる${a.name}へ。そのあと${b.name}で、子どもの「やりたい」も叶える。`; }return`まず${a.name}へ。そのあと${b.name}へ。似た場所を重ねず、気分を少し変えながらつなぐプラン。`;}
  function threeStopTitle(spots,ctx,displayMinutes){const [a,b,c]=spots;if(ctx.audience==='family'&&isMealSpot(c)){const ac=childFocusScore(a,ctx),aa=adultFocusScore(a),bc=childFocusScore(b,ctx),ba=adultFocusScore(b);if(aa>=ac+8&&bc>=68)return`大人の「行きたい」も、子どもの「やりたい」も。`;if(ac>=aa+8&&ba>=76)return`子どもの「やりたい」を主役に、大人の寄り道も。`;return`${a.name}を主役に、親子で気分を変えながら。`;}return`${a.name}を主役に、${areaKey(a)}でゆっくり一日。`;}
  function threeStopLead(spots,ctx){const [a,b,c]=spots;if(ctx.audience==='family'&&isMealSpot(c)){const ac=childFocusScore(a,ctx),aa=adultFocusScore(a),bc=childFocusScore(b,ctx),ba=adultFocusScore(b);if(aa>=ac+8&&bc>=68)return`${a.name}で大人も楽しんだら、${b.name}では子どもの「やりたい」を。最後は${c.name}で座って休む。`;if(ac>=aa+8&&ba>=76)return`${a.name}では子どもが夢中に。そのあと${b.name}で大人も楽しみ、最後は${c.name}でひと休み。`;return`${a.name}と${b.name}で親子それぞれの楽しみをつくって、最後は${c.name}で少しペースを落とす。`;}return`${a.name}から始めて、${b.name}へ。最後は${c.name}で少しペースを落とす。`;}
  function coverageMinutes(spots){return spots.reduce((sum,s)=>sum+Number(s?.stay_minutes_seed||0),0)+Math.max(0,spots.length-1)*30;}
  function coverageOk(spots,displayMinutes){if(Number(displayMinutes||180)<=120)return true;return coverageMinutes(spots)>=minCoverageMinutes(displayMinutes);}
  const CURATED_PLANS=[
    {id:'family_umi_no_koen_sea_cafe',aud:['family','partner'],min:180,max:300,vibes:['waterside','nature','relax','food','culture'],spots:['spot_301','spot_302'],labels:['海辺で遊ぶ','文化財のカフェでひと休み'],title:'海で遊んで、歴史ある洋館でコーヒーを。',lead:'海の公園で砂浜や芝生の時間を楽しんだら、同じ公園の文化財スターバックスへ。子どもは外で遊び、大人は海を眺めながらひと息つく。'},
    {id:'family_hayama_art_garden_cafe',aud:['family','partner','solo'],min:300,max:450,vibes:['culture','waterside','scenic','relax','food','nature'],spots:['spot_304','spot_305','spot_082'],labels:['大人も楽しむ','海を見ながらごはん','子どもの時間'],title:'海辺の美術館から、庭園へ。途中で海を見ながらランチ。',lead:'葉山の近代美術館で大人も展示を楽しみ、そのまま館内のレストランでひと休み。最後は近くのしおさい公園で、子どもと外の時間へ。',availability_note:'葉山館は2026年9月11日まで展示替え休館。9月12日以降向けのプランです。'},
    {id:'partner_yokohama_mars_walk_food',aud:['partner','friends'],min:270,max:450,vibes:['extraordinary','culture','stroll','food'],spots:['spot_303','spot_085','spot_259'],labels:['火星へ行く','海辺を歩く','ごはん'],title:'火星から帰ってきたら、横浜の海辺を歩く。',lead:'THE SUNSET OF MARSで火星旅行を体験したあと、MARINE & WALKへ。現実の港に戻って、最後は赤レンガで食事を。'},
    {id:'family_shinjuku_green_play_cafe',aud:['family'],min:420,max:570,vibes:['nature','active','food','relax'],spots:['spot_300','spot_292','spot_297'],labels:['大人も楽しむ','子どもの時間','ひと休み・ごはん'],title:'緑の時間から、子どもの遊びへ。最後は座ってひと休み。',lead:'新宿御苑をゆっくり歩いたら、べるべるパークでは子どもの時間。最後は伊勢丹のカフェで、親も腰を下ろす。'},
    {id:'family_ikebukuro_city_play_cafe',aud:['family'],min:390,max:540,vibes:['shopping','active','food','relax'],spots:['spot_128','spot_294','spot_289'],labels:['大人も楽しむ','子どもの時間','ひと休み・ごはん'],title:'池袋で、大人の寄り道も子どもの遊びも。',lead:'サンシャインシティを見て回ったら、べるべるパークへ。遊び切ったあとはchano-maで座って、帰る前の余白をつくる。'},
    {id:'family_shibuya_green_cafe',aud:['family'],min:180,max:300,vibes:['nature','relax','food'],spots:['spot_171','spot_296'],labels:['小さな発見','ひと休み・ごはん'],title:'植物を眺めたあと、親子でひと息つける場所へ。',lead:'渋谷区ふれあい植物センターを見たら、coしぶやのカフェへ。予定を詰めず、渋谷の中で少しペースを落とす。'},
    {id:'family_shinjuku_belbel_cafe',aud:['family'],min:180,max:300,vibes:['active','creative','food','relax'],spots:['spot_292','spot_297'],labels:['子どもの時間','帰る前にひと休み'],title:'思いきり遊んだら、帰る前にカフェへ。',lead:'べるべるパークで子どもの「遊びたい」を満たして、余裕があれば伊勢丹でひと休み。2〜3時間に、少しだけ余韻を足す。'},
    {id:'family_yokohama_art_play_food',aud:['family'],min:360,max:540,vibes:['culture','creative','food','relax'],spots:['spot_101','spot_007','spot_259'],labels:['大人も楽しむ','子どもの時間','ひと休み・ごはん'],title:'アートも遊びも、最後のひと休みも。',lead:'横浜美術館で大人も楽しんだら、MARK ISでは子どもの時間。最後は赤レンガで、港を眺めながらひと休み。'},
    {id:'family_yokohama_shopping_play_food',aud:['family'],min:420,max:570,vibes:['shopping','food','active','relax'],spots:['spot_107','spot_007','spot_259'],labels:['大人も楽しむ','子どもの時間','ひと休み・ごはん'],title:'買い物だけで終わらない、みなとみらいの一日。',lead:'ワールドポーターズを見て回ったら、子どもは思いきり遊ぶ時間へ。最後は港のそばで座ってごはん。'},
    {id:'family_yokohama_station_shop_kids_food',aud:['family'],min:300,max:450,vibes:['shopping','culture','food'],spots:['spot_087','spot_015','spot_261'],labels:['大人も楽しむ','子どもの時間','ひと休み・ごはん'],title:'横浜駅から、買い物と電車とごはん。',lead:'ベイクォーターを見て歩き、京急ミュージアムでは子どもの「見たい」を。最後は水辺側でゆっくり食事。'},
    {id:'family_odaiba_science_lego_food',aud:['family'],min:420,max:570,vibes:['culture','creative','active','food'],spots:['spot_286','spot_285','spot_267'],labels:['大人も楽しむ','子どもの時間','ひと休み・ごはん'],title:'未来をのぞいて、レゴで遊んで、最後は甘いもの。',lead:'日本科学未来館で親子の「なぜ？」を楽しみ、次はレゴの世界へ。遊び切ったら、お台場で座ってひと休み。'},
    {id:'family_odaiba_sea_kids_food',aud:['family'],min:330,max:480,vibes:['nature','waterside','active','food','relax'],spots:['spot_149','spot_285','spot_267'],labels:['大人も楽しむ','子どもの時間','ひと休み・ごはん'],title:'海を眺めて、子どもは思いきり遊ぶ。',lead:'まずはお台場の海辺で気分転換。レゴで子どもの時間をつくったら、最後はカフェでゆっくり。'},
    {id:'family_tachikawa_green_play_food',aud:['family'],min:420,max:570,vibes:['nature','shopping','active','food','relax'],spots:['spot_114','spot_028','spot_264'],labels:['大人も楽しむ','子どもの時間','ひと休み・ごはん'],title:'緑の街を歩いて、遊んで、ちゃんと食べる。',lead:'GREEN SPRINGSで大人も気分転換。PLAY! PARKで子どもが遊び切ったら、最後は親子で落ち着いてごはん。'},
    {id:'family_futako_play_food',aud:['family'],min:240,max:360,vibes:['creative','active','food','relax'],spots:['spot_130','spot_262'],labels:['子どもの時間','ひと休み・ごはん'],title:'遊びに夢中になったら、そのままゆっくりごはん。',lead:'ERIC CARLEの世界でたっぷり遊んで、帰る前に100本のスプーンへ。親も座って休める半日に。'},
    {id:'family_toyosu_shop_kids_food',aud:['family'],min:420,max:600,vibes:['shopping','food','relax'],spots:['spot_135','spot_027','spot_265'],labels:['大人も楽しむ','子どもの時間','ひと休み・ごはん'],title:'買い物も、不思議な世界も、親子でひとつの一日に。',lead:'ららぽーと豊洲を見て回ったら、teamLabで景色を変える。最後は子連れでも入りやすいごはんへ。'},
    {id:'family_enoshima_aqua_garden_cafe',aud:['family'],min:360,max:510,vibes:['animals','nature','scenic','food','waterside'],spots:['spot_051','spot_105','spot_277'],labels:['子どもの時間','大人も楽しむ','ひと休み・ごはん'],title:'水族館のあと、江の島の上まで。',lead:'新江ノ島水族館では子どもが夢中に。そのあと島の景色を楽しみ、最後は高台のカフェでひと休み。'},
    {id:'family_inage_park_food',aud:['family'],min:300,max:480,vibes:['nature','waterside','active','food','relax'],spots:['spot_076','spot_283'],labels:['子どもの時間','ひと休み・ごはん'],title:'海辺で遊んだら、景色のいいテーブルへ。',lead:'稲毛海浜公園で外の時間を楽しんで、そのまま海を眺められるレストランへ。移動を増やさない休日。'},
    {id:'partner_yokohama_art_walk_food',aud:['partner'],min:360,max:510,vibes:['culture','stroll','food','scenic'],spots:['spot_101','spot_085','spot_259'],labels:['じっくり見る','海辺を歩く','ごはん'],title:'アートを見たあと、港の方へ歩いていく。',lead:'横浜美術館から海辺へ。MARINE & WALKをのぞきながら歩いて、最後は赤レンガで食事を。'},
    {id:'partner_roppongi_art_design',aud:['partner','solo'],min:240,max:390,vibes:['culture','stroll','relax'],spots:['spot_152','spot_153'],labels:['じっくり見る','もうひとつ'],title:'大きな展示のあと、小さなデザインへ。',lead:'国立新美術館でじっくり見たら、21_21 DESIGN SIGHTへ。近い距離で、視点だけを少し変える。'},
    {id:'partner_tennoz_library_dinner',aud:['partner','solo'],min:180,max:330,vibes:['culture','food','waterside','relax'],spots:['spot_169','spot_268'],labels:['静かな時間','ごはん'],title:'本のあるラウンジから、水辺のテーブルへ。',lead:'天王洲で静かな時間を過ごしたあと、そのまま運河沿いで食事へ。移動より、余韻を長くする半日。'},
    {id:'partner_daikanyama_books_food',aud:['partner','solo'],min:210,max:360,vibes:['culture','shopping','food','stroll'],spots:['spot_091','spot_273'],labels:['本と買い物','ごはん'],title:'本を眺めて、緑のテラスで話す。',lead:'代官山 T-SITEを気ままに見て回り、最後はIVY PLACEへ。予定を詰めず、会話の時間を長めに。'},
    {id:'partner_kiyosumi_garden_craft_food',aud:['partner','solo'],min:270,max:420,vibes:['nature','creative','culture','food'],spots:['spot_118','spot_253','spot_263'],labels:['庭を歩く','ものづくり','ひと休み・ごはん'],title:'庭園の静けさから、手仕事の町へ。',lead:'清澄庭園を歩き、江戸切子の工房へ。最後は近くで座って、今日見たものをゆっくり振り返る。'},
    {id:'partner_toyosu_art_food',aud:['partner','friends'],min:300,max:450,vibes:['extraordinary','culture','food','waterside'],spots:['spot_027','spot_127'],labels:['今日の主役','ごはん・寄り道'],title:'境界のないアートから、豊洲の食へ。',lead:'teamLab Planetsで非日常に入り込んだあと、千客万来へ。体験と食事を近いエリアでつなぐ。'},
    {id:'friends_yokohama_art_food',aud:['friends'],min:360,max:510,vibes:['creative','shopping','food','stroll'],spots:['spot_246','spot_085','spot_260'],labels:['一緒に体験','寄り道','ごはん'],title:'描いて、歩いて、パイを囲む。',lead:'Artbarで一緒に手を動かしたら、海辺をぶらぶら。最後はPie Holicで、今日の話をしながらごはん。'},
    {id:'friends_odaiba_play_sea_food',aud:['friends'],min:390,max:540,vibes:['active','extraordinary','waterside','food'],spots:['spot_148','spot_149','spot_266'],labels:['思いきり遊ぶ','海辺でひと息','ごはん'],title:'遊び切ったあと、夕方は海の方へ。',lead:'東京ジョイポリスで盛り上がって、お台場海浜公園へ。最後は海を眺めながらごはんまで。'},
    {id:'friends_kisarazu_shop_food',aud:['friends','family'],min:300,max:450,vibes:['shopping','food','stroll'],spots:['spot_160','spot_284'],labels:['買い物','ひと休み・ごはん'],title:'今日は買い物を主役に、途中でちゃんと休む。',lead:'木更津のアウトレットを気ままに見て回り、途中でMr.FARMERへ。買い物だけで疲れ切らない一日に。'}
  ];
  function curatedPlanPreview(seed,id){
    const bp=CURATED_PLANS.find(p=>p.id===id);if(!bp)return null;const map=spotMap(seed),spots=bp.spots.map(x=>map.get(x)).filter(Boolean);if(spots.length!==bp.spots.length)return null;
    const minutes=Math.round((Number(bp.min||180)+Number(bp.max||240))/2),audience=bp.aud?.[0]||'family';
    return{plan_id:`curated_${bp.id}`,slot:'editorial',slot_label:'KIBUN EDIT',score:94,travel_minutes:null,why:[],primary_spot_id:spots[0].spot_id,requested_minutes:minutes,type:'combo',duration_label:requestedDurationLabel(minutes),estimated_minutes:coverageMinutes(spots),title:bp.title,lead:bp.lead,spot_ids:spots.map(s=>s.spot_id),steps:spots.map((s,i)=>({spot_id:s.spot_id,role:i===0?'MAIN':isMealSpot(s)?'FOOD':'PLUS',label:bp.labels[i]||'もうひとつ'})),curated:true,curated_id:bp.id,audience,availability_note:bp.availability_note||null};
  }
  function curatedPlanForPrimary(seed,primary,r,ctx,displayMinutes,used,allPrimaryIds){
    const map=spotMap(seed),selected=ctx.selectedVibes||[],aud=ctx.audience||'family';
    const choices=CURATED_PLANS.filter(p=>p.spots[0]===primary.spot_id&&p.aud.includes(aud)&&displayMinutes>=p.min&&displayMinutes<=p.max&&(!selected.length||p.vibes.some(v=>selected.includes(v))));
    for(const bp of choices){
      const spots=bp.spots.map(id=>map.get(id));if(spots.some(x=>!x))continue;
      if(spots.some((s,i)=>i>0&&(used.has(s.spot_id)||(allPrimaryIds.has(s.spot_id)&&s.spot_id!==primary.spot_id))))continue;
      if(spots.some((s,i)=>!eligible(s,i===0?ctx:companionContext(ctx),false)))continue;
      const total=coverageMinutes(spots);if(total>displayMinutes+90||total<minCoverageMinutes(displayMinutes))continue;
      for(const s of spots.slice(1))used.add(s.spot_id);
      return{plan_id:`plan_${r.slot||primary.spot_id}_${bp.id}`,slot:r.slot,slot_label:r.slot_label,score:Number(r.scores?.overall||70),travel_minutes:r.travel_minutes??null,why:r.why||[],primary_spot_id:primary.spot_id,requested_minutes:displayMinutes,type:'combo',duration_label:requestedDurationLabel(displayMinutes),estimated_minutes:total,title:bp.title,lead:bp.lead,spot_ids:spots.map(s=>s.spot_id),steps:spots.map((s,i)=>({spot_id:s.spot_id,role:i===0?'MAIN':isMealSpot(s)?'FOOD':'PLUS',label:bp.labels[i]||'もうひとつ'})),curated:true,curated_id:bp.id,availability_note:bp.availability_note||null};
    }
    return null;
  }
  function buildOne(seed,r,ctx,used,allPrimaryIds,opts){
    const map=spotMap(seed),primary=map.get(r.spot_id);if(!primary)return null;
    const displayMinutes=Number(opts.displayMinutes||ctx.availableMinutes||180),requestedLabel=requestedDurationLabel(displayMinutes),overnightEligible=!!ctx.allowOvernight&&displayMinutes>=480;
    const base={plan_id:`plan_${r.slot||primary.spot_id}`,slot:r.slot,slot_label:r.slot_label,score:Number(r.scores?.overall||70),travel_minutes:r.travel_minutes??null,why:r.why||[],primary_spot_id:primary.spot_id,requested_minutes:displayMinutes};
    if(primary.overnight&&!overnightEligible)return null;
    if(primary.overnight){const dayCandidates=rankedCompanions(seed,primary,{...ctx,allowOvernight:false},300,new Set([...used,...allPrimaryIds]),{allowOvernight:false,allowSameKind:false});const day=dayCandidates[0]?.s;if(day){used.add(day.spot_id);return{...base,type:'overnight',duration_label:'1泊プラン',estimated_minutes:null,title:comboTitle(day,primary,'overnight',displayMinutes,ctx),lead:comboLead(day,primary,'overnight',ctx),spot_ids:[day.spot_id,primary.spot_id],steps:[{spot_id:day.spot_id,role:'DAY',label:'昼の主役'},{spot_id:primary.spot_id,role:'STAY',label:'泊まる'}]};}return{...base,type:'overnight',duration_label:'1泊プラン',estimated_minutes:null,title:naturalSingleTitle(primary,displayMinutes),lead:naturalSingleLead(primary,displayMinutes),spot_ids:[primary.spot_id],steps:[{spot_id:primary.spot_id,role:'STAY',label:'泊まる'}]};}
    const curated=curatedPlanForPrimary(seed,primary,r,ctx,displayMinutes,used,allPrimaryIds);if(curated)return curated;
    if(shouldStaySingle(primary,displayMinutes)){const mins=coverageMinutes([primary]);return{...base,type:'single',duration_label:requestedLabel,estimated_minutes:mins,title:naturalSingleTitle(primary,displayMinutes),lead:naturalSingleLead(primary,displayMinutes),spot_ids:[primary.spot_id],steps:[{spot_id:primary.spot_id,role:'MAIN',label:'今日の主役'}]};}
    const remain=Math.max(0,displayMinutes-Number(primary.stay_minutes_seed||120)-30),blocked=new Set([...used,...allPrimaryIds]);
    const familyLong=ctx.audience==='family'&&displayMinutes>=360;
    let companions=rankedCompanions(seed,primary,{...ctx,allowOvernight:false},remain,blocked,{allowOvernight:false,allowSameKind:false,preferMeal:ctx.audience==='family'&&!familyLong,excludeMeal:familyLong,familyRole:ctx.audience==='family'});
    let companion=companions.map(x=>x.s).find(s=>coverageOk([primary,s],displayMinutes))||null;
    if(!companion&&familyLong){companions=rankedCompanions(seed,primary,{...ctx,allowOvernight:false},remain,blocked,{allowOvernight:false,allowSameKind:false,preferMeal:true,familyRole:true});companion=companions.map(x=>x.s).find(s=>coverageOk([primary,s],displayMinutes))||null;}
    if(!companion&&overnightEligible){const hotels=rankedCompanions(seed,primary,{...ctx,allowOvernight:true},720,blocked,{allowOvernight:true,allowSameKind:false}).filter(x=>x.s.overnight);companion=hotels[0]?.s||null;if(companion){used.add(companion.spot_id);return{...base,type:'overnight',duration_label:'1泊プラン',estimated_minutes:null,title:comboTitle(primary,companion,'overnight',displayMinutes,ctx),lead:comboLead(primary,companion,'overnight',ctx),spot_ids:[primary.spot_id,companion.spot_id],steps:[{spot_id:primary.spot_id,role:'DAY',label:'昼の主役'},{spot_id:companion.spot_id,role:'STAY',label:'泊まる'}]};}}
    if(companion){
      const spots=[primary,companion];
      const primaryChild=childFocusScore(primary,ctx),primaryAdult=adultFocusScore(primary),compChild=childFocusScore(companion,ctx),compAdult=adultFocusScore(companion);
      let mainLabel='今日の主役';if(ctx.audience==='family'&&familyLong){if(primaryAdult>=primaryChild+8)mainLabel='大人も楽しむ';else if(primaryChild>=primaryAdult+8)mainLabel='子どもの時間';}
      const steps=[{spot_id:primary.spot_id,role:'MAIN',label:mainLabel}];
      let secondLabel='もうひとつ';if(ctx.audience==='family'){if(isMealSpot(companion))secondLabel='ひと休み';else if(primaryChild>=primaryAdult&&compAdult>compChild)secondLabel='大人も楽しむ';else if(primaryAdult>primaryChild&&compChild>=68)secondLabel='子どもの時間';}
      steps.push({spot_id:companion.spot_id,role:'PLUS',label:secondLabel});
      if(ctx.audience==='family'&&displayMinutes>=360&&!isMealSpot(primary)&&!isMealSpot(companion)){
        const remain3=Math.max(45,displayMinutes-coverageMinutes(spots)),used3=new Set([...blocked,companion.spot_id]);
        const meals=rankedCompanions(seed,primary,{...ctx,allowOvernight:false},Math.min(120,remain3),used3,{allowOvernight:false,allowSameKind:false,mealOnly:true});
        const meal=meals.map(x=>x.s).find(s=>coverageMinutes([...spots,s])<=displayMinutes+60);
        if(meal){spots.push(meal);used.add(meal.spot_id);steps.push({spot_id:meal.spot_id,role:'FOOD',label:'ひと休み・ごはん'});}
      }
      used.add(companion.spot_id);const total=coverageMinutes(spots);
      return{...base,type:'combo',duration_label:requestedLabel,estimated_minutes:total,title:spots.length===3?threeStopTitle(spots,ctx,displayMinutes):comboTitle(primary,companion,'combo',displayMinutes,ctx),lead:spots.length===3?threeStopLead(spots,ctx):comboLead(primary,companion,'combo',ctx),spot_ids:spots.map(s=>s.spot_id),steps};
    }
    if(displayMinutes<=120){const mins=coverageMinutes([primary]);return{...base,type:'single',duration_label:requestedLabel,estimated_minutes:mins,title:naturalSingleTitle(primary,displayMinutes),lead:naturalSingleLead(primary,displayMinutes),spot_ids:[primary.spot_id],steps:[{spot_id:primary.spot_id,role:'MAIN',label:'今日の主役'}]};}
    return null;
  }
  function shortPlanAfterSuggestion(seed,plan,ctx,displayMinutes,usedAfter){
    const minutes=Number(displayMinutes||180);if(minutes<=120||minutes>240||plan.type==='overnight')return null;
    const map=spotMap(seed),core=(plan.spot_ids||[]).map(id=>map.get(id)).filter(Boolean);if(!core.length||core.some(isMealSpot))return null;
    const anchor=core[core.length-1],blocked=new Set([...(plan.spot_ids||[]),...usedAfter]);
    const picks=rankedCompanions(seed,anchor,{...ctx,allowOvernight:false},120,blocked,{allowOvernight:false,allowSameKind:false,mealOnly:true});
    const meal=picks[0]?.s;if(!meal)return null;
    usedAfter.add(meal.spot_id);
    const lead=ctx.audience==='family'?'遊んだあとに、親も子どもも座ってひと息。予定に余裕があれば寄れる、近くのごはん・カフェ候補です。':ctx.audience==='partner'?'帰る前にもう少し話したい日に。予定に余裕があれば寄れる、近くのカフェ・レストランです。':ctx.audience==='solo'?'まだ少し時間がある日に。ひとりでも寄りやすい、近くのカフェ・レストラン候補です。':'楽しかった余韻をもう少し。予定に余裕があれば寄れる、近くのカフェ・レストランです。';
    return{spot_id:meal.spot_id,label:'帰る前に、もう少し',title:meal.name,lead};
  }
  function attachShortPlanAfterSuggestions(seed,plans,ctx,displayMinutes){const usedAfter=new Set();return(plans||[]).map(plan=>{const after=shortPlanAfterSuggestion(seed,plan,ctx,displayMinutes,usedAfter);return after?{...plan,after_suggestion:after}:plan;});}
  function fallbackCandidates(seed,ctx,displayMinutes,blockedIds,blockedGroups){return(seed.spots||[]).filter(s=>!blockedIds.has(s.spot_id)&&!blockedGroups.has(groupKey(s))&&eligible(s,{...ctx,availableMinutes:displayMinutes},!!ctx.allowOvernight)).map(s=>{const scores=typeof baseScores==='function'?baseScores(s,{...ctx,availableMinutes:displayMinutes}):{overall:70};return{spot_id:s.spot_id,name:s.name,scores,travel_minutes:ctx.travelMinutesBySpot?.[s.spot_id]??null,why:[]};}).sort((a,b)=>Number(b.scores?.overall||0)-Number(a.scores?.overall||0));}
  function buildPlans(seed,recommendationResult,ctx={},opts={}){const recs=recommendationResult?.recommendations||[],displayMinutes=Number(opts.displayMinutes||ctx.availableMinutes||180),usedCompanions=new Set(),usedPrimaryIds=new Set(),usedGroups=new Set(),originalPrimaryIds=new Set(recs.map(r=>r.spot_id)),plans=[];for(const r of recs){let p=buildOne(seed,r,ctx,usedCompanions,originalPrimaryIds,opts);let chosenId=r.spot_id;if(!p){const slot=r.slot,slot_label=r.slot_label;const candidates=fallbackCandidates(seed,ctx,displayMinutes,new Set([...usedPrimaryIds,...usedCompanions,...originalPrimaryIds]),usedGroups);for(const c of candidates){const trial={...c,slot,slot_label};p=buildOne(seed,trial,ctx,usedCompanions,new Set([...originalPrimaryIds,...usedPrimaryIds]),opts);if(p){chosenId=c.spot_id;break;}}}
      if(p){plans.push(p);usedPrimaryIds.add(chosenId);const primary=spotMap(seed).get(chosenId);if(primary)usedGroups.add(groupKey(primary));}
    }return attachShortPlanAfterSuggestions(seed,plans,ctx,displayMinutes);}
  return{buildPlans,areaKey,planZone,samePlanArea,categoryKind,isMealSpot,childFocusScore,adultFocusScore,familyBalanceScore,complementScore,durationLabel,requestedDurationLabel,minCoverageMinutes,shouldStaySingle,coverageMinutes,coverageOk,curatedPlanForPrimary,shortPlanAfterSuggestion,attachShortPlanAfterSuggestions,CURATED_PLANS,curatedPlanPreview};
});
