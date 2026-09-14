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

  function effectivePhotoIndex(spot,localPhoto={}){
    const local=localPhoto?.[spot?.spot_id];
    if(Number.isInteger(local)) return {index:local,source:'local'};
    const seedIndex=spot?.media_strategy?.google_places?.photo_index_override;
    if(Number.isInteger(seedIndex)) return {index:seedIndex,source:'seed'};
    return {index:null,source:'auto'};
  }

  const api={seedPhotoOverrides,seedPlaceOverrides,buildMergedExport,effectivePhotoIndex};
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
    `;
    document.head.appendChild(style);
  }

  function decorateAudit(){
    const buttons=[...document.querySelectorAll('[data-audit-index]')];
    if(!buttons.length||!global.KibunMedia) return;
    const spotId=currentSpotId();
    const spot=findSpot(spotId);
    if(!spot) return;
    const local=global.KibunMedia.getAuditOverrides?.()||{};
    const eff=effectivePhotoIndex(spot,local);
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
    const grid=buttons[0].parentElement;
    if(!grid) return;
    let state=grid.parentElement?.querySelector(':scope > .hero-audit-pin-state');
    if(!state){state=document.createElement('div');state.className='hero-audit-pin-state';grid.before(state);}
    if(Number.isInteger(eff.index)){
      const source=eff.source==='local'?'今回選択':'seed固定';
      state.innerHTML=`<strong>Hero固定中：#${eff.index}（${source}）</strong><span>AUTO #${autoIndex??'-'} はGoogle側の自動候補で、現在の固定Heroではありません。</span><span class="warn">現在の固定方式は写真番号です。Google側で写真の並び順が変わると、同じ #${eff.index} が別写真になる可能性があります。</span>`;
    }else{
      state.innerHTML=`<strong>Hero未固定</strong><span>AUTO #${autoIndex??'-'} を自動候補として使用します。</span>`;
    }
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
    if(e.target?.closest?.('[data-audit-index],[data-audit-reset],[data-audit-place-clear],[data-audit-fix-place]')){
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
