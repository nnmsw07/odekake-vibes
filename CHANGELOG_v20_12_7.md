# Kibun v20.12.7 — SNS Threads / fixed UI intro

- SNS Auditの主運用を **Instagram + Threads** に更新。
- Kibun Editorsの投稿案に、Instagram原稿とは別の**Threads向け短文原稿**を自動生成。
- 既存のEditors投稿も、端末保存を壊さずThreads原稿だけ一度補完する移行処理を追加。
- 9月のSNS運用プラン30件を `Instagram + X` から `Instagram + Threads` へ更新。
- 固定投稿用に「**行き先を決める前に、今日の気分を決めよう。**」を追加。
- 固定投稿は2枚構成：1枚目はKibunの思想、2枚目は現在の「誰と過ごす？ → 気分や、やりたいこと → 条件を少しだけ」に近いUI紹介。
- Threadsの初期3本として「サービス紹介」「なぜ作ったか」「使い方」の原稿をSNS Auditに追加。
- UI紹介カードは、現行トップのコンパクトな気分選択UIに合わせて、3列の気分カード＋折りたたみSTEP 3の見せ方へ更新。
- SNS Auditのキャッシュバスターを更新。

## 検証

- `node --check`：`sns-audit/audit.js` / `sns-audit-data.js` / `sns-audit/plan.js` PASS
- `test_v20_12_7_sns_threads_ui.js` PASS
- v20.12.4〜v20.12.6.1 の現行回帰テスト PASS
