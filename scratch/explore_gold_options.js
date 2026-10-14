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

// Let's test how much gold we can put on the finder corners while maintaining 100% decode:
const tests = [
  {
    name: 'gold_bracket_outside',
    // Put a thick luxury gold squircle bracket just outside the 7x7 dark frame (e.g. from 7.2 to 8.6 modules)
    drawEye: (cx, cy) => `
      <!-- Bold Luxury Gold Bracket Frame (1.2 modules thick gold) -->
      <rect x="${cx - 4.3}" y="${cy - 4.3}" width="8.6" height="8.6" rx="2.5" fill="none" stroke="url(#goldGrad)" stroke-width="1.0" />
      <!-- Standard 7x7 dark frame for camera detector -->
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="1.5" fill="#141310" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.0" fill="#FFFFFF" />
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.6" fill="#141310" />
    `
  },
  {
    name: 'thick_gold_outer_with_dark_rim',
    // The outer squircle is 7.4x7.4 filled with GOLD, but has a 0.5 module dark inner edge and dark outer shadow
    drawEye: (cx, cy) => `
      <!-- Outer gold band (like user image) -->
      <rect x="${cx - 3.7}" y="${cy - 3.7}" width="7.4" height="7.4" rx="2.2" fill="url(#goldGrad)" />
      <!-- High contrast dark inner border that defines the 7x7 module line -->
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="1.8" fill="none" stroke="#141310" stroke-width="0.8" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.2" fill="#FFFFFF" />
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.8" fill="#141310" stroke="url(#goldGrad)" stroke-width="0.25" />
    `
  },
  {
    name: 'gold_filled_with_dark_border',
    // The 7x7 ring is gold fill with dark borders inside and outside
    drawEye: (cx, cy) => `
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="1.8" fill="url(#goldGrad)" stroke="#141310" stroke-width="0.5" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.2" fill="#FFFFFF" stroke="#141310" stroke-width="0.5" />
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.8" fill="#141310" />
    `
  },
  {
    name: 'gold_bezel_card',
    // The entire QR has 3 gold rounded square cards in the 3 corners, each corner sits on a gold plate
    drawEye: (cx, cy) => `
      <!-- Luxury Gold Corner Medallion Plate -->
      <rect x="${cx - 4.5}" y="${cy - 4.5}" width="9" height="9" rx="3" fill="url(#goldGrad)" opacity="0.95" />
      <!-- Crisp White Separator -->
      <rect x="${cx - 4.0}" y="${cy - 4.0}" width="8" height="8" rx="2.2" fill="#FFFFFF" />
      <!-- 7x7 dark frame -->
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="1.5" fill="#141310" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.0" fill="#FFFFFF" />
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.6" fill="#141310" />
    `
  },
  {
    name: 'dark_gold_bronze_solid',
    // Solid dark metallic bronze-gold (#2A1F08) that is perceived as dark by camera, but has gold metallic sheen
    drawEye: (cx, cy) => `
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="1.8" fill="url(#darkBronzeGrad)" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.2" fill="#FFFFFF" />
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.8" fill="url(#darkBronzeGrad)" />
    `
  }
];

for (const t of tests) {
  const qr = QRCode.create(targetUrl, { errorCorrectionLevel: 'H' });
  const size = qr.modules.size;
  const margin = 5; // give slightly larger margin for outer brackets
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

  const eye1 = t.drawEye(margin + 3.5, margin + 3.5);
  const eye2 = t.drawEye(margin + size - 3.5, margin + 3.5);
  const eye3 = t.drawEye(margin + 3.5, margin + size - 3.5);

  const logoW = cutW * 0.95;
  const logoH = cutH * 0.95;
  const logoX = centerModule - logoW / 2;
  const logoY = centerModule - logoH / 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="1000" height="1000" shape-rendering="geometricPrecision">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C5A059" />
      <stop offset="30%" stop-color="#F3DC9B" />
      <stop offset="70%" stop-color="#C5A059" />
      <stop offset="100%" stop-color="#8E6A26" />
    </linearGradient>
    <linearGradient id="darkBronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1F1706" />
      <stop offset="50%" stop-color="#3D2D0C" />
      <stop offset="100%" stop-color="#140F04" />
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

  const tmpHtml = path.join(__dirname, `gold_explore_${t.name}.html`);
  const tmpPng = path.join(__dirname, `gold_explore_${t.name}.png`);
  fs.writeFileSync(tmpHtml, `<!DOCTYPE html><html><body style="margin:0;width:1000px;height:1000px;background:#fff;overflow:hidden;">${svg}</body></html>`);

  try {
    execSync(`"${edgePath}" --headless=new --window-size=1000,1000 --screenshot="${tmpPng}" "file:///${tmpHtml.replace(/\\/g, '/')}"`, { stdio: 'pipe' });
    const png = PNG.sync.read(fs.readFileSync(tmpPng));
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    console.log(`[${decoded ? '✅ SUCCESS' : '❌ FAILED'}] ${t.name}: ${decoded ? decoded.data : 'null'}`);
  } catch (err) {
    console.log(`[❌ ERROR] ${t.name}: ${err.message}`);
  }
}
