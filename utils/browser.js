// Browser API polyfill: use chrome.* (callback-based, supported in both Chrome and Firefox 50+)
export const browserAPI = (typeof chrome !== 'undefined') ? chrome : browser;
