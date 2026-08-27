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
  const PLACE_OVERRIDE_KEY='kibun-hero-place-overrides-v16';

  function strategy(spot){ return spot?.media_strategy?.google_places || {}; }
  function localOverrides(){
    if(!auditMode)return {};
    try{return JSON.parse(localStorage.getItem(OVERRIDE_KEY)||'{}')||{};}catch(_e){return {};}
  }
  function runtimeOverrideIndex(spot){
    const v=localOverrides()[spot?.spot_id];
    return Number.isInteger(v)?v:null;
  }
  function localPlaceOverrides(){
    if(!auditMode)return {};
    try{return JSON.parse(localStorage.getItem(PLACE_OVERRIDE_KEY)||'{}')||{};}catch(_e){return {};}
  }
  function runtimePlaceOverride(spot){return localPlaceOverrides()[spot?.spot_id]||null;}
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
        const gp=strategy(spot),po=runtimePlaceOverride(spot),u=new URL(cfg.placePhotoApiUrl);
        u.searchParams.set('name',po?.query||gp.query||spot.name);
        u.searchParams.set('address',po?.use_address===false?'':(spot.address||''));
        if(po?.place_id||gp.place_id) u.searchParams.set('placeId',po?.place_id||gp.place_id);
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

  async function resolvePlacePhotoCandidates(spot,limit=6,opts={}){
    if(!cfg.placePhotosApiUrl)return null;
    const gp=strategy(spot),po=runtimePlaceOverride(spot);
    const query=String(opts.query??po?.query??gp.query??spot.name).trim();
    const placeId=String(opts.placeId??po?.place_id??gp.place_id??'').trim();
    const useAddress=opts.useAddress??po?.use_address??true;
    const allowLowMatch=opts.allowLowMatch===true;
    const key=`${spot.spot_id}:${limit}:${query}:${placeId}:${useAddress?'addr':'noaddr'}:${allowLowMatch?'lowok':'strict'}`;
    if(candidateInflight.has(key))return candidateInflight.get(key);
    const p=(async()=>{
      try{
        const u=new URL(cfg.placePhotosApiUrl);
        u.searchParams.set('name',query||spot.name);
        u.searchParams.set('address',useAddress?(spot.address||''):'');
        u.searchParams.set('limit',String(limit));
        if(placeId)u.searchParams.set('placeId',placeId);
        if(allowLowMatch)u.searchParams.set('allowLowMatch','1');
        const r=await fetch(u.toString(),{cache:'no-store'});
        let data=null;try{data=await r.json();}catch(_e){}
        if(!r.ok)return {candidates:[],reason:'api_error',status:r.status,error:data?.error||`HTTP ${r.status}`};
        return data||{candidates:[],reason:'empty_response'};
      }catch(e){console.warn('Places photo candidates unavailable',spot?.name,e);return {candidates:[],reason:'network_error',error:String(e?.message||e)};}
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
  function setAuditPlaceOverride(spotId,value){
    if(!auditMode)return;const o=localPlaceOverrides();
    if(value?.place_id)o[spotId]={query:String(value.query||''),place_id:String(value.place_id),matched_name:String(value.matched_name||''),matched_address:String(value.matched_address||''),use_address:value.use_address!==false};else delete o[spotId];
    localStorage.setItem(PLACE_OVERRIDE_KEY,JSON.stringify(o));clearSpotCache(spotId);clearCandidateCache(spotId);
  }
  function getAuditPlaceOverrides(){return localPlaceOverrides();}
  function clearCandidateCache(spotId){for(const k of [...candidateInflight.keys()])if(k.startsWith(`${spotId}:`))candidateInflight.delete(k);}
  function clearSpotCache(spotId){for(const k of [...inflight.keys()])if(k.startsWith(`${spotId}:`))inflight.delete(k);}

  global.KibunMedia={resolvePlacePhoto,resolvePlacePhotoCandidates,shouldUsePlacePhoto,setAuditOverride,getAuditOverrides,setAuditPlaceOverride,getAuditPlaceOverrides,clearSpotCache,clearCandidateCache,auditMode,overrideStorageKey:OVERRIDE_KEY,placeOverrideStorageKey:PLACE_OVERRIDE_KEY};
})(window);
