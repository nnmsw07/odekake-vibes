window.KIBUN_CONFIG = {
  // Cloudflare Workerをデプロイしたら、この1行だけ設定してください。
  // 例: "https://kibun-api.<your-subdomain>.workers.dev"
  apiBaseUrl: "",

  // Google Places Hero: API接続後はAI Heroだけを実写へ差し替えます。
  // audited licensed/official photos are preserved by default.
  placePhotoEnabled: true,
  placePhotoMode: "replace_ai_only", // replace_ai_only | prefer_places | off
  placePhotoMaxConcurrent: 3,

  geoloniaApiBase: "https://japanese-addresses-v2.geoloniamaps.com/api/ja",
  travelEstimateCandidateLimit: 36
};

(function resolveKibunApiConfig(cfg){
  const base=String(cfg.apiBaseUrl||"").replace(/\/$/,"");
  cfg.travelApiUrl = cfg.travelApiUrl || (base ? `${base}/travel-times` : "");
  cfg.placePhotoApiUrl = cfg.placePhotoApiUrl || (base ? `${base}/place-photo` : "");
})(window.KIBUN_CONFIG);
