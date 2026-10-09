/* Nightfall — Universal Dark Mode
 * Content script. Runs at document_start in every frame.
 *
 * Strategy: apply a CSS `invert() hue-rotate(180deg)` filter to the root
 * element so the whole page flips to a dark palette, then counter-invert
 * media (images, video, canvas, iframes, background images, etc.) so photos
 * and videos keep their true colours. Layout is never touched, so everything
 * stays intact.
 */

(function () {
  "use strict";

  const STYLE_ID = "nightfall-dark-style";
  const DEFAULTS = {
    enabledGlobal: true, // master switch
    brightness: 100, // 50..150
    contrast: 100, // 50..150
    sepia: 0, // 0..100
    grayscale: 0, // 0..100
  };

  // Keys of the form: `site:<hostname>` -> boolean (per-site override).
  function siteKey() {
    return "site:" + location.hostname;
  }

  function buildCSS(opts) {
    const rootFilter =
      `invert(100%) hue-rotate(180deg) ` +
      `brightness(${opts.brightness}%) contrast(${opts.contrast}%) ` +
      `sepia(${opts.sepia}%) grayscale(${opts.grayscale}%)`;

    // Counter-filter puts media back to normal (invert twice = original).
    const mediaFilter = `invert(100%) hue-rotate(180deg)`;

    // Selectors for things that should NOT be inverted (real media).
    const mediaSelectors = [
      "img",
      "picture",
      "video",
      "canvas",
      "svg image",
      'input[type="image"]',
      'embed[type^="image"]',
      'object[type^="image"]',
      "iframe",
      "[style*='background-image']",
      "[data-nightfall-bg]",
    ].join(", ");

    return `
      html {
        background: #0b0c10 !important;
        filter: ${rootFilter} !important;
        -webkit-filter: ${rootFilter} !important;
      }
      ${mediaSelectors} {
        filter: ${mediaFilter} !important;
        -webkit-filter: ${mediaFilter} !important;
      }
      /* Don't double-invert media that sits inside an already-counter-inverted
         element (e.g. an <img> inside a background-image div). */
      [style*='background-image'] img,
      [style*='background-image'] video,
      [style*='background-image'] picture,
      [style*='background-image'] canvas {
        filter: none !important;
        -webkit-filter: none !important;
      }
    `;
  }

  function applyStyle(opts) {
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      // Insert into <html> because <head> may not exist at document_start.
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = buildCSS(opts);
  }

  function removeStyle() {
    const el = document.getElementById(STYLE_ID);
    if (el) el.remove();
  }

  function shouldEnable(store) {
    if (!store.enabledGlobal) return false;
    const override = store[siteKey()];
    // If a per-site override exists, it wins; otherwise fall back to global.
    if (override === true) return true;
    if (override === false) return false;
    return true;
  }

  function currentOpts(store) {
    return {
      brightness: store.brightness ?? DEFAULTS.brightness,
      contrast: store.contrast ?? DEFAULTS.contrast,
      sepia: store.sepia ?? DEFAULTS.sepia,
      grayscale: store.grayscale ?? DEFAULTS.grayscale,
    };
  }

  function refresh() {
    chrome.storage.local.get(null, (store) => {
      const merged = Object.assign({}, DEFAULTS, store);
      if (shouldEnable(merged)) {
        applyStyle(currentOpts(merged));
      } else {
        removeStyle();
      }
    });
  }

  // React to changes made from the popup or other tabs.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") refresh();
  });

  // Toggle message from the keyboard command (via background).
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === "nightfall-toggle-site") {
      chrome.storage.local.get(null, (store) => {
        const merged = Object.assign({}, DEFAULTS, store);
        const next = !shouldEnable(merged);
        chrome.storage.local.set({ [siteKey()]: next });
      });
    }
  });

  refresh();
})();
