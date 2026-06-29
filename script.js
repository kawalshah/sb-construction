// SB CONSTRUCTION – v4.1 (bulletproof)

/* ══════════════════════════════════════════════════
   CINEMATIC INTRO — BUILDING CONSTRUCTION ANIMATION
   6 phases × 650ms = ~4s cinematic build. Hard timeout: 5.5s.
══════════════════════════════════════════════════ */
(function () {
  'use strict';
  const loader = document.getElementById('intro-loader');

  // Immediately make hero image visible (renders behind loader)
  const heroMedia = document.querySelector('.hero-media');
  if (heroMedia) heroMedia.classList.add('reveal');

  function exitLoader(delay) {
    delay = delay || 0;
    setTimeout(function() {
      if (!loader) { revealHero(); return; }
      loader.classList.add('done');
      // Redundant safety: set inline styles directly
      setTimeout(function() {
        loader.style.display = 'none';
        loader.style.visibility = 'hidden';
        loader.style.pointerEvents = 'none';
      }, 550);
      revealHero();
    }, delay);
  }

  // No loader? Skip straight to hero.
  if (!loader) { revealHero(); return; }

  // HARD LIMIT — site shows in 1.5s no matter what
  var hardTimer = setTimeout(function() { exitLoader(0); }, 5500);

  // Reduced motion: skip instantly
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    clearTimeout(hardTimer);
    exitLoader(0);
    return;
  }

  var canvas = document.getElementById('intro-canvas');
  if (!canvas) { clearTimeout(hardTimer); exitLoader(0); return; }

  var ctx;
  try { ctx = canvas.getContext('2d'); }
  catch(e) { clearTimeout(hardTimer); exitLoader(0); return; }
  if (!ctx) { clearTimeout(hardTimer); exitLoader(0); return; }

  var W, H;
  function resize() {
    W = canvas.width  = window.innerWidth  || loader.offsetWidth  || 800;
    H = canvas.height = window.innerHeight || loader.offsetHeight || 600;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Colours
  var ground='#1c1a17', concrete='#2c2924', steel='#3d3a36',
      steelHi='#5a5550', orange='#E85D04', craneDark='#4a4540', craneYel='#f0b800';

  // Dust
  var dust=[];
  function spawnDust(x,y) {
    for(var i=0;i<10;i++) {
      dust.push({x:x,y:y,vx:(Math.random()-0.5)*2.5,vy:-(Math.random()*1.8+0.4),
        life:0,max:22+Math.random()*22,sz:Math.random()*3+1});
    }
  }
  function tickDust() {
    for(var i=dust.length-1;i>=0;i--) {
      var p=dust[i]; p.life++;
      if(p.life>p.max){dust.splice(i,1);continue;}
      var a=(1-p.life/p.max)*0.4;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);
      ctx.fillStyle='rgba(190,150,90,'+a+')'; ctx.fill();
      p.x+=p.vx; p.y+=p.vy; p.vx*=0.97; p.vy*=0.97;
    }
  }

  function getM() {
    var bW=Math.min(W*0.4,220), bH=Math.min(H*0.52,290);
    var gY=H*0.74, bX=(W-bW)/2, fl=5, fH=bH/fl;
    return {bW:bW,bH:bH,bX:bX,bY:gY-bH,gY:gY,fl:fl,fH:fH};
  }

  // 4 phases × 220ms = 880ms animation
  var PHASES=6, PHASE_MS=650;
  var phase=0, phaseP=0, lastT=null, raf, animDone=false;

  var progressBar = document.querySelector('.intro-progress-bar');
  var phaseLabel  = document.querySelector('.intro-phase-label');
  var LABELS = ['Laying Foundation…','Pouring Concrete Slab…','Raising Steel Frame…','Installing Glass Facade…','Final Finishing Touches…','Complete.'];

  function draw(ph, pp) {
    ctx.clearRect(0,0,W,H);
    var m=getM(), bW=m.bW,bH=m.bH,bX=m.bX,gY=m.gY,fl=m.fl,fH=m.fH;

    // Sky gradient
    var sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#040302'); sky.addColorStop(1,'#0f0d0a');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);

    // Stars (fade with phases)
    var sa=Math.max(0, 0.5-ph*0.12);
    for(var s=0;s<35;s++){
      var sx=((s*137.5)%1)*W, sy=((s*93.7)%1)*gY*0.68;
      ctx.beginPath(); ctx.arc(sx,sy,0.65,0,Math.PI*2);
      ctx.fillStyle='rgba(255,255,255,'+(sa*((s*61.3)%0.4+0.1))+')'; ctx.fill();
    }

    // Ground
    ctx.fillStyle=ground; ctx.fillRect(0,gY,W,H-gY);
    ctx.strokeStyle=steel; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(0,gY); ctx.lineTo(W,gY); ctx.stroke();

    var fPad=bW*0.06, slabH=9;

    // Phase 0: Excavation trench
    var ex=ph===0?pp:1;
    ctx.fillStyle='#0b0908'; ctx.fillRect(bX-fPad,gY,bW+fPad*2,26*Math.min(ex*1.8,1));
    if(ph<1) return;

    // Phase 1: Concrete foundation slab
    var sf=ph===1?pp:1;
    ctx.fillStyle=concrete; ctx.fillRect(bX-fPad,gY-slabH,(bW+fPad*2)*sf,slabH);
    if(ph<2) return;

    // Phase 2: Steel frame
    var frameF=ph===2?Math.round(fl*pp):fl;
    for(var f=0;f<frameF;f++){
      var fp=ph===1?Math.max(0,Math.min(1,pp*fl-f)):1;
      ctx.fillStyle=steel;
      ctx.fillRect(bX, gY-slabH-fH*(f+1), 5, fH*fp);
      ctx.fillRect(bX+bW-5, gY-slabH-fH*(f+1), 5, fH*fp);
      if(fp>=0.85){ ctx.fillStyle=steelHi; ctx.fillRect(bX,gY-slabH-fH*(f+1),bW,4); }
    }
    // Bracing
    ctx.strokeStyle='rgba(80,75,70,0.3)'; ctx.lineWidth=1.5; ctx.setLineDash([3,5]);
    for(var f=0;f<Math.min(frameF,fl);f++){
      var fy=gY-slabH-fH*f;
      ctx.beginPath(); ctx.moveTo(bX+7,fy); ctx.lineTo(bX+bW/2,fy-fH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bX+bW-7,fy); ctx.lineTo(bX+bW/2,fy-fH); ctx.stroke();
    }
    ctx.setLineDash([]);
    if(ph<3) return;

    // Phase 3: Glass panels
    var totalP=fl*4, drawnP=ph===3?Math.round(totalP*pp):totalP;
    var panW=(bW-12)/4;
    for(var i=0;i<drawnP&&i<totalP;i++){
      var pf=Math.floor(i/4), pp2=i%4;
      var px=bX+6+pp2*panW, py=gY-slabH-(pf+1)*fH+6, pw=panW-3, phh=fH-9;
      var grd=ctx.createLinearGradient(px,py,px+pw,py+phh);
      grd.addColorStop(0,'rgba(70,130,190,0.14)');
      grd.addColorStop(0.5,'rgba(130,195,255,0.3)');
      grd.addColorStop(1,'rgba(50,90,150,0.18)');
      ctx.fillStyle=grd; ctx.fillRect(px,py,pw,phh);
      ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(px,py,pw*0.13,phh);
    }
    ctx.strokeStyle=steelHi; ctx.lineWidth=1.5;
    ctx.strokeRect(bX, gY-slabH-bH, bW, bH);
    if(ph<4) return;

    // Phase 4: Finishing
    var fp4=ph===4?pp:1; var fp3=fp4;
    ctx.fillStyle='rgba(232,93,4,'+(0.8*fp4)+")";
    ctx.fillRect(bX, gY-slabH-bH*0.5, 5, bH*0.5*fp3);
    ctx.fillRect(bX+bW-5, gY-slabH-bH*0.5, 5, bH*0.5*fp3);
    ctx.fillStyle=concrete; ctx.fillRect(bX-4,gY-slabH-bH-7,(bW+8)*fp3,7);
    // Warm glow
    for(var f=0;f<fl;f++){
      var fy=gY-slabH-(f+1)*fH+fH*0.2;
      var grd2=ctx.createRadialGradient(bX+bW/2,fy+fH*0.4,0,bX+bW/2,fy+fH*0.4,bW*0.45);
      grd2.addColorStop(0,'rgba(232,93,4,'+(0.07*fp3)+')'); grd2.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=grd2; ctx.fillRect(bX-bW*0.12,fy,bW*1.24,fH);
    }
    var bg=ctx.createRadialGradient(W/2,gY,0,W/2,gY,W*0.42);
    bg.addColorStop(0,'rgba(232,93,4,'+(0.16*fp4)+')'); bg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=bg; ctx.fillRect(0,gY-45,W,80);
    if(ph<5) return;

    // Phase 5: Full ambient glow
    var fp5=pp;
    var hGlow=ctx.createRadialGradient(W/2,gY-slabH-bH/2,0,W/2,gY-slabH-bH/2,bW*0.95);
    hGlow.addColorStop(0,'rgba(232,93,4,'+(0.14*fp5)+')'); hGlow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=hGlow; ctx.fillRect(bX-bW*0.7,gY-slabH-bH-20,bW*2.4,bH+20);
    // Shimmer on glass
    for(var f=0;f<fl;f++){
      var fy2=gY-slabH-(f+1)*fH+fH*0.15;
      ctx.fillStyle='rgba(255,255,255,'+(0.03*fp5)+')';
      ctx.fillRect(bX+6,fy2+4,(bW-14)*fp5,fH*0.6);
    }
  }

  function drawCrane() {
    var m=getM(), bW=m.bW,bH=m.bH,bX=m.bX,gY=m.gY;
    var cx=bX+bW+16, mH=bH+44;
    ctx.strokeStyle=craneDark; ctx.lineCap='round';
    ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(cx,gY); ctx.lineTo(cx,gY-mH); ctx.stroke();
    var jibL=bW*0.48+28;
    ctx.lineWidth=4; ctx.beginPath();
    ctx.moveTo(cx+jibL,gY-mH+9); ctx.lineTo(cx-bW*0.3,gY-mH+9); ctx.stroke();
    var t=Date.now()/1000;
    var tx=cx+jibL-(jibL*(Math.sin(t*0.55)*0.4+0.5)*0.6);
    var hl=20+Math.abs(Math.sin(t*0.75))*16;
    ctx.strokeStyle=craneYel; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(tx,gY-mH+9); ctx.lineTo(tx,gY-mH+9+hl); ctx.stroke();
    ctx.fillStyle=craneYel;
    ctx.fillRect(tx-4,gY-mH+9+hl,8,6);
    ctx.fillRect(cx-9,gY-mH+11,18,13);
  }

  function animate(ts) {
    if(animDone) return;
    try {
      if(!lastT) lastT=ts;
      var dt=Math.min(ts-lastT,80); lastT=ts;
      phaseP+=dt/PHASE_MS;
      if(phaseP>=1){
        phaseP=0; phase++;
        if(phase>=1&&phase<=5){
          var m=getM();
          spawnDust(m.bX+m.bW/2, m.gY-m.fH*(phase<fl?phase:fl-1), 10);
        }
      }
      var gP=Math.min((phase+phaseP)/PHASES,1);
      if(progressBar) progressBar.style.width=(gP*100)+'%';
      if(phaseLabel&&phase<LABELS.length) phaseLabel.textContent=LABELS[phase];
      draw(phase, phaseP);
      drawCrane();
      tickDust();
      if(phase<PHASES) { raf=requestAnimationFrame(animate); }
      else { finish(); }
    } catch(e) {
      animDone=true;
      clearTimeout(hardTimer);
      exitLoader(0);
    }
  }
  raf=requestAnimationFrame(animate);

  function finish() {
    if(animDone) return;
    animDone=true;
    clearTimeout(hardTimer);
    cancelAnimationFrame(raf);
    try { draw(5,1); drawCrane(); } catch(e){}
    if(progressBar) progressBar.style.width='100%';
    if(phaseLabel) phaseLabel.textContent='Complete.';
    // Logo flash
    var logo=document.querySelector('.intro-final-logo');
    if(logo) setTimeout(function(){logo.classList.add('visible');},300);
    // Curtain rip
    setTimeout(function(){
      var ct=document.getElementById('introCurtainTop');
      var cb=document.getElementById('introCurtainBot');
      if(ct) ct.classList.add('exit');
      if(cb) cb.classList.add('exit');
    }, 800);
    // Exit
    exitLoader(1100);
  }

  function revealHero() {
    // Brand lines
    var lines=document.querySelectorAll('.hbo-line');
    lines.forEach(function(el,i){ setTimeout(function(){el.classList.add('revealed');},i*70); });
    // Descriptor
    setTimeout(function(){
      var d=document.getElementById('heroDescriptor'); if(d) d.classList.add('revealed');
    },280);
    // HUD
    setTimeout(function(){
      var l=document.querySelector('.hero-hud-left'); if(l) l.classList.add('revealed');
    },360);
    setTimeout(function(){
      var r=document.querySelector('.hero-hud-right'); if(r) r.classList.add('revealed');
    },460);
    // Counters
    setTimeout(startCounters, 520);
    // Nav
    setTimeout(function(){
      var h=document.getElementById('site-header');
      if(h){ h.classList.add('visible'); h.classList.add('reveal'); }
    },580);
  }
})();

/* ══════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════ */
(function(){
  var hdr=document.getElementById('site-header');
  if(!hdr)return;
  window.addEventListener('scroll',function(){
    hdr.classList.toggle('scrolled',window.scrollY>60);
  },{passive:true});
  var tog=document.getElementById('nav-toggle');
  var mob=document.getElementById('mobile-nav');
  if(tog&&mob){
    tog.addEventListener('click',function(){
      var o=mob.classList.toggle('open');
      mob.setAttribute('aria-hidden',String(!o));
    });
    mob.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click',function(){mob.classList.remove('open');mob.setAttribute('aria-hidden','true');});
    });
  }
})();

/* ══════════════════════════════════════════════════
   HERO PARALLAX
══════════════════════════════════════════════════ */
(function(){
  var hero=document.querySelector('.hero');
  var media=document.getElementById('heroParallax');
  if(!hero||!media)return;
  var ticking=false;
  hero.addEventListener('mousemove',function(e){
    if(ticking)return; ticking=true;
    requestAnimationFrame(function(){
      var r=hero.getBoundingClientRect();
      var x=((e.clientX-r.left)/r.width-0.5)*14;
      var y=((e.clientY-r.top)/r.height-0.5)*9;
      media.style.transform='scale(1.04) translate('+x+'px,'+y+'px)';
      var ov=document.getElementById('heroBrandOverlay');
      if(ov) ov.style.transform='translate('+(x*0.28)+'px,'+(y*0.28)+'px)';
      ticking=false;
    });
  });
  hero.addEventListener('mouseleave',function(){
    media.style.transform='';
    var ov=document.getElementById('heroBrandOverlay'); if(ov) ov.style.transform='';
  });
})();

/* ══════════════════════════════════════════════════
   COUNTERS
══════════════════════════════════════════════════ */
function startCounters(){
  document.querySelectorAll('[data-target]').forEach(function(el){
    var target=parseInt(el.dataset.target), suffix=el.dataset.suffix||'';
    if(!target)return;
    var s=0,dur=1500;
    (function step(ts){
      if(!s)s=ts;
      var p=Math.min((ts-s)/dur,1);
      el.textContent=Math.round((1-Math.pow(1-p,3))*target)+suffix;
      if(p<1)requestAnimationFrame(step);
    })(performance.now());
  });
}

/* ══════════════════════════════════════════════════
   SCROLL REVEAL (adds 'in-view')
══════════════════════════════════════════════════ */
(function(){
  var els=document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right,.service-category,.why-card');
  if(!els.length)return;
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target);}
    });
  },{threshold:0.08});
  els.forEach(function(el){io.observe(el);});
})();

/* ══════════════════════════════════════════════════
   CINEMA PANELS
══════════════════════════════════════════════════ */
(function(){
  var panels=document.querySelectorAll('.cinema-panel');
  if(!panels.length)return;
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target);}
    });
  },{threshold:0.08});
  panels.forEach(function(p){io.observe(p);});
})();

/* ══════════════════════════════════════════════════
   STICKY SCROLL
══════════════════════════════════════════════════ */
(function(){
  var sec=document.getElementById('stickyScroll');
  if(!sec)return;
  var steps=sec.querySelectorAll('.sticky-step');
  var imgs=sec.querySelectorAll('.sticky-img');
  if(!steps.length)return;
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting)return;
      var idx=parseInt(e.target.dataset.step);
      imgs.forEach(function(img){img.classList.toggle('active',parseInt(img.dataset.index)===idx);});
    });
  },{threshold:0.5});
  steps.forEach(function(s){io.observe(s);});
})();

/* ══════════════════════════════════════════════════
   BEFORE/AFTER SLIDER
══════════════════════════════════════════════════ */
(function(){
  var slider=document.getElementById('baSlider');
  if(!slider)return;
  var handle=document.getElementById('baHandle');
  var before=slider.querySelector('.ba-before');
  if(!handle||!before)return;
  var dragging=false;
  function setPos(x){
    var r=slider.getBoundingClientRect();
    var pct=Math.max(2,Math.min(98,((x-r.left)/r.width)*100));
    before.style.clipPath='inset(0 '+(100-pct)+'% 0 0)';
    handle.style.left=pct+'%';
  }
  setPos(slider.getBoundingClientRect().left+slider.offsetWidth*0.5);
  handle.addEventListener('mousedown',function(e){dragging=true;e.preventDefault();});
  handle.addEventListener('touchstart',function(){dragging=true;},{passive:true});
  window.addEventListener('mousemove',function(e){if(dragging)setPos(e.clientX);});
  window.addEventListener('touchmove',function(e){if(dragging)setPos(e.touches[0].clientX);},{passive:true});
  window.addEventListener('mouseup',function(){dragging=false;});
  window.addEventListener('touchend',function(){dragging=false;});
  slider.addEventListener('click',function(e){setPos(e.clientX);});
})();

/* ══════════════════════════════════════════════════
   GALLERY DRAG
══════════════════════════════════════════════════ */
(function(){
  var wrap=document.getElementById('galleryWrap');
  if(!wrap)return;
  var drag=false,sx=0,ss=0;
  wrap.addEventListener('mousedown',function(e){drag=true;sx=e.clientX;ss=wrap.scrollLeft;wrap.style.cursor='grabbing';});
  window.addEventListener('mousemove',function(e){if(drag)wrap.scrollLeft=ss-(e.clientX-sx);});
  window.addEventListener('mouseup',function(){drag=false;wrap.style.cursor='';});
})();

/* ══════════════════════════════════════════════════
   TESTIMONIALS CAROUSEL
══════════════════════════════════════════════════ */
(function(){
  var track=document.getElementById('testimonialsTrack');
  if(!track)return;
  var cards=track.querySelectorAll('.testimonial-card');
  var dotsWrap=document.getElementById('carouselDots');
  var cur=0;
  var dots=Array.prototype.slice.call(cards).map(function(_,i){
    var d=document.createElement('button');
    d.className='dot'+(i===0?' active':'');
    d.setAttribute('aria-label','Testimonial '+(i+1));
    d.addEventListener('click',function(){goTo(i);});
    if(dotsWrap) dotsWrap.appendChild(d);
    return d;
  });
  function goTo(i){
    cur=(i+cards.length)%cards.length;
    track.style.transform='translateX(-'+cur*100+'%)';
    dots.forEach(function(d,idx){d.classList.toggle('active',idx===cur);});
  }
  var prev=document.getElementById('prevBtn'),next=document.getElementById('nextBtn');
  if(prev) prev.addEventListener('click',function(){goTo(cur-1);});
  if(next) next.addEventListener('click',function(){goTo(cur+1);});
  var auto=setInterval(function(){goTo(cur+1);},4500);
  var car=track.closest('.testimonials-carousel');
  if(car){
    car.addEventListener('mouseenter',function(){clearInterval(auto);});
    car.addEventListener('mouseleave',function(){auto=setInterval(function(){goTo(cur+1);},4500);});
  }
})();

/* ══════════════════════════════════════════════════
   MAGNETIC BUTTONS
══════════════════════════════════════════════════ */
(function(){
  document.querySelectorAll('.magnetic-btn').forEach(function(btn){
    btn.addEventListener('mousemove',function(e){
      var r=btn.getBoundingClientRect();
      btn.style.transform='translate('+((e.clientX-r.left-r.width/2)*0.22)+'px,'+((e.clientY-r.top-r.height/2)*0.22)+'px)';
    });
    btn.addEventListener('mouseleave',function(){btn.style.transform='';});
  });
})();

/* ══════════════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════════════ */
(function(){
  var form=document.getElementById('contact-form');
  if(!form)return;
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var n=form.name?form.name.value:'';
    var ph=form.phone?form.phone.value:'';
    var em=form.email?form.email.value:'';
    var sv=form.service?form.service.value:'';
    var msg=form.message?form.message.value:'';
    var body=encodeURIComponent('Name: '+n+'\nPhone: '+ph+'\nEmail: '+em+'\nService: '+sv+'\n\nMessage:\n'+msg);
    window.open('mailto:sbconstruction0001@gmail.com?subject=Quote%20Request%20from%20'+encodeURIComponent(n)+'&body='+body,'_blank');
  });
})();

/* ══════════════════════════════════════════════════
   THEME TOGGLE
══════════════════════════════════════════════════ */
(function(){
  var btn=document.querySelector('[data-theme-toggle]');
  if(!btn)return;
  var root=document.documentElement;
  var stored=localStorage.getItem('theme');
  if(stored) root.setAttribute('data-theme',stored);
  btn.addEventListener('click',function(){
    var next=root.getAttribute('data-theme')==='dark'?'light':'dark';
    root.setAttribute('data-theme',next);
    localStorage.setItem('theme',next);
  });
})();

/* ══════════════════════════════════════════════════
   WebP swap
══════════════════════════════════════════════════ */
(function(){
  var c=document.createElement('canvas');
  if(!c.toDataURL('image/webp').startsWith('data:image/webp'))return;
  document.querySelectorAll('[style*="background-image"]').forEach(function(el){
    el.style.backgroundImage=el.style.backgroundImage.replace(/\.png(["']?\))/g,'.webp$1');
  });
})();
