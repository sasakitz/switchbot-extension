// build-icons.js - Generates PNG icon files for the Chrome extension
// Run: node icons/build-icons.js

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// =====================================================
// Minimal PNG encoder
// =====================================================
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c;
    }
    return t;
  })();
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = crc32(Buffer.concat([typeBytes, data]));
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crcBuf, 0);
  return Buffer.concat([len, typeBytes, data, crc]);
}

function encodePNG(rgba, width, height) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0;
    for (let x = 0; x < width; x++) {
      const srcOff = (y * width + x) * 4;
      const dstOff = y * (1 + width * 4) + 1 + x * 4;
      raw[dstOff]     = rgba[srcOff];
      raw[dstOff + 1] = rgba[srcOff + 1];
      raw[dstOff + 2] = rgba[srcOff + 2];
      raw[dstOff + 3] = rgba[srcOff + 3];
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// =====================================================
// Helper functions
// =====================================================
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Signed distance field for a rounded rectangle
function roundedRectSDF(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  return Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2)
       + Math.min(Math.max(qx, qy), 0)
       - r;
}

// =====================================================
// Icon drawing — toggle switch design
// =====================================================
function drawIcon(size) {
  const pixels = new Uint8Array(size * size * 4); // all transparent

  const cx = size / 2;
  const cy = size / 2;

  // --- Toggle track dimensions ---
  const trackW  = size * 0.82;
  const trackH  = size * 0.50;
  const trackR  = trackH / 2;          // fully-rounded pill
  const trackCx = cx;
  const trackCy = cy;

  // Knob (white circle, ON position = right)
  const knobR  = trackR * 0.80;
  const knobCx = trackCx + (trackW / 2) - trackR;
  const knobCy = trackCy;

  // --- Track colors (green gradient, left → right) ---
  const col0 = { r: 0x34, g: 0xd3, b: 0x99 }; // #34d399 (emerald 400)
  const col1 = { r: 0x05, g: 0x96, b: 0x69 }; // #059669 (emerald 600)

  // --- Draw track ---
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sdf = roundedRectSDF(x + 0.5, y + 0.5, trackCx, trackCy, trackW / 2, trackH / 2, trackR);
      if (sdf >= 1) continue;

      const alpha = clamp(1 - sdf, 0, 1);

      // Horizontal gradient
      const t = clamp((x + 0.5 - (trackCx - trackW / 2)) / trackW, 0, 1);
      let r = Math.round(lerp(col0.r, col1.r, t));
      let g = Math.round(lerp(col0.g, col1.g, t));
      let b = Math.round(lerp(col0.b, col1.b, t));

      // Subtle top highlight (inner glow)
      const relY = (y + 0.5 - (trackCy - trackH / 2)) / trackH;
      const highlight = Math.max(0, 1 - relY * 3) * 0.18;
      r = clamp(Math.round(r + 255 * highlight), 0, 255);
      g = clamp(Math.round(g + 255 * highlight), 0, 255);
      b = clamp(Math.round(b + 255 * highlight), 0, 255);

      const off = (y * size + x) * 4;
      pixels[off]     = r;
      pixels[off + 1] = g;
      pixels[off + 2] = b;
      pixels[off + 3] = Math.round(alpha * 255);
    }
  }

  // --- Draw knob shadow (dark semi-transparent circle, offset down-right) ---
  const shadowOff = size * 0.025;
  const shadowR   = knobR + size * 0.01;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx   = x + 0.5 - (knobCx + shadowOff);
      const dy   = y + 0.5 - (knobCy + shadowOff);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= shadowR + 1) continue;

      const a = clamp(shadowR - dist + 1, 0, 1) * 0.28;
      const off = (y * size + x) * 4;
      pixels[off]     = Math.round(lerp(pixels[off],     0, a));
      pixels[off + 1] = Math.round(lerp(pixels[off + 1], 0, a));
      pixels[off + 2] = Math.round(lerp(pixels[off + 2], 0, a));
    }
  }

  // --- Draw knob (white circle) ---
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx   = x + 0.5 - knobCx;
      const dy   = y + 0.5 - knobCy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= knobR + 1) continue;

      const a = clamp(knobR - dist + 1, 0, 1);

      // Top highlight on knob
      const relY = (dy + knobR) / (knobR * 2);
      const knobHighlight = Math.max(0, 1 - relY * 2.5) * 0.10;
      const kr = clamp(Math.round(255 - 255 * knobHighlight * 0.3), 230, 255);

      const off = (y * size + x) * 4;
      pixels[off]     = Math.round(lerp(pixels[off],     kr,  a));
      pixels[off + 1] = Math.round(lerp(pixels[off + 1], 255, a));
      pixels[off + 2] = Math.round(lerp(pixels[off + 2], 255, a));
      // Ensure knob is fully opaque even if it extends outside track
      pixels[off + 3] = Math.round(clamp(pixels[off + 3] + a * 255, 0, 255));
    }
  }

  return pixels;
}

// =====================================================
// Generate all icon sizes
// =====================================================
const outDir = path.join(__dirname);
const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
  const pixels = drawIcon(size);
  const png = encodePNG(pixels, size, size);
  const outPath = path.join(outDir, `icon${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Generated: icon${size}.png (${png.length} bytes)`);
});

console.log('\nDone! All icons generated in icons/');
