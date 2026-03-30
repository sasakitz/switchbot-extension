// Service Worker - SwitchBot Controller Extension

function drawIcon(size) {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  // Background: rounded square, Material Indigo
  const bgR = size * 0.22;
  ctx.fillStyle = '#5C6BC0';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, bgR);
  ctx.fill();

  // Toggle track (pill, white semi-transparent)
  const trackW = size * 0.75;
  const trackH = size * 0.31;
  const trackX = (size - trackW) / 2;
  const trackY = (size - trackH) / 2;
  const trackR = trackH / 2;
  ctx.fillStyle = 'rgba(255,255,255,0.30)';
  ctx.beginPath();
  ctx.roundRect(trackX, trackY, trackW, trackH, trackR);
  ctx.fill();

  // Toggle knob (ON = right, white circle)
  const knobR = trackH * 0.78;
  const knobCx = trackX + trackW - trackR;
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
