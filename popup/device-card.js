import { getConfig } from './device-config.js';
import { ICONS } from './icons.js';
import { escapeHtml } from '../utils/html.js';

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function buildDeviceCard(device, acState = {}) {
  const type = device.deviceType || device.remoteType || 'Others';
  const cfg = getConfig(/lock/i.test(type) && type !== 'Keypad' ? 'Lock' : type);
  const iconSvg = ICONS[cfg.icon] || ICONS.remote;
  const color = cfg.color;
  const iconBg = hexToRgba(color, 0.15);
  const status = device.status || {};

  const name = escapeHtml(device.deviceName || 'デバイス');
  const id = escapeHtml(device.deviceId);

  // Status badge
  let badgeHtml = '';
  let extraHtml = '';
  let controlsHtml = '';

  // Normalize: any device type containing "Lock" is treated as a lock
  const normalizedType = /lock/i.test(type) && type !== 'Keypad' ? 'Lock' : type;

  switch (normalizedType) {
    // ---- Lock ----
    case 'Lock': {
      const locked = status.lockState === 'locked';
      badgeHtml = locked
        ? `<span class="status-badge locked">施錠中</span>`
        : `<span class="status-badge unlocked">解錠中</span>`;
      controlsHtml = `
        <button class="ctrl-btn unlocked-btn" data-cmd="unlock" data-id="${id}">解錠</button>
        <button class="ctrl-btn locked-btn" data-cmd="lock" data-id="${id}">施錠</button>
      `;
      if (status.battery !== undefined) {
        extraHtml = `<div class="card-sensor"><span class="sensor-item">${ICONS.battery} <span class="sensor-value">${status.battery}%</span></span></div>`;
      }
      break;
    }

    // ---- Curtain / Blind ----
    case 'Curtain':
    case 'Curtain3':
    case 'Blind Tilt': {
      // slidePosition: 0 = fully open, 100 = fully closed (SwitchBot API)
      // openDegree: 0 = fully closed, 100 = fully open (UI representation)
      const pos = status.slidePosition ?? status.tilt ?? 0;
      const openDegree = 100 - pos;
      const moving = status.moving;
      badgeHtml = moving
        ? `<span class="status-badge detected">移動中</span>`
        : pos < 50
          ? `<span class="status-badge open">開</span>`
          : `<span class="status-badge close">閉</span>`;
      extraHtml = `
        <div class="curtain-pos-wrap">
          <span class="curtain-pos-label">開度</span>
          <input type="range" min="0" max="100" value="${openDegree}" class="curtain-slider" data-id="${id}" data-cmd="curtain-pos">
          <span class="curtain-pos-val">${openDegree}%</span>
        </div>
      `;
      controlsHtml = `
        <button class="ctrl-btn open-btn" data-cmd="curtain-open" data-id="${id}">↑ 開く</button>
        <button class="ctrl-btn accent-btn" data-cmd="curtain-pause" data-id="${id}">⏸ 停止</button>
        <button class="ctrl-btn" data-cmd="curtain-close" data-id="${id}">↓ 閉じる</button>
      `;
      break;
    }

    // ---- Bot ----
    case 'Bot': {
      const on = status.power === 'on';
      badgeHtml = on
        ? `<span class="status-badge on">ON</span>`
        : `<span class="status-badge off">OFF</span>`;
      controlsHtml = `
        <button class="ctrl-btn active-on" data-cmd="turnOn" data-id="${id}">ON</button>
        <button class="ctrl-btn active-off" data-cmd="turnOff" data-id="${id}">OFF</button>
        <button class="ctrl-btn accent-btn icon-only" data-cmd="press" data-id="${id}" title="プレス">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>
        </button>
      `;
      break;
    }

    // ---- Color Bulb / Strip Light / Light (IR) ----
    case 'Color Bulb':
    case 'Strip Light':
    case 'Light': {
      const on = status.power === 'on';
      const bright = status.brightness ?? 100;
      badgeHtml = on
        ? `<span class="status-badge on">ON</span>`
        : `<span class="status-badge off">OFF</span>`;
      if (status.color) {
        extraHtml = `<div class="card-sensor">
          <span class="sensor-item">
            <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:rgb(${status.color.replace(/,/g, ',')});border:1px solid rgba(255,255,255,0.2)"></span>
            <span class="sensor-value">${bright}%</span>
          </span>
        </div>`;
      } else if (status.brightness !== undefined) {
        extraHtml = `<div class="card-sensor">
          <span class="sensor-item">${ICONS.bulb} <span class="sensor-value">${bright}%</span></span>
        </div>`;
      }
      controlsHtml = `
        <button class="ctrl-btn active-on" data-cmd="turnOn" data-id="${id}">ON</button>
        <button class="ctrl-btn active-off" data-cmd="turnOff" data-id="${id}">OFF</button>
        <button class="ctrl-btn icon-only" data-cmd="brightnessUp" data-id="${id}" title="明るく">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/><circle cx="12" cy="12" r="5"/></svg>
        </button>
        <button class="ctrl-btn icon-only" data-cmd="brightnessDown" data-id="${id}" title="暗く">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      `;
      break;
    }

    // ---- Plug ----
    case 'Plug':
    case 'Plug Mini (US)':
    case 'Plug Mini (JP)': {
      const on = status.power === 'on';
      const watt = status.electricityOfDay;
      badgeHtml = on
        ? `<span class="status-badge on">ON</span>`
        : `<span class="status-badge off">OFF</span>`;
      if (watt !== undefined) {
        extraHtml = `<div class="card-sensor"><span class="sensor-item">${ICONS.bolt} <span class="sensor-value">${watt} Wh</span></span></div>`;
      }
      controlsHtml = `
        <button class="ctrl-btn active-on" data-cmd="turnOn" data-id="${id}">ON</button>
        <button class="ctrl-btn active-off" data-cmd="turnOff" data-id="${id}">OFF</button>
      `;
      break;
    }

    // ---- Air Conditioner (IR) ----
    case 'Air Conditioner': {
      const ac = acState[id] || { temp: status.temperature || 26, mode: 2 };
      if (!acState[id]) acState[id] = ac;
      const modes = ['', 'AUTO', 'COOL', 'HEAT', 'DRY', 'FAN'];
      badgeHtml = `<span class="status-badge off">IR</span>`;
      extraHtml = `
        <div class="card-ac-info">
          <span class="ac-temp">${ac.temp}<span>°C</span></span>
          <span class="ac-badge">${modes[ac.mode] || 'COOL'}</span>
        </div>
      `;
      controlsHtml = `
        <button class="ctrl-btn active-on" data-cmd="acOn" data-id="${id}">ON</button>
        <button class="ctrl-btn active-off" data-cmd="acOff" data-id="${id}">OFF</button>
        <button class="ctrl-btn icon-only accent-btn" data-cmd="acTempDown" data-id="${id}" title="温度-">▾</button>
        <button class="ctrl-btn icon-only open-btn" data-cmd="acTempUp" data-id="${id}" title="温度+">▴</button>
        <span class="ctrl-break"></span>
        <button class="ctrl-btn ${ac.mode === 1 ? 'accent-btn' : ''}" data-cmd="acMode" data-mode="1" data-id="${id}">自動</button>
        <button class="ctrl-btn ${ac.mode === 2 ? 'open-btn' : ''}" data-cmd="acMode" data-mode="2" data-id="${id}">冷房</button>
        <button class="ctrl-btn ${ac.mode === 3 ? 'locked-btn' : ''}" data-cmd="acMode" data-mode="3" data-id="${id}">暖房</button>
      `;
      break;
    }

    // ---- Fan (IR) ----
    case 'Fan':
    case 'DIY Fan': {
      badgeHtml = `<span class="status-badge off">IR</span>`;
      controlsHtml = `
        <button class="ctrl-btn active-on" data-cmd="turnOn" data-id="${id}">ON</button>
        <button class="ctrl-btn active-off" data-cmd="turnOff" data-id="${id}">OFF</button>
        <button class="ctrl-btn accent-btn" data-cmd="swing" data-id="${id}">首振</button>
        <span class="ctrl-break"></span>
        <button class="ctrl-btn" data-cmd="fanLow" data-id="${id}">弱</button>
        <button class="ctrl-btn" data-cmd="fanMid" data-id="${id}">中</button>
        <button class="ctrl-btn" data-cmd="fanHigh" data-id="${id}">強</button>
      `;
      break;
    }

    // ---- TV ----
    case 'TV':
    case 'Set Top Box':
    case 'DVD Player': {
      badgeHtml = `<span class="status-badge off">IR</span>`;
      controlsHtml = `
        <button class="ctrl-btn active-on" data-cmd="turnOn" data-id="${id}">ON</button>
        <button class="ctrl-btn active-off" data-cmd="turnOff" data-id="${id}">OFF</button>
        <button class="ctrl-btn icon-only" data-cmd="volumeAdd" data-id="${id}" title="音量+">🔊+</button>
        <button class="ctrl-btn icon-only" data-cmd="volumeSub" data-id="${id}" title="音量-">🔉-</button>
        <button class="ctrl-btn icon-only" data-cmd="channelAdd" data-id="${id}" title="CH+">CH+</button>
        <button class="ctrl-btn icon-only" data-cmd="channelSub" data-id="${id}" title="CH-">CH-</button>
      `;
      break;
    }

    // ---- Sensor only: Meter, Motion, Contact ----
    case 'Meter':
    case 'Meter Plus':
    case 'Outdoor Meter': {
      const temp = status.temperature ?? '---';
      const humid = status.humidity ?? '---';
      badgeHtml = `<span class="status-badge on">アクティブ</span>`;
      extraHtml = `
        <div class="card-sensor">
          <span class="sensor-item">
            ${ICONS.meter}
            <span class="sensor-value">${temp}°C</span>
          </span>
          <span class="sensor-item">
            ${ICONS.water}
            <span class="sensor-value">${humid}%</span>
          </span>
          ${status.battery !== undefined ? `<span class="sensor-item">${ICONS.battery} <span class="sensor-value">${status.battery}%</span></span>` : ''}
        </div>
      `;
      break;
    }

    case 'Hub 2': {
      const temp = status.temperature ?? '---';
      const humid = status.humidity ?? '---';
      badgeHtml = `<span class="status-badge on">接続中</span>`;
      extraHtml = `
        <div class="card-sensor">
          <span class="sensor-item">${ICONS.meter} <span class="sensor-value">${temp}°C</span></span>
          <span class="sensor-item">${ICONS.water} <span class="sensor-value">${humid}%</span></span>
        </div>
      `;
      break;
    }

    case 'Motion Sensor': {
      const detected = status.moveDetected;
      badgeHtml = detected
        ? `<span class="status-badge detected">検知中</span>`
        : `<span class="status-badge undetected">待機中</span>`;
      if (status.battery !== undefined) {
        extraHtml = `<div class="card-sensor"><span class="sensor-item">${ICONS.battery} <span class="sensor-value">${status.battery}%</span></span></div>`;
      }
      break;
    }

    case 'Contact Sensor': {
      const open = status.openState === 'open';
      badgeHtml = open
        ? `<span class="status-badge open">開</span>`
        : `<span class="status-badge close">閉</span>`;
      if (status.battery !== undefined) {
        extraHtml = `<div class="card-sensor"><span class="sensor-item">${ICONS.battery} <span class="sensor-value">${status.battery}%</span></span></div>`;
      }
      break;
    }

    case 'Water Detector': {
      const wet = status.status === 1;
      badgeHtml = wet
        ? `<span class="status-badge detected">水検知！</span>`
        : `<span class="status-badge undetected">正常</span>`;
      break;
    }

    case 'CO2 Sensor':
    case 'MeterPro(CO2)': {
      const co2 = status.CO2 ?? status.co2 ?? '---';
      const temp = status.temperature ?? '---';
      const humid = status.humidity ?? '---';
      badgeHtml = `<span class="status-badge on">アクティブ</span>`;
      extraHtml = `
        <div class="card-sensor">
          <span class="sensor-item">
            ${ICONS.co2}
            <span class="sensor-value">${co2} ppm</span>
          </span>
          <span class="sensor-item">
            ${ICONS.meter}
            <span class="sensor-value">${temp}°C</span>
          </span>
          <span class="sensor-item">
            ${ICONS.water}
            <span class="sensor-value">${humid}%</span>
          </span>
        </div>
      `;
      // controlsHtml は意図的に設定しない（操作ボタンなし）
      break;
    }

    case 'Humidifier': {
      const on = status.power === 'on';
      const humidity = status.humidity ?? '---';
      const target = status.nebulizationEfficiency ?? '---';
      badgeHtml = on ? `<span class="status-badge on">ON</span>` : `<span class="status-badge off">OFF</span>`;
      extraHtml = `<div class="card-sensor">
        <span class="sensor-item">${ICONS.water} <span class="sensor-value">${humidity}%</span></span>
        <span class="sensor-item">目標 <span class="sensor-value">${target}%</span></span>
      </div>`;
      controlsHtml = `
        <button class="ctrl-btn active-on" data-cmd="turnOn" data-id="${id}">ON</button>
        <button class="ctrl-btn active-off" data-cmd="turnOff" data-id="${id}">OFF</button>
      `;
      break;
    }

    case 'Air Purifier': {
      badgeHtml = `<span class="status-badge off">IR</span>`;
      controlsHtml = `
        <button class="ctrl-btn active-on" data-cmd="turnOn" data-id="${id}">ON</button>
        <button class="ctrl-btn active-off" data-cmd="turnOff" data-id="${id}">OFF</button>
      `;
      break;
    }

    default: {
      const isSensorOnly = cfg.cat === 'sensor' || cfg.cat === 'hub';
      const on = status.power === 'on';
      badgeHtml = device.isIR
        ? `<span class="status-badge off">IR</span>`
        : on ? `<span class="status-badge on">ON</span>` : `<span class="status-badge off">OFF</span>`;
      if (!isSensorOnly && (!device.isIR || normalizedType === 'Others')) {
        controlsHtml = `
          <button class="ctrl-btn active-on" data-cmd="turnOn" data-id="${id}">ON</button>
          <button class="ctrl-btn active-off" data-cmd="turnOff" data-id="${id}">OFF</button>
        `;
      }
      break;
    }
  }

  return `
    <div class="device-card" data-device-id="${id}" data-type="${escapeHtml(type)}"
         style="--card-accent:${color};">
      <div class="card-top">
        <div class="device-icon-wrap" style="--icon-bg:${iconBg};--icon-color:${color};">
          ${iconSvg}
        </div>
        <div class="card-info">
          <div class="device-name" title="${name}">${name}</div>
          <div class="device-type-label">${escapeHtml(cfg.label)}</div>
        </div>
        ${badgeHtml}
      </div>
      ${extraHtml}
      ${controlsHtml ? `<div class="card-controls">${controlsHtml}</div>` : ''}
    </div>
  `;
}
