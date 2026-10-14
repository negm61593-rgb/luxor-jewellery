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

// Test solid filled gold squircle (exact geometry: 7x7 gold fill, 5x5 white fill, 3x3 dark fill)
// Testing different gold colors from user's champagne gold to deeper gold:

const golds = [
  {
    name: 'champagne_user_gold',
    grad: `
      <linearGradient id="g_champ" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#C5A059" />
        <stop offset="25%" stop-color="#F5E4B5" />
        <stop offset="50%" stop-color="#C5A059" />
        <stop offset="75%" stop-color="#E2BF6F" />
        <stop offset="100%" stop-color="#8E6A26" />
      </linearGradient>
    `,
    id: 'g_champ'
  },
  {
    name: 'rich_24k_gold',
    grad: `
      <linearGradient id="g_24k" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8C6615" />
        <stop offset="25%" stop-color="#D4AF37" />
        <stop offset="50%" stop-color="#A67B18" />
        <stop offset="75%" stop-color="#D4AF37" />
        <stop offset="100%" stop-color="#6B4D0D" />
      </linearGradient>
    `,
    id: 'g_24k'
  },
  {
    name: 'deep_contrast_gold',
    grad: `
      <linearGradient id="g_deep" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4A3408" />
        <stop offset="25%" stop-color="#C5A059" />
        <stop offset="50%" stop-color="#7A560E" />
        <stop offset="75%" stop-color="#D4AF37" />
        <stop offset="100%" stop-color="#362504" />
      </linearGradient>
    `,
    id: 'g_deep'
  },
  {
    name: 'warm_metallic_gold',
    grad: `
      <linearGradient id="g_warm" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#664B10" />
        <stop offset="30%" stop-color="#BF9528" />
        <stop offset="70%" stop-color="#8A6313" />
        <stop offset="100%" stop-color="#4D370A" />
      </linearGradient>
    `,
    id: 'g_warm'
  }
];

for (const g of golds) {
  for (const rx of [1.4, 1.8, 2.2]) {
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

    // Exact user image structure:
    // Outer 7x7 solid gold squircle!
    // Inner 5x5 solid white gap!
    // Center 3x3 solid dark pupil with optional glint!
    function drawEye(cx, cy) {
      return `
      <g class="finder-eye">
        <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="${rx}" fill="url(#${g.id})" />
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

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="1000" height="1000" shape-rendering="geometricPrecision">
    <defs>
      ${g.grad}
    </defs>
    <rect width="${totalSize}" height="${totalSize}" fill="#FFFFFF" />
    ${bodySvg}
    ${eye1}
    ${eye2}
    ${eye3}
    <rect x="${logoX - 0.2}" y="${logoY - 0.2}" width="${logoW + 0.4}" height="${logoH + 0.4}" rx="0.8" fill="#FFFFFF" />
    <image href="${logoDataUri}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" preserveAspectRatio="xMidYMid meet" />
    </svg>`;

    const tmpHtml = path.join(__dirname, 'filled_test.html');
    const tmpPng = path.join(__dirname, 'filled_test.png');
    fs.writeFileSync(tmpHtml, `<!DOCTYPE html><html><body style="margin:0;width:1000px;height:1000px;background:#fff;overflow:hidden;">${svg}</body></html>`);

    try {
      execSync(`"${edgePath}" --headless=new --window-size=1000,1000 --screenshot="${tmpPng}" "file:///${tmpHtml.replace(/\\/g, '/')}"`, { stdio: 'pipe' });
      const png = PNG.sync.read(fs.readFileSync(tmpPng));
      const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
      console.log(`[${decoded ? '✅ SUCCESS' : '❌ FAILED'}] gold=${g.name}, rx=${rx} -> ${decoded ? decoded.data : 'null'}`);
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
}
