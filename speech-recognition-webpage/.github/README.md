# speech-recognition-webpage
AmiVoice APIの同期HTTP音声認識API、非同期HTTP音声認識API、WebSocket音声認識APIを利用したサンプル。  
下記のソフトウェアを使用しています。
- [Opus Recorder v8.0.5](https://github.com/chris-rudmin/opus-recorder/tree/v8.0.5)
- [amivoice-api-client-library v1.1.11](https://github.com/advanced-media-inc/amivoice-api-client-library/tree/1.1.11)

## About
音声ファイルまたはマイク、システム音の音声認識を行い、認識結果から字幕ファイル(WebVTT形式)を作成します。

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
このWebページは、localhostまたはhttpsでアクセスできる必要があります。
### 同期HTTP音声認識API
1. AmiVoice APIのAPPKEYの設定。
2. 音声ファイルを選択。
3. 「同期HTTP音声認識API実行」ボタンをクリックすると認識が開始します。
4. 音声認識が完了すると結果が表示され、WebVTTが作成されます。
### 非同期HTTP音声認識API
1. AmiVoice APIのAPPKEYの設定。
2. 音声ファイルを選択。
3. 「非同期HTTP音声認識API実行」ボタンをクリックすると認識が開始します。
4. 音声認識が完了すると結果が表示され、WebVTTが作成されます。
### WebSocket音声認識API
1. AmiVoice APIのAPPKEYの設定。
2. 「WebSocket音声認識API開始」ボタンをクリックすると録音と認識が開始します。
3. 音声認識が完了すると、結果が表示されます。
4. 「WebSocket音声認識API停止」ボタンをクリックすると録音と認識が終了し、WebVTTが作成されます。

## Reference
- [Opus Recorder](https://github.com/chris-rudmin/opus-recorder)
- [AmiVoice API クライアントライブラリ](https://github.com/advanced-media-inc/amivoice-api-client-library)
- [同期 HTTP インタフェース | AmiVoice API マニュアル | AmiVoice Cloud Platform](https://docs.amivoice.com/amivoice-api/manual/user-guide/request/sync-http-interface)
- [非同期 HTTP インタフェース | AmiVoice API マニュアル | AmiVoice Cloud Platform](https://docs.amivoice.com/amivoice-api/manual/user-guide/request/async-http-interface)
- [WebSocket インタフェース | AmiVoice API マニュアル | AmiVoice Cloud Platform](https://docs.amivoice.com/amivoice-api/manual/user-guide/request/websocket-interface)
- [XMLHttpRequest - Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/XMLHttpRequest)
- [BaseAudioContext.decodeAudioData() - Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/BaseAudioContext/decodeAudioData)
- [ChannelMergerNode - Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/ChannelMergerNode)
- [MediaDevices: getDisplayMedia() メソッド - Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/MediaDevices/getDisplayMedia)
- [ウェブワーカーAPI - Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/Web_Workers_API)
- [ウェブビデオテキストトラック形式 (WebVTT) - Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/WebVTT_API)
- [MediaStreamTrackProcessor - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrackProcessor)
- [AudioData - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioData)
