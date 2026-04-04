# Chrome Web Store 審査提出資料

---

## 1. ストア掲載情報

### 拡張機能の名前
```
SwitchBot Controller
```

### カテゴリ
```
Productivity（生産性）
```

### 言語
```
日本語
```

### 短い説明（132文字以内）
```
SwitchBotデバイスをブラウザから操作・監視。照明・エアコン・カーテン・ロック・センサーなどをワンクリックで制御できます。
```

### 詳細説明
```
SwitchBot Controller は、SwitchBot API を使用してスマートホームデバイスをブラウザから直接操作・監視できる拡張機能です。

【主な機能】

● 多様なデバイス対応
照明、エアコン（冷房・暖房・自動）、カーテン、スマートロック、扇風機、プラグ、温湿度計、CO2センサー、動体センサーなど20種類以上のデバイスに対応。

● リアルタイム操作
ツールバーアイコンをクリックするだけで、デバイス一覧がポップアップ表示されます。ワンクリックで電源のオン・オフ、施錠・解錠、カーテンの開閉など即座に操作可能。

● センサー監視
温度・湿度・CO2濃度・電力消費量などをリアルタイムで確認できます。

● デバイス検索・フィルタリング
キーワード検索とカテゴリタブ（ライト・空調・セキュリティ・カーテン・センサー・メディア）でデバイスを素早く見つけられます。

● セキュアな設計
APIキーはブラウザのローカルストレージにのみ保存されます。外部サーバーへの送信は一切ありません。

【使い方】

1. SwitchBotアプリの開発者向けオプションからAPIトークンとシークレットを取得
2. 拡張機能の設定画面でトークンとシークレットを入力・保存
3. ツールバーのアイコンをクリックしてデバイスを操作

【APIキーの取得方法】

1. SwitchBotアプリを開く（iOS / Android）
2. プロフィール → 設定 → アプリバージョンを10回タップ
3. 開発者向けオプションからトークンとシークレットをコピー

※ SwitchBot API の利用には SwitchBot アカウントが必要です。
※ API のレート制限は 10,000回/日 です。
```

---

## 2. Single Purpose（単一目的）の説明

> Developer Dashboard →「Why does your extension need these permissions?」欄

```
This extension allows users to control and monitor their SwitchBot smart home devices directly from the browser toolbar using the official SwitchBot API v1.1.
```

---

## 3. 権限の使用目的の説明

### `storage`
> 「Describe why your extension requires the storage permission」

```
The storage permission is used exclusively to save the user's SwitchBot API token and client secret locally in the browser (chrome.storage.local). This allows users to authenticate with the SwitchBot API without re-entering their credentials each time. No data is sent to any external server other than api.switch-bot.com.
```

### `host_permissions: https://api.switch-bot.com/*`
> 「Describe why your extension requires access to api.switch-bot.com」

```
Access to api.switch-bot.com is required to communicate with the official SwitchBot API v1.1. This API is used to fetch the list of registered devices, retrieve device status (temperature, humidity, power state, etc.), and send control commands (turn on/off, lock/unlock, set temperature, etc.). No other hosts are accessed.
```

---

## 4. プライバシーの取り扱い（Privacy Practices）

### データ収集に関する質問への回答

| 質問 | 回答 |
|---|---|
| Does your extension collect or use any personal or sensitive user data? | **Yes** |
| What data does it collect? | API authentication credentials (token and secret) entered by the user |
| Why is this data needed? | To authenticate requests to the SwitchBot API on behalf of the user |
| Is the data transmitted to a server? | **No** — stored locally only (`chrome.storage.local`) |
| Is the data sold to third parties? | **No** |
| Is the data used for purposes unrelated to the core functionality? | **No** |
| Is the data used to determine creditworthiness or for lending purposes? | **No** |

### データの取り扱いの認定（Certification）
チェックボックスにチェック：
- [x] I certify that the following disclosures are accurate and complete.

### プライバシーポリシー URL
```
https://sasakitz.github.io/switchbot-extension/store/privacy-policy.html
```

---

## 5. リモートコードの使用

| 質問 | 回答 |
|---|---|
| Does your extension use remote code? | **No** |

> すべてのコードは拡張機能パッケージ内に含まれています。`eval()` や外部スクリプトの読み込みは一切行っていません。

---

## 6. コンテンツレーティング

| 項目 | 選択 |
|---|---|
| 対象年齢 | **Everyone（全年齢）** |
| 暴力的コンテンツ | なし |
| 性的コンテンツ | なし |

---

## 7. 配布設定

| 項目 | 選択 |
|---|---|
| 公開設定 | Public（公開） |
| 配布地域 | All regions（全地域） |
| 価格 | Free（無料） |

---

## 8. 提出チェックリスト

提出前に以下を確認してください。

- [ ] `store/switchbot-controller-v1.1.1.zip` をアップロード済み
- [ ] 短い説明文を入力済み（132文字以内）
- [ ] 詳細説明文を入力済み
- [ ] アイコン 128×128 (`icons/icon128.png`) をアップロード済み
- [ ] スクリーンショット 最低1枚（1280×800）をアップロード済み
- [ ] プロモーションタイル 440×280 (`store/promo-tile-440x280.png`) をアップロード済み
- [ ] プライバシーポリシーURLを入力済み
- [ ] 権限の使用目的の説明を入力済み
- [ ] プライバシーの取り扱いの認定にチェック済み
- [ ] カテゴリ「Productivity」を選択済み
