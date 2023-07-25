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
const initialize = () => {
  // デフォルト要素をセットする
  currentElement = getCurrentElement();

  // ボーダーを太くする
  currentElement.style.border = selectedBorderStyle;
};

// 全体を選択する
const selectAll = () => {
  currentElement.style.border = "";
  currentElement = document.body;
  currentElement.style.border = selectedBorderStyle;
};

// Main 要素を選択する
const selectMain = () => {
  currentElement.style.border = "";
  currentElement = getCurrentElement();
  currentElement.style.border = selectedBorderStyle;
};

// unselect メッセージを受け取ったら要素の選択を解除する
const unselect = () => {
  currentElement.style.border = "";
  plusButton.remove();
  minusButoon.remove();
};

// メッセージを受け取った処理を実行する
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "select") {
    initialize();
  }
  if (message.command === "selectMain") {
    selectMain();
  }
  if (message.command === "selectAll") {
    selectAll();
  }
  if (message.command === "clip") {
    clip(message.tags, message.defaultFolder);
    unselect();
  }
  if (message.command === "unselect") {
    unselect();
  }
});
