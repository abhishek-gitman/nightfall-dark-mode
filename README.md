# 🌙 Nightfall — Universal Dark Mode

A tiny, **100% local** browser extension that turns any web page dark while keeping
images, videos, and layout intact. No accounts, no servers, no tracking, no network
requests of any kind. Your settings never leave your computer (`chrome.storage.local`).

## How it works

It injects a CSS filter that inverts the page's colours and rotates the hue (so blues
stay blue, reds stay red), then **counter-inverts** real media — images, videos,
canvases, iframes, background images — so photos look normal. Layout is never touched.

## Features

- Master on/off switch + **per-site** toggle
- Brightness, Contrast, Sepia, Grayscale sliders
- Keyboard shortcut: **Ctrl/⌘ + Shift + D** toggles the current site
- Works at `document_start` so pages load dark (no white flash)

## Install (Chrome / Edge / Brave / Opera)

1. Open `chrome://extensions` (or `edge://extensions`).
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked**.
4. Select this `dark-mode-extension` folder.
5. Pin the 🌙 icon and click it to open the controls.

## Install (Firefox)

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select the `manifest.json` file inside this folder.

> Firefox unloads temporary add-ons on restart. For a permanent install you'd need to
> sign the package via Mozilla's (free) add-on signing. The code itself is compatible.

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension config (Manifest V3) |
| `content.js` | Injects/removes the dark-mode CSS on every page |
| `background.js` | Seeds defaults, relays the keyboard shortcut |
| `popup.html/.css/.js` | The control panel UI |
| `icons/` | Toolbar icons |

## Privacy

The only permissions requested are `storage` (save your preferences locally),
`activeTab`/`scripting`, and host access (to restyle pages you visit). It never sends
data anywhere.
