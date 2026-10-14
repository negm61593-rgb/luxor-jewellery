const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const zlib = require('zlib');
const QRCode = require('qrcode');

const PORT = 3000;
const HOST = '0.0.0.0';

// Find Wi-Fi / Local IPv4
function getLocalIp() {
  const ifaces = os.networkInterfaces();
  let wifiIp = null;
  let fallbackIp = null;

  for (const name of Object.keys(ifaces)) {
    for (const net of ifaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless')) {
          wifiIp = net.address;
        } else if (!fallbackIp && !name.toLowerCase().includes('tailscale')) {
          fallbackIp = net.address;
        }
      }
    }
  }
  return wifiIp || fallbackIp || '192.168.100.3';
}

const localIp = getLocalIp();
const phoneUrl = `http://${localIp}:${PORT}`;
const localUrl = `http://localhost:${PORT}`;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.vcf': 'text/vcard; charset=utf-8',
  '.ico': 'image/x-icon'
};

const COMPRESSIBLE_EXTS = new Set(['.html', '.css', '.js', '.json', '.webmanifest', '.svg', '.vcf']);

const { parseGoldHtml, fetchLive } = require('./gold-scraper');

let cachedGoldPrices = null;
let lastGoldFetchTime = 0;
const GOLD_CACHE_TTL_MS = 60000; // 60s cache

// Load initial snapshot from gold-prices.json
try {
  const jsonPath = path.join(__dirname, 'gold-prices.json');
  if (fs.existsSync(jsonPath)) {
    cachedGoldPrices = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    lastGoldFetchTime = Date.now();
  }
} catch (e) {
  console.warn('Could not load initial gold-prices.json:', e.message);
}

function getGoldPrices(callback) {
  const now = Date.now();
  if (cachedGoldPrices && (now - lastGoldFetchTime < GOLD_CACHE_TTL_MS)) {
    return callback(null, cachedGoldPrices);
  }

  fetchLive((err, html) => {
    if (err || !html) {
      if (cachedGoldPrices) {
        return callback(null, Object.assign({}, cachedGoldPrices, { stale: true }));
      }
      return callback(err || new Error('No data received'));
    }

    const parsed = parseGoldHtml(html);
    if (!parsed) {
      if (cachedGoldPrices) {
        return callback(null, Object.assign({}, cachedGoldPrices, { stale: true }));
      }
      return callback(new Error('Failed to parse gold HTML'));
    }

    cachedGoldPrices = parsed;
    lastGoldFetchTime = Date.now();

    try {
      fs.writeFileSync(path.join(__dirname, 'gold-prices.json'), JSON.stringify(parsed, null, 2), 'utf8');
    } catch (e) {}

    callback(null, cachedGoldPrices);
  });
}

function serveBuffer(req, res, content, ext, contentType, stats) {
  const etag = `"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;
  const lastModified = stats.mtime.toUTCString();

  const isHtml = ext === '.html';
  const cacheControl = isHtml 
    ? 'public, max-age=0, must-revalidate'
    : 'public, max-age=86400, stale-while-revalidate=604800, immutable';

  const ifNoneMatch = req.headers['if-none-match'];
  const ifModifiedSince = req.headers['if-modified-since'];

  if (ifNoneMatch === etag || (ifModifiedSince && new Date(ifModifiedSince) >= stats.mtime)) {
    res.writeHead(304, {
      'ETag': etag,
      'Last-Modified': lastModified,
      'Cache-Control': cacheControl,
      'Access-Control-Allow-Origin': '*'
    });
    return res.end();
  }

  const acceptEncoding = req.headers['accept-encoding'] || '';
  let finalContent = content;
  const headers = {
    'Content-Type': contentType,
    'ETag': etag,
    'Last-Modified': lastModified,
    'Cache-Control': cacheControl,
    'Access-Control-Allow-Origin': '*',
    'Vary': 'Accept-Encoding'
  };

  if (COMPRESSIBLE_EXTS.has(ext) && content.length > 256) {
    if (acceptEncoding.includes('gzip')) {
      finalContent = zlib.gzipSync(content, { level: 6 });
      headers['Content-Encoding'] = 'gzip';
    } else if (acceptEncoding.includes('deflate')) {
      finalContent = zlib.deflateSync(content, { level: 6 });
      headers['Content-Encoding'] = 'deflate';
    }
  }

  headers['Content-Length'] = finalContent.length;
  res.writeHead(200, headers);
  res.end(finalContent);
}

const server = http.createServer((req, res) => {
  // Safely parse request URL path even if full URL is passed
  let parsedPath = '/';
  try {
    parsedPath = new URL(req.url, 'http://localhost:3000').pathname;
  } catch (e) {
    parsedPath = req.url.split('?')[0];
  }

  // Handle API: /api/gold-prices
  if (parsedPath === '/api/gold-prices' || parsedPath === '/api/gold-prices/') {
    getGoldPrices((err, data) => {
      if (err && !data) {
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
      const jsonBody = Buffer.from(JSON.stringify(data), 'utf8');
      const acceptEncoding = req.headers['accept-encoding'] || '';
      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
        'Vary': 'Accept-Encoding'
      };
      if (acceptEncoding.includes('gzip') && jsonBody.length > 256) {
        headers['Content-Encoding'] = 'gzip';
        const compressed = zlib.gzipSync(jsonBody, { level: 6 });
        headers['Content-Length'] = compressed.length;
        res.writeHead(200, headers);
        res.end(compressed);
      } else {
        headers['Content-Length'] = jsonBody.length;
        res.writeHead(200, headers);
        res.end(jsonBody);
      }
    });
    return;
  }
  
  let safePath = decodeURIComponent(parsedPath);
  if (safePath === '/' || safePath === '' || safePath === '/index.html') {
    safePath = '/index.html';
  }

  // Prevent directory traversal
  const filePath = path.normalize(path.join(__dirname, safePath));
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      // Fallback to index.html for SPA/routes or 404
      if (path.extname(filePath) === '') {
        const indexPath = path.join(__dirname, 'index.html');
        return fs.stat(indexPath, (sErr, sStats) => {
          if (sErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('404 Not Found');
          }
          fs.readFile(indexPath, (fErr, fContent) => {
            if (fErr) {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              return res.end('404 Not Found');
            }
            serveBuffer(req, res, fContent, '.html', 'text/html; charset=utf-8', sStats);
          });
        });
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    let actualFile = filePath;
    if (stats.isDirectory()) {
      actualFile = path.join(filePath, 'index.html');
      return fs.stat(actualFile, (dirErr, dirStats) => {
        if (dirErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('404 Not Found');
        }
        fs.readFile(actualFile, (readErr, content) => {
          if (readErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('404 Not Found');
          }
          serveBuffer(req, res, content, '.html', 'text/html; charset=utf-8', dirStats);
        });
      });
    }

    fs.readFile(actualFile, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(actualFile).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      serveBuffer(req, res, content, ext, contentType, stats);
    });
  });
});

server.listen(PORT, HOST, async () => {
  console.log('====================================================');
  console.log(' LUXOR JEWELLERY — Live Development Server');
  console.log('====================================================');
  console.log('');
  console.log('💻 Computer (Local): ' + localUrl);
  console.log('📱 Phone (Same Wi-Fi): ' + phoneUrl);
  console.log('');
  console.log('To view on phone: make sure your phone is connected');
  console.log('to the same Wi-Fi network and open the link above.');
  console.log('====================================================');

  // Generate Phone QR code image for instant camera scanning
  try {
    const qrImage = await QRCode.toDataURL(phoneUrl, { margin: 2, width: 400 });
    const base64Data = qrImage.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(path.join(__dirname, 'PHONE_PREVIEW_QR.png'), base64Data, 'base64');
    console.log('✅ Generated PHONE_PREVIEW_QR.png (scan from screen to open on phone!)');
  } catch (e) {
    // Ignore QR gen errors
  }
});
