import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDeviceCard } from '../popup/device-card.js';
import { ICONS } from '../popup/icons.js';
import { buildOrderRow } from '../popup/order-row.js';
import { getAvailableFilters, buildFilterTabs } from '../popup/filters.js';

const store = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(store);
const kit = path.join(store, 'kit');
for (const dir of ['screenshots', 'promotional', 'icons', 'text', 'source']) fs.mkdirSync(path.join(kit, dir), { recursive: true });
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const icon = `data:image/svg+xml;base64,${Buffer.from(read('icons/icon.svg')).toString('base64')}`;
const write = (name, content) => fs.writeFileSync(path.join(kit, name), content.replace(/[\t ]+$/gm, ''));
const manifest = JSON.parse(read('manifest.json'));
const device = (deviceId, deviceName, deviceType, status = {}) => ({ deviceId, deviceName, deviceType, status });
const bulb = device('demo-light', 'リビングの照明', 'Color Bulb', { power: 'on', brightness: 80 });
const bot = device('demo-bot', 'デスクのスイッチ', 'Bot', { power: 'off' });
const ac = { deviceId: 'demo-ac', deviceName: 'リビングのエアコン', remoteType: 'Air Conditioner', isIR: true };
const fan = { deviceId: 'demo-fan', deviceName: '寝室の扇風機', remoteType: 'Fan', isIR: true };
const co2 = device('demo-co2', 'リビングのCO₂センサー', 'MeterPro(CO2)', { CO2: 680, temperature: 24.5, humidity: 48 });
const meter = device('demo-meter', '寝室の温湿度計', 'Meter Plus', { temperature: 22.8, humidity: 52, battery: 90 });
const curtain = device('demo-curtain', '寝室のカーテン', 'Curtain3', { slidePosition: 25 });
const registeredDevices = [bulb, bot, ac, fan, co2, meter, curtain];
const base = read('popup/popup.html');
function popup(devices, filter = 'all', query = '', reordering = false) {
  const cards = reordering ? devices.map((device, index) => buildOrderRow(device, { first: index === 0, last: index === devices.length - 1, globalFirst: index === 0 })).join('') : devices.map(d => buildDeviceCard(d)).join('');
  let html = base.replace('<link rel="stylesheet" href="popup.css" />', `<style>${read('popup/popup.css')}</style>`)
    .replace('src="../icons/icon.svg"', `src="${icon}"`)
    .replace('<script type="module" src="popup.js"></script>', '')
    .replace('class="state-view" id="loadingState"', 'class="state-view hidden" id="loadingState"')
    .replace('<div class="device-grid hidden" id="deviceGrid"></div>', `<div class="device-grid" id="deviceGrid">${cards}</div>`)
    .replace('id="deviceCount"></span>', 'id="deviceCount">7 デバイス</span>')
    .replace('id="lastUpdated"></span>', 'id="lastUpdated">更新: たった今</span>')
    .replace('id="reorderBtn" aria-pressed="false" disabled', 'id="reorderBtn" aria-pressed="false"');
  const filters = getAvailableFilters(registeredDevices);
  html = html.replace(/(<div class="filter-tabs"[^>]*>)[\s\S]*?(<\/div>)/,
    (_, open, close) => open + buildFilterTabs(filters, filter) + close);
  if (reordering) html = html.replace('id="reorderBtn" aria-pressed="false">並び替え', 'id="reorderBtn" aria-pressed="true">完了').replace('class="order-hint hidden"', 'class="order-hint"').replace('class="device-grid" id="deviceGrid"', 'class="device-grid" id="deviceGrid" role="list"');
  if (query) html = html.replace('id="searchInput"', `value="${query}" id="searchInput"`).replace('class="search-clear hidden"', 'class="search-clear"');
  return html;
}
write('source/popup-overview.html', popup(registeredDevices));
write('source/popup-climate.html', popup([ac, fan], 'climate'));
write('source/popup-sensors.html', popup([co2, meter], 'sensor'));
write('source/popup-search.html', popup([curtain], 'curtain', '寝室'));
write('source/popup-order.html', popup([ac, bulb, curtain, bot, fan, co2, meter], 'all', '', true));
let settings = read('options/options.html')
  .replace('<link rel="stylesheet" href="options.css" />', `<style>${read('options/options.css')}</style>`)
  .replace('<script type="module" src="options.js"></script>', '')
  .replaceAll('src="../icons/icon.svg"', `src="${icon}"`)
  .replace('id="appVersion"></p>', `id="appVersion">バージョン ${manifest.version}</p>`)
  .replace('id="tokenInput"', 'id="tokenInput" value="DEMO_ONLY_NOT_A_VALID_TOKEN_000000"')
  .replace('id="secretInput"', 'id="secretInput" value="DEMO_ONLY_NOT_A_VALID_SECRET_00000"');
write('source/settings.html', settings);
const iconLabels = { bot: 'スイッチ', curtain: 'カーテン', blind: 'ブラインド', lock: 'ロック', bulb: '照明', strip: 'テープライト', plug: 'プラグ', meter: '温湿度', hub: 'ハブ', motion: '人感', contact: '開閉', water: '水漏れ', ac: '空調', fan: '扇風機', purifier: '空気清浄機', tv: 'テレビ', camera: 'カメラ', speaker: 'スピーカー', projector: 'プロジェクター', remote: 'リモコン', humid: '加湿器', co2: 'CO₂', battery: 'バッテリー', bolt: '電力' };
write('source/device-icons.html', `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><style>*{box-sizing:border-box}body{margin:0;padding:42px 48px;width:960px;height:660px;background:#f4f6f5;color:#20332d;font-family:system-ui,sans-serif}h1{font-size:28px;margin:0 0 8px}p{font-size:13px;color:#63766e;margin:0 0 26px}.icons{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}.tile{height:102px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:white;border:1px solid #e3e9e6;border-radius:16px;color:#176b5b}.tile svg{width:36px;height:36px}.tile span{font-size:11px;color:#63766e}</style></head><body><h1>機器アイコン一覧</h1><p>丸みのあるシルエットと、淡い重なり。機器もセンサーも、ひとつのデザインに。</p><div class="icons">${Object.entries(iconLabels).map(([key,label]) => `<div class="tile">${ICONS[key]}<span>${label}</span></div>`).join('')}</div></body></html>`);
const brand = `<div class="brand"><img src="${icon}" alt=""><div>SwitchBot<span>CONTROLLER</span></div></div>`;
const scenes = [
  ['01-device-list', '01 / 日常の操作', 'いつもの操作を、<br>ブラウザから。', '照明もスイッチも、ひとつのポップアップに。<br>状態を見て、その場で操作できます。', '照明・スイッチ・プラグ', 'popup-overview.html'],
  ['02-climate-control', '02 / 空調の操作', '空調の操作も、<br>手元で完結。', 'エアコンの温度・モードを選んで送信。<br>扇風機の風量や首振りも操作できます。', '温度設定・モード切替', 'popup-climate.html'],
  ['03-sensor-monitoring', '03 / 部屋の状態', '部屋のいまが、<br>ひと目でわかる。', '温度、湿度、CO₂濃度をまとめて確認。<br>センサーカテゴリで、必要な情報だけに。', '温湿度・CO₂', 'popup-sensors.html'],
  ['04-search-and-filter', '04 / 機器の検索', '使いたい一台へ、<br>すぐにたどり着く。', '登録機器に属するカテゴリだけを表示。<br>名前検索で、寝室のカーテンへ。', '登録機器のカテゴリ・検索', 'popup-search.html'],
  ['05-credentials-setup', '05 / 接続の設定', 'あなたのAPIキーで、<br>シンプルに接続。', 'トークンとシークレットを入力し、<br>接続テストから設定を始められます。', '保存・接続テスト・削除', 'settings.html'],
];
const sceneCSS = `
* { box-sizing: border-box; } html, body { margin: 0; width: 1280px; height: 800px; overflow: hidden; }
body { font-family: 'Noto Sans JP', system-ui, sans-serif; background: #153e35; color: #f6faf7; }
body::before { content: ''; position: absolute; width: 890px; height: 890px; border: 1px solid #2d5849; border-radius: 50%; right: -340px; top: -260px; }
body::after { content: ''; position: absolute; width: 700px; height: 700px; border: 1px solid #2d5849; border-radius: 50%; right: -245px; top: -165px; pointer-events: none; }
.brand { position: absolute; top: 52px; left: 64px; display: flex; align-items: center; gap: 14px; font-size: 24px; font-weight: 650; line-height: 1.2; }
.brand img { width: 50px; height: 50px; background: #f4f6f5; border-radius: 14px; }
.brand span { display: block; font-size: 10px; letter-spacing: 3px; color: #b2cebe; margin-top: 5px; }
.copy { position: absolute; left: 64px; top: 225px; width: 605px; }
.kicker { color: #9de3bc; font-size: 12px; letter-spacing: 2px; font-weight: 650; margin-bottom: 24px; }
h1 { font-size: 52px; line-height: 1.35; letter-spacing: -1.8px; margin: 0 0 25px; font-weight: 650; }
.description { color: #c1d6ca; font-size: 18px; line-height: 1.9; margin: 0; }
.feature { display: inline-block; margin-top: 34px; padding: 10px 16px; border-radius: 30px; background: #264f40; color: #dbede2; font-size: 13px; }
.window { position: absolute; left: 744px; top: 80px; width: 440px; height: 640px; border-radius: 22px; background: #f4f6f5; box-shadow: 0 28px 60px #09271e80; overflow: hidden; z-index: 1; }
.window-bar { height: 40px; display: flex; align-items: center; padding: 0 16px; gap: 6px; border-bottom: 1px solid #e3e9e6; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: #c2cec6; }
.window-bar span { margin-left: 9px; color: #63766e; font-size: 10px; }
iframe { width: 440px; height: 600px; border: 0; display: block; }
.caption { position: absolute; left: 64px; bottom: 49px; color: #9ebcad; font-size: 11px; line-height: 1.6; }
.page-no { position: absolute; right: 64px; bottom: 49px; color: #9ebcad; font-size: 11px; }
.setup .copy { top: 250px; width: 355px; }
.setup h1 { font-size: 34px; letter-spacing: -1px; }
.setup .description { font-size: 16px; }
.setup .window { left: 467px; top: 84px; width: 760px; height: 633px; }
.setup iframe { width: 1000px; height: 780px; transform: scale(.76); transform-origin: top left; }
`;
for (const [name, kicker, title, desc, feature, src] of scenes) {
  write(`source/${name}.html`, `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><style>${sceneCSS}</style></head><body class="${src === 'settings.html' ? 'setup' : ''}">${brand}<div class="copy"><div class="kicker">${kicker}</div><h1>${title}</h1><p class="description">${desc}</p><div class="feature">${feature}</div></div><div class="window"><div class="window-bar"><i class="dot"></i><i class="dot"></i><i class="dot"></i><span>SwitchBot Controller</span></div><iframe src="${src}" title="実際の拡張機能UI"></iframe></div><div class="caption">画面はサンプルデバイス・認証情報による表示例です。<br>操作・取得できる項目は、デバイスの種類とSwitchBot APIへの対応状況によって異なります。</div><div class="page-no">${kicker.slice(0, 2)} / 05</div></body></html>`);
}
const node = (name, x, y, size = 60) => `<div class="node" style="left:${x}px;top:${y}px;width:${size}px;height:${size}px">${ICONS[name]}</div>`;
const promoCSS = `*{box-sizing:border-box}html,body{margin:0;overflow:hidden}body{background:#153e35;color:#f6faf7;font-family:system-ui,sans-serif}.node{position:absolute;display:flex;align-items:center;justify-content:center;background:#2c5746;border:1px solid #4c715d;border-radius:18px;color:#b1dfc2;z-index:2}.node svg{width:50%;height:50%;stroke-width:1.5}.mark{position:absolute;z-index:3}.line{position:absolute;height:1px;background:#527562;transform-origin:left}.ring{position:absolute;border:1px solid #315b49;border-radius:50%}`;
write('source/promo-tile.html', `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${promoCSS}body{width:440px;height:280px}.name{position:absolute;top:222px;width:100%;text-align:center;font-size:20px;letter-spacing:-.5px;font-weight:650}</style></head><body><div class="ring" style="width:330px;height:330px;left:55px;top:-65px"></div><div class="ring" style="width:240px;height:240px;left:100px;top:-20px"></div><div class="line" style="left:94px;top:111px;width:250px"></div><div class="line" style="left:220px;top:52px;width:120px;transform:rotate(90deg)"></div><img class="mark" src="${icon}" style="left:160px;top:48px;width:120px;height:120px">${node('bulb', 60, 60)}${node('curtain', 320, 60)}${node('meter', 112, 151, 52)}${node('lock', 276, 151, 52)}<div class="name">SwitchBot Controller</div></body></html>`);
write('source/marquee.html', `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><style>${promoCSS}body{width:1400px;height:560px}.title{position:absolute;left:80px;top:114px;font-size:65px;line-height:1.1;letter-spacing:-2px;font-weight:650}.tagline{position:absolute;left:83px;top:310px;font-size:22px;color:#b6d6c2}.eyebrow{position:absolute;left:84px;top:65px;font-size:11px;letter-spacing:3px;color:#9de3bc}</style></head><body><div class="eyebrow">家の操作を、もっと身近に</div><div class="title">SwitchBot<br>Controller</div><div class="tagline">ブラウザから、家を操作。</div><div class="ring" style="width:650px;height:650px;left:710px;top:-45px"></div><div class="ring" style="width:460px;height:460px;left:805px;top:50px"></div><div class="line" style="left:816px;top:280px;width:436px"></div><div class="line" style="left:1035px;top:109px;width:342px;transform:rotate(90deg)"></div><img class="mark" src="${icon}" style="left:915px;top:160px;width:240px;height:240px">${node('bulb', 740, 230, 100)}${node('curtain', 1230, 230, 100)}${node('meter', 985, 27, 100)}${node('lock', 985, 433, 100)}</body></html>`);
for (const size of [16, 32, 48, 128]) fs.copyFileSync(path.join(root, `icons/icon${size}.png`), path.join(kit, 'icons', `icon${size}.png`));
// Store icon: 96px artwork centered in a 128px transparent canvas (assembled by render-assets.py).
fs.copyFileSync(path.join(root, 'icons/icon.svg'), path.join(kit, 'icons', 'icon.svg'));
write('text/build-info.json', JSON.stringify({ date: '2026-10-11', version: manifest.version, uiLanguage: 'ja', usesSampleData: true, features: ['custom-device-order', 'registered-device-categories'], sizes: { screenshots: [1280, 800], promo: [440, 280], marquee: [1400, 560], storeIcon: [128, 128] } }, null, 2) + '\n');
write('source/render-manifest.json', JSON.stringify([
  ...scenes.map(([name]) => ({ source: `${name}.html`, output: `screenshots/${name}.png`, width: 1280, height: 800 })),
  { source: 'promo-tile.html', output: 'promotional/promo-tile-440x280.png', width: 440, height: 280 },
  { source: 'marquee.html', output: 'promotional/marquee-1400x560.png', width: 1400, height: 560 },
  { source: 'popup-order.html', output: 'device-order-preview.png', width: 440, height: 600 },
  { source: 'device-icons.html', output: 'device-icons-preview.png', width: 960, height: 660 },
], null, 2));
console.log(`Prepared 5 screenshot pages and 2 promotional pages in ${kit}`);
