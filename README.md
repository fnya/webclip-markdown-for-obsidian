## WebClip Markdown for Obsidian

`WebClip Markdown for Obsidian` は、Firefox 拡張機能の Obsidian 用 Web Clipper です。

Web ページを Markdown の形式に変換して、Obsidian に保存します。

画像は Base64 でエンコードして保存します。

これにより、画像があっても 1 つの Markdown ファイルに保存することができます。

## Bookmarklet

こちらの [Bookmarklet](bookmarklet.js) を使用すると、Web ページを Markdown の形式に変換して、Obsidian に保存することができます。

Bookmarklet の下記箇所を修正すると、

```javascript
/* when 'true', select full page  */
const isFullPage = false; // true にするとページ全体を選択する

/* Optional vault name */
const vault = ""; // Vault 名を指定できる

/* Optional folder name such as "Clippings/" */
const folder = ""; // デフォルトフォルダを指定できる
```

## Open Source

- [turndown](https://github.com/mixmark-io/turndown)
- [jcubic/tagger](https://github.com/jcubic/tagger)
- [UIkit](https://getuikit.com/)
