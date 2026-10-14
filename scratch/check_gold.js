const fs = require('fs');
const PNG = require('pngjs').PNG;
const jsQR = require('jsqr');

const p = './qr-codes/LUXOR_JEWELLERY_QR_GoldSquares.png';
const png = PNG.sync.read(fs.readFileSync(p));
console.log('Size:', png.width, png.height);

// Test different downscaled / cropped versions
for (const scale of [1, 0.75, 0.5]) {
  const targetW = Math.round(png.width * scale);
  const targetH = Math.round(png.height * scale);
  const resized = new PNG({ width: targetW, height: targetH });
  
  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const srcX = Math.floor(x / scale);
      const srcY = Math.floor(y / scale);
      const srcIdx = (srcY * png.width + srcX) * 4;
      const dstIdx = (y * targetW + x) * 4;
      resized.data[dstIdx] = png.data[srcIdx];
      resized.data[dstIdx + 1] = png.data[srcIdx + 1];
      resized.data[dstIdx + 2] = png.data[srcIdx + 2];
      resized.data[dstIdx + 3] = png.data[srcIdx + 3];
    }
  }
  
  const decoded = jsQR(new Uint8ClampedArray(resized.data), targetW, targetH);
  console.log(`Scale ${scale} (${targetW}x${targetH}):`, decoded ? decoded.data : 'FAILED');
}
