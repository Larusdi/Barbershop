/* Logika tombol toggle tema + sinkron dengan sistem */
(function () {
  function init() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    var root = document.documentElement;
    var mq = window.matchMedia('(prefers-color-scheme: dark)');

    function getCurrent() {
      var forced = root.getAttribute('data-theme'); // 'light' | 'dark' | null
      if (forced) return forced;
      return mq.matches ? 'dark' : 'light'; // ikut sistem bila tidak dipaksa
    }

    function setTheme(mode) { // 'light' | 'dark' | '' (ikut sistem)
      if (mode === 'light' || mode === 'dark') {
        root.setAttribute('data-theme', mode);
        try { localStorage.setItem('theme', mode); } catch (e) {}
        btn.setAttribute('aria-pressed', String(mode === 'dark'));
      } else {
        root.removeAttribute('data-theme');
        try { localStorage.removeItem('theme'); } catch (e) {}
        btn.setAttribute('aria-pressed', String(getCurrent() === 'dark'));
      }
    }

    // Inisialisasi state tombol
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) {}
    setTheme(saved || ''); // '' = ikut sistem

    // Klik = toggle
    btn.addEventListener('click', function () {
      var next = (getCurrent() === 'dark') ? 'light' : 'dark';
      setTheme(next);
    });

    // Jika user tidak memaksa tema, ikut perubahan sistem secara live
    function onChange() {
      var hasSaved = false;
      try { hasSaved = !!localStorage.getItem('theme'); } catch (e) {}
      if (!hasSaved) setTheme(''); // tetap ikut sistem
    }
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();