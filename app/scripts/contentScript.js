// 正しい URL を取得する
const getCorrectUrl = (url) => {
  let correctUrl = url;
  const siteUrl = new URL(document.URL);

  // サイトの相対パスの場合は絶対パスに変換する
  if (url.startsWith("//")) {
    correctUrl = `${siteUrl.protocol}${url}`;
  } else if (url.startsWith("/")) {
    correctUrl = `${siteUrl.protocol}//${siteUrl.host}${url}`;
  } else if (
    // ページの相対パスの場合は絶対パスに変換する
    !url.startsWith("http") &&
    !url.startsWith("/")
  ) {
    correctUrl = document.URL + url;
  }

  return correctUrl;
};

// 画像の URL を base64 に変換する
const processMatches = async (matches, markdownBody) => {
  const promises = matches.map(async (match) => {
    const image = await isImage(match);
    if (image) {
      const base64String = await getBase64FromUrl(match);
      return { match, base64String };
    }
    return null;
  });

  const results = await Promise.all(promises);

  let replacedMarkdownBody = markdownBody;

  results.forEach((result) => {
    if (result) {
      replacedMarkdownBody = replacedMarkdownBody.replace(
        result.match,
        result.base64String
      );
    }
  });

  return replacedMarkdownBody;
};

// デフォルト要素をセットする
const getCurrentElement = () => {
  // ページの main 要素を取得する
  let elements = document.querySelectorAll("[id*='main']");
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll('[id*="Main"]');
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll('[id*="News"]');
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll('[class*="main"]');
  }
  if (!elements || elements.length === 0) {
    elements = document.getElementsByTagName("main");
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll('[class*="day"]');
  }

  // デフォルトの要素を設定する
  if (!elements || elements.length > 0) {
    return elements[0];
  }

  return document.body;
};

// 初期処理を実行する
async function initialize() {
  // デフォルト要素をセットする
  currentElement = getCurrentElement();

  // ボーダーを太くする
  currentElement.style.border = selectedBorderStyle;

  // ボタンの位置を取得する
  const rect = currentElement.getBoundingClientRect();

  // plus ボタン作成
  plusButton = createButton(
    "+",
    rect.top - 8,
    rect.left + 6,
    24,
    24,
    plusButtonCallback
  );
  document.body.appendChild(plusButton);

  // minus ボタン作成
  minusButoon = createButton(
    "-",
    rect.top - 8,
    rect.left + 24 + 7,
    24,
    24,
    minusButoonCallback
  );
  document.body.appendChild(minusButoon);
}

// unselect メッセージを受け取ったら要素の選択を解除する
function unselect() {
  currentElement.style.border = "";
  plusButton.remove();
  minusButoon.remove();
}

// select メッセージを受け取ったら要素を選択する
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message === "select") {
    initialize();
    sendResponse({ response: "done" });
  }
});

// メッセージを受け取った処理を実行する
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message === "clip") {
    clip();
    unselect();
    sendResponse({ response: "done" });
  }
  if (message === "unselect") {
    unselect();
    sendResponse({ response: "done" });
  }
});
