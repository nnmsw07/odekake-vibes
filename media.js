(function(global){
  const cfg=global.KIBUN_CONFIG||{};
  const inflight=new Map(),candidateInflight=new Map();
  const auditParams=new URLSearchParams(location.search);
  const auditHash=decodeURIComponent(location.hash||'');
  const auditRequested=auditParams.get('heroAudit');
  if(auditRequested==='1'){ try{localStorage.setItem('kibun-hero-audit-enabled','1');}catch(_e){} }
  if(auditRequested==='0'){ try{localStorage.removeItem('kibun-hero-audit-enabled');}catch(_e){} }
  let auditPersisted=false; try{auditPersisted=localStorage.getItem('kibun-hero-audit-enabled')==='1';}catch(_e){}
  const auditMode=auditRequested==='1' || /(?:^|[?&#])heroAudit=1(?:&|$)/.test(auditHash) || auditPersisted;
  const OVERRIDE_KEY='kibun-hero-overrides-v14';

  function strategy(spot){ return spot?.media_strategy?.google_places || {}; }
  function localOverrides(){
    if(!auditMode)return {};
    try{return JSON.parse(localStorage.getItem(OVERRIDE_KEY)||'{}')||{};}catch(_e){return {};}
  }
  function runtimeOverrideIndex(spot){
    const v=localOverrides()[spot?.spot_id];
    return Number.isInteger(v)?v:null;
  }
  function shouldUsePlacePhoto(spot){
    if(!cfg.placePhotoEnabled || !cfg.placePhotoApiUrl || cfg.placePhotoMode==='off') return false;
    const gp=strategy(spot);
    if(gp.status==='disabled') return false;
    if(gp.force===true) return true;
    if(cfg.placePhotoMode==='prefer_places') return spot?.media_strategy?.current_provider!=='official_permission';
    const provider=spot?.media_strategy?.current_provider || (spot?.hero_image?.type==='ai'?'ai':'unknown');
    return provider==='ai' || spot?.hero_image?.exact_spot===false;
  }

  async function resolvePlacePhoto(spot){
    if(!shouldUsePlacePhoto(spot)) return null;
    const localIndex=runtimeOverrideIndex(spot),cacheKey=`${spot.spot_id}:${localIndex??'auto'}`;
    if(inflight.has(cacheKey)) return inflight.get(cacheKey);
    const p=(async()=>{
      try{
        const gp=strategy(spot),u=new URL(cfg.placePhotoApiUrl);
        u.searchParams.set('name',gp.query||spot.name);
        u.searchParams.set('address',spot.address||'');
        if(gp.place_id) u.searchParams.set('placeId',gp.place_id);
        const seedIndex=Number.isInteger(gp.photo_index_override)?gp.photo_index_override:null;
        const chosen=localIndex??seedIndex;
        if(Number.isInteger(chosen)) u.searchParams.set('photoIndex',String(chosen));
        const r=await fetch(u.toString(),{cache:'no-store'});
        if(!r.ok) return null;
        const data=await r.json();
        if(!data?.photoUri || data.matchConfidence==='low') return null;
        return data;
      }catch(e){ console.warn('Places photo unavailable',spot?.name,e); return null; }
    })().finally(()=>setTimeout(()=>inflight.delete(cacheKey),1000));
    inflight.set(cacheKey,p); return p;
  }

  async function resolvePlacePhotoCandidates(spot,limit=6){
    if(!cfg.placePhotosApiUrl)return null;
    const key=`${spot.spot_id}:${limit}`;
    if(candidateInflight.has(key))return candidateInflight.get(key);
    const p=(async()=>{
      try{
        const gp=strategy(spot),u=new URL(cfg.placePhotosApiUrl);
        u.searchParams.set('name',gp.query||spot.name);
        u.searchParams.set('address',spot.address||'');
        u.searchParams.set('limit',String(limit));
        if(gp.place_id)u.searchParams.set('placeId',gp.place_id);
        const r=await fetch(u.toString(),{cache:'no-store'});
        if(!r.ok)return null;
        const data=await r.json();
        if(data.matchConfidence==='low')return null;
        return data;
      }catch(e){console.warn('Places photo candidates unavailable',spot?.name,e);return null;}
    })();
    candidateInflight.set(key,p);return p;
  }
  function setAuditOverride(spotId,index){
    if(!auditMode)return;
    const o=localOverrides();
    if(Number.isInteger(index))o[spotId]=index;else delete o[spotId];
    localStorage.setItem(OVERRIDE_KEY,JSON.stringify(o));
    for(const k of [...inflight.keys()])if(k.startsWith(`${spotId}:`))inflight.delete(k);
  }
  function getAuditOverrides(){return localOverrides();}
  function clearSpotCache(spotId){for(const k of [...inflight.keys()])if(k.startsWith(`${spotId}:`))inflight.delete(k);}

  global.KibunMedia={resolvePlacePhoto,resolvePlacePhotoCandidates,shouldUsePlacePhoto,setAuditOverride,getAuditOverrides,clearSpotCache,auditMode,overrideStorageKey:OVERRIDE_KEY};
})(window);
