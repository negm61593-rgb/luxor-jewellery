const fs = require('fs');
const path = require('path');
const https = require('https');

function parseGoldHtml(html) {
  const t0Match = html.match(/<table[\s\S]*?<\/table>/i);
  if (!t0Match) return null;

  const rows = t0Match[0].match(/<tr[\s\S]*?<\/tr>/gi);
  if (!rows || rows.length < 2) return null;

  const items = [];
  rows.forEach((r, idx) => {
    if (idx === 0) return; // skip header
    const cells = r.match(/<td[\s\S]*?<\/td>/gi);
    if (!cells || cells.length < 3) return;

    const cell0 = cells[0];
    const buyStr = cells[1].replace(/<[^>]+>/g, '').replace(/,/g, '').trim();
    const sellStr = cells[2].replace(/<[^>]+>/g, '').replace(/,/g, '').trim();
    const buy = parseFloat(buyStr) || 0;
    const sell = parseFloat(sellStr) || 0;

    let id = '';
    let nameAr = '';
    let nameEn = '';
    let isPound = false;
    let isOunce = false;
    let isUsd = false;

    if (cell0.includes('24')) {
      id = '24k';
      nameAr = 'عيار 24';
      nameEn = '24K Gold';
    } else if (cell0.includes('22')) {
      id = '22k';
      nameAr = 'عيار 22';
      nameEn = '22K Gold';
    } else if (cell0.includes('21')) {
      id = '21k';
      nameAr = 'عيار 21';
      nameEn = '21K Gold';
    } else if (cell0.includes('18')) {
      id = '18k';
      nameAr = 'عيار 18';
      nameEn = '18K Gold';
    } else if (cell0.includes('14')) {
      id = '14k';
      nameAr = 'عيار 14';
      nameEn = '14K Gold';
    } else if (cell0.includes('الجنيه الذهب')) {
      id = 'pound';
      nameAr = 'الجنيه الذهب';
      nameEn = 'Gold Pound';
      isPound = true;
    } else if (cell0.includes('الأونصة')) {
      id = 'ounce';
      nameAr = 'الأونصة';
      nameEn = 'Gold Ounce';
      isOunce = true;
    } else if (cell0.includes('الدولار')) {
      id = 'usd';
      nameAr = 'الدولار';
      nameEn = 'USD / EGP';
      isUsd = true;
    } else {
      id = 'item_' + idx;
      nameAr = cell0.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      nameEn = nameAr;
    }

    let change = '';
    let changeDir = 'flat';
    const changeMatch = cell0.match(/class=["']is-up["'][^>]*>([\s\S]*?)<\/span>/i);
    if (changeMatch) {
      const isUp = cell0.includes('fa-arrow-up');
      const isDown = cell0.includes('fa-arrow-down');
      const cleanVal = changeMatch[1].replace(/<[^>]+>/g, '').trim();
      if (isUp) {
        change = '+' + cleanVal;
        changeDir = 'up';
      } else if (isDown) {
        change = '-' + cleanVal;
        changeDir = 'down';
      } else {
        change = cleanVal;
      }
    }

    items.push({
      id,
      nameAr,
      nameEn,
      buy,
      sell,
      currency: isOunce ? 'USD' : 'EGP',
      change,
      changeDir,
      isPrimary: ['21k', '24k', '18k', 'pound'].includes(id)
    });
  });

  return {
    success: true,
    timestamp: new Date().toISOString(),
    formattedTimeAr: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    formattedTimeEn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    formattedDateAr: new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    formattedDateEn: new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
    source: 'Gold Bullion Egypt',
    sourceUrl: 'https://goldbullioneg.com/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D8%A7%D9%84%D8%B0%D9%87%D8%A8/',
    marketStatusAr: 'سوق الذهب مفتوح الآن',
    marketStatusEn: 'Gold Market is Open',
    items
  };
}

function fetchLive(callback) {
  const url = 'https://goldbullioneg.com/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D8%A7%D9%84%D8%B0%D9%87%D8%A8/';
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ar,en;q=0.9'
    },
    timeout: 8000
  };

  const req = https.get(url, options, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      const redirReq = https.get(res.headers.location, options, (redirRes) => {
        let data = '';
        redirRes.on('data', c => data += c);
        redirRes.on('end', () => callback(null, data));
      });
      redirReq.on('timeout', () => {
        redirReq.destroy(new Error('Redirect request timed out'));
      });
      redirReq.on('error', err => callback(err));
      return;
    }

    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => callback(null, data));
  });

  req.on('timeout', () => {
    req.destroy(new Error('Request timed out'));
  });
  req.on('error', err => callback(err));
}

if (require.main === module) {
  console.log('Fetching live gold prices from goldbullioneg.com...');
  fetchLive((err, html) => {
    let sourceHtml = html;
    if (err || !sourceHtml) {
      console.warn('Network fetch error, falling back to temp HTML:', err ? err.message : 'no data');
      const tempPath = 'C:/Users/AdminOS/AppData/Local/Temp/goldbullion.html';
      if (fs.existsSync(tempPath)) {
        sourceHtml = fs.readFileSync(tempPath, 'utf8');
      }
    }

    if (!sourceHtml) {
      console.error('Failed to obtain HTML');
      process.exit(1);
    }

    const parsed = parseGoldHtml(sourceHtml);
    if (!parsed) {
      console.error('Failed to parse gold prices HTML');
      process.exit(1);
    }

    const outPath = path.join(__dirname, 'gold-prices.json');
    fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2), 'utf8');
    console.log(`✅ Saved ${parsed.items.length} gold price items to ${outPath}`);
    console.log(JSON.stringify(parsed.items.slice(0, 4), null, 2));
  });
}

module.exports = { parseGoldHtml, fetchLive };
