// Service Worker - SwitchBot Controller Extension

function drawIcon(size) {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  // Toggle track dimensions
  const trackW = size * 0.82;
  const trackH = size * 0.50;
  const trackX = (size - trackW) / 2;
  const trackY = (size - trackH) / 2;
  const trackR = trackH / 2;

  // Green gradient track
  const grad = ctx.createLinearGradient(trackX, 0, trackX + trackW, 0);
  grad.addColorStop(0, '#34d399');
  grad.addColorStop(1, '#059669');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(trackX, trackY, trackW, trackH, trackR);
  ctx.fill();

  // Top highlight
  const highlight = ctx.createLinearGradient(0, trackY, 0, trackY + trackH * 0.5);
  highlight.addColorStop(0, 'rgba(255,255,255,0.22)');
  highlight.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = highlight;
  ctx.beginPath();
  ctx.roundRect(trackX, trackY, trackW, trackH, trackR);
  ctx.fill();

  // Knob shadow
  const knobCx = trackX + trackW - trackR;
  const knobR = trackR * 0.80;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = size * 0.04;
  ctx.shadowOffsetX = size * 0.025;
  ctx.shadowOffsetY = size * 0.025;
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(knobCx, cy, knobR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // White knob (ON = right)
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(knobCx, cy, knobR, 0, Math.PI * 2);
  ctx.fill();

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
