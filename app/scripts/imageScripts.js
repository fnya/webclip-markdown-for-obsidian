// URL の画像ファイルを Base64 でエンコードする
const getBase64FromUrl = async (url) => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
  });
};

// URL が画像かどうかを判定する
async function isImage(url) {
  try {
    let response = await fetch(url, { method: "HEAD" });
    let contentType = response.headers.get("content-type");
    return contentType && contentType.startsWith("image/");
  } catch (error) {
    console.error(error);
    return false;
  }
}

// 画像の情報を取得する
const getImageInfomaion = (node) => {
  let imageUrl = "";

  if (node.attributes["data-src"]) {
    imageUrl = node.attributes["data-src"].value;
  }
  if (node.attributes["src"] && node.attributes["src"].value !== "") {
    imageUrl = node.attributes["src"].value;
  }

  const alt = node.attributes["alt"] ? node.attributes["alt"].value : "image";

  return { imageUrl, alt };
};
