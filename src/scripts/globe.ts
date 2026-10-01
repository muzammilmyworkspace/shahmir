import * as THREE from 'three';
import { OFFICES } from '../data/content';

/* Scroll-linked wireframe globe with projected city cards.
   Rotation travels from the first office to the last one, which ends dead-front and centred. */
const DEG = Math.PI / 180;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ss = (e0: number, e1: number, x: number) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const BASE_Z = 5.0, REF_ASPECT = 1.5;
const camZ = (aspect: number) => BASE_Z * clamp(REF_ASPECT / aspect, 1, 2.4);
const R = 2.0, START_Y = -1.32;
const LAST = OFFICES[OFFICES.length - 1];
const END_Y = -(R * Math.sin(LAST.lat * DEG)); // the last city sits on the vertical centre once it faces front
const FRONT = -LAST.lon * DEG;
const PIN = '<svg width="25" height="25" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.7c-3.7 0-6.7 3-6.7 6.7 0 4.9 6.7 13.2 6.7 13.2s6.7-8.3 6.7-13.2c0-3.7-3-6.7-6.7-6.7z"/><circle cx="12" cy="8.4" r="2.4" fill="#f4f4f5"/></svg>';

const latLon = (lat: number, lon: number, r: number) => {
  const la = lat * DEG, lo = lon * DEG;
  return new THREE.Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo));
};

export function initGlobe(canvas: HTMLCanvasElement, cardsLayer: HTMLElement, sceneEl: HTMLElement, spins = 0) {
  const scene = new THREE.Scene();
  const w0 = canvas.clientWidth, h0 = canvas.clientHeight;
  const camera = new THREE.PerspectiveCamera(26, w0 / h0, 0.1, 100);
  camera.position.set(0, 0, camZ(w0 / h0));
  camera.lookAt(0, -0.2, 0);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(w0, h0, false);
  renderer.setClearColor(0x000000, 0);

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(0x111113) }, uFront: { value: 0.62 }, uBack: { value: 0.06 } },
    vertexShader: `varying float vFacing; void main(){ vec3 vn = normalize(normalMatrix * normalize(position)); vFacing = vn.z; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 uColor; uniform float uFront; uniform float uBack; varying float vFacing; void main(){ float t = smoothstep(-0.35, 0.7, vFacing); gl_FragColor = vec4(uColor, mix(uBack, uFront, t)); }`,
  });
  const group = new THREE.Group(); group.position.y = START_Y; scene.add(group);
  const P = 15, M = 15, SEG = 160;
  for (let lat = -80; lat <= 80; lat += P) {
    const pts = []; const rr = R * Math.cos(lat * DEG), y = R * Math.sin(lat * DEG);
    for (let i = 0; i <= SEG; i++) { const a = (i / SEG) * Math.PI * 2; pts.push(new THREE.Vector3(rr * Math.sin(a), y, rr * Math.cos(a))); }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }
  for (let lon = 0; lon < 360; lon += M) {
    const pts = [];
    for (let i = 0; i <= SEG / 2; i++) { const phi = (i / (SEG / 2)) * Math.PI; pts.push(new THREE.Vector3(R * Math.sin(phi) * Math.sin(lon * DEG), R * Math.cos(phi), R * Math.sin(phi) * Math.cos(lon * DEG))); }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }

  // cards
  cardsLayer.innerHTML = '';
  const cards = OFFICES.map((c) => {
    const el = document.createElement('div');
    el.className = 'gcard';
    el.innerHTML = `<span class="gpin">${PIN}</span><span class="gtext"><span class="gtitle">${c.city}</span><span class="gsub">${c.country.toUpperCase()} <span class="gdot">·</span> <span class="gclock">--:--</span></span></span>`;
    cardsLayer.appendChild(el);
    return { c, el, clock: el.querySelector('.gclock') as HTMLElement };
  });
  const tickClocks = () => cards.forEach(({ c, clock }) => {
    try { clock.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: c.tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()); } catch { clock.textContent = '--:--'; }
  });
  tickClocks();
  const clockTimer = setInterval(tickClocks, 10000);

  const v = new THREE.Vector3(), n = new THREE.Vector3();
  const updateCards = (w: number, h: number) => {
    group.updateMatrixWorld();
    cards.forEach(({ c, el }) => {
      const local = latLon(c.lat, c.lon, R);
      v.copy(local).applyMatrix4(group.matrixWorld);
      n.copy(local).normalize().applyQuaternion(group.quaternion);
      const facing = n.dot(camera.position.clone().sub(v).normalize());
      const p = v.clone().project(camera);
      el.style.left = `${(p.x * 0.5 + 0.5) * w + (c.dx || 0)}px`;
      el.style.top = `${(-p.y * 0.5 + 0.5) * h + (c.dy || 0)}px`;
      el.style.setProperty('--s', lerp(0.86, 1, ss(-0.1, 0.85, facing)).toFixed(3));
      const vis = ss(0.02, 0.34, facing);
      el.style.opacity = vis.toFixed(3);
      el.style.zIndex = String(1000 + Math.round(facing * 500));
      el.style.pointerEvents = vis > 0.6 ? 'auto' : 'none';
    });
  };

  const progress = () => {
    const total = sceneEl.offsetHeight - innerHeight;
    return total <= 0 ? 0 : clamp(-sceneEl.getBoundingClientRect().top / total, 0, 1);
  };
  let curRot = 0, curY = START_Y, raf = 0, alive = true;
  const frame = () => {
    if (!alive) return;
    const e = ss(0, 1, progress());
    curRot = lerp(curRot, e * (FRONT + spins * Math.PI * 2), 0.09);
    group.rotation.y = curRot;
    curY = lerp(curY, lerp(START_Y, END_Y, e), 0.09);
    group.position.y = curY;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (renderer.domElement.width !== Math.floor(w * Math.min(devicePixelRatio, 2)) || renderer.domElement.height !== Math.floor(h * Math.min(devicePixelRatio, 2))) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.position.z = camZ(w / h); camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    updateCards(w, h);
    raf = requestAnimationFrame(frame);
  };
  frame();
  return () => { alive = false; cancelAnimationFrame(raf); clearInterval(clockTimer); renderer.dispose(); mat.dispose(); };
}
