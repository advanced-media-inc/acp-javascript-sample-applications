var EasyHrp = function () {
    /** APIエンドポイント */
    this.serverUrl = "https://acp-api.amivoice.com/v1/recognize";

    /** エンジンモード名 */
    this.engineMode = "-a-general";

    /** ログ保存オプトアウト */
    this.loggingOptOut = true;

    /** ユーザー登録単語 */
    this.profileWords = "";

    /** フィラー単語の保持 */
    this.keepFillerToken = false;

    /** 話者ダイアライゼーション */
    this.speakerDiarization = false;

    /** エラー発生コールバック function(message, sessionId) */
    this.onError = null;

    /** 処理完了コールバック function(resultJson, sessionId) */
    this.onCompleted = null;
};

/**
 * ジョブを登録します
 * @param {string} appKey APPKEY(uパラメーター)
 * @param {File} audioFile 音声ファイル(aパラメーター)
 */
EasyHrp.prototype.postJob = function (appKey, audioFile) {
    var that = this;
    const fd = new FormData();
    var domain = "grammarFileNames=" + that.engineMode +
    (that.keepFillerToken ? " keepFillerToken=1" : "") +
    (that.profileWords.length > 0 ? " profileWords=" + encodeURIComponent(that.profileWords) : "") +
    (that.speakerDiarization ? " segmenterProperties=useDiarizer=1" : "");

    fd.append("d", domain);
    fd.append("u", appKey);
    fd.append("a", audioFile);

    var httpRequest = new XMLHttpRequest();
    httpRequest.addEventListener("load", function (event) {
        if (event.target.status === 200) {
            var resultJson = JSON.parse(event.target.responseText);
            if (resultJson.code !== "") {
                if (that.onError) that.onError(resultJson.message, null);
                return;
            }
            if (that.onCompleted) that.onCompleted(resultJson, null);
        } else {
            if (that.onError) that.onError(event.target.responseText, null);
        }
    });
    httpRequest.addEventListener("error", function (event) {
        if (that.onError) that.onError("Request error", null);
    });
    httpRequest.addEventListener("abort", function (event) {
        if (that.onError) that.onError("Request abort", null);
    });
    httpRequest.addEventListener("timeout", function (event) {
        if (that.onError) that.onError("Request timeout", null);
    });

    const url = that.loggingOptOut ? that.serverUrl.replace(new RegExp("^(.+)(/recognize)$"), "$1/nolog$2") : that.serverUrl;
    httpRequest.open("POST", url, true);
    httpRequest.send(fd);
};
