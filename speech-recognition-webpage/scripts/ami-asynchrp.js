var AsyncHrp = function () {
    /** APIエンドポイント */
    this.serverUrl = "https://acp-api-async.amivoice.com/v1/recognitions";

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

    /** 感情解析 */
    this.sentimentAnalysis = false;

    /** ジョブ状態取得インターバル(ミリ秒) */
    this.checkJobStatusInterval = 30000;

    /** 処理経過コールバック function(message, sessionId) */
    this.onProgress = null;

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
AsyncHrp.prototype.postJob = function (appKey, audioFile) {
    var that = this;
    var fd = new FormData();
    var domain = "grammarFileNames=" + that.engineMode +
        (that.loggingOptOut ? " loggingOptOut=True" : "") +
        (that.keepFillerToken ? " keepFillerToken=1" : "") +
        (that.profileWords.length > 0 ? " profileWords=" + encodeURIComponent(that.profileWords) : "") +
        (that.speakerDiarization ? " speakerDiarization=True" : "") +
        (that.sentimentAnalysis ? " sentimentAnalysis=True" : "");

    fd.append("d", domain);
    fd.append("u", appKey);
    fd.append("a", audioFile);

    var httpRequest = new XMLHttpRequest();
    httpRequest.addEventListener("load", function (event) {
        if (event.target.status === 200) {
            var resultJson = JSON.parse(event.target.responseText);
            if (!resultJson.sessionid) {
                if (that.onError) that.onError("Failed to create job - " + resultJson.message, null);
                return;
            }
            if (that.onProgress) that.onProgress("queued", resultJson.sessionid);

            // checkJobStatusInterval後にジョブの状態取得
            setTimeout(function () {
                that.getJobStatus(appKey, resultJson.sessionid);
            }, that.checkJobStatusInterval);
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

    httpRequest.open("POST", that.serverUrl, true);
    httpRequest.send(fd);
};

/**
 * ジョブの状態を取得します
 * @param {string} appKey APPKEY
 * @param {string} sessionId ジョブのセッションID
 */
AsyncHrp.prototype.getJobStatus = function (appKey, sessionId) {
    var that = this;
    var httpRequest = new XMLHttpRequest();
    httpRequest.addEventListener("load", function (event) {
        if (event.target.status === 200) {
            var resultJson = JSON.parse(event.target.responseText);
            if (that.onProgress) that.onProgress(resultJson.status, sessionId);
            if (resultJson.status === "completed") {
                if (that.onCompleted) that.onCompleted(resultJson, sessionId);
            } else if (resultJson.status === "error") {
                if (that.onError) that.onError(resultJson.error_message, sessionId);
            } else {
                // checkJobStatusInterval後にもう一度ジョブの状態取得
                setTimeout(function () {
                    that.getJobStatus(appKey, sessionId)
                }, that.checkJobStatusInterval);
            }
        } else {
            if (that.onError) that.onError(event.target.responseText, sessionId);
        }
    });
    httpRequest.addEventListener("error", function (event) {
        if (that.onError) that.onError("Request error", sessionId);
    });
    httpRequest.addEventListener("abort", function (event) {
        if (that.onError) that.onError("Request abort", sessionId);
    });
    httpRequest.addEventListener("timeout", function (event) {
        if (that.onError) that.onError("Request timeout", sessionId);
    });

    httpRequest.open("GET", that.serverUrl + "/" + sessionId, true);
    httpRequest.setRequestHeader("Authorization", "Bearer " + appKey);
    httpRequest.send();
};
