const fs = require('fs');
const PNG = require('pngjs').PNG;

const imgPath = 'C:/Users/AdminOS/.gemini/antigravity/brain/7ffd7db5-1327-493e-965b-57f8de342035/.user_uploaded/media_1791973548621.png';
const png = PNG.sync.read(fs.readFileSync(imgPath));

// Let's count the modules along a horizontal line between the two top eyes
// Row y = 200..300: let's scan across row 235 (which passes through the center of the top eyes)
const y = 236;
let transitions = [];
let prev = (png.data[(y * png.width + 0) * 4] < 128) ? 1 : 0;

for (let x = 0; x < png.width; x++) {
  const r = png.data[(y * png.width + x) * 4];
  const g = png.data[(y * png.width + x) * 4 + 1];
  const b = png.data[(y * png.width + x) * 4 + 2];
  const isDark = (r < 100 && g < 100 && b < 100) ? 1 : 0;
  if (isDark !== prev) {
    transitions.push({ x, isDark });
    prev = isDark;
  }
}

console.log('Transitions along y=' + y + ':');
for (let i = 0; i < Math.min(transitions.length, 25); i++) {
  console.log(`x=${transitions[i].x}, isDark=${transitions[i].isDark}, width=${i > 0 ? transitions[i].x - transitions[i-1].x : 0}`);
}
