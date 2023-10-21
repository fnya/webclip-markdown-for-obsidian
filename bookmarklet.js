javascript: Promise.all([
  import("https://unpkg.com/turndown@7.1.2?module"),
]).then(async ([{ default: TurndownService }]) => {
  /* when 'true', select full page  */
  let isFullPage = false;

  /* Optional vault name */
  let vault = "";

  /* Optional folder name such as "Clippings" */
  let folder = "";

  /* Optional default tags such as "tag1 tag2" */
  /* Numeric-only tags will not work due to Obsidian specifications.*/
  let tags = "";

  const skipClasses = [];

  const newWindow = window.open("", "newWindow", "width=400,height=520");

  newWindow.document.write(`
  <html>
      <head>
        <title>Clip to Obsidian</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
      </head>
      <body>
      <div class="container">
        <div class="mb-3">
          <div class="form-check">
            <input class="form-check-input" type="radio" name="selectArea" id="selectArticle" ${
              isFullPage ? "" : "checked"
            }>
            <label class="form-check-label" for="selectArticle">
              Select article
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="selectArea" id="selectAll" ${
              isFullPage ? "checked" : ""
            }>
            <label class="form-check-label" for="selectAll">
              Select all
            </label>
          </div>
        </div>
        <div class="mb-3">
          <label for="vaultName" class="form-label">Vault name</label>
          <input type="text" class="form-control" id="vaultName" value="${vault}">
        </div>
        <div class="mb-3">
          <label for="defaultFolder" class="form-label">Folder name</label>
          <input type="text" class="form-control" id="defaultFolder" value="${folder}">
        </div>
        <div class="mb-3">
          <label for="tagsName" class="form-label">Tags <span style="font-size: small;color: #a9a9a9;">*space delimiter</span></label>
          <input type="text" class="form-control" id="tagsName" value="${tags}">
        </div>
        <div class="mb-3">
          <label for="comment" class="form-label">Comment</label>
          <textarea type="text" class="form-control" id="comment" rows="2"></textarea>
        </div>
        <div class="mb-3">
        <button type="button" class="btn btn-light" id="cancelButton">Cancel</button> 
        <button type="button" class="btn btn-primary" id="clipButton">Clip</button>
        </div>
      </div>

      <script>
        document.getElementById("cancelButton").addEventListener("click", () => {
          window.close();
        });


        document.getElementById("clipButton").addEventListener("click", () => {
          const data = {
            isFullPage:  document.getElementById("selectAll").checked,
            vault: document.getElementById("vaultName").value,
            defaultFolder: document.getElementById("defaultFolder").value,
            tags: document.getElementById("tagsName").value,
            comment: document.getElementById("comment").value
          };
          const jsonData = JSON.stringify(data);
          window.opener.receiveValue(jsonData);
        });
      </script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
      </body>
  </html>`);

  window.receiveValue = (jsonData) => {
    newWindow.close();
    const data = JSON.parse(jsonData);

    isFullPage = data.isFullPage;
    vault = data.vault;
    folder = data.defaultFolder;
    tags = data.tags;
    const comment = data.comment;

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
        `Comment: ${comment}\n` +
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

    turndownService.remove([
      "script",
      "noscript",
      "head",
      "footer",
      "select",
      "style",
    ]);

    const targetElements = currentElement.cloneNode(true);

    if (
      skipClasses.some((skipClass) => document.URL.startsWith(skipClass.url))
    ) {
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

    let markdownBody = turndownService.turndown(targetElements.outerHTML);

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
  };
});
