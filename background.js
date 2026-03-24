// Service Worker - SwitchBot Controller Extension

function drawIcon(size) {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const r = size / 2;

  // Background circle with gradient
  const grad = ctx.createRadialGradient(cx * 0.8, cx * 0.6, 0, cx, cx, r);
  grad.addColorStop(0, '#6366f1');
  grad.addColorStop(0.5, '#4f46e5');
  grad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cx, r, 0, Math.PI * 2);
  ctx.fill();

  // White "S" letter as stylized SwitchBot icon
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.arc(cx, cx, r * 0.75, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = size * 0.1;
  ctx.lineCap = 'round';

  // Power button icon
  const pw = size * 0.28;
  ctx.beginPath();
  ctx.arc(cx, cx + size * 0.04, pw, Math.PI * 0.28, Math.PI * 0.72, false);
  ctx.stroke();

  ctx.lineWidth = size * 0.09;
  ctx.beginPath();
  ctx.moveTo(cx, cx - pw * 0.3);
  ctx.lineTo(cx, cx - pw * 1.05);
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}

chrome.runtime.onInstalled.addListener(() => {
  try {
    const imageData = {
      16: drawIcon(16),
      32: drawIcon(32),
      48: drawIcon(48),
      128: drawIcon(128),
    };
    chrome.action.setIcon({ imageData });
  } catch (e) {
    console.warn('Icon draw failed:', e);
  }
});

chrome.runtime.onStartup.addListener(() => {
  try {
    const imageData = {
      16: drawIcon(16),
      32: drawIcon(32),
      48: drawIcon(48),
      128: drawIcon(128),
    };
    chrome.action.setIcon({ imageData });
  } catch (e) {
    console.warn('Icon draw failed:', e);
  }
});
