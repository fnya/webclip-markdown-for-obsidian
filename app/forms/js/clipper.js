let taggerElement;
let defaultTags = [];
let dictionalyTags = [];
let useLernNewTags = false;

document
  .getElementById("default-image-plus")
  .addEventListener("mouseenter", () => {
    const plusButton = document.getElementById("default-image-plus");
    const hoverPlusButton = document.getElementById("hover-image-plus");
    plusButton.style.display = "none";
    hoverPlusButton.style.display = "inline";
  });

document
  .getElementById("hover-image-plus")
  .addEventListener("mouseleave", () => {
    const plusButton = document.getElementById("default-image-plus");
    const hoverPlusButton = document.getElementById("hover-image-plus");
    plusButton.style.display = "inline";
    hoverPlusButton.style.display = "none";
  });

document
  .getElementById("default-image-minus")
  .addEventListener("mouseenter", () => {
    const plusButton = document.getElementById("default-image-minus");
    const hoverPlusButton = document.getElementById("hover-image-minus");
    plusButton.style.display = "none";
    hoverPlusButton.style.display = "inline";
  });

document
  .getElementById("hover-image-minus")
  .addEventListener("mouseleave", () => {
    const plusButton = document.getElementById("default-image-minus");
    const hoverPlusButton = document.getElementById("hover-image-minus");
    plusButton.style.display = "inline";
    hoverPlusButton.style.display = "none";
  });

const saveSettings = async () => {
  try {
    const vault = document.getElementById("vault").value;
    const defaultFolder = document.getElementById("defaultFolder").value;

    if (vault && vault !== "") {
      await browser.storage.local.set({ vault: vault });
    }
    if (defaultFolder && defaultFolder !== "") {
      await browser.storage.local.set({ defaultFolder: defaultFolder });
    }

    if (useLernNewTags) {
      const tags = document.getElementById("tags").value;
      const optionsData = await browser.storage.local.get("options");

      const addTags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "")
        .filter((tag) => !optionsData.options.dictionalyTags.includes(tag));

      addTags.forEach((tag) => {
        optionsData.options.dictionalyTags.push(tag);
      });

      optionsData.options.dictionalyTags =
        optionsData.options.dictionalyTags.sort((a, b) => a.localeCompare(b));

      await browser.storage.local.set({ options: optionsData.options });
    }
  } catch (error) {
    console.error(error);
  }
};

const loadSettings = async () => {
  try {
    const vault = await browser.storage.local.get("vault");
    const defaultFolder = await browser.storage.local.get("defaultFolder");

    if (vault?.vault) {
      document.getElementById("vault").value = vault.vault;
    }
    if (defaultFolder?.defaultFolder) {
      document.getElementById("defaultFolder").value =
        defaultFolder.defaultFolder;
    }

    const options = await browser.storage.local.get("options");

    if (options?.options?.defaultTags) {
      defaultTags = options.options.defaultTags;
    }

    if (options?.options?.dictionalyTags) {
      if (options?.options?.useAutocomplete) {
        dictionalyTags = options.options.dictionalyTags;
      }
    }

    if (options?.options?.useLernNewTags) {
      useLernNewTags = options.options.useLernNewTags;
    }
  } catch (error) {
    console.error(error);
  }
};

const handleResponse = (message) => {
  console.log(`Message from the background script: ${message.response}`);
};

const handleError = (error) => {
  alert(`Error: ${error}`);
  console.log(`Error: ${error}`);
};

document.getElementById("clip").addEventListener("click", async () => {
  saveSettings();

  const vault = document.getElementById("vault").value;
  const defaultFolder = document.getElementById("defaultFolder").value;
  const tags = document.getElementById("tags").value;
  const comment = document.getElementById("comment").value;
  const bookmarkSelected = document.getElementById("bookmark").checked;

  const message = {
    command: "clip",
    vault,
    defaultFolder,
    tags,
    comment,
    bookmarkSelected,
  };

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message);
  });
});

// plusButton
document.getElementById("hover-image-plus").addEventListener("click", () => {
  const message = { command: "plus" };

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message).error(handleError);
  });
});

// minusButton
document.getElementById("hover-image-minus").addEventListener("click", () => {
  const message = { command: "minus" };

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message);
  });
});

// selectArticleRange
document.getElementById("selectArticleRange").addEventListener("click", () => {
  const message = { command: "selectArticleRange" };

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message);
  });
});

// selectAll
document.getElementById("selectAll").addEventListener("click", () => {
  const message = { command: "selectAll" };

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message);
  });
});

// bookmark
document.getElementById("bookmark").addEventListener("click", () => {
  const message = { command: "unselect" };

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message);
  });
});

// popup open
browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const message = { command: "select" };
  browser.tabs.sendMessage(tabs[0].id, message);
});

// popup close
window.addEventListener("blur", () => {
  const message = { command: "unselect" };
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message);
  });
});

// initialize tagger
const initializeTagger = async () => {
  await loadSettings();

  const tagsElement = document.getElementById("tags");

  taggerElement = tagger(tagsElement, {
    allow_duplicates: false,
    allow_spaces: false,
    wrap: true,
    link: function (name) {
      return false;
    },
    completion: {
      list: [...dictionalyTags],
    },
  });

  Array.from(defaultTags).forEach((tag) => {
    taggerElement.add_tag(tag);
  });
};

const initialSelectArticleRange = () => {
  const message = { command: "selectArticleRange" };

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, message);
  });
};

initializeTagger();
initialSelectArticleRange();
