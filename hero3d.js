// studiolume — WebGL cosmic hero
// Ported & adapted from the "Horizon Hero Section" Three.js scene
// (starfield shader · nebula · layered mountains · atmosphere · UnrealBloom)
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const canvas = document.getElementById("heroCanvas");
const hero = document.querySelector(".hero");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const refs = {
  scene: null, camera: null, renderer: null, composer: null,
  stars: [], nebula: null, mountains: [], locations: [],
  animationId: null, target: { x: 0, y: 30, z: 300 },
};
const smooth = { x: 0, y: 30, z: 300 };

function sizeOf() {
  return { w: window.innerWidth, h: window.innerHeight };
}

function createStarField() {
  const starCount = 4000;
  for (let i = 0; i < 3; i++) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    for (let j = 0; j < starCount; j++) {
      const radius = 200 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[j * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[j * 3 + 2] = radius * Math.cos(phi);
      const color = new THREE.Color();
      const c = Math.random();
      if (c < 0.7) color.setHSL(0, 0, 0.8 + Math.random() * 0.2);
      else if (c < 0.9) color.setHSL(0.08, 0.5, 0.8);
      else color.setHSL(0.6, 0.5, 0.8);
      colors[j * 3] = color.r; colors[j * 3 + 1] = color.g; colors[j * 3 + 2] = color.b;
      sizes[j] = Math.random() * 2 + 0.5;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    const material = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, depth: { value: i } },
      vertexShader: `
        attribute float size; attribute vec3 color; varying vec3 vColor;
        uniform float time; uniform float depth;
        void main() {
          vColor = color; vec3 pos = position;
          float angle = time * 0.05 * (1.0 - depth * 0.3);
          mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
          pos.xy = rot * pos.xy;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }`,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float opacity = 1.0 - smoothstep(0.0, 0.5, dist);
          gl_FragColor = vec4(vColor, opacity);
        }`,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const stars = new THREE.Points(geometry, material);
    refs.scene.add(stars);
    refs.stars.push(stars);
  }
}

function createNebula() {
  const geometry = new THREE.PlaneGeometry(8000, 4000, 100, 100);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color(0x0033ff) },
      color2: { value: new THREE.Color(0xff0066) },
      opacity: { value: 0.3 },
    },
    vertexShader: `
      varying vec2 vUv; varying float vElevation; uniform float time;
      void main() {
        vUv = uv; vec3 pos = position;
        float elevation = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
        pos.z += elevation; vElevation = elevation;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 color1; uniform vec3 color2; uniform float opacity; uniform float time;
      varying vec2 vUv; varying float vElevation;
      void main() {
        float mixFactor = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
        vec3 color = mix(color1, color2, mixFactor * 0.5 + 0.5);
        float alpha = opacity * (1.0 - length(vUv - 0.5) * 2.0);
        alpha *= 1.0 + vElevation * 0.01;
        gl_FragColor = vec4(color, alpha);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
  });
  const nebula = new THREE.Mesh(geometry, material);
  nebula.position.z = -1050;
  refs.scene.add(nebula);
  refs.nebula = nebula;
}

function createMountains() {
  const layers = [
    { distance: -50, height: 60, color: 0x1a1a2e, opacity: 1 },
    { distance: -100, height: 80, color: 0x16213e, opacity: 0.8 },
    { distance: -150, height: 100, color: 0x0f3460, opacity: 0.6 },
    { distance: -200, height: 120, color: 0x0a4668, opacity: 0.4 },
  ];
  layers.forEach((layer, index) => {
    const points = [];
    const segments = 50;
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments - 0.5) * 1000;
      const y = Math.sin(i * 0.1) * layer.height +
        Math.sin(i * 0.05) * layer.height * 0.5 +
        Math.random() * layer.height * 0.2 - 100;
      points.push(new THREE.Vector2(x, y));
    }
    points.push(new THREE.Vector2(5000, -300));
    points.push(new THREE.Vector2(-5000, -300));
    const shape = new THREE.Shape(points);
    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
      color: layer.color, transparent: true, opacity: layer.opacity, side: THREE.DoubleSide,
    });
    const mountain = new THREE.Mesh(geometry, material);
    mountain.position.z = layer.distance;
    mountain.position.y = layer.distance;
    mountain.userData = { baseZ: layer.distance, index };
    refs.scene.add(mountain);
    refs.mountains.push(mountain);
    refs.locations[index] = layer.distance;
  });
}

function createAtmosphere() {
  const geometry = new THREE.SphereGeometry(600, 32, 32);
  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec3 vNormal; uniform float time;
      void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        vec3 atmosphere = vec3(0.3, 0.6, 1.0) * intensity;
        float pulse = sin(time * 2.0) * 0.1 + 0.9;
        atmosphere *= pulse;
        gl_FragColor = vec4(atmosphere, intensity * 0.25);
      }`,
    side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true,
  });
  refs.scene.add(new THREE.Mesh(geometry, material));
}

function animate() {
  refs.animationId = requestAnimationFrame(animate);
  const time = Date.now() * 0.001;
  const calm = document.body.classList.contains("calm");
  const still = reduced; // freeze autonomous motion for reduced-motion users
  const tScale = still ? 0 : (calm ? 0.25 : 1);

  refs.stars.forEach((s) => { if (s.material.uniforms) s.material.uniforms.time.value = time * tScale; });
  if (refs.nebula && refs.nebula.material.uniforms) refs.nebula.material.uniforms.time.value = time * 0.5 * tScale;

  // smooth camera toward target + subtle float
  const k = 0.06;
  smooth.x += (refs.target.x - smooth.x) * k;
  smooth.y += (refs.target.y - smooth.y) * k;
  smooth.z += (refs.target.z - smooth.z) * k;
  const floatX = (still || calm) ? 0 : Math.sin(time * 0.1) * 2;
  const floatY = (still || calm) ? 0 : Math.cos(time * 0.15) * 1;
  refs.camera.position.set(smooth.x + floatX, smooth.y + floatY, smooth.z);
  refs.camera.lookAt(0, 10, -600);

  refs.mountains.forEach((m, i) => {
    const p = 1 + i * 0.5;
    m.position.x = (still || calm) ? 0 : Math.sin(time * 0.1) * 2 * p;
    m.position.y = 50 + ((still || calm) ? 0 : Math.cos(time * 0.15) * 1 * p);
  });

  refs.composer.render();
}

function init() {
  const { w, h } = sizeOf();
  refs.scene = new THREE.Scene();
  refs.scene.fog = new THREE.FogExp2(0x000000, 0.00025);

  refs.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 2000);
  refs.camera.position.set(0, 20, 100);

  refs.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  refs.renderer.setSize(w, h);
  refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  refs.renderer.toneMappingExposure = 0.5;

  refs.composer = new EffectComposer(refs.renderer);
  refs.composer.addPass(new RenderPass(refs.scene, refs.camera));
  refs.composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.62, 0.4, 0.85));

  createStarField();
  createNebula();
  createMountains();
  createAtmosphere();

  refs.camera.position.set(0, 30, 300);
  refs.camera.lookAt(0, 10, -600);
  animate(); // rAF always runs; scroll drives the camera, autonomous motion is frozen under reduced-motion

  window.addEventListener("resize", onResize);
  setupScroll();
  revealTitle();
}

function onResize() {
  const { w, h } = sizeOf();
  refs.camera.aspect = w / h;
  refs.camera.updateProjectionMatrix();
  refs.renderer.setSize(w, h);
  refs.composer.setSize(w, h);
}

// camera flies through the scene across the pinned scroll track
const CAM = [
  { x: 0, y: 30, z: 300 },
  { x: 0, y: 40, z: -60 },
  { x: 0, y: 56, z: -680 },
];
function setupScroll() {
  const fill = document.getElementById("progFill");
  const counter = document.getElementById("secCount");
  const phaseA = document.getElementById("phaseA");
  const phaseB = document.getElementById("phaseB");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let ticking = false;
  const apply = () => {
    const vh = window.innerHeight;
    const track = Math.max(hero.offsetHeight - vh, 1);
    const p = clamp(window.scrollY / track, 0, 1);
    // interpolate camera across the 3 waypoints (scroll-driven, runs for everyone)
    {
      const seg = p * 2;
      const idx = Math.min(Math.floor(seg), 1);
      const f = seg - idx;
      const a = CAM[idx], b = CAM[idx + 1];
      refs.target.x = a.x + (b.x - a.x) * f;
      refs.target.y = a.y + (b.y - a.y) * f;
      refs.target.z = a.z + (b.z - a.z) * f;
      // keep the nebula ahead of the camera so it stays in frame
      if (refs.nebula) refs.nebula.position.z = refs.target.z - 350;
      // phase text cross-fade
      if (phaseA) {
        phaseA.style.opacity = String(clamp(1 - p / 0.3, 0, 1));
        phaseA.style.transform = `translateY(${-p * 70}px)`;
      }
      if (phaseB) {
        const fin = clamp((p - 0.42) / 0.16, 0, 1);
        const fout = clamp((0.985 - p) / 0.07, 0, 1);
        phaseB.style.opacity = String(fin * fout);
        phaseB.style.transform = `translateY(${(0.55 - p) * 50}px)`;
      }
    }
    if (fill) fill.style.width = (p * 100).toFixed(1) + "%";
    if (counter) counter.textContent = String(Math.min(Math.floor(p * 3) + 1, 3)).padStart(2, "0") + " / 03";
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(apply); }
  }, { passive: true });
  window.addEventListener("resize", apply);
  apply();
}

function revealTitle() {
  const title = document.getElementById("heroTitle");
  if (!title) return;
  const text = title.textContent.trim();
  title.textContent = "";
  const chars = [];
  for (const ch of text) {
    const span = document.createElement("span");
    span.className = "title-char";
    span.textContent = ch;
    title.appendChild(span);
    chars.push(span);
  }
  if (reduced || !window.gsap) return;
  window.gsap.from(chars, {
    yPercent: 120, opacity: 0, duration: 1.3, stagger: 0.05, ease: "power4.out", delay: 0.15,
  });
}

if (canvas && hero) {
  try {
    init();
  } catch (e) {
    console.warn("[hero3d] WebGL unavailable, using gradient fallback.", e);
    canvas.style.display = "none";
    revealTitle();
  }
}
