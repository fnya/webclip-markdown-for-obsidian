## WebClip Markdown for Obsidian

`WebClip Markdown for Obsidian` は、Firefox 拡張機能の Obsidian 用 Web Clipper です。

Web ページを Markdown の形式に変換して、Obsidian に保存します。

画像は Base64 でエンコードして、以下の形式で保存します(一部抜粋)。

```
data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAApQAAAHJCAYAAAA7N6mIAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAP+lSURBVHhe7J0FYBVHF4UPJLi7u7t...
```

これにより、画像があっても 1 つの Markdown ファイルに保存することができます。

制約事項として、Web サイトの URL と画像の URL のドメイン名が異なる場合は、画像は Base64 でエンコードせずに、画像の URL をそのまま保存します。

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
```

## iOS Shortcut

iOS のショートカットは、次の手順で作成します。

- ショートカットの新規作成から、「Web ページで JavaScript を実行」を選択し、用途に応じて以下のスクリプトを貼り付けます
  - [ios-shortcut.js](ios-shortcut.js)
    - Web ページの本文を選択して Markdown に変換し Obsidian に保存します
  - [ios-shortcut-all.js](ios-shortcut-all.js)
    - Web ページ全体を選択して Markdown に変換し Obsidian に保存します
- アプリの設定で「共有シートに表示」をオンにします
- スクリプトの入力を「ショートカットの入力」に修正します
- 設定のショートカットの詳細で、「スクリプトの実行」をオンにします
- Safari で Web ページを開き、共有ボタンからショートカットを選択すると、Obsidian に Web ページを Markdown で保存できます

なお、カスタマイズ方法は、Bookmarklet と同様です。

## Open Source

- [turndown](https://github.com/mixmark-io/turndown)
- [jcubic/tagger](https://github.com/jcubic/tagger)
- [UIkit](https://getuikit.com/)
