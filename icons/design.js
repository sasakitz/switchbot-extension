// Shared geometry for the SVG, PNGs and browser preview (128-unit canvas).
(function (root) {
  const background = '#153e35';
  const foreground = '#f6faf7';
  const mint = '#9de3bc';
  const house = [[24, 58], [64, 25], [104, 58], [96, 58], [96, 100], [32, 100], [32, 58]];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect x="4" y="4" width="120" height="120" rx="30" fill="${background}"/>
  <polygon points="${house.map(p => p.join(',')).join(' ')}" fill="${foreground}"/>
  <rect x="44" y="64" width="40" height="20" rx="10" fill="${background}"/>
  <circle cx="74" cy="74" r="7" fill="${mint}"/>
</svg>\n`;

  function roundedRect(x, y, cx, cy, hw, hh, r) {
    const qx = Math.abs(x - cx) - (hw - r);
    const qy = Math.abs(y - cy) - (hh - r);
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) <= r;
  }
  function inHouse(x, y) {
    let inside = false;
    for (let i = 0, j = house.length - 1; i < house.length; j = i++) {
      const [xi, yi] = house[i], [xj, yj] = house[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function rgb(hex) { return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); }
  function drawIcon(size) {
    const pixels = new Uint8Array(size * size * 4);
    const bg = rgb(background), fg = rgb(foreground), knob = rgb(mint);
    const samples = 4;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let covered = 0;
        const channels = [0, 0, 0];
        for (let sy = 0; sy < samples; sy++) for (let sx = 0; sx < samples; sx++) {
          const px = (x + (sx + .5) / samples) * 128 / size;
          const py = (y + (sy + .5) / samples) * 128 / size;
          if (!roundedRect(px, py, 64, 64, 60, 60, 30)) continue;
          let color = bg;
          if (inHouse(px, py)) color = fg;
          if (roundedRect(px, py, 64, 74, 20, 10, 10)) color = bg;
          if (Math.hypot(px - 74, py - 74) <= 7) color = knob;
          covered++;
          for (let c = 0; c < 3; c++) channels[c] += color[c];
        }
        const offset = (y * size + x) * 4;
        if (covered) {
          for (let c = 0; c < 3; c++) pixels[offset + c] = Math.round(channels[c] / covered);
          pixels[offset + 3] = Math.round(255 * covered / (samples * samples));
        }
      }
    }
    return pixels;
  }
  const design = { svg, drawIcon };
  if (typeof module !== 'undefined' && module.exports) module.exports = design;
  else root.SwitchBotIcon = design;
})(globalThis);
