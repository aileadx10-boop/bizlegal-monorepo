# Extension Icons

The manifest does not currently require icon files (icon references have been removed to avoid
build-time PNG dependencies). The extension uses the action title "BizLegal AI Capture" and the
notification uses an inline base64 SVG.

When you want to add proper icons, create three PNG files in this directory:

| File        | Size        | Usage                              |
|-------------|-------------|------------------------------------|
| icon16.png  | 16 × 16 px  | Browser toolbar (small)            |
| icon48.png  | 48 × 48 px  | Extensions management page         |
| icon128.png | 128 × 128 px| Chrome Web Store listing thumbnail |

Then restore the icon fields in `manifest.json`:

```json
"action": {
  "default_popup": "popup.html",
  "default_title": "BizLegal AI Capture",
  "default_icon": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
},
"icons": {
  "16": "icons/icon16.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
}
```

Design notes:
- Use the BizLegal indigo (#6366f1) as background
- White "B" lettermark centered on a rounded square
- Export from Figma/Sketch at 2x then scale down
