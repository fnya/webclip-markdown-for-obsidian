document.getElementById("save").addEventListener("click", async () => {
  try {
    const tags = [];
    const tag1 = {
      name: "tag1",
      count: 3,
    };
    const tag2 = {
      name: "tag2",
      count: 2,
    };
    const tag3 = {
      name: "tag3",
      count: 1,
    };
    tags.push(tag1);
    tags.push(tag2);
    tags.push(tag3);

    await browser.storage.local.set({ tags: JSON.stringify(tags) });
  } catch (error) {
    console.error(error);
  }
});

document.getElementById("load").addEventListener("click", async () => {
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
    const text = tags.map((tag) => tag.name).join(", ");

    document.getElementById("tags").textContent = text;
  } catch (error) {
    console.error(error);
    document.getElementById("tags").textContent = error;
  }
});
