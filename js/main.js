// PWA: register the service worker (enables install + offline viewing)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  });
}

// Nav scroll state
const nav = document.querySelector('.nav');
const onScroll = () => {
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
const backdrop = document.querySelector('.nav-backdrop');
function closeMobileNav() {
  links.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  document.body.style.overflow = '';
}
function openMobileNav() {
  links.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}
if (toggle) {
  toggle.addEventListener('click', () => {
    links.classList.contains('open') ? closeMobileNav() : openMobileNav();
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
  if (backdrop) backdrop.addEventListener('click', closeMobileNav);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
  });
}

// ---------- Kinetic type: split headline words into masked spans ----------
document.querySelectorAll('[data-kinetic]').forEach(el => {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words
    .map(w => `<span class="kinetic-word"><span class="kinetic-inner">${w}</span></span>`)
    .join(' ');
  el.classList.add('kinetic');
});

// Reveal on scroll (also drives .kinetic headline entrances via the same class)
const revealEls = document.querySelectorAll('.reveal, .kinetic');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
revealEls.forEach(el => io.observe(el));

// ---------- Subtle scroll parallax on imagery ----------
const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
let ticking = false;
function updateParallax() {
  const vh = window.innerHeight;
  parallaxEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const offset = (center - vh / 2) / vh; // -0.5 .. 0.5 roughly
    const speed = parseFloat(el.dataset.parallax) || 0.12;
    el.style.transform = `translateY(${(-offset * speed * 100).toFixed(2)}px)`;
  });
  ticking = false;
}
function onParallaxScroll() {
  if (!ticking) {
    requestAnimationFrame(updateParallax);
    ticking = true;
  }
}
if (parallaxEls.length) {
  updateParallax();
  window.addEventListener('scroll', onParallaxScroll, { passive: true });
  window.addEventListener('resize', onParallaxScroll);
}

// Pause/play videos when off-screen for performance
const videos = document.querySelectorAll('video');
const vio = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const v = entry.target;
    if (entry.isIntersecting) v.play().catch(() => {});
    else v.pause();
  });
}, { threshold: 0.25 });
videos.forEach(v => vio.observe(v));

// Current year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
