// ============================================================
// LUXOR JEWELLERY — Digital Business Card Application Logic
// Features: Bilingual (AR/EN), Native Browser PWA, Modals & Sharing
// ============================================================

(function () {
  'use strict';

  let currentLang = 'en';

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
    setText('goldMarketTag', isAr ? 'أسعار الصاغة في مصر' : 'Egyptian Gold Market');
    setAttr('goldRefreshBtn', 'title', isAr ? 'تحديث الأسعار الآن' : 'Refresh Gold Rates');
    setAttr('goldRefreshBtn', 'aria-label', isAr ? 'تحديث أسعار الذهب الآن' : 'Refresh Gold Rates Now');
    updateGoldToggleBtnText(isAr);
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
  // ------------------------------------------------------------
  // Modal Handlers (Share, Services, Live Gold Rates Page)
  // ------------------------------------------------------------
  function setupModals() {
    function checkModalsClosed() {
      const active = document.querySelector('.modal-backdrop.active');
      if (!active) {
        document.body.classList.remove('modal-open');
      }
    }

    window.openShareModal = function (e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      const qrImg = document.getElementById('modalQrImg');
      if (qrImg && qrImg.dataset.src && qrImg.src !== qrImg.dataset.src) {
        qrImg.src = qrImg.dataset.src;
      }
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
  // Native PWA Registration & Auto Cache Purging (Instant Mobile Turbo)
  // ------------------------------------------------------------
  function initPwa() {
    try {
      const CURRENT_VER = 'luxor-v7.0-newlinks';
      if (localStorage.getItem('luxor_cache_ver') !== CURRENT_VER) {
        localStorage.setItem('luxor_cache_ver', CURRENT_VER);
        if ('caches' in window) {
          caches.keys().then(function(names) {
            names.forEach(function(name) {
              caches.delete(name);
            });
          });
        }
      }
    } catch (e) {}

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js')
          .then(function (reg) {
            if (!reg) return;
            reg.update();
            if (reg.waiting) {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            reg.addEventListener('updatefound', function () {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', function () {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                  }
                });
              }
            });
          })
          .catch(function (err) {
            console.log('SW Note:', err);
          });

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', function () {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });
      });
    }
  }

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

  // ------------------------------------------------------------
  // Live Gold Prices Controller (لحظة بلحظة)
  // ------------------------------------------------------------
  let latestGoldData = null;
  let isGoldDrawerOpen = false;

  function initGoldPrices() {
    const refreshBtn = document.getElementById('goldRefreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        refreshBtn.classList.add('is-spinning');
        fetchLiveGoldPrices(function () {
          setTimeout(function () {
            refreshBtn.classList.remove('is-spinning');
          }, 600);
        }, true);
      });
    }

    const drawerBtn = document.getElementById('goldToggleDrawerBtn');
    if (drawerBtn) {
      drawerBtn.addEventListener('click', function () {
        isGoldDrawerOpen = !isGoldDrawerOpen;
        const drawer = document.getElementById('goldDetailsDrawer');
        if (drawer) {
          drawer.style.display = isGoldDrawerOpen ? 'flex' : 'none';
        }
        drawerBtn.setAttribute('aria-expanded', isGoldDrawerOpen ? 'true' : 'false');
        updateGoldToggleBtnText(currentLang === 'ar');
      });
    }

    // Initial fetch
    fetchLiveGoldPrices();

    // Auto-refresh every 60 seconds
    setInterval(fetchLiveGoldPrices, 60000);
  }

  function updateGoldToggleBtnText(isAr) {
    const toggleText = document.getElementById('goldToggleText');
    if (toggleText) {
      if (isGoldDrawerOpen) {
        toggleText.textContent = isAr ? 'إخفاء باقي الأعيرة' : 'Hide Other Calibers';
      } else {
        toggleText.textContent = isAr ? 'عرض باقي الأعيرة والأسعار' : 'View All Calibers & Rates';
      }
    }
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

  function fetchLiveGoldPrices(doneCallback, forceRefresh) {
    const apiUrl = forceRefresh ? ('/api/gold-prices?t=' + Date.now()) : '/api/gold-prices';
    const fallbackUrl = forceRefresh ? ('./gold-prices.json?t=' + Date.now()) : './gold-prices.json';

    // Instant render from session storage if recent (< 60s) AND not forceRefresh
    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem('luxor_gold_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (Date.now() - (parsed._cachedAt || 0) < 60000)) {
            handleGoldDataSuccess(parsed);
            if (doneCallback) doneCallback();
            return;
          }
        }
      } catch (e) {}
    }

    fetch(apiUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('API status ' + res.status);
        return res.json();
      })
      .then(function (data) {
        try {
          data._cachedAt = Date.now();
          sessionStorage.setItem('luxor_gold_cache', JSON.stringify(data));
        } catch (e) {}
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

      if (buyEl) buyEl.textContent = Number(item.buy).toLocaleString('en-US');
      if (sellEl) sellEl.textContent = Number(item.sell).toLocaleString('en-US');

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

})();
