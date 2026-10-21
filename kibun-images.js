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
    // Ceramics exhibitions and museums must not show a potter's-wheel workshop scene.
    if(has(name,['陶芸体験','陶芸教室','陶芸工房','ろくろ体験','陶器づくり']) ||
       ((/workshop|experience|craft|studio/.test(cat)||has(name,['工房','体験','ワークショップ']))&&
        has(t,['陶芸体験','陶芸教室','ろくろ体験','電動ろくろ','陶器づくり','やきもの体験']))) return 'pottery';
    // Only promote a generated scene when the venue itself is unmistakably on-theme.
    if(has(name,['鉄道博物館','地下鉄博物館','東武博物館','原鉄道模型博物館','電車とバスの博物館','リニア・鉄道館','リニア鉄道館','京王れーるランド','railway museum'])) return 'railway_museum';
    if(has(name,['日本庭園','庭園','植物園','イングリッシュガーデン','フラワーガーデン','花菜ガーデン','バラ園']) ||
       ((cat==='garden'||cat==='botanical_garden')&&has(t,['庭園','植物園','ガーデン']))) return 'garden';
    if(has(t,['水族館','aquarium','クラゲ','イルカ'])) return 'aquarium';
    // The current v2 harvest scene visibly depicts strawberries. Never label grape,
    // apple, or mandarin picking with an unrelated fruit photo.
    if((has(name,['いちご','苺'])||has(t,['いちご狩り','苺狩り']))&&
       !has(name,['ぶどう','葡萄','りんご','林檎','みかん','ブルーベリー'])) return 'fruit_picking';
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

  // Shared by initial card rendering and the mutation observer. Making the decision
  // before inserting <img> avoids briefly showing an unrelated legacy thumbnail.
  function initialAssetForSpot(spot,originalSrc=''){
    const mode=displayMode(spot);
    if(mode!=='kibun_image'&&mode!=='detail_google') return '';
    const key=strongKey(spot); if(!key) return '';
    const src=assetFor(spot,key); if(!src) return '';
    const current=String(originalSrc||''),explicit=Boolean(explicitKey(spot));
    const old=current.includes('/assets/kibun-images/')&&!current.includes('/assets/kibun-images/v2/');
    const v2=current.includes('/assets/kibun-images/v2/');
    if(current&&!old&&!v2&&!isLegacyShared(current)&&!explicit)return '';
    // A pinned Google Places detail photo takes precedence over generated imagery.
    if(mode==='detail_google'&&current&&!old&&!v2&&!isLegacyShared(current))return '';
    return src;
  }

  function applyNode(node){
    if(!node?.matches?.('[data-media-spot]')) return;
    const spot=findSpot(node.getAttribute('data-media-spot')); if(!spot) return;
    const existing=node.querySelector('img');
    const src=initialAssetForSpot(spot,existing?.getAttribute('src')||'');
    if(!src) return;
    const img=existing||document.createElement('img');
    if(!existing){img.loading='lazy';node.prepend(img);}
    if(img.getAttribute('src')!==src) img.src=src;
    img.alt=`${spot.name||''}のイメージ`;img.referrerPolicy='no-referrer';img.style.visibility='';
    node.dataset.kibunImage='curated-v2';node.dataset.kibunImageKey=strongKey(spot);node.dataset.kibunImageAsset=src;addBadge(node);
  }

  function scan(root=document){if(root?.matches?.('[data-media-spot]'))applyNode(root);root?.querySelectorAll?.('[data-media-spot]').forEach(applyNode);}
  function boot(){
    if(!(global.ODEKAKE_SEED?.spots||[]).length){setTimeout(boot,120);return;}
    scan(document);
    new MutationObserver(records=>{for(const rec of records)for(const n of rec.addedNodes)if(n.nodeType===1)scan(n);}).observe(document.body,{childList:true,subtree:true});
  }

  global.KibunImages={disabled:false,pools:ASSET_POOLS,strongKey,assetFor,initialAssetForSpot,scan};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(window);
