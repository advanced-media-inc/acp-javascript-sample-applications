/**
 * 設定情報をロードします。
 */
function loadOptions() {
  chrome.storage.local.get(null, (options) => {
    if (typeof options.authorization === 'undefined') {
      options.authorization = "";
    }
    if (typeof options.grammarFileNames === 'undefined') {
      options.grammarFileNames = "-a-general";
    }
    if (typeof options.loggingOptOut === 'undefined') {
      options.loggingOptOut = true;
    }
    if (typeof options.useTrace === 'undefined') {
      options.useTrace = false;
    }
    if (typeof options.useUserMedia === 'undefined') {
      options.useUseMedia = false;
    }
    if (typeof options.useDisplayMedia === 'undefined') {
      options.useDisplayMedia = true;
    }
    if (typeof options.keepFillerToken === 'undefined') {
      options.keepFillerToken = false;
    }
    if (typeof options.profileWords === 'undefined') {
      options.profileWords = "";
    }
    if (typeof options.useTimestamp === 'undefined') {
      options.useTimestamp = false;
    }
    if (typeof options.useSpoken === 'undefined') {
      options.useSpoken = false;
    }
    if (typeof options.useOpusRecorder === 'undefined') {
      options.useOpusRecorder = true;
    }

    document.getElementById('appkey').value = options.authorization;
    document.getElementById('grammarFileNames').value = options.grammarFileNames;
    document.getElementById('loggingOptOut').checked = options.loggingOptOut;
    document.getElementById('useTrace').checked = options.useTrace;
    document.getElementById('useDisplayMedia').checked = options.useDisplayMedia;
    document.getElementById('useUserMedia').checked = options.useUserMedia;
    document.getElementById("useNoTranslate").checked = options.useNoTranslate;
    document.getElementById("keepFillerToken").checked = options.keepFillerToken;
    document.getElementById("profileWords").value = options.profileWords;
    document.getElementById("useTimestamp").checked = options.useTimestamp;
    document.getElementById("useSpoken").checked = options.useSpoken;
    document.getElementById("useOpusRecorder").checked = options.useOpusRecorder;
  });
}

/**
 * 設定情報を保存します。
 */
function saveOptions() {
  const authorization = document.getElementById('appkey').value;
  const grammarFileNames = document.getElementById('grammarFileNames').value;
  const loggingOptOut = document.getElementById('loggingOptOut').checked;
  const useTrace = document.getElementById('useTrace').checked;
  const useDisplayMedia = document.getElementById('useDisplayMedia').checked;
  const useUserMedia = document.getElementById('useUserMedia').checked;
  const useNoTranslate = document.getElementById("useNoTranslate").checked;
  const keepFillerToken = document.getElementById("keepFillerToken").checked;
  const profileWords = document.getElementById("profileWords").value;
  const useTimestamp = document.getElementById("useTimestamp").checked;
  const useSpoken = document.getElementById("useSpoken").checked;
  const useOpusRecorder = document.getElementById("useOpusRecorder").checked;

  const options = {
    authorization: authorization.trim(),
    grammarFileNames: grammarFileNames.trim(),
    loggingOptOut: loggingOptOut,
    useTrace: useTrace,
    useDisplayMedia: useDisplayMedia,
    useUserMedia: useUserMedia,
    useNoTranslate: useNoTranslate,
    profileWords: profileWords,
    keepFillerToken: keepFillerToken,
    useTimestamp: useTimestamp,
    useSpoken: useSpoken,
    useOpusRecorder: useOpusRecorder
  };
  chrome.storage.local.set(options);
  alert("設定を保存しました。");
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('saveButton').addEventListener('click', saveOptions);
