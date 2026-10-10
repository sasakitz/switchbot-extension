const canvases = [128, 48, 32, 16].map(size => {
  const wrapper = document.createElement('div');
  wrapper.className = 'canvas-wrap';
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  const pixels = SwitchBotIcon.drawIcon(size);
  context.putImageData(new ImageData(new Uint8ClampedArray(pixels), size, size), 0, 0);
  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = `${size} × ${size}`;
  wrapper.append(canvas, label);
  document.getElementById('canvases').append(wrapper);
  return canvas;
});
document.getElementById('downloadBtn').addEventListener('click', () => {
  for (const canvas of canvases) {
    const link = document.createElement('a');
    link.download = `icon${canvas.width}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
});
