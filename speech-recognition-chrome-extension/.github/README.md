# speech-recognition-chrome-extension
Chrome拡張機能からAmiVoice APIのWebSocket音声認識APIを利用するサンプル。  
下記のソフトウェアを使用しています。
- [Opus Recorder v8.0.5](https://github.com/chris-rudmin/opus-recorder/tree/v8.0.5)
- [amivoice-api-client-library v1.1.11](https://github.com/advanced-media-inc/amivoice-api-client-library/tree/1.1.11)

## About
マイク、システム音の音声認識を行い、認識結果を表示します。

## Article
AmiVoice Tech Blogで詳しく紹介しています。 
https://amivoice-tech.hatenablog.com/

## Requirements
- Windows 10
- Google Chrome または Microsoft Edge
### 開発者の環境
下記の環境で開発、テストを行っています。
- Windows 10 バージョン22H2
- Microsoft Edge バージョン 115.0.1901.203 (公式ビルド) (64 ビット)
- Google Chrome バージョン: 116.0.5845.97（Official Build） （64 ビット）

## How to use
### Microsoft Edge
1. 「拡張機能の管理」画面を表示します。
2. 「開発者モード」を有効にします。
3. 「展開して読み込み」をクリックし、manifest.jsonが置かれたフォルダを選択します。
4. 拡張機能「AmiVoice API Speech Recognition Sample」の設定画面を表示します。
5. AmiVoice APIの「APPKEY」を設定し、「保存」をクリックします。(期限付きのAPPKEYを推奨。)
6. 「https://」で始まる任意のWebページを開きます。
7. 「AmiVoice API Speech Recognition Sample」のポップアップ画面を表示し、「音声認識開始」をクリックします。
### Google Chrome
1. 「拡張機能」画面を表示します。
2. 「パッケージ化されていない拡張機能を読み込む」をクリックし、manifest.jsonが置かれたフォルダを選択します。
3. 拡張機能「AmiVoice API Speech Recognition Sample」の設定画面を表示します。
4. AmiVoice APIの「APPKEY」を設定し、「保存」をクリックします。(期限付きのAPPKEYを推奨。)
5. 「https://」で始まる任意のWebページを開きます。
6. 「AmiVoice API Speech Recognition Sample」のポップアップ画面を表示し、「音声認識開始」をクリックします。

## Reference
- [Opus Recorder](https://github.com/chris-rudmin/opus-recorder)
- [Extensions - Chrome Developers](https://developer.chrome.com/docs/extensions/)
- [AmiVoice API クライアントライブラリ](https://github.com/advanced-media-inc/amivoice-api-client-library)
- [WebSocket インタフェース | AmiVoice API マニュアル | AmiVoice Cloud Platform](https://docs.amivoice.com/amivoice-api/manual/user-guide/request/websocket-interface)
- [MediaDevices: getDisplayMedia() メソッド - Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/MediaDevices/getDisplayMedia)
