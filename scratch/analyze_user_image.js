const fs = require('fs');
const PNG = require('pngjs').PNG;
const jsQR = require('jsqr');

const imgPath = 'C:/Users/AdminOS/.gemini/antigravity/brain/7ffd7db5-1327-493e-965b-57f8de342035/.user_uploaded/media_1791973548621.png';
const png = PNG.sync.read(fs.readFileSync(imgPath));

console.log('Image dimensions:', png.width, png.height);

// Test binarization threshold
// Let's sample the gold pixels in the top-left finder eye
// The eye is around x: 150..300, y: 150..300 in 1024x1024
let minL = 255, maxL = 0, sumL = 0, count = 0;

for (let y = 150; y < 320; y++) {
  for (let x = 150; x < 320; x++) {
    const idx = (y * png.width + x) * 4;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    // Luminance formula: 0.299 R + 0.587 G + 0.114 B
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // Check if it's the gold band (not pure white background and not black pupil)
    if (lum > 80 && lum < 250 && (r > b + 20)) {
      if (lum < minL) minL = lum;
      if (lum > maxL) maxL = lum;
      sumL += lum;
      count++;
    }
  }
}

console.log(`Gold pixel stats: count=${count}, minL=${minL.toFixed(1)}, maxL=${maxL.toFixed(1)}, avgL=${(sumL/count).toFixed(1)}`);

// Now let's test jsQR with custom binarization threshold on this exact image!
for (let thresh = 100; thresh <= 240; thresh += 10) {
  // Create a binarized grayscale version of png
  const binarized = new PNG({ width: png.width, height: png.height });
  for (let i = 0; i < png.data.length; i += 4) {
    const r = png.data[i];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const val = lum < thresh ? 0 : 255;
    binarized.data[i] = val;
    binarized.data[i + 1] = val;
    binarized.data[i + 2] = val;
    binarized.data[i + 3] = 255;
  }
  const decoded = jsQR(new Uint8ClampedArray(binarized.data), png.width, png.height);
  if (decoded) {
    console.log(`🎉 DECODED with threshold ${thresh}! Data: ${decoded.data}`);
    break;
  }
}
