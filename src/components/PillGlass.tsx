import { useEffect, useRef, useState } from 'react';
import { LiquidGlass } from 'liquid-glass-web-react';

/** Liquid-glass refraction layer behind the header pill, visible once the page has scrolled. */
export default function PillGlass({ threshold = 80 }: { threshold?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const f = () => setOn(window.scrollY > threshold);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, [threshold]);

  return (
    <div ref={ref} aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', overflow: 'hidden', pointerEvents: 'none', opacity: on ? 1 : 0, transition: 'opacity 0.3s ease', zIndex: 0 }}>
      {size && (
        <LiquidGlass width={size.w} height={size.h} radius={8} strength={0.1} depth={10} curvature={0.4} chromaticAberration={0.2}
          splay={1} specular={1} specularAngle={45} blur={0} glow={0.1} edgeHighlight={0.59} shadow={false} quality={512}
          style={{ position: 'absolute', inset: 0 }}>
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%)' }} />
        </LiquidGlass>
      )}
    </div>
  );
}
