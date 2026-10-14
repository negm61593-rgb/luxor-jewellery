const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const PNG = require('pngjs').PNG;
const jsQR = require('jsqr');
const { execSync } = require('child_process');

const targetUrl = 'https://luxorjewellery.eg';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const qr = QRCode.create(targetUrl, { errorCorrectionLevel: 'H' });
const size = qr.modules.size;
const margin = 4;
const totalSize = size + margin * 2;

// Let's test a spectrum of gold hex codes around #91711E:
const golds = [
  { hex: '#8F6E1C', name: 'Deep Royal Gold 8F' },
  { hex: '#96741F', name: 'Royal Gold 96' },
  { hex: '#9C7A22', name: 'Brilliant Gold 9C' },
  { hex: '#A38025', name: 'Bright Gold A3' },
  { hex: '#A88527', name: 'Bright Gold A8' },
  { hex: '#AE8B2B', name: 'Vivid Gold AE' },
  { hex: '#B5902E', name: 'Luminous Gold B5' },
  {
    gradient: true,
    name: 'Controlled High-Contrast Gold Gradient',
    stops: ['#7A5812', '#9E7A23', '#8A671B']
  }
];

let bodySvg = '';
for (let r = 0; r < size; r++) {
  for (let c = 0; c < size; c++) {
    if (qr.modules.get(r, c)) {
      if ((r <= 7 && c <= 7) || (r <= 7 && c >= size - 8) || (r >= size - 8 && c <= 7)) continue;
      if (r >= 13 && r <= 19 && c >= 11 && c <= 21) continue;
      bodySvg += `<rect x="${c + margin + 0.06}" y="${r + margin + 0.06}" width="0.88" height="0.88" rx="0.25" fill="#141310" />\n`;
    }
  }
}

for (const g of golds) {
  let fill;
  let defs = '';
  if (g.gradient) {
    fill = 'url(#gradG)';
    defs = `
    <defs>
      <linearGradient id="gradG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${g.stops[0]}" />
        <stop offset="50%" stop-color="${g.stops[1]}" />
        <stop offset="100%" stop-color="${g.stops[2]}" />
      </linearGradient>
    </defs>`;
  } else {
    fill = g.hex;
  }

  function eye(cx, cy) {
    return `
    <g class="finder-eye">
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="0" fill="${fill}" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="0" fill="#FFFFFF" />
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0" fill="${fill}" />
    </g>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="1000" height="1000">
    ${defs}
    <rect width="${totalSize}" height="${totalSize}" fill="#FFFFFF" />
    ${bodySvg}
    ${eye(margin + 3.5, margin + 3.5)}
    ${eye(margin + size - 3.5, margin + 3.5)}
    ${eye(margin + 3.5, margin + size - 3.5)}
  </svg>`;

  const htmlPath = path.resolve('temp_scan.html');
  const pngPath = path.resolve('temp_scan.png');
  fs.writeFileSync(htmlPath, `<!DOCTYPE html><html><body style="margin:0;width:1200px;height:1200px;background:#fff">${svg}</body></html>`);

  execSync(`cmd.exe /c ""${edgePath}" --headless=new --window-size=1200,1200 --screenshot="${pngPath}" "file:///${htmlPath.replace(/\\/g, '/')}"`, { stdio: 'pipe' });

  const data = fs.readFileSync(pngPath);
  const png = PNG.sync.read(data);
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);

  console.log(`${g.name} (${g.hex || 'gradient'}): ${decoded ? '✅ PASS' : '❌ FAIL'}`);
}

fs.unlinkSync(path.resolve('temp_scan.html'));
fs.unlinkSync(path.resolve('temp_scan.png'));
