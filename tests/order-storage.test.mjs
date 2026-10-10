import test from 'node:test';
import assert from 'node:assert/strict';
const values = {};
globalThis.chrome = {storage:{local:{
  async get(keys) {return Object.fromEntries(keys.map(key=>[key,values[key]]));},
  async set(next) {Object.assign(values,next);},
  async remove(keys) {for(const key of [keys].flat()) delete values[key];},
}}};
const {getDeviceOrder,saveDeviceOrder,saveCredentials,clearCredentials} = await import('../utils/storage.js');

test('order persists independently of device caches and credential saves', async () => {
  await saveDeviceOrder(['tv','light','tv']);
  assert.deepEqual(await getDeviceOrder(),['tv','light']);
  await saveCredentials('token','secret');
  assert.deepEqual(await getDeviceOrder(),['tv','light']);
});

test('legacy and malformed saved orders do not break device loading', async () => {
  values.device_order = {unexpected:true};
  assert.deepEqual(await getDeviceOrder(),[]);
  values.device_order = ['one',3,'two','one',null];
  assert.deepEqual(await getDeviceOrder(),['one','two']);
});

test('deleting saved data removes device order as well', async () => {
  await saveDeviceOrder(['tv']);
  await clearCredentials();
  assert.deepEqual(await getDeviceOrder(),[]);
});
