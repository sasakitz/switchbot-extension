const DEVICE_CONFIG = {
  // Physical
  Bot:                { icon: 'bot',     label: 'スイッチボット',   cat: 'control',   color: '#b4773f' },
  Curtain:            { icon: 'curtain', label: 'カーテン',         cat: 'curtain',   color: '#8270b3' },
  Curtain3:           { icon: 'curtain', label: 'カーテン3',        cat: 'curtain',   color: '#8270b3' },
  'Blind Tilt':       { icon: 'blind',   label: 'ブラインド',       cat: 'curtain',   color: '#8270b3' },
  Lock:               { icon: 'lock',    label: 'スマートロック',   cat: 'security',  color: '#b66b60' },
  'Lock Pro':         { icon: 'lock',    label: 'スマートロック Pro',cat: 'security',  color: '#b66b60' },
  'Color Bulb':       { icon: 'bulb',    label: 'カラー電球',       cat: 'light',     color: '#a77d27' },
  'Strip Light':      { icon: 'strip',   label: 'テープライト',     cat: 'light',     color: '#a77d27' },
  'Plug':             { icon: 'plug',    label: 'スマートプラグ',   cat: 'control',   color: '#39836b' },
  'Plug Mini (US)':   { icon: 'plug',    label: 'プラグミニ',       cat: 'control',   color: '#39836b' },
  'Plug Mini (JP)':   { icon: 'plug',    label: 'プラグミニ (JP)',  cat: 'control',   color: '#39836b' },
  Meter:              { icon: 'meter',   label: '温湿度計',         cat: 'sensor',    color: '#39836b' },
  'Meter Plus':       { icon: 'meter',   label: '温湿度計 Plus',    cat: 'sensor',    color: '#39836b' },
  'Hub 2':            { icon: 'hub',     label: 'ハブ2',            cat: 'hub',       color: '#517b81' },
  Hub:                { icon: 'hub',     label: 'ハブ',             cat: 'hub',       color: '#517b81' },
  'Hub Mini':         { icon: 'hub',     label: 'ハブミニ',         cat: 'hub',       color: '#517b81' },
  'Hub Plus':         { icon: 'hub',     label: 'ハブ Plus',        cat: 'hub',       color: '#517b81' },
  'Outdoor Meter':    { icon: 'meter',   label: '屋外温湿度計',     cat: 'sensor',    color: '#39836b' },
  'Motion Sensor':    { icon: 'motion',  label: '人感センサー',     cat: 'sensor',    color: '#8270b3' },
  'Contact Sensor':   { icon: 'contact', label: '開閉センサー',     cat: 'sensor',    color: '#8270b3' },
  'Water Detector':   { icon: 'water',   label: '水漏れセンサー',   cat: 'sensor',    color: '#4d82a0' },
  'CO2 Sensor':       { icon: 'co2',     label: 'CO2センサー',      cat: 'sensor',    color: '#39836b' },
  'MeterPro(CO2)':    { icon: 'co2',     label: 'CO2センサー',      cat: 'sensor',    color: '#39836b' },
  Humidifier:         { icon: 'humid',   label: '加湿器',           cat: 'climate',   color: '#4d82a0' },
  // IR virtual
  'Air Conditioner':  { icon: 'ac',      label: 'エアコン',         cat: 'climate',   color: '#4d82a0' },
  TV:                 { icon: 'tv',      label: 'テレビ',           cat: 'media',     color: '#a16f90' },
  Light:              { icon: 'bulb',    label: '照明',             cat: 'light',     color: '#a77d27' },
  Fan:                { icon: 'fan',     label: '扇風機',           cat: 'climate',   color: '#4d82a0' },
  'DIY Fan':          { icon: 'fan',     label: '扇風機 (DIY)',     cat: 'climate',   color: '#4d82a0' },
  'Air Purifier':     { icon: 'purifier',label: '空気清浄機',       cat: 'climate',   color: '#39836b' },
  Camera:             { icon: 'camera',  label: 'カメラ',           cat: 'security',  color: '#b66b60' },
  'DVD Player':       { icon: 'tv',      label: 'DVDプレーヤー',    cat: 'media',     color: '#a16f90' },
  Speaker:            { icon: 'speaker', label: 'スピーカー',       cat: 'media',     color: '#a16f90' },
  'Set Top Box':      { icon: 'tv',      label: 'セットトップボックス', cat: 'media', color: '#a16f90' },
  Projector:          { icon: 'projector',label: 'プロジェクター',  cat: 'media',     color: '#a16f90' },
  Others:             { icon: 'remote',  label: 'リモコン',         cat: 'control',   color: '#718079' },
};

export function getConfig(deviceType) {
  return DEVICE_CONFIG[deviceType] || { icon: 'remote', label: deviceType, cat: 'control', color: '#718079' };
}
