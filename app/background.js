function openTweet() {
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(function (tabs) {
      const url = tabs[0].url;
      const title = tabs[0].title;

      const twitterUrl =
        "https://twitter.com/intent/tweet?url=" +
        encodeURIComponent(url) +
        "&text=" +
        encodeURIComponent(title);

      browser.windows.create({
        url: twitterUrl,
        width: 600,
        height: 600,
        type: "popup",
      });
    });
}

browser.browserAction.onClicked.addListener(openTweet);
