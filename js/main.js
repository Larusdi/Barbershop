/* =========================================================
   Audio global (1x untuk semua kontrol musik)
========================================================= */
const HERO_AUDIO = (() => {
  const a = document.createElement('audio');
  a.preload = 'none';
  a.crossOrigin = 'anonymous';
  document.body.appendChild(a);
  return a;
})();
function setNowPlayingPill(pill, playing){
  document.querySelectorAll('.meta-pill[data-meta="music"], .meta-pill[data-audio="true"]')
    .forEach(el => el.removeAttribute('data-playing'));
  if (playing && pill){ pill.setAttribute('data-playing','true'); }
}

/* =============================
   Hero Meta → Popup "Book-Style" (2025 Pro)
   ============================= */
(() => {
  const meta = document.querySelector('.hero-meta');
  if (!meta) return;

  // ----- Inject CSS sekali -----
  if (!document.getElementById('meta-pop-style')) {
    const style = document.createElement('style');
    style.id = 'meta-pop-style';
    style.textContent = `
    /* ===== POPUP (Book-Style) — Base ===== */
    .meta-pop{position:fixed;inset:0;z-index:999;display:grid;place-items:center;}
    .meta-pop[hidden]{display:none;}

    .meta-pop__backdrop{
      position:absolute;inset:0;
      background:rgba(0,0,0,.25);
      backdrop-filter:blur(4px);
      opacity:0;transition:opacity .25s ease;
    }
    .meta-pop.is-open .meta-pop__backdrop{opacity:1;}

    .meta-pop__card{
      position:relative;
      width:min(92vw, 560px);
      max-height:86vh; overflow:auto;
      border-radius:20px;
      background: color-mix(in srgb, var(--card) 92%, transparent);
      border:1px solid var(--line);
      box-shadow: 0 24px 68px rgba(0,0,0,.18), 0 6px 22px rgba(0,0,0,.12);
      padding: clamp(18px, 3.2vw, 26px);
      transform: translateY(10px) scale(.98);
      opacity:0;
      scrollbar-gutter: stable;
    }
    .meta-pop__card::-webkit-scrollbar{ width:10px }
    .meta-pop__card::-webkit-scrollbar-track{ background: transparent }
    .meta-pop__card::-webkit-scrollbar-thumb{
      background: color-mix(in srgb, var(--muted) 25%, transparent);
      border-radius: 8px;
    }

    .meta-pop__close{
      position:absolute; top:10px; right:10px;
      width:36px;height:36px;border-radius:10px;border:1px solid var(--line);
      background: color-mix(in srgb, var(--card) 85%, transparent);
      display:inline-grid;place-items:center; cursor:pointer;
      transition:transform .15s ease, background-color .15s ease, border-color .15s ease;
      -webkit-tap-highlight-color: transparent;
    }
    .meta-pop__close:hover{ transform: scale(1.04); }
    .meta-pop__close:focus{ outline: none; }
    .meta-pop__close:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }

    .meta-pop__x{display:block;width:16px;height:16px;position:relative}
    .meta-pop__x::before,.meta-pop__x::after{
      content:"";position:absolute;left:50%;top:50%;
      width:14px;height:2px;border-radius:2px;background:var(--muted);transform-origin:center;
    }
    .meta-pop__x::before{ transform: translate(-50%,-50%) rotate(45deg); }
    .meta-pop__x::after{  transform: translate(-50%,-50%) rotate(-45deg); }

    .meta-pop__head{display:flex;align-items:center;gap:12px;margin-bottom:10px;}
    .meta-pop__icon{
      width:38px;height:38px;border-radius:12px;display:grid;place-items:center;flex:0 0 auto;
      border:1px solid var(--line);
      background: color-mix(in srgb, var(--line) 55%, transparent);
    }
    .meta-pop__icon svg{width:18px;height:18px;display:block}
    .meta-pop__icon svg *{stroke:var(--brand);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}

    .meta-pop__title{
      margin:0;font-size:clamp(18px,1.6vw,22px);letter-spacing:.2px;
      color: color-mix(in srgb, var(--brand) 86%, #000);
    }
    .meta-pop__prose{
      margin-top:8px;color:var(--muted);
      line-height:1.65;font-size:clamp(14px,1.2vw,16px);
    }
    .meta-pop__prose p{margin:0 0 10px}
    .meta-pop__prose ul{margin:6px 0 12px 18px}
    .meta-pop__prose li{margin:.25em 0}

    .meta-pop__actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
    .meta-pop__btn{
      display:inline-flex;align-items:center;gap:8px;
      padding:10px 14px;border-radius:999px;border:1px solid var(--line);
      background: color-mix(in srgb, var(--accent) 14%, var(--line) 86%);
      color:var(--brand);text-decoration:none;font-weight:700;
      transition:transform .15s ease, box-shadow .15s ease, border-color .15s ease, background-color .15s ease;
      -webkit-tap-highlight-color: transparent;
    }
    .meta-pop__btn:hover{
      transform:translateY(-1px);
      box-shadow:0 10px 24px color-mix(in srgb, var(--brand) 12%, transparent);
    }
    .meta-pop__btn:focus{ outline:none; }
    .meta-pop__btn:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }

    /* ===== Dark Mode ===== */
    html[data-theme="dark"] .meta-pop__backdrop{ background: rgba(0,0,0,.45); }
    html[data-theme="dark"] .meta-pop__card{
      background: color-mix(in srgb, var(--line) 28%, transparent);
      border-color: color-mix(in srgb, var(--line) 72%, transparent);
      box-shadow: 0 28px 68px rgba(0,0,0,.45);
      color: color-mix(in srgb, #fff 92%, var(--muted));
      scrollbar-color: color-mix(in srgb, #fff 22%, var(--line)) transparent;
    }
    html[data-theme="dark"] .meta-pop__card::-webkit-scrollbar-thumb{
      background: color-mix(in srgb, #fff 22%, var(--line));
    }
    html[data-theme="dark"] .meta-pop__title{ color: color-mix(in srgb, #fff 94%, var(--brand)); }
    html[data-theme="dark"] .meta-pop__prose{ color: color-mix(in srgb, #fff 86%, var(--muted)); }
    html[data-theme="dark"] .meta-pop__icon{
      background: color-mix(in srgb, var(--line) 34%, transparent);
      border-color: color-mix(in srgb, var(--line) 70%, transparent);
    }
    html[data-theme="dark"] .meta-pop__icon svg *{ stroke: color-mix(in srgb, #fff 85%, var(--brand)); }
    html[data-theme="dark"] .meta-pop__close{
      background: color-mix(in srgb, var(--line) 34%, transparent);
      border-color: color-mix(in srgb, var(--line) 70%, transparent);
    }
    html[data-theme="dark"] .meta-pop__x::before,
    html[data-theme="dark"] .meta-pop__x::after{ background: color-mix(in srgb, #fff 88%, transparent); }
    html[data-theme="dark"] .meta-pop__btn{
      background: color-mix(in srgb, var(--line) 36%, transparent);
      border-color: color-mix(in srgb, var(--line) 72%, transparent);
      color: color-mix(in srgb, #fff 92%, var(--brand));
    }
    html[data-theme="dark"] .meta-pop__btn:hover{ box-shadow: 0 14px 28px rgba(0,0,0,.45); }

    @media (prefers-color-scheme: dark){
      .meta-pop__backdrop{ background: rgba(0,0,0,.45) }
    }
    @media (max-width:560px){
      .meta-pop__card{ width: min(96vw, 520px); border-radius:18px; }
    }

    /* ===== Badge dot (open/close indicator) ===== */
    #open-badge .dot{
      display:inline-block;width:.55em;height:.55em;border-radius:999px;
      margin-right:6px;vertical-align:middle;
      box-shadow:0 0 0 2px color-mix(in srgb,var(--card) 90%, transparent);
    }
    #open-badge[data-state="open"] .dot{ background:#22c55e; }
    #open-badge[data-state="closed"] .dot{ background:#ef4444; }
    html[data-theme="dark"] #open-badge .dot{
      box-shadow:0 0 0 2px color-mix(in srgb, var(--line) 70%, transparent);
    }

    /* ===== Mini audio control & disc spin on play ===== */
    .meta-pill[data-audio]{ position:relative; }
    .meta-pill[data-playing="true"] svg{
      transform-origin:50% 50%;
      animation: heroDiscSpin 4.5s linear infinite;
    }
    @keyframes heroDiscSpin{ from{transform:rotate(0)} to{transform:rotate(360deg)} }
    .pill-audio-ctrl{
      position:absolute; inset:auto 6px 6px auto;
      width:22px;height:22px;display:grid;place-items:center;
      border-radius:7px;border:1px solid var(--line);
      background: color-mix(in srgb, var(--card) 85%, transparent);
      cursor:pointer; -webkit-tap-highlight-color: transparent;
    }
    .pill-audio-ctrl svg{ width:12px;height:12px;display:block; }
    .pill-audio-ctrl svg *{ fill:none; stroke:var(--brand); stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
    html[data-theme="dark"] .pill-audio-ctrl{
      background: color-mix(in srgb, var(--line) 34%, transparent);
      border-color: color-mix(in srgb, var(--line) 70%, transparent);
    }
    `;
    document.head.appendChild(style);
  }

  // ----- Build DOM -----
  const pop = document.createElement('div');
  pop.className = 'meta-pop';
  pop.setAttribute('role','dialog');
  pop.setAttribute('aria-modal','true');
  pop.setAttribute('aria-label','Detail informasi');
  pop.hidden = true;
  pop.innerHTML = `
    <div class="meta-pop__backdrop" data-close></div>
    <div class="meta-pop__card" tabindex="-1">
      <button class="meta-pop__close" type="button" aria-label="Tutup" data-close>
        <span class="meta-pop__x" aria-hidden="true"></span>
      </button>
      <div class="meta-pop__head">
        <div class="meta-pop__icon" aria-hidden="true"></div>
        <h3 class="meta-pop__title">Detail</h3>
      </div>
      <div class="meta-pop__prose"></div>
      <div class="meta-pop__actions"></div>
    </div>
  `;
  document.body.appendChild(pop);

  const card = pop.querySelector('.meta-pop__card');
  const iconBox = pop.querySelector('.meta-pop__icon');
  const titleEl = pop.querySelector('.meta-pop__title');
  const proseEl = pop.querySelector('.meta-pop__prose');
  const actsEl  = pop.querySelector('.meta-pop__actions');

  // ----- Helpers -----
  let lastFocus = null;
  const focusSel = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

  function openPop({title, html, icon, actions=[]}){
    lastFocus = document.activeElement;

    // isi konten
    iconBox.innerHTML = '';
    if (icon) iconBox.appendChild(icon);
    titleEl.textContent = title || 'Detail';
    proseEl.innerHTML = html || '';

    // actions: dukung type: 'audio' (play via HERO_AUDIO) & link biasa
    // --- actions: dukung type:'audio' (toggle via HERO_AUDIO) & link biasa ---
    actsEl.innerHTML = '';

    // bersihkan listener lama kalau ada (antisipasi re-open)
    if (pop._syncHandlers){
      pop._syncHandlers.forEach(off => off());
      pop._syncHandlers = null;
    }

    const isCurrent = (src) => HERO_AUDIO.src && HERO_AUDIO.src.endsWith(src);

    function refreshButtons(){
      actsEl.querySelectorAll('button[data-src]').forEach(btn => {
        const src = btn.dataset.src;
        const title = btn.dataset.title || 'Track';
        const playing = isCurrent(src) && !HERO_AUDIO.paused;
        btn.dataset.playing = playing ? 'true' : 'false';
        btn.textContent = (playing ? 'Jeda: ' : 'Putar: ') + title;
      });
    }

    actions.forEach(a => {
      if ((a.type === 'audio' || a.audio) && a.src) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'meta-pop__btn';
        btn.dataset.src = a.src;
        btn.dataset.title = a.title || '';
        // label awal
        btn.textContent = (isCurrent(a.src) && !HERO_AUDIO.paused ? 'Jeda: ' : 'Putar: ') + (a.title || 'Track');

        btn.addEventListener('click', () => {
          if (isCurrent(a.src)) {
            // tombol yang sama: toggle pause/play
            if (HERO_AUDIO.paused) HERO_AUDIO.play().catch(()=>{});
            else HERO_AUDIO.pause();
          } else {
            // ganti ke track ini lalu play
            HERO_AUDIO.src = a.src;
            HERO_AUDIO.play().catch(()=>{});
          }
        });

        actsEl.appendChild(btn);
      } else if (a.href) {
        const link = document.createElement('a');
        link.className = 'meta-pop__btn';
        link.href = a.href;
        link.textContent = a.label || 'Buka';
        if (a.newTab !== false){ link.target = '_blank'; link.rel = 'noopener'; }
        actsEl.appendChild(link);
      }
    });

    // sinkronkan label tombol saat audio berubah
    const onPlay  = () => refreshButtons();
    const onPause = () => refreshButtons();
    const onEnded = () => refreshButtons();

    HERO_AUDIO.addEventListener('play',  onPlay);
    HERO_AUDIO.addEventListener('pause', onPause);
    HERO_AUDIO.addEventListener('ended', onEnded);

    // simpan "unsubscribers" supaya dilepas saat popup ditutup
    pop._syncHandlers = [
      () => HERO_AUDIO.removeEventListener('play',  onPlay),
      () => HERO_AUDIO.removeEventListener('pause', onPause),
      () => HERO_AUDIO.removeEventListener('ended', onEnded),
    ];

    // render state awal
    refreshButtons();

    // tampil
    pop.hidden = false;
    requestAnimationFrame(()=>{
      pop.classList.add('is-open');
      card.animate(
        [{opacity:0, transform:'translateY(10px) scale(.98)'},
         {opacity:1, transform:'translateY(0) scale(1)'}],
        {duration:280, easing:'cubic-bezier(.2,.7,.2,1)', fill:'forwards'}
      );
    });
    document.documentElement.classList.add('no-scroll');
    card.focus({preventScroll:true});
    document.addEventListener('keydown', onKey);
    document.addEventListener('keydown', trapFocus);
  }

  function closePop(){
  // (JANGAN pause musik di sini — biarkan tetap jalan)
  // bersihkan listener sinkronisasi tombol popup (kalau ada)
  if (pop._syncHandlers){
    pop._syncHandlers.forEach(off => off());
    pop._syncHandlers = null;
  }

  const anim = card.animate(
    [{opacity:1, transform:'translateY(0) scale(1)'},
     {opacity:0, transform:'translateY(10px) scale(.98)'}],
    {duration:200, easing:'cubic-bezier(.2,.7,.2,1)', fill:'forwards'}
  );
  pop.querySelector('.meta-pop__backdrop').style.opacity = '0';
  anim.addEventListener('finish', ()=>{
    pop.classList.remove('is-open');
    pop.hidden = true;
    document.documentElement.classList.remove('no-scroll');
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('keydown', trapFocus);
    lastFocus && lastFocus.focus && lastFocus.focus();
  }, {once:true});
}

  function onKey(e){ if (e.key === 'Escape') closePop(); }
  function trapFocus(e){
    if (e.key !== 'Tab') return;
    const nodes = card.querySelectorAll(focusSel);
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }
  pop.addEventListener('click', (e)=>{ if (e.target.dataset.close !== undefined) closePop(); });

  // ----- Content builder -----
  function detailsFor(pill){
    const txt = pill.textContent.trim();
    const low = txt.toLowerCase();
    const icon = pill.querySelector('svg') ? pill.querySelector('svg').cloneNode(true) : null;

    if (low.includes('rp') || low.includes('mulai')) {
      return {
        title: 'Harga & Paket',
        html: `
          <p>Kami menjaga harga tetap <strong>jujur & transparan</strong> dengan kualitas yang konsisten.</p>
          <ul>
            <li><b>Modern Classic</b> — mulai <b>Rp25.000</b></li>
            <li><b>Full Service</b> — perawatan lengkap, relaks maksimal</li>
            <li><b>Color & Tone</b> — konsultasi undertone, hasil sehat & merata</li>
          </ul>
          <p>Butuh paket khusus (event/rombongan)? Silakan hubungi kami untuk penawaran.</p>
        `,
        icon
      };
    }

    if (low.includes('qris') || low.includes('cash') || low.includes('pembayaran')) {
      return {
        title: 'Metode Pembayaran',
        html: `
          <p>Kami menerima pembayaran <b>QRIS</b> dan <b>tunai</b>. Pembayaran digital lebih cepat, tanpa repot menyiapkan uang pas.</p>
          <p>Struk/konfirmasi akan kami berikan setelah transaksi berhasil.</p>
        `,
        icon
      };
    }

    if (low.includes('durasi')) {
      return {
        title: 'Durasi Layanan',
        html: `
          <p>Rata-rata waktu layanan antara <b>30–45 menit</b> per sesi.</p>
          <ul>
            <li><b>Haircut</b> — fokus pada detail & bentuk wajah</li>
            <li><b>Full Service</b> — tambah relaksasi & perawatan scalp</li>
          </ul>
          <p>Kami mengutamakan <em>presisi</em> ketimbang terburu-buru, agar hasilnya awet & rapi.</p>
        `,
        icon
      };
    }

    if (low.includes('peta') || pill.querySelector('a')) {
      const a = pill.querySelector('a');
      return {
        title: 'Lokasi',
        html: `
          <p>Studio kami mudah dijangkau dan berada di area dengan akses yang nyaman.</p>
          <p>Klik tombol di bawah untuk membuka lokasi di Google Maps.</p>
        `,
        icon,
        actions: a ? [{ href: a.href, label: 'Buka di Google Maps' }] : []
      };
    }

    if (low.includes('wi-fi') || low.includes('wifi')) {
      return {
        title: 'Wi-Fi',
        html: `
          <p>Tersedia <b>Wi-Fi gratis</b> untuk pelanggan selama sesi. Mintalah password kepada barber kami.</p>
          <p>Kecepatan cukup untuk streaming ringan & komunikasi.</p>
        `,
        icon
      };
    }

    if (low.includes('parkir')) {
      return {
        title: 'Parkir',
        html: `
          <p>Tersedia <b>area parkir</b> di sekitar studio. Staf kami siap membantu mengarahkan tempat yang tersedia.</p>
          <p>Untuk waktu kunjungan ramai, pertimbangkan datang 5–10 menit lebih awal.</p>
        `,
        icon
      };
    }

    if (low.includes('santai')) {
      return {
        title: 'Area Santai',
        html: `
          <p><b>Nongki santai</b> sambil menunggu giliran: duduk nyaman, ngobrol, atau mabar ringan.</p>
          <ul>
            <li>Wi-Fi & colokan tersedia</li>
            <li>Kopi/teh & camilan (mie rebus, snack)</li>
            <li>Area merokok terpisah (bila tersedia)</li>
          </ul>
          <p>Butuh rekomendasi minuman atau camilan? Tanyakan ke barber kami, siap bantu 👌</p>
        `,
        icon
      };
    }

    // === MUSIK: seperti "Lokasi" tapi aksi = play audio ===
    if (low.includes('musik') || low.includes('music')) {
      let tracks = [];
      try { tracks = JSON.parse(pill.dataset.tracks || '[]'); } catch(e){}
      if (!Array.isArray(tracks) || tracks.length === 0) {
        tracks = [
          { title: 'Bila Rasaku Ini Rasamu', src: 'assets/audio/music1.mp3' },
          { title: 'Kaulah Segalanya',       src: 'assets/audio/music2.mp3' },
          { title: 'Mengenangmu',            src: 'assets/audio/music3.mp3' },
        ];
      }
      const audioActions = tracks.map(t => ({
        type: 'audio',
        label: `Putar: ${t.title}`,
        title: t.title,
        src: t.src
      }));
      return {
        title: 'Musik',
        html: `
          <p>Kami putar playlist santai: <b>lofi</b>, <b>barberhop</b>, dan <b>chill beats</b> biar suasana nyaman.</p>
          <ul>
            <li>Volume nyaman, tidak mengganggu obrolan</li>
            <li>Bisa request lagu—tinggal sampaikan ke barber</li>
            <li>Track disesuaikan dengan mood & waktu kunjungan</li>
          </ul>
        `,
        icon,
        actions: audioActions
      };
    }

    return { title: 'Info', html: `<p>${txt}</p>`, icon };
  }

  // ----- Bind ke setiap pill -----
  const SVG_PLAY  = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l10 7-10 7z"/></svg>`;
  const SVG_PAUSE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>`;

  function enhanceMusicPill(pill){
    if (pill.dataset.audio === 'true') return;
    pill.dataset.audio = 'true';

    const ctrl = document.createElement('button');
    ctrl.type = 'button';
    ctrl.className = 'pill-audio-ctrl';
    ctrl.setAttribute('aria-label','Putar musik');
    ctrl.innerHTML = SVG_PLAY;
    pill.appendChild(ctrl);

    let tracks = [];
    try { tracks = JSON.parse(pill.dataset.tracks || '[]'); } catch(e){}
    if (!Array.isArray(tracks) || tracks.length === 0) {
      tracks = [
        { title: 'Lo-fi Chill',    src: 'audio/lofi-chill.mp3' },
        { title: 'Barberhop Beat', src: 'audio/barberhop-beat.mp3' },
        { title: 'Smooth Fade',    src: 'audio/smooth-fade.mp3' }
      ];
    }
    const first = tracks[0];

    function toggle(){
      const want = first?.src;
      if (!want) return;

      if (!HERO_AUDIO.src || !HERO_AUDIO.src.endsWith(want)) {
        HERO_AUDIO.src = want;
        HERO_AUDIO.play().catch(()=>{});
        setNowPlayingPill(pill, true);
        ctrl.innerHTML = SVG_PAUSE;
        return;
      }
      if (HERO_AUDIO.paused) {
        HERO_AUDIO.play().catch(()=>{});
        setNowPlayingPill(pill, true);
        ctrl.innerHTML = SVG_PAUSE;
      } else {
        HERO_AUDIO.pause();
        setNowPlayingPill(null, false);
        ctrl.innerHTML = SVG_PLAY;
      }
    }

    ctrl.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });

    HERO_AUDIO.addEventListener('play', () => {
      if (HERO_AUDIO.src && first?.src && HERO_AUDIO.src.endsWith(first.src)) {
        setNowPlayingPill(pill, true);
        ctrl.innerHTML = SVG_PAUSE;
      }
    });
    HERO_AUDIO.addEventListener('pause', () => {
      if (HERO_AUDIO.src && first?.src && HERO_AUDIO.src.endsWith(first.src)) {
        setNowPlayingPill(null, false);
        ctrl.innerHTML = SVG_PLAY;
      }
    });
  }

  meta.querySelectorAll('.meta-pill').forEach(pill => {
    pill.setAttribute('tabindex','0');
    pill.setAttribute('role','button');

    const isMusic = pill.dataset.meta === 'music';
    if (isMusic) enhanceMusicPill(pill);

    pill.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      if (isMusic) {
        if (e.target.closest('.pill-audio-ctrl') || e.target.closest('svg')) return;
        openPop._ctxPill = pill;
        openPop(detailsFor(pill));
        return;
      }
      openPop._ctxPill = pill;
      openPop(detailsFor(pill));
    });

    pill.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPop._ctxPill = pill;
        openPop(detailsFor(pill));
      }
    });
  });
})();

/* =============================
   Open badge auto schedule (daily 11:00–23:00)
   ============================= */
(() => {
  const badge = document.getElementById('open-badge');
  if (!badge) return;

  const times = badge.querySelectorAll('time');
  const openStr  = (times[0]?.getAttribute('datetime') || times[0]?.textContent || '11:00').trim();
  const closeStr = (times[1]?.getAttribute('datetime') || times[1]?.textContent || '23:00').trim();

  const toToday = (hm) => {
    const [h, m=0] = String(hm).split(':').map(Number);
    const d = new Date();
    d.setHours(h||0, m||0, 0, 0);
    return d;
  };

  function render(state){
    const dot = '<span class="dot" aria-hidden="true"></span>';
    if (state === 'open'){
      badge.dataset.state = 'open';
      badge.setAttribute('aria-label', `Buka hari ini ${openStr}–${closeStr}`);
      badge.innerHTML = `${dot}Buka hari ini • <time datetime="${openStr}">${openStr}</time>–<time datetime="${closeStr}">${closeStr}</time>`;
    } else if (state === 'preopen'){
      badge.dataset.state = 'closed';
      badge.setAttribute('aria-label', `Tutup, buka hari ini ${openStr}`);
      badge.innerHTML = `${dot}Tutup • Buka hari ini <time datetime="${openStr}">${openStr}</time>`;
    } else {
      badge.dataset.state = 'closed';
      badge.setAttribute('aria-label', `Tutup, buka besok ${openStr}`);
      badge.innerHTML = `${dot}Tutup • Buka besok <time datetime="${openStr}">${openStr}</time>`;
    }
  }

  function scheduleNext(now, target, cb){
    const delay = Math.max(1000, target - now + 500);
    clearTimeout(scheduleNext._t);
    scheduleNext._t = setTimeout(cb, delay);
  }

  function update(){
    const now   = new Date();
    const open  = toToday(openStr);
    const close = toToday(closeStr);

    if (now >= open && now < close){
      render('open');
      scheduleNext(now, close, update);
    } else if (now < open){
      render('preopen');
      scheduleNext(now, open, update);
    } else {
      render('postclose');
      const nextOpen = new Date(open);
      nextOpen.setDate(nextOpen.getDate() + 1);
      scheduleNext(now, nextOpen, update);
    }
  }

  update();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  setInterval(update, 60 * 60 * 1000);
})();

/* =========================================
   Live clock (WIB / Asia/Jakarta)
   - Baca pengaturan dari data-attribute:
     data-12h="true|false" (default: true)
     data-seconds="true|false" (default: true)
   - Sinkron ke pergantian detik
   - AM/PM ditaruh di .tz saat 12-jam
   ========================================= */
(() => {
  const TZ = 'Asia/Jakarta';

  function initWIBClock(root) {
    if (!root) return;
    const el = root.querySelector('#clock-wib') || root.querySelector('time');
    if (!el) return;
    const tzEl = root.querySelector('.tz');

    // Baca konfigurasi dari data-attribute
    const USE_12H = (root.getAttribute('data-12h') ?? 'true') !== 'false';
    const SHOW_SECONDS = (root.getAttribute('data-seconds') ?? 'true') !== 'false';

    const locale = USE_12H ? 'en-US' : 'en-GB';
    const fmtOpts = {
      timeZone: TZ,
      hour: '2-digit',
      minute: '2-digit',
      hour12: USE_12H
    };
    if (SHOW_SECONDS) fmtOpts.second = '2-digit';

    const fmt = new Intl.DateTimeFormat(locale, fmtOpts);

    function getParts(date = new Date()) {
      const parts = fmt.formatToParts(date);
      let h = '00', m = '00', s = '', period = '';
      for (const p of parts) {
        if (p.type === 'hour') h = p.value;
        else if (p.type === 'minute') m = p.value;
        else if (p.type === 'second') s = p.value;
        else if (p.type === 'dayPeriod') period = p.value.toUpperCase();
      }
      const text = SHOW_SECONDS ? `${h}:${m}:${s}` : `${h}:${m}`;
      return { text, period };
    }

    function render() {
      const { text, period } = getParts();
      el.textContent = text;
      el.setAttribute('datetime', text);

      if (tzEl) {
        if (USE_12H && period) {
          tzEl.textContent = `${period} · WIB`;
          tzEl.setAttribute('aria-label', `Zona waktu WIB, ${period}`);
        } else {
          tzEl.textContent = 'WIB';
          tzEl.setAttribute('aria-label', 'Zona waktu WIB');
        }
      }
    }

    function start() {
      render();
      const ms = 1000 - new Date().getMilliseconds();
      clearTimeout(start._t); clearInterval(start._i);
      start._t = setTimeout(() => {
        render();
        start._i = setInterval(render, 1000);
      }, ms);
    }

    start();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) start();
    });
  }

  // Auto-init untuk elemen dengan id #hero-clock
  document.addEventListener('DOMContentLoaded', () => {
    const single = document.getElementById('hero-clock');
    if (single) initWIBClock(single);

    // Jika ingin banyak jam sekaligus, aktifkan ini:
    // document.querySelectorAll('.hero-clock').forEach(initWIBClock);
  });

  // Ekspor ke global kalau mau inisialisasi manual: window.initWIBClock(el)
  window.initWIBClock = initWIBClock;
})();


// ===== Nav Magic Line =====
(() => {
  const nav  = document.getElementById('site-nav') || document.querySelector('.navigation');
  if (!nav) return;
  const list = nav.querySelector('ul');
  if (!list) return;

  // buat indikator sekali
  let indicator = list.querySelector('.nav-indicator');
  if (!indicator){
    indicator = document.createElement('span');
    indicator.className = 'nav-indicator';
    // hint: biar transisi tak aktif di paint pertama
    indicator.style.transition = 'none';
    indicator.style.opacity = '0';
    list.appendChild(indicator);
  }

  const links = [...list.querySelectorAll('li > a[href]')];
  let active  = list.querySelector('li.active > a') || links[0];

  const mql = window.matchMedia('(max-width: 900px)'); // di mobile indikator disembunyikan via CSS
  const supportsIndicator = () => !mql.matches;

  const isShown = (el) => {
    if (!el || el.hidden) return false;
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  };

  // ukur posisi relatif ke <ul>, ikut scrollLeft biar pas kalau list bisa di-scroll
  const measure = (el) => {
    const r  = el.getBoundingClientRect();
    const pr = list.getBoundingClientRect();
    const left = (r.left - pr.left) + list.scrollLeft;
    const width = r.width;
    return { left, width };
  };

  let firstPaint = true;
  function moveTo(el){
    if (!el || !supportsIndicator() || !isShown(list)) return;
    const { left, width } = measure(el);
    if (!width) return;

    if (firstPaint){
      // non-animated first paint: cegah “loncat”
      indicator.style.transition = 'none';
      indicator.style.width = width + 'px';
      indicator.style.transform = `translateX(${left}px)`;
      indicator.style.opacity = '1';
      // force reflow lalu aktifkan kembali transition CSS
      // eslint-disable-next-line no-unused-expressions
      indicator.offsetHeight;
      indicator.style.transition = '';
      firstPaint = false;
    } else {
      indicator.style.width = width + 'px';
      indicator.style.transform = `translateX(${left}px)`;
      indicator.style.opacity = '1';
    }
  }

  function setActive(el){
    if (!el) return;
    // update class .active di <li>
    const oldLi = active && active.closest('li');
    oldLi && oldLi.classList.remove('active');
    const newLi = el.closest('li');
    newLi && newLi.classList.add('active');
    active = el;
    moveTo(active);
  }

  // inisialisasi posisi (tunggu frame supaya layout ready)
  requestAnimationFrame(() => moveTo(active));

  // hover/focus = geser indikator, lepas = balik ke active
  links.forEach(a => {
    a.addEventListener('mouseenter', () => moveTo(a));
    a.addEventListener('focus',      () => moveTo(a));
    a.addEventListener('mouseleave', () => moveTo(active));
    a.addEventListener('blur',       () => moveTo(active));
    a.addEventListener('click',      () => setActive(a));
  });

  // auto set active berdasar URL (kalau lupa kasih .active di HTML)
  try {
    const here  = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const match = links.find(a => (a.getAttribute('href') || '').toLowerCase().endsWith(here));
    if (match) setActive(match);
  } catch {}

  // reposisi saat resize/scroll (throttle via rAF)
  let rafId = null;
  const onRaf = (fn) => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(fn);
  };
  window.addEventListener('resize', () => onRaf(() => moveTo(active)));
  list.addEventListener('scroll',  () => onRaf(() => moveTo(active)));

  // ketika breakpoint berubah (mobile <-> desktop), reinit
  mql.addEventListener?.('change', () => {
    // saat kembali ke desktop, lakukan firstPaint lagi biar halus
    firstPaint = true;
    requestAnimationFrame(() => moveTo(active));
  });

  // jika nav awalnya hidden (drawer), posisikan saat dibuka
  const mo = new MutationObserver(() => {
    if (isShown(list)) {
      firstPaint = true;
      requestAnimationFrame(() => moveTo(active));
    }
  });
  mo.observe(nav, { attributes: true, attributeFilter: ['hidden', 'class', 'style'] });

  // fonts bisa bikin ukuran link berubah—reposisi setelah fonts siap
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      firstPaint = true;
      moveTo(active);
    });
  }

  // juga tunggu penuh kalau gambar/logo mempengaruhi layout header
  window.addEventListener('load', () => {
    firstPaint = true;
    moveTo(active);
  });
})();



/* newsletter */
(() => {
  const onReady = (fn) =>
    (document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn, { once: true })
      : fn());

  onReady(() => {
    document.querySelectorAll('.widget-newsletter').forEach((box) => {
      const input = box.querySelector('input[type="email"]');
      const btn   = box.querySelector('button, .btn');
      if (!input || !btn) return;

      // ==== No-storage hardening (hapus riwayat lama kalau pernah ada)
      try {
        localStorage.removeItem('nl:email');
        sessionStorage.removeItem('nl:email');
      } catch {}

      // Matikan autofill/auto-correct sebanyak mungkin
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('spellcheck', 'false');
      input.setAttribute('autocorrect', 'off');

      // ------- util
      const isValidEmail = (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(v || '').trim());

      // live region untuk feedback
      let live = box.querySelector('[data-nl-live]');
      if (!live) {
        live = document.createElement('div');
        live.setAttribute('data-nl-live', '');
        live.setAttribute('role', 'status');
        live.setAttribute('aria-live', 'polite');
        live.style.fontSize = '14px';
        live.style.marginTop = '8px';
        live.style.color = 'var(--muted)';
        box.querySelector('.input-group')?.after(live);
      }

      const setMsg = (text, type = 'info') => {
        live.textContent = text;
        live.style.color =
          type === 'ok'    ? 'var(--brand)' :
          type === 'error' ? '#d1495b'      :
                              'var(--muted)';
      };

      const setLoading = (state) => {
        btn.disabled = !!state;
        if (state) {
          btn.dataset._label = btn.textContent;
          btn.setAttribute('aria-busy', 'true');
          btn.textContent = 'Memproses...';
        } else {
          btn.removeAttribute('aria-busy');
          if (btn.dataset._label) btn.textContent = btn.dataset._label;
        }
      };

      const mailtoFallback = (email) => {
        const to = box.dataset.to || 'latifrusdi15@gmail.com';
        const subject = encodeURIComponent('Subscribe Newsletter');
        const body = encodeURIComponent(
          `Halo, saya ingin berlangganan dengan Adam jr | Hair Studio.\nEmail: ${email}\nHalaman: ${location.href}`
        );
        const a = document.createElement('a');
        a.href = `mailto:${to}?subject=${subject}&body=${body}`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
        return true;
      };

      const submit = async () => {
        const email = input.value.trim();
        if (!isValidEmail(email)) {
          setMsg('Alamat email tidak valid. Coba cek lagi ya.', 'error');
          input.focus();
          input.setAttribute('aria-invalid', 'true');
          return;
        }
        input.removeAttribute('aria-invalid');
        setLoading(true);
        setMsg('Mengirim…');

        const endpoint = (box.dataset.endpoint || '').trim();
        let ok = false;

        if (endpoint) {
          try {
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                page: location.href,
                ts: new Date().toISOString()
              }),
              credentials: 'omit',
              mode: 'cors'
            });
            ok = res.ok;
          } catch (_) {
            ok = false;
          }
        } else {
          // tidak ada backend → pakai mailto agar tetap “berfungsi”
          ok = mailtoFallback(email);
        }

        setLoading(false);

        if (ok) {
          setMsg('Terima kasih! Cek inbox kamu ya 🎉', 'ok');
          // bersihkan input & JANGAN simpan kemanapun
          input.value = '';
          try {
            localStorage.removeItem('nl:email');
            sessionStorage.removeItem('nl:email');
          } catch {}
        } else {
          setMsg('Gagal mengirim. Coba lagi atau kontak kami via WhatsApp.', 'error');
        }
      };

      // binding
      btn.addEventListener('click', submit);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
      });
    });
  });
})();



(() => {
  // 1) Fallback untuk iOS Safari lama (alamat bar dinamis)
  if (!CSS.supports('height: 100dvh')) {
    const setVh = () => {
      document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
    };
    setVh();
    window.addEventListener('resize', setVh, { passive: true });
  }

  // 2) Auto mode "sheet" untuk layar sempit
  const mq = window.matchMedia('(max-width:520px)');
  const setSheet = () => {
    document.querySelectorAll('.sa-pop').forEach(el => {
      el.toggleAttribute('data-sheet', mq.matches);
    });
  };
  setSheet();
  mq.addEventListener ? mq.addEventListener('change', setSheet) : mq.addListener(setSheet);
})();
