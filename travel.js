(function(global){
  const cfg = global.KIBUN_CONFIG || {};
  const municipalityCache = new Map();
  const pointCache = new Map();
  const fw = s => String(s||'').replace(/[０-９]/g,ch=>String.fromCharCode(ch.charCodeAt(0)-0xFEE0));
  const kanjiNums = {'一':'1','二':'2','三':'3','四':'4','五':'5','六':'6','七':'7','八':'8','九':'9','十':'10'};
  const PREFECTURE_CENTERS={
    '東京都':{lat:35.6762,lng:139.6503},'神奈川県':{lat:35.4478,lng:139.6425},'埼玉県':{lat:35.8617,lng:139.6455},'千葉県':{lat:35.6074,lng:140.1065},
    '茨城県':{lat:36.3418,lng:140.4468},'栃木県':{lat:36.5657,lng:139.8836},'群馬県':{lat:36.3911,lng:139.0608},'山梨県':{lat:35.6639,lng:138.5683},'静岡県':{lat:34.9756,lng:138.3828}
  };
  const normalizeVibeScore=v=>Number.isFinite(Number(v))?Number(v):50;
  function normalize(s){
    let x=fw(s).replace(/[\s　・‐－ー−]/g,'').replace(/ヶ/g,'ケ').replace(/ケ谷/g,'ケ谷');
    x=x.replace(/([一二三四五六七八九])丁目/g,(_,n)=>`${kanjiNums[n]}丁目`).replace(/十丁目/g,'10丁目');
    return x;
  }
  function locationError(kind,message,original){
    const e=new Error(message);e.kind=kind;e.original=original||null;return e;
  }
  function classifyGeoError(err){
    if(!err)return locationError('unknown','現在地を取得できませんでした');
    if(err.kind)return err;
    if(err.code===1)return locationError('permission_denied','位置情報の利用が許可されていません',err);
    if(err.code===2)return locationError('position_unavailable','端末で現在地を特定できませんでした',err);
    if(err.code===3)return locationError('timeout','現在地の取得に時間がかかっています',err);
    return locationError('unknown',err.message||'現在地を取得できませんでした',err);
  }
  function getCurrentPosition(){
    return new Promise((resolve,reject)=>{
      if(!window.isSecureContext)return reject(locationError('insecure_context','安全な接続でないため現在地を利用できません'));
      if(!navigator.geolocation)return reject(locationError('unsupported','このブラウザは現在地取得に対応していません'));
      navigator.geolocation.getCurrentPosition(
        p=>resolve({lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy}),
        e=>reject(classifyGeoError(e)),
        {enableHighAccuracy:false,timeout:15000,maximumAge:300000}
      );
    });
  }
  async function municipalityData(spot){
    const pref=spot.prefecture, city=spot.routing?.municipality || spot.city;
    const key=`${pref}/${city}`; if(municipalityCache.has(key)) return municipalityCache.get(key);
    const url=`${cfg.geoloniaApiBase||'https://japanese-addresses-v2.geoloniamaps.com/api/ja'}/${encodeURIComponent(pref)}/${encodeURIComponent(city)}.json`;
    const p=fetch(url).then(r=>{if(!r.ok) throw new Error(`geocode ${r.status}`);return r.json();});
    municipalityCache.set(key,p); return p;
  }
  async function spotPoint(spot){
    if(pointCache.has(spot.spot_id)) return pointCache.get(spot.spot_id);
    const task=(async()=>{
      try{
        const json=await municipalityData(spot); const rows=json.data||[]; const addr=normalize(spot.address);
        let best=null,bestLen=-1;
        for(const r of rows){
          if(!r.point) continue;
          const label=normalize(`${r.oaza_cho||''}${r.chome||''}`);
          if(label && addr.includes(label) && label.length>bestLen){best=r;bestLen=label.length;}
        }
        if(!best){
          const pts=rows.filter(x=>Array.isArray(x.point));
          if(!pts.length) return null;
          const lng=pts.reduce((a,x)=>a+Number(x.point[0]),0)/pts.length, lat=pts.reduce((a,x)=>a+Number(x.point[1]),0)/pts.length;
          return {lat,lng,accuracy:'municipality_approx'};
        }
        return {lat:Number(best.point[1]),lng:Number(best.point[0]),accuracy:'town_approx'};
      }catch(e){ console.warn('Kibun geocode failed',spot.name,e); return null; }
    })();
    pointCache.set(spot.spot_id,task); return task;
  }
  function haversine(a,b){
    const R=6371,rad=x=>x*Math.PI/180,dLat=rad(b.lat-a.lat),dLon=rad(b.lng-a.lng); const la1=rad(a.lat),la2=rad(b.lat);
    const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2; return 2*R*Math.asin(Math.sqrt(h));
  }
  function estimateMinutes(km,mode){
    if(mode==='transit'){
      if(km<3) return Math.max(15,Math.round(11+km*3));
      if(km<15) return Math.round(16+km*2.45);
      if(km<40) return Math.round(24+km*1.85);
      return Math.round(32+km*1.5);
    }
    const road=km*1.28;
    let mins;if(road<5) mins=6+road/22*60; else if(road<18) mins=8+road/31*60; else if(road<45) mins=10+road/41*60; else mins=12+road/52*60;
    return Math.round(mins);
  }
  function selectedVibesFromUi(){
    const raw=[...document.querySelectorAll('[data-vibe].selected,[data-vibe][aria-pressed="true"]')].map(x=>x.dataset.vibe).filter(Boolean);
    const weather=document.getElementById('weatherSelect')?.value||'any',month=new Date().getMonth()+1;
    return [...new Set(raw.map(v=>v==='comfortable'?(weather==='hot'?'cool':weather==='cold'?'relax':weather==='rain'?'culture':month>=6&&month<=9?'cool':month===12||month<=2?'relax':'nature'):v))].slice(0,3);
  }
  function vibeRelevance(spot,selected){
    if(!selected.length)return 70;
    const weights=[1,.7,.7],v=spot.vibes_seed||{};let num=0,den=0;
    selected.forEach((key,i)=>{const w=weights[i]||.7;num+=normalizeVibeScore(v[key])*w;den+=w;});
    return den?num/den:70;
  }
  function regionalPool(spots,origin){
    const all=Array.isArray(global.ODEKAKE_SEED?.spots)?global.ODEKAKE_SEED.spots:spots;
    if(!all?.length)return spots;
    const selected=selectedVibesFromUi();
    const nearestPrefs=Object.entries(PREFECTURE_CENTERS).map(([pref,p])=>[pref,haversine(origin,p)]).sort((a,b)=>a[1]-b[1]).slice(0,3).map(x=>x[0]);
    const rankedRegional=all.filter(s=>nearestPrefs.includes(s.prefecture)).sort((a,b)=>vibeRelevance(b,selected)-vibeRelevance(a,selected));
    const rankedGlobal=[...all].sort((a,b)=>vibeRelevance(b,selected)-vibeRelevance(a,selected));
    const out=[],seen=new Set();
    const add=s=>{if(s?.spot_id&&!seen.has(s.spot_id)){seen.add(s.spot_id);out.push(s);}};
    spots.forEach(add);
    rankedRegional.slice(0,80).forEach(add);
    rankedGlobal.slice(0,120).forEach(add);
    return out.slice(0,120);
  }
  async function exactTimes(origin, destinations, mode){
    if(!cfg.travelApiUrl) return null;
    try{
      const r=await fetch(cfg.travelApiUrl,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({origin,destinations,mode})});
      if(!r.ok) throw new Error(`routes proxy ${r.status}`); const data=await r.json(); return data.times||null;
    }catch(e){ console.warn('Routes proxy unavailable; using estimate',e); return null; }
  }
  async function getTimes(spots,origin,mode){
    const pool=regionalPool(spots,origin);
    const selected=selectedVibesFromUi();
    const resolved=(await Promise.all(pool.map(async s=>({spot:s,point:await spotPoint(s)})))).filter(x=>x.point).map(x=>({...x,estimate:estimateMinutes(haversine(origin,x.point),mode),relevance:vibeRelevance(x.spot,selected)}));
    const nearest=[...resolved].sort((a,b)=>a.estimate-b.estimate||b.relevance-a.relevance).slice(0,25);
    const relevant=[...resolved].sort((a,b)=>b.relevance-a.relevance||a.estimate-b.estimate).slice(0,25);
    const picked=[],seen=new Set();
    for(const x of [...nearest,...relevant]){if(seen.has(x.spot.spot_id))continue;seen.add(x.spot.spot_id);picked.push(x);if(picked.length>=50)break;}
    if(picked.length<50){for(const x of [...resolved].sort((a,b)=>a.estimate-b.estimate)){if(seen.has(x.spot.spot_id))continue;seen.add(x.spot.spot_id);picked.push(x);if(picked.length>=50)break;}}
    const destinations=picked.map(x=>({spot_id:x.spot.spot_id,lat:x.point.lat,lng:x.point.lng}));
    const exact=destinations.length?await exactTimes(origin,destinations,mode):null;
    if(exact&&Object.keys(exact).length) return {times:exact,provider:'google_routes'};
    const times={};
    for(const x of resolved)times[x.spot.spot_id]=x.estimate;
    return {times,provider:'estimate_v1'};
  }

  async function searchLocations(query){
    const q=String(query||'').trim();
    if(!q) return [];
    if(!cfg.locationSearchApiUrl) throw locationError('search_unavailable','場所検索を利用できません');
    const url=new URL(cfg.locationSearchApiUrl,location.href);
    url.searchParams.set('q',q);
    const r=await fetch(url.toString(),{headers:{'accept':'application/json'}});
    if(!r.ok) throw locationError('search_failed',`場所検索に失敗しました (${r.status})`);
    const data=await r.json();
    return Array.isArray(data.candidates)?data.candidates:[];
  }
  global.KibunTravel={getCurrentPosition,getTimes,spotPoint,haversine,estimateMinutes,classifyGeoError,searchLocations};
})(window);
