import * as THREE from 'three';

/* "3D photo" of the founder: the cut-out is displaced by its depth map into a real relief mesh,
   so turning it moves nose, shoulders and arms in true perspective. A red rim light picks out
   the edges as he turns. Not a full 3D model — a lit, depth-displaced photograph. */

const VERT = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uDepthAmt, uMirror, uAspect;
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  float dep(vec2 p) { return texture2D(uDepth, p).r; }
  void main() {
    vec2 uvm = vec2(mix(uv.x, 1.0 - uv.x, uMirror), uv.y);
    float d = dep(uvm);
    vec3 pos = position; pos.z += d * uDepthAmt;
    float e = 1.5 / 512.0;
    float dx = dep(uvm + vec2(e, 0.0)) - dep(uvm - vec2(e, 0.0));
    float dy = dep(uvm + vec2(0.0, e)) - dep(uvm - vec2(0.0, e));
    vec3 n = normalize(vec3(-dx * uDepthAmt / (2.0 * e * uAspect), -dy * uDepthAmt / (2.0 * e), 1.0));
    n.x *= mix(1.0, -1.0, uMirror);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vN = normalize(normalMatrix * n); vV = -mv.xyz; vUv = uvm;
    gl_Position = projectionMatrix * mv;
  }`;
const FRAG = /* glsl */ `
  uniform sampler2D uColor;
  uniform float uAlpha, uRimSide;
  uniform vec3 uRim;
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main() {
    vec4 c = texture2D(uColor, vUv);
    if (c.a < 0.06) discard;
    vec3 N = normalize(vN), V = normalize(vV);
    float key = max(dot(N, normalize(vec3(-0.45, 0.35, 0.82))), 0.0);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);
    float side = smoothstep(-0.15, 0.9, N.x * uRimSide);
    vec3 col = c.rgb * (0.9 + 0.22 * key) + uRim * fres * side * 0.7 + uRim * 0.04 * side;
    gl_FragColor = vec4(col, c.a * uAlpha);
  }`;

export type Figure3D = {
  /** a: 0 → 1 front → left pose, 1 → 2 spin into the mirrored right pose, 2 → 3 back to front */
  setPose(a: number): void;
  ready: Promise<void>;
  destroy(): void;
};

export function initFigure3D(host: HTMLElement, { color, depth, aspect }: { color: string; depth: string; aspect: number }): Figure3D {
  const canvas = document.createElement('canvas');
  canvas.className = 'sh-figure-gl';
  host.appendChild(canvas);
  const small = innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: false });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const FOV = 16, WIDEN = 1.7;                         // canvas is wider than the figure so the turn never clips
  const camera = new THREE.PerspectiveCamera(FOV, aspect * WIDEN, 0.1, 50);
  camera.position.set(0, 0, 0.5 / Math.tan((FOV / 2) * Math.PI / 180) * 1.02);

  const loader = new THREE.TextureLoader();
  const tex = (u: string, srgb: boolean) => new Promise<THREE.Texture>((res) => loader.load(u, (t) => {
    void srgb; // raw texel values: the ShaderMaterial writes them straight to the sRGB canvas
    t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 4; res(t);
  }));
  const uniforms = {
    uColor: { value: null as THREE.Texture | null }, uDepth: { value: null as THREE.Texture | null },
    uDepthAmt: { value: aspect * 0.62 }, uMirror: { value: 0 }, uAspect: { value: aspect },
    uAlpha: { value: 1 }, uRim: { value: new THREE.Vector3(1.0, 0.23, 0.18) }, uRimSide: { value: 1 },
  };
  const geo = new THREE.PlaneGeometry(aspect, 1, small ? 80 : 150, small ? 290 : 540);
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.z = -aspect * 0.3;                    // turn around the middle of the body, not its front
  const pivot = new THREE.Group(); pivot.add(mesh); scene.add(pivot);

  const size = () => {
    const w = host.clientWidth, h = host.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, small ? 1.5 : 2);
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(size); ro.observe(host); size();

  // pointer + idle breathing
  const ptr = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => { ptr.x = e.clientX / innerWidth - 0.5; ptr.y = e.clientY / innerHeight - 0.5; };
  addEventListener('pointermove', onMove, { passive: true });

  let a = 0, raf = 0, alive = true, visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && alive) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); } });
  io.observe(host);
  const DEG = Math.PI / 180, POSE = 26, EDGE = 84;
  const ease = (t: number) => t * t * (3 - 2 * t);
  function loop(now: number) {
    if (!alive || !visible) return;
    cur.x += (ptr.x - cur.x) * 0.05; cur.y += (ptr.y - cur.y) * 0.05;
    let ry = 0, mirror = 0, alpha = 1;
    if (a <= 1) ry = POSE * ease(a);
    else if (a <= 2) {
      const t = a - 1;
      if (t < 0.5) { const k = t / 0.5; ry = POSE + (EDGE - POSE) * k * k; alpha = 1 - Math.pow(k, 3); }
      else { const k = (t - 0.5) / 0.5; mirror = 1; ry = -EDGE + (EDGE - POSE) * (1 - (1 - k) * (1 - k)); alpha = 1 - Math.pow(1 - k, 3); }
    } else { mirror = 1; ry = -POSE * (1 - ease(Math.min(1, a - 2))); }
    const t = now / 1000;
    pivot.rotation.y = (ry + cur.x * 10 + Math.sin(t * 0.6) * 1.6) * DEG;
    pivot.rotation.x = (cur.y * 4 + Math.sin(t * 0.45) * 0.6) * DEG;
    uniforms.uMirror.value = mirror; uniforms.uAlpha.value = alpha;
    uniforms.uRimSide.value = ry >= 0 ? 1 : -1;     // rim light on the side facing the glowing disc
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  const ready = Promise.all([tex(color, true), tex(depth, false)]).then(([c, d]) => {
    uniforms.uColor.value = c; uniforms.uDepth.value = d;
    host.classList.add('gl-ready');
    raf = requestAnimationFrame(loop);
  });
  return {
    setPose(v) { a = v; },
    ready,
    destroy() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); removeEventListener('pointermove', onMove); renderer.dispose(); geo.dispose(); mat.dispose(); canvas.remove(); },
  };
}
