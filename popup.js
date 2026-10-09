/* Nightfall — popup logic. */

const DEFAULTS = {
  enabledGlobal: true,
  brightness: 100,
  contrast: 100,
  sepia: 0,
  grayscale: 0,
};

const $ = (id) => document.getElementById(id);
let hostname = "";

function siteKey() {
  return "site:" + hostname;
}

async function getActiveHost() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      try {
        resolve(new URL(tabs[0].url).hostname);
      } catch {
        resolve("");
      }
    });
  });
}

function render(store) {
  const merged = Object.assign({}, DEFAULTS, store);

  // Global master switch
  $("globalToggle").checked = merged.enabledGlobal;
  $("globalSub").textContent = merged.enabledGlobal
    ? "On everywhere"
    : "Off everywhere";

  // Per-site switch: override wins, else global
  const override = merged[siteKey()];
  const siteOn = override === undefined ? merged.enabledGlobal : override;
  $("siteToggle").checked = siteOn;
  $("siteName").textContent = hostname || "this page";

  // Sliders
  const map = ["brightness", "contrast", "sepia", "grayscale"];
  for (const k of map) {
    $(k).value = merged[k];
    $(k + "Val").textContent = merged[k] + "%";
  }

  // Grey out controls when the master switch is off
  const disabled = !merged.enabledGlobal;
  $("siteToggle").closest(".row").classList.toggle("disabled", disabled);
  $("sliders").classList.toggle("disabled", disabled || !siteOn);
}

function load() {
  chrome.storage.local.get(null, render);
}

function wire() {
  $("globalToggle").addEventListener("change", (e) => {
    chrome.storage.local.set({ enabledGlobal: e.target.checked }, load);
  });

  $("siteToggle").addEventListener("change", (e) => {
    chrome.storage.local.set({ [siteKey()]: e.target.checked }, load);
  });

  ["brightness", "contrast", "sepia", "grayscale"].forEach((k) => {
    $(k).addEventListener("input", (e) => {
      $(k + "Val").textContent = e.target.value + "%";
      chrome.storage.local.set({ [k]: Number(e.target.value) });
    });
  });

  $("reset").addEventListener("click", () => {
    chrome.storage.local.set(
      {
        brightness: DEFAULTS.brightness,
        contrast: DEFAULTS.contrast,
        sepia: DEFAULTS.sepia,
        grayscale: DEFAULTS.grayscale,
      },
      load
    );
  });
}

(async function init() {
  hostname = await getActiveHost();
  wire();
  load();
})();
