function handleResponse(message) {
  console.log(`Message from the background script: ${message.response}`);
}

function handleError(error) {
  console.log(`Error: ${error}`);
}

document.getElementById("clip").addEventListener("click", () => {
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    browser.tabs.sendMessage(tabs[0].id, "clip").then(function (response) {
      // console.log(response);
    });
  });
});

// popup 表示時に要素を選択する
browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  browser.tabs.sendMessage(tabs[0].id, "select").then(function (response) {
    // console.log(response);
  });
});

// popup クローズ時に要素選択を解除する
window.addEventListener("blur", function (e) {
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    browser.tabs.sendMessage(tabs[0].id, "unselect").then(function (response) {
      // console.log(response);
    });
  });
});
