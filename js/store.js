/* ==========================================================================
   STORE 2025 PRO — Interaksi
   Fitur: Filter + indikator, reveal, quick view (modal), tilt, lazyload
   ========================================================================== */
(() => {
  const $  = (s, sc=document) => sc.querySelector(s);
  const $$ = (s, sc=document) => [...sc.querySelectorAll(s)];

  /* -----------------------------
   * 0) UTIL
   * ---------------------------*/
  const raf = (fn) => requestAnimationFrame(fn);
  const inPx = (n) => `${Math.max(0, Math.round(n))}px`;

  /* -----------------------------
   * 1) FILTER + INDIKATOR
   * ---------------------------*/
  const toolbar   = $('.store__toolbar');
  const indicator = $('.store__toolbar-ind');
  const chips     = $$('.store__filter-btn', toolbar || document);
  const cards     = $$('.store-card');

  function moveIndicator(btn) {
    if (!indicator || !toolbar || !btn) return;
    const tb = toolbar.getBoundingClientRect();
    const r  = btn.getBoundingClientRect();
    const left = (r.left - tb.left) + toolbar.scrollLeft;
    raf(() => {
      indicator.style.width = inPx(r.width);
      indicator.style.transform = `translateX(${inPx(left)})`;
    });
  }

  function showCard(card) {
    card.classList.remove('is-hidden');
    raf(() => card.classList.remove('is-hiding'));
  }
  function hideCard(card) {
    card.classList.add('is-hiding');
    setTimeout(() => card.classList.add('is-hidden'), 180); // sinkron dgn CSS
  }

  function matchCat(card, key) {
    if (key === 'all') return true;
    const cats = (card.dataset.cat || card.dataset.cats || '')
      .toLowerCase()
      .split(/[,\s]+/)
      .filter(Boolean);
    return cats.includes(key);
  }

  function applyFilter(key, btn) {
    chips.forEach(c => c.classList.toggle('is-active', c === btn));
    moveIndicator(btn);
    cards.forEach(card => matchCat(card, key)
      ? showCard(card)
      : hideCard(card)
    );
  }

  function initFilter() {
    if (!chips.length) return;
    // aktif awal
    let active = $('.store__filter-btn.is-active') || chips[0];
    active.classList.add('is-active');
    moveIndicator(active);

    // dari hash ?filter=care atau #filter=care
    const hash = (location.search + location.hash).toLowerCase();
    const m = hash.match(/(?:\?|#|&)(?:filter|cat|kategori)=([\w-]+)/);
    if (m) {
      const want = m[1];
      const btn = chips.find(b => (b.dataset.filter || '').toLowerCase() === want);
      if (btn) active = btn;
    }
    applyFilter((active.dataset.filter || 'all').toLowerCase(), active);

    // klik + keyboard
    chips.forEach(btn => {
      const key = (btn.dataset.filter || 'all').toLowerCase();
      btn.addEventListener('click', () => applyFilter(key, btn));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          applyFilter(key, btn);
        }
      });
    });

    // reposition saat resize/scroll toolbar
    ['resize', 'orientationchange'].forEach(ev =>
      window.addEventListener(ev, () => moveIndicator($('.store__filter-btn.is-active')))
    );
    toolbar && toolbar.addEventListener('scroll', () =>
      moveIndicator($('.store__filter-btn.is-active'))
    );
  }

  /* -----------------------------
   * 2) REVEAL dgn IntersectionObserver
   * ---------------------------*/
  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      cards.forEach(c => c.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({isIntersecting, target}) => {
        if (isIntersecting) {
          target.classList.add('is-revealed');
          io.unobserve(target);
        }
      });
    }, {threshold: 0.15, rootMargin: '80px 0px'});
    cards.forEach(c => io.observe(c));
  }

  /* -----------------------------
   * 3) LAZYLOAD <img> (fallback)
   * ---------------------------*/
  function initLazy() {
    $$('img.store-card__thumb').forEach(img => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      // jika src di data-src
      if (!img.src && img.dataset.src) img.src = img.dataset.src;
      img.decoding = 'async';
    });
  }

  /* -----------------------------
   * 4) QUICK VIEW MODAL
   * ---------------------------*/
  let qv, qvCard, qvBackdrop, qvClose, lastFocused;

  function ensureQv() {
    qv = $('.qv-pop');
    if (qv) {
      qvCard = $('.qv-card', qv);
      qvBackdrop = $('.qv-backdrop', qv);
      qvClose = $('.qv-close', qv);
      return;
    }
    // bikin kalau belum ada
    qv = document.createElement('div');
    qv.className = 'qv-pop';
    qv.setAttribute('hidden', '');
    qv.innerHTML = `
      <div class="qv-backdrop" aria-hidden="true"></div>
      <div class="qv-card" role="dialog" aria-modal="true" aria-labelledby="qv-title">
        <button class="qv-close" aria-label="Tutup"><span class="qv-x"></span></button>
        <div class="qv-head">
          <img class="qv-thumb" alt="">
          <h3 class="qv-title" id="qv-title"></h3>
        </div>
        <div class="qv-body">
          <p class="qv-desc"></p>
          <div class="qv-price"></div>
        </div>
        <div class="qv-actions">
          <a class="btn-default" href="#" role="button">Tambah ke Keranjang</a>
          <button class="btn-ghost" type="button">Tutup</button>
        </div>
      </div>`;
    document.body.appendChild(qv);
    qvCard = $('.qv-card', qv);
    qvBackdrop = $('.qv-backdrop', qv);
    qvClose = $('.qv-close', qv);
  }

  function fillQvFromCard(card) {
    const img   = $('.store-card__thumb', card);
    const ttl   = $('.store-card__title', card);
    const desc  = $('.store-card__desc', card);
    const price = $('.store-card__price', card);

    $('.qv-thumb', qv).src = img?.currentSrc || img?.src || '';
    $('.qv-thumb', qv).alt = (img?.alt || ttl?.textContent || 'Produk');
    $('.qv-title', qv).textContent = (ttl?.textContent || 'Produk');
    $('.qv-desc',  qv).textContent = (desc?.textContent || '—');
    $('.qv-price', qv).textContent = (price?.textContent || '');
  }

  function trapFocus(e) {
    if (!qv.classList.contains('is-open')) return;
    const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', qvCard)
      .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    } else if (e.key === 'Escape') {
      closeQv();
    }
  }

  function lockScroll(lock) {
    const html = document.documentElement;
    if (lock) {
      const sbw = window.innerWidth - html.clientWidth;
      html.style.overflowY = 'hidden';
      if (sbw > 0) html.style.paddingRight = sbw + 'px';
    } else {
      html.style.overflowY = '';
      html.style.paddingRight = '';
    }
  }

  function openQv(card) {
    ensureQv();
    fillQvFromCard(card);
    lastFocused = document.activeElement;
    qv.removeAttribute('hidden');
    // ukuran aman di mobile tinggi pendek
    qvCard.style.maxHeight = (window.innerHeight - 24) + 'px';
    raf(() => qv.classList.add('is-open'));
    lockScroll(true);
    // fokus
    setTimeout(() => ($('button, [href], [tabindex]:not([tabindex="-1"])', qvCard) || qvClose)?.focus(), 30);
    document.addEventListener('keydown', trapFocus);
  }

  function closeQv() {
    if (!qv) return;
    qv.classList.remove('is-open');
    lockScroll(false);
    setTimeout(() => qv.setAttribute('hidden', ''), 220);
    document.removeEventListener('keydown', trapFocus);
    lastFocused && lastFocused.focus?.();
  }

  function initQv() {
    ensureQv();
    // delegasi: apapun yg punya data-qv-open di dalam .store-card
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-qv-open], .js-qv');
      if (trigger) {
        const card = e.target.closest('.store-card');
        if (card) {
          e.preventDefault();
          openQv(card);
        }
      }
    });
    qvBackdrop.addEventListener('click', closeQv);
    qvClose.addEventListener('click', closeQv);
    $('.qv-actions .btn-ghost', qv).addEventListener('click', closeQv);
    window.addEventListener('resize', () => {
      if (qv && qv.classList.contains('is-open')) {
        qvCard.style.maxHeight = (window.innerHeight - 24) + 'px';
      }
    });
  }

  /* -----------------------------
   * 5) TILT halus (opsional)
   * ---------------------------*/
  function initTilt() {
    const tiltCards = $$('.store-card[data-tilt="1"]');
    if (!tiltCards.length || window.matchMedia('(pointer: coarse)').matches) return;

    tiltCards.forEach(card => {
      const img = $('.store-card__thumb', card);
      if (!img) return;
      const max = 6; // derajat
      function onMove(e) {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) - 0.5;
        const y = ((e.clientY - r.top) / r.height) - 0.5;
        img.style.transform = `perspective(700px) rotateX(${(-y*max).toFixed(2)}deg) rotateY(${(x*max).toFixed(2)}deg) scale(1.03)`;
      }
      function reset() {
        img.style.transform = '';
      }
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', reset);
    });
  }

  /* -----------------------------
   * INIT
   * ---------------------------*/
  document.addEventListener('DOMContentLoaded', () => {
    initFilter();
    initReveal();
    initLazy();
    initQv();
    initTilt();
  });
})();
