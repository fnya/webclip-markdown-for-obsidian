let taggerElement;

const handleResponse = (message) => {
  console.log(`Message from the background script: ${message.response}`);
};

const handleError = (error) => {
  console.log(`Error: ${error}`);
};

document.getElementById("clip").addEventListener("click", async () => {
  await saveTags();

  const defaultFolder = document.getElementById("defaultFolder").value;
  const tags = document.getElementById("tags").value;
  const message = { command: "clip", tags, defaultFolder };

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message).then((response) => {
      // console.log(response);
    });
  });
});

document.getElementById("selectMain").addEventListener("click", () => {
  const message = { command: "selectMain" };

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message).then((response) => {
      // console.log(response);
    });
  });
});

document.getElementById("selectAll").addEventListener("click", () => {
  const message = { command: "selectAll" };

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message).then((response) => {
      // console.log(response);
    });
  });
});

// popup 表示時に要素を選択する
browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const message = { command: "select" };
  browser.tabs.sendMessage(tabs[0].id, message).then((response) => {
    // console.log(response);
  });
});

// popup クローズ時に要素選択を解除する
window.addEventListener("blur", () => {
  const message = { command: "unselect" };
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message).then((response) => {
      // console.log(response);
    });
  });
});

// tagger 初期化
const initializeTagger = async () => {
  const tagsElement = document.getElementById("tags");
  taggerElement = tagger(tagsElement, {
    allow_duplicates: false,
    allow_spaces: false,
    wrap: true,
    completion: {
      list: [],
    },
  });

  await loadTags();
};

initializeTagger();
