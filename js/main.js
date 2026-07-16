// LUXE Jewelry — Main Application Logic
(function() {
  var C = window.SITE_CONFIG;
  if (!C) { console.error('SITE_CONFIG not found'); return; }

  var B = C.brand || {};
  var doc = document;

  // ---- i18n init ----
  var i18nCfg = C.i18n || {};
  var enabledLangs = i18nCfg.languages || ['en', 'zh'];
  var defaultLang = i18nCfg.defaultLanguage || 'en';

  function getStoredLang() { try { return localStorage.getItem('site_lang'); } catch(e) { return null; } }
  function setStoredLang(lang) { try { localStorage.setItem('site_lang', lang); } catch(e) {} }

  var currentLang = getStoredLang() || defaultLang;
  if (enabledLangs.indexOf(currentLang) === -1) { currentLang = enabledLangs[0] || 'en'; }

  function t(key, fallback) {
    var dict = I18N[currentLang] || I18N.en || {};
    return dict[key] !== undefined ? dict[key] : (fallback || key);
  }

  function l(val, fallbackKey) {
    if (val && typeof val === 'object') {
      if (val[currentLang] !== undefined) return val[currentLang];
      if (val[defaultLang] !== undefined) return val[defaultLang];
      var first = Object.keys(val)[0];
      return first !== undefined ? val[first] : t(fallbackKey, fallbackKey);
    }
    if (val !== undefined && val !== null && val !== '') return val;
    return t(fallbackKey, fallbackKey);
  }

  doc.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';

  // ---- Apply brand & SEO ----
  doc.title = l((C.seo||{}).title, 'navHome') || l(B.name, 'navHome') || '';
  var metaD = doc.querySelector('meta[name="description"]');
  if (metaD) metaD.content = l((C.seo||{}).description, '') || '';
  var metaK = doc.querySelector('meta[name="keywords"]');
  if (metaK) metaK.content = (C.seo||{}).keywords || '';
  var ogT = doc.querySelector('meta[property="og:title"]');
  if (ogT) ogT.content = l((C.seo||{}).title, '') || '';
  var ogD = doc.querySelector('meta[property="og:description"]');
  if (ogD) ogD.content = l((C.seo||{}).description, '') || '';
  var ogI = doc.querySelector('meta[property="og:image"]');
  if (ogI) ogI.content = (C.seo||{}).ogImage || '';
  var fav = doc.querySelector('link[rel="icon"]');
  if (fav && (C.seo||{}).favicon) fav.href = (C.seo||{}).favicon;
  doc.querySelector('meta[name="theme-color"]').content = B.primaryColor || '#C9A96E';

  if (B.primaryColor) doc.documentElement.style.setProperty('--color-primary', B.primaryColor);
  if (B.secondaryColor) doc.documentElement.style.setProperty('--color-dark', B.secondaryColor);
  if (B.bgColor) doc.documentElement.style.setProperty('--color-bg', B.bgColor);
  if (B.accentBg) doc.documentElement.style.setProperty('--color-accent-bg', B.accentBg);

  // ---- Navigation ----
  var navDefaultLabels = {
    home: t('navHome', 'Home'), products: t('navProducts', 'Collection'),
    about: t('navAbout', 'Our Story'), contact: t('navContact', 'Contact')
  };
  var navItems = C.navigation || [
    { id:'home', href:'#home' }, { id:'products', href:'#products' },
    { id:'about', href:'#about' }, { id:'contact', href:'#contact' }
  ];
  navItems.forEach(function(item) { item.label = l(item.label, item.id) || navDefaultLabels[item.id] || item.id; });

  var navLogo = doc.getElementById('navLogo');
  var brandNameResolved = l(B.name, 'navHome') || 'Brand';
  navLogo.textContent = brandNameResolved;
  if (B.logo) { navLogo.innerHTML = '<img src="'+B.logo+'" alt="'+brandNameResolved+'" style="height:34px;width:auto;">'; }

  var navLinksEl = doc.getElementById('navLinks');
  navItems.forEach(function(item) {
    var li = doc.createElement('li');
    li.innerHTML = '<a href="'+item.href+'">'+item.label+'</a>';
    navLinksEl.appendChild(li);
  });
  var navMobileEl = doc.getElementById('navMobile');
  navItems.forEach(function(item) {
    var a = doc.createElement('a');
    a.href = item.href; a.textContent = item.label;
    a.addEventListener('click', function() { closeMobileMenu(); });
    navMobileEl.appendChild(a);
  });

  // ---- Language Switcher ----
  function buildLangSwitcher() {
    var langCurrent = doc.getElementById('langCurrent');
    var langFlag = doc.getElementById('langFlag');
    var langLabel = doc.getElementById('langLabel');
    var langDropdown = doc.getElementById('langDropdown');
    var langSwitcher = doc.getElementById('langSwitcher');
    var meta = LANG_META[currentLang] || { flag: '🌐', label: currentLang };
    langFlag.textContent = meta.flag;
    langLabel.textContent = meta.label;
    langDropdown.innerHTML = '';
    enabledLangs.forEach(function(lang) {
      var lm = LANG_META[lang] || { flag: '🌐', label: lang };
      var opt = doc.createElement('div');
      opt.className = 'lang-option' + (lang === currentLang ? ' active' : '');
      opt.innerHTML = '<span class="flag">' + lm.flag + '</span><span>' + lm.label + '</span>';
      opt.addEventListener('click', function() {
        if (lang !== currentLang) { setStoredLang(lang); location.reload(); }
        langSwitcher.classList.remove('open');
      });
      langDropdown.appendChild(opt);
    });
    langCurrent.addEventListener('click', function(e) { e.stopPropagation(); langSwitcher.classList.toggle('open'); });
    doc.addEventListener('click', function() { langSwitcher.classList.remove('open'); });
  }
  buildLangSwitcher();

  // Mobile menu
  var navToggle = doc.getElementById('navToggle');
  navToggle.addEventListener('click', function() { navToggle.classList.toggle('active'); navMobileEl.classList.toggle('active'); navbar.classList.toggle('nav-menu-open'); });
  function closeMobileMenu() { navToggle.classList.remove('active'); navMobileEl.classList.remove('active'); navbar.classList.remove('nav-menu-open'); }

  // Scroll
  var navbar = doc.getElementById('navbar');
  var heroEl;
  window.addEventListener('scroll', function() {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  });

  // ---- Hero ----
  var hero = C.hero || {};
  heroEl = doc.querySelector('.hero');
  if (hero.image) { heroEl.style.backgroundImage = 'url('+hero.image+')'; doc.getElementById('heroFallback').style.display = 'none'; }
  doc.getElementById('heroTitle').textContent = l(hero.title, 'navHome') || B.name || '';
  doc.getElementById('heroSubtitle').textContent = l(hero.subtitle, 'footerRights') || B.slogan || '';
  var heroCta = doc.getElementById('heroCta');
  heroCta.textContent = l(hero.ctaText, 'heroCtaDefault');
  heroCta.href = hero.ctaLink || '#products';

  // ---- Parallax Hero Effect ----
  window.addEventListener('scroll', function() {
    if (heroEl) {
      var scrollPos = window.scrollY;
      var heroContent = heroEl.querySelector('.hero-content');
      if (heroContent && scrollPos < heroEl.offsetHeight) {
        heroContent.style.transform = 'translateY(' + (scrollPos * 0.4) + 'px)';
        heroContent.style.opacity = 1 - (scrollPos / heroEl.offsetHeight * 0.8);
      }
    }
  });

  // ---- Scroll Reveal Animation ----
  function initScrollReveal() {
    var reveals = doc.querySelectorAll('.reveal');
    if (!reveals.length || !('IntersectionObserver' in window)) return;

    var revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function(el, index) {
      el.style.transitionDelay = (index * 0.05) + 's';
      revealObserver.observe(el);
    });
  }

  // ---- Featured Banner ----
  doc.getElementById('featuredTitle').textContent = t('featuredTitle', 'The Art of Fine Jewelry');
  doc.getElementById('featuredSubtitle').textContent = t('featuredSubtitle', '');
  doc.getElementById('feature1').textContent = t('featureEthical', 'Ethically Sourced');
  doc.getElementById('feature2').textContent = t('featureHandcrafted', 'Handcrafted');
  doc.getElementById('feature3').textContent = t('featurePackaging', 'Luxury Packaging');
  doc.getElementById('feature4').textContent = t('featureWarranty', 'Lifetime Warranty');

  // ---- Products ----
  var products = C.products || [];
  var categories = C.productCategories || [];
  var allCatLabel = t('allCategory', 'All');
  var activeCategory = categories.length ? l(categories[0], 'allCategory') || allCatLabel : allCatLabel;
  var productGrid = doc.getElementById('productGrid');
  var filterBar = doc.getElementById('filterBar');
  var productsEmpty = doc.getElementById('productsEmpty');
  var productsSectionTitle = doc.querySelector('#products .section-title');
  if (productsSectionTitle) productsSectionTitle.textContent = l((C.productsMeta||{}).title, 'productsTitle');
  productsEmpty.textContent = t('productsEmpty', 'No products yet.');

  if (!products.length) {
    productsEmpty.style.display = 'block'; filterBar.style.display = 'none';
  } else {
    var allCats = categories.length ? categories.map(function(c){ return l(c, 'allCategory') || allCatLabel; }) : [allCatLabel];
    activeCategory = allCats[0];
    allCats.forEach(function(cat) {
      var btn = doc.createElement('button');
      btn.className = 'filter-btn' + (cat === activeCategory ? ' active' : '');
      btn.textContent = cat;
      btn.addEventListener('click', function() {
        activeCategory = cat;
        filterBar.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderProducts();
      });
      filterBar.appendChild(btn);
    });
    renderProducts();
  }

  function renderProducts() {
    productGrid.innerHTML = '';
    var filtered = activeCategory === allCatLabel ? products : products.filter(function(p) {
      var pCat = l(p.category, 'allCategory') || '';
      return pCat === activeCategory;
    });
    if (!filtered.length) { productsEmpty.style.display = 'block'; productGrid.style.display = 'none'; return; }
    productsEmpty.style.display = 'none'; productGrid.style.display = '';

    filtered.forEach(function(p, index) {
      var pName = l(p.name, 'imageError');
      var pDesc = p.description ? l(p.description, '') : '';
      var pCat = l(p.category, 'allCategory');
      var card = doc.createElement('div');
      card.className = 'product-card reveal';
      card.style.transitionDelay = (index * 0.08) + 's';
      card.innerHTML =
        '<div class="product-image-wrap">' +
          '<img src="'+p.image+'" alt="'+pName+'" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=img-error>'+t('imageError','Image')+'</div>\'">' +
          (pCat && pCat !== activeCategory ? '<span class="product-tag">'+pCat+'</span>' : '') +
          '<div class="product-quick-view">' + t('quickView', 'Quick View') + '</div>' +
        '</div>' +
        '<div class="product-info">' +
          '<div class="product-name">'+pName+'</div>' +
          (p.price ? '<div class="product-price">'+p.price+'</div>' : '') +
          (pDesc ? '<div class="product-desc">'+pDesc+'</div>' : '') +
        '</div>';
      productGrid.appendChild(card);
    });

    // Re-init reveal for new cards
    initScrollReveal();
  }

  // ---- About ----
  var about = C.about || {};
  doc.getElementById('aboutTitle').textContent = l(about.title, 'aboutTitle');
  var aboutContent = doc.getElementById('aboutContent');
  var paragraphs = about.paragraphs || [];
  if (!paragraphs.length) {
    aboutContent.innerHTML = '<p>' + (currentLang === 'zh' ? '暂无介绍内容' : 'No introduction yet.') + '</p>';
  } else {
    paragraphs.forEach(function(p) {
      var el = doc.createElement('p'); el.textContent = l(p, ''); aboutContent.appendChild(el);
    });
  }
  var aboutImgEl = doc.getElementById('aboutImage');
  if (about.image) {
    aboutImgEl.innerHTML = '<img src="'+about.image+'" alt="'+t('aboutTitle','About')+'" loading="lazy" onerror="this.innerHTML=\'<div class=about-placeholder>'+t('aboutTitle','About')+'</div>\'">';
  } else {
    aboutImgEl.innerHTML = '<div class="about-placeholder">'+t('aboutPlaceholder','About Image')+'</div>';
  }

  // About Stats
  doc.getElementById('statYears').textContent = t('statYears', '25+');
  doc.getElementById('statYearsLabel').textContent = t('statYearsLabel', 'Years of Craft');
  doc.getElementById('statDesigns').textContent = t('statDesigns', '10k+');
  doc.getElementById('statDesignsLabel').textContent = t('statDesignsLabel', 'Designs Created');
  doc.getElementById('statClients').textContent = t('statClients', '50k+');
  doc.getElementById('statClientsLabel').textContent = t('statClientsLabel', 'Happy Clients');

  // ---- Contact ----
  var contact = C.contact || {};
  var contactCards = doc.getElementById('contactCards');
  var hasAnyContact = false;
  var contactSectionTitle = doc.querySelector('#contact .section-title');
  if (contactSectionTitle) contactSectionTitle.textContent = l((C.contact||{}).title, 'contactTitle');

  // WhatsApp
  if (contact.whatsapp && contact.whatsapp.enabled) {
    hasAnyContact = true;
    var wa = doc.createElement('div'); wa.className = 'contact-card reveal';
    wa.innerHTML = '<div class="contact-card-icon whatsapp"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg></div>' +
      '<div class="contact-card-label">'+ l(contact.whatsapp.label, 'modalWhatsappTitle') +'</div>' +
      '<div class="contact-card-hint">'+ l(contact.whatsapp.hint, 'contactWhatsappHint') +'</div>';
    wa.addEventListener('click', function() {
      var phone = (contact.whatsapp.phone || '').replace(/[^0-9]/g, '');
      var msg = encodeURIComponent(l(contact.whatsapp.message, ''));
      window.open('https://wa.me/'+phone+(msg?'?text='+msg:''), '_blank');
    });
    contactCards.appendChild(wa);
    var floatWA = doc.getElementById('floatWA');
    floatWA.style.display = '';
    floatWA.href = 'https://wa.me/'+((contact.whatsapp.phone||'').replace(/[^0-9]/g,''))+(encodeURIComponent(l(contact.whatsapp.message,''))?'?text='+encodeURIComponent(l(contact.whatsapp.message,'')):'');
  }

  // WeChat
  if (contact.wechat && contact.wechat.enabled) {
    hasAnyContact = true;
    var wc = doc.createElement('div'); wc.className = 'contact-card reveal';
    wc.innerHTML = '<div class="contact-card-icon wechat"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10.5c0-.828.895-1.5 2-1.5s2 .672 2 1.5S11.105 12 10 12s-2-.672-2-1.5zm4 0c0-.828.895-1.5 2-1.5s2 .672 2 1.5-.895 1.5-2 1.5-2-.672-2-1.5zM9 14c-1.5 0-4 .8-4 2v1h10v-1c0-1.2-2.5-2-4-2h-2z" fill="currentColor"/></svg></div>' +
      '<div class="contact-card-label">'+ l(contact.wechat.label, 'modalWechatTitle') +'</div>' +
      '<div class="contact-card-hint">'+ l(contact.wechat.hint, 'contactWechatHint') +'</div>';
    wc.addEventListener('click', function() { openModal('wechat'); });
    contactCards.appendChild(wc);
  }

  // Website
  if (contact.website && contact.website.enabled && contact.website.url) {
    hasAnyContact = true;
    var wsBtn = doc.getElementById('contactWebsiteBtn');
    wsBtn.style.display = '';
    wsBtn.textContent = l(contact.website.label, 'contactWebsiteLabel');
    wsBtn.href = contact.website.url;
    if (contact.website.openNewTab !== false) { wsBtn.target = '_blank'; wsBtn.rel = 'noopener noreferrer'; }
  }

  // Site QR
  var siteQR = contact.siteQR || {};
  if (siteQR.enabled && siteQR.qrImage && siteQR.showOnPage !== false) {
    hasAnyContact = true;
    var sq = doc.createElement('div'); sq.className = 'contact-card reveal';
    sq.innerHTML = '<div class="contact-card-icon" style="background:linear-gradient(135deg,#FFF8E1,#FFE082);color:#FF6F00;"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13-2h-2v3h-3v2h3v3h2v-3h3v-2h-3z"/></svg></div>' +
      '<div class="contact-card-label">'+ l(siteQR.label, '') +'</div>' +
      '<div class="contact-card-hint">'+ l(siteQR.hint, '') +'</div>';
    sq.addEventListener('click', function() { openModal('siteqr'); });
    contactCards.appendChild(sq);
  }

  // Email
  if (contact.email && contact.email.enabled && contact.email.address) {
    hasAnyContact = true;
    var em = doc.createElement('div'); em.className = 'contact-card reveal';
    em.innerHTML = '<div class="contact-card-icon email"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg></div>' +
      '<div class="contact-card-label">'+ l(contact.email.label, 'contactEmailLabel') +'</div>' +
      '<div class="contact-card-hint">'+contact.email.address+'</div>';
    em.addEventListener('click', function() {
      window.location.href = 'mailto:'+contact.email.address+'?subject='+encodeURIComponent(t('contactEmailSubject','Inquiry'));
    });
    contactCards.appendChild(em);
  }

  if (!hasAnyContact) {
    if (contactSectionTitle) contactSectionTitle.style.display = 'none';
    doc.getElementById('contact').querySelector('.section-divider').style.display = 'none';
  }

  // ---- Footer ----
  doc.getElementById('footerBrandName').textContent = l(B.name, 'navHome') || '';
  doc.getElementById('footerSlogan').textContent = l(B.slogan, 'footerRights') || '';
  var year = new Date().getFullYear();
  doc.getElementById('footerCopyright').textContent = '\u00A9 '+year+' '+(l(B.name,'')||'')+'. '+t('footerRights','All rights reserved.');
  var footerLinks = doc.getElementById('footerLinks');
  navItems.forEach(function(item) {
    var a = doc.createElement('a');
    a.href = item.href; a.textContent = item.label;
    footerLinks.appendChild(a);
  });

  // ---- Modal ----
  var qrModal = doc.getElementById('qrModal');
  var modalTitle = doc.getElementById('modalTitle');
  var modalHint = doc.getElementById('modalHint');
  var modalQrContainer = doc.getElementById('modalQrContainer');
  var modalAction = doc.getElementById('modalAction');

  doc.getElementById('modalClose').addEventListener('click', closeModal);
  qrModal.addEventListener('click', function(e) { if (e.target === qrModal) closeModal(); });

  function openModal(type) {
    if (type === 'wechat') {
      modalTitle.textContent = l((contact.wechat||{}).modalTitle, 'modalWechatTitle');
      modalHint.textContent = l((contact.wechat||{}).modalHint, 'modalWechatHint');
      var qrImg = (contact.wechat||{}).qrImage;
      modalQrContainer.innerHTML = qrImg ? '<img class="modal-qr" src="'+qrImg+'" alt="QR" onerror="this.outerHTML=\'<div class=modal-qr-placeholder>'+t('modalWechatNoQR','QR')+'</div>\'">' : '<div class="modal-qr-placeholder">'+t('modalWechatNoQR','QR')+'</div>';
      modalAction.innerHTML = '';
    } else if (type === 'whatsapp') {
      modalTitle.textContent = l((contact.whatsapp||{}).modalTitle, 'modalWhatsappTitle');
      modalHint.textContent = l((contact.whatsapp||{}).modalHint, 'modalWhatsappHint');
      var qrImg = (contact.whatsapp||{}).qrImage;
      modalQrContainer.innerHTML = qrImg ? '<img class="modal-qr" src="'+qrImg+'" alt="QR" onerror="this.outerHTML=\'<div class=modal-qr-placeholder>'+t('modalWhatsappNoQR','QR')+'</div>\'">' : '<div class="modal-qr-placeholder">'+t('modalWhatsappNoQR','QR')+'</div>';
      var phone = ((contact.whatsapp||{}).phone||'').replace(/[^0-9]/g,'');
      var msg = encodeURIComponent((contact.whatsapp||{}).message||'');
      modalAction.innerHTML = '<a class="modal-btn whatsapp" href="https://wa.me/'+phone+(msg?'?text='+msg:'')+'" target="_blank" rel="noopener noreferrer">'+t('modalWhatsappBtn','Start Chat')+'</a>';
    } else if (type === 'siteqr') {
      modalTitle.textContent = l((contact.siteQR||{}).label, '');
      modalHint.textContent = l((contact.siteQR||{}).hint, '');
      var qrImg = (contact.siteQR||{}).qrImage;
      modalQrContainer.innerHTML = qrImg ? '<img class="modal-qr" src="'+qrImg+'" alt="QR" onerror="this.outerHTML=\'<div class=modal-qr-placeholder>QR</div>\'">' : '<div class="modal-qr-placeholder">QR</div>';
      modalAction.innerHTML = '';
    }
    qrModal.classList.add('active');
  }
  function closeModal() { qrModal.classList.remove('active'); }

  // ---- IntersectionObserver for Nav Active ----
  var sections = navItems.map(function(item) { return doc.querySelector(item.href); }).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinksEl.querySelectorAll('a').forEach(function(a) { a.classList.toggle('active', a.getAttribute('href') === '#'+id); });
        }
      });
    }, { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' });
    sections.forEach(function(s) { navObserver.observe(s); });
  }

  // ---- Init Scroll Reveal ----
  initScrollReveal();

  // ---- Keyboard ----
  doc.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });

  // ---- Sparkles visibility toggle ----
  var sparklesContainer = doc.getElementById('sparklesContainer');
  if (sparklesContainer && window.scrollY > 1000) {
    sparklesContainer.style.opacity = '0.5';
  }
  window.addEventListener('scroll', function() {
    if (sparklesContainer) {
      var op = Math.min(0.6, window.scrollY / 2000);
      sparklesContainer.style.opacity = op;
    }
  });
})();
