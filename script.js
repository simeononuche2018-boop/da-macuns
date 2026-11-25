/* DA MaCUNS: shared behaviour for index.html and menu.html (vanilla JS, no dependencies) */
(function () {
  'use strict';

  /* ---------- Product catalogue (single source of truth for the cart) ---------- */
  var PRODUCTS = {
    'party-jollof':   { name: 'Party Jollof Combo',     price: 4000, img: 'images/party-jollof.jpg',      rating: '5.0 (912 Reviews)', cats: ['combos', 'rice'] },
    'smoothie':       { name: 'DA MaCUNS Smoothie',     price: 1500, img: 'images/smoothie.jpg',          rating: '5.0 (902 Reviews)', cats: ['smoothies'] },
    'poundo-egusi':   { name: 'Poundo & Egusi Combo',   price: 4200, img: 'images/poundo-egusi.jpg',      rating: '4.9 (612 Reviews)', cats: ['combos', 'swallow'] },
    'veg-jollof':     { name: 'Vegetable Jollof Combo', price: 4000, img: 'images/vegetable-jollof-orange-juice.jpg',  rating: '5.0 (832 Reviews)', cats: ['combos', 'rice'] },
    'orange-smoothie':{ name: 'DA Orange Smoothie',     price: 1500, img: 'images/orange-smoothie-placeholder.jpg', rating: '4.6 (580 Reviews)', cats: ['smoothies'] },
    'smoothie-3000':  { name: 'DA MaCUNS Smoothie',     price: 3000, img: 'images/smoothie.jpg',          rating: '5.0 (901 Reviews)', cats: ['smoothies'] }
  };
  var ZONES = { '1': { name: 'Uni Abuja Main Gate', mins: 20 }, '2': { name: 'Gwagwalada Central', mins: 30 }, '3': { name: 'Phase 3, Gwagwalada', mins: 25 } };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var naira = function (n) { return '₦' + n.toLocaleString('en-NG'); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- Safe session storage (cart survives moving between pages) ---------- */
  var store = {
    get: function () { try { return JSON.parse(sessionStorage.getItem('damacuns-cart') || '{}'); } catch (e) { return window.__cart || {}; } },
    set: function (v) { try { sessionStorage.setItem('damacuns-cart', JSON.stringify(v)); } catch (e) { window.__cart = v; } }
  };
  var cart = store.get();

  /* ---------- Toast ---------- */
  var toastEl = $('#toast'), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  /* ---------- Sticky header shadow + mobile nav ---------- */
  var header = $('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var navToggle = $('#nav-toggle'), navLinks = $('#nav-links');
  function closeNav() { if (!navLinks) return; navLinks.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); navToggle.setAttribute('aria-label', 'Open menu'); }
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    navLinks.addEventListener('click', function (e) { if (e.target.closest('a')) closeNav(); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.nav') ) closeNav(); });
  }

  /* ---------- Overlay / drawer / modals ---------- */
  var overlay = $('#overlay'), drawer = $('#cart-drawer');
  var openLayer = null;
  function openPanel(el) {
    closePanels();
    el.classList.add('open'); overlay.classList.add('show'); openLayer = el;
    document.body.style.overflow = 'hidden';
    var f = el.querySelector('button, input, select, a'); if (f) setTimeout(function () { f.focus(); }, 60);
  }
  function closePanels() {
    $$('.drawer.open, .modal.open').forEach(function (p) { p.classList.remove('open'); });
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = ''; openLayer = null;
  }
  if (overlay) overlay.addEventListener('click', closePanels);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanels(); });
  document.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closePanels(); });

  /* ---------- Cart ---------- */
  function cartTotals() {
    var count = 0, total = 0;
    Object.keys(cart).forEach(function (id) { if (PRODUCTS[id]) { count += cart[id]; total += cart[id] * PRODUCTS[id].price; } });
    return { count: count, total: total };
  }
  function renderCart() {
    var t = cartTotals();
    $$('[data-cart-count]').forEach(function (el) { el.textContent = t.count; el.dataset.zero = String(t.count === 0); });
    var body = $('#cart-body'); if (!body) return;
    var ids = Object.keys(cart).filter(function (id) { return PRODUCTS[id] && cart[id] > 0; });
    if (!ids.length) {
      body.innerHTML = '<div class="cart-empty"><strong>Your cart is empty</strong>Add a combo or smoothie to get started.</div>';
    } else {
      body.innerHTML = ids.map(function (id) {
        var p = PRODUCTS[id];
        return '<div class="cart-item" data-id="' + id + '"><img src="' + p.img + '" alt="">' +
          '<div><h3>' + esc(p.name) + '</h3><span class="price">' + naira(p.price * cart[id]) + '</span></div>' +
          '<div class="stepper" role="group" aria-label="Quantity for ' + esc(p.name) + '"><button data-dec aria-label="Decrease">−</button><output>' + cart[id] + '</output><button data-inc aria-label="Increase">+</button></div>' +
          '<button class="remove-link" data-remove>Remove</button></div>';
      }).join('');
    }
    var sub = $('#cart-subtotal'), tot = $('#cart-total'), btn = $('#checkout-btn');
    if (sub) sub.textContent = naira(t.total);
    if (tot) tot.textContent = naira(t.total);
    if (btn) btn.disabled = t.count === 0;
  }
  function setQty(id, qty) {
    if (qty <= 0) delete cart[id]; else cart[id] = Math.min(qty, 20);
    store.set(cart); renderCart();
  }
  function addToCart(id, qty) {
    qty = qty || 1;
    cart[id] = Math.min((cart[id] || 0) + qty, 20);
    store.set(cart); renderCart();
    $$('[data-cart-count]').forEach(function (el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); });
    toast('Added ' + PRODUCTS[id].name + (qty > 1 ? ' ×' + qty : '') + ' to cart');
  }
  var cartBody = $('#cart-body');
  if (cartBody) cartBody.addEventListener('click', function (e) {
    var row = e.target.closest('.cart-item'); if (!row) return;
    var id = row.dataset.id;
    if (e.target.closest('[data-inc]')) setQty(id, cart[id] + 1);
    else if (e.target.closest('[data-dec]')) setQty(id, cart[id] - 1);
    else if (e.target.closest('[data-remove]')) { setQty(id, 0); toast('Removed ' + PRODUCTS[id].name); }
  });
  $$('[data-open-cart]').forEach(function (b) { b.addEventListener('click', function () { renderCart(); openPanel(drawer); }); });

  /* ---------- Quick view modal (card "View" button) ---------- */
  var qv = $('#quick-view'), qvId = null, qvQty = 1;
  function openQuick(id) {
    var p = PRODUCTS[id]; if (!p || !qv) return;
    qvId = id; qvQty = 1;
    $('#qv-img').src = p.img; $('#qv-img').alt = p.name;
    $('#qv-name').textContent = p.name;
    $('#qv-rating').textContent = '★ ' + p.rating;
    $('#qv-price').textContent = naira(p.price);
    $('#qv-qty').textContent = qvQty;
    openPanel(qv);
  }
  if (qv) {
    $('#qv-dec').addEventListener('click', function () { qvQty = Math.max(1, qvQty - 1); $('#qv-qty').textContent = qvQty; });
    $('#qv-inc').addEventListener('click', function () { qvQty = Math.min(20, qvQty + 1); $('#qv-qty').textContent = qvQty; });
    $('#qv-add').addEventListener('click', function () { addToCart(qvId, qvQty); closePanels(); });
  }
  document.addEventListener('click', function (e) {
    var v = e.target.closest('[data-view]'); if (v) openQuick(v.dataset.view);
  });

  /* ---------- Menu filter + live search ---------- */
  var grid = $('#menu-grid');
  if (grid) {
    var cards = $$('.card', grid), pills = $$('.pill'), search = $('#search'), count = $('#count'), empty = $('#empty');
    var current = null, expanded = false;
    var viewAll = $('#view-all');
    if (viewAll) viewAll.addEventListener('click', function (e) {
      expanded = !expanded;                 // toggle: 4 cards <-> all 6 cards
      viewAll.textContent = expanded ? 'Show Less' : 'View Full Menu';
      viewAll.setAttribute('aria-expanded', String(expanded));
      var go = $('#go-menu'); if (go) go.hidden = !expanded;
      apply();
      if (!expanded) { var sec = $('#menu'); if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
    var apply = function () {
      var q = search ? search.value.trim().toLowerCase() : '', shown = 0;
      cards.forEach(function (card) {
        var p = PRODUCTS[card.dataset.id];
        var inCat = !current || p.cats.indexOf(current) !== -1;
        var inQ = !q || p.name.toLowerCase().indexOf(q) !== -1;
        var extraHidden = card.classList.contains('extra') && !expanded && !current;
        card.hidden = !(inCat && inQ) || extraHidden; if (!card.hidden) shown++;
      });
      if (count) count.textContent = shown + (shown === 1 ? ' item' : ' items');
      if (empty) empty.hidden = shown !== 0;
    };
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var same = current === pill.dataset.filter;
        current = same ? null : pill.dataset.filter;   // click again to clear
        pills.forEach(function (p) { var on = p.dataset.filter === current; p.classList.toggle('is-active', on); p.setAttribute('aria-pressed', String(on)); });
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);
    var form = $('#search-form'); if (form) form.addEventListener('submit', function (e) { e.preventDefault(); apply(); });
    apply();
  }

  /* ---------- Checkout (demo: no payment, no backend) ---------- */
  var co = $('#checkout-modal');
  var checkoutBtn = $('#checkout-btn');
  if (co && checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
      if (!cartTotals().count) return;
      $('#co-form').hidden = false; $('#co-success').hidden = true;
      $('#co-summary').textContent = cartTotals().count + ' item(s) · ' + naira(cartTotals().total);
      openPanel(co);
    });
    var coForm = $('#co-form');
    coForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      var name = $('#co-name'), phone = $('#co-phone'), area = $('#co-area');
      [['#co-name', name.value.trim().length >= 2, 'Please enter your name.'],
       ['#co-phone', /^[+0-9][0-9 ()-]{6,}$/.test(phone.value.trim()), 'Enter a valid phone number.'],
       ['#co-area', !!area.value, 'Choose your delivery area.']].forEach(function (c) {
        var err = $(c[0]).parentNode.querySelector('.err'); err.textContent = c[1] ? '' : c[2]; if (!c[1]) ok = false;
      });
      if (!ok) return;
      var z = ZONES[area.value], t = cartTotals();
      $('#co-order').textContent = 'DM' + String(Date.now()).slice(-6);
      $('#co-eta').textContent = z.mins + ' min to ' + z.name;
      $('#co-paid').textContent = naira(t.total);
      coForm.hidden = true; $('#co-success').hidden = false;
      cart = {}; store.set(cart); renderCart();
    });
  }

  /* ---------- Delivery zones + map ---------- */
  var zones = $$('.zone'), note = $('#map-note');
  if (zones.length) {
    var pinPos = { '1': [120, 250], '2': [340, 190], '3': [430, 305] };
    var rider = $('#rider'), eta = $('#map-eta');
    var selectZone = function (id) {
      zones.forEach(function (z) { z.classList.toggle('is-active', z.dataset.zone === id); });
      $$('.pin').forEach(function (pin) {
        var on = pin.dataset.pin === id, c = pin.querySelectorAll('circle');
        c[0].setAttribute('fill', on ? '#FFA000' : '#1B5E20'); c[0].setAttribute('opacity', on ? '1' : '.35');
      });
      var z = ZONES[id];
      if (note) note.textContent = z.name + ' · ' + z.mins + ' min';
      if (eta) eta.textContent = 'ETA ' + z.mins + ' min';
      if (rider) rider.setAttribute('transform', 'translate(' + pinPos[id][0] + ' ' + pinPos[id][1] + ')');
    };
    zones.forEach(function (z) { z.addEventListener('click', function () { selectZone(z.dataset.zone); }); });
    $$('.pin').forEach(function (pin) { pin.style.cursor = 'pointer'; pin.addEventListener('click', function () { selectZone(pin.dataset.pin); }); });
    selectZone('1');
  }

  /* ---------- Animated counters ---------- */
  function runCounter(el) {
    var end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length, suf = el.dataset.suffix || '', start = parseFloat(el.dataset.from || 0);
    var t0 = null, dur = 1400;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (start + (end - start) * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Reveal on scroll + counters ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof window.IntersectionObserver === 'function' && !reduce) {
    var revealed = [];
    var showEl = function (el) {
      if (revealed.indexOf(el) !== -1) return;
      revealed.push(el);
      el.classList.add('in');
      $$('[data-count]', el).forEach(runCounter);
      if (el.hasAttribute('data-count')) runCounter(el);
      io.unobserve(el);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) showEl(en.target); });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    var targets = $$('.reveal, [data-count-wrap]');
    targets.forEach(function (el) { io.observe(el); });
    /* Safety net: also reveal anything that is inside the window height (covers resize, full-page screenshots, print) */
    var sweep = function () { targets.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) showEl(el); }); };
    window.addEventListener('resize', sweep);
    window.addEventListener('load', sweep);
    window.addEventListener('beforeprint', function () { targets.forEach(showEl); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
    $$('[data-count]').forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
  }

  /* ---------- Testimonials carousel (auto-scroll + dots) ---------- */
  var track = $('#track');
  if (track) {
    var slides = $$('#track > *'), dotsWrap = $('#dots'), idx = 0, timer;
    var perView = function () { return window.innerWidth <= 720 ? 1 : window.innerWidth <= 1024 ? 2 : 3; };
    var maxIdx = function () { return Math.max(0, slides.length - perView()); };
    slides.forEach(function (_, i) { var b = document.createElement('button'); b.setAttribute('aria-label', 'Show review ' + (i + 1)); b.addEventListener('click', function () { go(i, true); }); dotsWrap.appendChild(b); });
    var dots = $$('button', dotsWrap);
    function paint() { dots.forEach(function (d, i) { d.classList.toggle('on', i === idx); d.hidden = i > maxIdx(); }); }
    function go(i, user) {
      idx = Math.max(0, Math.min(i, maxIdx()));
      track.scrollTo({ left: slides[idx].offsetLeft - slides[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
      paint(); if (user) restart();
    }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(idx >= maxIdx() ? 0 : idx + 1); }, 4500); }
    track.addEventListener('scroll', function () {
      var w = slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth;
      var i = Math.round(track.scrollLeft / w); if (i !== idx) { idx = Math.min(i, maxIdx()); paint(); }
    }, { passive: true });
    track.addEventListener('pointerdown', function () { clearInterval(timer); });
    track.addEventListener('mouseenter', function () { clearInterval(timer); });
    track.addEventListener('mouseleave', restart);
    window.addEventListener('resize', function () { go(Math.min(idx, maxIdx())); });
    paint(); restart();
  }

  /* ---------- Misc buttons: no dead links ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-toast]'); if (t) { e.preventDefault(); toast(t.dataset.toast); }
    var f = e.target.closest('[data-open-faq]'); if (f) { e.preventDefault(); var m = $('#faq-modal'); if (m) openPanel(m); }
  });

  /* ---------- Hero image slider (auto-slide, dots, pause on hover) ---------- */
  var heroSlider = $('#hero-slider');
  if (heroSlider) {
    var hs = $$('.slide', heroSlider), hdots = $$('.hero-dots button', heroSlider), hi = 0, ht;
    var showHero = function (i) {
      hi = (i + hs.length) % hs.length;
      hs.forEach(function (s, k) { s.classList.toggle('is-active', k === hi); });
      hdots.forEach(function (d, k) { d.classList.toggle('on', k === hi); d.setAttribute('aria-current', k === hi ? 'true' : 'false'); });
    };
    var startHero = function () { clearInterval(ht); if (!reduce) ht = setInterval(function () { showHero(hi + 1); }, 4000); };
    hdots.forEach(function (d, k) { d.addEventListener('click', function () { showHero(k); startHero(); }); });
    heroSlider.addEventListener('mouseenter', function () { clearInterval(ht); });
    heroSlider.addEventListener('mouseleave', startHero);
    showHero(0); startHero();
  }

  /* init */
  renderCart();
})();
