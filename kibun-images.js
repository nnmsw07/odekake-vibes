(function(global){
  'use strict';
  if(typeof document==='undefined') return;

  // Curated, recently generated Kibun images. Do not use a generic catch-all image.
  const APPROVED_ASSETS={
    aquarium:'/assets/kibun-images/aquarium.webp',
    family_cafe:'/assets/kibun-images/family_cafe.webp',
    lounge_cafe:'/assets/kibun-images/lounge_cafe.webp',
    kids_play_space:'/assets/kibun-images/kids_play_space.webp',
    onsen:'/assets/kibun-images/onsen.webp',
    seaside_terrace:'/assets/kibun-images/seaside_terrace.webp',
    fruit_picking:'/assets/kibun-images/fruit_picking.webp'
  };

  // Known older shared/abstract fallbacks that should never win over a spot-specific image.
  const LEGACY_SHARED=[
    '/assets/vibes/',
    '/assets/plans/family-cafe.webp',
    '/assets/plans/waterfront-walk.webp',
    '/assets/plans/culture-cafe.webp',
    '/assets/editorial/parents-eat-well.webp',
    '/assets/editorial/baby-first-outing.webp',
    '/assets/editorial/special.webp',
    '/assets/editorial/culture.webp',
    '/assets/editorial/hotel-without-staying.webp',
    '/assets/editorial/terrace-after-sunset.webp',
    '/assets/editorial/green-breathing-room.webp',
    '/assets/editorial/night-starts-after-five.webp'
  ];

  function findSpot(id){
    return (global.ODEKAKE_SEED?.spots||[]).find(s=>String(s.spot_id)===String(id));
  }

  function textOf(spot){
    return [
      spot?.name,spot?.category_primary,spot?.category_secondary,spot?.public_copy,
      spot?.editorial?.title,spot?.editorial?.lead,spot?.editorial?.moment,
      ...(Array.isArray(spot?.tags)?spot.tags:[]),
      ...(Array.isArray(spot?.features)?spot.features:[]),
      ...(Array.isArray(spot?.editorial?.best_for)?spot.editorial.best_for:[])
    ].filter(Boolean).join(' ').toLowerCase();
  }

  const has=(text,words)=>words.some(w=>text.includes(w));

  function explicitKey(spot){
    const key=String(spot?.media_strategy?.kibun_image_key||spot?.kibun_image_key||'').trim();
    return APPROVED_ASSETS[key]?key:'';
  }

  // Conservative inference only. If the match is not obvious, keep the spot's own image / image-less state.
  function strongKey(spot){
    const explicit=explicitKey(spot); if(explicit) return explicit;
    const t=textOf(spot),cat=String(spot?.category_primary||'').toLowerCase();

    if(has(t,['水族館','aquarium','クラゲ','イルカ'])) return 'aquarium';
    if(has(t,['いちご狩り','苺狩り','果物狩り','ぶどう狩り','りんご狩り','みかん狩り','収穫体験','観光農園'])) return 'fruit_picking';
    if(has(t,['日帰り温泉','露天風呂','温浴施設','温泉','サウナ','spa','スパ'])||cat==='relax') return 'onsen';
    if(has(t,['海沿い','海辺','ベイサイド','ウォーターフロント','オーシャンビュー','マリーナ'])||cat==='waterfront') return 'seaside_terrace';
    if(has(t,['屋内遊び場','キッズパーク','プレイグラウンド','室内アスレチック','ボーネルンド','キドキド','play! park','play!park','ue fantasia'])) return 'kids_play_space';

    const cafe=/food|cafe|restaurant|afternoontea/.test(cat)||has(t,['カフェ','cafe','喫茶','レストラン','ラウンジ']);
    if(cafe){
      if(has(t,['キッズスペース','ベビースペース','座敷','小上がり','授乳室','離乳食','子連れ','親子'])) return 'family_cafe';
      if(has(t,['ホテルラウンジ','アフタヌーンティー','大人時間','ラウンジ'])) return 'lounge_cafe';
    }
    return '';
  }

  function displayMode(spot){
    if(global.KibunMedia?.displayMode) return global.KibunMedia.displayMode(spot);
    return String(spot?.media_strategy?.display_mode||'kibun_image');
  }

  function isLegacyShared(src){
    return LEGACY_SHARED.some(part=>src.includes(part));
  }

  function addBadge(node){
    if(!node.querySelector('.image-badge')) node.insertAdjacentHTML('beforeend','<span class="image-badge">イメージ</span>');
  }

  function applyNode(node){
    if(!node?.matches?.('[data-media-spot]')) return;
    const spot=findSpot(node.getAttribute('data-media-spot')); if(!spot) return;
    const mode=displayMode(spot);
    if(mode!=='kibun_image'&&mode!=='detail_google') return;

    const key=strongKey(spot); if(!key) return;
    const src=APPROVED_ASSETS[key]; if(!src) return;
    const existing=node.querySelector('img');
    const current=String(existing?.getAttribute('src')||'');
    const explicit=Boolean(explicitKey(spot));

    // Preserve a unique existing hero. Curated Kibun images are for missing/legacy placeholders,
    // unless Hero Audit/data explicitly assigned a Kibun image key.
    if(existing && current && !current.includes('/assets/kibun-images/') && !isLegacyShared(current) && !explicit){
      return;
    }

    // detail_google: public list may use a curated image only when there is no unique existing hero.
    if(mode==='detail_google' && existing && current && !current.includes('/assets/kibun-images/') && !isLegacyShared(current)) return;

    const img=existing||document.createElement('img');
    if(!existing){img.loading='lazy';node.prepend(img);}
    if(img.getAttribute('src')!==src) img.src=src;
    img.alt=`${spot.name||''}のイメージ`;
    img.referrerPolicy='no-referrer';
    img.style.visibility='';
    node.dataset.kibunImage='curated';
    node.dataset.kibunImageKey=key;
    node.dataset.kibunImageAsset=src;
    addBadge(node);
  }

  function scan(root=document){
    if(root?.matches?.('[data-media-spot]')) applyNode(root);
    root?.querySelectorAll?.('[data-media-spot]').forEach(applyNode);
  }

  function boot(){
    if(!(global.ODEKAKE_SEED?.spots||[]).length){setTimeout(boot,120);return;}
    scan(document);
    new MutationObserver(records=>{
      for(const rec of records){
        for(const n of rec.addedNodes){if(n.nodeType===1) scan(n);}
      }
    }).observe(document.body,{childList:true,subtree:true});
  }

  global.KibunImages={
    disabled:false,
    approvedAssets:APPROVED_ASSETS,
    strongKey,
    scan
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})(window);
