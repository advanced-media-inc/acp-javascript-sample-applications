onmessage = (event) => {
    let vtt = "";
    try {
        vtt = jsonToWebVTT(event.data);
    } catch (e) {
        vtt = "WEBVTT\n";
    }
    postMessage(vtt);
}

/**
 * 簡易的に音声認識結果のJSONをWebVTTに変換をします。
 * @param {object} json 
 * @returns WebVTT
 */
function jsonToWebVTT(json) {

    // 動作
    // segmentsと句読点で分割してタイムスタンプとスタイルをつけます。(「、」と「。」は削ります。)
    // 1つのsegmentを句読点で分割したときに1秒未満になる場合は、分割せずに半角スペースを入れます。
    // ただし、前から順にしか見ないので、segmentの末尾は1.2秒未満になる可能性があります。
    // ルビタグがあるところとないところがある場合、ないところにタイムタグの表示が反映されなかったため、すべてにルビタグをつけるようにしています。
    // 話者ダイアライゼーションで付与されるlabelがある場合、ボイスタグとそのスタイルspeaker0～speaker9のみを出力します。
    // 感情解析の結果がある場合、感情解析のみの字幕キューを出力します。

    // メモ
    // 自動挿入された句読点は、writtenしかない場合、spokenが"_"になっている場合があります。
    // 話者ダイアライゼーションが有効でもlabelがつかない単語が存在する場合があります。

    const WEBVTT_STYLE = `
STYLE
::cue(v[voice=speaker0]) {
    color: #ffffff;
}

STYLE
::cue(v[voice=speaker1]) {
    color: #ffd1d1;
}

STYLE
::cue(v[voice=speaker2]) {
    color: #cbf266;
}

STYLE
::cue(v[voice=speaker3]) {
    color: #b4ebfa;
}

STYLE
::cue(v[voice=speaker4]) {
    color: #edc58f;
}

STYLE
::cue(v[voice=speaker5]) {
    color: #87e7b0;
}

STYLE
::cue(v[voice=speaker6]) {
    color: #c7b2de;
}

STYLE
::cue(v[voice=speaker7]) {
    color: #66ccff;
}

STYLE
::cue(v[voice=speaker8]) {
    color: #ffff99;
}

STYLE
::cue(v[voice=speaker9]) {
    color: #87e7b0;
}
`;
    // 字幕キューのスタイル
    const CUE_STYLE = " line:0 align:left";
    // 感情解析結果の字幕キューのスタイル
    const SENTIMENT_CUE_STYLE = " align:right";
    // 字幕キューの最短表示時間
    const MIN_CUE_DISPLAY_TIME = 1200;

    let vtt = "";

    let segments = [];
    if (typeof json.segments !== 'undefined') {
        // 非同期HTTP音声認識APIの音声認識結果の場合
        segments = json.segments;
    } else if (Array.isArray(json)) {
        // WebSocket音声認識APIの音声認識結果を配列にまとめたものの場合
        segments = json;
    } else {
        // 同期HTTP音声認識APIの音声認識結果の場合
        segments = [json];
    }

    let hasLabel = false; // labelがあるかどうか
    let id = 1;

    for (let segment of segments) {

        let tokensByLabel = {};
        let lastLabel = "";

        // segmentをlabelごとに分類
        for (let token of segment.results[0].tokens) {

            // writtenは最低限必要
            if (typeof token.written !== 'undefined') {

                let label = "";
                if (typeof token.label !== 'undefined') {
                    if (!hasLabel) hasLabel = true;
                    label = token.label;
                } else {
                    // labelがない場合、前の単語と同じlabelであるとみなす。
                    if (lastLabel.length > 0) {
                        label = lastLabel;
                    } else {
                        label = "nolabel";
                    }
                }
                if (typeof tokensByLabel[label] === 'undefined') {
                    tokensByLabel[label] = [];
                }

                // 表記の末尾が「？」(全角)で読みの末尾が「_」の場合は、「？」(全角)を後の処理用に別のtokenに分ける。
                if (/.+？$/.test(token.written) && typeof token.spoken !== 'undefined' && /.+_$/.test(token.spoken)) {
                    token.written = token.written.slice(0, -1);
                    token.spoken = token.spoken.slice(0, -1);
                    tokensByLabel[label].push(token);
                    tokensByLabel[label].push({ written: "？" });
                } else {
                    // フィラー単語は表記の前後に「%」があり、この「%」は不要なので削除。
                    if (/^%.+%$/.test(token.written)) {
                        token.written = token.written.replace(/^%(.*)%$/, "$1");
                    }
                    tokensByLabel[label].push(token);
                }

                lastLabel = label;
            }
        }

        // labelごとに処理
        for (let label in tokensByLabel) {

            let startTime = -1;
            let endTime = -1;
            let cueText = "";
            let lastWritten = "";

            for (let token of tokensByLabel[label]) {

                if (typeof token.endtime !== 'undefined') {
                    endTime = token.endtime;
                }

                // 文の区切り文字の場合
                // 日本語は、「、」「。」「？」。
                // 英語の場合、文の区切りではない記号のときは無視したいため、自動挿入された可能性が高いもの(spokenがない、もしくはspokenが"_")。
                if (token.written === "、" || token.written === "。" || token.written === "？"
                    || ((typeof token.spoken === 'undefined' || token.spoken === '_') && /^[,.?!]$/.test(token.written))) {

                    // 次の単語の前にスペースを入れるかどうかの判定用に単語の表記を保存
                    lastWritten = token.written;

                    // 先頭でない場合
                    if (cueText !== "") {
                        // 削除せずに残す文字の場合
                        if (/^[,.?!？]$/.test(token.written)) {
                            cueText += ("<ruby>" + token.written + "</ruby>");
                        }
                        // segmentの途中で字幕キューを分けるケース。
                        if (startTime !== -1 && endTime !== -1 && (endTime - startTime >= MIN_CUE_DISPLAY_TIME)) {
                            if (cueText.indexOf("<v", 0) === 0) {
                                cueText = (cueText.trim() + '</v>');
                            }
                            vtt += toVttCue(id, startTime, endTime, cueText, CUE_STYLE);
                            id++;
                            cueText = "";
                            startTime = -1;
                            endTime = -1;
                            lastWritten = "";
                        }
                    } else {
                        // キューの先頭にある場合は無視
                        lastWritten = "";
                    }

                } else {
                    // 句読点以外の場合は、starttimeとendtime必須にする
                    if (typeof token.starttime !== 'undefined' && typeof token.endtime !== 'undefined') {

                        // 末尾が数字またはアルファベット、,.?!:;の単語と先頭がアルファベットの単語の間にスペースを入れる
                        if ((lastWritten.length > 0) && /[a-zA-Z0-9,.?!:;]$/.test(lastWritten) && /^[a-zA-Z]/.test(token.written)) {
                            cueText += " ";
                        }

                        // 次の単語の前にスペースを入れるかどうかの判定用に単語の表記を保存
                        lastWritten = token.written;

                        // 字幕キューの開始
                        if (cueText === "") {
                            startTime = token.starttime;
                            if (label !== 'nolabel') {
                                // ボイスタグ付与
                                cueText += ("<v " + label + ">");
                            }
                        } else {
                            // タイムスタンプタグ追加
                            cueText += ('<' + msToVttTimestamp(token.starttime) + '>');
                        }

                        let ruby = "";
                        if (typeof token.spoken !== 'undefined') {
                            // ルビを整形
                            ruby = token.spoken.replaceAll(".", "").replaceAll("_", " ").replaceAll(/ {2,}/g, " ").trim();
                        }
                        let written = token.written.replaceAll("_", " ").replaceAll(/ {2,}/g, " ").trim();

                        // 読みがあり、読みと表記が異なっていて、表記がひらがな、カタカナ、「？」、半角スペース以外を含み、数字のみでない場合は、ルビを付与
                        if ((ruby.length > 0) && (written !== ruby)
                            && (written.search(/[^\u3040-\u309f\u30a0-\u30ff？ ]/) !== -1)
                            && !(/^[0-9]+$/.test(written))) {
                            cueText += ('<ruby>' + escapeVTT(written) + '<rt>' + escapeVTT(ruby) + '</rt></ruby>');
                        } else {
                            // タイムスタンプタグが機能するように読みがない場合もrubyタグで囲む
                            cueText += ('<ruby>' + escapeVTT(written) + '</ruby>');
                        }
                    }
                }
            }
            if (cueText !== "") {
                if (cueText.indexOf("<v", 0) === 0) {
                    cueText = (cueText.trim() + '</v>');
                }
                if (startTime === -1) {
                    startTime = 0;
                }
                vtt += toVttCue(id, startTime, Math.max(endTime, startTime + MIN_CUE_DISPLAY_TIME), cueText, CUE_STYLE);
                id++;
            }
        }
    }

    // 感情解析の結果
    let starttimeTemp = 0;
    if (typeof json.sentiment_analysis !== 'undefined') {
        if (typeof json.sentiment_analysis.segments !== 'undefined') {
            for (let segment of json.sentiment_analysis.segments) {
                if (segment.starttime - starttimeTemp > 0) {
                    // 感情解析結果の隙間を補完
                    vtt += toVttCue(id, starttimeTemp, segment.starttime, "ENERGY:000 STRESS:000", SENTIMENT_CUE_STYLE);
                    id++;
                }
                const cueText = "ENERGY:" + segment.energy.toString().padStart(3, '0')
                    + " " + "STRESS:" + segment.stress.toString().padStart(3, '0');
                vtt += toVttCue(id, segment.starttime, segment.endtime, cueText, SENTIMENT_CUE_STYLE);
                id++;
                starttimeTemp = segment.endtime;
            }
        }
    }

    if (hasLabel) {
        vtt = (WEBVTT_STYLE + vtt);
    }

    vtt = ("WEBVTT\n" + vtt);
    return vtt;
}

/**
 * WebVTTの1キューを返します
 * @param {number} id 
 * @param {number} starttime 
 * @param {number} endtime 
 * @param {string} text 
 * @param {string} style 
 * @returns 文字列 
 */
function toVttCue(id, starttime, endtime, text, style) {
    return toVttTimestampLine(id, starttime, endtime, style) + text + "\n";
}

/**
 * WebVTTのエスケープを行います
 * @param {string} value 
 * @returns 文字列
 */
function escapeVTT(value) {
    return value.replaceAll(/ {2,}/g, " ")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").trim();
}

/**
 * WebVTTのタイムスタンプ行を返します
 * @param {number} id 
 * @param {number} starttime 
 * @param {number} endtime 
 * @param {string} style 
 * @returns WebVTTのタイムスタンプ行
 */
function toVttTimestampLine(id, starttime, endtime, style) {
    return ("\n" + id + "\n" + msToVttTimestamp(starttime) + " --> " + msToVttTimestamp(endtime) + style + "\n");
}

/**
 * 簡易的なmsec→hh:mm:ss.ttt(WebVTTのタイムスタンプ)変換を行います
 * @param {number} duration 経過時間ミリ秒
 * @returns hh:mm:ss.ttt形式の文字列
 */
function msToVttTimestamp(duration) {
    const hour = Math.floor(duration / 3600000);
    const minute = Math.floor((duration - 3600000 * hour) / 60000);

    const hh = hour.toString().padStart(2, '0');
    const mm = minute.toString().padStart(2, '0');
    const ms = (duration % 60000).toString().padStart(5, '0');

    return hh + ":" + mm + ":" + ms.slice(0, 2) + "." + ms.slice(2, 5);
}
