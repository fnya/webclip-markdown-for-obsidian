const selectedBorderStyle = "solid 5px blue";
let currentElement;
let plusButton;
let minusButoon;
let clipButoon;

// ボタンを作成する
const createButton = (text, top, left, width, height, callback) => {
  const button = document.createElement("button");
  button.innerText = text;
  button.style = `
    position: absolute;
    top: ${top}px;
    left: ${left}px;
    width: ${width}px;
    height: ${height}px;
    margin: 0;
    padding: 0;
    font-size: 12px;`;

  button.addEventListener("click", callback);

  return button;
};

// plus ボタンのコールバック
const plusButtonCallback = () => {
  if (
    currentElement.parentElement &&
    currentElement.parentElement !== document.body
  ) {
    currentElement.style.border = "";
    currentElement.parentElement.style.border = selectedBorderStyle;
    currentElement = currentElement.parentElement;

    // ボタンの位置を取得する
    const rect = currentElement.getBoundingClientRect();
    // ボタン位置を更新する
    plusButton.style.top = rect.top - 8 + "px";
    plusButton.style.left = rect.left + 6 + "px";
    minusButoon.style.top = rect.top - 8 + "px";
    minusButoon.style.left = rect.left + 24 + 7 + "px";
  }
};

// minus ボタンのコールバック
const minusButoonCallback = () => {
  const allowIdsOrClasses = ["container", "content", "wrapper", "main"];

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
    childeElement.style.border = selectedBorderStyle;
    currentElement = childeElement;

    // ボタンの位置を取得する
    const rect = currentElement.getBoundingClientRect();
    // ボタン位置を更新する
    plusButton.style.top = rect.top - 8 + "px";
    plusButton.style.left = rect.left + 6 + "px";
    minusButoon.style.top = rect.top - 8 + "px";
    minusButoon.style.left = rect.left + 24 + 7 + "px";
  }
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
const clip = async (tags, defaultFolder) => {
  const saveTags = tags
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
    replacement: function (content, node) {
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
    replacement: function (content, node) {
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
    replacement: function (content, node) {
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
    "&vault=webclip&file=" +
    encodeURIComponent(defaultFolder + "/") +
    encodeURIComponent(title);
};
