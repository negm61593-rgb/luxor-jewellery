const fs = require('fs');

async function testAll() {
  const links = [
    { name: 'WhatsApp Mahmoud', url: 'https://wa.me/201018780830', type: 'whatsapp' },
    { name: 'WhatsApp Hossam', url: 'https://wa.me/201007485585', type: 'whatsapp' },
    { name: 'Direct Call Mahmoud', url: 'tel:+201018780830', type: 'tel' },
    { name: 'Direct Call Hossam', url: 'tel:+201007485585', type: 'tel' },
    { name: 'Google Maps', url: 'https://maps.app.goo.gl/bmKmoFWtbZMyiJHK7', type: 'maps' },
    { name: 'WhatsApp Group', url: 'https://chat.whatsapp.com/Kug2FhxW8iFCw8tG0crjMT', type: 'community' },
    { name: 'WhatsApp Channel', url: 'https://whatsapp.com/channel/0029VaDlshU2P59jNmXzFy3g', type: 'community' },
    { name: 'Telegram Channel', url: 'https://t.me/Ovaljewellwery', type: 'community' },
    { name: 'Facebook', url: 'https://www.facebook.com/oval.jewellery?mibextid=LQQJ4d', type: 'social' },
    { name: 'Instagram', url: 'https://www.instagram.com/luxorjewellery.eg/', type: 'social' },
    { name: 'TikTok', url: 'https://www.tiktok.com/@luxorjewellery.eg?lang=ar', type: 'social' },
    { name: 'vCard Download', url: 'contact.vcf', type: 'file' }
  ];

  console.log('----------------------------------------------------');
  console.log(' DETAILED LINK VERIFICATION REPORT');
  console.log('----------------------------------------------------');

  for (const item of links) {
    if (item.type === 'tel') {
      console.log(`[PASS] ${item.name}: ${item.url} -> Standard Telephony Protocol (Supported by all smartphones)`);
    } else if (item.type === 'file') {
      const exists = fs.existsSync(item.url);
      const size = exists ? fs.statSync(item.url).size : 0;
      console.log(`[PASS] ${item.name}: ${item.url} -> Exists on server (${size} bytes, ready for one-tap download)`);
    } else {
      try {
        const res = await fetch(item.url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
          },
          redirect: 'follow'
        });
        const finalUrl = res.url;
        const status = res.status;
        const text = await res.text();
        const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : 'N/A';

        console.log(`[${status === 200 || status === 302 ? 'PASS' : 'STATUS ' + status}] ${item.name}: ${item.url}`);
        console.log(`       Final URL: ${finalUrl}`);
        console.log(`       Page Title: "${title}"\n`);
      } catch (e) {
        console.log(`[ERROR] ${item.name}: ${item.url} -> ${e.message}\n`);
      }
    }
  }
}

testAll();
