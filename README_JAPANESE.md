## WebClip Markdown for Obsidian

`WebClip Markdown for Obsidian` は、Firefox 拡張機能の Obsidian 用 Web Clipper です。

Web ページを Markdown の形式に変換して、Obsidian に保存します。

画像や Twitter のツイートは、URL のままのため、元データが削除されれば参照できなくなるためご注意ください。

[Media Sync](https://github.com/fnya/media-sync) という Obsidian のプラグインを使用すると、画像をローカルに保存できます。

## Bookmarklet

こちらの [Bookmarklet](bookmarklet.js) を使用すると、Web ページを Markdown の形式に変換して、Obsidian に保存することができます。

Bookmarklet の下記箇所を修正してカスタマイズできます。

```javascript
/* when 'true', select full page  */
const isFullPage = false; // true にするとページ全体を選択する

/* Optional vault name */
const vault = ""; // Vault 名を指定できる

/* Optional folder name such as "Clippings/" */
const folder = ""; // デフォルトフォルダを指定できる

/* Optional skip URL and classes */
const skipClasses = []; // URL と class 名の組み合わせで要素をスキップできる

/* example

const skipClasses = [
  {
    url: "https://example.com",
    classes: [
      "module--detail-morenews",
      "module--share"
    ],
  },
  {
    url:  "https://news.example.com",
    classes: ["snsButton", "articleButton"],
  },
*/
```

## iOS Shortcut

iOS のショートカットは、次の手順で作成します。

- ショートカットの新規作成から、「Web ページで JavaScript を実行」を選択し、用途に応じて以下のスクリプトを貼り付けます
  - [ios-shortcut.js](ios-shortcut.js)
    - Web ページの本文を選択して Markdown に変換し Obsidian に保存します
- アプリの設定で「共有シートに表示」をオンにします
- スクリプトの入力を「ショートカットの入力」に修正します
- 設定のショートカットの詳細で、「スクリプトの実行」をオンにします
- Safari で Web ページを開き、共有ボタンからショートカットを選択すると、Obsidian に Web ページを Markdown で保存できます

なお、カスタマイズ方法は、Bookmarklet と同様です。

## Open Source Libraries

- [turndown](https://github.com/mixmark-io/turndown)
- [jcubic/tagger](https://github.com/jcubic/tagger)
- [Bootstrap](https://getbootstrap.com/)
