const https = require('https');
const { parseGoldHtml } = require('./gold-scraper');

function fetchOriginal() {
  return new Promise((resolve, reject) => {
    https.get('https://goldbullioneg.com/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D8%A7%D9%84%D8%B0%D9%87%D8%A8/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  console.log('1. Fetching live rates from original site: goldbullioneg.com ...');
  const originalHtml = await fetchOriginal();
  const original = parseGoldHtml(originalHtml);

  console.log('2. Fetching live rates from Luxor production API: https://luxor-jewellery.vercel.app/api/gold-prices ...');
  const vercelRes = await fetch('https://luxor-jewellery.vercel.app/api/gold-prices');
  const vercel = await vercelRes.json();

  console.log('\n======================================================');
  console.log('       LIVE GOLD PRICES AUDIT REPORT (مقارنة الأسعار)');
  console.log('======================================================');
  console.log(`Original Site Status : OK (Total: ${original.items.length} items)`);
  console.log(`Luxor API Status     : ${vercel.success ? 'OK' : 'FAIL'} (Total: ${vercel.items.length} items)`);
  console.log('------------------------------------------------------');

  let perfect = true;
  for (const orig of original.items) {
    const v = vercel.items.find(x => x.id === orig.id);
    if (!v) {
      console.log(`❌ [${orig.nameAr}] Missing from Luxor API!`);
      perfect = false;
      continue;
    }

    const buyMatch = (orig.buy === v.buy);
    const sellMatch = (orig.sell === v.sell);
    const currMatch = (orig.currency === v.currency);

    if (buyMatch && sellMatch) {
      console.log(`✅ [${orig.nameAr.padEnd(12)}] شراء: ${String(orig.buy).padStart(7)} ${orig.currency} | بيع: ${String(orig.sell).padStart(7)} ${orig.currency} -> متطابق 100%`);
    } else {
      console.log(`❌ [${orig.nameAr.padEnd(12)}] غير متطابق! الأصل (شراء: ${orig.buy}, بيع: ${orig.sell}) vs لوكسور (شراء: ${v.buy}, بيع: ${v.sell})`);
      perfect = false;
    }
  }

  console.log('======================================================');
  if (perfect) {
    console.log('🎉 النتيجة: جميع الأسعار متطابقة بنسبة 100% مع الموقع الأصلي!');
  } else {
    console.log('⚠️ هناك اختلاف في بعض الأسعار.');
  }
}

run().catch(console.error);
