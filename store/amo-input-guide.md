# AMO「アドオンの説明」入力ガイド

2026年10月15日作成。SwitchBot Controller 2.0.1、デスクトップ版Firefox 142以上向け。
入力欄の名称・選択肢は提供された画面を基準にしています。

## 1. 名前

```text
SwitchBot Controller
```

## 2. アドオンのURL

末尾は `switchbot-controller` を使用します。使用済みの場合は `switchbot-controller-sasakitz` などへ変更してください。ここはAMO掲載ページのURLであり、GitHubやプライバシーポリシーのURLを入れる欄ではありません。

## 3. 概要

```text
SwitchBotの照明・エアコン・カーテンなどをFirefoxから操作。温湿度などの状態確認、機器の検索・並び替えに対応。利用には対応機器とSwitchBot APIの認証情報が必要です。
```

## 4. 説明

以下をそのまま貼り付けます。

```text
SwitchBot Controllerは、SwitchBotの対応デバイスをFirefoxのポップアップから操作・確認できる拡張機能です。照明、エアコン、カーテン、ロックなどの操作や、温度・湿度などのセンサー情報の確認に対応しています。利用にはSwitchBotの対応機器、SwitchBotアカウント、およびSwitchBot APIのトークンとシークレットが必要です。

主な機能
・対応デバイスの操作と状態確認
・登録機器のカテゴリによる絞り込みと名前検索
・ドラッグや上下ボタンによる機器の並び替えと表示順の保存
・更新ボタンによる最新情報の取得

使い始めるには
1. 拡張機能の設定画面を開きます。
2. SwitchBot APIのトークンとシークレットを入力して保存します。
3. ポップアップを開いてデバイスを操作します。
API認証情報の取得手順は設定画面で確認できます。

データの扱い
認証情報、デバイス一覧のキャッシュ、機器の並び順はブラウザ内に保存します。デバイスの取得・操作に必要なAPIトークン、認証署名、デバイスIDやコマンドなどをSwitchBot公式APIへHTTPSで送信します。シークレット自体は送信せず、ブラウザ内で署名生成に使用します。開発者サーバーへの送信、広告、アクセス解析は行いません。設定画面から保存データを削除できます。

動作環境と制限
・デスクトップ版Firefox 142以上
・SwitchBot APIで利用可能な対応機器と認証情報が必要です。
・利用できる操作・状態情報は機器の種類とAPIの対応状況によって異なります。
・常時バックグラウンド監視は行いません。状態はポップアップの読み込み時や更新時に取得します。
・API認証情報のローカル保存に、本拡張機能独自の暗号化は行っていません。

本拡張機能はSwitchBot公式製品ではありません。
サポート・不具合報告：https://github.com/sasakitz/switchbot-extension/issues
```

## 5. 「このアドオンは実験的です」

通常公開ではチェックしません。ただし、実機での接続・操作をまだ確認しておらず、試験公開として配布する場合はチェックしてください。今回確認済みなのは自動テスト・DOM描画検証・web-ext検証であり、Firefox実機でのSwitchBot操作は未検証です。

## 6. 「課金、有償サービス／ソフトウェア、追加ハードウェアを必要とします」

**チェックします。** 拡張機能自体は無料ですが、SwitchBotの対応機器が必要なためです。有料サブスクリプションが必須という意味ではありません。

## 7. カテゴリ

**「アラート／ステータス」** を選択します。状態確認が最も近い選択肢です。無関係なカテゴリを上限まで選ぶ必要はありません。画面の選択可能数に従ってください。

## 8. サポートメールアドレス

公開してよい、実際に問い合わせを受け取れるメールアドレスを入力します。現時点の資料に公開用アドレスはありません。任意欄なら空欄とし、次のサポートサイトを設定してください。必須の場合は自身の連絡先を入力します。架空のアドレスは使用しません。

## 9. サポートサイト

```text
https://github.com/sasakitz/switchbot-extension/issues
```

## 10. ライセンス

READMEのライセンス表記に合わせて **「MIT License」** を選択します。

## 11. 「このアドオンにはプライバシーポリシーがあります」

**チェックします。** SwitchBot APIへ情報を送信するため、ポリシーが必要です。
チェック後に本文欄が表示されたら、次の本文を貼り付けます。

注意：公開URLの取得結果では2026年4月4日版が表示され、「第三者へ送信しない」と記載されていました。URLを入力する欄の場合は、公開ページをローカル最新版 `store/privacy-policy.html` に更新し、反映を確認してから使用してください。

公開URL： https://sasakitz.github.io/switchbot-extension/store/privacy-policy.html

```text
SwitchBot Controller プライバシーポリシー
最終更新日：2026年10月15日

本拡張機能は、SwitchBotデバイスの操作・状態取得に必要な情報を使用します。

保存する情報
ユーザーが入力したSwitchBot APIトークンとシークレット、名称・種類・IDなどを含むデバイス一覧のキャッシュ、および機器の表示順をブラウザのローカルストレージ（browser.storage.localまたはchrome.storage.local）に保存します。これらは認証、デバイス表示、検索、状態取得、操作、表示順の復元に使用します。キャッシュは読み込み時に最大30秒間再利用しますが、期限切れのデータも更新・削除まで保存される場合があります。本拡張機能独自の暗号化保存は行いません。

外部への送信
デバイスの取得・操作のため、SwitchBot公式API（https://api.switch-bot.com）とHTTPSで通信します。APIトークン、HMAC-SHA256認証署名、タイムスタンプ、nonce、対象のデバイスID、コマンドや操作パラメータなどを送信し、デバイス一覧・状態情報を受信します。シークレット自体は送信せず、ブラウザ内で署名生成に使用します。保存した機器の表示順は送信しません。

情報の提供と利用
開発者のサーバーには送信しません。ユーザーの情報を販売せず、広告・アクセス解析や、本拡張機能の目的と無関係な利用は行いません。

削除方法
設定画面の「認証情報を削除」を押すと、本拡張機能が保存したトークン、シークレット、デバイス一覧のキャッシュ、機器の表示順を削除できます。アンインストールによってもローカル保存データが削除されます。SwitchBot側のアカウントやデバイス登録情報は削除されません。

お問い合わせ
https://github.com/sasakitz/switchbot-extension/issues
```

## 12. 審査担当者へのメモ

審査担当者が読みやすい英語案です。そのまま貼り付けられます。

```text
SwitchBot Controller 2.0.1 is an independent extension for controlling and checking SwitchBot devices through the official SwitchBot API v1.1. This submission targets desktop Firefox 142 or later.

Source and build:
All runtime JavaScript is included as readable source in the uploaded ZIP. No transpilation, bundling, minification, obfuscation, or runtime code download is used. No build is required to run the extension. The packaging script only archives the runtime files; it does not transform them.
Project: https://github.com/sasakitz/switchbot-extension

Permissions and data:
The storage permission stores API credentials, the device-list cache, and device order locally. The only API host permission is https://api.switch-bot.com/*.
The API token is transmitted in the Authorization header. The secret is used locally to generate an HMAC-SHA256 signature and is never transmitted directly. Requests also include a timestamp, nonce, and, when applicable, device IDs, commands, and parameters. There is no developer-operated backend, telemetry, advertising, or analytics.
Required data collection is declared as authenticationInfo. Firefox's built-in consent is used.

Changes addressing the previous four validation warnings:
- The minimum Firefox version is now 142, resolving the Android data-consent compatibility warning without adding Android to the intended release platforms.
- Dynamic innerHTML assignments for filter tabs, device rendering, and card refresh were removed. Templates are parsed in an inert document and recreated with a narrow allowlist using native DOM methods. Scripts, event handlers, URL-bearing elements/attributes, and unsafe styles are not copied into the live document.
- Local web-ext lint reported 0 errors, 0 warnings, and 0 notices for the packaged version.

Testing:
1. Install the extension and open its popup.
2. Without credentials, verify that the setup guidance is shown.
3. Open settings using the gear button.
4. Enter a valid SwitchBot API token and secret, then use the connection test and save the credentials.
5. Open the popup to retrieve registered devices. Check name search, category filtering, and reordering (at least two devices are needed for reordering).
6. If suitable test hardware is available, send a command to a test light or curtain and refresh the device status. Avoid operating locks or other safety-sensitive devices for routine testing.
7. Delete credentials in settings to clear the locally stored credentials, device cache, and device order.

Full API testing requires a SwitchBot account with API credentials and compatible devices. This submission does not include test-account credentials. Automated regression and DOM rendering/security checks passed; live SwitchBot operation in Firefox has not yet been verified by the submitter.
```

フル機能の審査用アカウントを用意できる場合は、専用テスト機器だけを登録したアカウントの認証情報と利用手順を、審査担当者向けの非公開欄に追記してください。実際に用意していない認証情報を「提供済み」と書かないでください。

## 13. 「バージョンを登録」

アップロード対象が `switchbot-controller-v2.0.1-amo.zip`、入力内容が上記と一致していることを確認してクリックします。「キャンセルしてバージョンを無効化」は提出を取り消す操作です。

## 参照

- [Mozilla：AMO提出手順](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)
- [Mozilla：安全な拡張機能の作成](https://extensionworkshop.com/documentation/develop/build-a-secure-extension/)

公式説明と画面に選択可能数などの差がある場合は、実際のAMO画面を優先してください。
