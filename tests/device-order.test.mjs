import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDeviceOrder, moveVisibleDevice, moveDeviceToTop } from '../popup/device-order.js';
import { buildOrderRow } from '../popup/order-row.js';

const devices = ['light', 'sensor', 'curtain', 'tv'].map(deviceId => ({deviceId, deviceName: deviceId}));
const ids = devices => devices.map(d => d.deviceId);

test('saved order survives a different API order and newly registered devices append', () => {
  const apiDevices = [...devices].reverse();
  assert.deepEqual(ids(applyDeviceOrder(apiDevices, ['curtain', 'missing-device', 'light'])), ['curtain', 'light', 'tv', 'sensor']);
  assert.deepEqual(ids(applyDeviceOrder(apiDevices, [])), ids(apiDevices));
  assert.deepEqual(ids(devices), ['light', 'sensor', 'curtain', 'tv']);
});

test('moving a visible device leaves filtered-out devices in their slots', () => {
  const moved = moveVisibleDevice(devices, ['light', 'curtain', 'tv'], 'tv', 'light');
  assert.deepEqual(ids(moved), ['tv', 'sensor', 'light', 'curtain']);
  const down = moveVisibleDevice(moved, ['tv', 'light', 'curtain'], 'tv', 'curtain');
  assert.deepEqual(ids(down), ids(devices));
});

test('a frequently used device can move to the global top from any filter', () => {
  assert.deepEqual(ids(moveDeviceToTop(devices, 'curtain')), ['curtain', 'light', 'sensor', 'tv']);
  assert.deepEqual(ids(moveDeviceToTop(devices, 'missing')), ids(devices));
});

test('invalid and unchanged drop targets do not alter the order', () => {
  for (const target of ['missing', 'sensor', 'light']) {
    assert.deepEqual(ids(moveVisibleDevice(devices, ['light', 'curtain'], 'light', target)), ids(devices));
  }
});

test('reordering labels escape API-provided names and IDs', () => {
  const row = buildOrderRow({deviceId:'one"two',deviceName:'<img src=x onerror=alert(1)>',deviceType:'Bot'}, {first:true,last:false,globalFirst:true});
  assert.ok(!row.includes('<img'));
  assert.match(row, /&lt;img/);
  assert.match(row, /one&quot;two/);
});
