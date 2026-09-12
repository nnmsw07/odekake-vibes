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

// v20.19.6 UI hotfix.
// 1) Restore the original Kibun Trip three-dot mark: green / coral / yellow.
// 2) Let the two supporting STEP 1 cards use the compact approved proportions.
(function installKibunUiHotfix(){
  if (typeof document === "undefined") return;
  const STYLE_ID = "kibun-ui-v201906";
  ["mood-card-mobile-v201903","mood-card-mobile-v201904","mood-card-mobile-v201905"].forEach(id=>{
    const old=document.getElementById(id);
    if(old) old.remove();
  });
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
/* Original Kibun Trip mark: three separate dots, not the later dark-green center / capsule mark. */
.brand-dot{
  width:9px!important;
  height:9px!important;
  margin-right:12px!important;
  border-radius:50%!important;
  background:#e86b50!important;
  box-shadow:-11px 0 0 #789178,11px 0 0 #d7b34b!important;
}
.mag-top .brand::before{
  width:8px!important;
  height:8px!important;
  margin-right:14px!important;
  border-radius:50%!important;
  background:#e86b50!important;
  box-shadow:-10px 0 0 #789178,10px 0 0 #d7b34b!important;
}

@media (max-width:760px){
  .vibe-group-mood .vibe-grid{
    display:grid!important;
    grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
    gap:10px!important;
    align-items:start!important;
    width:100%!important;
    min-width:0!important;
  }
  .vibe-group-mood .mood-card-primary{
    grid-column:1/-1!important;
  }
  .vibe-group-mood .mood-card-secondary{
    grid-column:auto!important;
    display:grid!important;
    grid-template-columns:1fr!important;
    grid-template-rows:78px 48px!important;
    position:relative!important;
    box-sizing:border-box!important;
    width:100%!important;
    min-width:0!important;
    height:126px!important;
    min-height:126px!important;
    max-height:126px!important;
    padding:0!important;
    overflow:hidden!important;
    border-radius:16px!important;
  }
  .vibe-group-mood .mood-card-secondary .mood-photo{
    position:relative!important;
    inset:auto!important;
    grid-row:1!important;
    display:block!important;
    width:100%!important;
    height:78px!important;
    min-height:78px!important;
    max-height:78px!important;
    overflow:hidden!important;
    border-radius:16px 16px 0 0!important;
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
    left:10px!important;
    top:62px!important;
    width:30px!important;
    height:30px!important;
    min-width:30px!important;
    min-height:30px!important;
    padding:6px!important;
    margin:0!important;
    border-radius:50%!important;
    background:#fffdf9!important;
    border:1px solid #ded8cf!important;
    box-shadow:0 3px 10px rgba(55,45,35,.10)!important;
    z-index:3!important;
  }
  .vibe-group-mood .mood-card-secondary .vibe-icon img{
    width:100%!important;
    height:100%!important;
  }
  .vibe-group-mood .mood-card-secondary .vibe-text{
    grid-row:2!important;
    display:flex!important;
    flex-direction:column!important;
    align-items:flex-start!important;
    justify-content:center!important;
    gap:1px!important;
    box-sizing:border-box!important;
    width:100%!important;
    height:48px!important;
    min-height:48px!important;
    max-height:48px!important;
    padding:12px 28px 6px 10px!important;
    overflow:hidden!important;
    text-align:left!important;
    background:#fffdf9!important;
  }
  .vibe-group-mood .mood-card-secondary .vibe-name{
    display:block!important;
    width:100%!important;
    min-width:0!important;
    margin:0!important;
    font-size:9.4px!important;
    line-height:1.16!important;
    letter-spacing:-.035em!important;
    white-space:nowrap!important;
    overflow:hidden!important;
    text-overflow:ellipsis!important;
  }
  .vibe-group-mood .mood-card-secondary .vibe-desc{
    display:block!important;
    width:100%!important;
    min-width:0!important;
    margin:1px 0 0!important;
    font-size:7px!important;
    line-height:1.2!important;
    white-space:nowrap!important;
    overflow:hidden!important;
    text-overflow:ellipsis!important;
    opacity:.68!important;
  }
  .vibe-group-mood .mood-card-secondary::after{
    right:7px!important;
    bottom:11px!important;
    width:21px!important;
    height:21px!important;
    font-size:14px!important;
  }
}
`;
  document.head.appendChild(style);
})();
