// Original geometric pictograms: soft silhouettes, solid detail, and translucent layers.
// Keep a common 24-unit canvas so device and sensor icons share the same visual rhythm.
function icon(content) {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${content}</svg>`;
}
const detail = (path) => `<path d="${path}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;

export const ICONS = {
  bot: icon('<rect x="3" y="5" width="18" height="15" rx="5" fill="currentColor" opacity=".2"/><rect x="6" y="9" width="12" height="7" rx="3.5" fill="currentColor"/><circle cx="14.5" cy="12.5" r="2" fill="white"/><rect x="9" y="3" width="6" height="4" rx="2" fill="currentColor"/>'),
  curtain: icon('<rect x="3" y="4" width="18" height="17" rx="3" fill="currentColor" opacity=".12"/><path d="M4 6h7v3c0 5-2 8-7 10V6zm16 0h-7v3c0 5 2 8 7 10V6z" fill="currentColor" opacity=".75"/><rect x="2" y="3" width="20" height="3" rx="1.5" fill="currentColor"/>'),
  blind: icon('<rect x="4" y="3" width="16" height="18" rx="3" fill="currentColor" opacity=".15"/><path d="M4 6h16M4 11h16M4 16h16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M17 4v17" stroke="currentColor" stroke-width="1.5"/><circle cx="17" cy="21" r="1.5" fill="currentColor"/>'),
  lock: icon('<rect x="4" y="9" width="16" height="13" rx="4" fill="currentColor" opacity=".25"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="12" cy="15" r="2" fill="currentColor"/><rect x="11" y="15" width="2" height="4" rx="1" fill="currentColor"/>'),
  bulb: icon('<path d="M12 2a7 7 0 0 0-5 12c1 1 2 2 2 4h6c0-2 1-3 2-4a7 7 0 0 0-5-12z" fill="currentColor" opacity=".25"/><path d="M9 19h6l-1 3h-4l-1-3z" fill="currentColor"/>'+detail('M10 10l2 2 2-2M12 12v4')),
  strip: icon('<rect x="2" y="6" width="20" height="12" rx="5" fill="currentColor" opacity=".2"/><path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="6" cy="12" r="2.5" fill="currentColor"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/><circle cx="18" cy="12" r="2.5" fill="currentColor"/>'),
  plug: icon('<rect x="4" y="7" width="16" height="13" rx="5" fill="currentColor" opacity=".22"/><path d="M8 8V3M16 8V3" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M10 11h4l-1 3h2l-5 5 1-4H9l1-4z" fill="currentColor"/>'),
  meter: icon('<rect x="3" y="3" width="18" height="18" rx="6" fill="currentColor" opacity=".16"/><path d="M11 6a2 2 0 0 0-4 0v7a4 4 0 1 0 4 0V6z" fill="currentColor" opacity=".45"/><circle cx="9" cy="16" r="2" fill="currentColor"/><path d="M9 9v7M15 8h2M15 12h2M15 16h1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
  hub: icon('<rect x="3" y="9" width="18" height="12" rx="5" fill="currentColor" opacity=".22"/><circle cx="12" cy="16" r="2" fill="currentColor"/>'+detail('M6 6a9 9 0 0 1 12 0M9 9a5 5 0 0 1 6 0')),
  motion: icon('<circle cx="12" cy="7" r="3" fill="currentColor"/><path d="M12 11c-4 0-6 3-6 8v2h12v-2c0-5-2-8-6-8z" fill="currentColor" opacity=".23"/>'+detail('M3 9c-1 2-1 4 0 6M21 9c1 2 1 4 0 6')),
  contact: icon('<rect x="4" y="3" width="12" height="18" rx="4" fill="currentColor" opacity=".24"/><rect x="18" y="6" width="3" height="12" rx="1.5" fill="currentColor"/><rect x="11" y="10" width="2" height="4" rx="1" fill="currentColor"/>'),
  water: icon('<path d="M12 2C10 6 4 11 4 15a8 8 0 0 0 16 0c0-4-6-9-8-13z" fill="currentColor" opacity=".25"/><path d="M8 15a4 4 0 0 0 4 4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'),
  ac: icon('<rect x="2" y="3" width="20" height="11" rx="4" fill="currentColor" opacity=".24"/><rect x="5" y="10" width="14" height="3" rx="1.5" fill="currentColor"/>'+detail('M7 17v3M12 16v5M17 17v3')+'<circle cx="18" cy="7" r="1" fill="currentColor"/>'),
  fan: icon('<circle cx="12" cy="12" r="10" fill="currentColor" opacity=".12"/><path d="M11 11C5 10 5 4 9 4c3 0 4 3 3 6 4-5 9-2 7 2-1 3-4 3-6 1 2 6-3 9-5 5-2-2 0-5 3-6z" fill="currentColor" opacity=".7"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/>'),
  purifier: icon('<rect x="5" y="2" width="14" height="20" rx="5" fill="currentColor" opacity=".2"/><path d="M8 7h8M8 10h8M8 13h8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/>'),
  tv: icon('<rect x="2" y="3" width="20" height="14" rx="4" fill="currentColor" opacity=".24"/><path d="m10 7 6 3-6 3V7z" fill="currentColor"/><path d="M9 17v3M15 17v3M7 21h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
  camera: icon('<rect x="2" y="6" width="15" height="13" rx="4" fill="currentColor" opacity=".25"/><path d="m17 10 5-3v11l-5-3v-5z" fill="currentColor"/><circle cx="9.5" cy="12.5" r="3" fill="currentColor"/>'),
  speaker: icon('<rect x="5" y="2" width="14" height="20" rx="5" fill="currentColor" opacity=".22"/><circle cx="12" cy="15" r="4" fill="currentColor" opacity=".7"/><circle cx="12" cy="15" r="1.5" fill="white"/><circle cx="12" cy="7" r="1.5" fill="currentColor"/>'),
  projector: icon('<rect x="2" y="6" width="20" height="13" rx="5" fill="currentColor" opacity=".22"/><circle cx="8" cy="12.5" r="4" fill="currentColor"/><circle cx="8" cy="12.5" r="1.7" fill="white"/>'+detail('M15 11h3M15 14h3M6 20h2M16 20h2')),
  remote: icon('<rect x="6" y="2" width="12" height="20" rx="5" fill="currentColor" opacity=".22"/><circle cx="12" cy="8" r="3" fill="currentColor"/><path d="M10 15h4M10 18h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
  humid: icon('<rect x="4" y="10" width="16" height="12" rx="5" fill="currentColor" opacity=".22"/><path d="M9 2c-3 2 3 3 0 5M15 2c-3 2 3 3 0 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 12c-1 2-3 3-3 5a3 3 0 0 0 6 0c0-2-2-3-3-5z" fill="currentColor"/>'),
  co2: icon('<rect x="2" y="4" width="20" height="16" rx="5" fill="currentColor" opacity=".18"/><circle cx="8" cy="12" r="3.3" fill="currentColor"/><circle cx="16" cy="9" r="2.5" fill="currentColor" opacity=".65"/><circle cx="16" cy="16" r="2" fill="currentColor" opacity=".45"/><path d="m10 11 4-1M10 14l4 1" stroke="currentColor" stroke-width="1.6"/>'),
  battery: icon('<rect x="3" y="6" width="16" height="12" rx="3" fill="currentColor" opacity=".2"/><rect x="6" y="9" width="9" height="6" rx="1" fill="currentColor"/><rect x="20" y="9" width="2" height="6" rx="1" fill="currentColor"/>'),
  bolt: icon('<path d="M13 2 4 14h7l-1 8 10-13h-7V2z" fill="currentColor"/>'),
  grip: icon('<path d="M9 5v.01M15 5v.01M9 12v.01M15 12v.01M9 19v.01M15 19v.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>'),
  up: icon(detail('m7 14 5-5 5 5')),
  down: icon(detail('m7 10 5 5 5-5')),
  first: icon(detail('M6 5h12M7 15l5-5 5 5M12 10v10')),
};
