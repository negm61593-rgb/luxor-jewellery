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

for (const modSize of [0.90, 0.94, 0.98, 1.0]) {
  for (const rx of [0, 0.15, 0.22]) {
    for (const sr of ['geometricPrecision', 'crispEdges']) {
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
      const offset = (1 - modSize) / 2;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (qr.modules.get(r, c)) {
            if ((r <= 7 && c <= 7) || (r <= 7 && c >= size - 8) || (r >= size - 8 && c <= 7)) continue;
            if (r >= minR && r <= maxR && c >= minC && c <= maxC) continue;
            const x = c + margin;
            const y = r + margin;
            bodySvg += `<rect x="${x + offset}" y="${y + offset}" width="${modSize}" height="${modSize}" rx="${rx}" fill="#141310" />\n`;
          }
        }
      }

      function drawFinderEye(cx, cy) {
        return `
        <g class="finder-eye">
          <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="1.8" fill="#141310" stroke="url(#goldGrad)" stroke-width="0.32" />
          <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.2" fill="#FFFFFF" />
          <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.8" fill="#141310" stroke="url(#goldGrad)" stroke-width="0.18" />
        </g>`;
      }

      const eye1 = drawFinderEye(margin + 3.5, margin + 3.5);
      const eye2 = drawFinderEye(margin + size - 3.5, margin + 3.5);
      const eye3 = drawFinderEye(margin + 3.5, margin + size - 3.5);

      const logoW = cutW * 0.95;
      const logoH = cutH * 0.95;
      const logoX = centerModule - logoW / 2;
      const logoY = centerModule - logoH / 2;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="100%" height="100%" shape-rendering="${sr}">
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

      const tmpHtml = path.join(__dirname, 'test_tune.html');
      const tmpPng = path.join(__dirname, 'test_tune.png');
      fs.writeFileSync(tmpHtml, `<!DOCTYPE html><html><body style="margin:0;width:1200px;height:1200px;background:#fff;overflow:hidden;">${svg}</body></html>`);
      execSync(`"${edgePath}" --headless=new --window-size=1200,1200 --screenshot="${tmpPng}" "file:///${tmpHtml.replace(/\\/g, '/')}"`, { stdio: 'pipe' });

      const png = PNG.sync.read(fs.readFileSync(tmpPng));
      const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
      if (decoded && decoded.data === targetUrl) {
        console.log(`✅ MATCH! modSize=${modSize}, rx=${rx}, sr=${sr} -> DECODED 100%!`);
      }
      if (fs.existsSync(tmpHtml)) fs.unlinkSync(tmpHtml);
      if (fs.existsSync(tmpPng)) fs.unlinkSync(tmpPng);
    }
  }
}
