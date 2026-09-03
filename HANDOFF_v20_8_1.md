# HANDOFF v20.8.1

v20.8.0のInstagram検索リンクがAndroid Chrome等でInstagramホームへリダイレクトされる事象を修正。

- 431スポット維持
- affiliate設定変更なし
- Instagram検索: `/popular/<keyword>/` + Google `site:instagram.com` fallback
- 旧 `/explore/search/keyword/` URLはプロジェクト内のseed/dataから除去
