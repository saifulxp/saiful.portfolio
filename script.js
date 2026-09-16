document.documentElement.classList.add('js');
document.body.classList.add('is-loading');

const loader = document.querySelector('.loader');
const loaderCount = document.querySelector('#loaderCount');
const loaderProgress = document.querySelector('.loader-progress span');
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function finishLoader(){
  // Some inner pages use the cinematic page-transition instead of the full
  // portfolio loader. In that case there is no .loader element, but the
  // shared script still adds .is-loading at startup. Always hand the page
  // back to normal scrolling/navigation when no loader is present.
  if (!loader) {
    document.body.classList.remove('is-loading');
    nav?.classList.add('nav-visible');
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  document.body.classList.remove('is-loading');
  loader.classList.add('done');

  // Reveal the navbar only after the loader wipe, so its text animation is visible.
  setTimeout(() => nav?.classList.add('nav-visible'), 260);
  setTimeout(() => {
    loader.style.display = 'none';
    document.querySelectorAll('.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 120 + i * 45);
    });
  }, 1150);
}

function runLoader(){
  if (!loader || !loaderCount || !loaderProgress || reducedMotion) {
    if (loaderCount) loaderCount.textContent = '100';
    if (loaderProgress) loaderProgress.style.width = '100%';
    finishLoader();
    return;
  }

  const duration = 1750;
  const start = performance.now();

  function tick(now){
    const t = Math.min(1, (now - start) / duration);
    // Smoothstep + slight late acceleration for a premium, non-mechanical count.
    const eased = t < .7
      ? (t / .7) * (t / .7) * (3 - 2 * (t / .7))
      : .82 + ((t - .7) / .3) * .18;
    const value = Math.min(100, Math.floor(eased * 100));
    loaderCount.textContent = String(value).padStart(2,'0');
    loaderProgress.style.width = (eased * 100) + '%';

    if (t < 1) requestAnimationFrame(tick);
    else setTimeout(finishLoader, 180);
  }
  requestAnimationFrame(tick);
}

window.addEventListener('load', runLoader, {once:true});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, {threshold:.12});
document.querySelectorAll('.reveal,.reveal-up').forEach(el => observer.observe(el));

let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
window.addEventListener('pointermove', e => {
  mx = e.clientX; my = e.clientY;
  if (dot) dot.style.opacity = 1;
  if (ring) ring.style.opacity = 1;
});
function cursorLoop(){
  rx += (mx-rx)*.12;
  ry += (my-ry)*.12;
  if (dot){ dot.style.left=mx+'px'; dot.style.top=my+'px'; }
  if (ring){ ring.style.left=rx+'px'; ring.style.top=ry+'px'; }
  requestAnimationFrame(cursorLoop);
}
cursorLoop();

document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mouseenter',()=>ring && ring.classList.add('active'));
  el.addEventListener('mouseleave',()=>{
    if (ring) ring.classList.remove('active');
    el.style.transform='';
  });
  el.addEventListener('mousemove',e=>{
    if (matchMedia('(pointer:coarse)').matches) return;
    const r=el.getBoundingClientRect();
    const x=(e.clientX-(r.left+r.width/2))*.08;
    const y=(e.clientY-(r.top+r.height/2))*.08;
    el.style.transform=`translate3d(${x}px,${y}px,0)`;
  });
});

// Homepage navbar items use the same magnetic cursor interaction as @saiful islam.
// The small movement follows the pointer and smoothly returns when the pointer leaves.
document.querySelectorAll('.nav .brand, .nav .nav-link').forEach(el => {
  el.addEventListener('mousemove', e => {
    if (matchMedia('(pointer:coarse)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * .08;
    const y = (e.clientY - (r.top + r.height / 2)) * .08;
    el.style.transform = `translate3d(${x}px,${y}px,0)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});

const hero = document.querySelector('.hero');
const heroPhoto = document.querySelector('.hero-photo img');

let targetPX=0,targetPY=0,currentPX=0,currentPY=0;
let targetScroll=0,currentScroll=0,targetTiltX=0,targetTiltY=0,currentTiltX=0,currentTiltY=0;

function updateHeroPhoto(){
  if(!heroPhoto) return;
  currentPX+=(targetPX-currentPX)*.055;
  currentPY+=(targetPY-currentPY)*.055;
  currentScroll+=(targetScroll-currentScroll)*.045;
  currentTiltX+=(targetTiltX-currentTiltX)*.045;
  currentTiltY+=(targetTiltY-currentTiltY)*.045;
  const x=currentPX+currentScroll*.22;
  const y=currentPY+currentScroll*.10;
  heroPhoto.style.transform=`translate3d(${x}px,${y}px,0) scale(1.055) rotateX(${currentTiltY}deg) rotateY(${currentTiltX}deg)`;
  requestAnimationFrame(updateHeroPhoto);
}
window.addEventListener('pointermove',e=>{
  if(!heroPhoto||matchMedia('(pointer:coarse)').matches||reducedMotion)return;
  targetPX=(e.clientX/innerWidth-.5)*-34;
  targetPY=(e.clientY/innerHeight-.5)*-22;
  targetTiltX=(e.clientY/innerHeight-.5)*-1.4;
  targetTiltY=(e.clientX/innerWidth-.5)*1.8;
});
window.addEventListener('pointerleave',()=>{
  targetPX=0;targetPY=0;targetTiltX=0;targetTiltY=0;
});
window.addEventListener('scroll',()=>{
  if(!heroPhoto||reducedMotion)return;
  const r=hero?hero.getBoundingClientRect():null;
  if(!r)return;
  const p=Math.max(-1,Math.min(1,-r.top/Math.max(1,innerHeight)));
  targetScroll=p*-28;
});
if(!reducedMotion)requestAnimationFrame(updateHeroPhoto);

const nameMarquee = document.querySelector('.hero-marquee-track');
if (nameMarquee) {
  const marquee = document.querySelector('.hero-marquee');
  marquee.addEventListener('mouseenter', () => nameMarquee.style.animationPlayState='paused');
  marquee.addEventListener('mouseleave', () => nameMarquee.style.animationPlayState='running');
}

if (reducedMotion && loader) {
  // Keep accessibility predictable; the loader still hands off immediately.
  loader.style.transitionDuration = '.35s';
}


/* --- Navigation: visible on homepage + soft section-aware motion --- */
const nav = document.querySelector('.nav');
const navLinks = document.querySelectorAll('[data-nav-link]');
const scrollMenu = document.querySelector('.scroll-menu');
const scrollNavTrigger = document.querySelector('.scroll-nav-trigger');
const scrollMenuLinks = document.querySelectorAll('[data-scroll-nav-link]');
const sections = [
  document.querySelector('#top'),
  document.querySelector('#selected-work'),
  document.querySelector('#about'),
  document.querySelector('#contact')
].filter(Boolean);

let lastScrollY = window.scrollY;
let ticking = false;

function setScrollMenu(open){
  if(!scrollMenu) return;
  scrollMenu.classList.toggle('is-open', open);
  scrollMenu.setAttribute('aria-hidden', String(!open));
  scrollNavTrigger?.classList.toggle('is-open', open);
  scrollNavTrigger?.setAttribute('aria-expanded', String(open));
  scrollNavTrigger?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.classList.toggle('scroll-menu-open', open);
}

function updateNav(){
  const y = window.scrollY || 0;
  const scrollingUp = y < lastScrollY;

  // After leaving the hero, replace the compact navbar with a floating circular
  // navigation trigger. The large right-side panel opens only when that trigger
  // is clicked.
  const showScrollTrigger = y > 90;
  scrollNavTrigger?.classList.toggle('is-visible', showScrollTrigger);
  nav?.classList.toggle('nav-scrolled-out', showScrollTrigger);

  // Returning to the top closes the panel and restores the original navbar.
  if (y <= 90) {
    nav?.classList.remove('nav-scrolled-out');
    setScrollMenu(false);
  }

  // Switch the compact navbar contrast while it is still visible.
  const hero = document.querySelector('.hero');
  const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : innerHeight;
  const overLightSection = y > Math.max(80, heroBottom - 90);
  nav?.classList.toggle('nav-over-light', overLightSection);

  // Determine the active section for both navigation systems.
  let current = '#top';
  const probe = y + innerHeight * 0.28;
  sections.forEach(section => {
    if (section.offsetTop <= probe) current = '#' + (section.id || 'top');
  });
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('is-active', href === current);
  });
  scrollMenuLinks.forEach(link => {
    link.classList.toggle('is-current', link.getAttribute('href') === current);
  });

  lastScrollY = y;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateNav);
    ticking = true;
  }
}, {passive:true});

window.addEventListener('load', () => {
  // Do not reveal the navbar here: finishLoader() triggers its text reveal after the wipe.
  updateNav();
}, {once:true});

scrollNavTrigger?.addEventListener('click', () => {
  setScrollMenu(!scrollMenu?.classList.contains('is-open'));
});


scrollMenuLinks.forEach(link => link.addEventListener('click', () => {
  setScrollMenu(false);
}));

// Clicking the dimmed page area also closes the right panel.
scrollMenu?.querySelector('.scroll-menu-backdrop')?.addEventListener('click', () => {
  setScrollMenu(false);
});

/* --- V44: functional mobile full-screen menu + popup navigation --- */
const menuButton = document.querySelector('.menu');
const menuOverlay = document.querySelector('.menu-overlay');
const menuLinks = document.querySelectorAll('[data-menu-link]');

function setFullMenu(open){
  if(!menuOverlay || !menuButton) return;
  menuOverlay.classList.toggle('is-open', open);
  menuOverlay.setAttribute('aria-hidden', String(!open));
  menuButton.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('menu-open', open);

  // Keep the popup navigation closed while the animated full-screen menu is open.
  if(open) setScrollMenu(false);
}

menuButton?.addEventListener('click', () => {
  setFullMenu(!menuOverlay?.classList.contains('is-open'));
});

menuLinks.forEach(link => {
  link.addEventListener('click', () => setFullMenu(false));
});

document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){
    setFullMenu(false);
    setScrollMenu(false);
  }
});


/* V44 mobile navigation handoff:
   - At the top: animated full-screen Menu button is available.
   - After scrolling: the floating popup trigger appears.
   - Both systems retain their existing animations and never stay open together.
*/
function syncMobileNavigation(){
  if(!window.matchMedia('(max-width:800px)').matches) return;
  const y = window.scrollY || 0;
  const showPopup = y > 90;
  scrollNavTrigger?.classList.toggle('is-visible', showPopup);
  nav?.classList.toggle('nav-scrolled-out', showPopup);

  if(y <= 90 && scrollMenu?.classList.contains('is-open')){
    setScrollMenu(false);
  }
}
window.addEventListener('scroll', syncMobileNavigation, {passive:true});
window.addEventListener('load', syncMobileNavigation, {once:true});

// Footer local time: Bangladesh (GMT+6), updated every second.
function updateFooterTime(){
  const el = document.querySelector('#footerTime');
  if(!el) return;
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone:'Asia/Dhaka', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true
  }).formatToParts(now);
  const get = type => parts.find(p => p.type === type)?.value || '';
  el.textContent = `${get('hour')}:${get('minute')} ${get('dayPeriod')} GMT+6`;
}
updateFooterTime();
setInterval(updateFooterTime, 1000);

/* --- Contact page transition: same cinematic animation as About / Work --- */
(() => {
  const transition = document.querySelector('.page-transition');
  if (!transition) return;

  const contactLinks = document.querySelectorAll('a[href="contact.html"], a[href="./contact.html"]');
  contactLinks.forEach(link => {
    link.addEventListener('click', event => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (link.closest('.contact-page')) return;

      const href = link.getAttribute('href');
      if (!href) return;

      event.preventDefault();

      const title = transition.querySelector('.page-transition-label span');
      const name = transition.querySelector('.page-transition-label small');
      if (title) title.textContent = 'CONTACT';
      if (name) name.textContent = 'SAIFUL ISLAM';

      transition.classList.remove('page-transition-in', 'is-ready');
      transition.classList.add('is-active');
      document.body.classList.add('page-transitioning');

      setTimeout(() => { window.location.href = href; }, 1050);
    });
  });
})();

/* --- About page transition: same cinematic animation as Home / Work --- */
(() => {
  const transition = document.querySelector('.page-transition');
  if (!transition) return;

  const aboutLinks = document.querySelectorAll('a[href="about.html"], a[href="./about.html"]');
  aboutLinks.forEach(link => {
    link.addEventListener('click', event => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (link.closest('.about-page')) return;

      const href = link.getAttribute('href');
      if (!href) return;

      event.preventDefault();

      const title = transition.querySelector('.page-transition-label span');
      const name = transition.querySelector('.page-transition-label small');
      if (title) title.textContent = 'ABOUT';
      if (name) name.textContent = 'SAIFUL ISLAM';

      transition.classList.remove('page-transition-in', 'is-ready', 'page-transition-no-label');
      transition.classList.add('is-active');
      document.body.classList.add('page-transitioning');

      setTimeout(() => { window.location.href = href; }, 1050);
    });
  });
})();

/* --- Work page transition: same cinematic animation as About --- */
(() => {
  const transition = document.querySelector('.page-transition');
  if (!transition) return;

  const workLinks = document.querySelectorAll('a[href="work.html"], a[href="./work.html"]');
  workLinks.forEach(link => {
    link.addEventListener('click', event => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (link.closest('.work-page')) return;

      const href = link.getAttribute('href');
      if (!href) return;

      event.preventDefault();

      const title = transition.querySelector('.page-transition-label span');
      const name = transition.querySelector('.page-transition-label small');
      if (title) title.textContent = 'WORK';
      if (name) name.textContent = 'SAIFUL ISLAM';

      transition.classList.remove('page-transition-in', 'is-ready');
      transition.classList.add('is-active');
      document.body.classList.add('page-transitioning');

      setTimeout(() => { window.location.href = href; }, 1050);
    });
  });
})();
