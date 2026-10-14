const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { execSync } = require('child_process');
const PNG = require('pngjs').PNG;
const jsQR = require('jsqr');

const targetUrl = 'https://luxor-jewellery.vercel.app';
const outputDir = path.join(__dirname, 'qr-codes');

// Function to check if a module is part of the 3 Finder Patterns (7x7 corners)
function isFinderPattern(r, c, size) {
  // Top-left finder (0..6, 0..6) + 1 module border
  if (r <= 7 && c <= 7) return true;
  // Top-right finder (0..6, size-8..size-1)
  if (r <= 7 && c >= size - 8) return true;
  // Bottom-left finder (size-8..size-1, 0..7)
  if (r >= size - 8 && c <= 7) return true;
  return false;
}

// Function to check if module is inside center logo area
function isCenterLogoArea(r, c, size, logoRadiusInModules) {
  const center = (size - 1) / 2;
  const dist = Math.sqrt((r - center) ** 2 + (c - center) ** 2);
  return dist <= logoRadiusInModules;
}

function buildLuxurySvg(targetUrl, avatarDataUri, style = 'royal-gold') {
  const qr = QRCode.create(targetUrl, { errorCorrectionLevel: 'H' });
  const size = qr.modules.size; // 33
  const margin = 3;
  const totalSize = size + margin * 2; // 39

  const centerModule = totalSize / 2;
  // Center logo radius in module units (approx 4.4 modules out of 33 ≈ 26% width)
  const logoRadius = 4.3;

  let bodyModulesSvg = '';

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (qr.modules.get(r, c)) {
        // Skip finder patterns (we draw custom luxury eyes)
        if (isFinderPattern(r, c, size)) continue;

        // Skip modules under the center logo badge
        const centerDist = Math.sqrt((r - (size - 1) / 2) ** 2 + (c - (size - 1) / 2) ** 2);
        if (centerDist < logoRadius + 0.3) continue;

        const x = c + margin;
        const y = r + margin;

        if (style === 'royal-dots') {
          // Circular dots style
          bodyModulesSvg += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.42" fill="url(#dotGrad)" />\n`;
        } else if (style === 'royal-diamonds') {
          // Subtle faceted squircle style
          bodyModulesSvg += `<rect x="${x + 0.08}" y="${y + 0.08}" width="0.84" height="0.84" rx="0.28" fill="url(#dotGrad)" />\n`;
        } else {
          // Premium luxury rounded squircle
          bodyModulesSvg += `<rect x="${x + 0.05}" y="${y + 0.05}" width="0.9" height="0.9" rx="0.32" fill="url(#dotGrad)" />\n`;
        }
      }
    }
  }

  // Helper for drawing custom luxury finder eyes
  function drawFinderEye(cx, cy) {
    // cx, cy is the center of the 7x7 pattern
    return `
    <g class="finder-eye">
      <!-- Outer rounded squircle frame (7x7 modules) -->
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="2" fill="none" stroke="url(#goldGrad)" stroke-width="1.05" />
      <!-- Subtle inner white gap (5x5 modules) -->
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="1.3" fill="#FFFFFF" />
      <!-- Inner luxury eye pupil (3x3 modules) -->
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="1" fill="url(#pupilGrad)" />
      <!-- Small jewel glint in pupil -->
      <circle cx="${cx - 0.5}" cy="${cy - 0.5}" r="0.3" fill="#FFFFFF" opacity="0.6" />
    </g>`;
  }

  const eyeTopLeft = drawFinderEye(margin + 3.5, margin + 3.5);
  const eyeTopRight = drawFinderEye(margin + size - 3.5, margin + 3.5);
  const eyeBottomLeft = drawFinderEye(margin + 3.5, margin + size - 3.5);

  const imgSize = logoRadius * 1.6;
  const imgOffset = centerModule - (imgSize / 2);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="1200" height="1200" shape-rendering="geometricPrecision">
  <defs>
    <!-- Rich Metallic Gold Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C5A059" />
      <stop offset="25%" stop-color="#F3DC9B" />
      <stop offset="50%" stop-color="#C5A059" />
      <stop offset="75%" stop-color="#E5C275" />
      <stop offset="100%" stop-color="#8E6A26" />
    </linearGradient>

    <!-- Pupil Gradient -->
    <linearGradient id="pupilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A1815" />
      <stop offset="50%" stop-color="#2D2922" />
      <stop offset="100%" stop-color="#0F0E0D" />
    </linearGradient>

    <!-- Dot / Module Color: Obsidian with soft warmth -->
    <linearGradient id="dotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141311" />
      <stop offset="100%" stop-color="#22201C" />
    </linearGradient>

    <!-- Soft Drop Shadow for Badge -->
    <filter id="badgeGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0.12" stdDeviation="0.25" flood-color="#000000" flood-opacity="0.35" />
    </filter>

    <clipPath id="logoCircleClip">
      <circle cx="${centerModule}" cy="${centerModule}" r="${logoRadius - 0.28}" />
    </clipPath>
  </defs>

  <!-- Clean crisp background -->
  <rect width="${totalSize}" height="${totalSize}" rx="2" fill="#FFFFFF" />

  <!-- QR Modules -->
  ${bodyModulesSvg}

  <!-- 3 Custom Luxury Finder Eyes -->
  ${eyeTopLeft}
  ${eyeTopRight}
  ${eyeBottomLeft}

  <!-- Center Logo Badge -->
  <g id="centerBadge" filter="url(#badgeGlow)">
    <!-- Outer metallic gold rim -->
    <circle cx="${centerModule}" cy="${centerModule}" r="${logoRadius}" fill="#FFFFFF" stroke="url(#goldGrad)" stroke-width="0.35" />
    <!-- Secondary inner decorative ring -->
    <circle cx="${centerModule}" cy="${centerModule}" r="${logoRadius - 0.25}" fill="#FFFFFF" stroke="#EED596" stroke-width="0.08" />
    <!-- Logo Image -->
    <image href="${avatarDataUri}" x="${imgOffset}" y="${imgOffset}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid meet" clip-path="url(#logoCircleClip)" />
  </g>
</svg>`;

  return svg;
}

async function run() {
  const avatarPath = path.join(__dirname, 'avatar.jpg');
  const avatarBase64 = fs.readFileSync(avatarPath).toString('base64');
  const avatarDataUri = 'data:image/jpeg;base64,' + avatarBase64;

  const styles = [
    { id: 'royal-rounded', name: 'Royal Rounded (الأفخم والأكثر توازناً)' },
    { id: 'royal-dots', name: 'Royal Dots (النقاط العصرية الفاخرة)' },
    { id: 'royal-diamonds', name: 'Royal Diamonds (قصات الألماس الفاخرة)' }
  ];

  for (const s of styles) {
    console.log(`Generating style: ${s.name}...`);
    const svgContent = buildLuxurySvg(targetUrl, avatarDataUri, s.id);
    const svgPath = path.join(outputDir, `LUXOR_QR_${s.id}.svg`);
    fs.writeFileSync(svgPath, svgContent, 'utf8');

    // Create wrapper HTML
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>body{margin:0;display:flex;align-items:center;justify-content:center;width:1200px;height:1200px;background:#fff;}svg{width:1200px;height:1200px;}</style>
    </head><body>${svgContent}</body></html>`;
    const htmlPath = path.join(outputDir, `render_${s.id}.html`);
    fs.writeFileSync(htmlPath, html, 'utf8');

    // Render PNG with Edge
    const tempPng = `C:\\Users\\AdminOS\\AppData\\Local\\Temp\\qr_${s.id}.png`;
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    execSync(`cmd.exe /c ""${edgePath}" --headless=new --window-size=1200,1200 --screenshot="${tempPng}" "file:///${htmlPath.replace(/\\/g, '/')}"`, { stdio: 'pipe' });

    const pngPath = path.join(outputDir, `LUXOR_QR_${s.id}.png`);
    fs.copyFileSync(tempPng, pngPath);

    // Verify scan
    const pngData = fs.readFileSync(pngPath);
    const png = PNG.sync.read(pngData);
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    console.log(`  Decoded result: ${decoded ? '✅ ' + decoded.data : '❌ FAILED'}`);
  }
}

run();
