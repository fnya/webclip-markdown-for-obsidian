const selectedBorderStyle = "solid 5px blue";
let currentElement;
let skipClasses = [];

const plus = () => {
  if (currentElement && currentElement.parentElement !== document.body) {
    currentElement.style.border = "";
    currentElement = currentElement.parentElement;
    currentElement.style.border = selectedBorderStyle;
  }
};

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
      if (child.id) {
        allowIdsOrClasses.forEach((allowIdOrClass) => {
          if (child.id.indexOf(allowIdOrClass) !== -1) {
            childeElement = child;
          }
        });
      }
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

const isImage = async (url) => {
  try {
    let response = await fetch(url, { method: "HEAD" });
    let contentType = response.headers.get("content-type");

    if (contentType && contentType.startsWith("image/svg")) {
      return false;
    }

    return contentType && contentType.startsWith("image/");
  } catch (error) {
    console.error(error);
    return false;
  }
};

const getImageInfomaion = (node) => {
  let imageUrl;

  if (node.attributes["data-src"] && node.attributes["data-src"].value !== "") {
    imageUrl = node.attributes["data-src"].value;
  }
  if (
    !imageUrl &&
    node.attributes["src"] &&
    node.attributes["src"].value !== ""
  ) {
    imageUrl = node.attributes["src"].value;
  }
  if (
    !imageUrl &&
    node.attributes["srcset"] &&
    node.attributes["srcset"].value !== ""
  ) {
    imageUrl = node.attributes["srcset"].value;
  }

  let alt;
  if (node.attributes["alt"] && node.attributes["alt"].value !== "") {
    alt = node.attributes["alt"].value;
  } else {
    alt = "image";
  }

  return { imageUrl, alt };
};

const getImageWidth = (node) => {
  let width;
  if (node.attributes["width"] && node.attributes["width"].value > 0) {
    width = node.attributes["width"].value;
  } else if (node.style.width) {
    width = node.style.width;
  } else if (node.offsetWidth && node.offsetWidth > 0) {
    width = node.offsetWidth;
  } else if (node.naturalWidth && node.naturalWidth > 0) {
    width = node.naturalWidth;
  } else if (node.clientWidth && node.clientWidth > 0) {
    width = node.clientWidth;
  } else if (node.getBoundingClientRect().width > 0) {
    width = node.getBoundingClientRect().width;
  }

  return width;
};

const getNomalizedTitle = () => {
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

const paddingZero = (num, paddingLength) => {
  return ("0".repeat(paddingLength) + num.toString()).slice(paddingLength * -1);
};

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
    `Comment: ${message.comment}\n` +
    "---\n\n"
  );
};

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

const bookmark = (message) => {
  if (hasMessageError(message)) {
    return;
  }

  const title = getNomalizedTitle();
  const fileContent = createObsidianHeader(message);

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

const clip = async (message) => {
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

  turndownService.addRule("pictureTagsReplace", {
    filter: ["picture"],
    replacement: (content, node) => {
      console.log("picture");
      const sourceNodes = node.querySelector("source[type='image/jpg']");
      console.log(sourceNodes);
      if (sourceNodes && sourceNodes.length > 0) {
        const imgae = getImageInfomaion(sourceNodes[0]);
        const width = getImageWidth(sourceNodes[0]);

        if (width) {
          return `![${node.alt}|${width}](${getCorrectUrl(imgae.imageUrl)})`;
        }
        if (imgae.alt) {
          return `![${node.alt}](${getCorrectUrl(imgae.imageUrl)})`;
        }

        return `![image](${getCorrectUrl(imgae.imageUrl)})`;
      }

      return "";
    },
  });

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

  turndownService.remove([
    "script",
    "noscript",
    "head",
    "footer",
    "select",
    "style",
  ]);

  const targetElements = currentElement.cloneNode(true);

  // Remove skip classes
  if (skipClasses.some((skipClass) => document.URL.startsWith(skipClass.url))) {
    const skipClassesDefinision = skipClasses.find((skipClass) =>
      document.URL.startsWith(skipClass.url)
    );

    skipClassesDefinision.classes.forEach((skipClass) => {
      targetElements
        .querySelectorAll(`.${skipClass}`)
        .forEach((element) => element.remove());
    });
  }

  const allElements = targetElements.querySelectorAll("*");
  const hiddenElements = Array.from(allElements).filter((element) => {
    const style = window.getComputedStyle(element);
    return style.display === "none" || style.visibility === "hidden";
  });
  hiddenElements.forEach((element) => {
    element.remove();
  });

  // Convert to Markdown
  let markdownBody = turndownService.turndown(targetElements.outerHTML);

  // Create Obsidian data
  const fileContent = createObsidianHeader(message) + markdownBody;

  const title = getNomalizedTitle();

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

const getCorrectUrl = (url) => {
  let correctUrl = url;
  const siteUrl = new URL(document.URL);

  if (url.startsWith("//")) {
    correctUrl = `${siteUrl.protocol}${url}`;
  } else if (url.startsWith("/")) {
    correctUrl = `${siteUrl.protocol}//${siteUrl.host}${url}`;
  } else if (!url.startsWith("http") && !url.startsWith("/")) {
    const slashIndex = document.URL.lastIndexOf("/");
    correctUrl = document.URL.substring(0, slashIndex + 1) + url;
  }

  return correctUrl;
};

const getCurrentElement = () => {
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
    ':not([id*="voice"])' +
    ':not([id*="mainContentsStart"])';

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
    ':not([class*="voice"])' +
    ':not([class*="mainContentsStart"])';

  const excludeTags =
    ":not(script)" +
    ":not(a)" +
    ":not(ul)" +
    ":not(li)" +
    ":not(nav)" +
    ":not(head)";

  let elements = document.querySelectorAll(
    '[id*="main"]' + idNegative + excludeTags
  );
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll(
      '[id*="Main"]' + idNegative + excludeTags
    );
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll(
      "article" + classNegative + excludeTags
    );
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll(
      '[class*="main"]' + classNegative + excludeTags
    );
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll("main" + classNegative + excludeTags);
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll(
      '[id*="article"]' + idNegative + excludeTags
    );
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll(
      '[id*="News"]' + idNegative + excludeTags
    );
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll(
      '[id*="news"]' + idNegative + excludeTags
    );
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll(
      '[id*="content"]' + idNegative + excludeTags
    );
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll(
      '[class*="News"]' + classNegative + excludeTags
    );
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll(
      '[class*="news"]' + classNegative + excludeTags
    );
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll(
      '[class*="content"]' + classNegative + excludeTags
    );
  }
  if (!elements || elements.length === 0) {
    elements = document.querySelectorAll('[class*="day"]');
  }

  if (elements && elements.length > 0) {
    return elements[0];
  }

  return document.body;
};

const initialize = async () => {
  currentElement = getCurrentElement();

  try {
    const options = await browser.storage.local.get("options");

    if (options?.options?.skipClasses) {
      Array.from(options.options.skipClasses).forEach((skipClass) => {
        skipClasses.push({
          url: skipClass.url,
          classes: skipClass.classes.split(" "),
        });
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const selectAll = () => {
  currentElement.style.border = "";
  currentElement = document.body;
  currentElement.style.border = selectedBorderStyle;
};

const selectArticle = () => {
  currentElement.style.border = "";
  currentElement = getCurrentElement();
  currentElement.style.border = selectedBorderStyle;
};

const unselect = () => {
  currentElement.style.border = "";
  plusButton.remove();
  minusButoon.remove();
};

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "select") {
    initialize();
  }
  if (message.command === "selectArticleRange") {
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
