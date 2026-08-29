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
  heroAuditCandidateCount: 6
};

(function resolveKibunApiConfig(cfg){
  const base=String(cfg.apiBaseUrl||"").replace(/\/$/,"");
  cfg.travelApiUrl = cfg.travelApiUrl || (base ? `${base}/travel-times` : "");
  cfg.locationSearchApiUrl = cfg.locationSearchApiUrl || (base ? `${base}/location-search` : "");
  cfg.placePhotoApiUrl = cfg.placePhotoApiUrl || (base ? `${base}/place-photo` : "");
  cfg.placePhotosApiUrl = cfg.placePhotosApiUrl || (base ? `${base}/place-photos` : "");
})(window.KIBUN_CONFIG);
