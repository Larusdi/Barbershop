/* Logika tombol toggle tema + sinkron dengan sistem */
(function () {
  const html = document.documentElement;
  const btn  = document.getElementById('theme-toggle');

  const getPreferred = () => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const setTheme = (mode) => {
    html.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
    // aria-pressed: true ketika mode gelap (tombol dalam keadaan "aktif")
    btn.setAttribute('aria-pressed', String(mode === 'dark'));
  };

  // Pasang awal
  setTheme(getPreferred());

  // Helper: trigger animasi pop ke ikon aktif
  const popActiveIcon = () => {
    const sun  = btn.querySelector('.icon.sun');
    const moon = btn.querySelector('.icon.moon');
    // reset kelas dulu biar anim bisa retrigger
    sun.classList.remove('-pop');
    moon.classList.remove('-pop');
    // reflow (hack) agar anim ulang
    void sun.offsetWidth; void moon.offsetWidth;

    const active = (html.getAttribute('data-theme') === 'dark') ? moon : sun;
    active.classList.add('-pop');
  };

  // Jalankan pop pada initial mount biar terasa hidup (opsional)
  popActiveIcon();

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme') || getPreferred();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    popActiveIcon();
  });

  // Jika user mengubah preferensi OS di runtime, sinkronkan (opsional)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const saved = localStorage.getItem('theme');
    if (!saved) {               // hanya sinkron kalau user belum paksa manual
      setTheme(e.matches ? 'dark' : 'light');
      popActiveIcon();
    }
  });
})();
