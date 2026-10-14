const { parseGoldHtml, fetchLive } = require('../gold-scraper');
const fs = require('fs');
const path = require('path');

let cachedGoldPrices = null;
let lastGoldFetchTime = 0;
const GOLD_CACHE_TTL_MS = 60000; // 60 seconds cache

module.exports = async (req, res) => {
  // CORS & Caching Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const now = Date.now();
  if (cachedGoldPrices && (now - lastGoldFetchTime < GOLD_CACHE_TTL_MS)) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify(cachedGoldPrices));
  }

  return new Promise((resolve) => {
    fetchLive((err, html) => {
      if (!err && html) {
        const parsed = parseGoldHtml(html);
        if (parsed) {
          cachedGoldPrices = parsed;
          lastGoldFetchTime = Date.now();
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(parsed));
          return resolve();
        }
      }

      // Fallback: cached instance data or gold-prices.json snapshot
      if (cachedGoldPrices) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(Object.assign({}, cachedGoldPrices, { stale: true })));
        return resolve();
      }

      try {
        const fallbackPath = path.join(process.cwd(), 'gold-prices.json');
        if (fs.existsSync(fallbackPath)) {
          const fallbackData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(fallbackData));
          return resolve();
        }
      } catch (e) {}

      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ success: false, error: 'Failed to fetch live gold rates' }));
      resolve();
    });
  });
};
