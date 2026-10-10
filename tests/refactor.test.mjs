import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

const stored = {};
globalThis.chrome = { storage: { local: {
  async get(keys) { return Object.fromEntries(keys.map(key => [key, stored[key]])); },
  async set(values) { Object.assign(stored, values); },
  async remove(keys) { for (const key of [keys].flat()) delete stored[key]; },
} } };
const storage = await import('../utils/storage.js');
const api = await import('../utils/api.js');
const { buildDeviceCard } = await import('../popup/device-card.js');

const requests = [];
globalThis.fetch = async (url, options) => {
  requests.push({ url, options });
  return { json: async () => ({ statusCode: 100, body: { deviceList: [], infraredRemoteList: [] } }) };
};

test('credentials save and clear invalidate the device cache', async () => {
  assert.deepEqual(await storage.getCredentials(), { token: '', secret: '' });
  await storage.setCached([{ deviceId: 'one' }]);
  assert.equal((await storage.getCached()).devices[0].deviceId, 'one');
  stored.device_cache.ts = Date.now() - 30001;
  assert.equal(await storage.getCached(), null);
  await storage.saveCredentials('saved-token', 'saved-secret');
  assert.equal(await storage.getCached(), null);
  assert.deepEqual(await storage.getCredentials(), { token: 'saved-token', secret: 'saved-secret' });
  await storage.setCached([]);
  await storage.clearCredentials();
  assert.deepEqual(await storage.getCredentials(), { token: '', secret: '' });
  assert.equal(await storage.getCached(), null);
});

test('connection test signs unsaved credentials without persisting them', async () => {
  await storage.saveCredentials('saved-token', 'saved-secret');
  await api.testConnection({ token: 'draft-token', secret: 'draft-secret' });
  const { url, options } = requests.at(-1);
  assert.equal(url, 'https://api.switch-bot.com/v1.1/devices');
  const { Authorization, t, nonce, sign } = options.headers;
  assert.equal(Authorization, 'draft-token');
  assert.equal(sign, createHmac('sha256', 'draft-secret').update(Authorization + t + nonce).digest('base64'));
  assert.equal((await storage.getCredentials()).token, 'saved-token');
});

test('commands preserve endpoint, payload and saved credentials', async () => {
  await api.sendCommand('device-123', 'setPosition', '0,ff,25');
  const { url, options } = requests.at(-1);
  assert.equal(url, 'https://api.switch-bot.com/v1.1/devices/device-123/commands');
  assert.equal(options.method, 'POST');
  assert.equal(options.headers.Authorization, 'saved-token');
  assert.deepEqual(JSON.parse(options.body), { command: 'setPosition', parameter: '0,ff,25', commandType: 'command' });
});

test('missing credentials and API failures reject', async () => {
  await storage.clearCredentials();
  const count = requests.length;
  await assert.rejects(api.getDevices(), { code: 'NO_CREDENTIALS' });
  assert.equal(requests.length, count);
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ json: async () => ({ statusCode: 190, message: 'API failure' }) });
    await assert.rejects(api.testConnection({ token: 't', secret: 's' }), /API failure/);
    globalThis.fetch = async () => { throw new Error('offline'); };
    await assert.rejects(api.testConnection({ token: 't', secret: 's' }), /ネットワークエラー/);
  } finally { globalThis.fetch = originalFetch; }
});

test('device cards render lock, curtain, sensors, IR and explicit AC state', () => {
  const device = { deviceId: 'one', deviceName: 'Living room' };
  assert.match(buildDeviceCard({ ...device, deviceType: 'Lock Pro', status: { lockState: 'locked' } }), /施錠中/);
  assert.match(buildDeviceCard({ ...device, deviceType: 'Curtain', status: { slidePosition: 25 } }), /curtain-slider/);
  assert.match(buildDeviceCard({ ...device, deviceType: 'Meter', status: { temperature: 23, humidity: 50 } }), /23/);
  const ac = buildDeviceCard({ ...device, remoteType: 'Air Conditioner', isIR: true }, { one: { temp: 29, mode: 2 } });
  assert.match(ac, /29/);
  assert.match(ac, /data-cmd="acOn"/);
  assert.match(buildDeviceCard({ ...device, deviceType: 'Unrecognized' }), /Unrecognized/);
});
