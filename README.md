## WebClip Markdown for Obsidian

[Japanese](README_JAPANESE.md)

`WebClip Markdown for Obsidian` is a Web Clipper for Obsidian, a Firefox extension.

It converts web pages to Markdown format and saves them in Obsidian.

Note that images and Twitter tweets are still URLs, so they will no longer be available if the original data is deleted.

The Obsidian plugin [Media Sync](https://github.com/fnya/media-sync) can be used to save images locally.

## Bookmarklet

This [Bookmarklet](bookmarklet.js) can be used to convert web pages into Markdown format and save them in Obsidian.

You can customize it by modifying the following parts of the Bookmarklet.

```javascript
/* when 'true', select full page */
const isFullPage = false; // when true, select full page

/* Optional vault name */
const vault = ""; // Vault name can be specified

/* Optional folder name such as "Clippings/" */
const folder = ""; // can specify default folder
```

## iOS Shortcut

To create an iOS shortcut, follow the steps below.

- From Create New Shortcut, select "Execute JavaScript on Web Page" and paste the following script according to your purpose
  - [ios-shortcut.js](ios-shortcut.js)
    - Select the body of the web page, convert it to Markdown and save it in Obsidian
- Turn on "Show in shared sheets" in the app settings
- Modify the script entry to "Enter shortcut".
- Turn on "Run scripts" in the shortcut details of the settings
- Open the web page in Safari and select the shortcut from the Share button to save the web page in Obsidian as Markdown

The customization procedure is the same as for Bookmarklet.

## Open Source Libraries

- [turndown](https://github.com/mixmark-io/turndown)
- [jcubic/tagger](https://github.com/jcubic/tagger)
- [Bootstrap](https://getbootstrap.com/)
