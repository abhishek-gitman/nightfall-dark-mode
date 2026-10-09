/* Nightfall — service worker.
 * Seeds defaults on install and relays the keyboard shortcut to the active tab.
 */

const DEFAULTS = {
  enabledGlobal: true,
  brightness: 100,
  contrast: 100,
  sepia: 0,
  grayscale: 0,
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(null, (store) => {
    const seed = {};
    for (const [k, v] of Object.entries(DEFAULTS)) {
      if (store[k] === undefined) seed[k] = v;
    }
    if (Object.keys(seed).length) chrome.storage.local.set(seed);
  });
});

chrome.commands.onCommand.addListener((command) => {
  if (command !== "toggle-dark") return;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id != null) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "nightfall-toggle-site" });
    }
  });
});
