// Optional background entry point. Use the same generated assets as the manifest.
const browserAPI = (typeof browser !== 'undefined') ? browser : chrome;
const iconPaths = Object.fromEntries([16, 32, 48, 128].map(size => [size, `icons/icon${size}.png`]));

async function updateIcon() {
  try {
    await browserAPI.action.setIcon({ path: iconPaths });
  } catch (error) {
    console.warn('Icon update failed:', error);
  }
}

browserAPI.runtime.onInstalled.addListener(updateIcon);
browserAPI.runtime.onStartup.addListener(updateIcon);
