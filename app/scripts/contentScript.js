const selectedBorderStyle = "solid 5px blue";
let currentElement;

// URL の画像ファイルを Base64 でエンコードする
const getBase64FromUrl = async (url) => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
  });
};

// URL が画像かどうかを判定する
const isImage = async (url) => {
  try {
    let response = await fetch(url, { method: "HEAD" });
    let contentType = response.headers.get("content-type");
    return contentType && contentType.startsWith("image/");
  } catch (error) {
    console.error(error);
    return false;
  }
};

// 画像の情報を取得する
const getImageInfomaion = (node) => {
  let imageUrl = "";

  if (node.attributes["data-src"]) {
    imageUrl = node.attributes["data-src"].value;
  }
  if (node.attributes["src"] && node.attributes["src"].value !== "") {
    imageUrl = node.attributes["src"].value;
  }

  const alt = node.attributes["alt"] ? node.attributes["alt"].value : "image";

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

// clip ボタンのコールバック
const clip = async (message) => {
  const saveTags = message.tags
    .split(",")
    .map((tag) => `#${tag.trim()} `)
    .join(" ");

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
        return `[Tweet Link](https://twitter.com/i/web/status/${node.attributes["data-tweet-id"].value})`;
      }

      return "";
    },
  });

  // img タグはルールを使わないと変換できない
  // https://github.com/mixmark-io/turndown/issues/241
  turndownService.addRule("imageTagsReplace", {
    filter: ["img"],
    replacement: (content, node) => {
      const imgae = getImageInfomaion(node);
      const width = getImageWidth(node);

      if (width) {
        return `![${imgae.alt}|${width}](${getCorrectUrl(imgae.imageUrl)})`;
      }
      return `![${imgae.alt}](${getCorrectUrl(imgae.imageUrl)})`;
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
          const imageInformation = getImageInfomaion(image);
          const alt =
            imageInformation.alt || imageInformation.alt !== ""
              ? imageInformation.alt
              : "Image link";
          response += `\n![${alt}](${getCorrectUrl(
            imageInformation.imageUrl
          )})\n`;
        });
      }

      const alt = node.innerText || "Link";

      return `[${alt}](${getCorrectUrl(href)})${response}`;
    },
  });

  // 不要タグを除外する
  turndownService.remove(["script", "noscript", "footer"]);

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

  // 画像の URL を抽出する
  const imageMatches = markdownBody.match(/https?:\/\/([\w!\?/\-_=\.&%;])+/g);

  // 画像の URL を base64 に変換する
  try {
    if (imageMatches) {
      markdownBody = await processMatches(imageMatches, markdownBody);
    }
  } catch (error) {
    // エラーが出てもそのまま処理を継続する
    console.error(error);
  }

  // Obsidian に渡すデータを作成する
  const fileContent =
    "Source: " +
    document.URL +
    "\n" +
    `Tags: ${saveTags}\n` +
    "\n\n" +
    markdownBody;

  // タイトルの正規化を行う
  const title = document.title
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
    .replaceAll("|", " "); // OneDrive, too

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
  if (message.command === "selectAll") {
    selectAll();
  }
  if (message.command === "clip") {
    clip(message);
    unselect();
  }
  if (message.command === "unselect") {
    unselect();
  }
});
