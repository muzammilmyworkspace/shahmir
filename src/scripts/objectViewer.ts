import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import W from '../data/wordmark-letters.json';

/** Rotating glossy-glass "w" monogram (the West Side mark), lit like the reference object viewer:
    ambient + six point lights, camera at elevation 1.57 / azimuth 0, distance = size x 2.2.
    Returns a cleanup function. */
export function initObject(el: HTMLElement, { rotationSpeed = 0.015, color = '#f43c00' } = {}) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, el.clientWidth / el.clientHeight, 0.01, 1e4);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    [[5, 10, 5, 30], [-5, -5, -5, 32], [-5, 10, 5, 30], [0, 0, 10, 30], [10, 0, 0, 30], [0, -10, 0, 32]].forEach(([x, y, z, i]) => {
      const l = new THREE.PointLight(0xffffff, i, 0, 1.2); l.position.set(x, y, z); scene.add(l);
    });

    // build the "w" from the wordmark outlines
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${W.letters[0].d}"/></svg>`;
    const shapes = new SVGLoader().parse(svg).paths.flatMap((p) => SVGLoader.createShapes(p));
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 260, bevelEnabled: true, bevelThickness: 40, bevelSize: 26, bevelSegments: 8, curveSegments: 24 });
    geo.center();
    const mat = new THREE.MeshPhysicalMaterial({
      color, roughness: 0.14, metalness: 0, transmission: 0.18, thickness: 220, ior: 1.45, emissive: new THREE.Color('#5a0e00'), emissiveIntensity: 0.35,
      clearcoat: 1, clearcoatRoughness: 0.08, attenuationColor: new THREE.Color('#a01e00'), attenuationDistance: 500, envMapIntensity: 1.2,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const outer = new THREE.Group(), inner = new THREE.Group();
    outer.add(inner); inner.add(mesh); scene.add(outer);
    outer.rotation.x = -0.12;

    const box = new THREE.Box3().setFromObject(mesh), size = box.getSize(new THREE.Vector3());
    const D = Math.max(size.x, size.y, size.z) * 2.2;
    camera.near = D * 0.001; camera.far = D * 100;
    const elev = 1.57, az = 0;
    camera.position.set(D * Math.sin(elev) * Math.sin(az), D * Math.cos(elev), D * Math.sin(elev) * Math.cos(az));
    camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();

    let raf = 0, last = performance.now(), t = 0, visible = true;
    const tick = (now: number) => {
      if (!visible) return;
      raf = requestAnimationFrame(tick);
      t += (now - last) * 0.001; last = now;
      inner.rotation.y = t * rotationSpeed * 60;
      renderer.render(scene, camera);
    };
    const io = new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) { last = performance.now(); raf = requestAnimationFrame(tick); } });
    io.observe(el);
    raf = requestAnimationFrame(tick);
    const ro = new ResizeObserver(() => { camera.aspect = el.clientWidth / el.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(el.clientWidth, el.clientHeight); });
    ro.observe(el);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); renderer.dispose(); geo.dispose(); mat.dispose(); el.contains(renderer.domElement) && el.removeChild(renderer.domElement); };
}
