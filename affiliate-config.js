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
  links: {
    "spot_212": [{ provider: "jalan", intent: "stay", scope: "area", rawHtml: `<a href="https://px.a8.net/svt/ejp?a8mat=4BAI1K+EJC1IQ+14CS+BW8O2&a8ejpredirect=https%3A%2F%2Fwww.jalan.net%2F140000%2FLRG_141600%2F" rel="nofollow">箱根のホテルを探す</a>\n<img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=4BAI1K+EJC1IQ+14CS+BW8O2" alt="">`, note: "A8.net生成コードをそのまま使用" }],
    "spot_213": [{ provider: "jalan", intent: "stay", scope: "area", rawHtml: `<a href="https://px.a8.net/svt/ejp?a8mat=4BAI1K+EJC1IQ+14CS+BW8O2&a8ejpredirect=https%3A%2F%2Fwww.jalan.net%2F140000%2FLRG_141600%2F" rel="nofollow">箱根のホテルを探す</a>\n<img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=4BAI1K+EJC1IQ+14CS+BW8O2" alt="">`, note: "A8.net生成コードをそのまま使用" }],
    "spot_214": [
      { provider: "ozmall", intent: "stay", scope: "spot", rawHtml: `<a href="https://px.a8.net/svt/ejp?a8mat=4BAI1Q+4J4SJ6+3UQG+BW8O2&a8ejpredirect=https%3A%2F%2Fwww.ozmall.co.jp%2Ftravel%2Fstay%2F1186%2F" rel="nofollow">富士屋ホテルの宿泊予約</a>\n<img border="0" width="1" height="1" src="https://www18.a8.net/0.gif?a8mat=4BAI1Q+4J4SJ6+3UQG+BW8O2" alt="">`, note: "A8.net生成コードをそのまま使用。富士屋ホテル個別ページ。" },
      { provider: "jalan", intent: "stay", scope: "area", rawHtml: `<a href="https://px.a8.net/svt/ejp?a8mat=4BAI1K+EJC1IQ+14CS+BW8O2&a8ejpredirect=https%3A%2F%2Fwww.jalan.net%2F140000%2FLRG_141600%2F" rel="nofollow">箱根のホテルを探す</a>\n<img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=4BAI1K+EJC1IQ+14CS+BW8O2" alt="">`, note: "A8.net生成コードをそのまま使用。個別リンクがない場合の地域fallback。" }
    ],
    "spot_215": [{ provider: "jalan", intent: "stay", scope: "area", rawHtml: `<a href="https://px.a8.net/svt/ejp?a8mat=4BAI1K+EJC1IQ+14CS+BW8O2&a8ejpredirect=https%3A%2F%2Fwww.jalan.net%2F140000%2FLRG_141600%2F" rel="nofollow">箱根のホテルを探す</a>\n<img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=4BAI1K+EJC1IQ+14CS+BW8O2" alt="">`, note: "A8.net生成コードをそのまま使用" }],
    "spot_216": [{ provider: "jalan", intent: "stay", scope: "area", rawHtml: `<a href="https://px.a8.net/svt/ejp?a8mat=4BAI1K+EJC1IQ+14CS+BW8O2&a8ejpredirect=https%3A%2F%2Fwww.jalan.net%2F140000%2FLRG_141600%2F" rel="nofollow">箱根のホテルを探す</a>\n<img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=4BAI1K+EJC1IQ+14CS+BW8O2" alt="">`, note: "A8.net生成コードをそのまま使用" }],
    "spot_217": [{ provider: "jalan", intent: "stay", scope: "area", rawHtml: `<a href="https://px.a8.net/svt/ejp?a8mat=4BAI1K+EJC1IQ+14CS+BW8O2&a8ejpredirect=https%3A%2F%2Fwww.jalan.net%2F140000%2FLRG_141600%2F" rel="nofollow">箱根のホテルを探す</a>\n<img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=4BAI1K+EJC1IQ+14CS+BW8O2" alt="">`, note: "A8.net生成コードをそのまま使用" }]
  }
};
