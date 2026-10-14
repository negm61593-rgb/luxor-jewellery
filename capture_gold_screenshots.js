const { execSync } = require('child_process');
const path = require('path');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const shots = [
  { file: 'screenshot_gold_ar.png', url: 'http://localhost:3000/?lang=ar', width: 450, height: 950 },
  { file: 'screenshot_gold_en.png', url: 'http://localhost:3000/?lang=en', width: 450, height: 950 },
  { file: 'screenshot_gold_desktop.png', url: 'http://localhost:3000/?lang=ar', width: 1200, height: 1000 }
];

shots.forEach(s => {
  const dest = path.join(__dirname, s.file);
  console.log(`Capturing ${s.file}...`);
  execSync(`cmd.exe /c ""${edgePath}" --headless=new --window-size=${s.width},${s.height} --screenshot="${dest}" "${s.url}""`, { stdio: 'pipe' });
  console.log(`Saved ${dest}`);
});
