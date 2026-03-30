// popup.js - SwitchBot Controller popup logic
import { getDevices, getDeviceStatus, sendCommand } from '../utils/api.js';
import { browserAPI } from '../utils/browser.js';

// =====================================================
// Device config: icon, label, category, accent color
// =====================================================
const DEVICE_CONFIG = {
  // Physical
  Bot:                { icon: 'bot',     label: 'スイッチボット',   cat: 'control',   color: '#fb923c' },
  Curtain:            { icon: 'curtain', label: 'カーテン',         cat: 'curtain',   color: '#a78bfa' },
  Curtain3:           { icon: 'curtain', label: 'カーテン3',        cat: 'curtain',   color: '#a78bfa' },
  'Blind Tilt':       { icon: 'blind',   label: 'ブラインド',       cat: 'curtain',   color: '#a78bfa' },
  Lock:               { icon: 'lock',    label: 'スマートロック',   cat: 'security',  color: '#f87171' },
  'Lock Pro':         { icon: 'lock',    label: 'スマートロック Pro',cat: 'security',  color: '#f87171' },
  'Color Bulb':       { icon: 'bulb',    label: 'カラー電球',       cat: 'light',     color: '#fbbf24' },
  'Strip Light':      { icon: 'strip',   label: 'テープライト',     cat: 'light',     color: '#fbbf24' },
  'Plug':             { icon: 'plug',    label: 'スマートプラグ',   cat: 'control',   color: '#34d399' },
  'Plug Mini (US)':   { icon: 'plug',    label: 'プラグミニ',       cat: 'control',   color: '#34d399' },
  'Plug Mini (JP)':   { icon: 'plug',    label: 'プラグミニ (JP)',  cat: 'control',   color: '#34d399' },
  Meter:              { icon: 'meter',   label: '温湿度計',         cat: 'sensor',    color: '#34d399' },
  'Meter Plus':       { icon: 'meter',   label: '温湿度計 Plus',    cat: 'sensor',    color: '#34d399' },
  'Hub 2':            { icon: 'hub',     label: 'ハブ2',            cat: 'hub',       color: '#6366f1' },
  Hub:                { icon: 'hub',     label: 'ハブ',             cat: 'hub',       color: '#6366f1' },
  'Hub Mini':         { icon: 'hub',     label: 'ハブミニ',         cat: 'hub',       color: '#6366f1' },
  'Hub Plus':         { icon: 'hub',     label: 'ハブ Plus',        cat: 'hub',       color: '#6366f1' },
  'Outdoor Meter':    { icon: 'meter',   label: '屋外温湿度計',     cat: 'sensor',    color: '#34d399' },
  'Motion Sensor':    { icon: 'motion',  label: '人感センサー',     cat: 'sensor',    color: '#a78bfa' },
  'Contact Sensor':   { icon: 'contact', label: '開閉センサー',     cat: 'sensor',    color: '#a78bfa' },
  'Water Detector':   { icon: 'water',   label: '水漏れセンサー',   cat: 'sensor',    color: '#60a5fa' },
  'CO2 Sensor':       { icon: 'co2',     label: 'CO2センサー',      cat: 'sensor',    color: '#34d399' },
  'MeterPro(CO2)':    { icon: 'co2',     label: 'CO2センサー',      cat: 'sensor',    color: '#34d399' },
  Humidifier:         { icon: 'humid',   label: '加湿器',           cat: 'climate',   color: '#60a5fa' },
  // IR virtual
  'Air Conditioner':  { icon: 'ac',      label: 'エアコン',         cat: 'climate',   color: '#60a5fa' },
  TV:                 { icon: 'tv',      label: 'テレビ',           cat: 'media',     color: '#f472b6' },
  Light:              { icon: 'bulb',    label: '照明',             cat: 'light',     color: '#fbbf24' },
  Fan:                { icon: 'fan',     label: '扇風機',           cat: 'climate',   color: '#60a5fa' },
  'DIY Fan':          { icon: 'fan',     label: '扇風機 (DIY)',     cat: 'climate',   color: '#60a5fa' },
  'Air Purifier':     { icon: 'purifier',label: '空気清浄機',       cat: 'climate',   color: '#34d399' },
  Camera:             { icon: 'camera',  label: 'カメラ',           cat: 'security',  color: '#f87171' },
  'DVD Player':       { icon: 'tv',      label: 'DVDプレーヤー',    cat: 'media',     color: '#f472b6' },
  Speaker:            { icon: 'speaker', label: 'スピーカー',       cat: 'media',     color: '#f472b6' },
  'Set Top Box':      { icon: 'tv',      label: 'セットトップボックス', cat: 'media', color: '#f472b6' },
  Projector:          { icon: 'projector',label: 'プロジェクター',  cat: 'media',     color: '#f472b6' },
  Others:             { icon: 'remote',  label: 'リモコン',         cat: 'control',   color: '#94a3b8' },
};

// =====================================================
// SVG Icons
// =====================================================
const ICONS = {
  bot: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="8" width="18" height="12" rx="3"/>
    <path d="M8 8V6a4 4 0 0 1 8 0v2"/>
    <circle cx="9" cy="14" r="1.5" fill="currentColor"/>
    <circle cx="15" cy="14" r="1.5" fill="currentColor"/>
    <path d="M9.5 17.5c.8.5 1.7.8 2.5.8s1.7-.3 2.5-.8"/>
  </svg>`,

  curtain: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <path d="M3 3h18M3 3v18M21 3v18"/>
    <path d="M3 3c2 4 3 8 3 12M21 3c-2 4-3 8-3 12"/>
    <path d="M12 3v4"/>
    <circle cx="12" cy="3" r="1" fill="currentColor"/>
  </svg>`,

  blind: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <path d="M3 3h18"/>
    <path d="M3 8h18M3 13h18M3 18h18"/>
    <path d="M12 3v18"/>
  </svg>`,

  lock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <rect x="5" y="11" width="14" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
    <line x1="12" y1="17.5" x2="12" y2="20"/>
  </svg>`,

  bulb: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.2-1.1 4.1-2.7 5.3L15 17H9l-.3-2.7A6 6 0 0 1 6 9a6 6 0 0 1 6-6z"/>
    <path d="M10 21h4"/>
  </svg>`,

  strip: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <rect x="2" y="9" width="20" height="6" rx="3"/>
    <circle cx="7" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
    <path d="M7 9V7M12 9V6M17 9V7"/>
  </svg>`,

  plug: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <path d="M12 22v-5M9 7V2M15 7V2"/>
    <rect x="5" y="7" width="14" height="10" rx="3"/>
    <line x1="9" y1="12" x2="9" y2="12.1" stroke-width="2.5"/>
    <line x1="15" y1="12" x2="15" y2="12.1" stroke-width="2.5"/>
  </svg>`,

  meter: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
    <line x1="11.5" y1="8" x2="12.5" y2="8" stroke-width="1.5"/>
    <line x1="11.5" y1="11" x2="13" y2="11" stroke-width="1.5"/>
  </svg>`,

  hub: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M6.3 17.7a8 8 0 0 1 0-11.4M17.7 6.3a8 8 0 0 1 0 11.4"/>
    <path d="M3 21a13 13 0 0 1 0-18M21 3a13 13 0 0 1 0 18"/>
  </svg>`,

  motion: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <circle cx="12" cy="7" r="3"/>
    <path d="M8 12h8M10 12v8M14 12v8"/>
    <path d="M3 9c1.5-2 4-3 5-1M21 9c-1.5-2-4-3-5-1" stroke-dasharray="2 2"/>
  </svg>`,

  contact: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <rect x="3" y="3" width="14" height="18" rx="1"/>
    <path d="M17 6h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
  </svg>`,

  water: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <path d="M12 2L6 10a6 6 0 0 0 12 0L12 2z"/>
    <path d="M9.5 14.5c.7 1 1.5 1.5 2.5 1.5s1.8-.5 2.5-1.5"/>
  </svg>`,

  ac: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <rect x="2" y="5" width="20" height="10" rx="2"/>
    <path d="M7 15v3M12 15v4M17 15v3"/>
    <path d="M6 10h12M6 10l2-2M18 10l-2-2M6 10l2 2M18 10l-2 2"/>
  </svg>`,

  fan: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <circle cx="12" cy="12" r="2"/>
    <path d="M12 2c0 3.5-2 5-4 5s-5-2-5-2c2 1 3 3 3 5s-1 4-1 4c1-2 3-3 5-3s4 1 4 1c-2-1-3-3-3-5s1-4 1-4z"/>
    <path d="M22 12c-3.5 0-5 2-5 4s2 5 2 5c-1-2-3-3-5-3s-4 1-4 1c2-1 3-3 3-5s-1-4-1-4z"/>
  </svg>`,

  purifier: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <path d="M5 3h14a1 1 0 0 1 1 1v2l-3 4v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-9L4 6V4a1 1 0 0 1 1-1z"/>
    <path d="M4 6h16"/>
    <circle cx="12" cy="14" r="3"/>
    <path d="M12 11v2M12 16v1M9.3 14H11M13 14h1.7M10.2 12.2l.8.8M13 15l.8.8M13 12.2l-.8.8M11 15l-.8.8"/>
  </svg>`,

  tv: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>`,

  camera: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <path d="M23 7l-7 5 7 5V7z"/>
    <rect x="1" y="5" width="15" height="14" rx="2"/>
  </svg>`,

  speaker: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <rect x="4" y="2" width="16" height="20" rx="2"/>
    <circle cx="12" cy="14" r="4"/>
    <circle cx="12" cy="14" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="6" r="1" fill="currentColor"/>
  </svg>`,

  projector: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <rect x="2" y="6" width="20" height="10" rx="2"/>
    <circle cx="8" cy="11" r="2"/>
    <path d="M15 9h4M15 11h4M15 13h4"/>
  </svg>`,

  remote: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <rect x="7" y="2" width="10" height="20" rx="3"/>
    <line x1="12" y1="6" x2="12" y2="6.1" stroke-width="3"/>
    <line x1="9.5" y1="11" x2="9.5" y2="11.1" stroke-width="2.5"/>
    <line x1="14.5" y1="11" x2="14.5" y2="11.1" stroke-width="2.5"/>
    <line x1="9.5" y1="15" x2="9.5" y2="15.1" stroke-width="2.5"/>
    <line x1="14.5" y1="15" x2="14.5" y2="15.1" stroke-width="2.5"/>
    <line x1="12" y1="13" x2="12" y2="13.1" stroke-width="2.5"/>
    <line x1="12" y1="17" x2="12" y2="17.1" stroke-width="2.5"/>
  </svg>`,

  humid: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
    <path d="M12 2L6 10a6 6 0 0 0 12 0L12 2z"/>
    <path d="M8 16c1.5 2 6.5 2 8 0"/>
  </svg>`,

  co2: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 8h3a2 2 0 0 1 0 4H3"/>
    <path d="M10 8h1a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-1V8z"/>
    <path d="M17 8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2"/>
    <path d="M3 16h18M5 19l1-3M19 19l-1-3"/>
  </svg>`,
};

// =====================================================
// State
// =====================================================
let allDevices = [];
let activeFilter = 'all';
let searchQuery = '';
let lastUpdated = null;
let acState = {}; // { [deviceId]: { temp, mode } }

// =====================================================
// Utils
// =====================================================
function $(id) { return document.getElementById(id); }

function showToast(msg, type = 'info') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  requestAnimationFrame(() => {
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
  });
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - date) / 1000);
  if (s < 60) return `${s}秒前`;
  if (s < 3600) return `${Math.floor(s / 60)}分前`;
  return `${Math.floor(s / 3600)}時間前`;
}

function getConfig(deviceType) {
  return DEVICE_CONFIG[deviceType] || { icon: 'remote', label: deviceType, cat: 'control', color: '#94a3b8' };
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// =====================================================
// Init
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadDevices();
});

function setupEventListeners() {
  setupGridListeners();
  $('refreshBtn').addEventListener('click', () => loadDevices(true));

  $('settingsBtn').addEventListener('click', () => {
    browserAPI.runtime.openOptionsPage();
  });

  $('openSettingsFromError').addEventListener('click', () => browserAPI.runtime.openOptionsPage());
  $('openSettingsFromEmpty').addEventListener('click', () => browserAPI.runtime.openOptionsPage());
  $('retryBtn').addEventListener('click', () => loadDevices());

  // Filter tabs
  $('filterTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    activeFilter = tab.dataset.filter;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderDevices();
  });

  // Search
  const searchInput = $('searchInput');
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    $('searchClear').classList.toggle('hidden', !searchQuery);
    renderDevices();
  });

  $('searchClear').addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    $('searchClear').classList.add('hidden');
    renderDevices();
    searchInput.focus();
  });
}

// =====================================================
// Load Devices
// =====================================================
async function loadDevices(forceRefresh = false) {
  showLoading();
  $('refreshBtn').querySelector('svg').parentElement.classList.add('spinning');

  try {
    // Try cache first (within 30s)
    if (!forceRefresh) {
      const cached = await getCached();
      if (cached) {
        allDevices = cached.devices;
        lastUpdated = cached.ts;
        await enrichWithStatus();
        renderDevices();
        showGrid();
        updateFooter();
        return;
      }
    }

    const body = await getDevices();
    const physicalDevices = (body.deviceList || []).map(d => ({ ...d, isIR: false }));
    const irDevices = (body.infraredRemoteList || []).map(d => ({ ...d, isIR: true }));
    allDevices = [...physicalDevices, ...irDevices];

    await setCached(allDevices);
    lastUpdated = Date.now();

    await enrichWithStatus();
    renderDevices();
    showGrid();
    updateFooter();

    if (forceRefresh) showToast('更新しました', 'success');
  } catch (err) {
    showError(err.message);
  } finally {
    $('refreshBtn').querySelector('svg').parentElement.classList.remove('spinning');
  }
}

async function enrichWithStatus() {
  // Fetch status for physical devices in parallel (max 8 at once)
  const physicals = allDevices.filter(d => !d.isIR);
  const chunks = [];
  for (let i = 0; i < physicals.length; i += 8) {
    chunks.push(physicals.slice(i, i + 8));
  }
  for (const chunk of chunks) {
    await Promise.allSettled(
      chunk.map(async (d) => {
        try {
          d.status = await getDeviceStatus(d.deviceId);
        } catch {
          d.status = null;
        }
      })
    );
  }
}

// =====================================================
// Cache
// =====================================================
function getCached() {
  return new Promise((resolve) => {
    browserAPI.storage.local.get(['device_cache'], (r) => {
      const cache = r.device_cache;
      if (!cache || Date.now() - cache.ts > 30000) {
        resolve(null);
      } else {
        resolve(cache);
      }
    });
  });
}

function setCached(devices) {
  return new Promise((resolve) => {
    browserAPI.storage.local.set({ device_cache: { devices, ts: Date.now() } }, resolve);
  });
}

// =====================================================
// Render
// =====================================================
function renderDevices() {
  const grid = $('deviceGrid');

  let filtered = allDevices.filter(d => {
    const cfg = getConfig(d.deviceType || d.remoteType);
    if (activeFilter !== 'all' && cfg.cat !== activeFilter) return false;
    if (searchQuery) {
      const name = (d.deviceName || '').toLowerCase();
      const type = (d.deviceType || d.remoteType || '').toLowerCase();
      const label = cfg.label.toLowerCase();
      if (!name.includes(searchQuery) && !type.includes(searchQuery) && !label.includes(searchQuery)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (searchQuery || activeFilter !== 'all') {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:32px 0;color:var(--text-muted);font-size:12.5px;">
        条件に合うデバイスがありません
      </div>`;
    }
    return;
  }

  grid.innerHTML = filtered.map(d => buildDeviceCard(d)).join('');
}

// =====================================================
// Build Device Card
// =====================================================
function buildDeviceCard(device) {
  const type = device.deviceType || device.remoteType || 'Others';
  const cfg = getConfig(/lock/i.test(type) && type !== 'Keypad' ? 'Lock' : type);
  const iconSvg = ICONS[cfg.icon] || ICONS.remote;
  const color = cfg.color;
  const iconBg = hexToRgba(color, 0.15);
  const status = device.status || {};

  const name = device.deviceName || 'デバイス';
  const id = device.deviceId;

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
        <button class="ctrl-btn unlocked-btn" data-cmd="unlock" data-id="${id}">🔓 解錠</button>
        <button class="ctrl-btn locked-btn" data-cmd="lock" data-id="${id}">🔒 施錠</button>
      `;
      if (status.battery !== undefined) {
        extraHtml = `<div class="card-sensor"><span class="sensor-item">🔋 <span class="sensor-value">${status.battery}%</span></span></div>`;
      }
      break;
    }

    // ---- Curtain / Blind ----
    case 'Curtain':
    case 'Curtain3':
    case 'Blind Tilt': {
      const pos = status.slidePosition ?? status.tilt ?? 0;
      const moving = status.moving;
      badgeHtml = moving
        ? `<span class="status-badge detected">移動中</span>`
        : pos > 50
          ? `<span class="status-badge open">開</span>`
          : `<span class="status-badge close">閉</span>`;
      extraHtml = `
        <div class="curtain-pos-wrap">
          <span class="curtain-pos-label">開度</span>
          <input type="range" min="0" max="100" value="${pos}" class="curtain-slider" data-id="${id}" data-cmd="curtain-pos">
          <span class="curtain-pos-val">${pos}%</span>
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
          <span class="sensor-item">💡 <span class="sensor-value">${bright}%</span></span>
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
        extraHtml = `<div class="card-sensor"><span class="sensor-item">⚡ <span class="sensor-value">${watt} Wh</span></span></div>`;
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
        <button class="ctrl-btn" data-cmd="fanLow" data-id="${id}" title="弱">弱</button>
        <button class="ctrl-btn" data-cmd="fanMid" data-id="${id}" title="中">中</button>
        <button class="ctrl-btn" data-cmd="fanHigh" data-id="${id}" title="強">強</button>
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
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
            <span class="sensor-value">${temp}°C</span>
          </span>
          <span class="sensor-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L6 10a6 6 0 0 0 12 0L12 2z"/></svg>
            <span class="sensor-value">${humid}%</span>
          </span>
          ${status.battery !== undefined ? `<span class="sensor-item">🔋 <span class="sensor-value">${status.battery}%</span></span>` : ''}
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
          <span class="sensor-item">🌡 <span class="sensor-value">${temp}°C</span></span>
          <span class="sensor-item">💧 <span class="sensor-value">${humid}%</span></span>
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
        extraHtml = `<div class="card-sensor"><span class="sensor-item">🔋 <span class="sensor-value">${status.battery}%</span></span></div>`;
      }
      break;
    }

    case 'Contact Sensor': {
      const open = status.openState === 'open';
      badgeHtml = open
        ? `<span class="status-badge open">開</span>`
        : `<span class="status-badge close">閉</span>`;
      if (status.battery !== undefined) {
        extraHtml = `<div class="card-sensor"><span class="sensor-item">🔋 <span class="sensor-value">${status.battery}%</span></span></div>`;
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
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h3a2 2 0 0 1 0 4H3"/><path d="M10 8h1a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-1V8z"/><path d="M17 8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2"/></svg>
            <span class="sensor-value">${co2} ppm</span>
          </span>
          <span class="sensor-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
            <span class="sensor-value">${temp}°C</span>
          </span>
          <span class="sensor-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L6 10a6 6 0 0 0 12 0L12 2z"/></svg>
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
        <span class="sensor-item">💧 <span class="sensor-value">${humidity}%</span></span>
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
    <div class="device-card" data-device-id="${id}" data-type="${type}"
         style="--card-accent:${color};">
      <div class="card-top">
        <div class="device-icon-wrap" style="--icon-bg:${iconBg};--icon-color:${color};">
          ${iconSvg}
        </div>
        <div class="card-info">
          <div class="device-name" title="${name}">${name}</div>
          <div class="device-type-label">${cfg.label}</div>
        </div>
        ${badgeHtml}
      </div>
      ${extraHtml}
      ${controlsHtml ? `<div class="card-controls">${controlsHtml}</div>` : ''}
    </div>
  `;
}

// =====================================================
// Grid event delegation (set up once, uses allDevices)
// =====================================================
function setupGridListeners() {
  const grid = $('deviceGrid');

  function findDevice(id) {
    return allDevices.find(d => d.deviceId === id) || null;
  }

  grid.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-cmd]');
    if (!btn) return;
    const cmd = btn.dataset.cmd;
    const id = btn.dataset.id;
    const device = findDevice(id);
    if (!device) return;
    await executeCommand(device, cmd, btn);
  });

  grid.addEventListener('input', (e) => {
    if (e.target.classList.contains('curtain-slider')) {
      const val = e.target.value;
      e.target.closest('.curtain-pos-wrap').querySelector('.curtain-pos-val').textContent = `${val}%`;
    }
  });

  grid.addEventListener('change', async (e) => {
    if (e.target.classList.contains('curtain-slider')) {
      const id = e.target.dataset.id;
      const pos = parseInt(e.target.value);
      const device = findDevice(id);
      if (!device) return;
      await executeSetPosition(device, pos, e.target);
    }
  });
}

// =====================================================
// Execute commands
// =====================================================
async function executeCommand(device, cmd, btn) {
  const id = device.deviceId;
  const type = device.deviceType || device.remoteType;
  const card = btn.closest('.device-card');

  setCardLoading(card, true);
  btn.disabled = true;

  try {
    let result;

    switch (cmd) {
      // Basic on/off
      case 'turnOn':  result = await sendCommand(id, 'turnOn'); break;
      case 'turnOff': result = await sendCommand(id, 'turnOff'); break;
      case 'press':   result = await sendCommand(id, 'press'); break;

      // Lock
      case 'lock':   result = await sendCommand(id, 'lock'); break;
      case 'unlock': result = await sendCommand(id, 'unlock'); break;

      // Curtain
      case 'curtain-open':  result = await sendCommand(id, 'turnOn'); break;
      case 'curtain-close': result = await sendCommand(id, 'turnOff'); break;
      case 'curtain-pause': result = await sendCommand(id, 'pause'); break;

      // Light brightness
      case 'brightnessUp':   result = await sendCommand(id, 'brightnessUp', 'default', 'command'); break;
      case 'brightnessDown': result = await sendCommand(id, 'brightnessDown', 'default', 'command'); break;

      // AC
      case 'acOn': {
        const ac = acState[id] || { temp: 26, mode: 2 };
        result = await sendCommand(id, 'setAll', `${ac.temp},${ac.mode},1,on`, 'command');
        break;
      }
      case 'acOff': {
        const ac = acState[id] || { temp: 26, mode: 2 };
        result = await sendCommand(id, 'setAll', `${ac.temp},${ac.mode},1,off`, 'command');
        break;
      }
      case 'acTempUp': {
        if (!acState[id]) acState[id] = { temp: 26, mode: 2 };
        acState[id].temp = Math.min(30, acState[id].temp + 1);
        // Re-render this card
        refreshCard(device, card);
        return;
      }
      case 'acTempDown': {
        if (!acState[id]) acState[id] = { temp: 26, mode: 2 };
        acState[id].temp = Math.max(16, acState[id].temp - 1);
        refreshCard(device, card);
        return;
      }

      // Fan
      case 'swing':   result = await sendCommand(id, 'swing'); break;
      case 'fanLow':  result = await sendCommand(id, 'lowSpeed'); break;
      case 'fanMid':  result = await sendCommand(id, 'middleSpeed'); break;
      case 'fanHigh': result = await sendCommand(id, 'highSpeed'); break;

      // TV
      case 'volumeAdd':  result = await sendCommand(id, 'volumeAdd'); break;
      case 'volumeSub':  result = await sendCommand(id, 'volumeSub'); break;
      case 'channelAdd': result = await sendCommand(id, 'channelAdd'); break;
      case 'channelSub': result = await sendCommand(id, 'channelSub'); break;

      default:
        result = await sendCommand(id, cmd);
    }

    showToast('✓ コマンド送信完了', 'success');

    // Refresh status after 1.5s
    setTimeout(async () => {
      try {
        device.status = await getDeviceStatus(id);
        refreshCard(device, card);
      } catch { /* ignore */ }
    }, 1500);

  } catch (err) {
    showToast(`エラー: ${err.message}`, 'error');
  } finally {
    setCardLoading(card, false);
    btn.disabled = false;
  }
}

async function executeSetPosition(device, pos, slider) {
  const id = device.deviceId;
  const card = slider.closest('.device-card');
  setCardLoading(card, true);
  try {
    await sendCommand(id, 'setPosition', `0,ff,${pos}`);
    showToast(`開度 ${pos}% に設定しました`, 'success');
  } catch (err) {
    showToast(`エラー: ${err.message}`, 'error');
  } finally {
    setCardLoading(card, false);
  }
}

function refreshCard(device, cardEl) {
  const newHtml = buildDeviceCard(device);
  const tmp = document.createElement('div');
  tmp.innerHTML = newHtml;
  const newCard = tmp.firstElementChild;
  cardEl.replaceWith(newCard);
  // Grid listener via delegation handles the new card automatically
}

function setCardLoading(card, loading) {
  let overlay = card.querySelector('.card-loading');
  if (loading) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'card-loading';
      overlay.innerHTML = '<div class="mini-spinner"></div>';
      card.appendChild(overlay);
    }
  } else {
    if (overlay) overlay.remove();
  }
}

// =====================================================
// UI state helpers
// =====================================================
function showLoading() {
  $('loadingState').classList.remove('hidden');
  $('errorState').classList.add('hidden');
  $('emptyState').classList.add('hidden');
  $('deviceGrid').classList.add('hidden');
}

function showGrid() {
  $('loadingState').classList.add('hidden');
  $('errorState').classList.add('hidden');
  $('emptyState').classList.add('hidden');
  $('deviceGrid').classList.remove('hidden');
}

function showError(msg) {
  $('loadingState').classList.add('hidden');
  $('errorState').classList.remove('hidden');
  $('deviceGrid').classList.add('hidden');
  $('errorMessage').textContent = msg;
}

function updateFooter() {
  $('deviceCount').textContent = `${allDevices.length} デバイス`;
  if (lastUpdated) {
    $('lastUpdated').textContent = `更新: ${timeAgo(lastUpdated)}`;
  }
  setInterval(() => {
    if (lastUpdated) {
      $('lastUpdated').textContent = `更新: ${timeAgo(lastUpdated)}`;
    }
  }, 10000);
}
