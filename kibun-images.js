(function(global){
  'use strict';
  if(typeof document==='undefined') return;

  // v2 assets are the actual recent generated images. Older single-file fallbacks are kept
  // only for categories whose v2 image has not been promoted yet.
  const ASSET_POOLS={
    family_cafe:[
      '/assets/kibun-images/v2/family_cafe_01.webp',
      '/assets/kibun-images/v2/family_cafe_03.webp'
    ],
    kids_play_space:[
      '/assets/kibun-images/v2/kids_play_space_01.webp'
    ],
    aquarium:['/assets/kibun-images/v2/aquarium_01.webp'],
    lounge_cafe:['/assets/kibun-images/v2/lounge_cafe_01.webp'],
    onsen:['/assets/kibun-images/v2/onsen_01.webp'],
    seaside_terrace:['/assets/kibun-images/v2/seaside_terrace_01.webp'],
    fruit_picking:['/assets/kibun-images/v2/fruit_picking_01.webp'],
    pottery:['/assets/kibun-images/v2/pottery_01.webp'],
    railway_museum:['/assets/kibun-images/v2/railway_museum_01.webp'],
    garden:['/assets/kibun-images/v2/garden_01.webp']
  };

  const LEGACY_SHARED=[
    '/assets/vibes/','/assets/plans/family-cafe.webp','/assets/plans/waterfront-walk.webp',
    '/assets/plans/culture-cafe.webp','/assets/editorial/parents-eat-well.webp',
    '/assets/editorial/baby-first-outing.webp','/assets/editorial/special.webp',
    '/assets/editorial/culture.webp','/assets/editorial/hotel-without-staying.webp',
    '/assets/editorial/terrace-after-sunset.webp','/assets/editorial/green-breathing-room.webp',
    '/assets/editorial/night-starts-after-five.webp'
  ];

  function findSpot(id){return (global.ODEKAKE_SEED?.spots||[]).find(s=>String(s.spot_id)===String(id));}
  function textOf(spot){return [spot?.name,spot?.category_primary,spot?.category_secondary,spot?.public_copy,spot?.editorial?.title,spot?.editorial?.lead,spot?.editorial?.moment,...(Array.isArray(spot?.tags)?spot.tags:[]),...(Array.isArray(spot?.features)?spot.features:[]),...(Array.isArray(spot?.editorial?.best_for)?spot.editorial.best_for:[])].filter(Boolean).join(' ').toLowerCase();}
  const has=(text,words)=>words.some(w=>text.includes(w));

  function explicitKey(spot){
    const key=String(spot?.media_strategy?.kibun_image_key||spot?.kibun_image_key||'').trim();
    return ASSET_POOLS[key]?.length?key:'';
  }

  function strongKey(spot){
    const explicit=explicitKey(spot); if(explicit) return explicit;
    const name=String(spot?.name||'').toLowerCase();
    const t=textOf(spot),cat=String(spot?.category_primary||'').toLowerCase();

    // High-visibility venue fixes from production screenshots.
    if(name.includes('100本のスプーン')) return 'family_cafe';
    if(name.includes('the wharf house')||name.includes('wharf house')) return 'seaside_terrace';
    if(name.includes('play! park')||name.includes('play!park')||name.includes('ue fantasia')||name.includes('湘南あそびマーレ')||name.includes('あそびマーレ')||name.includes('ボーネルンド')||name.includes('キドキド')) return 'kids_play_space';

    // Only promote actual pottery / ceramics experiences; do not blanket-replace art museums.
    if(has(t,['陶芸体験','陶芸教室','ろくろ体験','電動ろくろ','陶芸','陶器づくり','やきもの体験'])) return 'pottery';
    // Only promote a generated scene when the venue itself is unmistakably on-theme.
    if(has(name,['鉄道博物館','地下鉄博物館','東武博物館','原鉄道模型博物館','電車とバスの博物館','リニア・鉄道館','リニア鉄道館','京王れーるランド','railway museum'])) return 'railway_museum';
    if(has(name,['日本庭園','庭園','植物園','イングリッシュガーデン','フラワーガーデン','花菜ガーデン','バラ園']) ||
       ((cat==='garden'||cat==='botanical_garden')&&has(t,['庭園','植物園','ガーデン']))) return 'garden';
    if(has(t,['水族館','aquarium','クラゲ','イルカ'])) return 'aquarium';
    if(has(t,['いちご狩り','苺狩り','果物狩り','ぶどう狩り','りんご狩り','みかん狩り','収穫体験','観光農園'])) return 'fruit_picking';
    if(has(t,['日帰り温泉','露天風呂','温浴施設','温泉','サウナ','spa','スパ'])||cat==='relax') return 'onsen';
    if(has(t,['海沿い','海辺','ベイサイド','ウォーターフロント','オーシャンビュー','マリーナ'])||cat==='waterfront') return 'seaside_terrace';
    if(has(t,['屋内遊び場','キッズパーク','プレイグラウンド','室内アスレチック'])) return 'kids_play_space';

    const cafe=/food|cafe|restaurant|afternoontea/.test(cat)||has(t,['カフェ','cafe','喫茶','レストラン','ラウンジ']);
    if(cafe){
      if(has(t,['キッズスペース','ベビースペース','座敷','小上がり','授乳室','離乳食','子連れ','親子'])) return 'family_cafe';
      if(has(t,['ホテルラウンジ','アフタヌーンティー','大人時間','ラウンジ'])) return 'lounge_cafe';
    }
    return '';
  }

  function stableHash(value){
    const s=String(value||''); let h=2166136261;
    for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
    return h>>>0;
  }
  function assetFor(spot,key){
    const pool=ASSET_POOLS[key]||[]; if(!pool.length) return '';
    return pool[stableHash(`${spot?.spot_id||''}|${spot?.name||''}|${key}`)%pool.length];
  }
  function displayMode(spot){if(global.KibunMedia?.displayMode)return global.KibunMedia.displayMode(spot);return String(spot?.media_strategy?.display_mode||'kibun_image');}
  function isLegacyShared(src){return LEGACY_SHARED.some(part=>src.includes(part));}
  function addBadge(node){if(!node.querySelector('.image-badge'))node.insertAdjacentHTML('beforeend','<span class="image-badge">イメージ</span>');}

  function applyNode(node){
    if(!node?.matches?.('[data-media-spot]')) return;
    const spot=findSpot(node.getAttribute('data-media-spot')); if(!spot) return;
    const mode=displayMode(spot); if(mode!=='kibun_image'&&mode!=='detail_google') return;
    const key=strongKey(spot); if(!key) return;
    const src=assetFor(spot,key); if(!src) return;
    const existing=node.querySelector('img');
    const current=String(existing?.getAttribute('src')||'');
    const explicit=Boolean(explicitKey(spot));

    // Preserve a genuine unique existing hero, but replace the old Kibun single-file fallbacks
    // with the new v2 generated assets when a strong match exists.
    const isOldKibun=current.includes('/assets/kibun-images/')&&!current.includes('/assets/kibun-images/v2/');
    const isCuratedV2=current.includes('/assets/kibun-images/v2/');
    // A recycled card can still contain a v2 image from the previous spot; update it.
    // Preserve genuinely venue-specific imagery unless explicitly assigned.
    if(existing&&current&&!isOldKibun&&!isCuratedV2&&!isLegacyShared(current)&&!explicit) return;
    if(mode==='detail_google'&&existing&&current&&!isOldKibun&&!isCuratedV2&&!isLegacyShared(current)) return;

    const img=existing||document.createElement('img');
    if(!existing){img.loading='lazy';node.prepend(img);}
    if(img.getAttribute('src')!==src) img.src=src;
    img.alt=`${spot.name||''}のイメージ`;img.referrerPolicy='no-referrer';img.style.visibility='';
    node.dataset.kibunImage='curated-v2';node.dataset.kibunImageKey=key;node.dataset.kibunImageAsset=src;addBadge(node);
  }

  function scan(root=document){if(root?.matches?.('[data-media-spot]'))applyNode(root);root?.querySelectorAll?.('[data-media-spot]').forEach(applyNode);}
  function boot(){
    if(!(global.ODEKAKE_SEED?.spots||[]).length){setTimeout(boot,120);return;}
    scan(document);
    new MutationObserver(records=>{for(const rec of records)for(const n of rec.addedNodes)if(n.nodeType===1)scan(n);}).observe(document.body,{childList:true,subtree:true});
  }

  global.KibunImages={disabled:false,pools:ASSET_POOLS,strongKey,assetFor,scan};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(window);
