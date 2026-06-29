// ================================
// SB CONSTRUCTION – PREMIUM SCRIPTS
// ================================

/* ── CINEMATIC INTRO LOADER ── */
(function () {
  const loader = document.getElementById('intro-loader');
  const canvas = document.getElementById('intro-canvas');
  const logo = document.querySelector('.intro-logo');
  const glow = document.getElementById('introGlow');
  const lines = document.querySelector('.intro-lines');
  const curtainTop = document.getElementById('introCurtainTop');
  const curtainBot = document.getElementById('introCurtainBot');
  if (!loader || !canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    loader.classList.add('done'); return;
  }

  // ── CANVAS PARTICLE SPARKS ──
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], raf;

  function resize() {
    W = canvas.width = loader.offsetWidth;
    H = canvas.height = loader.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function Particle() {
    this.reset = function () {
      this.x = W * (0.2 + Math.random() * 0.6);
      this.y = H * (0.4 + Math.random() * 0.35);
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = -(Math.random() * 1.8 + 0.5);
      this.life = 0;
      this.maxLife = 80 + Math.random() * 80;
      this.size = Math.random() * 2.5 + 0.5;
      this.hue = 20 + Math.random() * 25; // orange to amber
    };
    this.reset();
  }
  for (let i = 0; i < 55; i++) {
    const p = new Particle();
    p.life = Math.random() * p.maxLife; // stagger initial states
    particles.push(p);
  }

  let loaderDone = false;
  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.life++;
      if (p.life > p.maxLife) p.reset();
      const alpha = Math.sin((p.life / p.maxLife) * Math.PI);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${alpha * 0.8})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      p.vx += (Math.random() - 0.5) * 0.06;
    });
    if (!loaderDone) raf = requestAnimationFrame(drawParticles);
    else ctx.clearRect(0, 0, W, H);
  }
  drawParticles();

  // ── TIMELINE ──
  // t=50ms   → logo fades up
  // t=300ms  → orange glow erupts
  // t=500ms  → diagonal lines sweep
  // t=1100ms → hero image starts fading in behind curtains
  // t=1350ms → curtains rip apart (revealing already-faded-in image)
  // t=2000ms → loader fades out
  // t=2100ms → hero text / elements animate in staggered
  // t=2300ms → nav bar fades in

  requestAnimationFrame(() => {
    setTimeout(() => { logo.classList.add('visible'); }, 50);
    setTimeout(() => { glow.classList.add('active'); }, 300);
    setTimeout(() => { lines.classList.add('active'); }, 500);

    // Fade in hero image BEFORE curtain opens so it's ready
    setTimeout(() => {
      const heroMedia = document.querySelector('.hero-media');
      if (heroMedia) heroMedia.classList.add('reveal');
    }, 1100);

    // Curtain rip
    setTimeout(() => {
      curtainTop.classList.add('exit');
      curtainBot.classList.add('exit');
    }, 1350);

    // Fade out loader (overlaps curtain exit for seamless blend)
    setTimeout(() => {
      loader.classList.add('done');
      loaderDone = true;
      cancelAnimationFrame(raf);
    }, 2000);

    // Hero text elements stagger in
    setTimeout(() => {
      triggerHeroAnimations();
    }, 2100);

    // Nav fades in last
    setTimeout(() => {
      const nav = document.getElementById('site-header');
      if (nav) nav.classList.add('reveal');
    }, 2300);
  });
})();

/* ── HERO ELEMENT ANIMATIONS (called after intro finishes) ── */
function triggerHeroAnimations() {
  const items = document.querySelectorAll('.hero-anim-item');
  items.forEach(el => {
    const delay = parseInt(el.dataset.animDelay || '0', 10);
    setTimeout(() => el.classList.add('in'), delay);
  });
  // Diagonal lines in hero
  document.querySelectorAll('.hero-diag').forEach(d => d.classList.add('active'));
  // Floating icon
  const icon = document.querySelector('.hero-float-icon');
  if (icon) icon.classList.add('active');
}

/* ── HERO PARTICLES (ambient — runs after intro) ── */
(function () {
  const canvas = document.getElementById('heroParticles');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    const hero = canvas.closest('.hero');
    W = canvas.width = hero ? hero.offsetWidth : window.innerWidth;
    H = canvas.height = hero ? hero.offsetHeight : window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const NUM = 35;
  const particles = [];
  function Particle() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = -(Math.random() * 0.4 + 0.1);
    this.size = Math.random() * 1.8 + 0.3;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.hue = 20 + Math.random() * 30;
    this.drift = (Math.random() - 0.5) * 0.008;
  }
  for (let i = 0; i < NUM; i++) particles.push(new Particle());

  // Start particles after intro fully settles
  setTimeout(() => {
    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${p.alpha})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.vx += p.drift;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
      });
      requestAnimationFrame(draw);
    }
    draw();
  }, 2200);
})();

/* ── THEME TOGGLE ── */
(function () {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);
  function updateIcon() {
    if (!toggle) return;
    toggle.innerHTML = theme === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
  updateIcon();
  toggle && toggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    updateIcon();
  });
})();

/* ── STICKY HEADER ── */
(function () {
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 10), { passive: true });
})();

/* ── MOBILE NAV ── */
(function () {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('mobile-nav');
  let open = false;
  toggle && toggle.addEventListener('click', () => {
    open = !open;
    nav.classList.toggle('open', open);
    nav.setAttribute('aria-hidden', String(!open));
    const spans = toggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      spans[0].style.transform = ''; spans[1].style.opacity = ''; spans[2].style.transform = '';
    }
  });
  nav && nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      open = false; nav.classList.remove('open'); nav.setAttribute('aria-hidden','true');
      const spans = toggle.querySelectorAll('span');
      spans[0].style.transform=''; spans[1].style.opacity=''; spans[2].style.transform='';
    });
  });
})();

/* ── HERO IMAGE ZOOM ON SCROLL ── */
(function () {
  const img = document.getElementById('heroImg');
  const hero = document.querySelector('.hero');
  if (!img || !hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroH = hero.offsetHeight;
    const progress = Math.min(scrolled / heroH, 1);
    // Zoom from 1 → 1.18 as you scroll out of hero
    const scale = 1 + progress * 0.18;
    // Parallax shift upward
    const translateY = scrolled * 0.35;
    img.style.transform = `translateY(${translateY}px) scale(${scale})`;
  }, { passive: true });
})();

/* ── STICKY SCROLL SECTION ── */
(function () {
  const steps = document.querySelectorAll('.sticky-step');
  const imgs = document.querySelectorAll('.sticky-img');
  if (!steps.length || !imgs.length) return;

  let currentStep = 0;

  function setStep(n) {
    if (n === currentStep) return;
    currentStep = n;
    steps.forEach((s, i) => s.classList.toggle('active', i === n));
    imgs.forEach((img, i) => img.classList.toggle('active', i === n));
  }

  // Activate first step immediately
  steps[0].classList.add('active');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const n = parseInt(entry.target.dataset.step);
        setStep(n);
      }
    });
  }, { threshold: 0.5 });

  steps.forEach(step => obs.observe(step));
})();



/* ── MAGNETIC BUTTONS ── */
(function () {
  const btns = document.querySelectorAll('.magnetic-btn');
  if (window.matchMedia('(pointer: coarse)').matches) return;
  btns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();

/* ── SCROLL REVEAL ── */
(function () {
  const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
})();

/* ── COUNTER ANIMATION ── */
(function () {
  const counters = document.querySelectorAll('.counter');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const startTime = performance.now();
      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
})();

/* ── BEFORE / AFTER SLIDER ── */
(function () {
  const slider = document.getElementById('baSlider');
  const handle = document.getElementById('baHandle');
  const before = slider && slider.querySelector('.ba-before');
  if (!slider || !handle || !before) return;

  let isDragging = false;
  let pct = 50;

  function setPos(x) {
    const rect = slider.getBoundingClientRect();
    pct = Math.max(5, Math.min(95, ((x - rect.left) / rect.width) * 100));
    before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = pct + '%';
  }

  handle.addEventListener('mousedown', e => { isDragging = true; e.preventDefault(); });
  handle.addEventListener('touchstart', e => { isDragging = true; }, { passive: true });
  window.addEventListener('mousemove', e => { if (isDragging) setPos(e.clientX); });
  window.addEventListener('touchmove', e => { if (isDragging) setPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('touchend', () => { isDragging = false; });
  slider.addEventListener('click', e => setPos(e.clientX));

  // Keyboard accessibility
  handle.setAttribute('tabindex', '0');
  handle.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { pct = Math.max(5, pct - 5); before.style.clipPath = `inset(0 ${100-pct}% 0 0)`; handle.style.left = pct + '%'; }
    if (e.key === 'ArrowRight') { pct = Math.min(95, pct + 5); before.style.clipPath = `inset(0 ${100-pct}% 0 0)`; handle.style.left = pct + '%'; }
  });
})();

/* ── HORIZONTAL GALLERY (DRAG) ── */
(function () {
  const wrap = document.getElementById('galleryWrap');
  const track = document.getElementById('galleryTrack');
  if (!wrap || !track) return;

  let isDown = false;
  let startX, scrollLeft;

  wrap.addEventListener('mousedown', e => {
    isDown = true; wrap.style.cursor = 'grabbing';
    startX = e.pageX - wrap.offsetLeft;
    scrollLeft = wrap.scrollLeft;
    e.preventDefault();
  });
  wrap.addEventListener('mouseleave', () => { isDown = false; wrap.style.cursor = 'grab'; });
  wrap.addEventListener('mouseup', () => { isDown = false; wrap.style.cursor = 'grab'; });
  wrap.addEventListener('mousemove', e => {
    if (!isDown) return;
    const x = e.pageX - wrap.offsetLeft;
    const dist = (x - startX) * 1.2;
    wrap.scrollLeft = scrollLeft - dist;
  });

  // Touch
  let touchStartX = 0, touchScrollLeft = 0;
  wrap.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].pageX;
    touchScrollLeft = wrap.scrollLeft;
  }, { passive: true });
  wrap.addEventListener('touchmove', e => {
    const x = e.touches[0].pageX;
    wrap.scrollLeft = touchScrollLeft - (x - touchStartX);
  }, { passive: true });

  // Make wrap scrollable
  wrap.style.overflowX = 'auto';
  wrap.style.scrollbarWidth = 'none';
  wrap.style.webkitOverflowScrolling = 'touch';
  const style = document.createElement('style');
  style.textContent = '#galleryWrap::-webkit-scrollbar{display:none}';
  document.head.appendChild(style);
})();

/* ── TESTIMONIALS CAROUSEL ── */
(function () {
  const track = document.getElementById('testimonialsTrack');
  const dotsContainer = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (!track || !dotsContainer) return;

  const cards = track.querySelectorAll('.testimonial-card');
  let current = 0;

  function getVisible() {
    if (window.innerWidth < 600) return 1;
    if (window.innerWidth < 900) return 2;
    return 3;
  }

  function totalSlides() { return Math.ceil(cards.length / getVisible()); }

  function buildDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides(); i++) {
      const d = document.createElement('div');
      d.className = 'carousel-dot' + (i === current ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(d);
    }
  }

  function goTo(n) {
    current = Math.max(0, Math.min(n, totalSlides() - 1));
    const cardW = cards[0].offsetWidth + 24; // gap is 24px (--space-6)
    track.style.transform = `translateX(-${current * getVisible() * cardW}px)`;
    dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn && prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn && nextBtn.addEventListener('click', () => goTo(current + 1));

  // Auto-advance
  let autoInterval = setInterval(() => goTo((current + 1) % totalSlides()), 5000);
  track.addEventListener('mouseenter', () => clearInterval(autoInterval));
  track.addEventListener('mouseleave', () => { autoInterval = setInterval(() => goTo((current + 1) % totalSlides()), 5000); });

  buildDots();
  window.addEventListener('resize', () => { current = 0; buildDots(); goTo(0); });
})();

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ── TEL / MAILTO PROTECTION ── */
document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').forEach(link => {
  link.addEventListener('click', e => e.stopPropagation());
});

/* ── CONTACT FORM ── */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Opening email…';
    const name    = form.querySelector('#name').value.trim();
    const phone   = form.querySelector('#phone').value.trim();
    const email   = form.querySelector('#email').value.trim();
    const service = form.querySelector('#service').value;
    const message = form.querySelector('#message').value.trim();
    const subject = encodeURIComponent('Quote Request – ' + (service || 'General Enquiry') + ' | SB Construction');
    const body = encodeURIComponent(
      'Hi Sandhu Brothers,\n\nI would like to request a quote for the following:\n\n' +
      'Name: ' + name + '\nPhone: ' + phone + (email ? '\nEmail: ' + email : '') +
      '\nService: ' + (service || 'Not specified') +
      '\n\nProject Details:\n' + (message || 'No additional details provided.') +
      '\n\nKind regards,\n' + name
    );
    window.open('mailto:sbconstruction0001@gmail.com?subject=' + subject + '&body=' + body, '_self');
    setTimeout(() => {
      form.innerHTML = `
        <div class="form-success">
          <div class="form-success-icon">✅</div>
          <h3>Thanks, ${name || 'there'}!</h3>
          <p>Your email client has opened with your quote pre-filled. Just hit send!</p>
          <p style="margin-top:12px;font-size:var(--text-xs);color:var(--color-text-faint);">Or call us on <a href="tel:0497579997" style="color:var(--color-primary);font-weight:700;">0497 579 997</a></p>
        </div>`;
    }, 800);
  });
})();

/* ── EDITORIAL HERO EXTRAS ── */
// Activate bg ghost word + floating card after intro
(function() {
  setTimeout(() => {
    const bgWord = document.querySelector('.hero-bg-word');
    const floatCard = document.querySelector('.hero-float-card');
    if (bgWord) bgWord.classList.add('active');
    if (floatCard) floatCard.classList.add('active');
  }, 2400);

  // Subtle parallax on float card with mouse move
  const floatCard = document.querySelector('.hero-float-card');
  const hero = document.querySelector('.hero');
  if (!floatCard || !hero || window.matchMedia('(pointer: coarse)').matches) return;
  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (e.clientX - rect.left - cx) / cx;
    const dy = (e.clientY - rect.top - cy) / cy;
    floatCard.style.transform = `translateY(${dy * -18}px) translateX(${dx * 10}px) rotate(${2 + dx * 1.5}deg)`;
  });
  hero.addEventListener('mouseleave', () => {
    floatCard.style.transform = '';
  });
})();
