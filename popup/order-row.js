import { getConfig } from './device-config.js';
import { ICONS } from './icons.js';
import { escapeHtml } from '../utils/html.js';

export function buildOrderRow(device, { first, last, globalFirst, saving = false }) {
  const type = device.deviceType || device.remoteType || 'Others';
  const cfg = getConfig(/lock/i.test(type) && type !== 'Keypad' ? 'Lock' : type);
  const id = escapeHtml(device.deviceId);
  const name = escapeHtml(device.deviceName || 'デバイス');
  const button = (action, disabled, label) => `<button class="order-btn" data-order-action="${action}" data-id="${id}" ${disabled || saving ? 'disabled' : ''} title="${label}" aria-label="${name}を${label}">${ICONS[action]}</button>`;
  return `<div class="order-row" role="listitem" data-device-id="${id}" draggable="${!saving}">
    <span class="order-grip" aria-hidden="true">${ICONS.grip}</span>
    <div class="device-icon-wrap" style="--icon-color:${cfg.color}">${ICONS[cfg.icon] || ICONS.remote}</div>
    <div class="card-info"><div class="device-name" title="${name}">${name}</div><div class="device-type-label">${escapeHtml(cfg.label)}</div></div>
    <div class="order-actions">${button('first', globalFirst, '先頭へ移動')}${button('up', first, '上へ移動')}${button('down', last, '下へ移動')}</div>
  </div>`;
}
