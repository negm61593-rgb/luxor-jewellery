const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const PNG = require('pngjs').PNG;
const jsQR = require('jsqr');

console.log('====================================================');
console.log(' LUXOR JEWELLERY — Comprehensive Automated Test Suite');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(description, condition, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${description} ${details ? '(' + details + ')' : ''}`);
    failCount++;
  }
}

// 1. CONFIG.JS VALIDATION
console.log('1. Centralized Configuration (config.js)');
const CONFIG = require('./config.js');
assert('Brand name is exactly LUXOR JEWELLERY', CONFIG.businessName === 'LUXOR JEWELLERY');
assert('Arabic brand name is لوكسور للمجوهرات', CONFIG.businessNameAr === 'لوكسور للمجوهرات');
assert('Tagline is present', Boolean(CONFIG.tagline && CONFIG.taglineAr));
assert('Description contains all services', 
  CONFIG.description.includes('gold') && 
  CONFIG.description.includes('diamonds') && 
  CONFIG.description.includes('silver') && 
  CONFIG.description.includes('watch')
);

// 2. PHONE NUMBERS & FORMATS
console.log('\n2. Egyptian Phone Numbers & Links');
assert('Line 1 display number is 01018780830', CONFIG.phone1.display === '01018780830');
assert('Line 1 name is Mahmoud / محمود', CONFIG.phone1.name === 'Mahmoud' && CONFIG.phone1.nameAr === 'محمود');
assert('Line 1 tel link is tel:+201018780830', CONFIG.phone1.telLink === 'tel:+201018780830');
assert('Line 1 WhatsApp link is https://wa.me/201018780830', CONFIG.phone1.whatsappLink === 'https://wa.me/201018780830');

assert('Line 2 display number is 01007485585', CONFIG.phone2.display === '01007485585');
assert('Line 2 name is Hossam / حسام', CONFIG.phone2.name === 'Hossam' && CONFIG.phone2.nameAr === 'حسام');
assert('Line 2 tel link is tel:+201007485585', CONFIG.phone2.telLink === 'tel:+201007485585');
assert('Line 2 WhatsApp link is https://wa.me/201007485585', CONFIG.phone2.whatsappLink === 'https://wa.me/201007485585');

// 3. SOCIAL & COMMUNITY URLS (UNMODIFIED EXACT URLS)
console.log('\n3. Official Social & Community URLs');
assert('Facebook URL matches exact supplied link', 
  CONFIG.social.facebook === 'https://www.facebook.com/oval.jewellery?mibextid=LQQJ4d');
assert('Instagram URL matches active profile link', 
  CONFIG.social.instagram === 'https://www.instagram.com/luxorjewellery.eg/');
assert('WhatsApp Group URL matches exact supplied link', 
  CONFIG.community.whatsappGroup === 'https://chat.whatsapp.com/Kug2FhxW8iFCw8tG0crjMT');
assert('WhatsApp Channel URL matches exact supplied link', 
  CONFIG.community.whatsappChannel === 'https://whatsapp.com/channel/0029VaDlshU2P59jNmXzFy3g');
assert('Telegram Channel URL matches exact supplied link', 
  CONFIG.community.telegram === 'https://t.me/Ovaljewellwery');

// 4. UNVERIFIED PLACEHOLDERS KEPT HIDDEN
console.log('\n4. Unverified Placeholders');
assert('Location section disabled by default', CONFIG.location.enabled === false);
assert('No fake address displayed', CONFIG.location.address === '');
assert('Business hours disabled by default', CONFIG.businessHours.enabled === false);
assert('Email disabled by default', CONFIG.email.enabled === false);

// 5. VCARD VERIFICATION
console.log('\n5. vCard File Verification (contact.vcf)');
assert('contact.vcf file exists', fs.existsSync('contact.vcf'));
const vcfContent = fs.readFileSync('contact.vcf', 'utf8');
assert('vCard contains FN:LUXOR JEWELLERY', vcfContent.includes('FN:LUXOR JEWELLERY'));
assert('vCard contains ORG:LUXOR JEWELLERY', vcfContent.includes('ORG:LUXOR JEWELLERY'));
assert('vCard contains TEL Line 1 +201018780830', vcfContent.includes('+201018780830'));
assert('vCard contains TEL Line 2 +201007485585', vcfContent.includes('+201007485585'));
assert('vCard has CRLF line endings', vcfContent.includes('\r\n'));

// 6. QR CODE GENERATION & DECODING
console.log('\n6. QR Code Generation & Scanning Validation');
execSync('node generate-qr.js', { stdio: 'pipe' });
assert('SVG QR code generated', fs.existsSync('qr-codes/LUXOR_JEWELLERY_QR.svg'));
assert('PNG QR code generated', fs.existsSync('qr-codes/LUXOR_JEWELLERY_QR.png'));
assert('Small PNG QR code generated', fs.existsSync('qr-codes/LUXOR_JEWELLERY_QR_small.png'));

// Test scanning the PNG
const pngData = fs.readFileSync('qr-codes/LUXOR_JEWELLERY_QR.png');
const png = PNG.sync.read(pngData);
const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
assert('Camera scanner decodes PNG QR code', decoded !== null);
assert('Decoded URL matches CONFIG.publicUrl', decoded ? decoded.data === CONFIG.publicUrl : false);

// 7. HTML & ASSET CHECKS
console.log('\n7. HTML & Web Assets');
assert('index.html exists', fs.existsSync('index.html'));
assert('styles.css exists', fs.existsSync('styles.css'));
assert('app.js exists', fs.existsSync('app.js'));
assert('favicon.svg exists', fs.existsSync('favicon.svg'));

const html = fs.readFileSync('index.html', 'utf8');
assert('HTML links styles.css', html.includes('href="styles.css"'));
assert('HTML links config.js and app.js', html.includes('src="config.js"') && html.includes('src="app.js"'));
assert('HTML links favicon.svg', html.includes('href="favicon.svg"'));
assert('HTML contains meta viewport', html.includes('viewport'));
assert('HTML contains Open Graph meta tags', html.includes('og:title') && html.includes('og:description'));
assert('manifest.webmanifest exists', fs.existsSync('manifest.webmanifest'));
const manifestJson = JSON.parse(fs.readFileSync('manifest.webmanifest', 'utf8'));
assert('Manifest has valid name and short_name', manifestJson.name.includes('LUXOR JEWELLERY') && manifestJson.short_name === 'LUXOR');
assert('Manifest has standalone display and theme color', manifestJson.display === 'standalone' && (manifestJson.theme_color === '#B3873D' || manifestJson.theme_color === '#82611F' || manifestJson.theme_color === '#0E0C08' || manifestJson.theme_color === '#8A6F1E'));
assert('Manifest defines icons for 192 and 512', manifestJson.icons.length >= 2);

assert('Service Worker (sw.js) exists', fs.existsSync('sw.js'));
const swContent = fs.readFileSync('sw.js', 'utf8');
assert('Service Worker handles install and fetch events', swContent.includes("addEventListener('install'") && swContent.includes("addEventListener('fetch'"));

assert('PWA Icon 192x192 exists', fs.existsSync('icon-192.png') && fs.statSync('icon-192.png').size > 5000);
assert('PWA Icon 512x512 exists', fs.existsSync('icon-512.png') && fs.statSync('icon-512.png').size > 10000);
assert('PWA Maskable Icon exists', fs.existsSync('icon-maskable-512.png') && fs.statSync('icon-maskable-512.png').size > 10000);

assert('HTML links manifest.webmanifest', html.includes('href="manifest.webmanifest"'));
assert('Business hours badge removed from HTML', !html.includes('id="hoursBadge"'));
assert('Business hours modal removed from HTML', !html.includes('id="hoursModal"'));
assert('On-screen install clutter removed (pure native browser PWA prompt)', !html.includes('id="pwaInstallTopBtn"') && !html.includes('id="pwaInstallBar"'));
assert('Save Contact anchor removed from HTML', !html.includes('id="saveContactBtn"'));

// 8. BROWSER HEADLESS RENDERING CHECKS (DOM Dump)
console.log('\n8. Headless Browser Render Validation');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const dumpedDom = execSync(`"${edgePath}" --headless=new --window-size=500,800 --dump-dom "file:///${__dirname.replace(/\\/g, '/')}/index.html"`, { encoding: 'utf8' });

assert('Rendered DOM contains Brand Title LUXOR', dumpedDom.includes('id="headerTitle">LUXOR</h1>'));
assert('Rendered DOM contains Subtitle JEWELLERY', dumpedDom.includes('id="headerSubtitle">JEWELLERY</p>'));
assert('Rendered DOM contains Line 1 (01018780830)', dumpedDom.includes('01018780830'));
assert('Rendered DOM contains Mahmoud for Line 1', dumpedDom.includes('Mahmoud'));
assert('Rendered DOM contains Line 2 (01007485585)', dumpedDom.includes('01007485585'));
assert('Rendered DOM contains Hossam for Line 2', dumpedDom.includes('Hossam'));
assert('Rendered DOM contains Buying & Selling Gold', dumpedDom.includes('Buying &amp; Selling Gold') || dumpedDom.includes('Buying & Selling Gold'));
assert('Rendered DOM contains Buying & Selling Diamonds', dumpedDom.includes('Diamonds'));
assert('Rendered DOM contains Buying & Selling Silver', dumpedDom.includes('Silver'));
assert('Rendered DOM contains Watch Evaluation & Purchasing', dumpedDom.includes('Watch'));
assert('Rendered DOM contains Facebook link', dumpedDom.includes('https://www.facebook.com/oval.jewellery?mibextid=LQQJ4d'));
assert('Rendered DOM contains Instagram link', dumpedDom.includes('https://www.instagram.com/luxorjewellery.eg/'));
assert('Rendered DOM contains WhatsApp Group link', dumpedDom.includes('https://chat.whatsapp.com/Kug2FhxW8iFCw8tG0crjMT'));
assert('Rendered DOM contains WhatsApp Channel link', dumpedDom.includes('https://whatsapp.com/channel/0029VaDlshU2P59jNmXzFy3g'));
assert('Rendered DOM contains Telegram link', dumpedDom.includes('https://t.me/Ovaljewellwery'));
assert('Rendered DOM contains Group badge', dumpedDom.includes('community-badge--group'));
assert('Rendered DOM contains Channel badge', dumpedDom.includes('community-badge--channel'));
assert('Rendered DOM is free of hours badge', !dumpedDom.includes('id="hoursBadge"'));
assert('Rendered DOM is free of on-screen install clutter', !dumpedDom.includes('id="pwaInstallBar"'));

// 9. ARABIC LOCALIZATION RENDER CHECK
console.log('\n9. Arabic Localization & RTL Render Validation');
const arabicDom = execSync(`"${edgePath}" --headless=new --window-size=500,800 --dump-dom "file:///${__dirname.replace(/\\/g, '/')}/index.html?lang=ar"`, { encoding: 'utf8' });

assert('Arabic page sets dir="rtl"', arabicDom.includes('dir="rtl"'));
assert('Arabic page sets lang="ar"', arabicDom.includes('lang="ar"'));
assert('Arabic brand name rendered in header', arabicDom.includes('لوكسور للمجوهرات'));
assert('Arabic About title rendered', arabicDom.includes('عن المحل'));
assert('Arabic Gold service rendered', arabicDom.includes('بيع وشراء الذهب'));
assert('Arabic Call button rendered', arabicDom.includes('اتصال'));
assert('Arabic WhatsApp button rendered', arabicDom.includes('واتساب'));
assert('Arabic DOM contains Mahmoud (محمود)', arabicDom.includes('محمود'));
assert('Arabic DOM contains Hossam (حسام)', arabicDom.includes('حسام'));
assert('Save Contact button removed from Arabic DOM', !arabicDom.includes('حفظ جهة الاتصال على الهاتف'));

// 10. LIVE GOLD PRICES VALIDATION
console.log('\n10. Live Gold Prices Validation');
assert('gold-prices.json exists', fs.existsSync('gold-prices.json'));
const goldJson = JSON.parse(fs.readFileSync('gold-prices.json', 'utf8'));
assert('gold-prices.json has success=true', goldJson.success === true);
assert('gold-prices.json contains at least 8 items', Array.isArray(goldJson.items) && goldJson.items.length >= 8);
assert('gold-prices.json contains 21k caliber with buy/sell', goldJson.items.some(i => i.id === '21k' && i.buy > 1000 && i.sell > 1000));
assert('gold-prices.json contains 24k caliber', goldJson.items.some(i => i.id === '24k'));
assert('gold-prices.json contains 18k caliber', goldJson.items.some(i => i.id === '18k'));
assert('gold-prices.json contains gold pound (pound)', goldJson.items.some(i => i.id === 'pound'));
assert('HTML contains gold trigger link-card', html.includes('id="goldRatesTriggerBtn"') && html.includes('link-card--gold'));
assert('HTML contains dedicated gold modal', html.includes('id="goldModal"') && html.includes('modal-box--gold'));
assert('HTML contains gold refresh button', html.includes('id="goldRefreshBtn"'));
assert('Rendered English DOM contains Live Gold Rates trigger', dumpedDom.includes('Live Gold Rates'));
assert('Rendered Arabic DOM contains Live Gold Rates trigger (أسعار الذهب لحظة بلحظة)', arabicDom.includes('أسعار الذهب لحظة بلحظة'));
assert('Rendered Arabic DOM contains 21K Caliber in modal (عيار 21)', arabicDom.includes('عيار 21'));

console.log('\n====================================================');
console.log(` RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================\n');

if (failCount > 0) {
  process.exit(1);
}
