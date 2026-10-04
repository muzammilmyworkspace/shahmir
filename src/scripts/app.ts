import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import barba from '@barba/core';
import SplitType from 'split-type';
import W from '../data/wordmark-letters.json';
import { SITE } from '../data/content';
import { initShahmir } from './shahmir';

gsap.registerPlugin(ScrollTrigger);
declare global { interface Window { __lenis?: Lenis; __lenisLocked?: boolean; __headerTheme?: () => void } }

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* page-level cleanups, run before every Barba leave */
let cleanups: (() => void)[] = [];
const onCleanup = (fn: () => void) => cleanups.push(fn);
const addTick = (fn: (t: number, dt: number) => void) => { gsap.ticker.add(fn); onCleanup(() => gsap.ticker.remove(fn)); };

/* ================= Lenis ================= */
let tickLenis: ((t: number) => void) | null = null;
function initLenis() {
  const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  tickLenis = (t) => lenis.raf(t * 1000);
  gsap.ticker.add(tickLenis);
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;
  if (window.__lenisLocked) lenis.stop();
}
function destroyLenis() {
  if (tickLenis) gsap.ticker.remove(tickLenis);
  tickLenis = null;
  window.__lenis?.destroy();
  window.__lenis = undefined;
}

/* ================= line splitting ================= */
async function fontReady(el: HTMLElement) {
  const cs = getComputedStyle(el);
  try { await document.fonts.load(`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`); } catch { /* ignore */ }
}
function splitLines(el: HTMLElement): HTMLElement[] {
  if (el.dataset.revealInit === '1') return $$('.reveal-line', el);
  const text = el.textContent ?? '';
  if (!text.trim()) return [];
  el.dataset.revealInit = '1';
  el.setAttribute('aria-label', text.replace(/\s+/g, ' ').trim());
  let lines: HTMLElement[];
  if (text.includes('\n')) {
    el.textContent = '';
    lines = text.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const d = document.createElement('div'); d.className = 'reveal-line'; d.textContent = l; el.appendChild(d); return d; });
  } else {
    lines = (new SplitType(el, { types: 'lines', lineClass: 'reveal-line' }).lines ?? []) as HTMLElement[];
  }
  lines.forEach((l) => { const m = document.createElement('div'); m.className = 'reveal-mask'; m.setAttribute('aria-hidden', 'true'); l.parentNode?.insertBefore(m, l); m.appendChild(l); });
  return lines;
}
const easeLines = (lines: HTMLElement[], x: number) => {
  const n = lines.length;
  lines.forEach((l, i) => {
    const s = n > 1 ? (i / (n - 1)) * 0.4 : 0;
    const f = clamp((x - s) / 0.6), e = 1 - Math.pow(1 - f, 3);
    l.style.transform = `translateY(${(1 - e) * 100}%)`;
  });
};

let hasNavigated = false;

function initReveals(root: ParentNode) {
  $$('[data-reveal]', root).forEach(async (el) => {
    await fontReady(el);
    const lines = splitLines(el);
    if (!lines.length || reduced) return;
    const tw = gsap.from(lines, { yPercent: 110, opacity: 0, duration: 1, ease: 'power4.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 85%' } });
    onCleanup(() => tw.kill());
  });
}
async function initEntryReveals(root: ParentNode) {
  const els = $$('[data-reveal-entry]', root);
  if (!els.length) return;
  await document.fonts.ready;
  const hasHero = !!$('#video-project', root);
  const base = Math.max(0.1, (!hasNavigated && hasHero ? 0.9 : 0.15) - performance.now() / 1000);
  els.forEach((el, i) => {
    const lines = splitLines(el);
    if (!lines.length || reduced) return;
    const tw = gsap.from(lines, { yPercent: 100, duration: 1.1, ease: 'power4.out', stagger: 0.09, delay: base + i * 0.06 });
    onCleanup(() => tw.kill());
  });
}

/* ================= shared spring (mass 1, damping 24, k 115.2) ================= */
function spring(apply: (v: number) => void, done: () => void, from = 0) {
  let m = from, vel = 0, last: number | null = null;
  const tick = () => {
    const now = performance.now(), dt = last === null ? 0 : Math.min(0.05, (now - last) / 1000);
    last = now;
    const h = dt / 4;
    for (let i = 0; i < 4; i++) { const a = (-115.2 * (m - 1) - 24 * vel) / 1; vel += a * h; m += vel * h; }
    apply(clamp(m, 0, 1.2));
    if (Math.abs(m - 1) < 0.001 && Math.abs(vel) < 0.001) { gsap.ticker.remove(tick); apply(1); done(); }
  };
  gsap.ticker.add(tick);
  return () => gsap.ticker.remove(tick);
}
const lockScroll = () => { document.documentElement.style.overflow = 'hidden'; document.body.style.overflow = 'hidden'; window.__lenisLocked = true; window.__lenis?.stop(); };
const unlockScroll = () => { document.documentElement.style.overflow = ''; document.body.style.overflow = ''; window.__lenisLocked = false; window.__lenis?.start(); };

/* ================= HOME: hero scene ================= */
/* Same choreography as the reference film, driven by the section's scroll progress:
   intro spring (frame .55 → 1), the subject turns to camera (0 → .38), the camera slides
   past him and pushes into the circle's glowing crescent (.30 → .92), brand overlay .78 → 1. */
function initHero(root: ParentNode) {
  const sec = $('#video-project', root), frame = $('#video-frame', root);
  const headline = $('#hero-headline', root), aside = $('#hero-aside', root), overlay = $('#orange-overlay', root), content = $('#project-content', root);
  const plate = $('.hs-plate', root), manWrap = $('.hs-man-wrap', root), man = $('.hs-man', root), glow = $('.hs-glow', root), shadow = $('.hs-shadow', root);
  if (!sec || !frame || !overlay || !content || !plate || !manWrap || !man || !glow) return;

  const s = innerWidth < 1024 ? 0.65 : 0.55;
  const intro = !hasNavigated && !reduced && scrollY < 10;
  frame.style.transform = `scale(${intro ? s : 1})`;
  if (intro) {
    lockScroll();
    const dc = gsap.delayedCall(0.8, () => {
      const stop = spring((m) => (frame.style.transform = `scale(${s + (1 - s) * m})`), unlockScroll);
      onCleanup(stop);
    });
    onCleanup(() => { dc.kill(); unlockScroll(); });
  }

  let lines: HTMLElement[] = [];
  const reveals = $$('[data-reveal-content]', content);
  Promise.all(reveals.map(fontReady)).then(() => { lines = reveals.flatMap(splitLines); lines.forEach((l) => (l.style.transform = 'translateY(100%)')); });

  const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeIn = (t: number) => t * t * t;
  // the crescent's brightest point, in plate coordinates (plate height = 1, centre x = .5 of width)
  const placeOrigin = () => {
    // plate is background-size: cover (3840x2160), anchored top-centre
    const W = frame.offsetWidth, H = frame.offsetHeight, sc = Math.max(W / 3840, H / 2160);
    const iw = 3840 * sc, ih = 2160 * sc;
    const x = (W - iw) / 2 + iw / 2 + 0.272 * ih, y = 0.308 * ih;
    plate.style.transformOrigin = `${x}px ${y}px`;
    glow.style.left = `${x}px`; glow.style.top = `${y}px`;
  };
  placeOrigin();
  addEventListener('resize', placeOrigin);
  onCleanup(() => removeEventListener('resize', placeOrigin));

  const progress = () => { const r = sec.getBoundingClientRect(), L = sec.offsetHeight - innerHeight; return L > 0 ? clamp(-r.top / L) : 0; };
  let lastP = -1;
  addTick(() => {
    const p = progress();
    if (Math.abs(p - lastP) < 0.00005) return;
    lastP = p;
    const k = 1 - Math.pow(1 - clamp(p / 0.12), 3);
    for (const el of [headline, aside]) if (el) { el.style.opacity = String(1 - k); el.style.transform = `translate3d(0, ${140 * k}px, 0)`; }

    if (!reduced) {
      const turn = easeIO(clamp(p / 0.38));
      const push = easeIn(clamp((p - 0.3) / 0.62));
      // subject: turned away → facing camera, then the camera slides past him
      man.style.transform = `translateX(-50%) perspective(1400px) rotateY(${(-22 * (1 - turn)).toFixed(2)}deg)`;
      man.style.filter = `brightness(${(0.82 + 0.18 * turn).toFixed(3)})`;
      manWrap.style.transform = `translate3d(${(-1.5 * (1 - turn) - 78 * push).toFixed(2)}vw, ${(34 * push).toFixed(2)}vh, 0) scale(${(1 + 0.05 * turn + 2.3 * push).toFixed(3)})`;
      if (shadow) shadow.style.opacity = String(1 - push * 1.4);
      // background: slight counter-parallax while he turns, then the push into the crescent
      plate.style.transform = `translate3d(${(0.8 * (1 - turn)).toFixed(2)}vw, 0, 0) scale(${(1.04 - 0.04 * turn + 7.5 * push).toFixed(3)})`;
      glow.style.opacity = String(clamp(push * 1.35));
      glow.style.transform = `translate(-50%, -50%) scale(${(0.6 + 3.2 * push).toFixed(3)})`;
    }
    overlay.style.opacity = String(clamp((p - 0.78) / 0.22));
    const q = clamp((p - 0.9) / 0.1);
    content.style.opacity = String(Math.min(1, q / 0.2));
    content.style.transform = '';
    if (lines.length) easeLines(lines, q);
  });
}

/* ================= HOME: statement + 3D object ================= */
async function initStatement(root: ParentNode) {
  const sec = $('#statement', root), text = $('#statement-text', root), obj = $('#statement-object', root);
  if (!sec || !text || !obj) return;
  await document.fonts.ready;
  const lines = splitLines(text);
  gsap.set(lines, { yPercent: 100 });
  gsap.set(obj, { yPercent: 200 });
  const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: '+=180%', pin: true, scrub: 1.2, anticipatePin: 1 } });
  tl.to(lines, { yPercent: 0, duration: 0.6, ease: 'power4.out', stagger: { each: 0.08 } })
    .to(obj, { yPercent: -40, duration: 2, ease: 'power3.out' }, '>-0.5');
  ScrollTrigger.refresh();
  // the 3D object loads only when the section is near
  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    const { initObject } = await import('./objectViewer');
    const stop = initObject(obj);
    onCleanup(stop);
  }, { rootMargin: '100% 0px' });
  io.observe(sec);
  onCleanup(() => io.disconnect());
}

/* ================= HOME: focus areas ================= */
function initFocus(root: ParentNode) {
  const list = $('#focus-list', root), items = $$('.focus-item', root);
  if (!list || !items.length) return;
  const setActive = (i: number) => items.forEach((it, j) => { const c = $('.focus-content', it); if (c) c.style.opacity = j === i ? '1' : '0.3'; });
  setActive(0);
  items.forEach((it, i) => it.addEventListener('click', () => setActive(i)));
  list.addEventListener('mouseleave', () => setActive(0));
  const box = $('#media-container', root), medias = $('.focus-medias', root);
  if (!box || !medias) return;
  const srcs: string[] = [];
  $$<HTMLImageElement>('img', medias).forEach((im) => (srcs[Number(im.dataset.index)] = im.getAttribute('src') ?? ''));
  const add = (i: number) => {
    const src = srcs[i]; if (!src) return;
    const d = document.createElement('div'), im = document.createElement('img');
    im.src = src; im.alt = ''; d.appendChild(im); box.appendChild(d);
    gsap.to([d, im], { y: 0, duration: 0.6, ease: 'expo.inOut' });
    if (box.children.length > 20) box.children[0].remove();
  };
  items.forEach((it, i) => it.addEventListener('mouseenter', () => { setActive(i); add(i); }));
  gsap.set(box, { xPercent: -50, yPercent: -50 });
  const qy = gsap.quickTo(box, 'y', { duration: 0.5, ease: 'power4' });
  const rel = (cy: number) => { const op = box.offsetParent as HTMLElement | null; return cy - (op ? op.getBoundingClientRect().top : 0); };
  list.addEventListener('mouseenter', (e) => { box.classList.add('on'); gsap.set(box, { y: rel((e as MouseEvent).clientY) }); });
  list.addEventListener('mousemove', (e) => qy(rel((e as MouseEvent).clientY)));
  list.addEventListener('mouseleave', () => { box.classList.remove('on'); Array.from(box.children).forEach((c) => c.remove()); });
}

/* ================= HOME: globe ================= */
function initGlobeSection(root: ParentNode) {
  const canvas = $<HTMLCanvasElement>('#globe-canvas', root), cards = $('#globe-cards', root), scene = $('#globe-scene', root);
  if (!canvas || !cards || !scene) return;
  let stop: (() => void) | null = null;
  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting || stop) return;
    io.disconnect();
    const { initGlobe } = await import('./globe');
    stop = initGlobe(canvas, cards, scene, 0);
  }, { rootMargin: '150% 0px' });
  io.observe(scene);
  onCleanup(() => { io.disconnect(); stop?.(); });
}

/* ================= HOME: testimonials ================= */
function initTestimonials(root: ParentNode) {
  const sec = $('#testimonials-section', root);
  if (!sec) return;
  const slides = $$('.testimonial-slide', sec), bar = $('#testimonial-progress', sec);
  let cur = 0, timer: number | undefined;
  const run = () => {
    if (!bar) return;
    clearTimeout(timer);
    bar.style.transition = 'none'; bar.style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transition = 'width 6000ms linear'; bar.style.width = '100%'; }));
    timer = window.setTimeout(() => show((cur + 1) % slides.length), 6000);
  };
  const show = (i: number) => { slides.forEach((s, j) => (s.style.display = j === i ? '' : 'none')); cur = i; run(); };
  if (slides.length) show(0);
  onCleanup(() => clearTimeout(timer));
}

/* ================= HOME: featured cases ================= */
function initCases(root: ParentNode) {
  const wrap = $('[data-cases-wrapper]', root), imgs = $$('[data-case-images]', root), texts = $$('[data-case-text]', root);
  if (!wrap || imgs.length <= 1) return;
  const n = imgs.length, lines: HTMLElement[][] = texts.map(() => []);
  texts.forEach((t, i) => {
    const r = $$('[data-case-reveal]', t);
    Promise.all(r.map(fontReady)).then(() => { lines[i] = r.flatMap(splitLines); easeLines(lines[i], 0); });
  });
  const st = ScrollTrigger.create({
    trigger: wrap, start: 'top top', end: 'bottom bottom',
    onUpdate(self) {
      const s = self.progress * (n - 1), i = Math.min(Math.floor(s), n - 2), f = s - i;
      imgs.forEach((im, d) => {
        im.style.transform = d === i + 1 ? `translateY(${(1 - f) * 100}%)` : d === i ? `translateY(${-f * 30}%)` : d < i ? 'translateY(0%)' : 'translateY(100%)';
      });
      const c = Math.max(0, (f - 0.8) / 0.2);
      texts.forEach((t, d) => {
        let o = 0;
        if (d === i) o = 1 - c; else if (d === i + 1) o = c;
        t.style.opacity = String(o); t.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
        const x = d < i ? 1 : d === i ? (d === 0 ? Math.min(1, s / 0.5) : 1) : d === i + 1 ? c : 0;
        easeLines(lines[d], x);
      });
    },
  });
  onCleanup(() => st.kill());
}

/* ================= gravity wordmark ================= */
function makeSpring(k: number, c: number) {
  let x = 0, v = 0, target = 0;
  return { set(t: number) { target = t; }, step(dt: number) { const a = -k * (x - target) - c * v; v += a * dt; x += v * dt; return x; } };
}
function initGravity(root: ParentNode) {
  $$('.gravity-text', root).forEach((stage) => {
    const svg = $('svg', stage) as SVGSVGElement | null;
    const letters = $$<SVGPathElement>('.gravity-letter', stage);
    if (!svg || !letters.length || reduced) return;
    const springs = letters.map(() => ({ x: makeSpring(60, 14), y: makeSpring(60, 14), r: makeSpring(45, 12) }));
    let centers: { x: number; y: number }[] = [];
    const measure = () => {
      letters.forEach((l) => (l.style.transform = ''));
      const sr = stage.getBoundingClientRect();
      centers = letters.map((l) => { const r = l.getBoundingClientRect(); return { x: r.left - sr.left + r.width / 2, y: r.top - sr.top + r.height / 2 }; });
    };
    measure();
    addEventListener('resize', measure);
    onCleanup(() => removeEventListener('resize', measure));
    let ptr: { x: number; y: number } | null = null;
    stage.addEventListener('mousemove', (e) => { const r = stage.getBoundingClientRect(); ptr = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    stage.addEventListener('mouseleave', () => (ptr = null));
    let last: number | null = null;
    addTick(() => {
      const now = performance.now(), dt = last === null ? 0 : Math.min(0.05, (now - last) / 1000); last = now;
      const k = W.w / svg.getBoundingClientRect().width; // user units per css pixel
      letters.forEach((l, i) => {
        const s = springs[i];
        if (ptr && centers[i]) {
          const dx = ptr.x - centers[i].x, dy = ptr.y - centers[i].y, d = Math.hypot(dx, dy) || 1, f = Math.max(0, 1 - d / 384);
          s.x.set((dx / d) * f * 72); s.y.set((dy / d) * f * 72); s.r.set((dx / d) * f * 14.4);
        } else { s.x.set(0); s.y.set(0); s.r.set(0); }
        const x = s.x.step(dt), y = s.y.step(dt), r = s.r.step(dt);
        // the wordmark group is mirrored on Y (font units), so invert y and rotation
        l.style.transform = `translate(${(x * k).toFixed(2)}px, ${(-y * k).toFixed(2)}px) rotate(${(-r).toFixed(2)}deg)`;
      });
    });
  });
}

/* ================= blog filters ================= */
function initBlogFilters(root: ParentNode) {
  const bar = $('#blog-filters', root);
  if (!bar) return;
  const pills = $$<HTMLButtonElement>('.filter-pill', bar), cards = $$('[data-categories]', root);
  pills.forEach((p) => p.addEventListener('click', () => {
    const f = p.dataset.filter!;
    pills.forEach((q) => q.setAttribute('aria-pressed', String(q === p)));
    cards.forEach((c) => (c.style.display = f === 'all' || c.dataset.categories!.split(',').includes(f) ? '' : 'none'));
    ScrollTrigger.refresh();
  }));
}

/* ================= contact ================= */
function initContact(root: ParentNode) {
  const trigger = $('#source-trigger', root), list = $('#source-list', root), chevron = $('#source-chevron', root), value = $<HTMLInputElement>('#source-value', root);
  const close = () => { list?.classList.add('hidden'); trigger?.removeAttribute('data-open'); trigger?.setAttribute('aria-expanded', 'false'); chevron?.classList.remove('rotate-180'); };
  if (trigger && list) {
    trigger.addEventListener('click', () => {
      if (!list.classList.contains('hidden')) return close();
      list.classList.remove('hidden'); trigger.setAttribute('data-open', ''); trigger.setAttribute('aria-expanded', 'true'); chevron?.classList.add('rotate-180');
    });
    list.addEventListener('click', (e) => {
      const opt = (e.target as HTMLElement).closest<HTMLElement>('[data-value]');
      if (!opt) return;
      if (value) value.value = opt.dataset.value ?? '';
      trigger.textContent = opt.textContent?.trim() ?? '';
      trigger.setAttribute('data-filled', '');
      $$('[role=option]', list).forEach((o) => o.setAttribute('aria-selected', String(o === opt)));
      close();
    });
    const outside = (e: MouseEvent) => { if (!$('#source-dropdown', root)?.contains(e.target as Node)) close(); };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('click', outside); document.addEventListener('keydown', esc);
    onCleanup(() => { document.removeEventListener('click', outside); document.removeEventListener('keydown', esc); });
  }
  const form = $<HTMLFormElement>('#contact-form', root), status = $('#contact-status', root);
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!status) return;
    status.textContent = 'Sending…';
    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${SITE.email}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...data, _subject: 'New project enquiry' }) });
      status.textContent = res.ok ? 'Thanks, your message was sent.' : 'Something went wrong. Please try again.';
      if (res.ok) form.reset();
    } catch { status.textContent = 'Network error. Please try again.'; }
  });
}

/* ================= videos that play only in view ================= */
function initInViewVideos(root: ParentNode) {
  const vids = $$<HTMLVideoElement>('video[data-autoplay-in-view]', root);
  if (!vids.length) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => { const v = e.target as HTMLVideoElement; e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }), { threshold: 0.1 });
  vids.forEach((v) => io.observe(v));
  onCleanup(() => io.disconnect());
}

/* ================= page lifecycle ================= */
async function initPage(root: ParentNode = document) {
  initLenis();
  initReveals(root);
  initHero(root);
  const entry = initEntryReveals(root);
  const statement = initStatement(root);
  initFocus(root);
  initGlobeSection(root);
  initTestimonials(root);
  initGravity(root);
  initBlogFilters(root);
  initContact(root);
  initInViewVideos(root);
  onCleanup(initShahmir(root));
  await Promise.all([entry, statement]);
  initCases(root);
  ScrollTrigger.refresh();
}
function destroyPage() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  cleanups.splice(0).forEach((fn) => { try { fn(); } catch { /* ignore */ } });
  destroyLenis();
}

/* ================= Barba: reveal-grow ================= */
const startScale = () => (innerWidth < 1024 ? 0.65 : 0.55);
function glassLayer() {
  $$('[data-barba-glass]').forEach((e) => e.remove());
  const g = document.createElement('div');
  g.setAttribute('data-barba-glass', '');
  Object.assign(g.style, { position: 'fixed', inset: '0', zIndex: '9998', opacity: '0', pointerEvents: 'none', backdropFilter: 'blur(32px)', webkitBackdropFilter: 'blur(32px)' });
  document.body.appendChild(g);
  return g;
}

history.scrollRestoration = 'manual';
initPage();

barba.init({
  timeout: 15000,
  prevent: ({ el }) => !!(el as HTMLAnchorElement).href?.startsWith('mailto:') || (el as HTMLAnchorElement).target === '_blank',
  transitions: [{
    name: 'reveal-grow',
    sync: true,
    beforeLeave() { destroyPage(); },
    leave() {},
    enter({ current, next }) {
      return new Promise<void>((resolve) => {
        const c = next.container as HTMLElement, glass = glassLayer(), s = startScale();
        document.documentElement.style.overflow = 'hidden'; document.body.style.overflow = 'hidden';
        Object.assign(c.style, { position: 'fixed', inset: '0', zIndex: '9999', overflow: 'hidden', transformOrigin: '50% 50%', boxShadow: '0 24px 64px rgba(0, 0, 0, 0.18)' });
        gsap.set(c, { scale: s, yPercent: 100, opacity: 0 });
        gsap.timeline()
          .to(glass, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)
          .to(c, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0)
          .to({}, { duration: 0.8 })
          .call(() => {
            spring((m) => gsap.set(c, { scale: s + (1 - s) * m }), () => {
              Object.assign(c.style, { position: '', inset: '', zIndex: '', overflow: '', transformOrigin: '', boxShadow: '' });
              gsap.set(c, { clearProps: 'transform,opacity' });
              glass.remove();
              current.container.remove();
              window.scrollTo(0, 0);
              document.documentElement.style.overflow = ''; document.body.style.overflow = '';
              resolve();
            });
          });
      });
    },
    afterEnter({ next }) {
      hasNavigated = true;
      const title = new DOMParser().parseFromString(next.html, 'text/html').title;
      if (title) document.title = title;
      initPage(next.container);
      window.dispatchEvent(new Event('scroll'));
      window.__headerTheme?.();
    },
  }],
});
