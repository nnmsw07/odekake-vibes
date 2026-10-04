(function(global){
  'use strict';

  function seedPhotoOverrides(seed){
    const out={};
    for(const spot of seed?.spots||[]){
      const n=spot?.media_strategy?.google_places?.photo_index_override;
      if(Number.isInteger(n)) out[spot.spot_id]=n;
    }
    return out;
  }

  function seedPlaceOverrides(seed){
    const out={};
    for(const spot of seed?.spots||[]){
      const gp=spot?.media_strategy?.google_places||{};
      if(!gp.place_id) continue;
      out[spot.spot_id]={
        query:String(gp.query||spot.name||''),
        place_id:String(gp.place_id),
        matched_name:String(gp.matched_name||''),
        matched_address:String(gp.matched_address||''),
        use_address:gp.use_address!==false
      };
    }
    return out;
  }

  function buildMergedExport(seed,localPhoto={},localPlace={}){
    return {
      photo_index_overrides:{...seedPhotoOverrides(seed),...(localPhoto||{})},
      place_overrides:{...seedPlaceOverrides(seed),...(localPlace||{})}
    };
  }

  function effectivePlacePin(spot,localPlace={}){
    const local=localPlace?.[spot?.spot_id];
    if(local?.place_id) return {place_id:String(local.place_id),source:'local'};
    const gp=spot?.media_strategy?.google_places||{};
    if(gp.place_id) return {place_id:String(gp.place_id),source:'seed'};
    return {place_id:'',source:'none'};
  }

  function effectivePhotoIndex(spot,localPhoto={},localPlace={}){
    const place=effectivePlacePin(spot,localPlace);
    const local=localPhoto?.[spot?.spot_id];
    if(Number.isInteger(local)){
      if(place.place_id) return {index:local,source:'local',placeSource:place.source};
      return {index:null,source:'unsafe_local',unsafeIndex:local,placeSource:'none'};
    }
    const seedIndex=spot?.media_strategy?.google_places?.photo_index_override;
    if(Number.isInteger(seedIndex)){
      if(place.place_id) return {index:seedIndex,source:'seed',placeSource:place.source};
      return {index:null,source:'unsafe_seed',unsafeIndex:seedIndex,placeSource:'none'};
    }
    return {index:null,source:'auto',placeSource:place.source};
  }

  const api={seedPhotoOverrides,seedPlaceOverrides,buildMergedExport,effectivePlacePin,effectivePhotoIndex};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  global.KibunHeroAuditGuard=api;
  if(typeof document==='undefined') return;

  function escapeHtml(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));}
  function currentSpotId(){
    return document.querySelector('#spotDialog [data-media-spot]')?.getAttribute('data-media-spot')||'';
  }
  function findSpot(id){return (global.ODEKAKE_SEED?.spots||[]).find(s=>s.spot_id===id)||null;}

  function installStyle(){
    if(document.getElementById('hero-audit-pin-guard-style')) return;
    const style=document.createElement('style');
    style.id='hero-audit-pin-guard-style';
    style.textContent=`
      .audit-photo.hero-fixed{outline:3px solid #496b50!important;outline-offset:2px!important}
      .audit-fixed{position:absolute;left:7px;bottom:7px;z-index:5;padding:4px 7px;border-radius:999px;background:#365440;color:#fff;font-size:10px;font-weight:800;letter-spacing:.04em;box-shadow:0 2px 8px rgba(0,0,0,.18)}
      .audit-auto{right:7px!important;left:auto!important}
      .hero-audit-pin-state{margin:10px 0;padding:10px 12px;border-radius:12px;background:#f1f5ef;border:1px solid #d1ddce;color:#314235;font-size:12px;line-height:1.55}
      .hero-audit-pin-state strong{display:block;font-size:13px;margin-bottom:2px}
      .hero-audit-pin-state .warn{display:block;margin-top:4px;color:#7a5834}
      .hero-audit-pin-state.is-unsafe{background:#fff7e9;border-color:#e8cf9d;color:#684c25}
    `;
    document.head.appendChild(style);
  }

  function stateBoxForButtons(buttons){
    const grid=buttons[0]?.parentElement;
    if(!grid) return null;
    let state=grid.parentElement?.querySelector(':scope > .hero-audit-pin-state');
    if(!state){
      state=document.createElement('div');
      state.className='hero-audit-pin-state';
      grid.before(state);
    }
    return state;
  }

  function decorateAudit(){
    const buttons=[...document.querySelectorAll('[data-audit-index]')];
    if(!buttons.length||!global.KibunMedia) return;
    const spotId=currentSpotId();
    const spot=findSpot(spotId);
    if(!spot) return;
    const localPhoto=global.KibunMedia.getAuditOverrides?.()||{};
    const localPlace=global.KibunMedia.getAuditPlaceOverrides?.()||{};
    const eff=effectivePhotoIndex(spot,localPhoto,localPlace);
    const place=effectivePlacePin(spot,localPlace);
    let autoIndex=null;
    for(const btn of buttons){
      const idx=Number(btn.getAttribute('data-audit-index'));
      const imgWrap=btn.querySelector('.audit-photo-img')||btn;
      const auto=btn.querySelector('.audit-auto');
      if(auto) autoIndex=idx;
      const fixed=Number.isInteger(eff.index)&&idx===eff.index;
      btn.classList.toggle('hero-fixed',fixed);
      btn.classList.toggle('selected',fixed);
      btn.querySelector('.audit-fixed')?.remove();
      if(fixed) imgWrap.insertAdjacentHTML('beforeend',`<span class="audit-fixed">FIXED #${idx}</span>`);
    }
    const state=stateBoxForButtons(buttons);
    if(!state) return;
    state.classList.toggle('is-unsafe',eff.source==='unsafe_seed'||eff.source==='unsafe_local');
    if(Number.isInteger(eff.index)){
      const source=eff.source==='local'?'今回選択':'seed固定';
      const placeSource=place.source==='local'?'今回固定':'seed固定';
      state.innerHTML=`<strong>Hero固定中：#${eff.index}（${source}）</strong><span>Google Place IDも${placeSource}済みです。AUTO #${autoIndex??'-'} は自動候補です。</span><span class="warn">写真番号は固定Place IDの写真一覧にだけ適用します。</span>`;
    }else if(eff.source==='unsafe_seed'||eff.source==='unsafe_local'){
      state.innerHTML=`<strong>旧Hero #${eff.unsafeIndex} は安全のため無効化中</strong><span>写真番号だけが保存され、Google Place IDが固定されていません。</span><span class="warn">候補写真を1枚選ぶと、Google施設を先に固定してからHeroを保存します。</span>`;
    }else{
      const placeText=place.place_id?'Google Place ID固定済み。':'Google Place ID未固定。';
      state.innerHTML=`<strong>Hero未固定</strong><span>${placeText} AUTO #${autoIndex??'-'} を自動候補として使用します。</span>`;
    }
  }

  function showPinRequired(){
    const buttons=[...document.querySelectorAll('[data-audit-index]')];
    const state=stateBoxForButtons(buttons);
    if(!state) return;
    state.classList.add('is-unsafe');
    state.innerHTML='<strong>先にGoogle施設の固定が必要です</strong><span>写真番号だけではHeroを保存できません。</span><span class="warn">「このGoogle施設を固定」が表示されていることを確認して、候補写真をもう一度選んでください。</span>';
  }

  function ensurePlacePinnedBeforePhotoSelection(e){
    const photoBtn=e.target?.closest?.('[data-audit-index]');
    if(!photoBtn||!global.KibunMedia) return true;
    const spotId=currentSpotId();
    const spot=findSpot(spotId);
    if(!spot) return true;
    if(global.KibunMedia.hasPinnedPlace?.(spot)) return true;

    // Reuse the audit UI's already-resolved Place candidate. Its click handler writes
    // the Place ID synchronously before it starts the async candidate re-render.
    const fixBtn=document.querySelector('#spotDialog [data-audit-fix-place]')||document.querySelector('[data-audit-fix-place]');
    if(fixBtn){
      fixBtn.click();
      if(global.KibunMedia.hasPinnedPlace?.(spot)) return true;
    }

    e.preventDefault();
    e.stopImmediatePropagation();
    showPinRequired();
    return false;
  }

  function openExport(payload){
    const text=JSON.stringify(payload,null,2);
    const w=global.open('','_blank');
    if(w){
      w.document.write(`<meta name="viewport" content="width=device-width"><pre style="white-space:pre-wrap;font:14px/1.5 monospace;padding:20px">${escapeHtml(text)}</pre>`);
      w.document.close();
    }else global.prompt('Hero audit export',text);
  }

  function exportMerged(){
    return buildMergedExport(
      global.ODEKAKE_SEED,
      global.KibunMedia?.getAuditOverrides?.()||{},
      global.KibunMedia?.getAuditPlaceOverrides?.()||{}
    );
  }

  installStyle();
  document.addEventListener('click',e=>{
    const exportBtn=e.target?.closest?.('#heroAuditExport');
    if(exportBtn){
      e.preventDefault();
      e.stopImmediatePropagation();
      openExport(exportMerged());
      return;
    }
    if(e.target?.closest?.('[data-audit-index]')){
      if(!ensurePlacePinnedBeforePhotoSelection(e)) return;
      setTimeout(decorateAudit,0);
      return;
    }
    if(e.target?.closest?.('[data-audit-reset],[data-audit-place-clear],[data-audit-fix-place]')){
      setTimeout(decorateAudit,0);
    }
  },true);

  let queued=false;
  const schedule=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;decorateAudit();});};
  const start=()=>{
    decorateAudit();
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})(typeof window!=='undefined'?window:globalThis);


// v20.19.13: hide the fixed Hero Audit dock while a spot detail dialog is open.
(function installHeroAuditSpotOpenState(){
  if(typeof document==='undefined') return;
  const sync=()=>{
    const dialog=document.getElementById('spotDialog');
    document.body?.classList.toggle('hero-audit-spot-open',Boolean(dialog?.open));
  };
  const bind=()=>{
    const dialog=document.getElementById('spotDialog');
    if(!dialog) return;
    sync();
    new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']});
    dialog.addEventListener('close',sync);
    dialog.addEventListener('cancel',()=>setTimeout(sync,0));
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind,{once:true});
  else bind();
})();

// v20.19.12: keep plan-hub navigation context when closing a deep-linked plan modal.
(function installPlanCloseNavigation(global){
  'use strict';
  if(typeof document==='undefined'||typeof location==='undefined') return;
  const PLAN_HUB_SOURCES=new Set(['plan_library','plan_mood_visual']);

  function params(){return new URLSearchParams(location.search);}
  function shouldReturnToPlans(){
    const p=params();
    return Boolean(p.get('plan'))&&PLAN_HUB_SOURCES.has(p.get('source'));
  }
  function cameFromPlansHub(){
    if(!document.referrer) return false;
    try{
      const ref=new URL(document.referrer,location.href);
      return ref.origin===location.origin&&ref.pathname.replace(/\/+$/,'')==='/plans';
    }catch(_){return false;}
  }
  function returnToPlans(){
    if(cameFromPlansHub()&&history.length>1) history.back();
    else location.assign('/plans/');
  }
  function interceptPlanClose(e){
    if(!shouldReturnToPlans()) return;
    const planDialog=document.getElementById('planDialog');
    const closeButton=e.target?.closest?.('#planDialogClose');
    const backdrop=e.target===planDialog;
    if(!closeButton&&!backdrop) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    returnToPlans();
  }
  function bindCancel(){
    const planDialog=document.getElementById('planDialog');
    if(!planDialog||planDialog.dataset.planCloseNavigationBound==='1') return;
    planDialog.dataset.planCloseNavigationBound='1';
    planDialog.addEventListener('cancel',e=>{
      if(!shouldReturnToPlans()) return;
      e.preventDefault();
      returnToPlans();
    },true);
  }

  document.addEventListener('click',interceptPlanClose,true);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bindCancel,{once:true});
  else bindCancel();
})(typeof window!=='undefined'?window:globalThis);
