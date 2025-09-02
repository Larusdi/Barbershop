// js/hero-rotator.js
(function(){
  const el = document.getElementById('hero-rotator');
  if(!el) return;

  // Ambil daftar kalimat dari data-phrases
  let phrases;
  try {
    phrases = JSON.parse(el.dataset.phrases || '[]');
  } catch(e) {
    phrases = [];
  }
  if(!phrases.length) return;

  // Konfigurasi durasi
  const DURATION_VISIBLE = 3200;     // jeda teks tampil (ms)
  const DURATION_OUT     = 220;      // lama fade out (ms) -> samakan dengan CSS .22s
  const DURATION_IN      = 240;      // lama fade in  (ms) -> samakan dengan CSS .24s

  // Respect prefers-reduced-motion
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const visibleTime  = reduceMotion ? 4000 : DURATION_VISIBLE;

  // Mulai dari kalimat pertama (yang sudah jadi fallback di HTML)
  let index = 0;
  let timer = null;
  let running = false;

  // Pause saat hover/focus
  const container = el.closest('.hero-text') || el;
  let paused = false;
  container.addEventListener('mouseenter', () => { paused = true;  stop(); });
  container.addEventListener('mouseleave', () => { paused = false; start(); });
  container.addEventListener('focusin',  () => { paused = true;  stop(); });
  container.addEventListener('focusout', () => { paused = false; start(); });

  // Hanya jalan saat hero terlihat di viewport (hemat resource)
  const hero = document.getElementById('hero') || document.querySelector('.hero-section');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        start();
      }else{
        stop();
      }
    });
  }, { threshold: 0.1 });
  if(hero) io.observe(hero);

  function cycle(){
    if(paused) return; // akan di-resume saat hover/focus lepas

    // Next index
    index = (index + 1) % phrases.length;

    // Animasi keluar
    el.classList.remove('is-entering');
    el.classList.add('is-leaving');

    setTimeout(()=>{
      // Ganti teks saat sudah hilang
      el.textContent = phrases[index];

      // Animasi masuk
      el.classList.remove('is-leaving');
      el.classList.add('is-entering');

      // Jadwalkan putaran berikutnya
      timer = setTimeout(cycle, visibleTime);
    }, DURATION_OUT);
  }

  function start(){
    if(running || reduceMotion) return; // kalau reduce motion, jangan auto-rotate
    running = true;
    // Mulai jeda awal agar user sempat baca teks pertama
    timer = setTimeout(cycle, visibleTime);
  }
  function stop(){
    running = false;
    clearTimeout(timer);
  }
})();