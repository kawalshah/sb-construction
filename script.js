// ================================
// SB CONSTRUCTION – PREMIUM SCRIPTS v4 (fixed)
// ================================

/* ══════════════════════════════════════════════════
   CINEMATIC INTRO — BUILDING CONSTRUCTION ANIMATION
   Hard timeout: site ALWAYS shows within 2.8s max.
══════════════════════════════════════════════════ */
(function () {
  const loader = document.getElementById('intro-loader');
  if (!loader) { revealHero(); return; }

  // HARD TIMEOUT — site always shows regardless of animation errors
  const HARD_LIMIT = 2800; // ms max before forced reveal
  const hardTimer = setTimeout(() => {
    loader.classList.add('done');
    setTimeout(() => { loader.style.display = 'none'; }, 600);
    revealHero();
  }, HARD_LIMIT);

  // Reduced motion: skip immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    clearTimeout(hardTimer);
    loader.classList.add('done');
    setTimeout(() => { loader.style.display = 'none'; revealHero(); }, 400);
    return;
  }

  const canvas = document.getElementById('intro-canvas');
  if (!canvas) { clearTimeout(hardTimer); revealHero(); return; }

  let ctx;
  try { ctx = canvas.getContext('2d'); } catch(e) {
    clearTimeout(hardTimer); loader.classList.add('done'); revealHero(); return;
  }

  let W, H;
  function resize() {
    W = canvas.width  = loader.offsetWidth  || window.innerWidth;
    H = canvas.height = loader.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Colours
  const C = {
    ground: '#1c1a17', concrete: '#2c2924', steel: '#3d3a36',
    steelHi: '#5a5550', orange: '#E85D04', crane: '#4a4540', craneYel: '#f0b800',
    dust: 'rgba(190,150,90,',
  };

  // Dust particles
  const dust = [];
  function spawnDust(x, y, n) {
    for (let i = 0; i < (n||8); i++) {
      dust.push({ x, y, vx:(Math.random()-0.5)*3, vy:-(Math.random()*2+0.5),
        life:0, maxLife:24+Math.random()*24, size:Math.random()*3+1 });
    }
  }
  function tickDust() {
    for (let i = dust.length-1; i >= 0; i--) {
      const p = dust[i]; p.life++;
      if (p.life > p.maxLife) { dust.splice(i,1); continue; }
      const a = (1-p.life/p.maxLife)*0.45;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.fillStyle = C.dust+a+')'; ctx.fill();
      p.x+=p.vx; p.y+=p.vy; p.vx*=0.96; p.vy*=0.96;
    }
  }

  function metrics() {
    const bW=Math.min(W*0.42,240), bH=Math.min(H*0.55,310);
    const groundY=H*0.74, bX=(W-bW)/2;
    const floors=5, floorH=bH/floors;
    return {bW,bH,bX,bY:groundY-bH,groundY,floors,floorH};
  }

  // 5 phases, 280ms each = 1.4s animation, then ~1s for logo+curtain = ~2.4s total
  const PHASES = 5;
  const LABELS = ['Foundation…','Steel Frame…','Glass Facade…','Finishing…','Complete.'];
  const PHASE_MS = 280;
  let phase=0, phaseP=0, lastT=null, raf, done=false;

  function drawScene(ph, pp) {
    ctx.clearRect(0,0,W,H);
    const {bW,bH,bX,groundY,floors,floorH} = metrics();

    // Sky
    const sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#040302'); sky.addColorStop(1,'#0f0d0a');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);

    // Stars
    for(let s=0;s<40;s++){
      const sx=((s*137.5)%1)*W, sy=((s*93.7)%1)*groundY*0.7;
      const sa=Math.max(0,0.45-ph*0.08);
      ctx.beginPath(); ctx.arc(sx,sy,0.7,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${sa*((s*61.3)%0.4+0.1)})`; ctx.fill();
    }

    // Ground
    ctx.fillStyle=C.ground; ctx.fillRect(0,groundY,W,H-groundY);
    ctx.strokeStyle=C.steel; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(0,groundY); ctx.lineTo(W,groundY); ctx.stroke();

    const fPad = bW*0.06;
    const slabH = 10;

    // Phase 0: Foundation trench + slab
    const slabF = ph===0 ? pp : (ph>0?1:0);
    ctx.fillStyle='#0b0908';
    ctx.fillRect(bX-fPad, groundY, bW+fPad*2, 22*Math.min(slabF*2,1));
    ctx.fillStyle=C.concrete;
    ctx.fillRect(bX-fPad, groundY-slabH, (bW+fPad*2)*slabF, slabH);
    if(ph<1) return;

    // Phase 1: Steel frame rising floor by floor
    const frameF = ph===1 ? Math.round(floors*pp) : floors;
    for(let f=0;f<frameF;f++){
      const fp = ph===1 ? Math.max(0,Math.min(1, pp*floors-f)) : 1;
      const baseY = groundY-slabH;
      ctx.fillStyle=C.steel;
      ctx.fillRect(bX, baseY-floorH*(f+1), 5, floorH*fp);
      ctx.fillRect(bX+bW-5, baseY-floorH*(f+1), 5, floorH*fp);
      if(fp>=0.85){ ctx.fillStyle=C.steelHi; ctx.fillRect(bX,baseY-floorH*(f+1),bW,4); }
    }
    // Cross bracing
    ctx.strokeStyle='rgba(85,80,75,0.35)'; ctx.lineWidth=1.5; ctx.setLineDash([4,5]);
    for(let f=0;f<Math.min(frameF,floors);f++){
      const fy=groundY-slabH-floorH*f;
      ctx.beginPath(); ctx.moveTo(bX+8,fy); ctx.lineTo(bX+bW/2,fy-floorH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bX+bW-8,fy); ctx.lineTo(bX+bW/2,fy-floorH); ctx.stroke();
    }
    ctx.setLineDash([]);
    if(ph<2) return;

    // Phase 2: Glass facade panels
    const totalPanels = floors*4;
    const drawnP = ph===2 ? Math.round(totalPanels*pp) : totalPanels;
    const panW=(bW-12)/4;
    for(let i=0;i<drawnP&&i<totalPanels;i++){
      const f=Math.floor(i/4), p=i%4;
      const px=bX+6+p*panW, py=groundY-slabH-(f+1)*floorH+6;
      const pw=panW-3, phh=floorH-10;
      const grd=ctx.createLinearGradient(px,py,px+pw,py+phh);
      grd.addColorStop(0,'rgba(70,130,190,0.14)');
      grd.addColorStop(0.5,'rgba(130,195,255,0.32)');
      grd.addColorStop(1,'rgba(50,90,150,0.18)');
      ctx.fillStyle=grd; ctx.fillRect(px,py,pw,phh);
      ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.fillRect(px,py,pw*0.14,phh);
    }
    ctx.strokeStyle=C.steelHi; ctx.lineWidth=2;
    ctx.strokeRect(bX, groundY-slabH-bH, bW, bH);
    if(ph<3) return;

    // Phase 3: Finishing touches
    const fp3 = ph===3?pp:1;
    ctx.fillStyle=`rgba(232,93,4,${0.8*fp3})`;
    ctx.fillRect(bX, groundY-slabH-bH*0.45, 5, bH*0.45*fp3);
    ctx.fillRect(bX+bW-5, groundY-slabH-bH*0.45, 5, bH*0.45*fp3);
    ctx.fillStyle=C.concrete;
    ctx.fillRect(bX-4, groundY-slabH-bH-8, (bW+8)*fp3, 8);
    // Window glow
    for(let f=0;f<floors;f++){
      const fy=groundY-slabH-(f+1)*floorH+floorH*0.2;
      const grd=ctx.createRadialGradient(bX+bW/2,fy+floorH*0.4,0,bX+bW/2,fy+floorH*0.4,bW*0.5);
      grd.addColorStop(0,`rgba(232,93,4,${0.07*fp3})`); grd.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=grd; ctx.fillRect(bX-bW*0.15,fy,bW*1.3,floorH);
    }
    const bg=ctx.createRadialGradient(W/2,groundY,0,W/2,groundY,W*0.45);
    bg.addColorStop(0,`rgba(232,93,4,${0.18*fp3})`); bg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=bg; ctx.fillRect(0,groundY-50,W,90);
    if(ph<4) return;

    // Phase 4: Full ambient glow
    const fp4=ph===4?pp:1;
    const hGlow=ctx.createRadialGradient(W/2,groundY-slabH-bH/2,0,W/2,groundY-slabH-bH/2,bW);
    hGlow.addColorStop(0,`rgba(232,93,4,${0.1*fp4})`); hGlow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=hGlow; ctx.fillRect(bX-bW*0.6,groundY-slabH-bH-20,bW*2.2,bH+20);
  }

  function drawCrane() {
    const {bX,bW,bH,groundY}=metrics();
    const cx=bX+bW+18, cy=groundY, mH=bH+50;
    ctx.strokeStyle=C.crane; ctx.lineCap='round';
    ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx,cy-mH); ctx.stroke();
    const jibL=bW*0.5+32;
    ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(cx+jibL,cy-mH+10); ctx.lineTo(cx-bW*0.35,cy-mH+10); ctx.stroke();
    const t=Date.now()/1000;
    const trolleyX=cx+jibL-(jibL*(Math.sin(t*0.5)*0.4+0.5)*0.65);
    const hookL=22+Math.abs(Math.sin(t*0.7))*18;
    ctx.strokeStyle=C.craneYel; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(trolleyX,cy-mH+10); ctx.lineTo(trolleyX,cy-mH+10+hookL); ctx.stroke();
    ctx.fillStyle=C.craneYel; ctx.fillRect(trolleyX-4,cy-mH+10+hookL,8,6);
    ctx.fillRect(cx-10,cy-mH+12,20,14);
  }

  const progressBar = document.querySelector('.intro-progress-bar');
  const phaseLabel  = document.querySelector('.intro-phase-label');

  function animate(ts) {
    if (done) return;
    try {
      if(!lastT) lastT=ts;
      const dt = Math.min(ts-lastT, 100);
      lastT=ts;
      phaseP += dt/PHASE_MS;
      if(phaseP>=1){
        phaseP=0; phase++;
        if(phase>0 && phase<4){
          const {bX,bW,groundY,floorH}=metrics();
          spawnDust(bX+bW/2, groundY-floorH*(phase), 10);
        }
      }
      const gP=Math.min((phase+phaseP)/PHASES, 1);
      if(progressBar) progressBar.style.width=(gP*100)+'%';
      if(phaseLabel && phase<LABELS.length) phaseLabel.textContent=LABELS[phase];
      drawScene(phase, phaseP);
      drawCrane();
      tickDust();
      if(phase < PHASES) {
        raf=requestAnimationFrame(animate);
      } else {
        finishIntro();
      }
    } catch(e) {
      // If anything crashes, immediately show the site
      console.warn('Intro animation error:', e);
      done=true;
      clearTimeout(hardTimer);
      loader.classList.add('done');
      setTimeout(()=>{ loader.style.display='none'; },500);
      revealHero();
    }
  }
  raf=requestAnimationFrame(animate);

  function finishIntro() {
    if (done) return;
    done = true;
    clearTimeout(hardTimer);
    cancelAnimationFrame(raf);

    // Draw final frame
    try { drawScene(4,1); drawCrane(); } catch(e){}

    if(progressBar) progressBar.style.width='100%';
    if(phaseLabel) phaseLabel.textContent='Complete.';

    // Logo flash
    const finalLogo=document.querySelector('.intro-final-logo');
    if(finalLogo) setTimeout(()=>finalLogo.classList.add('visible'), 150);

    // Fade in hero image behind curtains
    setTimeout(()=>{
      const hm=document.querySelector('.hero-media');
      if(hm) hm.classList.add('reveal');
    }, 400);

    // Curtain rip
    setTimeout(()=>{
      document.getElementById('introCurtainTop')?.classList.add('exit');
      document.getElementById('introCurtainBot')?.classList.add('exit');
    }, 700);

    // Fade out loader
    setTimeout(()=>{
      loader.classList.add('done');
      setTimeout(()=>{ loader.style.display='none'; },600);
    }, 900);

    // Reveal hero content
    setTimeout(revealHero, 1000);
  }

  function revealHero() {
    // Brand overlay lines stagger in
    document.querySelectorAll('.hbo-line').forEach((el,i)=>{
      setTimeout(()=>el.classList.add('revealed'), i*70);
    });
    // Descriptor badge
    setTimeout(()=>document.getElementById('heroDescriptor')?.classList.add('revealed'), 280);
    // HUD
    setTimeout(()=>document.querySelector('.hero-hud-left')?.classList.add('revealed'), 360);
    setTimeout(()=>document.querySelector('.hero-hud-right')?.classList.add('revealed'), 460);
    // Counters
    setTimeout(startCounters, 520);
    // Nav — use BOTH .visible and .reveal so it definitely shows
    setTimeout(()=>{
      const hdr=document.getElementById('site-header');
      if(hdr){ hdr.classList.add('visible'); hdr.classList.add('reveal'); }
    }, 600);
  }
})();

/* ══════════════════════════════════════════════════
   NAV SCROLL BEHAVIOUR
══════════════════════════════════════════════════ */
(function() {
  const header = document.getElementById('site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
  const toggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      mobileNav.setAttribute('aria-hidden', String(!open));
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden', 'true');
      });
    });
  }
})();

/* ══════════════════════════════════════════════════
   HERO PARALLAX
══════════════════════════════════════════════════ */
(function() {
  const hero  = document.querySelector('.hero');
  const media = document.getElementById('heroParallax');
  if (!hero || !media) return;
  let ticking = false;
  hero.addEventListener('mousemove', (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const { width, height, left, top } = hero.getBoundingClientRect();
      const x = ((e.clientX - left) / width - 0.5) * 14;
      const y = ((e.clientY - top) / height - 0.5) * 9;
      media.style.transform = `scale(1.04) translate(${x}px, ${y}px)`;
      const overlay = document.getElementById('heroBrandOverlay');
      if (overlay) overlay.style.transform = `translate(${x*0.28}px, ${y*0.28}px)`;
      ticking = false;
    });
  });
  hero.addEventListener('mouseleave', () => {
    media.style.transform = '';
    const overlay = document.getElementById('heroBrandOverlay');
    if (overlay) overlay.style.transform = '';
  });
})();

/* ══════════════════════════════════════════════════
   COUNTERS
══════════════════════════════════════════════════ */
function startCounters() {
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    if (!target) return;
    let start = 0;
    const dur = 1500;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1-p, 3)) * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* ══════════════════════════════════════════════════
   SCROLL REVEAL — uses IntersectionObserver, adds 'in-view'
══════════════════════════════════════════════════ */
(function() {
  const els = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right, .service-category, .why-card'
  );
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
})();

/* ══════════════════════════════════════════════════
   CINEMA PANELS REVEAL
══════════════════════════════════════════════════ */
(function() {
  const panels = document.querySelectorAll('.cinema-panel');
  if (!panels.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  panels.forEach(p => io.observe(p));
})();

/* ══════════════════════════════════════════════════
   STICKY SCROLL
══════════════════════════════════════════════════ */
(function() {
  const section = document.getElementById('stickyScroll');
  if (!section) return;
  const steps = section.querySelectorAll('.sticky-step');
  const imgs  = section.querySelectorAll('.sticky-img');
  if (!steps.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const idx = parseInt(e.target.dataset.step);
      imgs.forEach(img => img.classList.toggle('active', parseInt(img.dataset.index) === idx));
    });
  }, { threshold: 0.5 });
  steps.forEach(s => io.observe(s));
})();

/* ══════════════════════════════════════════════════
   BEFORE/AFTER SLIDER
══════════════════════════════════════════════════ */
(function() {
  const slider = document.getElementById('baSlider');
  if (!slider) return;
  const handle = document.getElementById('baHandle');
  const before = slider.querySelector('.ba-before');
  if (!handle || !before) return;
  let dragging = false;
  function setPos(x) {
    const rect = slider.getBoundingClientRect();
    const pct  = Math.max(2, Math.min(98, ((x - rect.left) / rect.width) * 100));
    before.style.clipPath = `inset(0 ${100-pct}% 0 0)`;
    handle.style.left = pct + '%';
  }
  setPos(slider.getBoundingClientRect().left + slider.offsetWidth * 0.5);
  handle.addEventListener('mousedown', e => { dragging=true; e.preventDefault(); });
  handle.addEventListener('touchstart', () => { dragging=true; }, { passive:true });
  window.addEventListener('mousemove', e => { if(dragging) setPos(e.clientX); });
  window.addEventListener('touchmove', e => { if(dragging) setPos(e.touches[0].clientX); }, { passive:true });
  window.addEventListener('mouseup',   () => { dragging=false; });
  window.addEventListener('touchend',  () => { dragging=false; });
  slider.addEventListener('click', e => setPos(e.clientX));
})();

/* ══════════════════════════════════════════════════
   HORIZONTAL GALLERY DRAG
══════════════════════════════════════════════════ */
(function() {
  const wrap = document.getElementById('galleryWrap');
  if (!wrap) return;
  let isDragging=false, startX=0, scrollStart=0;
  wrap.addEventListener('mousedown', e => { isDragging=true; startX=e.clientX; scrollStart=wrap.scrollLeft; wrap.style.cursor='grabbing'; });
  window.addEventListener('mousemove', e => { if(isDragging) wrap.scrollLeft=scrollStart-(e.clientX-startX); });
  window.addEventListener('mouseup', () => { isDragging=false; wrap.style.cursor=''; });
})();

/* ══════════════════════════════════════════════════
   TESTIMONIALS CAROUSEL
══════════════════════════════════════════════════ */
(function() {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;
  const cards    = track.querySelectorAll('.testimonial-card');
  const dotsWrap = document.getElementById('carouselDots');
  let current=0;
  const dots = Array.from({length:cards.length},(_,i)=>{
    const d=document.createElement('button');
    d.className='dot'+(i===0?' active':'');
    d.setAttribute('aria-label',`Testimonial ${i+1}`);
    d.addEventListener('click',()=>goTo(i));
    dotsWrap&&dotsWrap.appendChild(d);
    return d;
  });
  function goTo(i) {
    current=(i+cards.length)%cards.length;
    track.style.transform=`translateX(-${current*100}%)`;
    dots.forEach((d,idx)=>d.classList.toggle('active',idx===current));
  }
  document.getElementById('prevBtn')?.addEventListener('click',()=>goTo(current-1));
  document.getElementById('nextBtn')?.addEventListener('click',()=>goTo(current+1));
  let auto=setInterval(()=>goTo(current+1),4500);
  const carousel=track.closest('.testimonials-carousel');
  carousel?.addEventListener('mouseenter',()=>clearInterval(auto));
  carousel?.addEventListener('mouseleave',()=>{ auto=setInterval(()=>goTo(current+1),4500); });
})();

/* ══════════════════════════════════════════════════
   MAGNETIC BUTTONS
══════════════════════════════════════════════════ */
(function() {
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r=btn.getBoundingClientRect();
      btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*0.22}px,${(e.clientY-r.top-r.height/2)*0.22}px)`;
    });
    btn.addEventListener('mouseleave', ()=>{ btn.style.transform=''; });
  });
})();

/* ══════════════════════════════════════════════════
   CONTACT FORM → mailto
══════════════════════════════════════════════════ */
(function() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const n=form.name?.value||'', ph=form.phone?.value||'',
          em=form.email?.value||'', sv=form.service?.value||'', msg=form.message?.value||'';
    const body=encodeURIComponent(`Name: ${n}\nPhone: ${ph}\nEmail: ${em}\nService: ${sv}\n\nMessage:\n${msg}`);
    window.open(`mailto:sbconstruction0001@gmail.com?subject=Quote%20Request%20from%20${encodeURIComponent(n)}&body=${body}`,'_blank');
  });
})();

/* ══════════════════════════════════════════════════
   THEME TOGGLE
══════════════════════════════════════════════════ */
(function() {
  const btn=document.querySelector('[data-theme-toggle]');
  if(!btn) return;
  const root=document.documentElement;
  const stored=localStorage.getItem('theme');
  if(stored) root.setAttribute('data-theme',stored);
  btn.addEventListener('click',()=>{
    const next=root.getAttribute('data-theme')==='dark'?'light':'dark';
    root.setAttribute('data-theme',next);
    localStorage.setItem('theme',next);
  });
})();

/* ══════════════════════════════════════════════════
   WebP background-image swap
══════════════════════════════════════════════════ */
(function() {
  if(!document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp'))return;
  document.querySelectorAll('[style*="background-image"]').forEach(el=>{
    el.style.backgroundImage=el.style.backgroundImage.replace(/\.png(["']?\))/g,'.webp$1');
  });
})();
