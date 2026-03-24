// options.js - Settings page logic

document.addEventListener('DOMContentLoaded', () => {
  loadSavedCredentials();
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
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`section-${sectionId}`).classList.add('active');
    });
  });
}

// =====================================================
// Load credentials
// =====================================================
function loadSavedCredentials() {
  chrome.storage.local.get(['switchbot_token', 'switchbot_secret'], (result) => {
    const tokenInput = document.getElementById('tokenInput');
    const secretInput = document.getElementById('secretInput');

    if (result.switchbot_token) {
      tokenInput.value = result.switchbot_token;
      tokenInput.classList.add('valid');
      setHint('tokenHint', '保存済み ✓', 'success');
    }
    if (result.switchbot_secret) {
      secretInput.value = result.switchbot_secret;
      secretInput.classList.add('valid');
      setHint('secretHint', '保存済み ✓', 'success');
    }
  });
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
    if (!confirm('APIトークンとシークレットを削除しますか？')) return;
    await clearCredentials();
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
    await new Promise((resolve, reject) => {
      chrome.storage.local.set(
        { switchbot_token: token, switchbot_secret: secret },
        () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        }
      );
    });

    // Clear device cache so popup reloads
    chrome.storage.local.remove('device_cache');

    setHint('tokenHint', '保存済み ✓', 'success');
    setHint('secretHint', '保存済み ✓', 'success');
    document.getElementById('tokenInput').classList.add('valid');
    document.getElementById('secretInput').classList.add('valid');

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
    const t = Date.now();
    const nonce = crypto.randomUUID();
    const data = token + t + nonce;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const sign = btoa(String.fromCharCode(...new Uint8Array(signature)));

    const resp = await fetch('https://api.switch-bot.com/v1.1/devices', {
      headers: {
        Authorization: token,
        sign,
        nonce,
        t: String(t),
        'Content-Type': 'application/json; charset=utf8',
      },
    });

    const json = await resp.json();

    if (json.statusCode === 100) {
      const physCount = (json.body?.deviceList || []).length;
      const irCount = (json.body?.infraredRemoteList || []).length;
      resultInner.className = 'test-result-inner success';
      resultInner.innerHTML = `
        ✓ 接続成功！<br>
        <span style="font-size:12px;opacity:0.85;">
          物理デバイス: ${physCount}台 ／ IRリモコン: ${irCount}台
        </span>
      `;
      showToast('✓ 接続成功', 'success');
    } else {
      resultInner.className = 'test-result-inner error';
      resultInner.textContent = `✗ APIエラー: ${json.message || json.statusCode}`;
      showToast('接続失敗', 'error');
    }
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
  await new Promise((resolve) => {
    chrome.storage.local.remove(['switchbot_token', 'switchbot_secret', 'device_cache'], resolve);
  });

  document.getElementById('tokenInput').value = '';
  document.getElementById('secretInput').value = '';
  document.getElementById('tokenInput').classList.remove('valid', 'invalid');
  document.getElementById('secretInput').classList.remove('valid', 'invalid');
  setHint('tokenHint', '');
  setHint('secretHint', '');
  document.getElementById('testResult').classList.add('hidden');

  showToast('認証情報を削除しました', 'info');
}

// =====================================================
// Eye (show/hide password) buttons
// =====================================================
function setupEyeButtons() {
  document.querySelectorAll('.input-eye').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      const showIcon = btn.querySelector('.eye-show');
      const hideIcon = btn.querySelector('.eye-hide');

      if (input.type === 'password') {
        input.type = 'text';
        showIcon.classList.add('hidden');
        hideIcon.classList.remove('hidden');
      } else {
        input.type = 'password';
        showIcon.classList.remove('hidden');
        hideIcon.classList.add('hidden');
      }
    });
  });
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
