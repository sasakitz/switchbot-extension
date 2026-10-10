// options.js - Settings page logic
import { getCredentials, saveCredentials as storeCredentials, clearCredentials as removeCredentials } from '../utils/storage.js';
import { testConnection as testApiConnection } from '../utils/api.js';
import { browserAPI } from '../utils/browser.js';

document.addEventListener('DOMContentLoaded', () => {
  loadSavedCredentials().catch(err => showToast(`設定の読み込みに失敗しました: ${err.message}`, 'error'));
  document.getElementById('appVersion').textContent = `Version ${browserAPI.runtime.getManifest().version}`;
  setupNavigation();
  setupForm();
  setupEyeButtons();
});

// =====================================================
// Navigation
// =====================================================
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const sectionId = btn.dataset.section;
      document.querySelectorAll('.nav-item').forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${sectionId}`).classList.add('active');
    });
  });
}

// =====================================================
// Load credentials
// =====================================================
async function loadSavedCredentials() {
  const { token, secret } = await getCredentials();
  const tokenInput = document.getElementById('tokenInput');
  const secretInput = document.getElementById('secretInput');

  if (token) {
    tokenInput.value = token;
    tokenInput.classList.add('valid');
    setHint('tokenHint', '保存済み ✓', 'success');
  }
  if (secret) {
    secretInput.value = secret;
    secretInput.classList.add('valid');
    setHint('secretHint', '保存済み ✓', 'success');
  }
}

// =====================================================
// Form setup
// =====================================================
function setupForm() {
  const form = document.getElementById('credentialsForm');
  const tokenInput = document.getElementById('tokenInput');
  const secretInput = document.getElementById('secretInput');
  const testBtn = document.getElementById('testBtn');
  const clearBtn = document.getElementById('clearBtn');

  // Live validation
  tokenInput.addEventListener('input', () => validateField(tokenInput, 'tokenHint'));
  secretInput.addEventListener('input', () => validateField(secretInput, 'secretHint'));

  // Save
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveCredentials();
  });

  // Test
  testBtn.addEventListener('click', async () => {
    await testConnection();
  });

  // Clear
  clearBtn.addEventListener('click', async () => {
    if (!confirm('APIトークン・シークレット・デバイスキャッシュ・保存した並び順を削除しますか？')) return;
    try {
      await clearCredentials();
    } catch (err) {
      showToast(`削除エラー: ${err.message}`, 'error');
    }
  });
}

// =====================================================
// Validation
// =====================================================
function validateField(input, hintId) {
  const value = input.value.trim();
  if (!value) {
    input.classList.remove('valid', 'invalid');
    setHint(hintId, '');
    return false;
  }
  if (value.length < 20) {
    input.classList.remove('valid');
    input.classList.add('invalid');
    setHint(hintId, '短すぎます（20文字以上）', 'error');
    return false;
  }
  input.classList.remove('invalid');
  input.classList.add('valid');
  setHint(hintId, '');
  return true;
}

function setHint(id, msg, type = '') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `form-hint ${type}`;
}

// =====================================================
// Save credentials
// =====================================================
async function saveCredentials() {
  const token = document.getElementById('tokenInput').value.trim();
  const secret = document.getElementById('secretInput').value.trim();
  const saveBtn = document.getElementById('saveBtn');

  if (!token || !secret) {
    showToast('トークンとシークレットの両方を入力してください', 'error');
    return;
  }

  const origContent = saveBtn.innerHTML;
  saveBtn.innerHTML = `<span class="spinner-inline"></span> 保存中...`;
  saveBtn.disabled = true;

  try {
    await storeCredentials(token, secret);

    setHint('tokenHint', '保存済み ✓', 'success');
    setHint('secretHint', '保存済み ✓', 'success');
    for (const id of ['tokenInput', 'secretInput']) {
      const input = document.getElementById(id);
      input.classList.remove('invalid');
      input.classList.add('valid');
    }

    showToast('✓ 設定を保存しました', 'success');
  } catch (err) {
    showToast(`保存エラー: ${err.message}`, 'error');
  } finally {
    saveBtn.innerHTML = origContent;
    saveBtn.disabled = false;
  }
}

// =====================================================
// Test connection
// =====================================================
async function testConnection() {
  const token = document.getElementById('tokenInput').value.trim();
  const secret = document.getElementById('secretInput').value.trim();
  const testBtn = document.getElementById('testBtn');
  const resultEl = document.getElementById('testResult');
  const resultInner = document.getElementById('testResultInner');

  if (!token || !secret) {
    showToast('テスト前にトークンとシークレットを入力してください', 'error');
    return;
  }

  const origContent = testBtn.innerHTML;
  testBtn.innerHTML = `<span class="spinner-inline"></span> テスト中...`;
  testBtn.disabled = true;
  resultEl.classList.add('hidden');

  try {
    const devices = await testApiConnection({ token, secret });
    const physCount = (devices?.deviceList || []).length;
    const irCount = (devices?.infraredRemoteList || []).length;
    resultInner.className = 'test-result-inner success';
    resultInner.innerHTML = `
      ✓ 接続成功！<br>
      <span style="font-size:12px;opacity:0.85;">
        物理デバイス: ${physCount}台 ／ IRリモコン: ${irCount}台
      </span>
    `;
    showToast('✓ 接続成功', 'success');
  } catch (err) {
    resultInner.className = 'test-result-inner error';
    resultInner.textContent = `✗ エラー: ${err.message}`;
    showToast('接続テスト失敗', 'error');
  } finally {
    testBtn.innerHTML = origContent;
    testBtn.disabled = false;
    resultEl.classList.remove('hidden');
  }
}

// =====================================================
// Clear credentials
// =====================================================
async function clearCredentials() {
  await removeCredentials();

  document.getElementById('tokenInput').value = '';
  document.getElementById('secretInput').value = '';
  document.getElementById('tokenInput').classList.remove('valid', 'invalid');
  document.getElementById('secretInput').classList.remove('valid', 'invalid');
  setHint('tokenHint', '');
  setHint('secretHint', '');
  document.getElementById('testResult').classList.add('hidden');
  document.querySelectorAll('.input-eye').forEach(btn => setPasswordVisibility(btn, false));

  showToast('認証情報を削除しました', 'info');
}

// =====================================================
// Eye (show/hide password) buttons
// =====================================================
function setupEyeButtons() {
  document.querySelectorAll('.input-eye').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      setPasswordVisibility(btn, input.type === 'password');
    });
  });
}

function setPasswordVisibility(btn, visible) {
  const input = document.getElementById(btn.dataset.target);
  const label = document.querySelector(`label[for="${input.id}"]`).textContent.trim();
  input.type = visible ? 'text' : 'password';
  btn.querySelector('.eye-show').classList.toggle('hidden', visible);
  btn.querySelector('.eye-hide').classList.toggle('hidden', !visible);
  btn.setAttribute('aria-pressed', String(visible));
  btn.setAttribute('aria-label', `${label}を${visible ? '隠す' : '表示'}`);
}

// =====================================================
// Toast
// =====================================================
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}
