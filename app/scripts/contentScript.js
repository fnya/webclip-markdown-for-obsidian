const selectedBorderStyle = "solid 5px blue";
let currentElement;

// 選択範囲プラス
const plus = () => {
  if (currentElement && currentElement.parentElement !== document.body) {
    currentElement.style.border = "";
    currentElement = currentElement.parentElement;
    currentElement.style.border = selectedBorderStyle;
  }
};

// 選択範囲マイナス
const minus = () => {
  const allowIdsOrClasses = [
    "container",
    "content",
    "wrapper",
    "main",
    "entry",
    "news",
  ];

  if (currentElement.children && currentElement.children.length > 0) {
    let childeElement;

    for (const child of currentElement.children) {
      // id チェック
      if (child.id) {
        allowIdsOrClasses.forEach((allowIdOrClass) => {
          if (child.id.indexOf(allowIdOrClass) !== -1) {
            childeElement = child;
          }
        });
      }
      // class チェック
      if (child.className) {
        allowIdsOrClasses.forEach((allowIdOrClass) => {
          if (child.className.indexOf(allowIdOrClass) !== -1) {
            childeElement = child;
          }
        });
      }

      if (childeElement) {
        break;
      }
    }

    if (!childeElement) {
      return;
    }

    currentElement.style.border = "";
    currentElement = childeElement;
    currentElement.style.border = selectedBorderStyle;
  }
};

// URL が画像かどうかを判定する
const isImage = async (url) => {
  try {
    let response = await fetch(url, { method: "HEAD" });
    let contentType = response.headers.get("content-type");

    // SVG は対象外
    if (contentType && contentType.startsWith("image/svg")) {
      return false;
    }

    return contentType && contentType.startsWith("image/");
  } catch (error) {
    console.error(error);
    return false;
  }
};

// 画像の情報を取得する
const getImageInfomaion = (node) => {
  let imageUrl = "";

  if (node.attributes["data-src"] && node.attributes["data-src"].value !== "") {
    imageUrl = node.attributes["data-src"].value;
  }
  if (node.attributes["src"] && node.attributes["src"].value !== "") {
    imageUrl = node.attributes["src"].value;
  }

  let alt;
  if (node.attributes["alt"] && node.attributes["alt"].value !== "") {
    alt = node.attributes["alt"].value;
  } else {
    alt = "image";
  }

  return { imageUrl, alt };
};

// 画像のサイズを取得する
const getImageWidth = (node) => {
  let width;

  if (node.attributes["width"] && node.attributes["width"].value > 0) {
    width = node.attributes["width"].value;
  } else if (node.style.width) {
    width = node.style.width;
  } else if (node.offsetWidth && node.offsetWidth > 0) {
    width = node.offsetWidth;
  }

  return width;
};

// タイトルの正規化を行う
const getTitle = () => {
  return (
    document.title
      // for Mac
      .replaceAll(":", " ")
      .replaceAll(".", " ")
      // for Windows
      .replaceAll("¥", " ")
      .replaceAll("/", " ")
      .replaceAll("*", " ")
      .replaceAll("?", " ")
      .replaceAll("<", " ")
      .replaceAll(">", " ")
      .replaceAll("|", " ") // OneDrive, too
  );
};

// 前ゼロ埋め
const paddingZero = (num, paddingLength) => {
  return ("0".repeat(paddingLength) + num.toString()).slice(paddingLength * -1);
};

// Obsidian のヘッダーを作成する
const createObsidianHeader = (message) => {
  const saveTags = message.tags
    .split(",")
    .map((tag) => `${tag.trim()}`)
    .filter((tag) => tag !== "")
    .map((tag) => `"#${tag}"`)
    .join(",");

  const now = new Date();
  return (
    "---\n" +
    "Cliped: " +
    now.getFullYear() +
    "-" +
    paddingZero(now.getMonth() + 1, 2) +
    "-" +
    paddingZero(now.getDate(), 2) +
    " " +
    paddingZero(now.getHours(), 2) +
    ":" +
    paddingZero(now.getMinutes(), 2) +
    "\n" +
    "Source: " +
    document.URL +
    "\n" +
    `Tags: [${saveTags}]\n` +
    "---\n\n"
  );
};

// メッセージのエラーをチェックする
const hasMessageError = (message) => {
  if (message.vault === "") {
    alert("Please set the vault name.");
    return true;
  }
  if (message.defaultFolder === "") {
    alert("Please set the default folder name.");
    return true;
  }

  return false;
};

// bookmark 処理を行う
const bookmark = (message) => {
  // エラーチェック
  if (hasMessageError(message)) {
    return;
  }

  // タイトルを取得する
  const title = getTitle();

  // Obsidian に渡すデータを作成する
  const fileContent = createObsidianHeader(message);

  // Obsidian を起動する
  document.location.href =
    "obsidian://new?" +
    "&content=" +
    encodeURIComponent(fileContent) +
    "&vault=" +
    encodeURIComponent(message.vault) +
    "&file=" +
    encodeURIComponent(message.defaultFolder + "/") +
    encodeURIComponent(title);
};

// clip ボタンのコールバック
const clip = async (message) => {
  // エラーチェック
  if (hasMessageError(message)) {
    return;
  }

  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
  });

  turndownService.addRule("iframeTagsReplace", {
    filter: ["iframe"],
    replacement: (content, node) => {
      // Twitter の埋め込み URL を返す
      if (
        node.attributes["src"] &&
        node.attributes["src"].value.indexOf("twitter.com") !== -1 &&
        node.attributes["data-tweet-id"]
      ) {
        return `![][https://twitter.com/i/web/status/${node.attributes["data-tweet-id"].value}]`;
      }

      return "";
    },
  });

  // img タグはルールを使わないと変換できない
  // https://github.com/mixmark-io/turndown/issues/241
  turndownService.addRule("imageTagsReplace", {
    filter: ["img"],
    replacement: (content, node) => {
      if (node.attributes["loading"]) {
        node.removeAttribute("loading");
      }

      const imgae = getImageInfomaion(node);
      const width = getImageWidth(node);

      if (width) {
        return `![${imgae.alt}|${width}](${getCorrectUrl(imgae.imageUrl)})`;
      }
      if (imgae.alt) {
        return `![${imgae.alt}](${getCorrectUrl(imgae.imageUrl)})`;
      }

      return `![image](${getCorrectUrl(imgae.imageUrl)})`;
    },
  });

  turndownService.addRule("ancherTagsReplace", {
    filter: ["a"],
    replacement: (content, node) => {
      const href = node.attributes["href"] ? node.attributes["href"].value : "";

      let response = "";
      const images = node.querySelectorAll("img");
      if (images && images.length > 0) {
        images.forEach((image) => {
          if (image.attributes["loading"]) {
            image.removeAttribute("loading");
          }

          const imageInformation = getImageInfomaion(image);
          const width = getImageWidth(image);

          if (width) {
            response += `\n![${imageInformation.alt}|${width}](${getCorrectUrl(
              imageInformation.imageUrl
            )})\n`;
            if (imageInformation.alt) {
              response += `\n![${
                imageInformation.alt
              }|${width}](${getCorrectUrl(imageInformation.imageUrl)})\n`;
            } else {
              response += `\n![image|${width}](${getCorrectUrl(
                imageInformation.imageUrl
              )})\n`;
            }
          } else {
            response += `\n![${imageInformation.alt}](${getCorrectUrl(
              imageInformation.imageUrl
            )})\n`;
          }
        });
      }

      const alt = node.textContent || "Link";

      return `[${alt}](${getCorrectUrl(href)})${response}`;
    },
  });

  // 不要タグを除外する
  turndownService.remove(["script", "noscript", "head", "footer", "select"]);

  // 非表示要素を除外する
  const allElements = currentElement.querySelectorAll("*");
  const hiddenElements = Array.from(allElements).filter((element) => {
    const style = window.getComputedStyle(element);
    return style.display === "none" || style.visibility === "hidden";
  });
  hiddenElements.forEach((element) => {
    element.remove();
  });

  // Markdown に変換する
  let markdownBody = turndownService.turndown(currentElement.outerHTML);

  // Obsidian に渡すデータを作成する
  const fileContent = createObsidianHeader(message) + markdownBody;

  // タイトルを取得する
  const title = getTitle();

  // Obsidian を起動する
  document.location.href =
    "obsidian://new?" +
    "&content=" +
    encodeURIComponent(fileContent) +
    "&vault=" +
    encodeURIComponent(message.vault) +
    "&file=" +
    encodeURIComponent(message.defaultFolder + "/") +
    encodeURIComponent(title);
};

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
    const slashIndex = document.URL.lastIndexOf("/");
    correctUrl = document.URL.substring(0, slashIndex + 1) + url;
  }

  return correctUrl;
};

// デフォルト要素をセットする
const getCurrentElement = () => {
  // ページの main 要素を取得する
  const idNegative =
    ':not([id*="side"])' +
    ':not([id*="logo"])' +
    ':not([id*="menu"])' +
    ':not([id*="header"])' +
    ':not([id*="ranking"])' +
    ':not([id*="wrap"])' +
    ':not([id*="Wrapper"])' +
    ':not([id*="sub"])' +
    ':not([id*="widget"])' +
    ':not([id*="module"])' +
    ':not([id*="thumbnail"])' +
    ':not([id*="storycard"])' +
    ':not([id*="mhMain"])' +
    ":not(script)";

  const classNegative =
    ':not([class*="side"])' +
    ':not([class*="logo"])' +
    ':not([class*="menu"])' +
    ':not([class*="header"])' +
    ':not([class*="ranking"])' +
    ':not([class*="wrap"])' +
    ':not([class*="Wrapper"])' +
    ':not([class*="sub"])' +
    ':not([class*="widget"])' +
    ':not([class*="module"])' +
    ':not([class*="thumbnail"])' +
    ':not([class*="storycard"])' +
    ':not([class*="mhMain"])' +
    ":not(script)";

  let elements = document.querySelectorAll('[id*="main"]' + idNegative);
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll('[id*="Main"]' + idNegative);
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll("article" + classNegative);
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll('[class*="main"]' + classNegative);
  }
  if (!elements || elements.length === 0) {
    elements = document.getElementsByTagName("main");
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll('[id*="article"]' + idNegative);
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll('[id*="News"]' + idNegative);
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll('[id*="news"]' + idNegative);
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll('[id*="content"]' + idNegative);
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll('[class*="News"]' + classNegative);
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll('[class*="news"]' + classNegative);
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll('[class*="content"]' + classNegative);
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll('[class*="day"]');
  }

  if (elements && elements.length > 0) {
    return elements[0];
  }

  return document.body;
};

// 初期処理を実行する
const initialize = () => {
  // デフォルト要素をセットする
  currentElement = getCurrentElement();
};

// 全体を選択する
const selectAll = () => {
  currentElement.style.border = "";
  currentElement = document.body;
  currentElement.style.border = selectedBorderStyle;
};

// Main 要素を選択する
const selectArticle = () => {
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
  if (message.command === "selectArticle") {
    selectArticle();
  }
  if (message.command === "plus") {
    plus();
  }
  if (message.command === "minus") {
    minus();
  }
  if (message.command === "selectAll") {
    selectAll();
  }
  if (message.command === "clip") {
    if (message.bookmarkSelected) {
      bookmark(message);
    } else {
      clip(message);
    }

    unselect();
  }
  if (message.command === "unselect") {
    unselect();
  }
});

// 初期処理実行制御
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
