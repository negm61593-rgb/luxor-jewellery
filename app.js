// ============================================================
// LUXOR JEWELLERY — Digital Business Card Application Logic
// Features: Bilingual (AR/EN), Native Browser PWA, Modals & Sharing
// ============================================================

(function () {
  'use strict';

  let currentLang = 'en';
  let latestGoldData = null;

  // ------------------------------------------------------------
  // Modal Handlers — Defined immediately so inline onclick always works
  // ------------------------------------------------------------
  function checkModalsClosed() {
    const active = document.querySelector('.modal-backdrop.active');
    if (!active) {
      document.body.classList.remove('modal-open');
    }
  }

  window.openShareModal = function (e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const m = document.getElementById('shareModal');
    if (m) {
      m.classList.add('active');
      document.body.classList.add('modal-open');
    }
  };

  window.closeShareModal = function (e) {
    if (e && e.target !== e.currentTarget && !e.target.closest('.modal-close')) return;
    const m = document.getElementById('shareModal');
    if (m) {
      m.classList.remove('active');
      checkModalsClosed();
    }
  };

  window.openServicesModal = function (e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const m = document.getElementById('servicesModal');
    if (m) {
      m.classList.add('active');
      document.body.classList.add('modal-open');
    }
  };

  window.closeServicesModal = function (e) {
    if (e && e.target !== e.currentTarget && !e.target.closest('.modal-close')) return;
    const m = document.getElementById('servicesModal');
    if (m) {
      m.classList.remove('active');
      checkModalsClosed();
    }
  };

  window.openGoldModal = function (e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const m = document.getElementById('goldModal');
    if (m) {
      m.classList.add('active');
      document.body.classList.add('modal-open');
      const trigger = document.getElementById('goldRatesTriggerBtn');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
      if (window.location.hash !== '#gold' && window.location.hash !== '#gold-prices') {
        try {
          history.pushState({ modal: 'gold' }, '', '#gold');
        } catch (err) {}
      }
    }
  };

  window.closeGoldModal = function (e) {
    if (e && e.target !== e.currentTarget && !e.target.closest('.modal-close')) return;
    const m = document.getElementById('goldModal');
    if (m) {
      m.classList.remove('active');
      checkModalsClosed();
      const trigger = document.getElementById('goldRatesTriggerBtn');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (window.location.hash === '#gold' || window.location.hash === '#gold-prices') {
        try {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (err) {}
      }
    }
  };

  // ------------------------------------------------------------
  // Clipboard Copy & Toast Notice
  // ------------------------------------------------------------
  window.copyCurrentLink = function () {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(showToast).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand('copy');
        showToast();
      } catch (err) {}
      document.body.removeChild(input);
    }
  };

  function showToast() {
    const toast = document.getElementById('toastNotice');
    if (!toast) return;
    toast.textContent = currentLang === 'ar' ? 'تم نسخ الرابط بنجاح!' : 'Link copied to clipboard!';
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 2400);
  }

  // Wait for DOM ready
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    // 1. Detect language from URL or localStorage
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang');
      if (urlLang === 'ar' || urlLang === 'en') {
        currentLang = urlLang;
      } else {
        const saved = localStorage.getItem('luxor_lang');
        if (saved === 'ar' || saved === 'en') {
          currentLang = saved;
        }
      }
    } catch (e) {}

    setupLanguageToggle();
    renderContent();
    setupModals();
    initGoldPrices();
    initPwa();
    initLuxuryAnimatedCanvas();
  }

  // ------------------------------------------------------------
  // Language Management & Content Rendering
  // ------------------------------------------------------------
  function setupLanguageToggle() {
    const btn = document.getElementById('langToggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      currentLang = currentLang === 'en' ? 'ar' : 'en';
      try {
        localStorage.setItem('luxor_lang', currentLang);
      } catch (e) {}
      renderContent();
    });
  }

  function renderContent() {
    const html = document.documentElement;
    const isAr = currentLang === 'ar';

    html.setAttribute('lang', currentLang);
    html.setAttribute('dir', isAr ? 'rtl' : 'ltr');

    // Language Toggle Segments
    const arSeg = document.getElementById('langArSegment');
    const enSeg = document.getElementById('langEnSegment');
    const langBtnText = document.getElementById('langBtnText');

    if (arSeg && enSeg) {
      if (isAr) {
        arSeg.classList.add('active');
        enSeg.classList.remove('active');
      } else {
        enSeg.classList.add('active');
        arSeg.classList.remove('active');
      }
    }

    if (langBtnText) {
      langBtnText.textContent = isAr ? 'English' : 'العربية';
    }

    // Topbar accessibility & tooltips
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
      shareBtn.setAttribute('title', isAr ? 'مشاركة الكرت' : 'Share Profile');
      shareBtn.setAttribute('aria-label', isAr ? 'مشاركة الكرت' : 'Share Profile');
    }
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
      langToggle.setAttribute('title', isAr ? 'التبديل إلى English' : 'التبديل إلى العربية');
      langToggle.setAttribute('aria-label', isAr ? 'التبديل إلى English' : 'التبديل إلى العربية');
    }

    // Dynamic Document Title
    document.title = isAr
      ? 'لوكسور للمجوهرات | LUXOR JEWELLERY — بطاقة العمل الرقمية الرسمية'
      : 'LUXOR JEWELLERY | لوكسور للمجوهرات — Official Digital Business Card';

    // Profile Identity
    const profileTitle = document.getElementById('profileTitle');
    if (profileTitle) {
      profileTitle.textContent = isAr ? 'لوكسور للمجوهرات' : '@luxorjewellery.eg';
    }

    const profileBio = document.getElementById('profileBio');
    if (profileBio) {
      profileBio.textContent = isAr
        ? 'مجوهرات راقية صُنعت لتتألق'
        : 'Luxury jewellery crafted to shine';
    }

    // SEO/Accessibility Header Elements
    const headerTitle = document.getElementById('headerTitle');
    if (headerTitle) {
      headerTitle.textContent = isAr ? 'لوكسور للمجوهرات' : 'LUXOR';
    }

    const headerSubtitle = document.getElementById('headerSubtitle');
    if (headerSubtitle) {
      headerSubtitle.textContent = isAr ? 'مجوهرات راقية' : 'JEWELLERY';
    }

    // Social Icon Buttons tooltips
    setAttr('socialBtnInstagram', 'title', isAr ? 'إنستغرام' : 'Instagram');
    setAttr('socialBtnInstagram', 'aria-label', isAr ? 'حساب إنستغرام' : 'Instagram');
    setAttr('socialBtnFacebook', 'title', isAr ? 'فيسبوك' : 'Facebook');
    setAttr('socialBtnFacebook', 'aria-label', isAr ? 'صفحة فيسبوك' : 'Facebook');
    setAttr('socialBtnTiktok', 'title', isAr ? 'تيك توك' : 'TikTok');
    setAttr('socialBtnTiktok', 'aria-label', isAr ? 'حساب تيك توك' : 'TikTok');
    setAttr('socialBtnCallHossam', 'title', isAr ? 'اتصال بحسام (01007485585)' : 'Call Hossam (01007485585)');
    setAttr('socialBtnCallHossam', 'aria-label', isAr ? 'اتصال بحسام (01007485585)' : 'Call Hossam (01007485585)');
    setAttr('socialBtnWaMahmoud', 'title', isAr ? 'واتساب محمود (01018780830)' : 'WhatsApp Mahmoud (01018780830)');
    setAttr('socialBtnWaMahmoud', 'aria-label', isAr ? 'واتساب محمود (01018780830)' : 'WhatsApp Mahmoud (01018780830)');

    // Live Gold Prices Localization
    setText('titleGoldTrigger', isAr ? 'أسعار الذهب لحظة بلحظة' : 'Live Gold Rates');
    setText('subtitleGoldTrigger', isAr ? 'سعر الشراء والبيع • تحديث مباشر من الصاغة' : 'Live Buy & Sell Rates • Real-time');
    setText('goldTriggerBadgeText', isAr ? 'مباشر' : 'Live');
    setText('goldCardTitle', isAr ? 'أسعار الذهب لحظة بلحظة' : 'Live Gold Rates');
    setText('goldCardSubtitle', isAr ? 'سوق الصاغة في مصر • تحديث فوري' : 'Egyptian Gold Market • Real-time');
    setText('livePillText', isAr ? 'مباشر الآن' : 'Live');
    setText('colCaliberLbl', isAr ? 'العيار' : 'Caliber');
    setText('colBuyLbl', isAr ? 'شراء من المحل' : 'Buy (Shop)');
    setText('colSellLbl', isAr ? 'بيع للمحل' : 'Sell (Shop)');
    setText('goldLbl24', isAr ? 'عيار 24' : '24K Gold');
    setText('goldLbl22', isAr ? 'عيار 22' : '22K Gold');
    setText('goldLbl21', isAr ? 'عيار 21' : '21K Gold');
    setText('goldLbl18', isAr ? 'عيار 18' : '18K Gold');
    setText('goldLbl14', isAr ? 'عيار 14' : '14K Gold');
    setText('goldLblUsd', isAr ? 'الدولار' : 'USD / EGP');
    setText('goldLblOunce', isAr ? 'الأونصة' : 'Gold Ounce');
    setText('goldLblPound', isAr ? 'الجنيه الذهب' : 'Gold Pound');
    setText('goldSourceText', isAr ? 'المصدر: Gold Bullion' : 'Source: Gold Bullion');
    setAttr('goldRefreshBtn', 'title', isAr ? 'تحديث الأسعار الآن' : 'Refresh Gold Rates');
    setAttr('goldRefreshBtn', 'aria-label', isAr ? 'تحديث أسعار الذهب الآن' : 'Refresh Gold Rates Now');
    updateGoldTimestampText(isAr);
    renderGoldPricesData(latestGoldData);

    // Link Titles & Subtitles
    setText('titleMaps', isAr ? 'موقع المحل' : 'Store Location');
    setText('subtitleMaps', isAr ? '📍 47 شارع كليوباترا، ميدان صلاح الدين، مصر الجديدة' : '📍 47 Cleopatra St, Salah El-Din Sq, Heliopolis');
    setText('titleInstagram', isAr ? 'إنستغرام' : 'Instagram');
    setText('titleFacebook', isAr ? 'فيسبوك' : 'Facebook');
    setText('titleTelegram', isAr ? 'قناة تيليجرام' : 'Telegram Channel');
    setText('subtitleTelegram', isAr ? 'أسعار الذهب والفضة اليومية' : 'Live daily gold & silver rates');
    setText('titleTiktok', isAr ? 'تيك توك' : 'TikTok');
    setText('titleWa1', isAr ? 'واتساب — محمود' : 'WhatsApp — Mahmoud');
    setText('titleWa2', isAr ? 'واتساب — حسام' : 'WhatsApp — Hossam');
    setText('titleChannel', isAr ? 'قناة واتساب' : 'WhatsApp Channel');
    setText('titleGroup', isAr ? 'جروب واتساب' : 'WhatsApp Group');
    setText('subtitleGroup', isAr ? 'انضم لمجموعتنا للمناقشات والاستفسارات' : 'Join our discussions & community');
    setText('titleServicesTrigger', isAr ? 'عن المحل وخدماته' : 'About Us & Services');
    setText('subtitleServicesTrigger', isAr ? 'بيع وشراء الذهب • الألماس • الفضة • الساعات' : 'Buying & Selling Gold • Diamonds • Silver • Watches');

    // Share Modal labels
    setText('modalShareTitle', isAr ? 'مشاركة كرت لوكسور للمجوهرات' : 'Share LUXOR JEWELLERY');
    setText('modalShareDesc', isAr ? 'امسح رمز QR أو انسخ الرابط للمشاركة' : 'Scan QR code or copy link to share');
    setText('modalCopyLinkText', isAr ? 'نسخ الرابط' : 'Copy Link');
    setText('modalCallText', isAr ? 'اتصال بمحمود' : 'Call Mahmoud');
    setText('modalWaText', isAr ? 'واتساب محمود' : 'WhatsApp Mahmoud');
    setText('modalCall2Text', isAr ? 'اتصال بحسام' : 'Call Hossam');
    setText('modalWa2Text', isAr ? 'واتساب حسام' : 'WhatsApp Hossam');

    // Services Modal labels
    setText('servicesModalTitle', isAr ? 'عن المحل — لوكسور للمجوهرات' : 'About Us — LUXOR JEWELLERY');
    setText('servicesListHeading', isAr ? 'خدماتنا:' : 'Our Services:');

    const descEl = document.getElementById('servicesModalDesc');
    if (descEl && typeof CONFIG !== 'undefined') {
      descEl.textContent = isAr ? CONFIG.descriptionAr : CONFIG.description;
    }

    // Dynamic services list localization
    const servicesUl = document.getElementById('servicesListUl');
    if (servicesUl) {
      if (isAr) {
        servicesUl.innerHTML = `
          <li class="services-info-item"><span class="icon">✨</span><span><strong>بيع وشراء الذهب</strong> (عيار 18 | 21 | 24 — جديد ومستعمل بأفضل الأسعار وأنسب مصنعية)</span></li>
          <li class="services-info-item"><span class="icon">💎</span><span><strong>بيع وشراء الألماس</strong> (معتمد بأعلى معايير التقييم والاحترافية)</span></li>
          <li class="services-info-item"><span class="icon">🥈</span><span><strong>بيع وشراء الفضة</strong> (تشكيلة مميزة عيار 925 وسبائك)</span></li>
          <li class="services-info-item"><span class="icon">⌚</span><span><strong>تقييم وشراء الساعات</strong> (فحص وتقييم معتمد للساعات الثمينة)</span></li>
        `;
      } else {
        servicesUl.innerHTML = `
          <li class="services-info-item"><span class="icon">✨</span><span><strong>Buying & Selling Gold</strong> (18k | 21k | 24k — New & Pre-owned at competitive rates)</span></li>
          <li class="services-info-item"><span class="icon">💎</span><span><strong>Buying & Selling Diamonds</strong> (Certified High-Standard Appraisal)</span></li>
          <li class="services-info-item"><span class="icon">🥈</span><span><strong>Buying & Selling Silver</strong> (925 Silver Selection & Bullion)</span></li>
          <li class="services-info-item"><span class="icon">⌚</span><span><strong>Watch Evaluation & Purchasing</strong> (Certified Expert Appraisal)</span></li>
        `;
      }
    }

    // Footer Localization
    setText('footerTags', isAr ? 'ذهب • ألماس • فضة • ساعات' : 'Gold • Diamonds • Silver • Watches');
    setText('footerCopy', isAr ? '© 2026 لوكسور للمجوهرات. جميع الحقوق محفوظة.' : '© 2026 LUXOR JEWELLERY. All rights reserved.');
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setAttr(id, attr, val) {
    const el = document.getElementById(id);
    if (el) el.setAttribute(attr, val);
  }

  // ------------------------------------------------------------
  // Modal Event Listeners (Keyboard & History State)
  // ------------------------------------------------------------
  function setupModals() {
    // Keyboard Escape to dismiss any modal
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        window.closeShareModal();
        window.closeServicesModal();
        window.closeGoldModal();
      }
    });

    // Browser back button / swipe back gesture integration
    window.addEventListener('popstate', function () {
      if (window.location.hash !== '#gold' && window.location.hash !== '#gold-prices') {
        const m = document.getElementById('goldModal');
        if (m && m.classList.contains('active')) {
          m.classList.remove('active');
          checkModalsClosed();
          const trigger = document.getElementById('goldRatesTriggerBtn');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        }
      } else {
        window.openGoldModal();
      }
    });

    // Handle initial direct link with #gold or #gold-prices hash
    if (window.location.hash === '#gold' || window.location.hash === '#gold-prices') {
      window.openGoldModal();
    }

    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', window.openShareModal);
    }

    const servicesBtn = document.getElementById('servicesTriggerBtn');
    if (servicesBtn) {
      servicesBtn.addEventListener('click', window.openServicesModal);
    }

    const goldRatesBtn = document.getElementById('goldRatesTriggerBtn');
    if (goldRatesBtn) {
      goldRatesBtn.addEventListener('click', window.openGoldModal);
    }
  }

  // ------------------------------------------------------------
  // Native PWA Registration (Silent background service worker)
  // ------------------------------------------------------------
  function initPwa() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js')
          .then(function () {})
          .catch(function (err) {
            console.log('SW Registration Note:', err);
          });
      });
    }
  }

  // ------------------------------------------------------------
  // Live Gold Prices Controller (لحظة بلحظة)
  // ------------------------------------------------------------
  function initGoldPrices() {
    const refreshBtn = document.getElementById('goldRefreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        refreshBtn.classList.add('is-spinning');
        fetchLiveGoldPrices(function () {
          setTimeout(function () {
            refreshBtn.classList.remove('is-spinning');
          }, 600);
        });
      });
    }

    // Initial fetch
    fetchLiveGoldPrices();

    // Auto-refresh every 60 seconds
    setInterval(fetchLiveGoldPrices, 60000);
  }

  function updateGoldTimestampText(isAr) {
    const timeEl = document.getElementById('goldTimeText');
    if (!timeEl) return;
    if (latestGoldData) {
      const timeStr = isAr ? (latestGoldData.formattedTimeAr || 'الآن') : (latestGoldData.formattedTimeEn || 'Just now');
      timeEl.textContent = isAr ? ('آخر تحديث: ' + timeStr) : ('Updated: ' + timeStr);
    } else {
      timeEl.textContent = isAr ? 'آخر تحديث: منذ لحظات' : 'Updated: Just now';
    }
  }

  function fetchLiveGoldPrices(doneCallback) {
    const apiUrl = '/api/gold-prices';
    const fallbackUrl = './gold-prices.json';

    fetch(apiUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('API status ' + res.status);
        return res.json();
      })
      .then(function (data) {
        handleGoldDataSuccess(data);
        if (doneCallback) doneCallback();
      })
      .catch(function () {
        // Fallback to static JSON file (offline / static hosting)
        fetch(fallbackUrl)
          .then(function (res) { return res.json(); })
          .then(function (data) {
            handleGoldDataSuccess(data);
            if (doneCallback) doneCallback();
          })
          .catch(function (err) {
            console.warn('Could not load gold prices:', err);
            if (doneCallback) doneCallback();
          });
      });
  }

  function handleGoldDataSuccess(data) {
    if (!data || !data.items || !Array.isArray(data.items)) return;
    latestGoldData = data;
    renderGoldPricesData(data);
  }

  function formatRate(val, isDec) {
    const num = Number(val);
    if (isNaN(num)) return val || '—';
    if (isDec || (num % 1 !== 0)) {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return num.toLocaleString('en-US');
  }

  function renderGoldPricesData(data) {
    const isAr = currentLang === 'ar';
    updateGoldTimestampText(isAr);

    // 1. Update currency symbols (EGP / ج.م and $ for Ounce)
    const egpCurrencies = document.querySelectorAll('.gold-row:not([data-id="ounce"]) .val-currency');
    egpCurrencies.forEach(function (el) {
      el.textContent = isAr ? 'ج.م' : 'EGP';
    });
    const ounceCurrencies = document.querySelectorAll('.gold-row[data-id="ounce"] .val-currency');
    ounceCurrencies.forEach(function (el) {
      el.textContent = '$';
    });

    // 2. Default change fallbacks if data not yet received
    const defaultChanges = {
      '21k': { chgAr: '+35 ج ▲', chgEn: '+35 EGP ▲', dir: 'up' },
      '24k': { chgAr: '+40 ج ▲', chgEn: '+40 EGP ▲', dir: 'up' },
      '18k': { chgAr: '+30 ج ▲', chgEn: '+30 EGP ▲', dir: 'up' },
      'pound': { chgAr: '+280 ج ▲', chgEn: '+280 EGP ▲', dir: 'up' },
      '22k': { chgAr: '+37 ج ▲', chgEn: '+37 EGP ▲', dir: 'up' },
      '14k': { chgAr: '+23 ج ▲', chgEn: '+23 EGP ▲', dir: 'up' },
      'ounce': { chgAr: 'USD', chgEn: 'USD', dir: 'neutral' },
      'usd': { chgAr: '+0.09 ج ▲', chgEn: '+0.09 EGP ▲', dir: 'up' }
    };

    if (!data || !data.items || !Array.isArray(data.items)) {
      Object.keys(defaultChanges).forEach(function (id) {
        const chgEl = document.getElementById('goldChg' + capitalizeId(id));
        if (chgEl) {
          chgEl.textContent = isAr ? defaultChanges[id].chgAr : defaultChanges[id].chgEn;
        }
      });
      return;
    }

    // 3. Render live items
    data.items.forEach(function (item) {
      const buyEl = document.getElementById('goldBuy' + capitalizeId(item.id));
      const sellEl = document.getElementById('goldSell' + capitalizeId(item.id));
      const chgEl = document.getElementById('goldChg' + capitalizeId(item.id));

      const isDec = item.id === 'usd' || item.id === 'ounce';
      if (buyEl) buyEl.textContent = formatRate(item.buy, isDec);
      if (sellEl) sellEl.textContent = formatRate(item.sell, isDec);

      if (chgEl && item.change) {
        let chgText = item.change;
        if (!isAr) {
          chgText = chgText.replace(' ج', ' EGP');
        }
        const arrow = item.changeDir === 'up' ? '▲' : item.changeDir === 'down' ? '▼' : '';
        chgEl.textContent = arrow ? (chgText + ' ' + arrow) : chgText;
        chgEl.className = 'caliber-change ' + (item.changeDir === 'up' ? 'text-success' : item.changeDir === 'down' ? 'text-danger' : 'text-muted');
      }
    });
  }

  function capitalizeId(id) {
    if (!id) return '';
    if (id === '21k') return '21';
    if (id === '24k') return '24';
    if (id === '18k') return '18';
    if (id === '22k') return '22';
    if (id === '14k') return '14';
    if (id === 'pound') return 'Pound';
    if (id === 'ounce') return 'Ounce';
    if (id === 'usd') return 'Usd';
    return id.charAt(0).toUpperCase() + id.slice(1);
  }

  // ------------------------------------------------------------
  // Living Royal 24K Gold Stardust & Diamond Sparkles Engine
  // ------------------------------------------------------------
  function initLuxuryAnimatedCanvas() {
    const canvas = document.getElementById('luxuryCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const wrapper = canvas.parentElement || document.body;
    let width = 0, height = 0;
    let animId = null;
    let isVisible = true;

    function resize() {
      const rect = wrapper.getBoundingClientRect();
      width = canvas.width = rect.width || window.innerWidth;
      height = canvas.height = rect.height || window.innerHeight;
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Floating Golden Stardust Particles
    const count = Math.min(36, Math.max(18, Math.floor(width / 15)));
    const particles = [];
    const colors = ['#DEA637', '#FFE6A8', '#FFD700', '#F3CA7E', '#FFF2D1'];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.3,
        vy: - (Math.random() * 0.42 + 0.22),
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.015,
        phase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Diamond Starburst Sparkles
    const sparkles = [];
    function trySpawnSparkle() {
      if (sparkles.length < 5 && Math.random() < 0.06) {
        sparkles.push({
          x: Math.random() * (width - 60) + 30,
          y: Math.random() * (height - 60) + 30,
          maxSize: Math.random() * 14 + 10,
          rot: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          life: 0,
          maxLife: Math.floor(Math.random() * 60 + 55),
          isDiamond: Math.random() > 0.4
        });
      }
    }

    function drawSparkle(s) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);

      const progress = s.life / s.maxLife;
      const curve = Math.sin(progress * Math.PI);
      const curSize = s.maxSize * curve;
      const alpha = curve;

      const haloColor = s.isDiamond 
        ? 'rgba(255, 255, 255, ' + (alpha * 0.9) + ')' 
        : 'rgba(255, 235, 175, ' + (alpha * 0.95) + ')';

      ctx.fillStyle = haloColor;
      ctx.beginPath();
      ctx.ellipse(0, 0, curSize, curSize * 0.14, 0, 0, Math.PI * 2);
      ctx.ellipse(0, 0, curSize * 0.14, curSize, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(0, 0, curSize * 0.5, curSize * 0.08, Math.PI / 4, 0, Math.PI * 2);
      ctx.ellipse(0, 0, curSize * 0.08, curSize * 0.5, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, curSize * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 10;
      ctx.shadowColor = s.isDiamond ? '#FFFFFF' : '#FFD700';
      ctx.fill();

      ctx.restore();
    }

    function render() {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);

      // Dust particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.phase += p.pulseSpeed;
        const currentAlpha = Math.max(0.1, Math.min(0.9, p.alpha + Math.sin(p.phase) * 0.3));

        p.x += p.vx + Math.sin(p.phase * 0.6) * 0.25;
        p.y += p.vy;

        if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Diamond sparkles
      trySpawnSparkle();
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.life++;
        s.rot += s.rotSpeed;
        drawSparkle(s);
        if (s.life >= s.maxLife) {
          sparkles.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    }

    // Battery & CPU optimization: pause when tab is hidden
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        isVisible = false;
        if (animId) cancelAnimationFrame(animId);
      } else {
        isVisible = true;
        resize();
        animId = requestAnimationFrame(render);
      }
    });

    animId = requestAnimationFrame(render);
  }

})();
