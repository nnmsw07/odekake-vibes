(function(global){
  'use strict';
  if(typeof document==='undefined') return;

  const ASSET_POOLS={
    family_cafe:[
      '/assets/kibun-images/family_cafe.webp',
      '/assets/plans/family-cafe.webp',
      '/assets/editorial/parents-eat-well.webp',
      '/assets/editorial/baby-first-outing.webp'
    ],
    lounge_cafe:[
      '/assets/kibun-images/lounge_cafe.webp',
      '/assets/editorial/hotel-without-staying.webp',
      '/assets/plans/culture-cafe.webp',
      '/assets/editorial/terrace-after-sunset.webp'
    ],
    garden_park:[
      '/assets/kibun-images/garden_park.webp',
      '/assets/editorial/green-breathing-room.webp',
      '/assets/vibes/nature.webp',
      '/assets/vibes/stroll.webp'
    ],
    seaside_terrace:[
      '/assets/kibun-images/seaside_terrace.webp',
      '/assets/plans/waterfront-walk.webp',
      '/assets/editorial/terrace-after-sunset.webp',
      '/assets/vibes/scenic.webp'
    ],
    kids_play_space:[
      '/assets/kibun-images/kids_play_space.webp',
      '/assets/editorial/baby-first-outing.webp',
      '/assets/editorial/special.webp',
      '/assets/vibes/extraordinary.webp'
    ],
    railway_museum:[
      '/assets/kibun-images/railway_museum.webp',
      '/assets/vibes/cool.webp',
      '/assets/vibes/culture.webp',
      '/assets/editorial/culture.webp'
    ],
    craft_workshop:[
      '/assets/kibun-images/craft_workshop.webp',
      '/assets/editorial/culture.webp',
      '/assets/vibes/culture.webp',
      '/assets/vibes/extraordinary.webp'
    ],
    onsen:[
      '/assets/kibun-images/onsen.webp',
      '/assets/editorial/relax.webp',
      '/assets/editorial/hotel-without-staying.webp',
      '/assets/vibes/relax.webp'
    ],
    aquarium:[
      '/assets/kibun-images/aquarium.webp',
      '/assets/vibes/cool.webp',
      '/assets/vibes/extraordinary.webp'
    ],
    fruit_picking:[
      '/assets/kibun-images/fruit_picking.webp',
      '/assets/editorial/green-breathing-room.webp',
      '/assets/vibes/nature.webp'
    ],
    science_museum:[
      '/assets/vibes/cool.webp',
      '/assets/vibes/extraordinary.webp',
      '/assets/editorial/culture.webp'
    ],
    art_museum:[
      '/assets/editorial/culture.webp',
      '/assets/vibes/culture.webp',
      '/assets/plans/culture-cafe.webp',
      '/assets/vibes/extraordinary.webp'
    ],
    theater:[
      '/assets/editorial/night-starts-after-five.webp',
      '/assets/vibes/culture.webp',
      '/assets/editorial/culture.webp'
    ],
    zoo:[
      '/assets/vibes/nature.webp',
      '/assets/editorial/green-breathing-room.webp',
      '/assets/vibes/extraordinary.webp'
    ],
    shopping:[
      '/assets/vibes/shopping.webp',
      '/assets/editorial/night-starts-after-five.webp',
      '/assets/plans/culture-cafe.webp'
    ]
  };

  function textOf(spot){
    const bits=[spot?.name,spot?.category_primary,spot?.category_secondary,spot?.public_copy,spot?.editorial?.title,spot?.editorial?.lead,spot?.editorial?.moment,...(Array.isArray(spot?.tags)?spot.tags:[]),...(Array.isArray(spot?.features)?spot.features:[]),...(Array.isArray(spot?.editorial?.best_for)?spot.editorial.best_for:[])];
    return bits.filter(Boolean).join(' ').toLowerCase();
  }
  const has=(text,words)=>words.some(w=>text.includes(w));

  function inferKey(spot){
    const explicit=String(spot?.media_strategy?.kibun_image_key||spot?.kibun_image_key||'').trim();
    if(ASSET_POOLS[explicit]) return explicit;
    const t=textOf(spot),cat=String(spot?.category_primary||'').toLowerCase(),v=spot?.vibes_seed||{},e=spot?.experience_seed||{};

    if(has(t,['科学館','サイエンス','science museum','プラネタリウム','宇宙','実験展示','科学技術'])) return 'science_museum';
    if(has(t,['美術館','アートミュージアム','art museum','ギャラリー','美術展','現代美術'])) return 'art_museum';
    if(has(t,['劇場','シアター','theater','theatre','ホール','バレエ','ミュージカル','舞台','演劇'])) return 'theater';
    if(has(t,['動物園','zoo','サファリ','どうぶつ園'])) return 'zoo';
    if(has(t,['ショッピング','商業施設','アウトレット','モール','market','マーケット'])||cat==='shopping') return 'shopping';
    if(has(t,['いちご狩り','苺狩り','果物狩り','ぶどう狩り','りんご狩り','みかん狩り','収穫体験','観光農園','農園'])||/farm|orchard/.test(cat)) return 'fruit_picking';
    if(has(t,['水族館','aquarium','クラゲ','イルカ'])) return 'aquarium';
    if(has(t,['鉄道博物館','新幹線','列車展示','車両展示','鉄道'])) return 'railway_museum';
    if(has(t,['陶芸','工作','ワークショップ','ものづくり','工芸体験','手作り体験','クラフト','料理教室'])||(cat==='experience'&&Number(e.hands_on||0)>=70)) return 'craft_workshop';
    if(has(t,['温泉','日帰り温泉','露天風呂','温浴','サウナ','スパ','spa'])||cat==='relax') return 'onsen';
    if(has(t,['屋内遊び場','キッズパーク','プレイグラウンド','室内アスレチック','あそび場','遊び場'])||(cat==='kids'&&Number(v.active||0)>=65)) return 'kids_play_space';

    const cafe=/food|cafe|restaurant|afternoontea/.test(cat)||has(t,['カフェ','cafe','喫茶','レストラン','ランチ','ラウンジ']);
    if(cafe){
      if(has(t,['海辺','海沿い','ベイサイド','ウォーターフロント','港','マリーナ','オーシャンビュー','テラス'])||Number(v.waterside||0)>=80) return 'seaside_terrace';
      const family=Number(e.baby_fit||0)>=75||Number(e.stroller_fit||0)>=75||has(t,['キッズスペース','ベビースペース','座敷','小上がり','授乳室','おむつ替え','離乳食','子連れ','親子']);
      return family?'family_cafe':'lounge_cafe';
    }
    if(has(t,['海辺','海沿い','ベイサイド','ウォーターフロント','港','マリーナ','オーシャンビュー'])||Number(v.waterside||0)>=88) return 'seaside_terrace';
    return 'garden_park';
  }

  function stableHash(value){
    const s=String(value||''); let h=2166136261;
    for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
    return h>>>0;
  }
  function assetFor(spot,key=inferKey(spot)){
    const pool=ASSET_POOLS[key]||ASSET_POOLS.garden_park;
    if(!pool?.length) return '';
    const seed=`${spot?.spot_id||''}|${spot?.name||''}|${key}`;
    return pool[stableHash(seed)%pool.length];
  }

  function displayMode(spot){
    if(global.KibunMedia?.displayMode) return global.KibunMedia.displayMode(spot);
    return spot?.media_strategy?.display_mode||'kibun_image';
  }
  function findSpot(id){return (global.ODEKAKE_SEED?.spots||[]).find(s=>String(s.spot_id)===String(id));}
  function isUsableExisting(img){
    if(!img) return false;
    const src=img.getAttribute('src')||'';
    if(!src) return false;
    if(img.closest?.('[data-static-hero-error="1"]')) return false;
    if(img.style?.visibility==='hidden') return false;
    return true;
  }
  function addImageBadge(node){
    if(!node.querySelector('.image-badge')) node.insertAdjacentHTML('beforeend','<span class="image-badge">イメージ</span>');
  }
  function applyNode(node){
    if(!node?.matches?.('[data-media-spot]')) return;
    const spot=findSpot(node.getAttribute('data-media-spot')); if(!spot) return;
    const mode=displayMode(spot);
    if(mode==='static'||node.classList.contains('google-places-photo')) return;
    if(mode!=='kibun_image'&&mode!=='detail_google') return;

    // Keep each spot's own image when available. Kibun pools are fallback-only.
    const existing=node.querySelector('img');
    if(isUsableExisting(existing)){
      node.dataset.kibunImage='existing';
      node.dataset.kibunImageKey=inferKey(spot);
      addImageBadge(node);
      return;
    }

    const key=inferKey(spot),src=assetFor(spot,key);
    if(!src) return;
    const img=existing||document.createElement('img');
    if(!existing){img.loading='lazy';node.prepend(img);}
    img.src=src;
    img.alt=`${spot.name||''}のイメージ`;
    img.referrerPolicy='no-referrer';
    img.style.visibility='';
    node.dataset.kibunImage='fallback';
    node.dataset.kibunImageKey=key;
    node.dataset.kibunImageAsset=src;
    addImageBadge(node);
  }
  function scan(root=document){
    if(root?.matches?.('[data-media-spot]')) applyNode(root);
    root?.querySelectorAll?.('[data-media-spot]').forEach(applyNode);
  }
  function boot(){
    if(!(global.ODEKAKE_SEED?.spots||[]).length){setTimeout(boot,120);return;}
    scan(document);
    new MutationObserver(records=>{for(const rec of records)for(const n of rec.addedNodes){if(n.nodeType===1)scan(n);}}).observe(document.body,{childList:true,subtree:true});
  }

  global.KibunImages={assets:ASSET_POOLS,pools:ASSET_POOLS,inferKey,assetFor,displayMode,scan};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(window);
