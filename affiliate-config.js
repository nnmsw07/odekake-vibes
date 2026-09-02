window.KIBUN_AFFILIATE_CONFIG = {
  enabled: true,
  disclosure: "PR：一部のリンクはアフィリエイト広告を含みます。",
  linkSwitch: {
    enabled: true,
    tagInstalled: true,
    providers: ["ozmall", "ikyu", "ikyu_restaurant", "jalan", "jtb", "yahoo_travel"],
    note: "ValueCommerce LinkSwitch live for Kibun Trip. Asoview is handled manually until provider-specific behavior is verified."
  },
  sourceLinks: {
    "spot_212": [{ provider: "jalan", intent: "stay", scope: "spot", url: "https://www.jalan.net/yad396617/", label: "じゃらんnetで宿泊プランを見る", verified_at: "2026-09-02" }],
    "spot_213": [{ provider: "jalan", intent: "stay", scope: "spot", url: "https://www.jalan.net/yad369086/", label: "じゃらんnetで宿泊プランを見る", verified_at: "2026-09-02" }],
    "spot_214": [{ provider: "ozmall", intent: "stay", scope: "spot", url: "https://www.ozmall.co.jp/travel/stay/1186/", label: "OZmallで宿泊プランを見る", verified_at: "2026-09-02" }],
    "spot_215": [{ provider: "jalan", intent: "stay", scope: "spot", url: "https://www.jalan.net/yad365401/", label: "じゃらんnetで宿泊プランを見る", verified_at: "2026-09-02" }],
    "spot_217": [{ provider: "jalan", intent: "stay", scope: "spot", url: "https://www.jalan.net/yad322559/", label: "じゃらんnetで宿泊プランを見る", verified_at: "2026-09-02" }],
    "spot_315": [{ provider: "ikyu_restaurant", intent: "food", scope: "spot", url: "https://restaurant.ikyu.com/115431", label: "一休.comレストランで予約を見る", verified_at: "2026-09-02" }],
    "spot_316": [{ provider: "ozmall", intent: "food", scope: "spot", url: "https://www.ozmall.co.jp/restaurant/7870/", label: "OZmallで予約を見る", verified_at: "2026-09-02" }],
    "spot_307": [{ provider: "ozmall", intent: "food", scope: "spot", url: "https://www.ozmall.co.jp/restaurant/8313/", label: "OZmallで予約を見る", verified_at: "2026-09-01" }],
    "spot_308": [{ provider: "ozmall", intent: "food", scope: "spot", url: "https://www.ozmall.co.jp/restaurant/2011/", label: "OZmallで予約を見る", verified_at: "2026-09-01" }],
    "spot_309": [{ provider: "ozmall", intent: "food", scope: "spot", url: "https://www.ozmall.co.jp/restaurant/335/", label: "OZmallで予約を見る", verified_at: "2026-09-01" }],
    "spot_310": [{ provider: "ozmall", intent: "food", scope: "spot", url: "https://www.ozmall.co.jp/restaurant/8915/", label: "OZmallで予約を見る", verified_at: "2026-09-01" }],
    "spot_311": [{ provider: "ozmall", intent: "food", scope: "spot", url: "https://www.ozmall.co.jp/restaurant/10432/", label: "OZmallで予約を見る", verified_at: "2026-09-01" }],
    "spot_312": [{ provider: "ozmall", intent: "food", scope: "spot", url: "https://www.ozmall.co.jp/restaurant/7880/", label: "OZmallで予約を見る", verified_at: "2026-09-01" }],
    "spot_313": [{ provider: "ozmall", intent: "food", scope: "spot", url: "https://www.ozmall.co.jp/restaurant/205/", label: "OZmallで予約を見る", verified_at: "2026-09-01" }],
    "spot_314": [{ provider: "ozmall", intent: "food", scope: "spot", url: "https://www.ozmall.co.jp/restaurant/2010/", label: "OZmallで予約を見る", verified_at: "2026-09-01" }],
    "spot_317": [{ provider: "ozmall", intent: "food", scope: "spot", url: "https://www.ozmall.co.jp/restaurant/1651/", label: "OZmallで予約を見る", verified_at: "2026-09-01" }]
  },
  providerPriority: {
    stay: ["ozmall", "ikyu", "jalan", "jtb", "yahoo_travel"],
    food: ["ozmall", "ikyu_restaurant"],
    experience: ["asoview", "ozmall"]
  },
  providerLabels: {
    ozmall: "OZmall",
    ikyu: "一休.com",
    ikyu_restaurant: "一休.comレストラン",
    jalan: "じゃらんnet",
    jtb: "JTB",
    yahoo_travel: "Yahoo!トラベル",
    asoview: "アソビュー！"
  },
  links: {}
};
