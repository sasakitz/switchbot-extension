import { browserAPI } from './browser.js';

const TOKEN_KEY = 'switchbot_token';
const SECRET_KEY = 'switchbot_secret';
const CACHE_KEY = 'device_cache';
const DEVICE_ORDER_KEY = 'device_order';
const CACHE_TTL_MS = 30000;

export async function getCredentials() {
  const result = await browserAPI.storage.local.get([TOKEN_KEY, SECRET_KEY]);
  return { token: result[TOKEN_KEY] || '', secret: result[SECRET_KEY] || '' };
}

export async function saveCredentials(token, secret) {
  await browserAPI.storage.local.set({ [TOKEN_KEY]: token, [SECRET_KEY]: secret });
  await browserAPI.storage.local.remove(CACHE_KEY);
}

export async function clearCredentials() {
  await browserAPI.storage.local.remove([TOKEN_KEY, SECRET_KEY, CACHE_KEY, DEVICE_ORDER_KEY]);
}

export async function getCached() {
  const result = await browserAPI.storage.local.get([CACHE_KEY]);
  const cache = result[CACHE_KEY];
  if (!cache || Date.now() - cache.ts > CACHE_TTL_MS) return null;
  return cache;
}

export async function setCached(devices) {
  await browserAPI.storage.local.set({ [CACHE_KEY]: { devices, ts: Date.now() } });
}

export async function getDeviceOrder() {
  const result = await browserAPI.storage.local.get([DEVICE_ORDER_KEY]);
  const order = result[DEVICE_ORDER_KEY];
  return Array.isArray(order) ? [...new Set(order.filter(id => typeof id === 'string'))] : [];
}

export async function saveDeviceOrder(deviceIds) {
  await browserAPI.storage.local.set({ [DEVICE_ORDER_KEY]: [...new Set(deviceIds)] });
}
