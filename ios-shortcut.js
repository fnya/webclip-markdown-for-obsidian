var rusult = [];

Promise.all([import("https://unpkg.com/turndown@7.1.2?module")]).then(
  async ([{ default: TurndownService }]) => {
    /* when 'true', select full page  */
    const isFullPage = false;

    /* Optional vault name */
    const vault = "";

    /* Optional folder name such as "Clippings/" */
    const folder = "";

    /* Optional default tags such as "tag1 tag2" */
    /* Numeric-only tags will not work due to Obsidian specifications.*/
    const tags = "";

    const getCurrentElement = () => {
      if (isFullPage) {
        return document.body;
      }

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
        elements = document.querySelectorAll(
          "main" + classNegative + excludeTags
        );
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

    const currentElement = getCurrentElement();

    const getImageInfomaion = (node) => {
      let imageUrl;

      if (
        node.attributes["data-src"] &&
        node.attributes["data-src"].value !== ""
      ) {
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

    const getNomalizedTitle = () => {
      return document.title
        .replaceAll(":", " ")
        .replaceAll(".", " ")
        .replaceAll("¥", " ")
        .replaceAll("/", " ")
        .replaceAll("*", " ")
        .replaceAll("?", " ")
        .replaceAll("<", " ")
        .replaceAll(">", " ")
        .replaceAll("|", " ");
    };

    const paddingZero = (num, paddingLength) => {
      return ("0".repeat(paddingLength) + num.toString()).slice(
        paddingLength * -1
      );
    };

    const createObsidianHeader = () => {
      let saveTags = "";

      if (tags && tags !== "") {
        saveTags = tags
          .split(" ")
          .map((tag) => `${tag.trim()}`)
          .filter((tag) => tag !== "")
          .map((tag) => `"#${tag}"`)
          .join(",");
      }

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
        `Comment: \n` +
        "---\n\n"
      );
    };

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
        const href = node.attributes["href"]
          ? node.attributes["href"].value
          : "";

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
              response += `\n![${
                imageInformation.alt
              }|${width}](${getCorrectUrl(imageInformation.imageUrl)})\n`;
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

    turndownService.remove(["script", "noscript", "head", "footer", "select"]);

    const allElements = currentElement.querySelectorAll("*");
    const hiddenElements = Array.from(allElements).filter((element) => {
      const style = window.getComputedStyle(element);
      return style.display === "none" || style.visibility === "hidden";
    });
    hiddenElements.forEach((element) => {
      element.remove();
    });

    let markdownBody = turndownService.turndown(currentElement.outerHTML);

    const fileContent = createObsidianHeader() + markdownBody;

    const title = getNomalizedTitle();

    const vaultName = vault === "" ? "" : encodeURIComponent(vault);
    const folderName = folder === "" ? "" : encodeURIComponent(folder + "/");

    document.location.href =
      "obsidian://new?" +
      "&content=" +
      encodeURIComponent(fileContent) +
      "&vault=" +
      vaultName +
      "&file=" +
      folderName +
      encodeURIComponent(title);

    completion(rusult);
  }
);
