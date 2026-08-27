(function(global){
  const cfg = global.KIBUN_CONFIG || {};
  const municipalityCache = new Map();
  const pointCache = new Map();
  const fw = s => String(s||'').replace(/[０-９]/g,ch=>String.fromCharCode(ch.charCodeAt(0)-0xFEE0));
  const kanjiNums = {'一':'1','二':'2','三':'3','四':'4','五':'5','六':'6','七':'7','八':'8','九':'9','十':'10'};
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
  async function exactTimes(origin, destinations, mode){
    if(!cfg.travelApiUrl) return null;
    try{
      const r=await fetch(cfg.travelApiUrl,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({origin,destinations,mode})});
      if(!r.ok) throw new Error(`routes proxy ${r.status}`); const data=await r.json(); return data.times||null;
    }catch(e){ console.warn('Routes proxy unavailable; using estimate',e); return null; }
  }
  async function getTimes(spots,origin,mode){
    const resolved=(await Promise.all(spots.map(async s=>({spot:s,point:await spotPoint(s)})))).filter(x=>x.point);
    const destinations=resolved.map(x=>({spot_id:x.spot.spot_id,lat:x.point.lat,lng:x.point.lng}));
    const exact=await exactTimes(origin,destinations,mode);
    if(exact) return {times:exact,provider:'google_routes'};
    const times={};
    for(const x of resolved){const km=haversine(origin,x.point); times[x.spot.spot_id]=estimateMinutes(km,mode);}
    return {times,provider:'estimate_v1'};
  }
  global.KibunTravel={getCurrentPosition,getTimes,spotPoint,haversine,estimateMinutes,classifyGeoError};
})(window);