const DEFAULT_TAG_PREFIX = "defaultTag:";
let options = { defaultTags: [] };

document.getElementById("saveButton").addEventListener("click", async () => {
  if (options.defaultTags) {
    options.defaultTags = options.defaultTags.sort((a, b) =>
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
      'input[name="defaultTag"]:checked'
    );

    if (targets) {
      const filteredDefaultTags = options.defaultTags.filter((tag) => {
        return !Array.from(targets).some((target) => {
          return target.id === DEFAULT_TAG_PREFIX + tag;
        });
      });
      options.defaultTags = filteredDefaultTags;

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

const createDefaultTagItem = (tag) => {
  const tagItem = document.createElement("li");
  tagItem.className = "list-group-item";

  const tagItemInput = document.createElement("input");
  tagItemInput.className = "form-check-input";
  tagItemInput.name = "defaultTag";
  tagItemInput.type = "checkbox";
  tagItemInput.id = DEFAULT_TAG_PREFIX + tag;

  const tagItemLavel = document.createElement("label");
  tagItemLavel.className = "form-check-label ms-2 overflow-ellipsis";
  tagItemLavel.textContent = tag;
  tagItemLavel.setAttribute("for", DEFAULT_TAG_PREFIX + tag);

  tagItem.appendChild(tagItemInput);
  tagItem.appendChild(tagItemLavel);

  return tagItem;
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
    defaultTags.appendChild(createDefaultTagItem(tag));
  });
};

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
    !optionsData ||
    !optionsData.options ||
    !optionsData.options.defaultTags
  ) {
    options = { defaultTags: [] };
  } else {
    options = { ...optionsData.options };
  }

  showDefaultTags();
};

initialize();
