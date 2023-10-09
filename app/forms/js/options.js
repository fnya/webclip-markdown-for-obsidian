const DEFAULT_TAG_PREFIX = "defaultTag";
const DICTIONAY_TAG_PREFIX = "dictionalyTag";
let options = {};

const createTagItem = (tag, prefix) => {
  const tagItem = document.createElement("li");
  tagItem.className = "list-group-item";

  const tagItemInput = document.createElement("input");
  tagItemInput.className = "form-check-input";
  tagItemInput.name = prefix;
  tagItemInput.type = "checkbox";
  tagItemInput.id = prefix + tag;

  const tagItemLavel = document.createElement("label");
  tagItemLavel.className = "form-check-label ms-2 overflow-ellipsis";
  tagItemLavel.textContent = tag;
  tagItemLavel.setAttribute("for", prefix + tag);

  tagItem.appendChild(tagItemInput);
  tagItem.appendChild(tagItemLavel);

  return tagItem;
};

const addDefaultTag = () => {
  const newTag = document.getElementById("defaultTag");

  if (!newTag.value) {
    return;
  }

  const existDefaultTag = options.defaultTags.some(
    (tag) => tag === newTag.value
  );
  if (existDefaultTag) {
    const alertMessage = document.getElementById("errorMessage");
    alertMessage.className = "alert alert-danger";
    alertMessage.textContent = "Default tag already exist.";

    setTimeout(() => {
      alertMessage.className = "alert alert-danger d-none";
    }, 3000); // after 3 seconds hide alert message

    return;
  }

  options.defaultTags.push(newTag.value);
  newTag.value = "";

  clearDefautTags();
  showDefaultTags();
};

const clearDefautTags = () => {
  const defaultTags = document.querySelectorAll('input[name="defaultTag"]');
  Array.from(defaultTags).forEach((tag) => {
    tag.parentNode.remove();
  });
};

const showDefaultTags = () => {
  const defaultTags = document.getElementById("defaultTags");

  Array.from(options.defaultTags).forEach((tag) => {
    defaultTags.appendChild(createTagItem(tag, DEFAULT_TAG_PREFIX));
  });
};

const addDictionalyTag = () => {
  const newTags = document.getElementById("tags");

  if (!newTags.value) {
    return;
  }

  const tags = Array.from(newTags.value.split(" ")).filter((tag) => tag !== "");

  let addedTags = [];

  tags.forEach((tag) => {
    const existTag = options.dictionalyTags.some(
      (dictionalyTag) => dictionalyTag === tag
    );

    if (!existTag) {
      addedTags.push(tag);
    }
  });

  options.dictionalyTags = options.dictionalyTags.concat(addedTags);

  newTags.value = "";

  clearDictionalyTags();
  showDictionalyTags();
};

const clearDictionalyTags = () => {
  const dictionalyTags = document.querySelectorAll(
    'input[name="dictionalyTag"]'
  );
  Array.from(dictionalyTags).forEach((tag) => {
    tag.parentNode.remove();
  });
};

const showDictionalyTags = () => {
  const dictionalyTags = document.getElementById("dictionayTags");

  Array.from(options.dictionalyTags).forEach((tag) => {
    dictionalyTags.appendChild(createTagItem(tag, DICTIONAY_TAG_PREFIX));
  });
};

const showAutocomplete = () => {
  const useAutocomplete = document.getElementById("useAutocomplete");
  const useLernNewTags = document.getElementById("useLernNewTags");

  useAutocomplete.checked = options.useAutocomplete;
  useLernNewTags.checked = options.useLernNewTags;
};

document.getElementById("saveButton").addEventListener("click", async () => {
  if (options.defaultTags) {
    options.defaultTags = options.defaultTags.sort((a, b) =>
      a.localeCompare(b)
    );
  }
  if (options.dictionalyTags) {
    options.dictionalyTags = options.dictionalyTags.sort((a, b) =>
      a.localeCompare(b)
    );
  }

  try {
    await browser.storage.local.set({ options: options });

    const successMessage = document.getElementById("successMessage");
    successMessage.className = "alert alert-success";
    successMessage.textContent = "Configuration saved successfully.";

    setTimeout(() => {
      successMessage.className = "alert alert-success d-none";
    }, 3000); // after 3 seconds hide alert message
  } catch (error) {
    console.error(error);
    const alertMessage = document.getElementById("errorMessage");
    alertMessage.className = "alert alert-danger";
    alertMessage.textContent = "Failed to save settings.";

    setTimeout(() => {
      alertMessage.className = "alert alert-danger d-none";
    }, 3000); // after 3 seconds hide alert message
  }
});

document.getElementById("resetButton").addEventListener("click", async () => {
  clearDefautTags();
  initialize();
});

document.getElementById("addDefaultTagButton").addEventListener("click", () => {
  addDefaultTag();
});

document.getElementById("defaultTag").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addDefaultTag();
  }
});

document
  .getElementById("deleteDefaltTagsButton")
  .addEventListener("click", () => {
    const targets = document.querySelectorAll(
      `input[name="${DEFAULT_TAG_PREFIX}"]:checked`
    );

    if (targets) {
      const filteredTags = options.defaultTags.filter((tag) => {
        return !Array.from(targets).some((target) => {
          return target.id === DEFAULT_TAG_PREFIX + tag;
        });
      });
      options.defaultTags = filteredTags;

      clearDefautTags();
      showDefaultTags();
    }
  });

document
  .getElementById("deleteAllDefaltTagButton")
  .addEventListener("click", () => {
    options.defaultTags = [];
    clearDefautTags();
    showDefaultTags();
  });

document
  .getElementById("addDictionalyTagsButton")
  .addEventListener("click", () => {
    addDictionalyTag();
  });

document.getElementById("tags").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addDictionalyTag();
  }
});

document
  .getElementById("deleteDictionalyTagButton")
  .addEventListener("click", () => {
    const targets = document.querySelectorAll(
      `input[name="${DICTIONAY_TAG_PREFIX}"]:checked`
    );

    if (targets) {
      const filteredTags = options.dictionalyTags.filter((tag) => {
        return !Array.from(targets).some((target) => {
          return target.id === DICTIONAY_TAG_PREFIX + tag;
        });
      });
      options.dictionalyTags = filteredTags;

      clearDictionalyTags();
      showDictionalyTags();
    }
  });

document
  .getElementById("deleteAllDictionalyTagsButton")
  .addEventListener("click", () => {
    options.dictionalyTags = [];
    clearDictionalyTags();
    showDictionalyTags();
  });

document.getElementById("useAutocomplete").addEventListener("change", (e) => {
  options.useAutocomplete = e.target.checked;
});

document.getElementById("useLernNewTags").addEventListener("change", (e) => {
  options.useLernNewTags = e.target.checked;
});

const loadOptions = async () => {
  try {
    return await browser.storage.local.get("options");
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

const initialize = async () => {
  const optionsData = await loadOptions();

  if (
    !optionsData?.options?.defaultTags &&
    !optionsData?.options?.dictionalyTags &&
    !optionsData?.options?.useAutocomplete &&
    !optionsData?.options?.useLernNewTags
  ) {
    options = {
      defaultTags: [],
      dictionalyTags: [],
      useAutocomplete: false,
      useLernNewTags: false,
    };
  } else {
    options = { ...optionsData.options };
  }

  showDefaultTags();
  showAutocomplete();
  showDictionalyTags();
};

initialize();
