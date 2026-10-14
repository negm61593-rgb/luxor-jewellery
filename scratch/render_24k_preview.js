const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetUrl = 'https://luxor-jewellery.vercel.app';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const logoTransparentPath = path.join(__dirname, '..', 'logo_transparent.png');
const logoBase64 = fs.readFileSync(logoTransparentPath).toString('base64');
const logoDataUri = 'data:image/png;base64,' + logoBase64;

const qr = QRCode.create(targetUrl, { errorCorrectionLevel: 'H' });
const size = qr.modules.size;
const margin = 4;
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

// Pure 24K Gold squircle without glint dot (SOLID pupil)
function drawEye(cx, cy) {
  const rx = 1.8;
  return `
  <g class="finder-eye">
    <!-- Solid 24k Gold Squircle Frame (Pure Gold, exactly like user reference image) -->
    <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="${rx}" fill="url(#gold24k)" />
    <!-- White Gap -->
    <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="${rx * 0.65}" fill="#FFFFFF" />
    <!-- Rounded Dark Pupil (solid, clean edge for camera lock) -->
    <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="${rx * 0.45}" fill="#141310" />
  </g>`;
}

const eye1 = drawEye(margin + 3.5, margin + 3.5);
const eye2 = drawEye(margin + size - 3.5, margin + 3.5);
const eye3 = drawEye(margin + 3.5, margin + size - 3.5);

const logoW = cutW * 0.95;
const logoH = cutH * 0.95;
const logoX = centerModule - logoW / 2;
const logoY = centerModule - logoH / 2;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="1000" height="1000" shape-rendering="geometricPrecision">
<defs>
  <!-- Rich Polished 24K Gold Gradient -->
  <linearGradient id="gold24k" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#8C6615" />
    <stop offset="25%" stop-color="#D4AF37" />
    <stop offset="50%" stop-color="#A67B18" />
    <stop offset="75%" stop-color="#D4AF37" />
    <stop offset="100%" stop-color="#6B4D0D" />
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

const tmpHtml = path.join(__dirname, 'rich_24k_preview.html');
const tmpPng = path.join(__dirname, 'rich_24k_preview.png');
fs.writeFileSync(tmpHtml, `<!DOCTYPE html><html><body style="margin:0;width:1000px;height:1000px;background:#fff;overflow:hidden;">${svg}</body></html>`);
execSync(`"${edgePath}" --headless=new --window-size=1000,1000 --screenshot="${tmpPng}" "file:///${tmpHtml.replace(/\\/g, '/')}"`, { stdio: 'pipe' });

const PNG = require('pngjs').PNG;
const jsQR = require('jsqr');
const png = PNG.sync.read(fs.readFileSync(tmpPng));
const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
console.log('Preview decode result without glint dot:', decoded ? '✅ ' + decoded.data : '❌ FAILED');
