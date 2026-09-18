window.KIBUN_CONFIG = {
  // Kibun API (Cloudflare Worker)
  apiBaseUrl: "https://kibun-api.misawa-nana7.workers.dev",

  // Google Places Hero: AI Heroだけを実写へ差し替えます。
  // 監査済みのlicensed/official写真は維持します。
  placePhotoEnabled: true,
  placePhotoMode: "replace_ai_only", // replace_ai_only | prefer_places | off
  placePhotoMaxConcurrent: 3,

  geoloniaApiBase: "https://japanese-addresses-v2.geoloniamaps.com/api/ja",
  travelEstimateCandidateLimit: 40,

  // ?heroAudit=1 のときだけHero写真監査UIを表示します。
  heroAuditCandidateCount: 10
};

(function resolveKibunApiConfig(cfg){
  const base=String(cfg.apiBaseUrl||"").replace(/\/$/,"");
  cfg.travelApiUrl = cfg.travelApiUrl || (base ? `${base}/travel-times` : "");
  cfg.locationSearchApiUrl = cfg.locationSearchApiUrl || (base ? `${base}/location-search` : "");
  cfg.placePhotoApiUrl = cfg.placePhotoApiUrl || (base ? `${base}/place-photo` : "");
  cfg.placePhotosApiUrl = cfg.placePhotosApiUrl || (base ? `${base}/place-photos` : "");
})(window.KIBUN_CONFIG);

// v20.19.9 regression fix: restore the approved full-bleed supporting mood cards.
(function installKibunUiHotfix(){
  if (typeof document === "undefined") return;
  const STYLE_ID = "kibun-ui-v201909";
  ["mood-card-mobile-v201903","mood-card-mobile-v201904","mood-card-mobile-v201905","kibun-ui-v201906","kibun-ui-v201907","kibun-ui-v201908"].forEach(id=>{
    const old=document.getElementById(id);
    if(old) old.remove();
  });
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
.brand-dot{
  width:13px!important;
  height:13px!important;
  margin-right:19px!important;
  border-radius:50%!important;
  background:#789178!important;
  box-shadow:8px 0 0 #e07d5f,16px 0 0 #d8b95d!important;
}
.mag-top .brand::before{
  width:12px!important;
  height:12px!important;
  margin-right:18px!important;
  border-radius:50%!important;
  background:#789178!important;
  box-shadow:7px 0 0 #e07d5f,14px 0 0 #d8b95d!important;
}
@media (max-width:760px){
  .vibe-group-mood .vibe-grid{
    display:grid!important;
    grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
    gap:10px!important;
    align-items:stretch!important;
    width:100%!important;
    min-width:0!important;
  }
  .vibe-group-mood .mood-card-primary{grid-column:1/-1!important}
  .vibe-group-mood .mood-card-secondary{
    grid-column:auto!important;
    position:relative!important;
    display:block!important;
    box-sizing:border-box!important;
    width:100%!important;
    min-width:0!important;
    height:auto!important;
    min-height:0!important;
    max-height:none!important;
    aspect-ratio:1.38/1!important;
    padding:0!important;
    overflow:hidden!important;
    border:0!important;
    border-radius:18px!important;
    background:#263028!important;
    box-shadow:0 10px 24px rgba(49,54,48,.09)!important;
  }
  .vibe-group-mood .mood-card-secondary .mood-photo{
    position:absolute!important;
    inset:0!important;
    display:block!important;
    width:100%!important;
    height:100%!important;
    min-height:0!important;
    max-height:none!important;
    overflow:hidden!important;
    border-radius:inherit!important;
  }
  .vibe-group-mood .mood-card-secondary .mood-photo img{
    width:100%!important;
    height:100%!important;
    object-fit:cover!important;
    object-position:center!important;
    display:block!important;
  }
  .vibe-group-mood .mood-card-secondary .mood-photo::after{
    content:"";
    position:absolute;
    inset:0;
    background:linear-gradient(180deg,rgba(18,24,19,.02) 24%,rgba(18,24,19,.12) 48%,rgba(18,24,19,.80) 100%);
    pointer-events:none;
    z-index:1;
  }
  .vibe-group-mood .mood-card-secondary .vibe-icon{
    position:absolute!important;
    left:10px!important;
    top:10px!important;
    width:31px!important;
    height:31px!important;
    min-width:31px!important;
    min-height:31px!important;
    padding:6px!important;
    margin:0!important;
    border-radius:50%!important;
    background:rgba(255,253,249,.94)!important;
    border:1px solid rgba(255,255,255,.60)!important;
    box-shadow:0 4px 12px rgba(31,36,31,.12)!important;
    z-index:4!important;
  }
  .vibe-group-mood .mood-card-secondary .vibe-icon img{
    width:100%!important;
    height:100%!important;
  }
  .vibe-group-mood .mood-card-secondary .vibe-text{
    position:absolute!important;
    left:12px!important;
    right:38px!important;
    bottom:11px!important;
    top:auto!important;
    z-index:3!important;
    display:flex!important;
    flex-direction:column!important;
    align-items:flex-start!important;
    justify-content:flex-end!important;
    gap:2px!important;
    width:auto!important;
    height:auto!important;
    min-height:0!important;
    max-height:none!important;
    padding:0!important;
    overflow:visible!important;
    text-align:left!important;
    background:transparent!important;
  }
  .vibe-group-mood .mood-card-secondary .vibe-name{
    display:block!important;
    width:100%!important;
    margin:0!important;
    font-family:Georgia,"Yu Mincho",serif!important;
    font-size:12.5px!important;
    font-weight:600!important;
    line-height:1.22!important;
    letter-spacing:-.035em!important;
    color:#fff!important;
    white-space:normal!important;
    overflow:visible!important;
    text-overflow:clip!important;
    text-shadow:0 1px 10px rgba(0,0,0,.26)!important;
  }
  .vibe-group-mood .mood-card-secondary .vibe-desc{
    display:block!important;
    width:100%!important;
    margin:0!important;
    font-size:7.5px!important;
    line-height:1.25!important;
    color:rgba(255,255,255,.82)!important;
    white-space:nowrap!important;
    overflow:hidden!important;
    text-overflow:ellipsis!important;
    opacity:1!important;
  }
  .vibe-group-mood .mood-card-secondary::after{
    content:"→"!important;
    display:grid!important;
    place-items:center!important;
    position:absolute!important;
    right:9px!important;
    bottom:9px!important;
    top:auto!important;
    width:27px!important;
    height:27px!important;
    border:0!important;
    border-radius:50%!important;
    background:rgba(255,253,249,.95)!important;
    color:#35463a!important;
    font-size:13px!important;
    z-index:4!important;
    box-shadow:0 4px 12px rgba(31,36,31,.12)!important;
  }
  .vibe-group-mood .mood-card-secondary.selected::after{
    background:#40513d!important;
    color:#fff!important;
  }

  /* Selected mood cards keep the photo visible; selection is shown by outline/badge, not a white text panel. */
  .vibe-group-mood .mood-photo-card.selected .vibe-text{
    background:transparent!important;
    background-color:transparent!important;
    color:#fff!important;
  }
  .vibe-group-mood .mood-photo-card.selected .vibe-name{
    color:#fff!important;
    text-shadow:0 1px 10px rgba(0,0,0,.34)!important;
  }
  .vibe-group-mood .mood-photo-card.selected .vibe-desc{
    color:rgba(255,255,255,.88)!important;
    text-shadow:0 1px 8px rgba(0,0,0,.28)!important;
    opacity:1!important;
  }
}
@media (max-width:350px){
  .vibe-group-mood .mood-card-secondary .vibe-name{font-size:11.5px!important}
  .vibe-group-mood .mood-card-secondary .vibe-desc{font-size:7px!important}
}
`;
  document.head.appendChild(style);
})();

// Keep the three editorial hero images pinned to their approved assets.
(function installEditorialHeroPins(){
  if (typeof document === "undefined") return;
  const heroes={
    "indoor-adult-day":"/assets/editorial/v201903/indoor-adult-day.webp",
    "yokohama-after-curtain":"/assets/editorial/v201903/yokohama-after-curtain.webp",
    "whats-on-weekend":"/assets/editorial/v201903/whats-on-weekend.webp"
  };
  function pin(img,src){
    if(!img)return;
    img.removeAttribute("data-hero-clean");
    img.removeAttribute("data-hero-spot");
    img.removeAttribute("referrerpolicy");
    img.src=src;
    img.dataset.editorialHero="v201908";
    img.style.opacity="1";
  }
  function apply(){
    const path=location.pathname.replace(/\/+$/,"");
    Object.entries(heroes).forEach(([slug,src])=>{
      if(path.endsWith(`/magazine/${slug}`)) pin(document.querySelector(".article-hero-media img"),src);
      document.querySelectorAll("a.article-card").forEach(card=>{
        const href=(card.getAttribute("href")||"").replace(/\/+$/,"");
        if(href.endsWith(slug)||href.endsWith(`/magazine/${slug}`)) pin(card.querySelector("img"),src);
      });
    });
    document.querySelectorAll('img[src*="books-and-architecture-v201125.jpg"]').forEach(img=>pin(img,heroes["whats-on-weekend"]));
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});
  else apply();
})();

// v20.19.10: keep the family "親も楽しい日に" collection card on its approved image.
(function installFamilyParentDayHero(){
  if (typeof document === "undefined") return;
  const STYLE_ID="kibun-family-parent-day-v201910";
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=`
.collection-card.family-parent-day{
  background-image:url('/assets/editorial/parents-eat-well.webp')!important;
  background-size:cover!important;
  background-position:center 52%!important;
}
`;
    document.head.appendChild(style);
  }
  function apply(){
    document.querySelectorAll('.collection-card.c4').forEach(card=>{
      const title=card.querySelector('strong')?.textContent?.trim()||'';
      card.classList.toggle('family-parent-day',title==='親も楽しい日に');
    });
  }
  function watch(){
    const grid=document.getElementById('collectionGrid');
    if(!grid)return false;
    apply();
    new MutationObserver(apply).observe(grid,{childList:true,subtree:true});
    return true;
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{
      if(!watch()) apply();
    },{once:true});
  }else if(!watch()){
    apply();
  }
})();

// v20.19.11: Hero audit guard. Keep seed pins visible and export a complete merged pin set.
(function loadHeroAuditGuard(){
  if(typeof document==='undefined') return;
  if(document.querySelector('script[data-kibun-hero-audit-guard]')) return;
  const s=document.createElement('script');
  s.src='/hero-audit-guard.js?v=201911';
  s.defer=true;
  s.dataset.kibunHeroAuditGuard='1';
  document.head.appendChild(s);
})();
