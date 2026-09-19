(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (header && toggle && nav) {
    const mobile = window.matchMedia('(max-width: 900px)');
    const closeMenu = () => {
      if (mobile.matches && nav.contains(document.activeElement)) toggle.focus();
      nav.classList.remove('open');
      nav.inert = mobile.matches;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'Menu';
    };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      nav.classList.toggle('open', open);
      nav.inert = mobile.matches && !open;
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
    mobile.addEventListener('change', () => {
      const toggleFocused = document.activeElement === toggle;
      closeMenu();
      if (!mobile.matches && toggleFocused) nav.querySelector('a').focus();
    });
    closeMenu();
    header.classList.add('nav-ready');
    toggle.hidden = false;
  }

  // Keep content visible: observer-triggered reveals can hide an already painted
  // element and override its hover transform. Motion belongs to interactions.
})();
