import { getConfig } from './device-config.js';

const FILTERS = [
  { id: 'all', label: 'すべて' },
  { id: 'light', label: 'ライト' },
  { id: 'climate', label: '空調' },
  { id: 'security', label: 'セキュリティ' },
  { id: 'curtain', label: 'カーテン' },
  { id: 'sensor', label: 'センサー' },
  { id: 'media', label: 'メディア' },
  { id: 'control', label: 'スイッチ' },
  { id: 'hub', label: 'ハブ' },
];

export function getDeviceCategory(device) {
  const type = device.deviceType || device.remoteType || 'Others';
  // Match the lock normalization used by device-card.js.
  return getConfig(/lock/i.test(type) && type !== 'Keypad' ? 'Lock' : type).cat;
}

export function getAvailableFilters(devices) {
  const categories = new Set(devices.map(getDeviceCategory));
  return FILTERS.filter(filter => filter.id === 'all' || categories.has(filter.id));
}

export function buildFilterTabs(filters, activeFilter = 'all') {
  return filters.map(({ id, label }) => {
    const selected = id === activeFilter;
    return `<button class="tab${selected ? ' active' : ''}" data-filter="${id}" aria-pressed="${selected}">${label}</button>`;
  }).join('');
}
