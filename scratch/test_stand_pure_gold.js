const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const PNG = require('pngjs').PNG;
const jsQR = require('jsqr');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const targetUrl = 'https://luxor-jewellery.vercel.app';

// Read the SVG from render_24k_preview
const svg = fs.readFileSync(path.join(__dirname, 'rich_24k_preview.html'), 'utf8')
  .match(/<svg[\s\S]*?<\/svg>/)[0];

let standHtml = fs.readFileSync(path.join(__dirname, '..', 'qr-codes', 'LUXOR_JEWELLERY_Stand_Light.html'), 'utf8');
standHtml = standHtml.replace(/<div class="qr-container">[\s\S]*?<\/div>/, `<div class="qr-container">\n${svg}\n</div>`);

const tmpStandHtml = path.join(__dirname, 'test_stand_pure_gold.html');
const tmpStandPng = path.join(__dirname, 'test_stand_pure_gold.png');
fs.writeFileSync(tmpStandHtml, standHtml);

execSync(`"${edgePath}" --headless=new --window-size=1000,1450 --screenshot="${tmpStandPng}" "file:///${tmpStandHtml.replace(/\\/g, '/')}"`, { stdio: 'pipe' });

const png = PNG.sync.read(fs.readFileSync(tmpStandPng));
const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
console.log('Stand Scan Decode:', decoded ? '✅ ' + decoded.data : '❌ FAILED');
