const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const PNG = require('pngjs').PNG;
const jsQR = require('jsqr');

const targetUrl = 'https://luxor-jewellery.vercel.app';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const scratchDir = __dirname;

const logoTransparentPath = path.join(__dirname, '..', 'logo_transparent.png');
let logoDataUri = '';
if (fs.existsSync(logoTransparentPath)) {
  const logoBase64 = fs.readFileSync(logoTransparentPath).toString('base64');
  logoDataUri = 'data:image/png;base64,' + logoBase64;
}

// Function to generate QR with given eye style and module style
function makeQrSvg({ eyeStyle, moduleStyle, cutW, cutH }) {
  const qr = QRCode.create(targetUrl, { errorCorrectionLevel: 'H' });
  const size = qr.modules.size; // 33
  const margin = 4;
  const totalSize = size + margin * 2; // 41
  const centerModule = totalSize / 2;

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
        if (moduleStyle === 'squircle') {
          bodySvg += `<rect x="${x + 0.05}" y="${y + 0.05}" width="0.9" height="0.9" rx="0.22" fill="#141310" />\n`;
        } else if (moduleStyle === 'smooth') {
          bodySvg += `<rect x="${x + 0.02}" y="${y + 0.02}" width="0.96" height="0.96" rx="0.15" fill="#141310" />\n`;
        } else {
          bodySvg += `<rect x="${x}" y="${y}" width="1" height="1" fill="#141310" />\n`;
        }
      }
    }
  }

  function drawEye(cx, cy) {
    if (eyeStyle === 'luxury_squircle') {
      // Luxury dark squircle with subtle gold outer ring
      return `
      <g>
        <!-- Dark squircle outer ring (7x7) -->
        <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="1.8" fill="#141310" />
        <!-- White gap (5x5) -->
        <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.2" fill="#FFFFFF" />
        <!-- Dark pupil (3x3) -->
        <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.8" fill="#141310" />
      </g>`;
    } else if (eyeStyle === 'gold_accent_squircle') {
      // Dark squircle outer ring with gold trim on outer edge
      return `
      <g>
        <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="1.8" fill="#141310" stroke="url(#goldGrad)" stroke-width="0.3" />
        <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.2" fill="#FFFFFF" />
        <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.8" fill="#141310" stroke="url(#goldGrad)" stroke-width="0.2" />
      </g>`;
    } else {
      // Classic crisp dark
      return `
      <g>
        <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="0.4" fill="#141310" />
        <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="0.2" fill="#FFFFFF" />
        <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.2" fill="#141310" />
      </g>`;
    }
  }

  const eye1 = drawEye(margin + 3.5, margin + 3.5);
  const eye2 = drawEye(margin + size - 3.5, margin + 3.5);
  const eye3 = drawEye(margin + 3.5, margin + size - 3.5);

  const logoW = cutW * 0.95;
  const logoH = cutH * 0.95;
  const logoX = centerModule - logoW / 2;
  const logoY = centerModule - logoH / 2;

  const shapeRendering = moduleStyle === 'classic' ? 'crispEdges' : 'geometricPrecision';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="440" height="440" shape-rendering="${shapeRendering}">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C5A059" />
      <stop offset="35%" stop-color="#F3DC9B" />
      <stop offset="70%" stop-color="#C5A059" />
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

const configs = [
  { name: 'classic_square_8x4', eyeStyle: 'classic', moduleStyle: 'classic', cutW: 8, cutH: 4 },
  { name: 'smooth_square_8x4', eyeStyle: 'luxury_squircle', moduleStyle: 'smooth', cutW: 8, cutH: 4 },
  { name: 'squircle_8x4', eyeStyle: 'luxury_squircle', moduleStyle: 'squircle', cutW: 8, cutH: 4 },
  { name: 'gold_accent_8x4', eyeStyle: 'gold_accent_squircle', moduleStyle: 'squircle', cutW: 8, cutH: 4 },
  { name: 'squircle_7x4', eyeStyle: 'luxury_squircle', moduleStyle: 'squircle', cutW: 7, cutH: 4 }
];

console.log('Testing configs on standalone SVG and Stand HTML...\n');

for (const cfg of configs) {
  const svg = makeQrSvg(cfg);

  // Test 1: standalone QR PNG (800x800)
  const tempQrHtml = path.join(scratchDir, `qr_${cfg.name}.html`);
  const tempQrPng = path.join(scratchDir, `qr_${cfg.name}.png`);
  fs.writeFileSync(tempQrHtml, `<!DOCTYPE html><html><body style="margin:0;display:flex;align-items:center;justify-content:center;width:800px;height:800px;background:#fff;">${svg}</body></html>`);
  
  execSync(`"${edgePath}" --headless=new --window-size=800,800 --screenshot="${tempQrPng}" "file:///${tempQrHtml.replace(/\\/g, '/')}"`, { stdio: 'pipe' });
  const pngQr = PNG.sync.read(fs.readFileSync(tempQrPng));
  const decodedQr = jsQR(new Uint8ClampedArray(pngQr.data), pngQr.width, pngQr.height);
  const qrOk = (decodedQr && decodedQr.data === targetUrl);

  console.log(`[STANDALONE] ${cfg.name}: ${qrOk ? '✅ DECODED 100%' : '❌ FAILED'}`);

  if (fs.existsSync(tempQrHtml)) fs.unlinkSync(tempQrHtml);
  if (!qrOk) continue;

  // Test 2: In Stand Card HTML (1000x1450)
  // Read existing template
  let standHtml = fs.readFileSync(path.join(__dirname, '..', 'qr-codes', 'LUXOR_JEWELLERY_Stand_Light.html'), 'utf8');
  // Replace the <div class="qr-container">...</div>
  standHtml = standHtml.replace(/<div class="qr-container">[\s\S]*?<\/div>/, `<div class="qr-container">\n${svg}\n</div>`);
  
  const tempStandHtml = path.join(scratchDir, `stand_${cfg.name}.html`);
  const tempStandPng = path.join(scratchDir, `stand_${cfg.name}.png`);
  fs.writeFileSync(tempStandHtml, standHtml);

  execSync(`"${edgePath}" --headless=new --window-size=1000,1450 --screenshot="${tempStandPng}" "file:///${tempStandHtml.replace(/\\/g, '/')}"`, { stdio: 'pipe' });

  // Crop QR area from the stand PNG
  // QR container in 1000x1450 is around x: 260..740, y: 220..700
  const standPngData = PNG.sync.read(fs.readFileSync(tempStandPng));
  // Let's test direct scan on the entire stand image first!
  const directStandDecode = jsQR(new Uint8ClampedArray(standPngData.data), standPngData.width, standPngData.height);
  console.log(`  -> Full Stand scan (${standPngData.width}x${standPngData.height}): ${directStandDecode ? '✅ DECODED 100% (' + directStandDecode.data + ')' : '⚠️ Full scan missed, checking crop...'}`);

  // Test cropped QR (500x500 area around center)
  const cropW = 520, cropH = 520;
  const startX = 240, startY = 220;
  const crop = new PNG({ width: cropW, height: cropH });
  PNG.bitblt(standPngData, crop, startX, startY, cropW, cropH, 0, 0);
  const cropDecode = jsQR(new Uint8ClampedArray(crop.data), cropW, cropH);
  console.log(`  -> Cropped Stand scan (${cropW}x${cropH}): ${cropDecode ? '✅ DECODED 100% (' + cropDecode.data + ')' : '❌ FAILED'}`);

  if (fs.existsSync(tempStandHtml)) fs.unlinkSync(tempStandHtml);
}
