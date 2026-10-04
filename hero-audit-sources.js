(function installHeroAuditSourceManager(){
  if(typeof window==='undefined'||typeof document==='undefined')return;
  const params=new URLSearchParams(location.search);
  const hash=decodeURIComponent(location.hash||'');
  let persisted=false;
  try{persisted=localStorage.getItem('kibun-hero-audit-enabled')==='1';}catch(_e){}
  const enabled=params.get('heroAudit')==='1'||/(?:^|[?&#])heroAudit=1(?:&|$)/.test(hash)||persisted;
  if(!enabled)return;

  const REVIEW_KEY='kibun-image-source-review-v1';
  const STATIC_PROVIDERS=new Set(['owned','official_permission','wikimedia_commons','open_license']);
  const DECISION_LABELS={official:'公式候補',open_license:'CC候補',keep_google:'Google継続',hold:'保留'};
  let verified=new Map();
  let currentFilter='action';
  let currentQuery='';

  function readReviews(){
    try{return JSON.parse(localStorage.getItem(REVIEW_KEY)||'{}')||{};}catch(_e){return {};}
  }
  function writeReviews(value){
    try{localStorage.setItem(REVIEW_KEY,JSON.stringify(value));}catch(_e){}
  }
  function providerOf(spot){return String(spot?.media_strategy?.current_provider||spot?.hero_image?.type||'unknown');}
  function hasPinnedPlace(spot){return Boolean(String(spot?.media_strategy?.google_places?.place_id||'').trim());}
  function classify(spot){
    const provider=providerOf(spot);
    const exact=spot?.hero_image?.exact_spot;
    if(verified.has(spot.spot_id))return {status:'verified_static',label:'静的画像 登録済み',tone:'ok',provider};
    if(STATIC_PROVIDERS.has(provider)&&exact!==false)return {status:'existing_static',label:'静的画像 OK',tone:'ok',provider};
    if(hasPinnedPlace(spot))return {status:'google_pinned',label:'Google Places使用',tone:'google',provider};
    return {status:'needs_static_source',label:'静的画像候補を探す',tone:'need',provider};
  }
  function searchUrls(spot){
    const q=encodeURIComponent(`${spot.name||''} ${spot.address||''}`.trim());
    return {
      official:spot.official_url||'',
      commons:`https://commons.wikimedia.org/w/index.php?search=${q}&title=Special:MediaSearch&type=image`,
      openverse:`https://openverse.org/search/image?q=${q}`
    };
  }
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function matchesFilter(spot,status){
    const reviews=readReviews();
    if(currentFilter==='all')return true;
    if(currentFilter==='action')return status==='needs_static_source'||status==='google_pinned';
    if(currentFilter==='needs')return status==='needs_static_source';
    if(currentFilter==='google')return status==='google_pinned';
    if(currentFilter==='static')return status==='verified_static'||status==='existing_static';
    if(currentFilter==='reviewed')return Boolean(reviews[spot.spot_id]);
    return true;
  }
  function matchesQuery(spot){
    const q=currentQuery.trim().toLowerCase();
    if(!q)return true;
    return [spot.name,spot.spot_id,spot.prefecture,spot.city,spot.address,...(spot.aliases||[])].join(' ').toLowerCase().includes(q);
  }
  function statusCounts(spots){
    const counts={all:spots.length,action:0,needs:0,google:0,static:0,reviewed:0};
    const reviews=readReviews();
    for(const s of spots){
      const st=classify(s).status;
      if(st==='needs_static_source'){counts.needs++;counts.action++;}
      else if(st==='google_pinned'){counts.google++;counts.action++;}
      else counts.static++;
      if(reviews[s.spot_id])counts.reviewed++;
    }
    return counts;
  }
  function recordDecision(spotId,decision,sourceUrl=''){
    const reviews=readReviews();
    const old=reviews[spotId]||{};
    reviews[spotId]={...old,decision,source_url:sourceUrl||old.source_url||'',updated_at:new Date().toISOString()};
    writeReviews(reviews);
  }
  function recordUrl(spot){
    const reviews=readReviews();
    const old=reviews[spot.spot_id]||{};
    const value=prompt(`${spot.name}\n候補画像の「出典ページURL」を記録`,old.source_url||'');
    if(value===null)return;
    reviews[spot.spot_id]={...old,source_url:value.trim(),updated_at:new Date().toISOString()};
    writeReviews(reviews);
  }
  async function copyExport(spots){
    const reviews=readReviews();
    const payload={exported_at:new Date().toISOString(),source_reviews:Object.entries(reviews).map(([spot_id,v])=>({spot_id,...v})),summary:statusCounts(spots)};
    const text=JSON.stringify(payload,null,2);
    try{await navigator.clipboard.writeText(text);alert('画像ソース監査のレビューJSONをコピーしました。');}
    catch(_e){const w=window.open('','_blank');if(w){w.document.write(`<meta name="viewport" content="width=device-width"><pre style="white-space:pre-wrap;font:14px/1.5 monospace;padding:20px">${escapeHtml(text)}</pre>`);w.document.close();}else prompt('画像ソース監査 export',text);}
  }

  function installStyles(){
    if(document.getElementById('kibun-image-source-audit-style'))return;
    const style=document.createElement('style');
    style.id='kibun-image-source-audit-style';
    style.textContent=`
.hero-source-btn{background:#f4efe5!important;color:#3e4d3e!important;border:1px solid #ded5c5!important}
.hero-source-panel{position:fixed;inset:0;z-index:10050;background:rgba(24,29,25,.48);display:none;align-items:flex-end;justify-content:center;padding:18px}
.hero-source-panel.is-open{display:flex}
.hero-source-sheet{width:min(980px,100%);height:min(88vh,900px);background:#fffdf9;border-radius:24px 24px 18px 18px;box-shadow:0 24px 70px rgba(24,29,25,.28);display:flex;flex-direction:column;overflow:hidden}
.hero-source-head{padding:18px 18px 12px;border-bottom:1px solid #eee8de;background:#fffdf9}
.hero-source-title-row{display:flex;align-items:flex-start;gap:12px;justify-content:space-between}
.hero-source-title-row h2{font-size:20px;line-height:1.25;margin:2px 0 4px;color:#28342c}
.hero-source-title-row p{font-size:12px;line-height:1.55;color:#6d746d;margin:0;max-width:720px}
.hero-source-close{border:0;background:#f2eee7;border-radius:999px;width:36px;height:36px;font-size:20px;color:#3c463e;flex:0 0 auto}
.hero-source-controls{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px;margin-top:13px}
.hero-source-controls input,.hero-source-controls select{border:1px solid #dcd6cc;border-radius:12px;padding:10px 11px;background:white;font-size:14px;min-width:0}
.hero-source-filter-row{display:flex;gap:7px;overflow-x:auto;padding:10px 0 0;scrollbar-width:none}
.hero-source-filter-row::-webkit-scrollbar{display:none}
.hero-source-filter{white-space:nowrap;border:1px solid #ddd6ca;background:#fff;border-radius:999px;padding:7px 10px;font-size:12px;color:#566057}
.hero-source-filter.is-active{background:#40513d;color:white;border-color:#40513d}
.hero-source-summary{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px;font-size:12px;color:#70776f}
.hero-source-export{border:0;background:transparent;color:#40513d;text-decoration:underline;font-size:12px;padding:4px}
.hero-source-list{padding:12px 14px 24px;overflow:auto;display:grid;gap:10px;background:#f6f3ee}
.hero-source-card{background:white;border:1px solid #e8e2d9;border-radius:16px;padding:13px;display:grid;gap:10px}
.hero-source-card-top{display:flex;gap:10px;justify-content:space-between;align-items:flex-start}
.hero-source-card h3{font-size:15px;line-height:1.4;margin:0;color:#2d382f}
.hero-source-meta{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:5px;font-size:10px;color:#777f78}
.hero-source-badge{display:inline-flex;align-items:center;border-radius:999px;padding:4px 7px;font-size:10px;font-weight:700}
.hero-source-badge.need{background:#fff0df;color:#9b5f24}.hero-source-badge.google{background:#eaf1ff;color:#466698}.hero-source-badge.ok{background:#e8f2e9;color:#4a6a4e}
.hero-source-review{font-size:10px;color:#776b59;background:#f4efe5;border-radius:999px;padding:4px 7px}
.hero-source-links{display:flex;gap:7px;flex-wrap:wrap}
.hero-source-links a,.hero-source-open,.hero-source-url{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border:1px solid #d9d4ca;background:#fff;color:#40513d;border-radius:10px;padding:8px 9px;font-size:11px;font-weight:600}
.hero-source-links a:first-child{background:#f7f2e8}
.hero-source-decisions{display:flex;gap:6px;flex-wrap:wrap;padding-top:2px}
.hero-source-decision{border:1px solid #ded8cd;background:#faf8f4;color:#5c665d;border-radius:999px;padding:7px 9px;font-size:10px}
.hero-source-decision.is-selected{background:#40513d;color:#fff;border-color:#40513d}
.hero-source-empty{padding:40px 20px;text-align:center;color:#777f78;font-size:13px}
@media(max-width:760px){
 .hero-source-panel{padding:0;align-items:flex-end}.hero-source-sheet{height:92dvh;border-radius:22px 22px 0 0}.hero-source-head{padding:15px 14px 10px}.hero-source-title-row h2{font-size:18px}.hero-source-controls{grid-template-columns:1fr}.hero-source-list{padding:10px 10px 28px}.hero-source-links a,.hero-source-open,.hero-source-url{flex:1 1 auto}.hero-source-card{padding:12px}
}
`;
    document.head.appendChild(style);
  }

  function createPanel(spots){
    const panel=document.createElement('div');
    panel.className='hero-source-panel';
    panel.setAttribute('aria-hidden','true');
    panel.innerHTML=`<section class="hero-source-sheet" role="dialog" aria-modal="true" aria-label="画像ソース監査"><header class="hero-source-head"><div class="hero-source-title-row"><div><small style="font-size:10px;letter-spacing:.12em;color:#8a7e6c">PRIVATE · IMAGE SOURCE AUDIT</small><h2>Google Placesを減らす</h2><p>Googleを呼ばず、公式素材・Wikimedia Commons・Openverseの候補を探せます。候補を見つけても、施設一致と商用利用条件を確認してから採用します。</p></div><button type="button" class="hero-source-close" aria-label="閉じる">×</button></div><div class="hero-source-controls"><input type="search" class="hero-source-search" placeholder="スポット名・地域で検索"><select class="hero-source-sort" aria-label="並び順"><option value="priority">要対応を上に</option><option value="name">名前順</option></select></div><div class="hero-source-filter-row"></div><div class="hero-source-summary"><span class="hero-source-count"></span><button type="button" class="hero-source-export">レビューJSONをコピー</button></div></header><div class="hero-source-list"></div></section>`;
    document.body.appendChild(panel);
    const list=panel.querySelector('.hero-source-list');
    const search=panel.querySelector('.hero-source-search');
    const sort=panel.querySelector('.hero-source-sort');
    const filters=panel.querySelector('.hero-source-filter-row');
    const count=panel.querySelector('.hero-source-count');
    const filterDefs=[['action','要対応'],['needs','静的候補'],['google','Google Places'],['static','静的OK'],['reviewed','確認済み'],['all','すべて']];

    function render(){
      const counts=statusCounts(spots);
      filters.innerHTML=filterDefs.map(([key,label])=>`<button type="button" class="hero-source-filter ${key===currentFilter?'is-active':''}" data-filter="${key}">${label} ${counts[key]}</button>`).join('');
      let rows=spots.map(s=>({spot:s,c:classify(s)})).filter(({spot,c})=>matchesFilter(spot,c.status)&&matchesQuery(spot));
      if(sort.value==='name')rows.sort((a,b)=>String(a.spot.name).localeCompare(String(b.spot.name),'ja'));
      else rows.sort((a,b)=>{
        const weight={needs_static_source:0,google_pinned:1,verified_static:2,existing_static:2};
        return (weight[a.c.status]??9)-(weight[b.c.status]??9)||String(a.spot.name).localeCompare(String(b.spot.name),'ja');
      });
      count.textContent=`${rows.length}件表示 / 全${spots.length}件`;
      const reviews=readReviews();
      list.innerHTML=rows.length?rows.map(({spot,c})=>{
        const urls=searchUrls(spot),review=reviews[spot.spot_id]||{};
        const reviewLabel=review.decision?DECISION_LABELS[review.decision]||review.decision:'';
        return `<article class="hero-source-card" data-spot-id="${escapeHtml(spot.spot_id)}"><div class="hero-source-card-top"><div><h3>${escapeHtml(spot.name)}</h3><div class="hero-source-meta"><span class="hero-source-badge ${c.tone}">${escapeHtml(c.label)}</span>${reviewLabel?`<span class="hero-source-review">確認: ${escapeHtml(reviewLabel)}</span>`:''}<span>${escapeHtml(spot.city||spot.area||spot.prefecture||'')}</span><span>${escapeHtml(c.provider)}</span>${hasPinnedPlace(spot)?'<span>Place ID固定</span>':''}</div></div><button type="button" class="hero-source-open" data-open-spot>Hero監査</button></div><div class="hero-source-links">${urls.official?`<a href="${escapeHtml(urls.official)}" target="_blank" rel="noopener">公式</a>`:''}<a href="${escapeHtml(urls.commons)}" target="_blank" rel="noopener">Commons</a><a href="${escapeHtml(urls.openverse)}" target="_blank" rel="noopener">Openverse</a><button type="button" class="hero-source-url" data-record-url>${review.source_url?'候補URL ✓':'候補URLを記録'}</button></div><div class="hero-source-decisions">${Object.entries(DECISION_LABELS).map(([key,label])=>`<button type="button" class="hero-source-decision ${review.decision===key?'is-selected':''}" data-decision="${key}">${label}</button>`).join('')}</div>${review.source_url?`<div style="font-size:10px;color:#6d746d;word-break:break-all">${escapeHtml(review.source_url)}</div>`:''}</article>`;
      }).join(''):'<div class="hero-source-empty">条件に合うスポットはありません。</div>';

      filters.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{currentFilter=btn.dataset.filter;render();}));
      list.querySelectorAll('.hero-source-card').forEach(card=>{
        const spot=spots.find(s=>s.spot_id===card.dataset.spotId);if(!spot)return;
        card.querySelector('[data-open-spot]')?.addEventListener('click',()=>{
          panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');
          const dock=document.querySelector('.hero-audit-dock');
          const sel=dock?.querySelector('#heroAuditSpotSelect'),searchBox=dock?.querySelector('#heroAuditSpotSearch');
          if(searchBox){searchBox.value=spot.name;searchBox.dispatchEvent(new Event('input',{bubbles:true}));}
          if(sel){sel.value=spot.spot_id;sel.dispatchEvent(new Event('change',{bubbles:true}));}
          const openBtn=dock?.querySelector('#heroAuditOpen');if(openBtn)openBtn.click();else if(typeof window.openSpot==='function')window.openSpot(spot.spot_id);
        });
        card.querySelector('[data-record-url]')?.addEventListener('click',()=>{recordUrl(spot);render();});
        card.querySelectorAll('[data-decision]').forEach(btn=>btn.addEventListener('click',()=>{recordDecision(spot.spot_id,btn.dataset.decision);render();}));
      });
    }

    search.addEventListener('input',()=>{currentQuery=search.value;render();});
    sort.addEventListener('change',render);
    panel.querySelector('.hero-source-close').addEventListener('click',()=>{panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');});
    panel.addEventListener('click',e=>{if(e.target===panel){panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');}});
    panel.querySelector('.hero-source-export').addEventListener('click',()=>copyExport(spots));
    panel.openAudit=()=>{render();panel.classList.add('is-open');panel.setAttribute('aria-hidden','false');setTimeout(()=>search.focus(),50);};
    render();
    return panel;
  }

  async function loadVerified(){
    try{
      const url=new URL('verified-image-sources.json',document.baseURI);
      const res=await fetch(url,{cache:'no-store'});
      if(!res.ok)return;
      const data=await res.json();
      if(Array.isArray(data))verified=new Map(data.map(x=>[x.spot_id,x]));
    }catch(_e){}
  }

  async function boot(){
    const spots=window.ODEKAKE_SEED?.spots||[];
    if(!spots.length){setTimeout(boot,150);return;}
    installStyles();
    await loadVerified();
    const panel=createPanel(spots);
    let tries=0;
    const attach=()=>{
      const dock=document.querySelector('.hero-audit-dock');
      if(!dock){if(tries++<80)setTimeout(attach,100);return;}
      if(dock.querySelector('[data-image-source-audit]'))return;
      const btn=document.createElement('button');
      btn.type='button';btn.className='hero-source-btn';btn.dataset.imageSourceAudit='1';btn.textContent='画像ソース';
      btn.addEventListener('click',()=>panel.openAudit());
      const exportBtn=dock.querySelector('#heroAuditExport');
      if(exportBtn)exportBtn.insertAdjacentElement('beforebegin',btn);else dock.appendChild(btn);
    };
    attach();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(window);
