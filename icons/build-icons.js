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

const { svg, drawIcon } = require('./design.js');

// =====================================================
// Generate all icon sizes
// =====================================================
const outDir = path.join(__dirname);
const sizes = [16, 32, 48, 128];
fs.writeFileSync(path.join(outDir, 'icon.svg'), svg);

sizes.forEach(size => {
  const pixels = drawIcon(size);
  const png = encodePNG(pixels, size, size);
  const outPath = path.join(outDir, `icon${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Generated: icon${size}.png (${png.length} bytes)`);
});

console.log('\nDone! All icons generated in icons/');
