/* social-proof.js
   - Aktifkan animasi bintang saat terlihat (IntersectionObserver)
   - Tombol Like (toggle + update angka; dukung format "1.2k")
   - Tombol Share (Web Share API → fallback copy URL, termasuk non-HTTPS)
   - Hormati prefers-reduced-motion
*/
(() => {
  const onReady = (fn) =>
    (document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn, { once: true })
      : fn());

  onReady(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('.hero-2025 .hero-proof').forEach((proof) => {
      const starsWrap = proof.querySelector('.stars');
      const likeBtn   = proof.querySelector('.like-btn');
      const shareBtn  = proof.querySelector('.share-btn');

      // ===== 1) BINTANG: hidupkan animasi saat terlihat
      if (starsWrap && !prefersReduced && !starsWrap.classList.contains('is-animated')) {
        const io = new IntersectionObserver((entries, obs) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              starsWrap.classList.add('is-animated');
              obs.disconnect();
              break;
            }
          }
        }, {
          root: null,
          rootMargin: '0px 0px -10% 0px',
          threshold: [0.25, 0.5]
        });
        io.observe(starsWrap);
      }

      // ===== 3) SHARE: Web Share API → clipboard → execCommand (fallback)
      if (shareBtn) {
        const label = shareBtn.querySelector('.label');
        const original = label?.textContent || 'Share';

        shareBtn.addEventListener('click', async () => {
          const payload = {
            title: document.title || 'Adam jr | Hair Studio',
            text: 'Cek Adam jr | Hair Studio',
            url: location.href
          };
          try {
            if (navigator.share && typeof navigator.share === 'function') {
              await navigator.share(payload);
            } else if (navigator.clipboard && window.isSecureContext) {
              await navigator.clipboard.writeText(payload.url);
            } else {
              // Fallback lama: execCommand (untuk http / file:)
              const ta = document.createElement('textarea');
              ta.value = payload.url;
              ta.setAttribute('readonly', '');
              ta.style.position = 'absolute';
              ta.style.left = '-9999px';
              document.body.appendChild(ta);
              ta.select();
              document.execCommand('copy');
              document.body.removeChild(ta);
            }
            // feedback singkat
            if (label) label.textContent = 'Terkirim';
            shareBtn.classList.add('shared');
            setTimeout(() => {
              shareBtn.classList.remove('shared');
              if (label) label.textContent = original;
            }, 1400);
          } catch {
            // user batal → diamkan
          }
        });
      }
    });
  });
})();


(() => {
  const wrap = document.querySelector('.hero-2025 .social-actions');
  if (!wrap) return;

  // pastikan tombol komentar punya class spesifik
  wrap.querySelectorAll('.icon-btn').forEach(btn => {
    if (!btn.classList.contains('like-btn') && !btn.classList.contains('share-btn')) {
      const isComment =
        (btn.getAttribute('href') || '').includes('#ulasan') ||
        (btn.ariaLabel || '').toLowerCase().includes('komentar') ||
        (btn.textContent || '').toLowerCase().includes('komentar');
      if (isComment) btn.classList.add('comment-btn');
    }
  });

  const likeBtn = wrap.querySelector('.like-btn');
  const cmtBtn  = wrap.querySelector('.comment-btn');
  const shrBtn  = wrap.querySelector('.share-btn');
  const btns    = [likeBtn, cmtBtn, shrBtn].filter(Boolean);

  // helper: tambahkan kelas .attn sebentar, lalu lepas saat animasi selesai
  function ping(el){
    if (!el) return;
    el.classList.add('attn');
    const icon = el.querySelector('svg') || el;
    const onEnd = () => {
      el.classList.remove('attn');
      icon.removeEventListener('animationend', onEnd);
    };
    icon.addEventListener('animationend', onEnd, {once:true});
  }

  // Idle attention tiap ~3 detik (random), hanya saat terlihat & bukan reduce-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = true, timer = null;

  const io = new IntersectionObserver((entries)=> {
    visible = entries.some(e => e.isIntersecting);
  }, {threshold:.2});
  io.observe(wrap);

  function cycle(){
    if (!visible || prefersReduced || btns.length === 0) return;
    // random pilih tombol (beratkan sedikit ke komentar & share)
    const pool = [likeBtn, cmtBtn, cmtBtn, shrBtn, shrBtn].filter(Boolean);
    const pick = pool[Math.floor(Math.random()*pool.length)];
    ping(pick);
  }

  function start(){
    stop();
    timer = setInterval(cycle, 3000);
  }
  function stop(){
    if (timer) clearInterval(timer), (timer=null);
  }

  // mulai
  start();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  // Optional: saat hover/focus → kasih attn kecil (instan tapi rapi)
  btns.forEach(b => {
    b.addEventListener('mouseenter', () => ping(b));
    b.addEventListener('focus', () => ping(b));
  });
})();



/* social-actions.js — like + comments modal + share (2025 Pro) */
(() => {
  const onReady = (fn) =>
    (document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn, { once: true })
      : fn());

  // ====== tiny CSS injector for the popups (scoped, uses your CSS vars)
  const ensureStyles = () => {
    if (document.getElementById('sa-pop-styles')) return;
    const css = `
.sa-pop{position:fixed;inset:0;z-index:90;display:grid;place-items:center}
.sa-pop[hidden]{display:none}
.sa-pop .sa-backdrop{position:absolute;inset:0;background:rgba(8,12,20,.55);backdrop-filter:blur(6px);opacity:0;transition:opacity .2s ease}
.sa-pop .sa-card{position:relative;z-index:1;width:min(620px,calc(100vw - 32px));border:1px solid var(--line);
  border-radius:16px;overflow:hidden;background:linear-gradient(180deg,color-mix(in srgb,var(--card) 96%,transparent),color-mix(in srgb,var(--card) 92%,transparent));
  box-shadow:0 30px 80px rgba(0,0,0,.45),0 8px 24px rgba(0,0,0,.35);transform:translateY(8px) scale(.98);opacity:0;
  transition:transform .22s cubic-bezier(.2,.8,.2,1),opacity .22s ease}
.sa-pop.is-open .sa-backdrop{opacity:1}
.sa-pop.is-open .sa-card{transform:translateY(0) scale(1);opacity:1}
.sa-head{display:flex;align-items:center;gap:10px;padding:12px 14px 4px}
.sa-title{margin:0;font-size:18px;line-height:1.2}
.sa-body{padding:10px 14px 14px;color:var(--text)}
.sa-close{position:absolute;top:10px;right:10px;width:36px;height:36px;border-radius:10px;border:1px solid var(--line);
  background:color-mix(in srgb,var(--card) 86%,transparent);display:grid;place-items:center;cursor:pointer;
  transition:transform .12s ease,background-color .12s ease,border-color .12s ease,box-shadow .12s ease}
.sa-close:hover{transform:translateY(-1px)}
.sa-x{position:relative;width:16px;height:16px}
.sa-x::before,.sa-x::after{content:"";position:absolute;inset:calc(50% - 1px) 0;height:2px;background:var(--text);border-radius:2px}
.sa-x::before{transform:rotate(45deg)} .sa-x::after{transform:rotate(-45deg)}
/* comments */
.sa-cmt-form{display:grid;gap:10px;margin-bottom:10px}
.sa-cmt-form input,.sa-cmt-form textarea{width:100%;border:1px solid var(--line);border-radius:10px;padding:10px 12px;background:color-mix(in srgb,var(--card) 96%,transparent);color:var(--text)}
.sa-cmt-form textarea{min-height:96px;resize:vertical}
.sa-cmt-actions{display:flex;gap:8px;justify-content:flex-end}
.sa-list{list-style:none;margin:0;padding:0;display:grid;gap:10px;max-height:min(48vh,480px);overflow:auto;scrollbar-gutter:stable}
.sa-item{border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:color-mix(in srgb,var(--card) 94%,transparent)}
.sa-item .sa-meta{display:flex;gap:8px;align-items:center;font-size:12px;color:var(--muted);margin-bottom:4px}
.sa-item .sa-name{font-weight:800;color:var(--text)}
.sa-item .sa-time{margin-left:auto;opacity:.8}
.sa-item .sa-text{white-space:pre-wrap;color:var(--text)}
/* share */
.sa-share-grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));margin-top:6px}
.sa-share-btn{display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:12px;padding:10px 12px;
  background:color-mix(in srgb,var(--card) 94%,transparent);cursor:pointer;text-decoration:none;color:var(--text);font-weight:800}
.sa-share-btn:hover{transform:translateY(-1px);box-shadow:0 10px 22px rgba(0,0,0,.12)}
.sa-share-ico{width:18px;height:18px;display:inline-block}
.sa-mini{display:flex;align-items:center;gap:8px;margin-top:8px}
.sa-mini .copy-field{flex:1;border:1px solid var(--line);border-radius:10px;padding:8px 10px;background:color-mix(in srgb,var(--card) 96%,transparent);color:var(--text);user-select:all}
.sa-mini .copy-btn{border:1px solid var(--line);border-radius:10px;padding:8px 12px;background:color-mix(in srgb,var(--card) 90%,transparent);cursor:pointer;font-weight:800}
@media (prefers-reduced-motion: reduce){
  .sa-pop .sa-card,.sa-pop .sa-backdrop,.sa-share-btn{transition:none !important}
}
`;
    const style = document.createElement('style');
    style.id = 'sa-pop-styles';
    style.textContent = css;
    document.head.appendChild(style);
  };

  // ====== utils
  const parseCount = (v) => {
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (s.endsWith('k')) return Math.round(parseFloat(s) * 1000);
      const n = parseInt(s.replace(/[^\d]/g, ''), 10);
      return Number.isFinite(n) ? n : 0;
    }
    return Number(v) || 0;
  };
  const fmt = (n) => {
    if (n >= 1000) {
      const val = Math.round(n / 100) / 10;
      return (Number.isInteger(val) ? val.toFixed(0) : val.toFixed(1)) + 'k';
    }
    return String(n);
  };
  const key = (name) => `${name}:${location.pathname}`;

  // ====== modal factory (comment/share)
  const FOCUS = 'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])';
  const buildModal = ({ type, title, bodyHTML }) => {
    ensureStyles();
    const wrap = document.createElement('div');
    wrap.className = 'sa-pop';
    wrap.hidden = true;
    wrap.dataset.type = type;
    wrap.innerHTML = `
      <div class="sa-backdrop" data-close></div>
      <div class="sa-card" role="dialog" aria-modal="true" aria-label="${title}" tabindex="-1">
        <button class="sa-close" type="button" aria-label="Tutup" data-close><span class="sa-x" aria-hidden="true"></span></button>
        <div class="sa-head"><h3 class="sa-title">${title}</h3></div>
        <div class="sa-body">${bodyHTML}</div>
      </div>`;
    document.body.appendChild(wrap);
    return wrap;
  };
  const openModal = (el, lastFocusRef) => {
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('is-open'));
    document.documentElement.classList.add('no-scroll');
    el.querySelector('.sa-card')?.focus({ preventScroll: true });

    // close handlers + trap
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const trap = (e) => {
      if (e.key !== 'Tab') return;
      const box = el.querySelector('.sa-card');
      if (!box) return;
      const nodes = box.querySelectorAll(FOCUS);
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    };
    const close = () => {
      el.classList.remove('is-open');
      setTimeout(() => { el.hidden = true; }, 220);
      document.documentElement.classList.remove('no-scroll');
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('keydown', trap);
      el.removeEventListener('click', onClick);
      lastFocusRef?.focus?.();
    };
    const onClick = (e) => { if (e.target.dataset.close !== undefined) close(); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('keydown', trap);
    el.addEventListener('click', onClick);
    return { close };
  };

  // ====== comment store
  const loadComments = () => {
    try { return JSON.parse(localStorage.getItem(key('cmt')) || '[]'); } catch { return []; }
  };
  const saveComments = (arr) => {
    try { localStorage.setItem(key('cmt'), JSON.stringify(arr)); } catch {}
  };

  // ====== main
  onReady(() => {
    const wrap = document.querySelector('.social-actions');
    if (!wrap) return;

    // ensure comment button has class
    const likeBtn = wrap.querySelector('.like-btn');
    const shareBtn = wrap.querySelector('.share-btn');
    let cmtBtn = null;
    wrap.querySelectorAll('.icon-btn').forEach((btn) => {
      if (btn === likeBtn || btn === shareBtn) return;
      // ini tombol komentar
      btn.classList.add('comment-btn');
      cmtBtn = btn;
    });

    // ---- LIKE
    if (likeBtn) {
      const countEl = likeBtn.querySelector('.count');
      const base = likeBtn.dataset.count
        ? parseCount(likeBtn.dataset.count)
        : parseCount(countEl?.textContent || '0');
      const liked = localStorage.getItem(key('like')) === '1';

      const apply = (pressed) => {
        likeBtn.setAttribute('aria-pressed', String(pressed));
        const n = base + (pressed ? 1 : 0);
        likeBtn.dataset.count = String(n);
        if (countEl) countEl.textContent = fmt(n);
      };
      apply(liked);

      likeBtn.addEventListener('click', () => {
        const pressed = likeBtn.getAttribute('aria-pressed') === 'true';
        const next = !pressed;
        localStorage.setItem(key('like'), next ? '1' : '0');
        apply(next);
      });
    }

    // ---- COMMENTS
    let cmtModal = null;

    const openComments = () => {
      if (!cmtModal) {
        cmtModal = buildModal({
          type: 'comment',
          title: 'Komentar',
          bodyHTML: `
            <form class="sa-cmt-form" novalidate>
              <input class="sa-name" type="text" placeholder="Nama (opsional)" autocomplete="name">
              <textarea class="sa-text" required maxlength="500" placeholder="Tulis komentar kamu di sini... (maks 500 karakter)"></textarea>
              <div class="sa-cmt-actions">
                <button class="btn btn-default sa-submit" type="submit" disabled>Kirim</button>
              </div>
            </form>
            <ul class="sa-list" id="sa-list"></ul>`
        });
      }

      const last = document.activeElement;
      const ctl = openModal(cmtModal, last);

      const form   = cmtModal.querySelector('.sa-cmt-form');
      const nameEl = form.querySelector('.sa-name');
      const textEl = form.querySelector('.sa-text');
      const btnEl  = form.querySelector('.sa-submit');
      const list   = cmtModal.querySelector('#sa-list');

      // Komentar hanya hidup di sesi popup ini
      const comments = [];

      // Pastikan tombol close punya data-close (apapun nama kelasnya)
      cmtModal.querySelector('.m-close, .qv-close, [aria-label="Tutup"]')
        ?.setAttribute('data-close', '');

      // Delegasi: boleh klik backdrop atau *bagian apapun* di dalam tombol close
      const onClickClose = (e) => {
        if (e.target.classList.contains('m-backdrop') || e.target.closest('[data-close]')) {
          ctl.close(); // pakai close() dari openModal
        }
      };
      cmtModal.addEventListener('click', onClickClose);

      // ESC untuk menutup (sekali pakai)
      const onEsc = (e) => { if (e.key === 'Escape') ctl.close(); };
      document.addEventListener('keydown', onEsc, { once: true });

      const escapeHTML = (t) => t.replace(/[<>&]/g, s => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[s]));
      const render = () => {
        if (!comments.length) {
          list.innerHTML = `<li class="sa-item"><div class="sa-text" style="color:var(--muted)">Belum ada komentar.</div></li>`;
          return;
        }
        list.innerHTML = comments.map(c => `
          <li class="sa-item sa-new" data-id="${c.id}">
            <div class="sa-meta">
              <span class="sa-name">${c.name || 'Anon'}</span>
              <span class="sa-time">${new Date(c.ts).toLocaleString()}</span>
            </div>
            <div class="sa-text">${escapeHTML(c.text)}</div>
          </li>`).join('');
        // hapus kelas highlight setelah paint
        requestAnimationFrame(() => {
          list.querySelectorAll('.sa-new').forEach(li => {
            li.animate(
              [{ opacity: .0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }],
              { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' }
            );
            li.classList.remove('sa-new');
          });
        });
      };

      render();

      // enable/disable tombol Kirim berdasar isi
      const refreshState = () => {
        const ok = (textEl.value.trim().length >= 2);
        btnEl.disabled = !ok;
      };
      textEl.addEventListener('input', refreshState);
      refreshState();

      // submit: tambahkan ke daftar *tanpa menyimpan permanen*
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = textEl.value.trim();
        if (!text) return;

        comments.push({
          id: crypto?.randomUUID?.() || String(Date.now()),
          name: nameEl.value.trim(),
          text,
          ts: Date.now(),
        });

        form.reset();
        refreshState();
        render();

        // scroll agar komentar terbaru terlihat
        list.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, { once: true });

      // Tidak menyentuh/mengubah counter pada tombol komentar (tetap angka bawaan)
      // & tidak menyimpan apa pun saat modal ditutup.
    };

    if (cmtBtn) {
      cmtBtn.addEventListener('click', (e) => {
        // Kalau href="#ulasan", cegah scroll — kita pakai popup
        if (cmtBtn.matches('a')) e.preventDefault();
        openComments();
      });
    }

    // ---- SHARE
(() => {
  const shareBtn = document.querySelector('.share-btn');
  if (!shareBtn) return;

  // Data share
  const shareData = {
    title: document.title || 'Adam jr | Hair Studio',
    text: 'Cek Adam jr | Hair Studio',
    url: location.href
  };

  // Toast (1 instance global)
  function showToast(msg = 'Tersalin', variant = 'ok') {
    let toast = document.querySelector('.sa-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'sa-toast';
      toast.innerHTML = `<div class="sa-toast__bubble" role="status" aria-live="polite"></div>`;
      document.body.appendChild(toast);
    }
    const bubble = toast.querySelector('.sa-toast__bubble');
    bubble.textContent = msg;
    toast.classList.remove('is-hide');
    toast.classList.add('is-show', `is-${variant}`);
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      toast.classList.remove('is-show');
      toast.classList.add('is-hide');
    }, 1600);
  }

  // Helper salin teks (aman utk http/file:)
  async function copyText(text){
    try{
      if (navigator.clipboard && window.isSecureContext){
        await navigator.clipboard.writeText(text);
      }else{
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly','');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      return true;
    }catch{
      return false;
    }
  }

  let shareModal = null;

  const openShare = async () => {
    // 1) Coba Web Share API
    try {
      if (navigator.share && typeof navigator.share === 'function') {
        await navigator.share(shareData);
        return;
      }
    } catch { /* user cancel / ignore */ }

    // 2) Fallback modal (pakai PNG dari images/social)
    if (!shareModal) {
      const btn = (ch, label, file) => `
        <a class="sa-share-btn" data-ch="${ch}" href="#" rel="noopener">
          <img class="sa-share-ico"
               src="images/social/${file}.png"
               srcset="images/social/${file}.png 1x, images/social/${file}.png 2x"
               alt="" aria-hidden="true">
          <span>${label}</span>
        </a>`;

      shareModal = buildModal({
        type: 'share',
        title: 'Bagikan',
        bodyHTML: `
          <div class="sa-share-grid">
            ${btn('wa',  'WhatsApp',   'wa')}
            ${btn('ig',  'Instagram',  'instagram')}
            ${btn('x',   'X (Twitter)','x')}
            ${btn('tg',  'Telegram',   'tg')}
            ${btn('mail','Email',      'mail')}
          </div>

          <div class="sa-mini">
            <input class="copy-field" type="text" readonly value="${shareData.url}">
            <button class="copy-btn" type="button">Salin Link</button>
          </div>`
      });

      // Delegasi close SEKALI SAJA (tanpa {once:true})
      shareModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('m-backdrop') || e.target.closest('[data-close]')) {
          // openModal mengembalikan controller? kalau tidak, biarkan buildModal/plugin kamu yang handle
          // Kalau kamu butuh manual: shareModal.classList.remove('is-open') dst.
          // Di sini kita panggil tombol close jika ada:
          const closeBtn = shareModal.querySelector('[data-close]');
          closeBtn?.click?.();
        }
      });

      // Pastikan tombol X punya data-close
      shareModal.querySelector('.m-close, .qv-close, [aria-label="Tutup"]')
        ?.setAttribute('data-close','');
    }

    const last = document.activeElement;
    openModal(shareModal, last);

    const enc = encodeURIComponent;
    const go  = (url) => window.open(url, '_blank', 'noopener,noreferrer');

    // Channel handlers (didafarkan setiap buka; {once:true} supaya rapi per-open)
    shareModal.querySelectorAll('.sa-share-btn').forEach(a => {
      a.addEventListener('click', async (e) => {
        e.preventDefault();
        const ch  = a.dataset.ch;
        const u   = shareData.url;
        const t   = shareData.title;
        const txt = shareData.text;

        switch (ch) {
          case 'wa':  go(`https://wa.me/?text=${enc(`${t} — ${u}`)}`); break;
          case 'x':   go(`https://twitter.com/intent/tweet?text=${enc(`${t} — `)}&url=${enc(u)}`); break;
          case 'tg':  go(`https://t.me/share/url?url=${enc(u)}&text=${enc(t)}`); break;
          case 'mail':go(`mailto:?subject=${enc(t)}&body=${enc(`${txt}\n\n${u}`)}`); break;
          case 'ig':
            // Instagram tidak punya web share intent.
            // Strategi: salin link + buka Instagram (biar user paste di bio/DM/story).
            {
              const ok = await copyText(u);
              go('https://www.instagram.com/');
              showToast(ok ? 'Link tersalin — tempel di IG 👍' : 'Salin manual di IG ya 🙏', ok ? 'ok' : 'err');
            }
            break;
        }
      }, { once: true });
    });

    // Copy link tombol + toast
    const copyBtn = shareModal.querySelector('.copy-btn');
    const field   = shareModal.querySelector('.copy-field');
    copyBtn.addEventListener('click', async () => {
      const ok = await copyText(field.value);
      showToast(ok ? 'Link tersalin ✅' : 'Gagal menyalin ❌', ok ? 'ok' : 'err');
    }, { once: true });
  };

  shareBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openShare();
  });
})();
  });
})();