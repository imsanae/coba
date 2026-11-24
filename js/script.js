/* =================================================================
   PARIS EXPLORER — Interactions & Animations
   ================================================================= */
(function () {
  'use strict';

  /* ---------- Element shortcuts ---------- */
  const $  = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  /* =================================================================
     1. NAVBAR — scrolled background + mobile toggle
     ================================================================= */
  const navbar   = $('#navbar');
  const navToggle = $('#navToggle');
  const navMenu  = $('.nav-menu');

  function onScrollNav() {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close mobile menu when a link is clicked
  $$('.nav-menu .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* =================================================================
     2. ACTIVE NAV LINK — IntersectionObserver on each section
     ================================================================= */
  const sections = $$('section.section[id]');
  const navLinks = $$('.nav-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => {
          l.classList.toggle('active', l.dataset.target === id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => navObserver.observe(sec));

  /* =================================================================
     3. SCROLL PROGRESS BAR
     ================================================================= */
  const progress = $('#scrollProgress span');
  function onScrollProgress() {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct  = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    progress.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScrollProgress, { passive: true });
  onScrollProgress();

  /* =================================================================
     4. REVEAL ON SCROLL — fade / slide / zoom-rotate
     ================================================================= */
  // Polaroids need their target rotation stored as a CSS var so the
  // "zoom-rotate" reveal can animate from scale(0.6) to scale(1) rotate(--rot).
  const polaroidRotations = { p1: '-8deg', p2: '5deg', p3: '-4deg', p4: '8deg' };
  $$('.polaroid').forEach(p => {
    const cls = Array.from(p.classList).find(c => polaroidRotations[c]);
    if (cls) p.style.setProperty('--rot', polaroidRotations[cls]);
  });

  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.revealDelay || '0', 10);
        setTimeout(() => el.classList.add('is-visible'), delay);
        obs.unobserve(el);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

  $$('.reveal').forEach(el => revealObserver.observe(el));

  /* =================================================================
     5. STAT COUNTER ANIMATION — counts up when the stats block is visible
     ================================================================= */
  const statValues = $$('.stat-value');
  let countersStarted = false;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();

    function format(v) {
      if (decimals > 0) {
        // Indonesian decimal comma
        return v.toFixed(decimals).replace('.', ',');
      }
      // Plain integer (no thousand separator — works for years like 1889)
      return Math.round(v).toString();
    }

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const v = target * easeOutCubic(t);
      el.textContent = format(v) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = format(target) + suffix;
    }
    requestAnimationFrame(tick);
  }

  const statsBlock = $('.stats');
  if (statsBlock) {
    const statsObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersStarted) {
          countersStarted = true;
          statValues.forEach((el, i) => {
            setTimeout(() => animateCounter(el), 200 + i * 220);
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statsObserver.observe(statsBlock);
  }

  /* =================================================================
     6. HERO PARALLAX — subtle background drift on scroll
     ================================================================= */
  const heroBg = $('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroBg.style.transform = `scale(1.06) translateY(${y * 0.18}px)`;
      }
    }, { passive: true });
  }

  /* =================================================================
     7. SMOOTH SCROLL — for in-page anchor clicks
        (Native CSS scroll-behavior handles most; this adds offset for navbar)
     ================================================================= */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* =================================================================
     8. KONTAK FORM — fake submit with feedback
     ================================================================= */
  const form = $('#kontakForm');
  const feedback = $('#formFeedback');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      let valid = true;
      for (const [k, v] of data.entries()) {
        if (!String(v).trim()) valid = false;
      }
      if (!valid) {
        feedback.hidden = false;
        feedback.textContent = 'Mohon lengkapi semua kolom terlebih dahulu.';
        feedback.style.color = '#ffb4b4';
        feedback.style.borderColor = '#ffb4b4';
        return;
      }
      feedback.hidden = false;
      feedback.textContent = 'Terima kasih! Pesan Anda telah dikirim. Kami akan segera menghubungi Anda.';
      feedback.style.color = '';
      feedback.style.borderColor = '';
      form.reset();
    });
  }

  /* =================================================================
     9. NEWS CARD TILT — gentle 3D tilt on hover (desktop only)
     ================================================================= */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.news-card, .dest-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform = `translateY(-6px) perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* =================================================================
     10. KEYBOARD: Escape closes mobile nav
     ================================================================= */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

})();
