(function(global){
  const cfg=global.KIBUN_CONFIG||{};
  async function resolvePlacePhoto(spot){
    if(!cfg.placePhotoApiUrl) return null;
    try{
      const u=new URL(cfg.placePhotoApiUrl);u.searchParams.set('name',spot.name);u.searchParams.set('address',spot.address);
      const r=await fetch(u.toString());if(!r.ok) return null;return await r.json();
    }catch(e){return null;}
  }
  global.KibunMedia={resolvePlacePhoto};
})(window);