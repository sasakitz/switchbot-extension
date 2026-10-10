# ストア掲載素材

Chrome Web Store向け。2026年10月11日に、現在のUIから作成しました。
審査提出の操作順は [submission-guide.md](submission-guide.md) を参照してください。
最新の素材は **`store/kit/`**、提出用のまとめは **`store/switchbot-store-listing-kit.zip`** です。
従来の `store/screenshots/` と直下の旧プロモーション画像は、今回の提出では使用しません。

## 画像一覧

| 用途 | ファイル | サイズ・形式 |
|---|---|---|
| ストア用アイコン | `kit/icons/store-icon-128x128.png` | 128×128、RGBA PNG、96pxの絵柄＋透明余白 |
| 小型プロモーション | `kit/promotional/promo-tile-440x280.png` | 440×280、RGB PNG |
| マーキー（任意） | `kit/promotional/marquee-1400x560.png` | 1400×560、RGB PNG |
| スクリーンショット1〜5 | `kit/screenshots/*.png` | 各1280×800、RGB PNG、上限5枚 |
| 並び替え・アイコンのプレビュー | `kit/device-order-preview.png`、`kit/device-icons-preview.png` | 確認用。アップロード対象ではない |
| 全体プレビュー | `kit/contact-sheet.png` | 確認用。アップロード対象ではない |
| 拡張機能アイコン | `kit/icons/icon16.png` 等 | 16・32・48・128px。パッケージ用 |

スクリーンショットは番号順に、デバイス一覧、空調、センサー、検索、設定画面を紹介します。
外側の枠・見出しは掲載用のデザインで、内側のUIは現在のHTML・CSS・カード描画コードから生成しています。
デバイス、センサー値、認証情報はサンプルであり、その旨を各画像に明記しています。
設定画面も白いカードと青緑のアクセントに統一しています。カテゴリはサンプル登録機器に属するものだけを表示します。

## 文章

- `kit/text/short-description-ja.txt`：日本語の短い説明（132文字以内）
- `kit/text/description-ja.txt`：日本語の詳細説明
- `kit/text/short-description-en.txt`、`description-en.txt`：英語の参考原稿。UIの英語化は含まない
- `kit/text/release-notes-ja.txt`：今回の更新内容
- [listing.md](listing.md)：掲載順、カテゴリ候補とリンク
- [review-submission.md](review-submission.md)：単一目的、権限用途、データの扱い、審査担当者向け手順
- [submission-guide.md](submission-guide.md)：本体ZIPの作成、Dashboardへの入力、審査提出と公開の手順
- [privacy-policy.html](privacy-policy.html)：実装と整合させたポリシーの修正版

APIトークンなどのSwitchBot公式APIへの送信を明記し、「常時リアルタイム監視」「拡張機能独自の暗号化保存」といった未実装の機能は掲載文に含めていません。

## 再生成

必要なものは Node.js 22以上、Python 3＋Pillow、ローカルのChromeです。
ネットワークや実アカウントを使わずに生成します。

```bash
node icons/build-icons.js
node --experimental-default-type=module store/build-assets.mjs
python store/render-assets.py
python store/package-assets.py
```

Chromeのパスを指定する場合は `python store/render-assets.py --chrome /path/to/chrome` を使用します。
HTMLソースは `kit/source/` に保存され、生成済み画像の文言・配置を再現できます。
`build-assets.mjs` はポップアップの実コードと登録機器のカテゴリ生成処理を参照するので、UI変更後は再生成してください。
描画用Chromeは一時プロファイルを使用し、名前解決を無効にして外部通信を抑制します。ユーザーのChromeプロファイルは使用しません。

ZIPを展開した場合は、以下のファイル案内の `kit/` 接頭辞を省いたパスで参照してください。

ZIPには画像・本文・提出資料を同梱します。HTMLソースと再生成スクリプトはリポジトリ側に残します。
このZIPは **掲載素材用** であり、拡張機能パッケージとしてDashboardにアップロードするファイルではありません。

## 公開時に必要な作業

現時点ではローカルで素材を作成しただけです。
GitHub Pagesにある公開ポリシーは旧版なので、修正版の公開が必要です。
拡張機能をアップデートする場合は、公開済み版より新しいバージョンのパッケージも別途用意してください。
今回のリリース用manifestは2.0.0です。Chrome Web Storeへのアップロード、審査提出、公開は行っていません。

## 要件の参照先

- [Chrome Web Store：画像の要件](https://developer.chrome.com/docs/webstore/images)
- [掲載情報の入力](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)
- [プライバシー項目の入力](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)

寸法とアイコン余白の指定は公式資料を確認しています（2026年10月11日）。
