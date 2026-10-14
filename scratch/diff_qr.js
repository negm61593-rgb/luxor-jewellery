const fs = require('fs');

// Read the SVG generated for GoldSquares
const goldSvg = fs.readFileSync('./qr-codes/LUXOR_JEWELLERY_QR_GoldSquares.svg', 'utf8');

// In stand, what is the container?
// In stand: .qr-container has width 440px, height 440px, padding: 20px, border: 3px solid #91711E.
// Inside it is the SVG.
console.log('goldSvg length:', goldSvg.length);
console.log('viewBox:', goldSvg.match(/viewBox="[^"]+"/)?.[0]);
console.log('width/height:', goldSvg.match(/width="[^"]+" height="[^"]+"/)?.[0]);
