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

const candidateGradients = [
  {
    name: 'warm_metallic_gold',
    grad: `
      <linearGradient id="g_test" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#543C08" />
        <stop offset="30%" stop-color="#BF9528" />
        <stop offset="70%" stop-color="#8A6313" />
        <stop offset="100%" stop-color="#3D2B05" />
      </linearGradient>
    `
  },
  {
    name: 'rich_24k_darker',
    grad: `
      <linearGradient id="g_test" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#5E430B" />
        <stop offset="25%" stop-color="#C5A059" />
        <stop offset="50%" stop-color="#856012" />
        <stop offset="75%" stop-color="#C5A059" />
        <stop offset="100%" stop-color="#453106" />
      </linearGradient>
    `
  },
  {
    name: 'antique_solid_gold',
    grad: `
      <linearGradient id="g_test" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4A3408" />
        <stop offset="35%" stop-color="#B88B22" />
        <stop offset="65%" stop-color="#70500F" />
        <stop offset="100%" stop-color="#362504" />
      </linearGradient>
    `
  }
];

let standTemplate = fs.readFileSync(path.join(__dirname, '..', 'qr-codes', 'LUXOR_JEWELLERY_Stand_Light.html'), 'utf8');

for (const cg of candidateGradients) {
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

  function drawEye(cx, cy) {
    const rx = 1.8;
    return `
    <g class="finder-eye">
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="${rx}" fill="url(#g_test)" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="${rx * 0.65}" fill="#FFFFFF" />
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

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="100%" height="100%" shape-rendering="geometricPrecision">
  <defs>
    ${cg.grad}
  </defs>
  <rect width="${totalSize}" height="${totalSize}" fill="#FFFFFF" />
  ${bodySvg}
  ${eye1}
  ${eye2}
  ${eye3}
  <rect x="${logoX - 0.2}" y="${logoY - 0.2}" width="${logoW + 0.4}" height="${logoH + 0.4}" rx="0.8" fill="#FFFFFF" />
  <image href="${logoDataUri}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" preserveAspectRatio="xMidYMid meet" />
  </svg>`;

  // 1. Standalone test
  const tmpQrHtml = path.join(__dirname, `test_qr_${cg.name}.html`);
  const tmpQrPng = path.join(__dirname, `test_qr_${cg.name}.png`);
  fs.writeFileSync(tmpQrHtml, `<!DOCTYPE html><html><body style="margin:0;width:1200px;height:1200px;background:#fff;overflow:hidden;">${svg}</body></html>`);
  execSync(`"${edgePath}" --headless=new --window-size=1200,1200 --screenshot="${tmpQrPng}" "file:///${tmpQrHtml.replace(/\\/g, '/')}"`, { stdio: 'pipe' });
  const pngQr = PNG.sync.read(fs.readFileSync(tmpQrPng));
  const decodedQr = jsQR(new Uint8ClampedArray(pngQr.data), pngQr.width, pngQr.height);

  // 2. Stand test
  const standContent = standTemplate.replace(/<div class="qr-container">[\s\S]*?<\/div>/, `<div class="qr-container">\n${svg}\n</div>`);
  const tmpStandHtml = path.join(__dirname, `test_stand_${cg.name}.html`);
  const tmpStandPng = path.join(__dirname, `test_stand_${cg.name}.png`);
  fs.writeFileSync(tmpStandHtml, standContent);
  execSync(`"${edgePath}" --headless=new --window-size=1000,1450 --screenshot="${tmpStandPng}" "file:///${tmpStandHtml.replace(/\\/g, '/')}"`, { stdio: 'pipe' });
  const pngStand = PNG.sync.read(fs.readFileSync(tmpStandPng));
  const decodedStand = jsQR(new Uint8ClampedArray(pngStand.data), pngStand.width, pngStand.height);

  console.log(`[${cg.name}] Standalone: ${decodedQr ? '✅ 100%' : '❌'} | Full Stand: ${decodedStand ? '✅ 100%' : '❌'}`);
}
