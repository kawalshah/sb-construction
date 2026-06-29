// ================================
// SB CONSTRUCTION – PREMIUM SCRIPTS v3
// ================================

/* ══════════════════════════════════════════════════
   CINEMATIC INTRO — BUILDING CONSTRUCTION ANIMATION
══════════════════════════════════════════════════ */
(function () {
  const loader = document.getElementById('intro-loader');
  if (!loader) return;

  // Reduced motion: skip immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    loader.classList.add('done');
    setTimeout(() => { loader.style.display='none'; revealHero(); }, 650);
    return;
  }

  const canvas = document.getElementById('intro-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = loader.offsetWidth; H = canvas.height = loader.offsetHeight; }
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
  function spawnDust(x, y, n=10) {
    for (let i=0;i<n;i++) {
      dust.push({ x, y, vx:(Math.random()-0.5)*3, vy:-(Math.random()*2+0.5),
        life:0, maxLife:28+Math.random()*28, size:Math.random()*4+1 });
    }
  }
  function tickDust() {
    for (let i=dust.length-1;i>=0;i--) {
      const p=dust[i]; p.life++;
      if (p.life>p.maxLife){dust.splice(i,1);continue;}
      const a=(1-p.life/p.maxLife)*0.5;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.fillStyle=C.dust+a+')'; ctx.fill();
      p.x+=p.vx; p.y+=p.vy; p.vx*=0.96; p.vy*=0.96;
    }
  }

  // Building metrics
  function metrics() {
    const bW=Math.min(W*0.44,260), bH=Math.min(H*0.58,340);
    const groundY=H*0.74, bX=(W-bW)/2, bY=groundY-bH;
    const floors=6, floorH=bH/floors;
    return {bW,bH,bX,bY,groundY,floors,floorH};
  }

  // Phase definitions
  const PHASES = 7;
  const LABELS = ['Laying Foundation…','Pouring Concrete Slab…','Raising Steel Frame…','Installing Floor Slabs…','Fitting Glass Facade…','Final Finish & Lights…','Complete.'];
  const PHASE_MS = 380;
  let phase=0, phaseP=0, lastT=null, raf;

  function drawScene(ph, pp) {
    ctx.clearRect(0,0,W,H);
    const {bW,bH,bX,bY,groundY,floors,floorH} = metrics();

    // Sky
    const sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#040302'); sky.addColorStop(1,'#0e0c09');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);

    // Stars (dims as building gets lighter)
    const starAlpha = Math.max(0, 0.6 - ph*0.1);
    for(let s=0;s<55;s++) {
      const sx=((s*137.5)%1)*W, sy=((s*93.7)%1)*groundY*0.75;
      ctx.beginPath(); ctx.arc(sx,sy,0.7,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${starAlpha*((s*61.3)%0.45+0.1)})`; ctx.fill();
    }

    // Ground
    ctx.fillStyle=C.ground; ctx.fillRect(0,groundY,W,H-groundY);
    ctx.strokeStyle=C.steel; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(0,groundY); ctx.lineTo(W,groundY); ctx.stroke();

    // Phase 0: Excavation trench
    if(ph>=0) {
      const dep=26*Math.min(ph===0?pp*1.6:1,1);
      const fPad=bW*0.06;
      ctx.fillStyle='#0e0c09';
      ctx.fillRect(bX-fPad,groundY,bW+fPad*2,dep);
    }
    if(ph<1)return;

    // Phase 1: Concrete slab
    const slabH=10;
    const sf=ph===1?pp:(ph>1?1:0);
    ctx.fillStyle=C.concrete;
    const fPad=bW*0.06;
    ctx.fillRect(bX-fPad,groundY-slabH,(bW+fPad*2)*sf,slabH);
    if(ph<2)return;

    // Phase 2: Steel columns + beams rising
    const frameF=ph===2?Math.round(floors*pp):floors;
    for(let f=0;f<frameF;f++) {
      const fy=groundY-slabH;
      const fp=ph===2?Math.max(0,Math.min(1,pp*floors-f)):1;
      // Left col
      ctx.fillStyle=C.steel;
      ctx.fillRect(bX,fy-floorH*(f+1),5,floorH*fp);
      // Right col
      ctx.fillRect(bX+bW-5,fy-floorH*(f+1),5,floorH*fp);
      // Beam
      if(fp>=0.85) {
        ctx.fillStyle=C.steelHi;
        ctx.fillRect(bX,fy-floorH*(f+1),bW,4);
      }
    }
    // Bracing diagonals
    if(ph>=2) {
      ctx.strokeStyle='rgba(90,85,80,0.4)'; ctx.lineWidth=1.5; ctx.setLineDash([4,5]);
      for(let f=0;f<Math.min(frameF,floors);f++) {
        const fy=groundY-slabH-floorH*f;
        ctx.beginPath(); ctx.moveTo(bX+8,fy); ctx.lineTo(bX+bW/2,fy-floorH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bX+bW-8,fy); ctx.lineTo(bX+bW/2,fy-floorH); ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    if(ph<3)return;

    // Phase 3: Floor slabs
    const fillF=ph===3?Math.round(floors*pp):floors;
    for(let f=0;f<fillF;f++) {
      const fy=groundY-slabH-floorH*(f+1);
      const fp=ph===3?Math.max(0,Math.min(1,pp*floors-f)):1;
      ctx.fillStyle=`rgba(44,41,36,${0.75*fp})`;
      ctx.fillRect(bX+5,fy+4,(bW-10)*fp,floorH-4);
      if(fp>=0.92){ctx.fillStyle=C.concrete;ctx.fillRect(bX+5,fy+floorH-3,bW-10,3);}
    }
    if(ph<4)return;

    // Phase 4: Glass facade panels
    const totalPanels=floors*4;
    const drawn4=ph===4?Math.round(totalPanels*pp):totalPanels;
    const panW=(bW-12)/4;
    for(let i=0;i<drawn4&&i<totalPanels;i++) {
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
    // Exterior outline
    ctx.strokeStyle=C.steelHi; ctx.lineWidth=2;
    ctx.strokeRect(bX,groundY-slabH-bH,bW,bH);
    if(ph<5)return;

    // Phase 5: Finishing — orange accents, roof, window glow
    const fp5=ph===5?pp:1;
    // Orange vertical accents
    ctx.fillStyle=`rgba(232,93,4,${0.75*fp5})`;
    ctx.fillRect(bX,groundY-slabH-bH*0.4,5,bH*0.4*fp5);
    ctx.fillRect(bX+bW-5,groundY-slabH-bH*0.4,5,bH*0.4*fp5);
    // Roof parapet
    ctx.fillStyle=C.concrete;
    ctx.fillRect(bX-4,groundY-slabH-bH-9,(bW+8)*fp5,9);
    // Window warm glow
    for(let f=0;f<floors;f++) {
      const fy=groundY-slabH-(f+1)*floorH+floorH*0.15;
      const glow=ctx.createRadialGradient(bX+bW/2,fy+floorH*0.5,0,bX+bW/2,fy+floorH*0.5,bW*0.55);
      glow.addColorStop(0,`rgba(232,93,4,${0.07*fp5})`);
      glow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=glow; ctx.fillRect(bX-bW*0.2,fy,bW*1.4,floorH);
    }
    // Ground ambient glow
    const bg=ctx.createRadialGradient(W/2,groundY,0,W/2,groundY,W*0.48);
    bg.addColorStop(0,`rgba(232,93,4,${0.18*fp5})`); bg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=bg; ctx.fillRect(0,groundY-50,W,90);
    if(ph<6)return;

    // Phase 6: Final — full glow
    const fp6=ph===6?pp:1;
    const topGlow=ctx.createRadialGradient(W/2,groundY-slabH-bH/2,0,W/2,groundY-slabH-bH/2,bW*0.9);
    topGlow.addColorStop(0,`rgba(232,93,4,${0.12*fp6})`); topGlow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=topGlow; ctx.fillRect(bX-bW*0.5,groundY-slabH-bH-20,bW*2,bH+20);
  }

  function drawCrane(ph) {
    const {bX,bW,bH,groundY}=metrics();
    const cx=bX+bW+20, cy=groundY, mH=bH+55;
    ctx.strokeStyle=C.crane; ctx.lineCap='round';
    // Mast
    ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx,cy-mH); ctx.stroke();
    // Jib
    const jibL=bW*0.55+36;
    ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(cx-bW*0.15,cy-mH+10); ctx.lineTo(cx+jibL,cy-mH+10); ctx.stroke();
    // Counter
    ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(cx,cy-mH+10); ctx.lineTo(cx-bW*0.38,cy-mH+10); ctx.stroke();
    // Trolley & hook
    const t=Date.now()/1000;
    const trolleyX=cx+jibL-jibL*(Math.sin(t*0.5)*0.4+0.5)*0.7;
    const hookL=25+Math.abs(Math.sin(t*0.7))*22;
    ctx.strokeStyle=C.craneYel; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(trolleyX,cy-mH+10); ctx.lineTo(trolleyX,cy-mH+10+hookL); ctx.stroke();
    ctx.fillStyle=C.craneYel; ctx.fillRect(trolleyX-5,cy-mH+10+hookL,10,7);
    // Cab
    ctx.fillStyle=C.craneYel; ctx.fillRect(cx-11,cy-mH+12,22,16);
  }

  const progressBar = document.querySelector('.intro-progress-bar');
  const phaseLabel  = document.querySelector('.intro-phase-label');

  function animate(ts) {
    if(!lastT) lastT=ts;
    const dt=Math.min(ts-lastT, 80); // cap dt for tab-switch lag
    lastT=ts;
    phaseP += dt/PHASE_MS;
    if(phaseP>=1) {
      phaseP=0; phase++;
      if(phase>0 && phase<6) {
        const {bX,bW,groundY,floorH}=metrics();
        spawnDust(bX+bW/2, groundY-floorH*(phase-1), 14);
      }
    }
    const gP=(phase+phaseP)/PHASES;
    if(progressBar) progressBar.style.width=(Math.min(gP,1)*100)+'%';
    if(phaseLabel && phase<LABELS.length) phaseLabel.textContent=LABELS[phase];

    drawScene(phase, phaseP);
    drawCrane(phase);
    tickDust();

    if(phase<PHASES) raf=requestAnimationFrame(animate);
    else finishIntro();
  }
  raf=requestAnimationFrame(animate);

  function finishIntro() {
    cancelAnimationFrame(raf);
    drawScene(6,1); drawCrane(6); // final frame
    if(progressBar) progressBar.style.width='100%';
    if(phaseLabel) phaseLabel.textContent='Complete.';

    const finalLogo=document.querySelector('.intro-final-logo');
    if(finalLogo) setTimeout(()=>finalLogo.classList.add('visible'), 250);

    setTimeout(()=>{
      const hm=document.querySelector('.hero-media');
      if(hm) hm.classList.add('reveal');
    }, 700);

    setTimeout(()=>{
      document.getElementById('introCurtainTop')?.classList.add('exit');
      document.getElementById('introCurtainBot')?.classList.add('exit');
    }, 1100);

    setTimeout(()=>{
      loader.classList.add('done');
      setTimeout(()=>{loader.style.display='none';},700);
    }, 1500);

    setTimeout(revealHero, 1600);
  }

  function revealHero() {
    document.querySelectorAll('.hbo-line').forEach((el,i)=>{
      setTimeout(()=>el.classList.add('revealed'), i*85);
    });
    setTimeout(()=>document.getElementById('heroDescriptor')?.classList.add('revealed'), 340);
    setTimeout(()=>document.querySelector('.hero-hud-left')?.classList.add('revealed'), 440);
    setTimeout(()=>document.querySelector('.hero-hud-right')?.classList.add('revealed'), 560);
    setTimeout(startCounters, 640);
    setTimeout(()=>document.getElementById('site-header')?.classList.add('visible'), 720);
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
   HERO PARALLAX on mousemove
══════════════════════════════════════════════════ */
(function() {
  const hero = document.querySelector('.hero');
  const media = document.getElementById('heroParallax');
  if (!hero || !media) return;
  hero.addEventListener('mousemove', (e) => {
    const { width, height, left, top } = hero.getBoundingClientRect();
    const x = ((e.clientX - left) / width - 0.5) * 14;
    const y = ((e.clientY - top) / height - 0.5) * 9;
    media.style.transform = `scale(1.04) translate(${x}px, ${y}px)`;
    const overlay = document.getElementById('heroBrandOverlay');
    if (overlay) overlay.style.transform = `translate(${x*0.28}px, ${y*0.28}px)`;
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
    const dur = 1700;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ease * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* ══════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════ */
(function() {
  const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .service-category, .why-card');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
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
  }, { threshold: 0.15 });
  panels.forEach(p => io.observe(p));
})();

/* ══════════════════════════════════════════════════
   STICKY SCROLL (Apple-style)
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
  }, { threshold: 0.55 });
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
  let dragging = false;
  function setPos(x) {
    const rect = slider.getBoundingClientRect();
    const pct  = Math.max(2, Math.min(98, ((x - rect.left) / rect.width) * 100));
    before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
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
  const cards   = track.querySelectorAll('.testimonial-card');
  const dotsWrap= document.getElementById('carouselDots');
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
  track.closest('.testimonials-carousel')?.addEventListener('mouseenter',()=>clearInterval(auto));
  track.closest('.testimonials-carousel')?.addEventListener('mouseleave',()=>{auto=setInterval(()=>goTo(current+1),4500);});
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
    const name=form.name?.value||'', phone=form.phone?.value||'',
          email=form.email?.value||'', service=form.service?.value||'', msg=form.message?.value||'';
    const body=encodeURIComponent(`Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nService: ${service}\n\nMessage:\n${msg}`);
    window.open(`mailto:sbconstruction0001@gmail.com?subject=Quote%20Request%20from%20${encodeURIComponent(name)}&body=${body}`,'_blank');
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
