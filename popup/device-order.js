// The saved order ranks registered IDs; new devices follow in API order.
export function applyDeviceOrder(devices, savedOrder) {
  const rank = new Map(savedOrder.map((id, index) => [id, index]));
  return [...devices].sort((a, b) => (rank.get(a.deviceId) ?? Infinity) - (rank.get(b.deviceId) ?? Infinity));
}

// Reorder only visible slots, leaving filtered-out devices in their original positions.
export function moveVisibleDevice(devices, visibleIds, sourceId, targetId) {
  const visible = new Set(visibleIds);
  const rows = devices.filter(device => visible.has(device.deviceId));
  const source = rows.findIndex(device => device.deviceId === sourceId);
  const target = rows.findIndex(device => device.deviceId === targetId);
  if (source < 0 || target < 0 || source === target) return [...devices];
  const [moved] = rows.splice(source, 1);
  rows.splice(target, 0, moved);
  let index = 0;
  return devices.map(device => visible.has(device.deviceId) ? rows[index++] : device);
}

export function moveDeviceToTop(devices, deviceId) {
  const device = devices.find(item => item.deviceId === deviceId);
  return device ? [device, ...devices.filter(item => item.deviceId !== deviceId)] : [...devices];
}
