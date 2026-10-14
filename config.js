// ============================================================
// LUXOR JEWELLERY — Digital Business Card Configuration
// ============================================================
// All business details are centralized here for easy updates.
// ============================================================

const CONFIG = {
  // --- Brand Identity ---
  businessName: 'LUXOR JEWELLERY',
  businessNameAr: 'لوكسور للمجوهرات',
  username: '@luxorjewellery.eg',
  tagline: 'Your Trusted Destination for Gold & Fine Jewellery',
  taglineAr: 'وجهتك الموثوقة للذهب والمجوهرات الراقية',
  bio: 'Luxury jewellery crafted to shine',
  bioAr: 'مجوهرات راقية صُنعت لتتألق',

  // --- Business Description (Source of Truth) ---
  description: `Welcome to LUXOR JEWELLERY, your trusted destination for gold and fine jewelry!\n\nWe specialize in buying and selling new and pre-owned gold and diamonds, offering competitive prices and suitable workmanship charges. We also buy and sell silver and provide watch evaluation and purchasing services.\n\nWe offer an elegant selection to suit different tastes and occasions.\n\nThank you for trusting us. We look forward to serving you.`,
  descriptionAr: `مرحباً بكم في لوكسور للمجوهرات (LUXOR JEWELLERY)، وجهتكم الموثوقة للذهب والمجوهرات الراقية!\n\nنختص في بيع وشراء الذهب والألماس الجديد والمستعمل بأفضل الأسعار وأنسب مصنعية. كما نشتري ونبيع الفضة ونقدم خدمات تقييم وشراء الساعات.\n\nنقدم تشكيلة راقية تناسب مختلف الأذواق والمناسبات.\n\nشكراً لثقتكم بنا، ويسعدنا دائماً خدمتكم.`,

  // --- Contact Numbers (Local Egyptian & International E.164) ---
  phone1: {
    name: 'Mahmoud',
    nameAr: 'محمود',
    display: '01018780830',
    telLink: 'tel:+201018780830',
    whatsappLink: 'https://wa.me/201018780830',
    label: 'Mahmoud',
    labelAr: 'محمود'
  },
  phone2: {
    name: 'Hossam',
    nameAr: 'حسام',
    display: '01007485585',
    telLink: 'tel:+201007485585',
    whatsappLink: 'https://wa.me/201007485585',
    label: 'Hossam',
    labelAr: 'حسام'
  },

  // --- Official Social Media Profiles ---
  social: {
    facebook: 'https://www.facebook.com/oval.jewellery?mibextid=LQQJ4d',
    facebookPage: 'https://www.facebook.com/Luxorjewellery.eg/',
    instagram: 'https://www.instagram.com/luxorjewellery.eg/',
    instagramProfileCard: 'https://www.instagram.com/luxorjewellery.eg/profilecard/?igsh=MW92eGo1ZGhncG96ZA==',
    instagramDirect: 'https://www.instagram.com/luxorjewellery.eg?igsh=MTEwOHoyaTJreDY0cg==',
    tiktok: 'https://www.tiktok.com/@luxorjewellery.eg?lang=ar'
  },

  // --- Official Community Channels ---
  community: {
    whatsappGroup: 'https://chat.whatsapp.com/Kug2FhxW8iFCw8tG0crjMT',
    whatsappChannel: 'https://whatsapp.com/channel/0029VaDlshU2P59jNmXzFy3g',
    telegram: 'https://t.me/Ovaljewellwery'
  },

  // --- Services Offered ---
  services: [
    {
      icon: 'gold',
      title: 'Buying & Selling Gold',
      titleAr: 'بيع وشراء الذهب',
      description: 'New and pre-owned gold with competitive market prices and suitable workmanship',
      descriptionAr: 'بيع وشراء الذهب الجديد والمستعمل بأفضل الأسعار وأنسب مصنعية'
    },
    {
      icon: 'diamond',
      title: 'Buying & Selling Diamonds',
      titleAr: 'بيع وشراء الألماس',
      description: 'Exquisite diamond buying and selling with expert quality assessment',
      descriptionAr: 'شراء وبيع الألماس الراقي والمميز بأعلى معايير الدقة والتقييم'
    },
    {
      icon: 'silver',
      title: 'Buying & Selling Silver',
      titleAr: 'بيع وشراء الفضة',
      description: 'Finest silver pieces and bullion trading services',
      descriptionAr: 'تشكيلة مميزة من الفضة عيار 925 بيعاً وشراءً'
    },
    {
      icon: 'watch',
      title: 'Watch Evaluation & Purchasing',
      titleAr: 'تقييم وشراء الساعات',
      description: 'Professional watch evaluation and purchasing services',
      descriptionAr: 'خدمات فحص وتقييم وشراء الساعات الثمينة باحترافية'
    }
  ],

  // --- Live Gold Prices Configuration ( لحظة بلحظة ) ---
  goldPrices: {
    enabled: true,
    sourceUrl: 'https://goldbullioneg.com/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D8%A7%D9%84%D8%B0%D9%87%D8%A8/',
    apiUrl: '/api/gold-prices',
    fallbackUrl: './gold-prices.json',
    refreshIntervalMs: 60000,
    sourceNameAr: 'جولد بيليون (Gold Bullion EG)',
    sourceNameEn: 'Gold Bullion EG'
  },

  // --- Location Placeholder ---
  location: {
    enabled: false,
    address: '',
    addressAr: '',
    googleMapsLink: 'https://maps.app.goo.gl/bmKmoFWtbZMyiJHK7',
    googleMapsEmbed: '',
    verifiedAddress: '47 Cleopatra St, Salah El-Din St, Sq, Heliopolis'
  },

  // --- Smart Business Hours (Cairo Time) ---
  businessHours: {
    enabled: false,
    timezone: 'Africa/Cairo',
    schedule: {
      0: { open: '12:00', close: '22:30', nameAr: 'الأحد', nameEn: 'Sunday' },
      1: { open: '12:00', close: '22:30', nameAr: 'الإثنين', nameEn: 'Monday' },
      2: { open: '12:00', close: '22:30', nameAr: 'الثلاثاء', nameEn: 'Tuesday' },
      3: { open: '12:00', close: '22:30', nameAr: 'الأربعاء', nameEn: 'Wednesday' },
      4: { open: '12:00', close: '22:30', nameAr: 'الخميس', nameEn: 'Thursday' },
      5: { open: '13:30', close: '23:00', nameAr: 'الجمعة', nameEn: 'Friday' },
      6: { open: '12:00', close: '22:30', nameAr: 'السبت', nameEn: 'Saturday' }
    }
  },

  // --- Email Placeholder ---
  email: {
    enabled: false,
    address: ''
  },

  // --- Public Website / Production URL for QR Code ---
  publicUrl: 'https://luxor-jewellery.vercel.app',

  // --- vCard Configuration ---
  vcard: {
    filename: 'LUXOR_JEWELLERY_Contact.vcf'
  }
};

// CommonJS export for Node.js scripts (e.g. generate-qr.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
