# SwitchBot Controller

SwitchBot APIを使用してスマートホームデバイスをブラウザから直接操作・監視できるブラウザ拡張機能です。Chrome・Firefox の両方に対応しています。

[![Chrome Web Storeで入手](https://developer.chrome.com/static/docs/webstore/branding/image/UV4C4ybeBTsZt43U4xis.png)](https://chromewebstore.google.com/detail/switchbot-controller/cbdacfebiphkicmlkopnhkebfagmdejb)

## 機能

- **多様なデバイス対応** — 照明、エアコン、カーテン、ロック、センサーなど20種類以上
- **デバイス操作** — ポップアップからワンクリックで即座にデバイスを操作
- **デバイス検索・フィルタリング** — 登録機器に属するカテゴリだけを表示し、キーワードでも検索
- **並び順のカスタマイズ** — ドラッグ・上下移動・先頭への移動で、よく使う機器を上へ。並び順は自動保存
- **センサー確認** — 温度・湿度・動体検知などを読み込み・更新時に確認
- **認証情報の管理** — APIキーはブラウザ内に保存。デバイスの取得・操作時にSwitchBot公式APIと通信します

## インストール

### Chrome

1. このリポジトリをクローン（またはZIPでダウンロード）
2. `chrome://extensions/` を開く
3. 右上の **デベロッパーモード** をオン
4. **パッケージ化されていない拡張機能を読み込む** をクリックし、このフォルダを選択

### Firefox

1. このリポジトリをクローン（またはZIPでダウンロード）
2. `about:debugging` を開く
3. **このFirefox** → **一時的なアドオンを読み込む**
4. `manifest.json` を選択

> **注意:** Firefox の一時的なアドオンはブラウザを閉じると削除されます。

## セットアップ

1. 拡張機能のアイコンをクリック → 設定（⚙️）を開く
2. SwitchBot APIのトークンとシークレットを入力して保存

### APIキーの取得方法

1. SwitchBotアプリを開く（iOS / Android）
2. 右下の **プロフィール** タブをタップ
3. **設定**（⚙️）→ **アプリバージョン** を10回タップ
4. **開発者向けオプション** が表示されます
5. **トークンをコピー** と **シークレットをコピー** を実行

ポップアップの「検索・絞り込み」を押すと、検索欄とカテゴリを展開できます。
折りたたんでも適用中の条件を表示し、「条件をすべて解除」で検索とカテゴリをまとめてリセットできます。

## 機器の並び替え

ポップアップ右上の「並び替え」を押すと、ドラッグまたは上下の矢印で順番を変更できます。
「先頭へ」のボタンは、機器を全体の一番上に移動します。変更はブラウザ内に自動保存され、
「完了」を押すと通常の操作画面に戻ります。検索・カテゴリで絞り込んだ状態でも並び替えできます。
新しく登録した機器は末尾に追加されます。設定画面で認証情報を削除すると、保存した並び順も削除されます。

## 動作環境

| ブラウザ | 必要バージョン |
|---|---|
| Chrome | 96以上 |
| Firefox（デスクトップ） | 142以上 |

Firefoxでは、SwitchBot APIへの認証情報の送信をインストール時に宣言し、
Firefoxの標準のデータ送信同意機能を使用します。最低バージョンを142に設定し、
AMOのAndroid互換性検証でも同意機能の未対応バージョンが対象にならないようにしています。
AMOへの提出対象はデスクトップ版Firefoxです。

## 使用API

- SwitchBot API v1.1
- レート制限: 10,000回/日

## ファイル構成

```
switchbot-extension/
├── manifest.json        # 拡張機能の設定（Manifest V3）
├── background.js        # アイコン描画用スクリプト（現在はmanifestから未登録）
├── popup/               # ポップアップUI
│   ├── popup.html
│   ├── popup.js
│   ├── device-card.js   # デバイスカードの描画
│   ├── device-config.js # デバイス種別の表示設定
│   ├── filters.js       # 登録機器からカテゴリを生成
│   ├── device-order.js  # 保存済みの順番・絞り込み中の並び替え
│   ├── order-row.js     # 並び替えモードの機器行
│   ├── icons.js         # UI用SVGアイコン
│   └── popup.css
├── options/             # 設定画面
│   ├── options.html
│   ├── options.js
│   └── options.css
├── utils/               # ユーティリティ
│   ├── api.js           # SwitchBot API クライアント
│   ├── storage.js       # 認証情報・デバイスキャッシュの保存
│   └── browser.js       # Chrome/Firefox 互換ポリフィル
├── icons/               # 拡張機能アイコン
└── tests/               # API・保存処理・カード描画の回帰テスト
```

## 開発・検証

Node.js 22以上で、追加パッケージをインストールせずにテストできます。

```bash
node --experimental-default-type=module --test tests/*.test.mjs
```

アイコンのデザインは `icons/design.js` で管理しています。変更後は次のコマンドで
SVG と全サイズの PNG（16・32・48・128px）を再生成できます。

```bash
node icons/build-icons.js
```

`icons/generate.html` をブラウザで開くと、各サイズの確認とダウンロードができます。

変更後はブラウザの拡張機能管理画面で拡張機能を再読み込みしてください。
設定画面の接続テストは、入力中の認証情報を使用し、保存済みの認証情報を上書きしません。

## ライセンス

MIT
