(function(global){
  'use strict';
  if(typeof document==='undefined') return;

  const ASSETS={
    family_cafe:'/assets/kibun-images/family_cafe.webp',
    lounge_cafe:'/assets/kibun-images/lounge_cafe.webp',
    garden_park:'/assets/kibun-images/garden_park.webp',
    seaside_terrace:'/assets/kibun-images/seaside_terrace.webp',
    kids_play_space:'/assets/kibun-images/kids_play_space.webp',
    railway_museum:'/assets/kibun-images/railway_museum.webp',
    craft_workshop:'/assets/kibun-images/craft_workshop.webp',
    onsen:'/assets/kibun-images/onsen.webp',
    aquarium:'/assets/kibun-images/aquarium.webp',
    fruit_picking:'/assets/kibun-images/fruit_picking.webp'
  };

  function textOf(spot){
    const bits=[
      spot?.name,spot?.category_primary,spot?.category_secondary,spot?.public_copy,
      spot?.editorial?.title,spot?.editorial?.lead,spot?.editorial?.moment,
      ...(Array.isArray(spot?.tags)?spot.tags:[]),
      ...(Array.isArray(spot?.features)?spot.features:[]),
      ...(Array.isArray(spot?.editorial?.best_for)?spot.editorial.best_for:[])
    ];
    return bits.filter(Boolean).join(' ').toLowerCase();
  }
  function has(text,words){return words.some(w=>text.includes(w));}
  function isCafeLike(spot,text){
    const cat=String(spot?.category_primary||'').toLowerCase();
    return /food|cafe|restaurant|afternoontea/.test(cat)||has(text,['カフェ','cafe','喫茶','レストラン','restaurant','ランチ','ラウンジ','afternoon tea','アフタヌーンティー']);
  }
  function isFamilyFriendly(spot,text){
    const e=spot?.experience_seed||{};
    return Number(e.baby_fit||0)>=75||Number(e.stroller_fit||0)>=75||has(text,['キッズスペース','ベビースペース','座敷','小上がり','授乳室','おむつ替え','離乳食','子連れ','親子']);
  }

  function inferKey(spot){
    const explicit=String(spot?.media_strategy?.kibun_image_key||spot?.kibun_image_key||'').trim();
    if(ASSETS[explicit]) return explicit;
    const t=textOf(spot),cat=String(spot?.category_primary||'').toLowerCase(),v=spot?.vibes_seed||{},e=spot?.experience_seed||{};

    if(has(t,['いちご狩り','苺狩り','果物狩り','ぶどう狩り','りんご狩り','みかん狩り','収穫体験','観光農園','農園'])||/farm|orchard/.test(cat)) return 'fruit_picking';
    if(has(t,['水族館','aquarium','クラゲ','イルカ','海の生きもの','海の生き物'])) return 'aquarium';
    if(has(t,['鉄道博物館','鉄道展示','新幹線','列車展示','車両展示','乗り物ミュージアム','電車の展示','鉄道'])) return 'railway_museum';
    if(has(t,['陶芸','工作','ワークショップ','ものづくり','工芸体験','手作り体験','クラフト','料理教室'])||cat==='experience'&&Number(e.hands_on||0)>=70) return 'craft_workshop';
    if(has(t,['温泉','日帰り温泉','露天風呂','温浴','サウナ','スパ','spa'])||cat==='relax') return 'onsen';
    if(has(t,['屋内遊び場','キッズパーク','プレイグラウンド','室内アスレチック','あそび場','遊び場','キッズ施設'])||cat==='kids'&&Number(v.active||0)>=65) return 'kids_play_space';

    if(isCafeLike(spot,t)){
      if(has(t,['海辺','海沿い','ベイサイド','ウォーターフロント','waterfront','港','マリーナ','オーシャンビュー','テラス'])||Number(v.waterside||0)>=80) return 'seaside_terrace';
      if(isFamilyFriendly(spot,t)) return 'family_cafe';
      return 'lounge_cafe';
    }

    if(has(t,['海辺','海沿い','ベイサイド','ウォーターフロント','waterfront','港','マリーナ','オーシャンビュー'])||Number(v.waterside||0)>=88) return 'seaside_terrace';
    if(has(t,['公園','庭園','日本庭園','緑地','植物園','バラ園','芝生','散策','自然公園'])||cat==='nature'||Number(v.nature||0)>=82) return 'garden_park';
    if(cat==='animals'&&Number(v.animals||0)>=80) return 'aquarium';
    if(cat==='culture'&&Number(e.hands_on||0)>=65) return 'craft_workshop';
    if(cat==='kids') return 'kids_play_space';
    return 'garden_park';
  }

  function displayMode(spot){
    if(global.KibunMedia?.displayMode) return global.KibunMedia.displayMode(spot);
    const explicit=String(spot?.media_strategy?.display_mode||'').trim();
    if(explicit) return explicit;
    const provider=String(spot?.media_strategy?.current_provider||'');
    if(['owned','official_permission','wikimedia_commons','open_license'].includes(provider)&&spot?.hero_image?.exact_spot!==false) return 'static';
    return spot?.media_strategy?.google_places?.place_id?'detail_google':'kibun_image';
  }
  function findSpot(id){return (global.ODEKAKE_SEED?.spots||[]).find(s=>String(s.spot_id)===String(id));}
  function applyNode(node){
    if(!node?.matches?.('[data-media-spot]')) return;
    const spot=findSpot(node.getAttribute('data-media-spot')); if(!spot) return;
    const mode=displayMode(spot);
    if(mode==='static') return;
    if(mode!=='kibun_image'&&mode!=='detail_google') return;
    if(node.classList.contains('google-places-photo')) return;
    const key=inferKey(spot),src=ASSETS[key]; if(!src) return;
    let img=node.querySelector('img');
    if(!img){img=document.createElement('img');img.loading='lazy';img.alt=spot.name||'';node.prepend(img);}
    const abs=new URL(src,document.baseURI).href;
    if(img.src!==abs){img.src=src;img.alt=`${spot.name||''}のイメージ`;img.referrerPolicy='no-referrer';img.style.visibility='';}
    node.dataset.kibunImage='1';node.dataset.kibunImageKey=key;
    if(!node.querySelector('.image-badge')) node.insertAdjacentHTML('beforeend','<span class="image-badge">イメージ</span>');
  }
  function scan(root=document){
    if(root?.matches?.('[data-media-spot]')) applyNode(root);
    root?.querySelectorAll?.('[data-media-spot]').forEach(applyNode);
  }
  function boot(){
    if(!(global.ODEKAKE_SEED?.spots||[]).length){setTimeout(boot,120);return;}
    scan(document);
    const observer=new MutationObserver(records=>{
      for(const rec of records) for(const n of rec.addedNodes){if(n.nodeType===1) scan(n);}
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  global.KibunImages={assets:ASSETS,inferKey,displayMode,scan};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(window);
