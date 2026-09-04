(function(){
  const HERO_SPOTS = {"spot_050":{"name":"箱根 彫刻の森美術館","address":"神奈川県足柄下郡箱根町二ノ平1121","query":"箱根 彫刻の森美術館","placeId":"","photoIndex":null,"useAddress":true},"spot_101":{"name":"横浜美術館","address":"神奈川県横浜市西区みなとみらい3-4-1","query":"横浜美術館","placeId":"","photoIndex":3,"useAddress":true},"spot_171":{"name":"渋谷区ふれあい植物センター","address":"東京都渋谷区東2-25-37","query":"渋谷区ふれあい植物センター","placeId":"ChIJnRJnNUOLGGARI8rzGiPxTb0","photoIndex":null,"useAddress":true},"spot_253":{"name":"椎名切子 SHOP & FACTORY（GLASS-LAB）","address":"東京都江東区平野1-13-11","query":"GLASS-LAB 清澄白河","placeId":"ChIJFeML4xaJGGAR9qblCXuLpCc","photoIndex":2,"useAddress":false},"spot_286":{"name":"日本科学未来館","address":"東京都江東区青海2-3-6","query":"日本科学未来館","placeId":"","photoIndex":null,"useAddress":true},"spot_287":{"name":"chano-ma 横浜","address":"神奈川県横浜市中区新港1-1-2 横浜赤レンガ倉庫2号館3F","query":"chano-ma 横浜","placeId":"","photoIndex":0,"useAddress":true},"spot_292":{"name":"べるべるパーク新宿本店","address":"東京都新宿区歌舞伎町1-3-16 パセラリゾーツ新宿本店1F","query":"べるべるパーク新宿本店","placeId":"","photoIndex":5,"useAddress":true},"spot_300":{"name":"新宿御苑","address":"東京都新宿区内藤町11","query":"新宿御苑","placeId":"","photoIndex":2,"useAddress":true},"spot_307":{"name":"ロビーラウンジ／ウェスティンホテル横浜","address":"神奈川県横浜市西区みなとみらい4-2-8","query":"ウェスティンホテル横浜 ロビーラウンジ","placeId":"","photoIndex":0,"useAddress":true},"spot_318":{"name":"日本文化体験 庵an東京","address":"東京都千代田区鍛冶町2-2-9 第2登栄ビル3階","query":"日本文化体験 庵an東京","placeId":"","photoIndex":null,"useAddress":true},"spot_432":{"name":"ETOWA KASAMA","address":"茨城県笠間市上郷2775-7","query":"ETOWA KASAMA","placeId":"ChIJtzzkDZcbImARNIlZ4rMwRq0","photoIndex":0,"useAddress":false},"spot_436":{"name":"日本民藝館","address":"東京都目黒区駒場4-3-33","query":"日本民藝館","placeId":"","photoIndex":1,"useAddress":true},"spot_446":{"name":"MoN Takanawa: The Museum of Narratives","address":"東京都港区三田3-16-1（TAKANAWA GATEWAY CITY内）","query":"MoN Takanawa","placeId":"","photoIndex":7,"useAddress":true},"spot_449":{"name":"海の見えるビアガーデン「はまビア！」","address":"神奈川県横浜市西区みなとみらい1-1-1","query":"ヨコハマ グランド インターコンチネンタル はまビア","placeId":"","photoIndex":null,"useAddress":true},"spot_450":{"name":"サンシャイン水族館","address":"東京都豊島区東池袋3-1 サンシャインシティ ワールドインポートマートビル屋上","query":"サンシャイン水族館","placeId":"","photoIndex":null,"useAddress":true},"spot_452":{"name":"THERMAL SPA S.WAVE／大磯プリンスホテル","address":"神奈川県中郡大磯町国府本郷546","query":"大磯プリンスホテル THERMAL SPA S.WAVE","placeId":"","photoIndex":null,"useAddress":true},"spot_454":{"name":"24/7 restaurant","address":"神奈川県横浜市西区みなとみらい2-3-8 みなとみらい東急スクエア③ 3F","query":"24/7 restaurant みなとみらい","placeId":"","photoIndex":null,"useAddress":true},"spot_458":{"name":"津久井浜観光農園","address":"神奈川県横須賀市津久井5-15-20","query":"津久井浜観光農園","placeId":"","photoIndex":null,"useAddress":true}};
  window.KIBUN_HERO_SPOTS = HERO_SPOTS;
  const cfg=window.KIBUN_CONFIG||{};
  const endpoint=cfg.placePhotoApiUrl;
  if(!endpoint)return;
  const imgs=[...document.querySelectorAll('img[data-hero-spot]')];
  const load=async(img)=>{
    const m=HERO_SPOTS[img.dataset.heroSpot]; if(!m)return;
    try{
      const u=new URL(endpoint);
      u.searchParams.set('name',m.query||m.name);
      u.searchParams.set('address',m.useAddress===false?'':(m.address||''));
      if(m.placeId)u.searchParams.set('placeId',m.placeId);
      if(Number.isInteger(m.photoIndex))u.searchParams.set('photoIndex',String(m.photoIndex));
      const r=await fetch(u.toString(),{cache:'no-store'}); if(!r.ok)return;
      const d=await r.json(); if(!d||!d.photoUri||d.matchConfidence==='low')return;
      const pre=new Image(); pre.onload=()=>{img.src=d.photoUri;img.dataset.heroResolved='1';}; pre.src=d.photoUri;
    }catch(_e){}
  };
  imgs.forEach(load);
})();
