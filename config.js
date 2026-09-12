window.KIBUN_CONFIG = {
  // Kibun API (Cloudflare Worker)
  apiBaseUrl: "https://kibun-api.misawa-nana7.workers.dev",

  // Google Places Hero: 実在施設のHeroは原則Google Placesを優先します。
  // Google側で取得できない場合だけ、既存のlicensed/AI画像へフォールバックします。
  placePhotoEnabled: true,
  placePhotoMode: "prefer_places", // replace_ai_only | prefer_places | off
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

// v20.19.4 mobile mood-card hotfix.
// This intentionally loads after the legacy inline v20.19.3 rules so the approved
// two-card mobile layout wins without changing recommendation logic or content.
(function installMoodCardMobileHotfix(){
  if (typeof document === "undefined") return;
  const STYLE_ID = "mood-card-mobile-v201904";
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
@media (max-width:760px){
  .vibe-group-mood .vibe-grid{
    display:grid!important;
    grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
    gap:12px!important;
    align-items:stretch!important;
    width:100%!important;
    min-width:0!important;
  }
  .vibe-group-mood .mood-card-primary{
    grid-column:1/-1!important;
  }
  .vibe-group-mood .mood-card-secondary{
    grid-column:auto!important;
    display:flex!important;
    flex-direction:column!important;
    position:relative!important;
    box-sizing:border-box!important;
    width:100%!important;
    min-width:0!important;
    height:176px!important;
    min-height:176px!important;
    max-height:176px!important;
    padding:0!important;
    overflow:hidden!important;
    border-radius:20px!important;
  }
  .vibe-group-mood .mood-card-secondary .mood-photo{
    position:relative!important;
    inset:auto!important;
    display:block!important;
    flex:0 0 96px!important;
    width:100%!important;
    height:96px!important;
    min-height:96px!important;
    max-height:96px!important;
    overflow:hidden!important;
    border-radius:20px 20px 0 0!important;
  }
  .vibe-group-mood .mood-card-secondary .mood-photo img{
    width:100%!important;
    height:100%!important;
    object-fit:cover!important;
    object-position:center!important;
    display:block!important;
  }
  .vibe-group-mood .mood-card-secondary .vibe-icon{
    position:absolute!important;
    left:12px!important;
    top:78px!important;
    width:38px!important;
    height:38px!important;
    min-width:38px!important;
    min-height:38px!important;
    padding:8px!important;
    margin:0!important;
    border-radius:50%!important;
    background:#fffdf9!important;
    box-shadow:0 4px 14px rgba(55,45,35,.12)!important;
    z-index:3!important;
  }
  .vibe-group-mood .mood-card-secondary .vibe-icon img{
    width:100%!important;
    height:100%!important;
  }
  .vibe-group-mood .mood-card-secondary .vibe-text{
    display:flex!important;
    flex:1 1 auto!important;
    flex-direction:column!important;
    align-items:flex-start!important;
    justify-content:center!important;
    gap:4px!important;
    box-sizing:border-box!important;
    width:100%!important;
    height:80px!important;
    min-height:80px!important;
    max-height:80px!important;
    padding:20px 12px 9px!important;
    overflow:visible!important;
    text-align:left!important;
  }
  .vibe-group-mood .mood-card-secondary .vibe-name{
    display:-webkit-box!important;
    width:100%!important;
    min-width:0!important;
    font-size:13px!important;
    line-height:1.28!important;
    white-space:normal!important;
    overflow:hidden!important;
    text-overflow:clip!important;
    -webkit-box-orient:vertical!important;
    -webkit-line-clamp:2!important;
  }
  .vibe-group-mood .mood-card-secondary .vibe-desc{
    display:block!important;
    width:100%!important;
    min-width:0!important;
    margin:0!important;
    font-size:9.5px!important;
    line-height:1.3!important;
    white-space:nowrap!important;
    overflow:hidden!important;
    text-overflow:ellipsis!important;
  }
}
`;
  document.head.appendChild(style);
})( );
