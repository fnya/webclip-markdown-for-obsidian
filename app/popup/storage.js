const saveTags = async () => {
  try {
    const tagElement = document.getElementById("tags");
    const tags = tagElement.value.split(",");
    const splitTags = tags.map((tag) => {
      return { name: tag.trim(), count: 0 };
    });

    await browser.storage.local.set({ tags: JSON.stringify(splitTags) });
  } catch (error) {
    console.error(error);
  }
};

document.getElementById("save").addEventListener("click", async () => {
  saveTags();
});

const loadTags = async () => {
  try {
    const value = await browser.storage.local.get("tags");
    const tags = JSON.parse(value.tags);

    // count の昇順にソートする
    tags.sort((a, b) => {
      if (a.count > b.count) {
        return 1;
      } else {
        return -1;
      }
    });

    for (const tag of tags) {
      taggerElement.add_tag(tag.name);
    }
  } catch (error) {
    console.error(error);
    document.getElementById("tags").textContent = error;
  }
};

document.getElementById("load").addEventListener("click", async () => {
  loadTags();
});
