(() => {
  const els = document.querySelectorAll('[data-aoe], [data-aoe-stagger]');
  if (!els.length) return;

  // observer: retrigger (masuk=on, keluar=off), jadi animasi juga saat scroll ke atas
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const el = entry.target;
      const inview = entry.isIntersecting && entry.intersectionRatio > 0.12;
      const once = el.getAttribute('data-aoe-once') === 'true';

      // STAGGER container
      if (el.hasAttribute('data-aoe-stagger')) {
        if (inview) {
          el.classList.add('is-inview');
          const gap = parseInt(el.getAttribute('data-aoe-stagger'), 10) || 70;
          [...el.children].forEach((child, i) => {
            child.style.transitionDelay = `${i * gap}ms`;
          });
        } else if (!once) {
          el.classList.remove('is-inview');
          [...el.children].forEach((child) => (child.style.transitionDelay = '0ms'));
        }
        return;
      }

      // ELEM tunggal
      if (inview) {
        const delay = el.getAttribute('data-aoe-delay');
        if (delay) el.style.transitionDelay = `${parseInt(delay, 10)}ms`;
        el.classList.add('is-inview');
      } else if (!once) {
        el.classList.remove('is-inview');
        el.style.transitionDelay = '0ms';
      }
    });
  }, { threshold: [0, 0.12, 0.25], rootMargin: '0px 0px -10% 0px' });

  els.forEach((el) => io.observe(el));

  // opsional: set arah scroll untuk styling lanjutan (html[data-scroll-dir])
  let lastY = window.scrollY;
  const onScroll = () => {
    const dir = window.scrollY > lastY ? 'down' : 'up';
    const root = document.documentElement;
    if (root.dataset.scrollDir !== dir) root.dataset.scrollDir = dir;
    lastY = window.scrollY;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();