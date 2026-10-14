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

// Let's test single gold squircle rings with different gold tones (from rich gold to dark gold)
// NO black strokes inside or outside! Just a single solid squircle stroke="url(#gold)"!

const candidates = [
  {
    name: 'warm_dark_gold',
    grad: `
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4A3408" />
        <stop offset="35%" stop-color="#8C6615" />
        <stop offset="70%" stop-color="#5E430B" />
        <stop offset="100%" stop-color="#362504" />
      </linearGradient>
    `,
    id: 'g1'
  },
  {
    name: 'rich_metallic_gold',
    grad: `
      <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3D2B05" />
        <stop offset="30%" stop-color="#A67B18" />
        <stop offset="60%" stop-color="#6B4D0D" />
        <stop offset="100%" stop-color="#2B1E03" />
      </linearGradient>
    `,
    id: 'g2'
  },
  {
    name: 'antique_24k_gold',
    grad: `
      <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2D1F02" />
        <stop offset="35%" stop-color="#8F6813" />
        <stop offset="65%" stop-color="#543C08" />
        <stop offset="100%" stop-color="#1F1501" />
      </linearGradient>
    `,
    id: 'g3'
  },
  {
    name: 'solid_antique_gold',
    grad: `
      <linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#332405" />
        <stop offset="50%" stop-color="#6E4F0D" />
        <stop offset="100%" stop-color="#2B1D03" />
      </linearGradient>
    `,
    id: 'g4'
  }
];

for (const c of candidates) {
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

  // Exact shape as user reference image:
  // Outer squircle: stroke="url(#...)" with width="1.0", rx="2.0"
  // Inner gap: 5x5 white, rx="1.3"
  // Pupil: 3x3 dark, rx="0.8"
  function drawEye(cx, cy) {
    return `
    <g class="finder-eye">
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="2.0" fill="none" stroke="url(#${c.id})" stroke-width="1.0" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.3" fill="#FFFFFF" />
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.8" fill="#141310" />
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
    ${c.grad}
  </defs>
  <rect width="${totalSize}" height="${totalSize}" fill="#FFFFFF" />
  ${bodySvg}
  ${eye1}
  ${eye2}
  ${eye3}
  <rect x="${logoX - 0.2}" y="${logoY - 0.2}" width="${logoW + 0.4}" height="${logoH + 0.4}" rx="0.8" fill="#FFFFFF" />
  <image href="${logoDataUri}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" preserveAspectRatio="xMidYMid meet" />
  </svg>`;

  const tmpHtml = path.join(__dirname, `single_gold_${c.name}.html`);
  const tmpPng = path.join(__dirname, `single_gold_${c.name}.png`);
  fs.writeFileSync(tmpHtml, `<!DOCTYPE html><html><body style="margin:0;width:1000px;height:1000px;background:#fff;overflow:hidden;">${svg}</body></html>`);

  try {
    execSync(`"${edgePath}" --headless=new --window-size=1000,1000 --screenshot="${tmpPng}" "file:///${tmpHtml.replace(/\\/g, '/')}"`, { stdio: 'pipe' });
    const png = PNG.sync.read(fs.readFileSync(tmpPng));
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    console.log(`[${decoded ? '✅ SUCCESS' : '❌ FAILED'}] ${c.name}: ${decoded ? decoded.data : 'null'}`);
  } catch (err) {
    console.log(`[❌ ERROR] ${c.name}: ${err.message}`);
  }
}
