let taggerElement;
const activeColor = "#add8e6";
const defaultColor = "#ffffff";
const mouseOverColor = "#f0f8ff";

// 設定を保存する
const saveSettings = async () => {
  try {
    const vault = document.getElementById("vault").value;
    const defaultFolder = document.getElementById("defaultFolder").value;

    await browser.storage.local.set({ vault: vault });
    await browser.storage.local.set({ defaultFolder: defaultFolder });
  } catch (error) {
    console.error(error);
  }
};

// 設定を読み込む
const loadSettings = async () => {
  try {
    const vault = await browser.storage.local.get("vault");
    const defaultFolder = await browser.storage.local.get("defaultFolder");

    if (vault.vault) {
      document.getElementById("vault").value = vault.vault;
    }
    if (defaultFolder.defaultFolder) {
      document.getElementById("defaultFolder").value =
        defaultFolder.defaultFolder;
    }
  } catch (error) {
    console.error(error);
  }
};

const handleResponse = (message) => {
  console.log(`Message from the background script: ${message.response}`);
};

const handleError = (error) => {
  console.log(`Error: ${error}`);
};

// clip ボタンをクリックしたときの処理
document.getElementById("clip").addEventListener("click", async () => {
  // 設定を保存する
  saveSettings();

  // Clip メッセージを送信する
  const vault = document.getElementById("vault").value;
  const defaultFolder = document.getElementById("defaultFolder").value;
  const tags = document.getElementById("tags").value;
  const message = { command: "clip", vault, defaultFolder, tags };

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message);
  });
});

// selectArticle のイベントハンドラ
document.getElementById("selectArticle").addEventListener("click", () => {
  document.getElementById("selectArticle").style.backgroundColor = activeColor;
  const message = { command: "selectArticle" };

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message);
  });
});

document.getElementById("selectArticle").addEventListener("mouseover", () => {
  if (
    document.getElementById("selectArticle").style.backgroundColor !==
    activeColor
  ) {
    document.getElementById("selectArticle").style.backgroundColor =
      mouseOverColor;
  }
});

document.getElementById("selectArticle").addEventListener("mouseout", () => {
  if (
    document.getElementById("selectArticle").style.backgroundColor !==
    activeColor
  ) {
    document.getElementById("selectArticle").style.backgroundColor =
      defaultColor;
  }
});

// selectAll のイベントハンドラ
document.getElementById("selectAll").addEventListener("click", () => {
  document.getElementById("selectAll").style.backgroundColor = activeColor;
  const message = { command: "selectAll" };

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message);
  });
});

document.getElementById("selectAll").addEventListener("mouseover", () => {
  if (
    document.getElementById("selectAll").style.backgroundColor !== activeColor
  ) {
    document.getElementById("selectAll").style.backgroundColor = mouseOverColor;
  }
});

document.getElementById("selectAll").addEventListener("mouseout", () => {
  if (
    document.getElementById("selectAll").style.backgroundColor !== activeColor
  ) {
    document.getElementById("selectAll").style.backgroundColor = defaultColor;
  }
});

// popup 表示時に要素を選択する
browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const message = { command: "select" };
  browser.tabs.sendMessage(tabs[0].id, message);
});

// popup クローズ時に要素選択を解除する
window.addEventListener("blur", () => {
  const message = { command: "unselect" };
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message);
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

  document.getElementById("selectArticle").style.backgroundColor = activeColor;
  await loadSettings();
};

initializeTagger();
