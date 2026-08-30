(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.KibunFeatured=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const clamp=(x,lo=0,hi=100)=>Math.max(lo,Math.min(hi,x));
  function dayDiff(a,b){const x=new Date(a),y=new Date(b);if(Number.isNaN(x.getTime())||Number.isNaN(y.getTime()))return 999;return Math.max(0,Math.floor((y-x)/86400000));}
  function weekKey(date){const d=new Date(date);const start=new Date(d.getFullYear(),0,1);return Math.floor((d-start)/604800000);}
  function stableJitter(id,date){const str=`${id}:${new Date(date).getFullYear()}:${weekKey(date)}`;let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return((h>>>0)%901)/100-4.5;}
  function categoryText(s){return [s?.category_primary,...(s?.categories||[]),...(s?.ui_tags||[])].join('|').toLowerCase();}
  function seasonalFit(s,date=new Date()){
    const month=new Date(date).getMonth()+1,x=categoryText(s);let score=0;
    if(/pool|water_park|waterpark|beach|waterside|splash/.test(x))score+=(month>=6&&month<=9)?16:(month>=11||month<=3?-24:-5);
    if(/onsen|spa|bath|ryokan|hotel_stay|overnight/.test(x))score+=(month>=10||month<=3)?13:2;
    if(/garden|park|nature|forest|flower/.test(x))score+=([3,4,5,10,11].includes(month)?10:0);
    if(/museum|gallery|library|indoor|creative|workshop|theater|stage/.test(x))score+=([6,7,8,12,1,2].includes(month)?7:3);
    if(/cafe|restaurant|food|dining/.test(x))score+=4;
    return score;
  }
  function featureBucket(s){const fit=s?.audience_fit||{},family=Number(fit.family||0),partner=Number(fit.partner||0),solo=Number(fit.solo||0),friends=Number(fit.friends||0);if(family>=96&&family>=partner+5)return'family';if(partner>=96&&partner>=family+5)return'partner';if(solo>=92&&solo>=family+8)return'solo';if(friends>=96&&friends>=family+5)return'friends';return'all';}
  function featureCategory(s){const x=categoryText(s);if(s?.overnight)return'stay';if(/cafe|restaurant|food|dining/.test(x))return'food';if(/museum|gallery|library|culture|art|theater|stage|temple/.test(x))return'culture';if(/creative|workshop|craft|experience/.test(x))return'experience';if(/pool|theme|amusement|aquarium|zoo|play/.test(x))return'activity';if(/park|nature|garden|beach|waterside/.test(x))return'nature';if(/shopping|mall|market|outlet/.test(x))return'shopping';return'other';}
  function featureScore(s,date=new Date()){
    const buzz=s?.buzz||{},base=Number(buzz.score||0);if(base<70)return-999;
    const checked=buzz.checked_at||s?.freshness?.checked_at||null,age=checked?dayDiff(checked,date):120;
    const freshness=clamp(Number(buzz.freshness||70)-Math.max(0,age-45)*.18,0,100);
    const recentBoost=age<=45?7:age<=120?3:age>240?-10:0;
    const editorial=Number(buzz.visual_appeal||70)*.05+Number(buzz.popularity_momentum||70)*.04;
    return base*.68+freshness*.16+editorial+seasonalFit(s,date)+recentBoost+stableJitter(s.spot_id,date);
  }
  function withinFeatureWindow(s,date){const p=s?.feature_profile||{},t=new Date(date).getTime();if(p.feature_from&&t<new Date(p.feature_from).getTime())return false;if(p.feature_until&&t>new Date(p.feature_until).getTime())return false;if(Array.isArray(p.months)&&p.months.length&&!p.months.includes(new Date(date).getMonth()+1))return false;return true;}
  function selectFeaturedSpots(seed,date=new Date(),limit=6){
    const sorted=(seed?.spots||[]).filter(s=>withinFeatureWindow(s,date)&&featureScore(s,date)>0).map(s=>({s,score:featureScore(s,date),bucket:featureBucket(s),cat:featureCategory(s)})).sort((a,b)=>b.score-a.score);
    const chosen=[],bucketCount={},catCount={};
    function canPick(x){if(chosen.some(y=>y.s.spot_id===x.s.spot_id))return false;if(x.bucket==='family'&&(bucketCount.family||0)>=2)return false;if((catCount[x.cat]||0)>=2)return false;return true;}
    function add(x){if(!x||!canPick(x))return false;chosen.push(x);bucketCount[x.bucket]=(bucketCount[x.bucket]||0)+1;catCount[x.cat]=(catCount[x.cat]||0)+1;return true;}
    // First establish breadth: a non-family lens, then food/culture/experience, then fill by score.
    add(sorted.find(x=>x.bucket!=='family'));
    for(const cat of ['culture','food','experience','stay','nature','activity','shopping']){if(chosen.length>=limit)break;add(sorted.find(x=>x.cat===cat&&canPick(x)));}
    for(const x of sorted){if(chosen.length>=limit)break;add(x);}
    return chosen.slice(0,limit).map(x=>x.s);
  }
  return{selectFeaturedSpots,featureScore,featureBucket,featureCategory,seasonalFit,withinFeatureWindow};
});
