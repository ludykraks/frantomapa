(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (header && toggle && nav) {
    const closeMenu = () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'Menu';
    };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        closeMenu();
        toggle.focus();
      }
    });
    document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
    header.addEventListener('focusout', event => { if (!header.contains(event.relatedTarget)) closeMenu(); });
    window.matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);
    header.classList.add('nav-ready');
    toggle.hidden = false;
  }

  // Content is visible by default, including when scripts or motion are disabled.
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const active = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (motion.matches) continue;
      const animation = entry.target.animate([
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 550, easing: 'cubic-bezier(.2,.7,.2,1)' });
      active.add(animation);
      animation.onfinish = animation.oncancel = () => active.delete(animation);
    }
  }, { threshold: 0.12 });
  document.querySelectorAll('.hero-copy, .hero-visual, .page-hero > *, .intro-grid > *, .card, .purpose-item, .focus-grid li, .person-card, .story-grid > *, .report-panel, .contact-grid > div').forEach(element => observer.observe(element));
  motion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    active.forEach(animation => animation.cancel());
    active.clear();
  });
})();
