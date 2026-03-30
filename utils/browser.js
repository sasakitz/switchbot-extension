// Browser API polyfill: browser (Firefox, Promise-based) / chrome (Chrome MV3, Promise since v96)
export const browserAPI = (typeof browser !== 'undefined') ? browser : chrome;
