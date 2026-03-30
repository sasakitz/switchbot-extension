// Browser API polyfill: normalizes chrome.* and browser.* (Firefox/Chrome)
export const browserAPI = (typeof browser !== 'undefined') ? browser : chrome;
