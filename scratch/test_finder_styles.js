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

const variations = [
  {
    name: 'classic_dark',
    desc: 'Dark obsidian squircles 7x7, 5x5 white, 3x3 dark pupil',
    drawEye: (cx, cy) => `
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="1.8" fill="#141310" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.2" fill="#FFFFFF" />
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.8" fill="#141310" />
    `
  },
  {
    name: 'gold_halo_dark_eye',
    desc: 'Outer 8.2x8.2 gold frame halo, inner 7x7 dark squircle, 5x5 white, 3x3 dark pupil',
    drawEye: (cx, cy) => `
      <!-- Luxury Gold Halo -->
      <rect x="${cx - 4.1}" y="${cy - 4.1}" width="8.2" height="8.2" rx="2.5" fill="none" stroke="url(#goldGrad)" stroke-width="0.7" />
      <!-- Standard Dark Finder Frame -->
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="1.8" fill="#141310" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.2" fill="#FFFFFF" />
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.8" fill="#141310" />
    `
  },
  {
    name: 'gold_accent_pupil',
    desc: 'Dark 7x7 frame, white 5x5, dark 3x3 pupil with gold outer stroke',
    drawEye: (cx, cy) => `
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="1.8" fill="#141310" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.2" fill="#FFFFFF" />
      <rect x="${cx - 1.6}" y="${cy - 1.6}" width="3.2" height="3.2" rx="1" fill="#C5A059" />
      <rect x="${cx - 1.3}" y="${cy - 1.3}" width="2.6" height="2.6" rx="0.7" fill="#141310" />
    `
  },
  {
    name: 'dark_bronze_outer',
    desc: 'Very dark bronze-gold (#3A2E12) outer frame with high contrast',
    drawEye: (cx, cy) => `
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="1.8" fill="#2E240D" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.2" fill="#FFFFFF" />
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.8" fill="#2E240D" />
    `
  },
  {
    name: 'gold_double_bezel',
    desc: 'Gold outer bezel 7.4x7.4, dark 7x7 frame, white 5x5, dark 3x3 pupil',
    drawEye: (cx, cy) => `
      <rect x="${cx - 3.7}" y="${cy - 3.7}" width="7.4" height="7.4" rx="2" fill="url(#goldGrad)" />
      <rect x="${cx - 3.3}" y="${cy - 3.3}" width="6.6" height="6.6" rx="1.6" fill="#141310" />
      <rect x="${cx - 2.3}" y="${cy - 2.3}" width="4.6" height="4.6" rx="1.1" fill="#FFFFFF" />
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.8" fill="#141310" />
    `
  }
];

// Test with different cutout sizes for the logo: 7x4, 8x4, 9x4, 8x5
const cutouts = [
  { w: 7, h: 4 },
  { w: 8, h: 4 },
  { w: 9, h: 4 },
  { w: 9, h: 5 }
];

async function runTests() {
  console.log('Testing QR variations against jsQR decoder...\n');

  for (const cut of cutouts) {
    for (const v of variations) {
      const qr = QRCode.create(targetUrl, { errorCorrectionLevel: 'H' });
      const size = qr.modules.size;
      const margin = 4;
      const totalSize = size + margin * 2;
      const centerModule = totalSize / 2;

      const minC = Math.round((size - 1) / 2 - cut.w / 2);
      const maxC = Math.round((size - 1) / 2 + cut.w / 2);
      const minR = Math.round((size - 1) / 2 - cut.h / 2);
      const maxR = Math.round((size - 1) / 2 + cut.h / 2);

      let bodySvg = '';
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (qr.modules.get(r, c)) {
            if ((r <= 7 && c <= 7) || (r <= 7 && c >= size - 8) || (r >= size - 8 && c <= 7)) continue;
            if (r >= minR && r <= maxR && c >= minC && c <= maxC) continue;

            const x = c + margin;
            const y = r + margin;
            bodySvg += `<rect x="${x + 0.06}" y="${y + 0.06}" width="0.88" height="0.88" rx="0.25" fill="#141310" />\n`;
          }
        }
      }

      const eye1 = v.drawEye(margin + 3.5, margin + 3.5);
      const eye2 = v.drawEye(margin + size - 3.5, margin + 3.5);
      const eye3 = v.drawEye(margin + 3.5, margin + size - 3.5);

      const logoW = cut.w * 0.95;
      const logoH = cut.h * 0.95;
      const logoX = centerModule - logoW / 2;
      const logoY = centerModule - logoH / 2;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="1000" height="1000" shape-rendering="geometricPrecision">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#C5A059" />
            <stop offset="25%" stop-color="#F3DC9B" />
            <stop offset="50%" stop-color="#C5A059" />
            <stop offset="75%" stop-color="#E5C275" />
            <stop offset="100%" stop-color="#8E6A26" />
          </linearGradient>
        </defs>
        <rect width="${totalSize}" height="${totalSize}" fill="#FFFFFF" />
        ${bodySvg}
        ${eye1}
        ${eye2}
        ${eye3}
        <!-- White pill badge behind logo for crisp error correction isolation -->
        <rect x="${centerModule - cut.w/2 + 0.2}" y="${centerModule - cut.h/2 + 0.2}" width="${cut.w - 0.4}" height="${cut.h - 0.4}" rx="0.8" fill="#FFFFFF" />
        <image href="${logoDataUri}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" preserveAspectRatio="xMidYMid meet" />
      </svg>`;

      const tempHtml = path.join(scratchDir, `test_${v.name}_${cut.w}x${cut.h}.html`);
      const tempPng = path.join(scratchDir, `test_${v.name}_${cut.w}x${cut.h}.png`);

      fs.writeFileSync(tempHtml, `<!DOCTYPE html><html><body style="margin:0;width:1000px;height:1000px;display:flex;align-items:center;justify-content:center;background:#fff;overflow:hidden;">${svg}</body></html>`);

      try {
        execSync(`"${edgePath}" --headless=new --window-size=1000,1000 --screenshot="${tempPng}" "file:///${tempHtml.replace(/\\/g, '/')}"`, { stdio: 'pipe' });

        const png = PNG.sync.read(fs.readFileSync(tempPng));
        const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);

        const status = (decoded && decoded.data === targetUrl) ? '✅ SUCCESS' : '❌ FAILED';
        console.log(`[${status}] cut=${cut.w}x${cut.h} | style=${v.name}: ${decoded ? decoded.data : 'null'}`);
      } catch (err) {
        console.log(`[❌ ERROR] ${v.name}: ${err.message}`);
      } finally {
        if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
      }
    }
  }
}

runTests();
