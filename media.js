(function(global){
  const cfg=global.KIBUN_CONFIG||{};
  const inflight=new Map();

  function strategy(spot){ return spot?.media_strategy?.google_places || {}; }
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
    if(inflight.has(spot.spot_id)) return inflight.get(spot.spot_id);
    const p=(async()=>{
      try{
        const gp=strategy(spot),u=new URL(cfg.placePhotoApiUrl);
        u.searchParams.set('name',gp.query||spot.name);
        u.searchParams.set('address',spot.address||'');
        if(gp.place_id) u.searchParams.set('placeId',gp.place_id);
        if(Number.isInteger(gp.photo_index_override)) u.searchParams.set('photoIndex',String(gp.photo_index_override));
        const r=await fetch(u.toString(),{cache:'no-store'});
        if(!r.ok) return null;
        const data=await r.json();
        if(!data?.photoUri || data.matchConfidence==='low') return null;
        return data;
      }catch(e){ console.warn('Places photo unavailable',spot?.name,e); return null; }
    })().finally(()=>setTimeout(()=>inflight.delete(spot.spot_id),1000));
    inflight.set(spot.spot_id,p); return p;
  }
  global.KibunMedia={resolvePlacePhoto,shouldUsePlacePhoto};
})(window);
