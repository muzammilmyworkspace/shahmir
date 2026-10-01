import { gsap } from 'gsap';

const header = document.getElementById('site-header')!;
const panel = document.getElementById('menu-panel')!;
const bg = panel.querySelector('.menu-bg')!;
const lines = Array.from(panel.querySelectorAll('.menu-line'));
const fades = Array.from(panel.querySelectorAll('.menu-fade'));
const closeBtn = document.getElementById('menu-close')!;
const toggles = [
  { btn: document.getElementById('menu-btn'), iconMenu: document.getElementById('icon-menu'), iconClose: document.getElementById('icon-close') },
  { btn: document.getElementById('menu-btn-desktop'), iconMenu: document.getElementById('icon-menu-desktop'), iconClose: document.getElementById('icon-close-desktop') },
];

requestAnimationFrame(() => setTimeout(() => header.classList.add('is-visible'), 200));

/* ---- light/dark from whatever sits under the header ---- */
const isDark = (rgb: string) => { const n = rgb.match(/\d+/g); if (!n || n.length < 3) return false; const [r, g, b] = n.map(Number); return r < 30 && g < 30 && b < 30; };
function detectTheme() {
  if (header.classList.contains('is-scrolled')) return;
  const y = header.getBoundingClientRect().bottom + 4, x = innerWidth / 2;
  for (const el of document.elementsFromPoint(x, y) as HTMLElement[]) {
    if (header.contains(el) || el === header || el === document.body || el === document.documentElement) continue;
    const t = el.dataset?.headerTheme;
    if (t) { header.setAttribute('data-theme', t); return; }
    const bgc = getComputedStyle(el).backgroundColor;
    if (bgc && bgc !== 'rgba(0, 0, 0, 0)' && bgc !== 'transparent') { header.setAttribute('data-theme', isDark(bgc) ? 'light' : 'dark'); return; }
  }
  header.setAttribute('data-theme', isDark(getComputedStyle(document.body).backgroundColor) ? 'light' : 'dark');
}
function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 80); detectTheme(); }
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
(window as any).__headerTheme = onScroll;

/* ---- menu ---- */
const EASE = 'power3.inOut';
let open = false, tl: gsap.core.Timeline | null = null;
const icons = (on: boolean) => toggles.forEach(({ iconMenu, iconClose }) => { iconMenu?.classList.toggle('hidden', on); iconClose?.classList.toggle('hidden', !on); });
function openMenu() {
  if (open) return; open = true;
  panel.classList.add('is-open'); panel.setAttribute('aria-hidden', 'false'); header.classList.add('menu-open'); icons(true);
  tl?.kill();
  tl = gsap.timeline()
    .set(panel, { autoAlpha: 1 })
    .fromTo(bg, { scale: 0 }, { scale: 1, duration: 0.5, ease: EASE }, 0)
    .fromTo(lines, { yPercent: 150 }, { yPercent: 0, duration: 0.8, stagger: 0.02, ease: EASE }, 0)
    .fromTo(fades, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: EASE }, 0.3);
}
function closeMenu() {
  if (!open) return; open = false;
  header.classList.remove('menu-open'); icons(false);
  gsap.set(panel.querySelectorAll('.menu-word'), { yPercent: 0, overwrite: true });
  tl?.kill();
  tl = gsap.timeline({ onComplete: () => { panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true'); } })
    .to(lines, { yPercent: 150, duration: 0.5, ease: 'power3.out', overwrite: true }, 0)
    .to(fades, { autoAlpha: 0, duration: 0.5, ease: 'power3.out', overwrite: true }, 0)
    .to(bg, { scale: 0, duration: 0.5, ease: EASE, overwrite: true }, 0)
    .set(panel, { autoAlpha: 0 });
}
toggles.forEach(({ btn }) => btn?.addEventListener('click', () => (open ? closeMenu() : openMenu())));
closeBtn.addEventListener('click', closeMenu);
document.addEventListener('click', (e) => { const t = e.target as Node; if (open && !panel.contains(t) && !toggles.some(({ btn }) => btn?.contains(t))) closeMenu(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
if (matchMedia('(hover: hover)').matches) {
  panel.querySelectorAll('.menu-primary-link').forEach((a) => {
    const words = a.querySelectorAll('.menu-word');
    const roll = (y: number) => gsap.to(words, { yPercent: y, duration: 0.5, ease: 'power3.out', overwrite: true });
    a.addEventListener('mouseenter', () => roll(-100));
    a.addEventListener('mouseleave', () => roll(0));
  });
}
