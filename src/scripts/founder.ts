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
  const journey = $('.f-journey', root);
  if (!journey) return () => {};
  const kill: (() => void)[] = [];
  const later = (fn: () => void) => kill.push(fn);

  /* ---------- hash links: smooth scroll, never a Barba navigation ---------- */
  $$<HTMLAnchorElement>('a[href^="#"]', root).forEach((a) => {
    a.setAttribute('data-barba-prevent', '');
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!.slice(1);
      e.preventDefault();
      if (journey.classList.contains('f-static')) { $('#' + id, root)?.scrollIntoView({ behavior: 'smooth' }); return; }
      jump(id);
    });
  });
  // header links like /#story land on the right chapter while on the home page
  const onNav = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="/#"]');
    if (!a || journey.classList.contains('f-static')) return;
    e.preventDefault(); e.stopPropagation();
    if (document.getElementById('menu-panel')?.classList.contains('is-open')) document.getElementById('menu-close')?.click();
    jump(a.getAttribute('href')!.slice(2));
  };
  document.addEventListener('click', onNav, true);
  later(() => document.removeEventListener('click', onNav, true));

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

  /* ---------- the journey: one pinned stage, the founder moves through every chapter ---------- */
  const words = $$('.f-manifesto-text .w', root);
  const anchors: Record<string, number> = { top: 0, story: 1.9, founder: 4.4, philosophy: 7.7, contact: 12.2 };
  let jump = (id: string) => {};
  if (reduced()) {
    journey.classList.add('f-static');
    words.forEach((w) => w.classList.add('on'));
  } else {
    const mobile = () => innerWidth < 768;
    const vw = (d: number, m: number) => () => (innerWidth * (mobile() ? m : d)) / 100;
    const at = { right: vw(16, 10), left: vw(-32, -10), mid: vw(-8, 0) };
    const follow = '.f-sun, .f-arcs';
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut', duration: 1 } });
    const show = (sel: string, t: number) => {
      tl.set(sel, { autoAlpha: 1 }, t);
      tl.from($$(`${sel} > *`, root), { y: 50, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out' }, t);
    };
    const hide = (sel: string, t: number) => {
      tl.to($$(`${sel} > *`, root), { y: -40, autoAlpha: 0, stagger: 0.04, duration: 0.45, ease: 'power2.in' }, t);
      tl.set(sel, { autoAlpha: 0 }, t + 0.6);
    };

    // 0 · cover: name splits, copy clears, founder steps to the right
    tl.to('.f-cover', { autoAlpha: 0, y: -40, duration: 0.5, ease: 'power1.in' }, 0)
      .to('.f-name-l', { xPercent: -38, autoAlpha: 0.14, duration: 1.2 }, 0)
      .to('.f-name-r', { xPercent: 52, autoAlpha: 0.14, duration: 1.2 }, 0)
      .to('.f-arcs', { rotate: 40, scale: 1.15, duration: 1.2 }, 0)
      .to('.f-figure', { x: at.right, scale: 0.94, duration: 1 }, 0.2)
      .to(follow, { x: at.right, duration: 1 }, 0.2)
      .to('.f-pose-a', { opacity: 0, duration: 0.5 }, 0.45).to('.f-pose-b', { opacity: 1, duration: 0.5 }, 0.45);

    // 1 · manifesto on the left, words light up as you read
    show('.f-manifesto', 0.85);
    const read = { p: 0 };
    tl.to(read, { p: 1, duration: 1.4, ease: 'none', onUpdate: () => { const k = read.p * words.length; words.forEach((w, i) => w.classList.toggle('on', i < k)); } }, 1.3);
    hide('.f-manifesto', 2.9);

    // 2 · founder steps left, his story on the right
    tl.to('.f-figure', { x: at.left, duration: 1 }, 3.0)
      .to(follow, { x: at.left, duration: 1 }, 3.0)
      .to('.f-pose-b', { opacity: 0, duration: 0.5 }, 3.25).to('.f-pose-a', { opacity: 1, duration: 0.5 }, 3.25);
    show('.f-founder', 3.6);
    hide('.f-founder', 5.0);

    // 3 · centre stage, the four rules arrive from both sides
    tl.to('.f-figure', { x: at.mid, scale: 0.86, duration: 1 }, 5.1)
      .to(follow, { x: at.mid, duration: 1 }, 5.1)
      .to('.f-name-l, .f-name-r', { autoAlpha: 0.06, duration: 1 }, 5.1);
    tl.set('.f-how', { autoAlpha: 1 }, 5.6)
      .from('.f-how-head > *', { y: 40, autoAlpha: 0, stagger: 0.08, duration: 0.5, ease: 'power3.out' }, 5.6);
    const rules = $$('.f-rule', root);
    rules.forEach((r, i) => {
      const t = 6.0 + i * 0.5;
      tl.from(r, { x: () => (i % 2 ? 1 : -1) * innerWidth * 0.45, autoAlpha: 0, rotate: (i % 2 ? 4 : -4), duration: 0.6, ease: 'power3.out' }, t);
      if (i < rules.length - 1) tl.to(r, { autoAlpha: () => (mobile() ? 0 : 1), y: () => (mobile() ? -30 : 0), duration: 0.3 }, t + 0.5);
    });
    tl.to('.f-how', { autoAlpha: 0, scale: 0.96, duration: 0.5, ease: 'power2.in' }, 8.2);

    // 4 · the image dims, the promise lands
    tl.to('.f-figure', { opacity: 0.2, scale: 0.92, duration: 0.8 }, 8.6)
      .to('.f-sun', { autoAlpha: 0.3, scale: 0.8, duration: 0.8 }, 8.6);
    show('.f-promise', 9.8);
    hide('.f-promise', 11.0);

    // 5 · back on the left, side pose, work with me
    tl.to('.f-figure', { autoAlpha: 0, duration: 0.5 }, 10.6)
      .set('.f-figure', { x: at.left }, 11.1)
      .set(follow, { x: at.left }, 11.1)
      .fromTo('.f-figure', { autoAlpha: 0, scale: 0.86, yPercent: 6 }, { autoAlpha: 1, scale: 0.94, yPercent: 0, duration: 0.8, immediateRender: false }, 11.2)
      .to('.f-sun', { autoAlpha: 1, scale: 1, duration: 0.8 }, 11.2);
    show('.f-work', 11.7);
    tl.to({}, { duration: 0.6 }, 12.3);

    const st = ScrollTrigger.create({ trigger: journey, start: 'top top', end: 'bottom bottom', scrub: 0.9, animation: tl, invalidateOnRefresh: true });
    jump = (id) => {
      const t = anchors[id] ?? 0;
      const y = st.start + (st.end - st.start) * (t / tl.duration());
      (window as any).__lenis ? (window as any).__lenis.scrollTo(y, { duration: 1.6 }) : scrollTo({ top: y, behavior: 'smooth' });
    };
    later(() => { st.kill(); tl.kill(); });

    // pointer parallax (inner layers only, the timeline owns the outer ones)
    if (fine()) {
      const layers: [string, number][] = [['.f-name', -14], ['.f-par', 26]];
      const qs = layers.map(([s, k]) => ({ x: gsap.quickTo(s, 'x', { duration: 1.2, ease: 'power3' }), y: gsap.quickTo(s, 'y', { duration: 1.2, ease: 'power3' }), k }));
      const move = (e: PointerEvent) => { const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5; qs.forEach((q) => { q.x(x * q.k); q.y(y * q.k * 0.6); }); };
      addEventListener('pointermove', move, { passive: true });
      later(() => removeEventListener('pointermove', move));
    }
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
