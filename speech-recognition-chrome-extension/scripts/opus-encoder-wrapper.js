// @see https://github.com/chris-rudmin/opus-recorder
var OpusEncoderWrapper = function () {
    /** opus recorderのencodeWorker */
    this.encodeWorker = null;

    /** 入力音声のサンプリングレート */
    this.originalSampleRate = 16000;

    /** エンコーダーのサンプリングレート */
    this.encoderSampleRate = 48000;

    /** Ogg Opusの1ページの最大フレーム数 デフォルト 40 */
    this.maxFramesPerPage = 40;

    /** 複雑度 0～10 */
    this.complexity = 10;

    /** リサンプリングクオリティ 0～10 */
    this.quality = 3;

    /** encode開始済みの場合true */
    this.isStarted = false;

    /** Ogg Opusのデータ */
    this.totalArray = null;

    /** opus recorderのバッファサイズ */
    this.bufferLength = 4096;

    /** 処理完了コールバック。useStreamがfalseもしくはisDebugがtrueのときはOgg Opus全体のデータが渡されます。 function(Uint8Array) */
    this.onCompleted = null;

    /** Ogg Opusのページ作成完了コールバック。ページデータが渡されます。 function(Uint8Array) */
    this.onAvailable = null;

    /** trueの場合、変換結果をソースにしたaudio要素をHTMLに追加します。 */
    this.isDebug = false;

    /** ストリームデータ(ページ)を使用する場合はtrue。 */
    this.useStream = true;

    /** opus recorderのencodeWorkerのOjectURL。Chrome拡張機能用。 */
    this.workerObjectURL = null;
};

/**
 * a, b TypedArray of same type
 * @param {*} a 
 * @param {*} b 
 * @returns 
 */
OpusEncoderWrapper.prototype.concatTypedArrays = function (a, b) {
    var c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
};

/**
 * 初期化を行います。
 */
OpusEncoderWrapper.prototype.initialize = async function () {
    var that = this;

    // Chrome拡張機能用。WebサイトのCSPで制限されている場合は、エラーになります。
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        try {
            const response = await fetch(chrome.runtime.getURL('./lib/opus-recorder/encoderWorker.min.js'));
            const workerJs = await response.text();
            that.workerObjectURL = URL.createObjectURL(new Blob([workerJs], { type: "text/javascript" }));
            that.encodeWorker = new Worker(that.workerObjectURL);
        } catch (e) {
            return false;
        }
    } else {
        that.encodeWorker = new Worker('./lib/opus-recorder/encoderWorker.min.js');
    }
    that.totalArray = new Uint8Array(0);

    that.encodeWorker.postMessage({
        command: 'init',
        encoderSampleRate: that.encoderSampleRate,
        bufferLength: that.bufferLength,
        originalSampleRate: that.originalSampleRate,
        maxFramesPerPage: that.maxFramesPerPage,
        encoderApplication: 2049, // type VOIP 2048,  Full Band Audio 2049, Restricted Low Delay 2051
        encoderFrameSize: 20,
        encoderComplexity: that.complexity,
        resampleQuality: that.quality,
        numberOfChannels: 1,
        encoderBitRate : 24000
    });

    return true;
}

/**
 * encodeWorkerを開始します。
 */
OpusEncoderWrapper.prototype.start = function () {
    var that = this;
    if (!that.encodeWorker) {
        return false;
    }
    if (that.isStarted) {
        return false;
    }
    that.isStarted = true;
    that.encodeWorker.onmessage = function (e) {
        if (e.data.message === "done") {
            //finished encoding - save to audio tag
            if (that.onCompleted) {
                that.onCompleted(that.totalArray);
            }

            that.encodeWorker.terminate();
            that.encodeWorker = null;
            that.isStarted = false;

            // Chrome拡張機能用。
            if (that.workerObjectURL !== null) {
                URL.revokeObjectURL(that.workerObjectURL);
                that.workerObjectURL = null;
            }

            if (that.isDebug) {
                var fileName = new Date().toISOString().replaceAll(/[:.]/g, "") + ".opus";
                var dataBlob = new Blob([that.totalArray], { type: "audio/ogg; codecs=opus" });
                var url = URL.createObjectURL(dataBlob);
                var audio = document.createElement('audio');
                audio.controls = true;
                audio.src = URL.createObjectURL(dataBlob);
                audio.title = fileName;
                var link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.innerHTML = link.download;
                var li = document.createElement('li');
                li.appendChild(link);
                li.appendChild(audio);
                document.body.appendChild(li);
            }
        }
        else if (e.data.message === "page") {
            if (that.isDebug || !that.useStream) {
                that.totalArray = that.concatTypedArrays(that.totalArray, e.data.page);
            }
            if (that.onAvailable) {
                that.onAvailable(e.data.page);
            }
        }
    };

    that.encodeWorker.postMessage({
        command: 'getHeaderPages'
    });
};

/**
 * encodeWorkerを終了させます。
 * @returns 
 */
OpusEncoderWrapper.prototype.stop = function () {
    var that = this;
    if (!that.encodeWorker) {
        return false;
    }
    if (that.isStarted) {
        that.encodeWorker.postMessage({
            command: 'done'
        });
    } else {
        that.encodeWorker.terminate();
        that.encodeWorker = null;

        // Chrome拡張機能用。
        if (that.workerObjectURL !== null) {
            URL.revokeObjectURL(that.workerObjectURL);
            that.workerObjectURL = null;
        }
    }
    return true;
};

/**
 * encodeを実行します。
 * @param {Float32Array} float32PcmData 
 * @returns 
 */
OpusEncoderWrapper.prototype.encode = function (float32PcmData) {
    var that = this;
    if (!that.encodeWorker) {
        return false;
    }
    if (!that.isStarted) {
        return false;
    }
    var bufferLength = Math.min(that.bufferLength, float32PcmData.length);
    for (i = 0; i < float32PcmData.length; i += bufferLength) {
        var tempBuffer = new Float32Array(bufferLength);
        for (j = 0; j < bufferLength; j++) {
            tempBuffer[j] = float32PcmData[i + j];
        }
        that.encodeWorker.postMessage({
            command: 'encode',
            buffers: [tempBuffer]
        }, [tempBuffer.buffer]);
    }

    return true;
};
