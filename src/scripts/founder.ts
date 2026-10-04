import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
let introPlayed = false;

/** Founder (personal brand) home page. Returns a cleanup for Barba page changes. */
export function initFounder(root: ParentNode = document) {
  const hero = $('.f-hero', root);
  if (!hero) return () => {};
  const kill: (() => void)[] = [];
  const later = (fn: () => void) => kill.push(fn);

  /* ---------- hash links: smooth scroll, never a Barba navigation ---------- */
  $$<HTMLAnchorElement>('a[href^="#"]', root).forEach((a) => {
    a.setAttribute('data-barba-prevent', '');
    a.addEventListener('click', (e) => {
      const t = $(a.getAttribute('href')!, root);
      if (!t) return;
      e.preventDefault();
      (window as any).__lenis ? (window as any).__lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- split headings (masked lines) ---------- */
  const splitEls = $$('[data-split]', root);
  splitEls.forEach((el) => {
    const s = new SplitType(el, { types: 'lines', lineClass: 'f-line' });
    (s.lines ?? []).forEach((l) => { const m = document.createElement('span'); m.className = 'f-mask'; l.parentNode!.insertBefore(m, l); m.appendChild(l); });
  });

  /* ---------- loader + cover intro ---------- */
  const loader = $('.f-loader', root);
  const coverIntro = () => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.f-name-l, .f-name-r', { yPercent: 105, duration: 1.6, stagger: 0.08 }, 0)
      .from('.f-sun', { scale: 0.4, autoAlpha: 0, duration: 2 }, 0)
      .from('.f-arcs', { autoAlpha: 0, scale: 0.85, duration: 2.2 }, 0.1)
      .from('.f-figure', { yPercent: 18, autoAlpha: 0, duration: 1.8 }, 0.25)
      .from($$('.f-cover-line .f-line', root), { yPercent: 110, duration: 1.2, stagger: 0.1 }, 0.6)
      .from('.f-cover-top > *, .f-cover-side > *, .f-scrollcue', { y: 24, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.8);
    later(() => tl.kill());
  };
  if (loader && !introPlayed && !reduced()) {
    introPlayed = true;
    const count = $('[data-count]', loader)!;
    const n = { v: 0 };
    document.documentElement.style.overflow = 'hidden';
    const tl = gsap.timeline();
    tl.from($$('.f-loader-name span', loader), { yPercent: 110, duration: 1, stagger: 0.05, ease: 'expo.out' }, 0)
      .to(n, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => (count.textContent = String(Math.round(n.v)).padStart(2, '0')) }, 0)
      .to('.f-loader-bar', { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0)
      .to($$('.f-loader-name span', loader), { yPercent: -110, duration: 0.7, stagger: 0.03, ease: 'expo.in' }, 1.75)
      .to(loader, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, 2.2)
      .add(() => { document.documentElement.style.overflow = ''; coverIntro(); }, 2.45)
      .add(() => loader.remove());
    later(() => { tl.kill(); document.documentElement.style.overflow = ''; });
  } else { loader?.remove(); if (!reduced()) coverIntro(); }

  /* ---------- cover: name splits, founder steps forward ---------- */
  if (!reduced()) {
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to('.f-name-l', { xPercent: -38, autoAlpha: 0.25 }, 0)
      .to('.f-name-r', { xPercent: 52, autoAlpha: 0.25 }, 0)
      .to('.f-figure', { scale: 1.12, yPercent: -3 }, 0)
      .to('.f-sun', { scale: 1.35, yPercent: -8 }, 0)
      .to('.f-arcs', { rotate: 40, scale: 1.2 }, 0)
      .to('.f-cover-top, .f-cover-bottom, .f-scrollcue', { autoAlpha: 0, y: -40 }, 0);
    const st = ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.8, animation: tl });
    later(() => { st.kill(); tl.kill(); });

    // pointer parallax on the cover layers
    if (fine()) {
      const layers: [string, number][] = [['.f-sun', 18], ['.f-arcs', 10], ['.f-name', -14], ['.f-figure', 26]];
      const qs = layers.map(([s, k]) => ({ x: gsap.quickTo(s, 'x', { duration: 1.2, ease: 'power3' }), y: gsap.quickTo(s, 'y', { duration: 1.2, ease: 'power3' }), k }));
      const move = (e: PointerEvent) => { const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5; qs.forEach((q) => { q.x(x * q.k); q.y(y * q.k * 0.6); }); };
      addEventListener('pointermove', move, { passive: true });
      later(() => removeEventListener('pointermove', move));
    }
  }

  /* ---------- manifesto: words light up as you read ---------- */
  const words = $$('.f-manifesto-text .w', root);
  if (words.length) {
    const st = ScrollTrigger.create({
      trigger: '.f-manifesto', start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: (s) => { const k = s.progress * words.length * 1.15; words.forEach((w, i) => w.classList.toggle('on', i < k)); },
    });
    later(() => st.kill());
  }

  /* ---------- reveals ---------- */
  if (!reduced()) {
    splitEls.filter((el) => !el.closest('.f-hero')).forEach((el) => {
      const tw = gsap.from($$('.f-line', el), { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 85%' } });
      later(() => tw.kill());
    });
    $$('[data-fade]', root).forEach((el) => {
      const tw = gsap.from(el, { y: 40, autoAlpha: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
      later(() => tw.kill());
    });
    $$('[data-reveal-img]', root).forEach((el) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 80%' } });
      tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
        .from($('img', el), { scale: 1.35, duration: 1.8, ease: 'expo.out' }, 0.2);
      const par = gsap.to($('img', el), { yPercent: -8, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      later(() => { tl.kill(); par.kill(); });
    });
    // venture cards rise in
    const cards = gsap.from('.f-card', { y: 90, autoAlpha: 0, duration: 1.3, ease: 'expo.out', stagger: 0.15, scrollTrigger: { trigger: '.f-cards', start: 'top 80%' } });
    later(() => cards.kill());
    // principles: each card settles back as the next one lands on it
    const rules = $$('.f-rule', root);
    rules.slice(0, -1).forEach((r, i) => {
      const tw = gsap.to(r, { scale: 0.9 + i * 0.02, filter: 'brightness(.55)', ease: 'none', scrollTrigger: { trigger: rules[i + 1], start: 'top 85%', end: 'top 20%', scrub: true } });
      later(() => tw.kill());
    });
    // quote: face rises out of the red
    const qf = gsap.fromTo('.f-quote-face', { yPercent: 30 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.f-quote', start: 'top bottom', end: 'bottom top', scrub: true } });
    later(() => qf.kill());
  }

  /* ---------- cursor + magnetic buttons ---------- */
  const cursor = $('.f-cursor', root);
  if (cursor && fine()) {
    document.documentElement.classList.add('f-has-cursor');
    const cx = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' }), cy = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
    const label = $('em', cursor)!;
    const move = (e: PointerEvent) => { cx(e.clientX); cy(e.clientY); };
    const over = (e: Event) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor], a, button');
      cursor.classList.toggle('is-view', !!t?.dataset.cursor);
      cursor.classList.toggle('is-link', !!t && !t.dataset.cursor);
      if (t?.dataset.cursor) label.textContent = t.dataset.cursor;
    };
    addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over);
    later(() => { removeEventListener('pointermove', move); document.removeEventListener('pointerover', over); document.documentElement.classList.remove('f-has-cursor'); });
    $$('[data-magnetic]', root).forEach((b) => {
      const qx = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'elastic.out(1, .4)' }), qy = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'elastic.out(1, .4)' });
      b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * 0.3); qy((e.clientY - r.top - r.height / 2) * 0.4); });
      b.addEventListener('pointerleave', () => { qx(0); qy(0); });
    });
  }

  ScrollTrigger.refresh();
  return () => kill.forEach((f) => f());
}
