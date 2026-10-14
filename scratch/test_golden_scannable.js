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

// Let's test different approaches to make the corners look unmistakably GOLDEN while scanning 100%:

const styles = [
  {
    name: 'deep_antique_gold',
    desc: 'Deep bronze/antique gold gradient that has enough luminance contrast (<80) to be seen as black by cameras, but looks rich gold/bronze to human eyes',
    goldGrad: `
      <linearGradient id="goldEyeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4A3710" />
        <stop offset="30%" stop-color="#7A5C1B" />
        <stop offset="70%" stop-color="#4A3710" />
        <stop offset="100%" stop-color="#2D2109" />
      </linearGradient>
    `,
    drawEye: (cx, cy) => `
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="2" fill="none" stroke="url(#goldEyeGrad)" stroke-width="1.1" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.3" fill="#FFFFFF" />
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="1" fill="#141310" />
    `
  },
  {
    name: 'gold_outer_dark_inner_bezel',
    desc: 'Thick bright gold outer squircle (like in user image) WITH a crisp dark inner border so the camera locks onto the dark edge',
    goldGrad: `
      <linearGradient id="goldEyeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#C5A059" />
        <stop offset="25%" stop-color="#F3DC9B" />
        <stop offset="50%" stop-color="#C5A059" />
        <stop offset="75%" stop-color="#E5C275" />
        <stop offset="100%" stop-color="#8E6A26" />
      </linearGradient>
    `,
    drawEye: (cx, cy) => `
      <!-- Thick Luxury Gold Band (exactly like user image) -->
      <rect x="${cx - 3.6}" y="${cy - 3.6}" width="7.2" height="7.2" rx="2.2" fill="none" stroke="url(#goldEyeGrad)" stroke-width="1.2" />
      <!-- Dark contrast trace lining the gold band on the inside -->
      <rect x="${cx - 3.0}" y="${cy - 3.0}" width="6.0" height="6.0" rx="1.6" fill="none" stroke="#141310" stroke-width="0.35" />
      <!-- Inner white gap -->
      <rect x="${cx - 2.4}" y="${cy - 2.4}" width="4.8" height="4.8" rx="1.2" fill="#FFFFFF" />
      <!-- Dark center pupil with gold rim -->
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="1" fill="#141310" stroke="url(#goldEyeGrad)" stroke-width="0.2" />
    `
  },
  {
    name: 'gold_framed_dark_squircle',
    desc: 'Prominent thick gold frame surrounding dark squircle eye',
    goldGrad: `
      <linearGradient id="goldEyeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#C5A059" />
        <stop offset="30%" stop-color="#F3DC9B" />
        <stop offset="70%" stop-color="#C5A059" />
        <stop offset="100%" stop-color="#8E6A26" />
      </linearGradient>
    `,
    drawEye: (cx, cy) => `
      <!-- Bold Gold Outer Squircle (3D Bevel) -->
      <rect x="${cx - 3.7}" y="${cy - 3.7}" width="7.4" height="7.4" rx="2.2" fill="url(#goldEyeGrad)" />
      <!-- High contrast dark layer -->
      <rect x="${cx - 3.3}" y="${cy - 3.3}" width="6.6" height="6.6" rx="1.8" fill="#141310" />
      <!-- White gap -->
      <rect x="${cx - 2.3}" y="${cy - 2.3}" width="4.6" height="4.6" rx="1.1" fill="#FFFFFF" />
      <!-- Dark Pupil with Gold Center -->
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.8" fill="#141310" />
      <rect x="${cx - 0.7}" y="${cy - 0.7}" width="1.4" height="1.4" rx="0.4" fill="url(#goldEyeGrad)" />
    `
  },
  {
    name: 'gold_surround_halo',
    desc: 'The entire 7x7 corner area sits in an opulent gold luxury card bracket, while 7x7 has high-contrast dark lines',
    goldGrad: `
      <linearGradient id="goldEyeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#C5A059" />
        <stop offset="30%" stop-color="#F3DC9B" />
        <stop offset="70%" stop-color="#C5A059" />
        <stop offset="100%" stop-color="#8E6A26" />
      </linearGradient>
    `,
    drawEye: (cx, cy) => `
      <!-- Distinct Gold Outer Ring (thickness 1.2 modules) -->
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="2" fill="url(#goldEyeGrad)" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.3" fill="#FFFFFF" />
      <!-- Dark core outlines to give edge detector contrast -->
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="2" fill="none" stroke="#221C10" stroke-width="0.3" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.3" fill="none" stroke="#221C10" stroke-width="0.3" />
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="1" fill="#141310" />
    `
  }
];

async function run() {
  console.log('Testing Gold Eye styles for 100% camera readability...\n');

  for (const s of styles) {
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

    const eye1 = s.drawEye(margin + 3.5, margin + 3.5);
    const eye2 = s.drawEye(margin + size - 3.5, margin + 3.5);
    const eye3 = s.drawEye(margin + 3.5, margin + size - 3.5);

    const logoW = cutW * 0.95;
    const logoH = cutH * 0.95;
    const logoX = centerModule - logoW / 2;
    const logoY = centerModule - logoH / 2;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="1000" height="1000" shape-rendering="geometricPrecision">
    <defs>
      ${s.goldGrad}
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

    const tmpHtml = path.join(__dirname, `gold_test_${s.name}.html`);
    const tmpPng = path.join(__dirname, `gold_test_${s.name}.png`);
    fs.writeFileSync(tmpHtml, `<!DOCTYPE html><html><body style="margin:0;width:1000px;height:1000px;background:#fff;overflow:hidden;">${svg}</body></html>`);

    execSync(`"${edgePath}" --headless=new --window-size=1000,1000 --screenshot="${tmpPng}" "file:///${tmpHtml.replace(/\\/g, '/')}"`, { stdio: 'pipe' });

    const png = PNG.sync.read(fs.readFileSync(tmpPng));
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);

    console.log(`[${decoded ? '✅ SUCCESS' : '❌ FAILED'}] ${s.name}: ${decoded ? decoded.data : 'null'}`);
    if (fs.existsSync(tmpHtml)) fs.unlinkSync(tmpHtml);
  }
}

run();
