// フォントサイズ切替の小サイズ
const AMI_RESULTVIEW_FONTSIZE_SMALL = "16px";
// フォントサイズ切替の中サイズ
const AMI_RESULTVIEW_FONTSIZE_MEDIUM = "24px";
// フォントサイズ切替の大サイズ
const AMI_RESULTVIEW_FONTSIZE_LARGE = "32px";

// 結果表示画面全体のHTML要素
let amivoiceApiSampleResultViewDialogElement = null;
// 結果表示画面の結果表示部分のHTML要素
let amivoiceApiSampleResultViewElement = null;
// 結果表示画面の認識途中結果表示部分のHTML要素
let amivoiceApiSampleResultUpdatedViewElement = null;

// 結果画面の自動スクロールの有無
const ResultViewSetting = {
    isAutoScroll: true
}

/**
 * Traceメッセージのマスク処理です。
 * @param {string} message メッセージ 
 */
function maskTraceMessage(message) {
    return message.replace(/authorization=\w+/, "authorization=XXXX");
}

/**
 * 結果表示画面全体のHTML要素を取得します。
 * @returns HTMLエレメント
 */
function getResultViewDialog() {
    return amivoiceApiSampleResultViewDialogElement;
}

/**
 * 結果表示画面の結果表示部分のHTML要素を取得します。
 * @returns HTMLエレメント
 */
function getResultViewElement() {
    return amivoiceApiSampleResultViewElement;
}

/**
 * 結果表示画面の認識途中結果表示部分のHTML要素を取得します。
 * @returns HTMLエレメント
 */
function getResultUpdatedElement() {
    return amivoiceApiSampleResultUpdatedViewElement;
}

/**
 * 結果表示画面を作成します。
 * @returns 結果表示画面全体のHTMLエレメント
 */
function createResultViewDialog() {
    amivoiceApiSampleResultViewDialogElement = document.createElement("div");
    amivoiceApiSampleResultViewDialogElement.style.backgroundColor = "rgba(0,0,0,0.7)";
    amivoiceApiSampleResultViewDialogElement.style.height = "0px";
    amivoiceApiSampleResultViewDialogElement.style.width = "96%";
    amivoiceApiSampleResultViewDialogElement.style.transform = "translateX(2%)";
    amivoiceApiSampleResultViewDialogElement.style.position = "fixed";
    amivoiceApiSampleResultViewDialogElement.style.zIndex = "99999";
    amivoiceApiSampleResultViewDialogElement.style.border = "0px";
    amivoiceApiSampleResultViewDialogElement.style.textAlign = "left";
    amivoiceApiSampleResultViewDialogElement.style.color = "white";
    amivoiceApiSampleResultViewDialogElement.style.fontSize = "24px";
    amivoiceApiSampleResultViewDialogElement.style.fontFamily = "'Hiragino Kaku Gothic ProN', 'Helvetica', 'Verdana', 'Lucida Grande', 'ヒラギノ角ゴ ProN', sans-serif";
    amivoiceApiSampleResultViewDialogElement.style.borderRadius = "10px";
    amivoiceApiSampleResultViewDialogElement.style.height = "25%";
    amivoiceApiSampleResultViewDialogElement.style.overflow = "hidden";
    amivoiceApiSampleResultViewDialogElement.style.top = "70%";
    amivoiceApiSampleResultViewDialogElement.style.resize = "both";
    amivoiceApiSampleResultViewDialogElement.style.maxWidth = "100%";
    amivoiceApiSampleResultViewDialogElement.style.maxHeight = "100%";

    const headerElement = document.createElement("div");
    headerElement.style.height = "12px";
    amivoiceApiSampleResultViewDialogElement.appendChild(headerElement);

    amivoiceApiSampleResultViewElement = document.createElement("div");
    amivoiceApiSampleResultViewElement.style.overflow = "auto";
    // ヘッダ分マイナス
    amivoiceApiSampleResultViewElement.style.height = "calc(100% - 12px)";

    amivoiceApiSampleResultUpdatedViewElement = document.createElement("div");
    amivoiceApiSampleResultUpdatedViewElement.style.textDecoration = "underline";
    amivoiceApiSampleResultUpdatedViewElement.style.textDecorationStyle = "dotted";
    amivoiceApiSampleResultUpdatedViewElement.setAttribute("translate", "no");
    amivoiceApiSampleResultViewElement.appendChild(amivoiceApiSampleResultUpdatedViewElement);

    amivoiceApiSampleResultViewDialogElement.appendChild(amivoiceApiSampleResultViewElement);

    document.body.appendChild(amivoiceApiSampleResultViewDialogElement);
    setDraggableElement(amivoiceApiSampleResultViewDialogElement, headerElement);

    return amivoiceApiSampleResultViewDialogElement;
}

/**
 * 透過率切替を実行したcolorを返します。
 * @param {string} color 
 * @returns 切替後のcolor
 */
function getToggleBackgroudColorAlpha(color) {
    if (color === 'undefined' || color === null) {
        return "rgba(0,0,0,0.7)";
    }
    if (color.startsWith("rgba")) {
        let array = color.split(",");
        if (array.length === 4) {
            let alpha = parseFloat(array[3].trim());
            alpha += 0.1;
            if (alpha > 1) {
                alpha = 0;
            }
            array[3] = alpha + ")";
            return array.join(',');
        }
    } else if (color.startsWith("rgb")) {
        let array = color.split(",");
        if (array.length === 3) {
            array[0] = array[0].replace("rgb", "rgba");
            array[2] = parseFloat(array[2].trim());
            return array.join(',') + ",0)";
        }
    }
    return "rgba(0,0,0,0.7)";
}

/**
 * HTML要素を移動できるよう設定します。
 * @param {object} element HTML要素
 * @param {object} headerElement HTML要素を移動するときにドラッグするヘッダー要素
 */
function setDraggableElement(element, headerElement) {
    let x = 0;
    let y = 0;

    headerElement.onmousedown = onDragStart;
    headerElement.style.cursor = "move";

    /**
     * 移動開始処理
     * @param {object} event 
     */
    function onDragStart(event) {
        event.preventDefault();
        // 最初のマウス位置取得
        x = event.clientX;
        y = event.clientY;

        document.addEventListener("mouseup", onDragEnd);
        document.addEventListener("mousemove", onDragMove);
    }

    /**
     * 移動処理
     * @param {object} event 
     */
    function onDragMove(event) {
        event.preventDefault();

        // 本体の要素の位置を変更
        element.style.left = (element.offsetLeft - (x - event.clientX)) + "px";
        element.style.top = (element.offsetTop - (y - event.clientY)) + "px";

        // 移動後のマウス位置取得
        x = event.clientX;
        y = event.clientY;
    }

    /**
     * 移動終了処理
     */
    function onDragEnd() {
        document.removeEventListener("mouseup", onDragEnd);
        document.removeEventListener("mousemove", onDragMove);
    }
}
