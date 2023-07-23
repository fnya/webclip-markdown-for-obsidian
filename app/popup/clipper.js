function handleResponse(message) {
  console.log(`Message from the background script: ${message.response}`);
}

function handleError(error) {
  console.log(`Error: ${error}`);
}

document.getElementById("clip").addEventListener("click", () => {
  const defaultFolder = document.getElementById("defaultFolder").value;
  const tags = document.getElementById("tags").value;
  const message = { command: "clip", tags, defaultFolder };

  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    browser.tabs.sendMessage(tabs[0].id, message).then(function (response) {
      // console.log(response);
    });
  });
});

// popup 表示時に要素を選択する
browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const message = { command: "select" };
  browser.tabs.sendMessage(tabs[0].id, message).then(function (response) {
    // console.log(response);
  });
});

// TODO: 選択範囲変更ができなくなるので一時的にコメントアウト
// popup クローズ時に要素選択を解除する
// window.addEventListener("blur", function (e) {
//   const message = { command: "unselect" };
//   browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//     browser.tabs.sendMessage(tabs[0].id, message).then(function (response) {
//       // console.log(response);
//     });
//   });
// });
