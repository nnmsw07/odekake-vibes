# Kibun V0.17 — Audience-aware UI + Vibe expansion

## UI
- 「気分を重ねる」を **いまの気分 / 今日は何したい？** の2グループへ再編。
- 新しいVibe: `shopping` / `scenic` / `stroll`。
- 同行者 family / partner / solo / friends に応じて推薦枠名、紹介文、推薦理由、詳細画面の着眼点を変更。
- family以外では乳幼児スコア・年齢メモを表示しない。
- Mood Collectionに「買い物して、お茶したい」を追加。

## Data
- 既存83スポットへ shopping / scenic / stroll の編集初期値を追加。
- 大人の休日・街歩き・買い物を補う12スポットを追加し **95スポット**へ。
- 追加: 横浜赤レンガ倉庫 / MARINE & WALK YOKOHAMA / 横浜ハンマーヘッド / 横浜ベイクォーター / 三井アウトレットパーク 横浜ベイサイド / 湘南 T-SITE / 二子玉川ライズ / 代官山 T-SITE / 麻布台ヒルズ / COREDO室町 / メッツァビレッジ / 柏の葉 T-SITE。
- V16監査でユーザーが確定した追加photo indexと7件のGoogle Place IDを正式反映。

## Media
- 新規スポットもGoogle Places Heroを第一候補にする。Workerの変更はなし。

## Tests
- 95件、13 Vibe軸の存在を検証。
- partner × shopping/food/stroll、solo × stroll/culture/relax、family × shopping/relax の推薦を検証。
