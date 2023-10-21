const DEFAULT_TAG_PREFIX = "defaultTag";
const DICTIONAY_TAG_PREFIX = "dictionalyTag";
const SKIP_CLASSES_PREFIX = "skipClasses";
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

const createSkipItem = (url, classes) => {
  const skipItem = document.createElement("li");
  skipItem.className = "list-group-item";

  const skipItemInput = document.createElement("input");
  skipItemInput.className = "form-check-input ms-1 mt-3";
  skipItemInput.name = SKIP_CLASSES_PREFIX;
  skipItemInput.type = "checkbox";
  skipItemInput.id = SKIP_CLASSES_PREFIX + url;

  const urlLavel = document.createElement("label");
  urlLavel.className =
    "form-check-label ms-2 overflow-ellipsis skipClassesLabel";
  urlLavel.textContent = url;
  urlLavel.setAttribute("for", SKIP_CLASSES_PREFIX + url);

  const classesLavel = document.createElement("label");
  classesLavel.className =
    "form-check-label ms-2 overflow-ellipsis skipClassesLabel";
  classesLavel.textContent = classes;
  classesLavel.setAttribute("for", SKIP_CLASSES_PREFIX + url);

  const root = document.createElement("div");
  root.className = "row col-12";

  const leftDiv = document.createElement("div");
  leftDiv.className = "col-2";
  leftDiv.appendChild(skipItemInput);

  const rightDiv = document.createElement("div");
  rightDiv.className = "col-10";

  const rightTopDiv = document.createElement("div");
  rightTopDiv.className = "row";

  rightTopDiv.appendChild(urlLavel);
  rightDiv.appendChild(rightTopDiv);

  const rightBottomDiv = document.createElement("div");
  rightBottomDiv.className = "row";
  rightBottomDiv.appendChild(classesLavel);
  rightDiv.appendChild(rightBottomDiv);

  root.appendChild(leftDiv);
  root.appendChild(rightDiv);

  skipItem.appendChild(root);

  return skipItem;
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

    const alertMessageBottom = document.getElementById("errorMessageBottom");
    alertMessageBottom.className = "alert alert-danger";
    alertMessageBottom.textContent = "Default tag already exist.";

    setTimeout(() => {
      alertMessage.className = "alert alert-danger d-none";
      alertMessageBottom.className = "alert alert-danger d-none";
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

const clearSkipClasses = () => {
  const skipClasses = document.querySelectorAll('input[name="skipClasses"]');

  Array.from(skipClasses).forEach((skipClass) => {
    skipClass.parentNode.parentNode.parentNode.remove();
  });
};

const showSkipClasses = () => {
  const skipClasses = document.getElementById("skipClassesArea");

  Array.from(options.skipClasses).forEach((skipClasse) => {
    skipClasses.appendChild(createSkipItem(skipClasse.url, skipClasse.classes));
  });
};

const addSkipClasses = () => {
  const skipUrl = document.getElementById("skipUrl");
  const skipClasses = document.getElementById("skipClasses");

  if (!skipUrl.value || !skipClasses.value) {
    return;
  }

  const existUrl = options.skipClasses.some(
    (skipClass) => skipClass.url === skipUrl.value
  );

  if (existUrl) {
    const alertMessage = document.getElementById("errorMessage");
    alertMessage.className = "alert alert-danger";
    alertMessage.textContent = "URL already exist.";

    const alertMessageBottom = document.getElementById("errorMessageBottom");
    alertMessageBottom.className = "alert alert-danger";
    alertMessageBottom.textContent = "URL already exist.";

    alertMessageBottom.scrollIntoView(true);

    setTimeout(() => {
      alertMessage.className = "alert alert-danger d-none";
      alertMessageBottom.className = "alert alert-danger d-none";
    }, 3000); // after 3 seconds hide alert message

    return;
  }

  options.skipClasses.push({ url: skipUrl.value, classes: skipClasses.value });
  skipUrl.value = "";
  skipClasses.value = "";

  clearSkipClasses();
  showSkipClasses();
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

    const successMessageBottom = document.getElementById(
      "successMessageBottom"
    );
    successMessageBottom.className = "alert alert-success";
    successMessageBottom.textContent = "Configuration saved successfully.";

    successMessageBottom.scrollIntoView(true);

    setTimeout(() => {
      successMessage.className = "alert alert-success d-none";
      successMessageBottom.className = "alert alert-success d-none";
    }, 3000); // after 3 seconds hide alert message
  } catch (error) {
    console.error(error);
    const alertMessage = document.getElementById("errorMessage");
    alertMessage.className = "alert alert-danger";
    alertMessage.textContent = "Failed to save settings.";

    const alertMessageBottom = document.getElementById("errorMessageBottom");
    alertMessageBottom.className = "alert alert-danger";
    alertMessageBottom.textContent = "Failed to save settings.";

    alertMessageBottom.scrollIntoView(true);

    setTimeout(() => {
      alertMessage.className = "alert alert-danger d-none";
      alertMessageBottom.className = "alert alert-danger d-none";
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

document
  .getElementById("addSkipClassesButton")
  .addEventListener("click", () => {
    addSkipClasses();
  });

document
  .getElementById("deleteSkipClassesButton")
  .addEventListener("click", () => {
    const targets = document.querySelectorAll(
      `input[name="${SKIP_CLASSES_PREFIX}"]:checked`
    );

    if (targets) {
      const filteredSkipClasses = options.skipClasses.filter((skipClasse) => {
        return !Array.from(targets).some((target) => {
          return target.id === SKIP_CLASSES_PREFIX + skipClasse.url;
        });
      });
      options.skipClasses = filteredSkipClasses;

      clearSkipClasses();
      showSkipClasses();
    }
  });

document
  .getElementById("deleteAllSkipClassesButton")
  .addEventListener("click", () => {
    options.skipClasses = [];
    clearSkipClasses();
    showSkipClasses();
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

  if (!optionsData?.options?.defaultTags) {
    options.defaultTags = [];
  } else {
    options.defaultTags = [...optionsData.options.defaultTags];
  }

  if (!optionsData?.options?.dictionalyTags) {
    options.dictionalyTags = [];
  } else {
    options.dictionalyTags = [...optionsData.options.dictionalyTags];
  }

  if (!optionsData?.options?.useAutocomplete) {
    options.useAutocomplete = false;
  } else {
    options.useAutocomplete = optionsData.options.useAutocomplete;
  }

  if (!optionsData?.options?.useLernNewTags) {
    options.useLernNewTags = false;
  } else {
    options.useLernNewTags = optionsData.options.useLernNewTags;
  }

  if (!optionsData?.options?.skipClasses) {
    options.skipClasses = [];
  } else {
    options.skipClasses = [...optionsData.options.skipClasses];
  }

  showDefaultTags();
  showAutocomplete();
  showDictionalyTags();
  showSkipClasses();
};

initialize();
