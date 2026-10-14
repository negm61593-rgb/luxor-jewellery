#!/usr/bin/env node
// ============================================================
// LUXOR JEWELLERY — Premium Luxury QR Code & Store Stand Generator
// ============================================================
// Generates:
//   1. Bespoke Luxury SVG QR Codes:
//      - Gold Squares Edition (الثلاث مربعات مربعة ذهبية مثل الاسم)
//   2. High-resolution print-ready PNGs (1200x1200px, 300dpi)
//   3. Web/Digital PNG (400x400px)
//   4. Luxury in-store acrylic stand templates (Dark & Light editions)
//      - Zero Arabic text (English luxury typography)
//      - Authentic social media icons under QR (Facebook, Instagram, WhatsApp, Telegram, TikTok)
//      - Phone cards for Mahmoud & Hossam
//   5. Automated scanner verification via jsQR (Level H)
// ============================================================

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const PNG = require('pngjs').PNG;
const jsQR = require('jsqr');

// Load centralized config
const CONFIG = require('./config.js');

// Determine URL to encode
const targetUrl = process.argv[2] || CONFIG.publicUrl || 'https://luxorjewellery.eg';

const outputDir = path.join(__dirname, 'qr-codes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

// Load transparent logo
const logoTransparentPath = path.join(__dirname, 'logo_transparent.png');
let logoDataUri = '';
if (fs.existsSync(logoTransparentPath)) {
  const logoBase64 = fs.readFileSync(logoTransparentPath).toString('base64');
  logoDataUri = 'data:image/png;base64,' + logoBase64;
}

const avatarPath = path.join(__dirname, 'avatar.jpg');
let avatarDataUri = '';
if (fs.existsSync(avatarPath)) {
  const avatarBase64 = fs.readFileSync(avatarPath).toString('base64');
  avatarDataUri = 'data:image/jpeg;base64,' + avatarBase64;
}

// Generate QR Code with Gold Squares (الثلاث مربعات مربعة ذهبية مثل الاسم)
function generateGoldSquaresQrSvg() {
  const qr = QRCode.create(targetUrl, { errorCorrectionLevel: 'H' });
  const size = qr.modules.size; // 33 modules
  const margin = 4;
  const totalSize = size + margin * 2; // 41 modules
  const centerModule = totalSize / 2; // 20.5

  const cutW = 8;
  const cutH = 4;
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

  // Draw custom luxury squircle finder eyes with pure gold squircle (no black lines, 100% scannable)
  function drawFinderEye(cx, cy) {
    const rx = 1.8;
    return `
    <g class="finder-eye">
      <!-- Pure Luxury Metallic Gold Squircle Frame (solid fill, 7x7 modules) -->
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="${rx}" fill="url(#warmGoldGrad)" />
      <!-- High contrast inner white gap (5x5 modules) -->
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="${rx * 0.65}" fill="#FFFFFF" />
      <!-- Solid dark obsidian pupil (3x3 modules) -->
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="${rx * 0.45}" fill="#141310" />
    </g>`;
  }

  const eye1 = drawFinderEye(margin + 3.5, margin + 3.5);
  const eye2 = drawFinderEye(margin + size - 3.5, margin + 3.5);
  const eye3 = drawFinderEye(margin + 3.5, margin + size - 3.5);

  const logoW = cutW * 0.95;
  const logoH = cutH * 0.95;
  const logoX = centerModule - logoW / 2;
  const logoY = centerModule - logoH / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="100%" height="100%" shape-rendering="geometricPrecision">
  <defs>
    <!-- Rich Warm Metallic Gold Gradient: 100% camera readable + pure golden aesthetic -->
    <linearGradient id="warmGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#543C08" />
      <stop offset="30%" stop-color="#BF9528" />
      <stop offset="70%" stop-color="#8A6313" />
      <stop offset="100%" stop-color="#3D2B05" />
    </linearGradient>
  </defs>
  <rect width="${totalSize}" height="${totalSize}" fill="#FFFFFF" />
  ${bodySvg}
  ${eye1}
  ${eye2}
  ${eye3}
  <rect x="${logoX - 0.2}" y="${logoY - 0.2}" width="${logoW + 0.4}" height="${logoH + 0.4}" rx="0.8" fill="#FFFFFF" />
  <image href="${logoDataUri || avatarDataUri}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" preserveAspectRatio="xMidYMid meet" />
</svg>`;
}

// Generate Classic Black Eyes version
function generateClassicQrSvg() {
  const qr = QRCode.create(targetUrl, { errorCorrectionLevel: 'H' });
  const size = qr.modules.size;
  const margin = 4;
  const totalSize = size + margin * 2;
  const centerModule = totalSize / 2;

  const cutW = 8;
  const cutH = 4;
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
        bodySvg += `<rect x="${x}" y="${y}" width="1" height="1" fill="#141310" />\n`;
      }
    }
  }

  function drawDarkEye(cx, cy) {
    return `
    <g class="finder-eye">
      <rect x="${cx - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="0.5" fill="#141310" />
      <rect x="${cx - 2.5}" y="${cy - 2.5}" width="5" height="5" rx="0.3" fill="#FFFFFF" />
      <rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.2" fill="#141310" />
    </g>`;
  }

  const eye1 = drawDarkEye(margin + 3.5, margin + 3.5);
  const eye2 = drawDarkEye(margin + size - 3.5, margin + 3.5);
  const eye3 = drawDarkEye(margin + 3.5, margin + size - 3.5);

  const logoW = 7.6;
  const logoH = 3.8;
  const logoX = centerModule - logoW / 2;
  const logoY = centerModule - logoH / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="100%" height="100%" shape-rendering="crispEdges">
  <rect width="${totalSize}" height="${totalSize}" fill="#FFFFFF" />
  ${bodySvg}
  ${eye1}
  ${eye2}
  ${eye3}
  <image href="${logoDataUri || avatarDataUri}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" preserveAspectRatio="xMidYMid meet" />
</svg>`;
}

async function generateAll() {
  console.log('====================================================');
  console.log(' LUXOR JEWELLERY — Luxury QR & Store Stand Generator');
  console.log('====================================================');
  console.log('Target URL:', targetUrl);
  console.log('');

  // 1. Generate SVGs
  const goldSquaresSvg = generateGoldSquaresQrSvg();
  const classicSvg = generateClassicQrSvg();

  fs.writeFileSync(path.join(outputDir, 'LUXOR_JEWELLERY_QR_GoldSquares.svg'), goldSquaresSvg, 'utf8');
  fs.writeFileSync(path.join(outputDir, 'LUXOR_JEWELLERY_QR_NoCircle.svg'), classicSvg, 'utf8');
  fs.writeFileSync(path.join(outputDir, 'LUXOR_JEWELLERY_QR_with_logo.svg'), goldSquaresSvg, 'utf8');
  fs.writeFileSync(path.join(outputDir, 'LUXOR_JEWELLERY_QR.svg'), classicSvg, 'utf8');
  console.log('✅ SVGs saved successfully');

  // 2. Render High-Resolution PNG 1200x1200px for Gold Squares (Exact Image 1 luxury gradient)
  const renderGoldHtml = `<!DOCTYPE html><html><body style="margin:0;width:1200px;height:1200px;background:#fff;overflow:hidden;">${goldSquaresSvg}</body></html>`;
  const renderGoldHtmlPath = path.join(outputDir, 'render_gold_temp.html');
  fs.writeFileSync(renderGoldHtmlPath, renderGoldHtml, 'utf8');

  const tempGoldPng = 'C:\\Users\\AdminOS\\AppData\\Local\\Temp\\luxor_qr_gold_hires.png';
  const renderGoldUrl = `file:///${renderGoldHtmlPath.replace(/\\/g, '/')}`;

  // Render Classic PNG for universal 100% scan decode verification
  const renderClassicHtml = `<!DOCTYPE html><html><body style="margin:0;width:1200px;height:1200px;background:#fff;overflow:hidden;">${classicSvg}</body></html>`;
  const renderClassicHtmlPath = path.join(outputDir, 'render_classic_temp.html');
  fs.writeFileSync(renderClassicHtmlPath, renderClassicHtml, 'utf8');

  const tempClassicPng = 'C:\\Users\\AdminOS\\AppData\\Local\\Temp\\luxor_qr_classic_hires.png';
  const renderClassicUrl = `file:///${renderClassicHtmlPath.replace(/\\/g, '/')}`;

  try {
    execSync(`cmd.exe /c ""${edgePath}" --headless=new --window-size=1200,1200 --screenshot="${tempGoldPng}" "${renderGoldUrl}""`, { stdio: 'pipe' });
    execSync(`cmd.exe /c ""${edgePath}" --headless=new --window-size=1200,1200 --screenshot="${tempClassicPng}" "${renderClassicUrl}""`, { stdio: 'pipe' });

    fs.copyFileSync(tempGoldPng, path.join(outputDir, 'LUXOR_JEWELLERY_QR_GoldSquares.png'));
    fs.copyFileSync(tempGoldPng, path.join(outputDir, 'LUXOR_JEWELLERY_QR_with_logo.png'));
    fs.copyFileSync(tempClassicPng, path.join(outputDir, 'LUXOR_JEWELLERY_QR.png'));
    console.log('✅ High-Res Gold Squares PNG & Classic PNG (1200x1200px) saved');

    // Small PNG (400x400)
    const tempSmallPng = 'C:\\Users\\AdminOS\\AppData\\Local\\Temp\\luxor_qr_gold_small.png';
    execSync(`cmd.exe /c ""${edgePath}" --headless=new --window-size=400,400 --screenshot="${tempSmallPng}" "${renderClassicUrl}""`, { stdio: 'pipe' });
    fs.copyFileSync(tempSmallPng, path.join(outputDir, 'LUXOR_JEWELLERY_QR_small.png'));
    console.log('✅ Small PNG (400x400px) saved');

    // Scan verification on LUXOR_JEWELLERY_QR.png & LUXOR_JEWELLERY_QR_GoldSquares.png
    const pngClassicData = fs.readFileSync(path.join(outputDir, 'LUXOR_JEWELLERY_QR.png'));
    const pngClassic = PNG.sync.read(pngClassicData);
    const decodedClassic = jsQR(new Uint8ClampedArray(pngClassic.data), pngClassic.width, pngClassic.height);
    if (decodedClassic && decodedClassic.data === targetUrl) {
      console.log('🎉 UNIVERSAL SCAN VERIFICATION (Classic): Decoded 100% -> ' + decodedClassic.data);
    } else {
      console.warn('⚠️ Warning: Classic jsQR scan check failed');
    }

    const pngGoldData = fs.readFileSync(path.join(outputDir, 'LUXOR_JEWELLERY_QR_GoldSquares.png'));
    const pngGold = PNG.sync.read(pngGoldData);
    const decodedGold = jsQR(new Uint8ClampedArray(pngGold.data), pngGold.width, pngGold.height);
    if (decodedGold && decodedGold.data === targetUrl) {
      console.log('🎉 LUXURY GOLD SCAN VERIFICATION: Decoded 100% -> ' + decodedGold.data);
    } else {
      console.warn('⚠️ Warning: Gold Squares jsQR scan check failed');
    }
  } catch (e) {
    console.error('Error rendering PNG:', e.message);
  } finally {
    if (fs.existsSync(renderGoldHtmlPath)) fs.unlinkSync(renderGoldHtmlPath);
    if (fs.existsSync(renderClassicHtmlPath)) fs.unlinkSync(renderClassicHtmlPath);
  }

  // 3. Generate Stand Cards with Social Media Icons and English Only
  buildStoreStandCards(goldSquaresSvg);
}

function buildStoreStandCards(qrSvg) {
  console.log('\n🖨️ Building In-Store Counter Stand Designs (Social Media Focus)...');

  // SVG Social Media Icons (High quality vector)
  const iconFacebook = `
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
    <circle cx="22" cy="22" r="22" fill="#1877F2"/>
    <path d="M25.8 22.8h-3.3v11.2h-4.6V22.8h-2.2v-3.9h2.2v-2.5c0-3.1 1.8-4.8 4.7-4.8 1.4 0 2.8.2 2.8.2v3.1h-1.6c-1.5 0-2 .9-2 1.9v2.1h3.5l-.5 3.9z" fill="#FFFFFF"/>
  </svg>`;

  const iconInstagram = `
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
    <defs>
      <radialGradient id="igR" cx="30%" cy="105%" r="120%">
        <stop offset="0%" stop-color="#fdf497"/>
        <stop offset="10%" stop-color="#fdf497"/>
        <stop offset="50%" stop-color="#fd5949"/>
        <stop offset="70%" stop-color="#d6249f"/>
        <stop offset="100%" stop-color="#285AEB"/>
      </radialGradient>
    </defs>
    <rect width="44" height="44" rx="12" fill="url(#igR)"/>
    <rect x="9.5" y="9.5" width="25" height="25" rx="7.5" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
    <circle cx="22" cy="22" r="6.2" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
    <circle cx="28.8" cy="15.2" r="1.5" fill="#FFFFFF"/>
  </svg>`;

  const iconWhatsApp = `
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
    <circle cx="22" cy="22" r="22" fill="#25D366"/>
    <path d="M22 10c-6.6 0-12 5.4-12 12 0 2.2.6 4.3 1.7 6.1L10.2 34l6.1-1.6c1.8 1 3.8 1.6 5.7 1.6 6.6 0 12-5.4 12-12s-5.4-12-12-12zm6.1 17c-.3.7-1.5 1.4-2.1 1.5-.6.1-1.3.2-3.8-.8-3.1-1.3-5.1-4.5-5.3-4.7-.1-.2-1.3-1.8-1.3-3.4 0-1.6.8-2.4 1.1-2.8.3-.3.7-.4 1-.4.2 0 .5 0 .7.01.2 0 .5-.1.8.6.3.7 1 2.5 1.1 2.7.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.4-.6.6-.2.2-.4.4-.2.8.2.4.9 1.6 2 2.6 1.4 1.2 2.6 1.6 3 1.8.4.2.6.1.8-.1.2-.3.9-1.1 1.2-1.4.3-.4.5-.3.8-.2.4.1 2.3 1.1 2.7 1.3.4.2.6.3.7.5.1.2.1 1.2-.2 1.9z" fill="#FFFFFF"/>
  </svg>`;

  const iconTelegram = `
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
    <circle cx="22" cy="22" r="22" fill="#229ED9"/>
    <path d="M11.5 21.6l18.5-7.6c.9-.3 1.6.2 1.3 1.6l-3.1 14.8c-.2 1.1-.9 1.3-1.7.9l-4.8-3.5-2.3 2.2c-.3.3-.5.5-.9.5l.3-4.9 8.9-8.1c.4-.3-.1-.5-.6-.2l-11 6.9-4.8-1.5c-1-.3-1-1.1.2-1.5z" fill="#FFFFFF"/>
  </svg>`;

  const iconTikTok = `
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
    <rect width="44" height="44" rx="12" fill="#010101"/>
    <path d="M28.4 17.5c-1.8-.2-3.3-1.3-3.8-2.9v10.1c0 4-3.2 7.3-7.3 7.3s-7.3-3.2-7.3-7.3 3.2-7.3 7.3-7.3c.6 0 1.2.1 1.7.2v3.7c-.5-.2-1.1-.3-1.7-.3-2 0-3.6 1.6-3.6 3.6s1.6 3.6 3.6 3.6 3.6-1.6 3.6-3.6V11h3.7c.4 2.4 2.1 4.3 4.5 4.8v1.7z" fill="#FFFFFF"/>
    <path d="M28.4 17.5c-1.8-.2-3.3-1.3-3.8-2.9v10.1c0 4-3.2 7.3-7.3 7.3" fill="none" stroke="#25F4EE" stroke-width="1.3"/>
    <path d="M24.6 24.7c0 4-3.2 7.3-7.3 7.3s-7.3-3.2-7.3-7.3" fill="none" stroke="#FE2C55" stroke-width="1.3"/>
  </svg>`;

  // Light Stand (Ivory & Gold, English Only, Social Media Focus)
  const lightHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>LUXOR JEWELLERY — In-Store Stand</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Montserrat:wght@500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1000px;
    height: 1450px;
    background: #FFFFFF;
    color: #1A1813;
    font-family: 'Montserrat', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .stand-wrapper {
    width: 930px;
    height: 1380px;
    background: #FFFFFF;
    border: 3px solid #91711E;
    border-radius: 40px;
    padding: 44px 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    position: relative;
    box-shadow: 0 25px 70px rgba(0,0,0,0.08);
  }
  .gold-border-inner {
    position: absolute;
    top: 14px; bottom: 14px; left: 14px; right: 14px;
    border: 1px solid rgba(145,113,30,0.25);
    border-radius: 30px;
    pointer-events: none;
  }
  .corner-knot {
    position: absolute;
    width: 32px; height: 32px;
    border-color: #91711E;
    border-style: solid;
  }
  .c-tl { top: 22px; left: 22px; border-width: 2.5px 0 0 2.5px; border-top-left-radius: 10px; }
  .c-tr { top: 22px; right: 22px; border-width: 2.5px 2.5px 0 0; border-top-right-radius: 10px; }
  .c-bl { bottom: 22px; left: 22px; border-width: 0 0 2.5px 2.5px; border-bottom-left-radius: 10px; }
  .c-br { bottom: 22px; right: 22px; border-width: 0 2.5px 2.5px 0; border-bottom-right-radius: 10px; }

  /* Top Header: Logo + Subtitle ONLY (NO ARABIC) */
  .header { text-align: center; }
  .logo-emblem {
    width: 320px;
    height: 125px;
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 6px 20px rgba(145,113,30,0.28));
  }
  .logo-emblem img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  .services-line {
    font-family: 'Cinzel', serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 3.5px;
    color: #91711E;
    text-transform: uppercase;
  }

  /* Center: Gold Squares QR Code */
  .qr-container {
    background: #FFFFFF;
    padding: 20px;
    border-radius: 28px;
    border: 3px solid #91711E;
    box-shadow: 0 16px 40px rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .qr-container svg { width: 440px; height: 440px; display: block; }

  /* Under QR: Social Media Callout with Authentic Colored Logos */
  .social-connect-block {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .connect-title-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #FAF6ED;
    border: 1.5px solid #91711E;
    border-radius: 30px;
    padding: 8px 30px;
  }
  .connect-title-pill span {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #91711E;
    text-transform: uppercase;
  }
  .social-icons-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    background: #FAF6ED;
    border: 1px solid rgba(145,113,30,0.25);
    border-radius: 26px;
    padding: 10px 24px;
    box-shadow: 0 8px 24px rgba(145,113,30,0.08);
  }
  .icon-badge {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
    filter: drop-shadow(0 3px 6px rgba(0,0,0,0.12));
  }
  .icon-badge svg {
    width: 44px;
    height: 44px;
  }
  .social-hint {
    font-size: 13.5px;
    font-weight: 600;
    color: #666666;
    letter-spacing: 0.8px;
  }

  /* Contact Cards (Mahmoud & Hossam in English) */
  .contact-cards {
    display: flex;
    gap: 20px;
    width: 100%;
    justify-content: center;
  }
  .card-item {
    flex: 1;
    max-width: 390px;
    background: #FAF6ED;
    border: 1.5px solid #91711E;
    border-radius: 18px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  .card-item .c-name {
    font-size: 19px;
    font-weight: 800;
    color: #91711E;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .card-item .c-phone {
    font-size: 21px;
    font-weight: 700;
    color: #111111;
    letter-spacing: 1px;
  }

  /* Footer Row (Address & IG in English) */
  .footer-row {
    width: 100%;
    border-top: 1px solid #E6D8B8;
    padding-top: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13.5px;
    color: #666666;
  }
  .footer-row b { color: #91711E; font-weight: 700; }
</style>
</head>
<body>
<div class="stand-wrapper">
  <div class="gold-border-inner"></div>
  <div class="corner-knot c-tl"></div>
  <div class="corner-knot c-tr"></div>
  <div class="corner-knot c-bl"></div>
  <div class="corner-knot c-br"></div>

  <!-- Header: LUXOR JEWELLERY Emblem + Subtitle (Zero Arabic) -->
  <div class="header">
    <div class="logo-emblem"><img src="${logoDataUri}" alt="LUXOR JEWELLERY"></div>
    <div class="services-line">Gold • Diamonds • Silver • Watches</div>
  </div>

  <!-- QR Code Container -->
  <div class="qr-container">
    ${qrSvg}
  </div>

  <!-- Hero Social Icons Block under QR Code -->
  <div class="social-connect-block">
    <div class="connect-title-pill">
      <span>SCAN TO CONNECT & FOLLOW</span>
    </div>
    <div class="social-icons-row">
      <div class="icon-badge" title="Facebook">${iconFacebook}</div>
      <div class="icon-badge" title="Instagram">${iconInstagram}</div>
      <div class="icon-badge" title="WhatsApp">${iconWhatsApp}</div>
      <div class="icon-badge" title="Telegram">${iconTelegram}</div>
      <div class="icon-badge" title="TikTok">${iconTikTok}</div>
    </div>
    <div class="social-hint">Instant access to our official Facebook, Instagram & community channels</div>
  </div>

  <!-- Contact Cards (English) -->
  <div class="contact-cards">
    <div class="card-item">
      <span class="c-name">Mahmoud</span>
      <span class="c-phone">01018780830</span>
    </div>
    <div class="card-item">
      <span class="c-name">Hossam</span>
      <span class="c-phone">01007485585</span>
    </div>
  </div>

  <!-- Footer Row -->
  <div class="footer-row">
    <div>📍 47 Cleopatra St, Salah El-Din Sq, Heliopolis, Cairo</div>
    <div><b>Instagram:</b> @luxorjewellery.eg</div>
  </div>
</div>
</body>
</html>`;

  // Dark Royal Stand (Obsidian & Gold, English Only, Social Media Focus)
  const darkHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>LUXOR JEWELLERY — In-Store Stand</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Montserrat:wght@500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1000px;
    height: 1450px;
    background: #080807;
    color: #FFFFFF;
    font-family: 'Montserrat', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .stand-wrapper {
    width: 930px;
    height: 1380px;
    background: radial-gradient(circle at 50% 18%, #1A1813 0%, #0E0D0B 60%, #080807 100%);
    border: 2px solid #D4AF37;
    border-radius: 40px;
    padding: 44px 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    position: relative;
    box-shadow: 0 35px 80px rgba(0,0,0,0.9), inset 0 0 120px rgba(212,175,55,0.06);
  }
  .gold-border-inner {
    position: absolute;
    top: 14px; bottom: 14px; left: 14px; right: 14px;
    border: 1px solid rgba(212,175,55,0.35);
    border-radius: 30px;
    pointer-events: none;
  }
  .corner-knot {
    position: absolute;
    width: 32px; height: 32px;
    border-color: #D4AF37;
    border-style: solid;
  }
  .c-tl { top: 22px; left: 22px; border-width: 2.5px 0 0 2.5px; border-top-left-radius: 10px; }
  .c-tr { top: 22px; right: 22px; border-width: 2.5px 2.5px 0 0; border-top-right-radius: 10px; }
  .c-bl { bottom: 22px; left: 22px; border-width: 0 0 2.5px 2.5px; border-bottom-left-radius: 10px; }
  .c-br { bottom: 22px; right: 22px; border-width: 0 2.5px 2.5px 0; border-bottom-right-radius: 10px; }

  /* Top Header: Logo + Subtitle ONLY (NO ARABIC) */
  .header { text-align: center; }
  .logo-emblem {
    width: 320px;
    height: 125px;
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 8px 25px rgba(212,175,55,0.38));
  }
  .logo-emblem img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  .services-line {
    font-family: 'Cinzel', serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 3.5px;
    color: #D4AF37;
    text-transform: uppercase;
  }

  /* Center: Gold Squares QR Code */
  .qr-container {
    background: #FFFFFF;
    padding: 20px;
    border-radius: 28px;
    border: 3px solid #D4AF37;
    box-shadow: 0 20px 50px rgba(0,0,0,0.65), 0 0 40px rgba(212,175,55,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .qr-container svg { width: 440px; height: 440px; display: block; }

  /* Under QR: Social Media Callout with Authentic Colored Logos */
  .social-connect-block {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .connect-title-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(212,175,55,0.12);
    border: 1.5px solid #D4AF37;
    border-radius: 30px;
    padding: 8px 30px;
  }
  .connect-title-pill span {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #F7E8C2;
    text-transform: uppercase;
  }
  .social-icons-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(212,175,55,0.35);
    border-radius: 26px;
    padding: 10px 24px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  }
  .icon-badge {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4));
  }
  .icon-badge svg {
    width: 44px;
    height: 44px;
  }
  .social-hint {
    font-size: 13.5px;
    font-weight: 500;
    color: #B3A488;
    letter-spacing: 0.8px;
  }

  /* Contact Cards (Mahmoud & Hossam in English) */
  .contact-cards {
    display: flex;
    gap: 20px;
    width: 100%;
    justify-content: center;
  }
  .card-item {
    flex: 1;
    max-width: 390px;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(212,175,55,0.45);
    border-radius: 18px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  .card-item .c-name {
    font-size: 19px;
    font-weight: 800;
    color: #D4AF37;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .card-item .c-phone {
    font-size: 21px;
    font-weight: 700;
    color: #FFFFFF;
    letter-spacing: 1px;
  }

  /* Footer Row (Address & IG in English) */
  .footer-row {
    width: 100%;
    border-top: 1px solid rgba(212,175,55,0.22);
    padding-top: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13.5px;
    color: #8C8068;
  }
  .footer-row b { color: #D4AF37; font-weight: 700; }
</style>
</head>
<body>
<div class="stand-wrapper">
  <div class="gold-border-inner"></div>
  <div class="corner-knot c-tl"></div>
  <div class="corner-knot c-tr"></div>
  <div class="corner-knot c-bl"></div>
  <div class="corner-knot c-br"></div>

  <!-- Header: LUXOR JEWELLERY Emblem + Subtitle (Zero Arabic) -->
  <div class="header">
    <div class="logo-emblem"><img src="${logoDataUri}" alt="LUXOR JEWELLERY"></div>
    <div class="services-line">Gold • Diamonds • Silver • Watches</div>
  </div>

  <!-- QR Code Container -->
  <div class="qr-container">
    ${qrSvg}
  </div>

  <!-- Hero Social Icons Block under QR Code -->
  <div class="social-connect-block">
    <div class="connect-title-pill">
      <span>SCAN TO CONNECT & FOLLOW</span>
    </div>
    <div class="social-icons-row">
      <div class="icon-badge" title="Facebook">${iconFacebook}</div>
      <div class="icon-badge" title="Instagram">${iconInstagram}</div>
      <div class="icon-badge" title="WhatsApp">${iconWhatsApp}</div>
      <div class="icon-badge" title="Telegram">${iconTelegram}</div>
      <div class="icon-badge" title="TikTok">${iconTikTok}</div>
    </div>
    <div class="social-hint">Instant access to our official Facebook, Instagram & community channels</div>
  </div>

  <!-- Contact Cards (English) -->
  <div class="contact-cards">
    <div class="card-item">
      <span class="c-name">Mahmoud</span>
      <span class="c-phone">01018780830</span>
    </div>
    <div class="card-item">
      <span class="c-name">Hossam</span>
      <span class="c-phone">01007485585</span>
    </div>
  </div>

  <!-- Footer Row -->
  <div class="footer-row">
    <div>📍 47 Cleopatra St, Salah El-Din Sq, Heliopolis, Cairo</div>
    <div><b>Instagram:</b> @luxorjewellery.eg</div>
  </div>
</div>
</body>
</html>`;

  const darkHtmlPath = path.join(outputDir, 'LUXOR_JEWELLERY_Stand_Dark.html');
  const lightHtmlPath = path.join(outputDir, 'LUXOR_JEWELLERY_Stand_Light.html');
  fs.writeFileSync(darkHtmlPath, darkHtml, 'utf8');
  fs.writeFileSync(lightHtmlPath, lightHtml, 'utf8');

  const tempDark = 'C:\\Users\\AdminOS\\AppData\\Local\\Temp\\stand_dark_social.png';
  const tempLight = 'C:\\Users\\AdminOS\\AppData\\Local\\Temp\\stand_light_social.png';

  try {
    execSync(`cmd.exe /c ""${edgePath}" --headless=new --window-size=1000,1450 --screenshot="${tempDark}" "file:///${darkHtmlPath.replace(/\\/g, '/')}"`, { stdio: 'pipe' });
    fs.copyFileSync(tempDark, path.join(outputDir, 'LUXOR_JEWELLERY_Stand_Dark.png'));

    execSync(`cmd.exe /c ""${edgePath}" --headless=new --window-size=1000,1450 --screenshot="${tempLight}" "file:///${lightHtmlPath.replace(/\\/g, '/')}"`, { stdio: 'pipe' });
    fs.copyFileSync(tempLight, path.join(outputDir, 'LUXOR_JEWELLERY_Stand_Light.png'));
    fs.copyFileSync(tempLight, path.join(__dirname, 'luxury_edition_en.png'));

    // Copy to artifact directory for instant UI display
    const artifactDir = 'C:\\Users\\AdminOS\\.gemini\\antigravity\\brain\\7ffd7db5-1327-493e-965b-57f8de342035';
    if (fs.existsSync(artifactDir)) {
      fs.copyFileSync(tempLight, path.join(artifactDir, 'LUXOR_STAND_OFFICIAL.png'));
      const goldQrSrc = path.join(outputDir, 'LUXOR_JEWELLERY_QR_GoldSquares.png');
      if (fs.existsSync(goldQrSrc)) {
        fs.copyFileSync(goldQrSrc, path.join(artifactDir, 'LUXOR_QR_OFFICIAL.png'));
      }
    }

    console.log('✅ Generated Stand PNGs (Dark & Light) with Social Media Icons');
    console.log('✅ Updated root luxury_edition_en.png & artifacts');

    // Verify stand decodability with jsQR
    const standData = fs.readFileSync(path.join(outputDir, 'LUXOR_JEWELLERY_Stand_Light.png'));
    const standPng = PNG.sync.read(standData);
    const decodedStand = jsQR(new Uint8ClampedArray(standPng.data), standPng.width, standPng.height);
    if (decodedStand && decodedStand.data === targetUrl) {
      console.log('🎉 STAND SCAN VERIFICATION: Decoded 100% -> ' + decodedStand.data);
    } else {
      console.warn('⚠️ Warning: Stand jsQR scan check failed');
    }
  } catch (err) {
    console.error('Error rendering stand PNGs:', err.message);
  }
}

generateAll().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
