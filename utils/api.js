// SwitchBot API v1.1 Client
import { browserAPI } from './browser.js';

const SWITCHBOT_API_BASE = 'https://api.switch-bot.com/v1.1';

async function generateSign(token, secret) {
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

  return { t, nonce, sign };
}

async function getCredentials() {
  return new Promise((resolve) => {
    browserAPI.storage.local.get(['switchbot_token', 'switchbot_secret'], (result) => {
      resolve({
        token: result.switchbot_token || '',
        secret: result.switchbot_secret || '',
      });
    });
  });
}

async function apiRequest(endpoint, method = 'GET', body = null) {
  const { token, secret } = await getCredentials();

  if (!token || !secret) {
    const err = new Error('API認証情報が未設定です。設定画面でトークンとシークレットを入力してください。');
    err.code = 'NO_CREDENTIALS';
    throw err;
  }

  const { t, nonce, sign } = await generateSign(token, secret);

  const headers = {
    Authorization: token,
    sign,
    nonce,
    t: String(t),
    'Content-Type': 'application/json; charset=utf8',
  };

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${SWITCHBOT_API_BASE}${endpoint}`, options);
  } catch (e) {
    throw new Error('ネットワークエラー: APIサーバーに接続できません。');
  }

  const data = await response.json();

  if (data.statusCode !== 100) {
    throw new Error(data.message || `APIエラー: ${data.statusCode}`);
  }

  return data.body;
}

export async function getDevices() {
  return apiRequest('/devices');
}

export async function getDeviceStatus(deviceId) {
  return apiRequest(`/devices/${deviceId}/status`);
}

export async function sendCommand(deviceId, command, parameter = 'default', commandType = 'command') {
  return apiRequest(`/devices/${deviceId}/commands`, 'POST', {
    command,
    parameter,
    commandType,
  });
}

export async function testConnection() {
  return apiRequest('/devices');
}

export { getCredentials };
