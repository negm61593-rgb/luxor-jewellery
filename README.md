# LUXOR JEWELLERY — Premium Digital Business Card

A high-end, responsive digital business card website and print-ready QR code system for **LUXOR JEWELLERY** (لوكسور للمجوهرات). Designed specifically for in-store customer QR scanning, offering instant access to store services, direct telephone calling, WhatsApp messaging, official social media profiles, community channels, and instant vCard contact downloading.

---

## 💎 Project Features

- **Luxury Aesthetic**: Deep charcoal palette (`#0e0e10`), radiant gold accents (`#d4a853`), and warm ivory typography (`#f7f4ee`).
- **Bilingual & RTL Ready**: Seamless one-tap language switch between English and Arabic (العربية) with complete Right-to-Left (RTL) layout support, Noto Kufi Arabic typography, and isolated LTR phone number formatting.
- **Centralized Configuration**: All store information, phone numbers, links, text, and placeholders reside in [`config.js`](file:///C:/Users/AdminOS/Desktop/LUXOR%20JEWELLERY/config.js).
- **Direct Contact**:
  - **Line 1 (01018780830)**: Direct phone call (`tel:+201018780830`) and WhatsApp chat (`https://wa.me/201018780830`).
  - **Line 2 (01007485585)**: Direct phone call (`tel:+201007485585`) and WhatsApp chat (`https://wa.me/201007485585`).
- **Verified Official Links**:
  - **Facebook**: `https://www.facebook.com/share/1DJ8De13Di/?mibextid=wwXIfr`
  - **Instagram**: `https://www.instagram.com/luxorjewellery.eg/profilecard/?igsh=MW92eGo1ZGhncG96ZA==`
  - **WhatsApp Group**: `https://chat.whatsapp.com/GzjJbqYkB5M03sYwbSUI1S?mode=gi_t` (clearly labeled with group badge)
  - **WhatsApp Channel**: `https://whatsapp.com/channel/0029VaDlshU2P59jNmXzFy3g` (clearly labeled with broadcast badge)
  - **Telegram Channel**: `https://t.me/Ovaljewellwery`
- **Store Services**:
  1. Buying & Selling Gold (بيع وشراء الذهب)
  2. Buying & Selling Diamonds (بيع وشراء الألماس)
  3. Buying & Selling Silver (بيع وشراء الفضة)
  4. Watch Evaluation & Purchasing (تقييم وشراء الساعات)
- **Save Contact (vCard)**: One-tap download of [`contact.vcf`](file:///C:/Users/AdminOS/Desktop/LUXOR%20JEWELLERY/contact.vcf) formatted with standard vCard 3.0 CRLF specifications for instant smartphone address book import.
- **Unverified Information Guard**: Address, Google Maps, and business hours placeholders remain hidden until verified details are provided in `config.js`.
- **Print-Ready QR Codes**: High-error-correction (Level H) QR codes generated in vector SVG and 1000px high-resolution PNG formats.

---

## 📁 Project Structure

```
LUXOR JEWELLERY/
├── index.html           # Semantic, accessible HTML5 structure with bilingual support
├── styles.css           # Premium luxury styling, CSS grid/flexbox, animations, RTL rules
├── app.js               # Interactive logic, language switching, and vCard downloads
├── config.js            # Single source of truth for all store details and URLs
├── contact.vcf          # Verified vCard 3.0 contact file for iPhone and Android
├── favicon.svg          # Luxury gold emblem vector favicon
├── generate-qr.js       # Node.js script to generate print-ready SVG & PNG QR codes
├── run-all-tests.js     # Comprehensive automated test suite (65 tests across 9 categories)
├── package.json         # Project metadata and npm scripts
└── qr-codes/            # Generated QR code outputs
    ├── LUXOR_JEWELLERY_QR.svg       # Scalable vector graphic for physical printing
    ├── LUXOR_JEWELLERY_QR.png       # 1000x1000px 300DPI print image
    └── LUXOR_JEWELLERY_QR_small.png # 400x400px image for digital sharing
```

---

## 🚀 How to Run Locally

1. Start the lightweight built-in HTTP server:
   ```bash
   npm start
   ```
2. Open your web browser to:
   ```
   http://localhost:3000
   ```
3. To view Arabic directly:
   ```
   http://localhost:3000/?lang=ar
   ```

---

## 🔲 QR Code Generation

The QR code encodes the URL specified in [`config.js`](file:///C:/Users/AdminOS/Desktop/LUXOR%20JEWELLERY/config.js) under `publicUrl`, or any URL passed as a command-line argument:

```bash
# Uses publicUrl from config.js:
npm run generate-qr

# Or specify a custom production URL:
node generate-qr.js https://your-production-url.com
```

### Printing Guidelines for In-Store Displays:
- **Vector SVG** ([`qr-codes/LUXOR_JEWELLERY_QR.svg`](file:///C:/Users/AdminOS/Desktop/LUXOR%20JEWELLERY/qr-codes/LUXOR_JEWELLERY_QR.svg)): Best for professional print shops, acrylic stands, brass plates, and large banners.
- **High-Res PNG** ([`qr-codes/LUXOR_JEWELLERY_QR.png`](file:///C:/Users/AdminOS/Desktop/LUXOR%20JEWELLERY/qr-codes/LUXOR_JEWELLERY_QR.png)): 1000×1000px at 300 DPI.
- **Recommended Minimum Print Size**: 3 cm × 3 cm (1.2 in × 1.2 in) for reliable scanning across all smartphone cameras.
- **Quiet Zone**: The code includes a mandatory 4-module white quiet zone border for optical recognition.

---

## 🌐 Production Deployment Options

Since `https://luxorjewellery.eg` is not yet pointed to active hosting, choose any of the zero-cost, static web hosting platforms below to publish the site and obtain your production URL:

### Option A: GitHub Pages (Free & Recommended)
1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Deploy LUXOR JEWELLERY digital business card"
   ```
2. Create a GitHub repository (e.g. `luxor-jewellery`) and push:
   ```bash
   git remote add origin https://github.com/<your-username>/luxor-jewellery.git
   git branch -M main
   git push -u origin main
   ```
3. In repository **Settings** → **Pages**, select `main` branch root.
4. Your site will be live at `https://<your-username>.github.io/luxor-jewellery/`.

### Option B: Cloudflare Pages / Vercel / Netlify
1. Connect your GitHub repository or drag-and-drop this project folder into [Cloudflare Pages](https://pages.cloudflare.com/), [Vercel](https://vercel.com/), or [Netlify](https://www.netlify.com/).
2. Build command: None (leave blank).
3. Output directory: Root (`.`).
4. Attach your custom domain `luxorjewellery.eg` in the provider's domain settings.

### Option C: Traditional Web Hosting (cPanel / Apache / Nginx)
- Simply upload `index.html`, `styles.css`, `app.js`, `config.js`, `contact.vcf`, `favicon.svg`, and the `qr-codes` directory to your `public_html` web root.

---

## 🧪 Testing and Quality Assurance

Run the automated test suite anytime:
```bash
npm test
```
The suite runs 65 checks validating config consistency, international dialing links, social media destinations, vCard file integrity, headless browser layout geometry, RTL Arabic rendering, and QR code machine scanning.
