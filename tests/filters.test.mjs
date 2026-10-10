import test from 'node:test';
import assert from 'node:assert/strict';
import { getAvailableFilters, getDeviceCategory } from '../popup/filters.js';
const ids = devices => getAvailableFilters(devices).map(filter => filter.id);

test('only registered physical and infrared categories are available', () => {
  const devices = [
    { deviceType: 'Meter Plus' },
    { remoteType: 'Air Conditioner', isIR: true },
    { deviceType: 'Meter' },
    { deviceType: 'Color Bulb' },
  ];
  assert.deepEqual(ids(devices), ['all', 'light', 'climate', 'sensor']);
  assert.deepEqual(ids([{ remoteType: 'TV', isIR: true }]), ['all', 'media']);
  assert.deepEqual(ids([{ deviceType: 'Hub 2' }]), ['all', 'hub']);
});

test('no devices and removal of the final device remove category options', () => {
  assert.deepEqual(ids([]), ['all']);
  const devices = [{ deviceType: 'Bot' }, { deviceType: 'Curtain3' }];
  assert.deepEqual(ids(devices), ['all', 'curtain', 'control']);
  assert.deepEqual(ids(devices.slice(0, 1)), ['all', 'control']);
});

test('new lock variants use the same security category as their cards', () => {
  assert.equal(getDeviceCategory({ deviceType: 'Lock Ultra' }), 'security');
  assert.deepEqual(ids([{ deviceType: 'Lock Ultra' }, { deviceType: 'Lock Pro' }]), ['all', 'security']);
});

test('unknown and missing device types remain accessible under switches', () => {
  assert.deepEqual(ids([{ deviceType: 'New Device' }, {}, { remoteType: 'Others' }]), ['all', 'control']);
});
