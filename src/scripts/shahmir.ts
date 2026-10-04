import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = () => innerWidth < 768;

/* ---------- marketing waves: flowing signal lines behind the founder ---------- */
export function waveField(canvas: HTMLCanvasElement, { lines = 34, energy = { v: 1 } } = {}) {
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W = 0, H = 0, raf = 0, alive = true, visible = true, t0 = performance.now();
  const size = () => { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size();
  const ro = new ResizeObserver(size); ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && alive) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); } });
  io.observe(canvas);
  const seeds = Array.from({ length: lines }, (_, i) => ({ f: 0.6 + ((i * 37) % 11) / 11, p: i * 1.7, a: 0.5 + ((i * 53) % 7) / 7 }));
  function draw(now: number) {
    if (!alive || !visible) return;
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    const e = energy.v;
    for (let i = 0; i < lines; i++) {
      const s = seeds[i], k = i / (lines - 1);
      const base = H * (0.18 + k * 0.7);
      const amp = (14 + 46 * Math.sin(k * Math.PI)) * s.a * (0.6 + 0.6 * e);
      const hot = Math.exp(-Math.pow((k - 0.5) / 0.22, 2));   // brighter through the middle band
      ctx.beginPath();
      for (let x = -20; x <= W + 20; x += 14) {
        const u = x / W;
        const y = base
          + Math.sin(u * 6.2 * s.f + t * 0.55 * s.f + s.p) * amp
          + Math.sin(u * 15 + t * 0.9 + s.p * 2) * amp * 0.18
          - Math.exp(-Math.pow((u - 0.5) / 0.16, 2)) * amp * 0.9 * Math.sin(t * 0.7 + s.p); // a swell around the centre
        x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      const alpha = (0.07 + 0.22 * hot) * (0.75 + 0.5 * e);
      ctx.strokeStyle = i % 7 === 0 ? `rgba(255,236,226,${alpha * 0.55})` : `rgba(255,42,42,${alpha})`;
      ctx.lineWidth = i % 7 === 0 ? 1 : 1.2;
      ctx.stroke();
    }
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
  return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
}

/* ---------- the founder sequence ---------- */
export function initShahmir(root: ParentNode = document) {
  const sec = $('#sh', root);
  if (!sec) return () => {};
  const cleanups: (() => void)[] = [];
  const energy = { v: 1 };
  const canvas = $<HTMLCanvasElement>('.sh-waves', sec);
  if (canvas && !reduced()) cleanups.push(waveField(canvas, { energy }));
  const endCanvas = $<HTMLCanvasElement>('.sh-waves-end', root);
  if (endCanvas && !reduced()) cleanups.push(waveField(endCanvas, { lines: 22 }));

  const fig = $('.sh-figure', sec)!, circle = $('.sh-circle', sec)!, rings = $('.sh-rings', sec)!, floor = $('.sh-floor', sec)!;
  const outline = $('.sh-outline span', sec)!, glow = $('.sh-glow', sec)!;
  const panels = $$('[data-panel]', sec);
  const members = $$('.sh-member', sec);
  const steps = $$('[data-step]', sec);
  const parts = (p: Element) => Array.from(p.children);

  // resting state
  const side = () => (mobile() ? 20 : 25);   // vw offset for the left / right poses
  gsap.set(fig, { xPercent: -50, transformOrigin: '50% 0%', transformPerspective: 1600 });
  gsap.set(panels.slice(1), { autoAlpha: 0 });
  panels.slice(1).forEach((p) => gsap.set(parts(p), { y: 40, autoAlpha: 0, filter: 'blur(8px)' }));
  gsap.set(members, { xPercent: -50, x: 0, autoAlpha: 0, scale: 0.9 });

  // entrance of the hook
  const hook = panels[0];
  gsap.from(parts(hook), { y: 50, autoAlpha: 0, filter: 'blur(10px)', duration: 1.3, ease: 'power3.out', stagger: 0.12, delay: 0.25 });
  gsap.from($('.sh-rig', sec), { scale: 1.12, autoAlpha: 0, duration: 1.8, ease: 'expo.out', transformOrigin: '50% 30%' });

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  const show = (p: Element, at: number) => tl.set(p, { autoAlpha: 1 }, at).to(parts(p), { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.5, stagger: 0.08, ease: 'power3.out' }, at);
  const hide = (p: Element, at: number) => tl.to(parts(p), { y: -30, autoAlpha: 0, filter: 'blur(6px)', duration: 0.35, stagger: 0.04, ease: 'power2.in' }, at).set(p, { autoAlpha: 0 }, at + 0.5);

  // 0 → 1  zoomed face → full figure on the LEFT, content right
  tl.fromTo(fig, { scale: 2.55, y: () => innerHeight * 0.2, x: 0, rotateY: 0 }, { scale: 1, y: 0, x: () => -innerWidth * side() / 100, duration: 1 }, 0)
    .fromTo(circle, { scale: 1.9, x: 0 }, { scale: 1, x: () => -innerWidth * side() / 100, duration: 1 }, 0)
    .fromTo(rings, { scale: 1.6, x: 0 }, { scale: 1, x: () => -innerWidth * side() / 100, duration: 1 }, 0)
    .fromTo(floor, { x: 0, autoAlpha: 0 }, { x: () => -innerWidth * side() / 100, autoAlpha: 1, duration: 1 }, 0)
    .to(outline, { xPercent: -18, duration: 4.6, ease: 'none' }, 0);
  hide(hook, 0.05);
  show(panels[1], 0.75);

  // 1.4 → 2.4  he turns around (3D card) and walks to the RIGHT, content left
  hide(panels[1], 1.35);
  tl.to(fig, { rotateY: 180, x: () => innerWidth * side() / 100, duration: 1 }, 1.4)
    .to([circle, rings, floor], { x: () => innerWidth * side() / 100, duration: 1 }, 1.4);
  show(panels[2], 2.15);

  // 2.8 → 3.8  zoom out to the centre, facing front again
  hide(panels[2], 2.75);
  tl.to(fig, { rotateY: 360, x: 0, scale: () => (mobile() ? 0.66 : 0.56), y: () => innerHeight * (mobile() ? 0.17 : 0.24), duration: 1 }, 2.8)
    .to([circle, rings], { x: 0, scale: 0.72, y: () => innerHeight * (mobile() ? 0.1 : 0.15), duration: 1 }, 2.8)
    .to(floor, { x: 0, scale: 0.8, duration: 1 }, 2.8);
  show(panels[3], 3.5);

  // 4.2 → 5.2  the team steps out from behind him
  hide(panels[3], 4.15);
  const spread = mobile() ? [-30, -15, 15, 30] : [-30, -16, 16, 30];
  members.forEach((m, i) => {
    tl.to(m, { x: () => innerWidth * spread[i] / 100, autoAlpha: 1, scale: i === 0 || i === 3 ? 0.84 : 0.92, duration: 1, ease: 'power3.out' }, 4.25 + Math.abs(1.5 - i) * 0.12);
  });
  show(panels[4], 4.7);
  tl.to({}, { duration: 0.6 });

  const st = ScrollTrigger.create({
    trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 1, animation: tl, invalidateOnRefresh: true,
    onUpdate: (self) => {
      const t = self.progress * tl.duration();
      const i = t < 0.6 ? 0 : t < 1.6 ? 1 : t < 2.9 ? 2 : t < 4.2 ? 3 : 4;
      steps.forEach((s, j) => s.classList.toggle('on', j === i));
      energy.v = 1 + Math.min(1.5, Math.abs(self.getVelocity()) / 2500);
      glow.style.opacity = String(0.75 + 0.25 * Math.sin(self.progress * Math.PI));
    },
  });
  steps[0]?.classList.add('on');
  cleanups.push(() => st.kill(), () => tl.kill());
  return () => cleanups.forEach((f) => f());
}
