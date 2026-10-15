// popup.js - SwitchBot Controller popup logic
import { getDevices, getDeviceStatus, sendCommand } from '../utils/api.js';
import { browserAPI } from '../utils/browser.js';
import { getCached, setCached, getDeviceOrder, saveDeviceOrder } from '../utils/storage.js';
import { getConfig } from './device-config.js';
import { buildDeviceCard } from './device-card.js';
import { getAvailableFilters, getDeviceCategory, buildFilterTabs } from './filters.js';
import { applyDeviceOrder, moveVisibleDevice, moveDeviceToTop } from './device-order.js';
import { buildOrderRow } from './order-row.js';
import { createSafeFragment } from '../utils/dom.js';

// =====================================================
// State
// =====================================================
let allDevices = [];
let activeFilter = 'all';
let searchQuery = '';
let lastUpdated = null;
let acState = {}; // { [deviceId]: { temp, mode } }
let savedDeviceOrder = [];
let isReordering = false;
let isSavingOrder = false;
let draggedDeviceId = null;

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

// =====================================================
// Init
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  setInterval(updateFooter, 10000);
  try {
    savedDeviceOrder = await getDeviceOrder();
  } catch {
    showToast('保存した並び順を読み込めませんでした', 'error');
  }
  await loadDevices();
});

function setupEventListeners() {
  setupGridListeners();
  setupOrderListeners();
  $('reorderBtn').addEventListener('click', () => {
    setReordering(!isReordering);
    renderDevices();
  });
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
    updateFilterSelection();
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
        allDevices = applyDeviceOrder(cached.devices, savedDeviceOrder);
        lastUpdated = cached.ts;
        updateFilterTabs();
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
    allDevices = applyDeviceOrder([...physicalDevices, ...irDevices], savedDeviceOrder);
    updateFilterTabs();

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
    if (allDevices.length < 2 && isReordering) {
      setReordering(false);
      renderDevices();
    }
    $('reorderBtn').disabled = allDevices.length < 2 || !$('errorState').classList.contains('hidden');
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
// Render
// =====================================================
function setReordering(enabled) {
  isReordering = enabled;
  $('reorderBtn').textContent = enabled ? '完了' : '並び替え';
  $('reorderBtn').setAttribute('aria-pressed', String(enabled));
  $('orderHint').classList.toggle('hidden', !enabled);
  $('orderHint').textContent = 'ドラッグか矢印で移動。先頭ボタンで一番上へ。';
}

function updateFilterSelection() {
  $('filterTabs').querySelectorAll('.tab').forEach(tab => {
    const selected = tab.dataset.filter === activeFilter;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-pressed', String(selected));
  });
}

function updateFilterTabs() {
  const filters = getAvailableFilters(allDevices);
  // A refresh can remove the final device in the selected category.
  if (!filters.some(filter => filter.id === activeFilter)) activeFilter = 'all';
  $('filterTabs').replaceChildren(createSafeFragment(buildFilterTabs(filters, activeFilter)));
}

function renderDevices() {
  const grid = $('deviceGrid');
  grid.setAttribute('aria-busy', String(isSavingOrder));
  if (isReordering) grid.setAttribute('role', 'list');
  else grid.removeAttribute('role');

  const filtered = getFilteredDevices();

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (searchQuery || activeFilter !== 'all') {
      grid.innerHTML = `<div class="no-results">条件に合うデバイスがありません</div>`;
    }
    return;
  }

  const html = isReordering
    ? filtered.map((device, index) => buildOrderRow(device, {
      first: index === 0, last: index === filtered.length - 1,
      globalFirst: device.deviceId === allDevices[0]?.deviceId, saving: isSavingOrder,
    })).join('')
    : filtered.map(d => buildDeviceCard(d, acState)).join('');
  grid.replaceChildren(createSafeFragment(html));
}

function getFilteredDevices() {
  return allDevices.filter(d => {
    const cfg = getConfig(d.deviceType || d.remoteType || 'Others');
    if (activeFilter !== 'all' && getDeviceCategory(d) !== activeFilter) return false;
    if (searchQuery) {
      const name = (d.deviceName || '').toLowerCase();
      const type = (d.deviceType || d.remoteType || '').toLowerCase();
      const label = cfg.label.toLowerCase();
      if (!name.includes(searchQuery) && !type.includes(searchQuery) && !label.includes(searchQuery)) return false;
    }
    return true;
  });
}

async function commitDeviceOrder(devices, focusId, action) {
  if (isSavingOrder || devices.every((device, index) => device === allDevices[index])) return;
  isSavingOrder = true;
  $('reorderBtn').disabled = true;
  $('refreshBtn').disabled = true;
  $('orderHint').textContent = '並び順を保存しています…';
  renderDevices();
  try {
    const ids = devices.map(device => device.deviceId);
    await saveDeviceOrder(ids);
    savedDeviceOrder = ids;
    allDevices = devices;
    $('orderHint').textContent = '並び順を保存しました。閉じてもこの順番で表示します。';
  } catch (error) {
    $('orderHint').textContent = '保存できませんでした。もう一度お試しください。';
    showToast(`並び順の保存エラー: ${error.message}`, 'error');
  } finally {
    isSavingOrder = false;
    $('reorderBtn').disabled = allDevices.length < 2;
    $('refreshBtn').disabled = false;
    renderDevices();
    const row = [...$('deviceGrid').querySelectorAll('.order-row')].find(row => row.dataset.deviceId === focusId);
    if (row && action) {
      const preferred = row.querySelector(`[data-order-action="${action}"]`);
      const button = preferred && !preferred.disabled ? preferred : row.querySelector('.order-btn:not(:disabled)');
      button?.focus();
    }
  }
}

function setupOrderListeners() {
  const grid = $('deviceGrid');
  grid.addEventListener('click', async e => {
    const button = e.target.closest('[data-order-action]');
    if (!isReordering || isSavingOrder || !button || button.disabled) return;
    const id = button.dataset.id;
    const action = button.dataset.orderAction;
    const visibleIds = getFilteredDevices().map(device => device.deviceId);
    const index = visibleIds.indexOf(id);
    const target = visibleIds[index + (action === 'up' ? -1 : 1)];
    const devices = action === 'first' ? moveDeviceToTop(allDevices, id)
      : moveVisibleDevice(allDevices, visibleIds, id, target);
    await commitDeviceOrder(devices, id, action);
  });
  const clearDrag = () => {
    draggedDeviceId = null;
    grid.querySelectorAll('.dragging, .drop-target').forEach(row => row.classList.remove('dragging', 'drop-target'));
  };
  grid.addEventListener('dragstart', e => {
    const row = e.target.closest('.order-row');
    if (!isReordering || isSavingOrder || !row) { e.preventDefault(); return; }
    draggedDeviceId = row.dataset.deviceId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedDeviceId);
    row.classList.add('dragging');
  });
  grid.addEventListener('dragover', e => {
    const row = e.target.closest('.order-row');
    if (!draggedDeviceId || !row || isSavingOrder) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    grid.querySelectorAll('.drop-target').forEach(item => item.classList.remove('drop-target'));
    if (row.dataset.deviceId !== draggedDeviceId) row.classList.add('drop-target');
  });
  grid.addEventListener('drop', async e => {
    const row = e.target.closest('.order-row');
    if (!draggedDeviceId || !row || isSavingOrder) return;
    e.preventDefault();
    const id = draggedDeviceId;
    const devices = moveVisibleDevice(allDevices, getFilteredDevices().map(device => device.deviceId), id, row.dataset.deviceId);
    clearDrag();
    await commitDeviceOrder(devices, id);
  });
  grid.addEventListener('dragend', clearDrag);
  grid.addEventListener('dragleave', e => {
    if (!grid.contains(e.relatedTarget)) grid.querySelectorAll('.drop-target').forEach(row => row.classList.remove('drop-target'));
  });
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
    if (isReordering) return;
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
  const card = btn.closest('.device-card');

  setCardLoading(card, true);
  btn.disabled = true;

  try {

    switch (cmd) {
      // Basic on/off
      case 'turnOn':  await sendCommand(id, 'turnOn'); break;
      case 'turnOff': await sendCommand(id, 'turnOff'); break;
      case 'press':   await sendCommand(id, 'press'); break;

      // Lock
      case 'lock':   await sendCommand(id, 'lock'); break;
      case 'unlock': await sendCommand(id, 'unlock'); break;

      // Curtain
      case 'curtain-open':  await sendCommand(id, 'turnOn'); break;
      case 'curtain-close': await sendCommand(id, 'turnOff'); break;
      case 'curtain-pause': await sendCommand(id, 'pause'); break;

      // Light brightness
      case 'brightnessUp':   await sendCommand(id, 'brightnessUp', 'default', 'command'); break;
      case 'brightnessDown': await sendCommand(id, 'brightnessDown', 'default', 'command'); break;

      // AC
      case 'acOn': {
        const ac = acState[id] || { temp: 26, mode: 2 };
        await sendCommand(id, 'setAll', `${ac.temp},${ac.mode},1,on`, 'command');
        break;
      }
      case 'acOff': {
        const ac = acState[id] || { temp: 26, mode: 2 };
        await sendCommand(id, 'setAll', `${ac.temp},${ac.mode},1,off`, 'command');
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
      case 'acMode': {
        if (!acState[id]) acState[id] = { temp: 26, mode: 2 };
        acState[id].mode = parseInt(btn.dataset.mode);
        refreshCard(device, card);
        return;
      }

      // Fan
      case 'swing':   await sendCommand(id, 'swing'); break;
      case 'fanLow':  await sendCommand(id, 'lowSpeed'); break;
      case 'fanMid':  await sendCommand(id, 'middleSpeed'); break;
      case 'fanHigh': await sendCommand(id, 'highSpeed'); break;

      // TV
      case 'volumeAdd':  await sendCommand(id, 'volumeAdd'); break;
      case 'volumeSub':  await sendCommand(id, 'volumeSub'); break;
      case 'channelAdd': await sendCommand(id, 'channelAdd'); break;
      case 'channelSub': await sendCommand(id, 'channelSub'); break;

      default:
        await sendCommand(id, cmd);
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
    // API uses 0=open, 100=closed; slider pos is open degree (0=closed, 100=open)
    await sendCommand(id, 'setPosition', `0,ff,${100 - pos}`);
    showToast(`開度 ${pos}% に設定しました`, 'success');
  } catch (err) {
    showToast(`エラー: ${err.message}`, 'error');
  } finally {
    setCardLoading(card, false);
  }
}

function refreshCard(device, cardEl) {
  if (isReordering || !cardEl.isConnected) return;
  const newHtml = buildDeviceCard(device, acState);
  const newCard = createSafeFragment(newHtml).firstElementChild;
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
  $('reorderBtn').disabled = true;
  $('loadingState').classList.remove('hidden');
  $('errorState').classList.add('hidden');
  $('emptyState').classList.add('hidden');
  $('deviceGrid').classList.add('hidden');
}

function showGrid() {
  $('loadingState').classList.add('hidden');
  $('errorState').classList.add('hidden');
  $('emptyState').classList.toggle('hidden', allDevices.length > 0);
  $('deviceGrid').classList.toggle('hidden', allDevices.length === 0);
}

function showError(msg) {
  $('loadingState').classList.add('hidden');
  $('errorState').classList.remove('hidden');
  $('emptyState').classList.add('hidden');
  $('deviceGrid').classList.add('hidden');
  $('errorMessage').textContent = msg;
}

function updateFooter() {
  $('deviceCount').textContent = `${allDevices.length} デバイス`;
  if (lastUpdated) {
    $('lastUpdated').textContent = `更新: ${timeAgo(lastUpdated)}`;
  }
}
