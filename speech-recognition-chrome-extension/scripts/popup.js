/**
 * 結果画面の表示・非表示を切り替えます。
 */
function toggleResultView() {
  // サイト上で実行されるスクリプト

  // ページが読み込まれた後にChrome拡張機能を更新されたり無効から有効にされると、
  // content_scriptsが使えないようなのでチェック。
  if (typeof Wrp === 'undefined') {
    alert("スクリプトが読み込まれていません。ページを再読み込みしてください。");
    return;
  }

  const resultViewDialog = getResultViewDialog();
  if (!resultViewDialog) {
    createResultViewDialog();
    return;
  }

  if (resultViewDialog.style.display !== "none") {
    resultViewDialog.style.display = "none";
  } else {
    resultViewDialog.style.display = "";
  }
}

/**
 * 結果画面のフォントサイズを切り替えます。
 */
function toggleResultViewFontSize() {
  // サイト上で実行されるスクリプト

  // ページが読み込まれた後にChrome拡張機能を更新されたり無効から有効にされると、
  // content_scriptsが使えないようなのでチェック。
  if (typeof Wrp === 'undefined') {
    alert("スクリプトが読み込まれていません。ページを再読み込みしてください。");
    return;
  }

  const resultViewDialog = getResultViewDialog();
  if (!resultViewDialog) {
    createResultViewDialog();
    return;
  }

  if (resultViewDialog.style.fontSize === AMI_RESULTVIEW_FONTSIZE_SMALL) {
    resultViewDialog.style.fontSize = AMI_RESULTVIEW_FONTSIZE_MEDIUM;
  } else if (resultViewDialog.style.fontSize === AMI_RESULTVIEW_FONTSIZE_MEDIUM) {
    resultViewDialog.style.fontSize = AMI_RESULTVIEW_FONTSIZE_LARGE;
  } else {
    resultViewDialog.style.fontSize = AMI_RESULTVIEW_FONTSIZE_SMALL;
  }
}

/**
 * 結果画面の透明度を切り替えます。
 */
function toggleResultViewAlphaValue() {
  // サイト上で実行されるスクリプト

  // ページが読み込まれた後にChrome拡張機能を更新されたり無効から有効にされると、
  // content_scriptsが使えないようなのでチェック。
  if (typeof Wrp === 'undefined') {
    alert("スクリプトが読み込まれていません。ページを再読み込みしてください。");
    return;
  }

  const resultViewDialog = getResultViewDialog();
  if (!resultViewDialog) {
    createResultViewDialog();
    return;
  }
  resultViewDialog.style.backgroundColor =
    getToggleBackgroudColorAlpha(resultViewDialog.style.backgroundColor);
}

/**
 * 結果画面の自動スクロールのON/OFFを切り替えます。
 */
function toggleAutoScroll() {
  // サイト上で実行されるスクリプト

  // ページが読み込まれた後にChrome拡張機能を更新されたり無効から有効にされると、
  // content_scriptsが使えないようなのでチェック。
  if (typeof Wrp === 'undefined') {
    alert("スクリプトが読み込まれていません。ページを再読み込みしてください。");
    return;
  }
  ResultViewSetting.isAutoScroll = !ResultViewSetting.isAutoScroll;
}

/**
 * WebSocket音声認識APIを開始します。
 */
function startRecognition() {
  // サイト上で実行されるスクリプト

  // ページが読み込まれた後にChrome拡張機能を更新されたり無効から有効にされると、
  // content_scriptsが使えないようなのでチェック。
  if (typeof Wrp === 'undefined') {
    alert("スクリプトが読み込まれていません。ページを再読み込みしてください。");
    return;
  }

  let resultViewElement = getResultViewElement();
  if (!resultViewElement) {
    createResultViewDialog();
    resultViewElement = getResultViewElement();
  }

  const resultUpdatedElement = getResultUpdatedElement();
  if (!resultUpdatedElement) {
    return;
  }

  /**
   * システムログを出力します。
   * @param {string} printMessage 出力内容
   */
  const printSystemMessage = function (printMessage) {
    const date = new Date();
    const systemElement = document.createElement("div");
    const timestamp = "[" + date.toLocaleTimeString() + "] ";
    systemElement.textContent = (timestamp + printMessage);
    systemElement.style.color = "violet";
    resultViewElement.insertBefore(systemElement, resultUpdatedElement);
    resultUpdatedElement.textContent = "";

    // 最新の認識結果が見えるようにスクロールする。
    if (ResultViewSetting.isAutoScroll) {
      setTimeout(function () { resultViewElement.scrollTop = resultViewElement.scrollHeight; }, 200);
    }
  }

  if (Wrp.isActive()) {
    printSystemMessage("既に音声認識サーバーに接続中です。");
    return;
  }

  chrome.storage.local.get(null, (options) => {

    if (typeof options.authorization === 'undefined') {
      printSystemMessage("設定画面でパラメーターの設定を行ってください。");
      return;
    }

    /**
     * 文字列のHTMLエスケープを行います
     * @param {string} s 文字列
     * @returns エスケープした文字列
     */
    function sanitize_(s) {
      return s.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&apos;')
        .replace(/"/g, '&quot;');
    }

    /**
     * 認識完了時の認識結果の出力を行います。
     * @param {string} printMessage 出力内容 
     * @param {string} color フォントカラー
     * @param {boolean} isHtml trueの場合はinnerHTML、それ以外はtextContentに出力
     */
    const printResultFinalized = function (printMessage, color, isHtml) {
      if (printMessage == "") {
        return;
      }

      let message = printMessage;
      if (options.useTimestamp) {
        const date = new Date();
        const timestamp = "[" + date.toLocaleTimeString() + "] ";
        message = timestamp + message;
      }

      resultUpdatedElement.textContent = "";
      const fragment = document.createDocumentFragment();

      if (options.useNoTranslate) {
        // Chromeで翻訳対象外となるようtranslate=noを設定した要素を挿入。
        const noTranslateResultFinalizedElement = document.createElement("div");
        noTranslateResultFinalizedElement.setAttribute("translate", "no");
        if (isHtml) {
          noTranslateResultFinalizedElement.innerHTML = message;
        } else {
          noTranslateResultFinalizedElement.textContent = message;
        }
        noTranslateResultFinalizedElement.style.color = color;
        fragment.appendChild(noTranslateResultFinalizedElement);
      }

      const resultFinalizedElement = document.createElement("div");
      if (isHtml) {
        if (options.useNoTranslate) {
          // ルビを削除
          resultFinalizedElement.innerHTML = message.replaceAll(/<rt>[^<]*<\/rt>/g, '').replaceAll(/<[^>]*>/g, '');
        } else {
          resultFinalizedElement.innerHTML = message;
        }
      } else {
        resultFinalizedElement.textContent = message;
      }
      resultFinalizedElement.style.color = color;
      fragment.appendChild(resultFinalizedElement);

      resultViewElement.insertBefore(fragment, resultUpdatedElement);

      // 最新の認識結果が見えるようにスクロールする。
      if (ResultViewSetting.isAutoScroll) {
        setTimeout(function () { resultViewElement.scrollTop = resultViewElement.scrollHeight; }, 200);
      }
    }

    /**
     * 認識途中結果の出力を行います。
     * @param {string} printMessage 出力内容
     * @param {string} color フォントカラー
     */
    const printResultUpdated = function (printMessage, color) {
      if (resultUpdatedElement.style.color !== color) {
        resultUpdatedElement.style.color = color;
      }
      resultUpdatedElement.textContent = printMessage;

      // 最新の認識結果が見えるようにスクロールする。
      if (ResultViewSetting.isAutoScroll) {
        setTimeout(function () { resultViewElement.scrollTop = resultViewElement.scrollHeight; }, 200);
      }
    }

    /**
     * WebSocket音声認識APIの認識結果JSONからルビ付きHTMLテキストを作成します。
     * @param {object} json 
     * @returns HTML
     */
    const toTextWithRuby = function (json) {
      if (!json.results || !json.results[0]) {
        return json.text;
      }
      let lastWritten = "";
      let resultText = "";
      for (let token of json.results[0].tokens) {
        // フィラー単語の前後の「%」を削除
        if (/^%.+%$/.test(token.written)) {
          token.written = token.written.replace(/^%(.*)%$/, "$1");
        }
        if (lastWritten.length > 0) {
          // 末尾が数字またはアルファベット、?、.、,、!の単語と先頭がアルファベットの単語の間にスペースを入れます。
          if (/[a-zA-Z0-9?.,!]$/.test(lastWritten) && /^[a-zA-Z]/.test(token.written)) {
            resultText += " ";
          }
        }
        // 読みがあり、読みと表記が異なっていて、表記がひらがな、カタカナ、半角スペース、「？」以外を含み、数字のみでない場合は、ルビを付与
        let ruby = "";
        if (typeof token.spoken !== 'undefined') {
          ruby = token.spoken.replaceAll("_", " ").replaceAll(/ {2,}/g, " ").replaceAll(".", "").trim();
        }
        let written = token.written.replaceAll("_", " ").replaceAll(/ {2,}/g, " ").trim();
        if ((ruby.length > 0) && (written !== ruby)
          && (written.search(/[^\u3040-\u309f\u30a0-\u30ff？ ]/) !== -1)
          && !(/^[0-9]+$/.test(written))) {
          resultText += ('<ruby>' + sanitize_(written) + '<rt>' + sanitize_(ruby) + '</rt></ruby>');
        } else {
          resultText += sanitize_(written);
        }
        lastWritten = token.written;
      }
      return resultText;
    }

    Wrp.serverURL = "wss://acp-api.amivoice.com/v1/";
    if (options.loggingOptOut) {
      Wrp.serverURL += "nolog/";
    }
    Wrp.grammarFileNames = options.grammarFileNames;
    Wrp.authorization = options.authorization;
    Wrp.profileWords = options.profileWords;
    Wrp.keepFillerToken = options.keepFillerToken ? 1 : 0;
    Wrp.resultUpdatedInterval = 400;
    Wrp.checkIntervalTime = 600000;
    Recorder.maxRecordingTime = 3600000;
    Recorder.sampleRate = 16000;
    Recorder.downSampling = true;
    Recorder.adpcmPacking = true;
    Recorder.useUserMedia = options.useUserMedia;
    Recorder.useDisplayMedia = options.useDisplayMedia;
    Recorder.useOpusRecorder = options.useOpusRecorder;

    Wrp.TRACE = function (message) {
      if (message.startsWith("ERROR:")) {
        printSystemMessage(message);
      } else if (options.useTrace) {
        console.log(maskTraceMessage(message));
      }
    };

    Wrp.connectStarted = function () {
      printSystemMessage("音声認識サーバー接続中...");
    };

    Wrp.connectEnded = function () {
      printSystemMessage("音声認識サーバー接続完了(音声認識準備完了)。");
    };

    Wrp.disconnectStarted = function () {
      printSystemMessage("音声認識サーバー切断中...");
    };

    Wrp.disconnectEnded = function () {
      printSystemMessage("音声認識サーバー切断完了。");
    };

    Wrp.resultUpdated = function (result) {
      printResultUpdated(JSON.parse(result).text, "white");
    };

    Wrp.resultFinalized = function (result) {
      if (options.useSpoken) {
        printResultFinalized(toTextWithRuby(JSON.parse(result)), "white", true);
      } else {
        printResultFinalized(JSON.parse(result).text, "white", false);
      }
    };

    try {
      Wrp.feedDataResume();
    } catch (e) {
      printSystemMessage(e.message);
    }
  });
}

/**
 * WebSocket音声認識APIを停止させます。
 */
function stopRecognition() {
  // サイト上で実行されるスクリプト

  // ページが読み込まれた後にChrome拡張機能を更新されたり無効から有効にされると、
  // content_scriptsが使えないようなのでチェック。
  if (typeof Wrp === 'undefined') {
    alert("スクリプトが読み込まれていません。ページを再読み込みしてください。");
    return;
  }
  if (Wrp.isActive()) {
    Wrp.feedDataPause();
  }
}

/**
 * content_scriptが使用できない旨のアラートを表示します。
 */
function alertCantWorkScript() {
  alert("「https://」以外のサイトでは使用できません。");
}

// 音声認識開始ボタンのクリックイベント設定
document.getElementById("startButton").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0].url.startsWith("https://")) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: startRecognition
      });
    } else if (tabs[0].url.startsWith("http://")) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: alertCantWorkScript
      });
    }
  });
});

// 音声認識停止ボタンのクリックイベント設定
document.getElementById("stopButton").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0].url.startsWith("https://")) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: stopRecognition
      });
    } else if (tabs[0].url.startsWith("http://")) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: alertCantWorkScript
      });
    }
  });
});

// 画面表示/非表示ボタンのクリックイベント設定
document.getElementById("showResultButton").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0].url.startsWith("https://")) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: toggleResultView,
      });
    } else if (tabs[0].url.startsWith("http://")) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: alertCantWorkScript
      });
    }
  });
});

// フォントサイズ切替ボタンのクリックイベント設定
document.getElementById("toggleFontsizeButton").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0].url.startsWith("https://")) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: toggleResultViewFontSize,
      });
    } else if (tabs[0].url.startsWith("http://")) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: alertCantWorkScript
      });
    }
  });
});

// 自動スクロール切替ボタンのクリックイベント設定
document.getElementById("toggleAutoscrollButton").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0].url.startsWith("https://")) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: toggleAutoScroll,
      });
    } else if (tabs[0].url.startsWith("http://")) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: alertCantWorkScript
      });
    }
  });
});

// 透過率切替ボタンのクリックイベント設定
document.getElementById("toggleAlphavalueButton").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0].url.startsWith("https://")) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: toggleResultViewAlphaValue,
      });
    } else if (tabs[0].url.startsWith("http://")) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: alertCantWorkScript
      });
    }
  });
});

// 設定ボタンのクリックイベント設定
document.getElementById("showOptionsButton").addEventListener("click", async () => {
  chrome.runtime.openOptionsPage(null);
});
