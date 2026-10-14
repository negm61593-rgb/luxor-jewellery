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

// Test different gold thicknesses and corner stylings
const variations = [
  {
    name: 'heavy_gold_squircle',
    strokeW: 1.3,
    goldRx: 2.8,
    darkRx: 1.5,
    goldSize: 8.8
  },
  {
    name: 'royal_gold_bezel',
    strokeW: 1.1,
    goldRx: 2.6,
    darkRx: 1.4,
    goldSize: 8.6
  },
  {
    name: 'ultra_gold_band',
    strokeW: 1.5,
    goldRx: 3.0,
    darkRx: 1.6,
    goldSize: 9.0
  }
];

for (const v of variations) {
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
    const half = v.goldSize / 2;
    return `
      <!-- Bold Thick Gold Squircle Band (matching user reference image) -->
      <rect x="${cx - half}" y="${cy - half}" width="${v.goldSize}" height="${v.goldSize}" rx="${v.goldRx}" fill="none" stroke="url(#goldGrad)" stroke-width="${v.strokeW}" />
      <!-- Dark Frame (100% camera detection) -->
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="${v.darkRx}" fill="#141310" />
      <!-- White Gap -->
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.0" fill="#FFFFFF" />
      <!-- Dark Center Pupil with subtle gold accent -->
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.7" fill="#141310" stroke="url(#goldGrad)" stroke-width="0.2" />
    `;
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
    <!-- Rich Metallic Gold Gradient identical to user uploaded image -->
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

  const tmpHtml = path.join(__dirname, `test_${v.name}.html`);
  const tmpPng = path.join(__dirname, `test_${v.name}.png`);
  fs.writeFileSync(tmpHtml, `<!DOCTYPE html><html><body style="margin:0;width:1000px;height:1000px;background:#fff;overflow:hidden;">${svg}</body></html>`);

  try {
    execSync(`"${edgePath}" --headless=new --window-size=1000,1000 --screenshot="${tmpPng}" "file:///${tmpHtml.replace(/\\/g, '/')}"`, { stdio: 'pipe' });
    const png = PNG.sync.read(fs.readFileSync(tmpPng));
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    console.log(`[${decoded ? '✅ SUCCESS' : '❌ FAILED'}] ${v.name}: ${decoded ? decoded.data : 'null'}`);
  } catch (err) {
    console.log(`[❌ ERROR] ${v.name}: ${err.message}`);
  }
}
