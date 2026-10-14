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

// We want the finder eye to be PURE GOLD (no black outline, just a solid gold squircle ring)!
// Let's test different gold gradients and see which ones pass jsQR!

const goldGradients = [
  {
    name: 'user_champagne',
    desc: 'The original champagne gold from user image',
    svg: `
      <linearGradient id="g_user" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#C5A059" />
        <stop offset="35%" stop-color="#F3DC9B" />
        <stop offset="70%" stop-color="#C5A059" />
        <stop offset="100%" stop-color="#8E6A26" />
      </linearGradient>
    `,
    id: 'g_user'
  },
  {
    name: 'rich_24k_gold',
    desc: 'Rich 24k gold with darker base',
    svg: `
      <linearGradient id="g_24k" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8C6615" />
        <stop offset="30%" stop-color="#D4AF37" />
        <stop offset="70%" stop-color="#A67B18" />
        <stop offset="100%" stop-color="#6B4D0D" />
      </linearGradient>
    `,
    id: 'g_24k'
  },
  {
    name: 'deep_luxury_gold',
    desc: 'Deep metallic gold with high contrast for cameras but lustrous gold for eyes',
    svg: `
      <linearGradient id="g_deep" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#5E430B" />
        <stop offset="30%" stop-color="#B88B22" />
        <stop offset="70%" stop-color="#856012" />
        <stop offset="100%" stop-color="#453106" />
      </linearGradient>
    `,
    id: 'g_deep'
  },
  {
    name: 'burnished_gold',
    desc: 'Burnished royal gold',
    svg: `
      <linearGradient id="g_burnish" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4F380A" />
        <stop offset="25%" stop-color="#9C731A" />
        <stop offset="50%" stop-color="#CCA136" />
        <stop offset="75%" stop-color="#7D5B11" />
        <stop offset="100%" stop-color="#3D2B05" />
      </linearGradient>
    `,
    id: 'g_burnish'
  },
  {
    name: 'gold_with_inner_shadow',
    desc: 'Gold with 3D drop/inner shadow effect that maintains sharp dark edge for camera',
    svg: `
      <linearGradient id="g_shadow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#694C10" />
        <stop offset="35%" stop-color="#D9A934" />
        <stop offset="65%" stop-color="#8A6313" />
        <stop offset="100%" stop-color="#3B2905" />
      </linearGradient>
    `,
    id: 'g_shadow'
  }
];

// Test parameters: stroke-width, squircle radius, and center cutout
const testCombos = [];

for (const grad of goldGradients) {
  for (const strokeW of [1.0, 1.05, 1.15, 1.25]) {
    for (const rx of [1.6, 2.0, 2.4]) {
      testCombos.push({ grad, strokeW, rx });
    }
  }
}

console.log(`Testing ${testCombos.length} pure gold eye configurations...\n`);

async function testAll() {
  let successCount = 0;

  for (let i = 0; i < testCombos.length; i++) {
    const { grad, strokeW, rx } = testCombos[i];

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

    // PURE GOLD EYE:
    // Outer frame is ONLY stroke="url(#...)" with NO black stroke!
    function drawEye(cx, cy) {
      return `
      <g class="finder-eye">
        <!-- Pure Gold Squircle Frame (thickness: ${strokeW}, radius: ${rx}) -->
        <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="${rx}" fill="none" stroke="url(#${grad.id})" stroke-width="${strokeW}" />
        <!-- Inner white gap -->
        <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="${rx * 0.65}" fill="#FFFFFF" />
        <!-- Dark Obsidian Pupil -->
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
      ${grad.svg}
    </defs>
    <rect width="${totalSize}" height="${totalSize}" fill="#FFFFFF" />
    ${bodySvg}
    ${eye1}
    ${eye2}
    ${eye3}
    <rect x="${logoX - 0.2}" y="${logoY - 0.2}" width="${logoW + 0.4}" height="${logoH + 0.4}" rx="0.8" fill="#FFFFFF" />
    <image href="${logoDataUri}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" preserveAspectRatio="xMidYMid meet" />
    </svg>`;

    const tmpHtml = path.join(__dirname, 'test_gold_temp.html');
    const tmpPng = path.join(__dirname, 'test_gold_temp.png');
    fs.writeFileSync(tmpHtml, `<!DOCTYPE html><html><body style="margin:0;width:1000px;height:1000px;background:#fff;overflow:hidden;">${svg}</body></html>`);

    try {
      execSync(`"${edgePath}" --headless=new --window-size=1000,1000 --screenshot="${tmpPng}" "file:///${tmpHtml.replace(/\\/g, '/')}"`, { stdio: 'pipe' });
      const png = PNG.sync.read(fs.readFileSync(tmpPng));
      const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);

      if (decoded && decoded.data === targetUrl) {
        successCount++;
        console.log(`🎉 [SUCCESS #${successCount}] grad=${grad.name}, strokeW=${strokeW}, rx=${rx} -> DECODED 100%!`);
      }
    } catch (e) {
      // ignore
    }
  }

  console.log(`\nFinished testing. Total successes: ${successCount}`);
  if (fs.existsSync(path.join(__dirname, 'test_gold_temp.html'))) fs.unlinkSync(path.join(__dirname, 'test_gold_temp.html'));
  if (fs.existsSync(path.join(__dirname, 'test_gold_temp.png'))) fs.unlinkSync(path.join(__dirname, 'test_gold_temp.png'));
}

testAll();
