const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const PNG = require('pngjs').PNG;
const jsQR = require('jsqr');

const targetUrl = 'https://luxor-jewellery.vercel.app';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const logoTransparentPath = path.join(__dirname, '..', 'logo_transparent.png');
const logoBase64 = fs.readFileSync(logoTransparentPath).toString('base64');
const logoDataUri = 'data:image/png;base64,' + logoBase64;

function makeGoldBracketQrSvg() {
  const qr = QRCode.create(targetUrl, { errorCorrectionLevel: 'H' });
  const size = qr.modules.size;
  const margin = 5;
  const totalSize = size + margin * 2;
  const centerModule = totalSize / 2;

  const cutW = 8, cutH = 4;
  const minC = Math.round((size - 1) / 2 - cutW / 2);
  const maxC = Math.round((size - 1) / 2 + cutW / 2);
  const minR = Math.round((size - 1) / 2 - cutH / 2);
  const maxR = Math.round((size - 1) / 2 + cutH / 2);

  let bodySvg = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (qr.modules.get(r, c)) {
        if ((r <= 7 && c <= 7) || (r <= 7 && c >= size - 8) || (r >= size - 8 && c <= 7)) continue;
        if (r >= minR && r <= maxR && c >= minC && c <= maxC) continue;
        const x = c + margin;
        const y = r + margin;
        bodySvg += `<rect x="${x + 0.05}" y="${y + 0.05}" width="0.9" height="0.9" rx="0.15" fill="#141310" />\n`;
      }
    }
  }

  function drawEye(cx, cy) {
    return `
      <!-- Bold Luxury Gold Bracket Frame (matches user reference image) -->
      <rect x="${cx - 4.3}" y="${cy - 4.3}" width="8.6" height="8.6" rx="2.5" fill="none" stroke="url(#goldGrad)" stroke-width="1.0" />
      <!-- Standard 7x7 dark frame for camera detector -->
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="1.5" fill="#141310" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.0" fill="#FFFFFF" />
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.6" fill="#141310" />
    `;
  }

  const eye1 = drawEye(margin + 3.5, margin + 3.5);
  const eye2 = drawEye(margin + size - 3.5, margin + 3.5);
  const eye3 = drawEye(margin + 3.5, margin + size - 3.5);

  const logoW = cutW * 0.95;
  const logoH = cutH * 0.95;
  const logoX = centerModule - logoW / 2;
  const logoY = centerModule - logoH / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="100%" height="100%" shape-rendering="geometricPrecision">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C5A059" />
      <stop offset="25%" stop-color="#F5E4B5" />
      <stop offset="50%" stop-color="#C5A059" />
      <stop offset="75%" stop-color="#E2BF6F" />
      <stop offset="100%" stop-color="#8E6A26" />
    </linearGradient>
  </defs>
  <rect width="${totalSize}" height="${totalSize}" fill="#FFFFFF" />
  ${bodySvg}
  ${eye1}
  ${eye2}
  ${eye3}
  <rect x="${logoX - 0.2}" y="${logoY - 0.2}" width="${logoW + 0.4}" height="${logoH + 0.4}" rx="0.8" fill="#FFFFFF" />
  <image href="${logoDataUri}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" preserveAspectRatio="xMidYMid meet" />
  </svg>`;
}

const svg = makeGoldBracketQrSvg();

// 1. Standalone test
const tmpHtml = path.join(__dirname, 'test_bracket_final.html');
const tmpPng = path.join(__dirname, 'test_bracket_final.png');
fs.writeFileSync(tmpHtml, `<!DOCTYPE html><html><body style="margin:0;width:1200px;height:1200px;background:#fff;overflow:hidden;">${svg}</body></html>`);
execSync(`"${edgePath}" --headless=new --window-size=1200,1200 --screenshot="${tmpPng}" "file:///${tmpHtml.replace(/\\/g, '/')}"`, { stdio: 'pipe' });

const png = PNG.sync.read(fs.readFileSync(tmpPng));
const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
console.log('Standalone 1200x1200 decode:', decoded ? '✅ ' + decoded.data : '❌ FAILED');

// 2. Stand test
let standHtml = fs.readFileSync(path.join(__dirname, '..', 'qr-codes', 'LUXOR_JEWELLERY_Stand_Light.html'), 'utf8');
standHtml = standHtml.replace(/<div class="qr-container">[\s\S]*?<\/div>/, `<div class="qr-container">\n${svg}\n</div>`);
const tmpStandHtml = path.join(__dirname, 'test_stand_bracket.html');
const tmpStandPng = path.join(__dirname, 'test_stand_bracket.png');
fs.writeFileSync(tmpStandHtml, standHtml);
execSync(`"${edgePath}" --headless=new --window-size=1000,1450 --screenshot="${tmpStandPng}" "file:///${tmpStandHtml.replace(/\\/g, '/')}"`, { stdio: 'pipe' });

const pngStand = PNG.sync.read(fs.readFileSync(tmpStandPng));
const decodedStand = jsQR(new Uint8ClampedArray(pngStand.data), pngStand.width, pngStand.height);
console.log('Full Stand 1000x1450 decode:', decodedStand ? '✅ ' + decodedStand.data : '❌ FAILED');
