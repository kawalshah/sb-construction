// SB CONSTRUCTION – v5.0

/* ══════════════════════════════════════════════════
   INTRO — CSS BUILDING ANIMATION (Safari-safe)
   Pure CSS handles visuals. JS only drives labels + exit.
   Total: ~3.5s animation, then curtain rip, then site.
══════════════════════════════════════════════════ */
(function () {
  'use strict';

  var loader  = document.getElementById('intro-loader');
  var heroMedia = document.querySelector('.hero-media');
  if (heroMedia) heroMedia.classList.add('reveal');
  if (!loader) { revealHero(); return; }

  function exitLoader(delay) {
    setTimeout(function () {
      loader.classList.add('done');
      setTimeout(function () {
        loader.style.display = 'none';
        loader.style.visibility = 'hidden';
      }, 600);
      revealHero();
    }, delay || 0);
  }

  // Phase labels driven by JS timers (CSS handles drawing)
  var PHASES = [
    'Laying Foundation…',
    'Pouring Concrete Slab…',
    'Raising Steel Frame…',
    'Installing Glass Facade…',
    'Final Finishing Touches…',
    'Complete.'
  ];
  var label = document.getElementById('introPhaseLabel');
  var bar   = document.getElementById('introProgressBar');
  var logo  = document.getElementById('introFinalLogo');
  var PHASE_MS = 380; // matches CSS --fi delay steps (0.38s per floor)

  PHASES.forEach(function (text, i) {
    setTimeout(function () {
      if (label) label.textContent = text;
      if (bar) bar.style.width = ((i + 1) / PHASES.length * 100) + '%';
    }, 500 + i * PHASE_MS);
  });

  // Logo flash
  var totalAnim = 500 + PHASES.length * PHASE_MS + 200; // ~2.8s
  setTimeout(function () {
    if (logo) logo.classList.add('visible');
  }, totalAnim);

  // Curtain rip
  setTimeout(function () {
    var ct = document.getElementById('introCurtainTop');
    var cb = document.getElementById('introCurtainBot');
    if (ct) ct.classList.add('exit');
    if (cb) cb.classList.add('exit');
  }, totalAnim + 400);

  // Exit
  exitLoader(totalAnim + 1300);

  // Absolute hard limit — site always shows in 4s
  setTimeout(function () { exitLoader(0); }, 4000);

  function revealHero() {
    var lines = document.querySelectorAll('.hbo-line');
    lines.forEach(function (el, i) {
      setTimeout(function () { el.classList.add('revealed'); }, i * 70);
    });
    setTimeout(function () {
      var d = document.getElementById('heroDescriptor');
      if (d) d.classList.add('revealed');
    }, 280);
    setTimeout(function () {
      var l = document.querySelector('.hero-hud-left');
      if (l) l.classList.add('revealed');
    }, 360);
    setTimeout(function () {
      var r = document.querySelector('.hero-hud-right');
      if (r) r.classList.add('revealed');
    }, 460);
    setTimeout(startCounters, 520);
    setTimeout(function () {
      var h = document.getElementById('site-header');
      if (h) { h.classList.add('visible'); h.classList.add('reveal'); }
    }, 580);
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
