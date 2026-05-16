"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
gsap.registerPlugin(ScrollTrigger);

// Same path as KleeHeroAnimation.js — used for both 3D mesh and DOM SVG
const PETAL_PATH =
  "M 0 0 l -2.9 -2.64 C -13.2 -11.98 -20 -18.14 -20 -25.7 C -20 -31.86 -15.16 -36.7 -9 -36.7 C -5.52 -36.7 -2.18 -35.08 0 -32.52 C 2.18 -35.08 5.52 -36.7 9 -36.7 C 15.16 -36.7 20 -31.86 20 -25.7 C 20 -18.14 13.2 -11.98 2.9 -2.64 L 0 0 z";

// Build petal geometry directly from PETAL_PATH coordinates (no SVGLoader)
function buildPetalGeo() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(-2.9, -2.64);
  s.bezierCurveTo(-13.2, -11.98, -20, -18.14, -20, -25.7);
  s.bezierCurveTo(-20, -31.86, -15.16, -36.7, -9, -36.7);
  s.bezierCurveTo(-5.52, -36.7, -2.18, -35.08, 0, -32.52);
  s.bezierCurveTo(2.18, -35.08, 5.52, -36.7, 9, -36.7);
  s.bezierCurveTo(15.16, -36.7, 20, -31.86, 20, -25.7);
  s.bezierCurveTo(20, -18.14, 13.2, -11.98, 2.9, -2.64);
  s.lineTo(0, 0);
  return new THREE.ShapeGeometry(s);
}

const PLANET_Z = -2000;

const PETAL_COLORS  = ['#D14C18', '#F4D68C', '#7C9DD2', '#B2AB2B'];
const PETAL_ANGLES  = [-Math.PI / 4, Math.PI / 4, -3 * Math.PI / 4, 3 * Math.PI / 4];

function clamp01(v) { return Math.max(0, Math.min(1, v)); }
function linearMap(v, a, b) { return clamp01((v - a) / (b - a)); }

export default function HorizonHeroSection() {
  const containerRef      = useRef(null);
  const canvasRef         = useRef(null);
  const titleRef          = useRef(null);
  const subtitleRef       = useRef(null);
  const scrollProgressRef = useRef(null);
  const menuRef           = useRef(null);

  const smoothCameraPos   = useRef({ x: 0, y: 30, z: 300 });
  // DOM clover sync refs
  const finalCloverRef    = useRef(null);
  const domSpinRef        = useRef(null);   // RAF handle
  const domAngleRef       = useRef(0);      // current DOM rotation in degrees
  const domSpinStarted    = useRef(false);

  const [scrollProgress,    setScrollProgress]    = useState(0);
  const [currentSection,    setCurrentSection]    = useState(0);
  const [isReady,           setIsReady]           = useState(false);
  const [whiteOpacity,      setWhiteOpacity]      = useState(0);
  const [finalCloverOpacity,setFinalCloverOpacity]= useState(0);

  // totalSections=3 → 400vh page, 300vh scroll space → 6 distinct phases
  const totalSections = 3;

  const threeRefs = useRef({
    scene: null, camera: null, renderer: null, composer: null,
    stars: [], nebula: null, mountains: [], locations: [],
    planet: null, halo: null, clover: null, animationId: null,
    // camera targets
    targetCameraX: 0, targetCameraY: 30, targetCameraZ: 300,
    // clover: fixed world-space scale, only opacity is driven by scroll
    cloverOpacityFactor: 0, // 0 = hidden, 1 = fully visible
    // halo targets
    targetHaloScale: 1, currentHaloScale: 1,
    targetHaloIntensity: 1, currentHaloIntensity: 1,
  });

  /* ─── Three.js init ──────────────────────────────────────── */
  useEffect(() => {
    const initThree = () => {
      const { current: refs } = threeRefs;

      refs.scene = new THREE.Scene();

      refs.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3500);
      refs.camera.position.set(0, 30, 300);

      refs.renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
      refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      refs.renderer.toneMappingExposure = 0.6;

      refs.composer = new EffectComposer(refs.renderer);
      refs.composer.addPass(new RenderPass(refs.scene, refs.camera));
      refs.composer.addPass(new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.35, // strength — subtle enough not to blow out petal colours
        0.5,  // radius
        0.78  // threshold — only very bright pixels glow; Klee colours (lum 0.43-0.84) stay intact
      ));

      refs.scene.add(new THREE.AmbientLight(0x222244, 0.6));
      const dir = new THREE.DirectionalLight(0x5577cc, 1.0);
      dir.position.set(600, 400, 300);
      refs.scene.add(dir);

      createStarField();
      createNebula();
      createMountains();
      createPlanet();
      createClover();
      getLocation();
      animate();

      setIsReady(true);
    };

    /* ── Stars ────────────────────────────────────────────── */
    const createStarField = () => {
      const { current: refs } = threeRefs;
      const starCount = 5000;
      for (let i = 0; i < 3; i++) {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(starCount * 3);
        const col = new Float32Array(starCount * 3);
        const siz = new Float32Array(starCount);
        for (let j = 0; j < starCount; j++) {
          const r = 300 + Math.random() * 900;
          const t = Math.random() * Math.PI * 2;
          const p = Math.acos(Math.random() * 2 - 1);
          pos[j*3]   = r * Math.sin(p) * Math.cos(t);
          pos[j*3+1] = r * Math.sin(p) * Math.sin(t);
          pos[j*3+2] = r * Math.cos(p);
          const c = new THREE.Color();
          const v = Math.random();
          if (v < 0.7)      c.setHSL(0, 0, 0.8 + Math.random() * 0.2);
          else if (v < 0.9) c.setHSL(0.08, 0.5, 0.8);
          else              c.setHSL(0.6, 0.5, 0.8);
          col[j*3] = c.r; col[j*3+1] = c.g; col[j*3+2] = c.b;
          siz[j] = Math.random() * 2 + 0.5;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
        geo.setAttribute('size',     new THREE.BufferAttribute(siz, 1));
        const mat = new THREE.ShaderMaterial({
          uniforms: { time: { value: 0 }, depth: { value: i } },
          vertexShader: `
            attribute float size; attribute vec3 color; varying vec3 vColor;
            uniform float time; uniform float depth;
            void main() {
              vColor = color; vec3 pos = position;
              float a = time * 0.05 * (1.0 - depth * 0.3);
              mat2 rot = mat2(cos(a),-sin(a),sin(a),cos(a));
              pos.xy = rot * pos.xy;
              vec4 mv = modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = size * (300.0 / -mv.z);
              gl_Position = projectionMatrix * mv;
            }`,
          fragmentShader: `
            varying vec3 vColor;
            void main() {
              float d = length(gl_PointCoord - vec2(0.5));
              if (d > 0.5) discard;
              gl_FragColor = vec4(vColor, 1.0 - smoothstep(0.0,0.5,d));
            }`,
          transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        });
        const stars = new THREE.Points(geo, mat);
        refs.scene.add(stars);
        refs.stars.push(stars);
      }
    };

    /* ── Nebula (static, behind planet) ──────────────────── */
    const createNebula = () => {
      const { current: refs } = threeRefs;
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(0x0033ff) },
          color2: { value: new THREE.Color(0xff0066) },
          opacity: { value: 0.2 },
        },
        vertexShader: `
          varying vec2 vUv; varying float vE; uniform float time;
          void main() {
            vUv = uv; vec3 p = position;
            vE = sin(p.x*0.01+time)*cos(p.y*0.01+time)*20.0;
            p.z += vE;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }`,
        fragmentShader: `
          uniform vec3 color1,color2; uniform float opacity,time;
          varying vec2 vUv; varying float vE;
          void main() {
            float m = sin(vUv.x*10.0+time)*cos(vUv.y*10.0+time);
            vec3 col = mix(color1,color2,m*0.5+0.5);
            float a = opacity*(1.0-length(vUv-0.5)*2.0);
            gl_FragColor = vec4(col, a*(1.0+vE*0.01));
          }`,
        transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
      });
      const nebula = new THREE.Mesh(new THREE.PlaneGeometry(8000, 4000, 80, 80), mat);
      nebula.position.z = -2500;
      refs.scene.add(nebula);
      refs.nebula = nebula;
    };

    /* ── Mountains ───────────────────────────────────────── */
    const createMountains = () => {
      const { current: refs } = threeRefs;
      const layers = [
        { distance: -50,  height: 60,  color: 0x1a1a2e, opacity: 1   },
        { distance: -100, height: 80,  color: 0x16213e, opacity: 0.85 },
        { distance: -150, height: 100, color: 0x0f3460, opacity: 0.7  },
        { distance: -200, height: 120, color: 0x0a4668, opacity: 0.5  },
      ];
      layers.forEach(layer => {
        const pts = [];
        for (let i = 0; i <= 50; i++) {
          const x = (i / 50 - 0.5) * 1000;
          const y = Math.sin(i * 0.1) * layer.height + Math.sin(i * 0.05) * layer.height * 0.5
                  + Math.random() * layer.height * 0.2 - 100;
          pts.push(new THREE.Vector2(x, y));
        }
        pts.push(new THREE.Vector2(5000, -300));
        pts.push(new THREE.Vector2(-5000, -300));
        const m = new THREE.Mesh(
          new THREE.ShapeGeometry(new THREE.Shape(pts)),
          new THREE.MeshBasicMaterial({ color: layer.color, transparent: true, opacity: layer.opacity, side: THREE.DoubleSide })
        );
        m.position.z = layer.distance;
        m.position.y = layer.distance;
        m.userData.baseZ = layer.distance;
        refs.scene.add(m);
        refs.mountains.push(m);
      });
    };

    /* ── Planet — dim solid sphere + dynamic halo ────────── */
    const createPlanet = () => {
      const { current: refs } = threeRefs;
      const group = new THREE.Group();
      group.position.set(0, 10, PLANET_Z);

      // Solid sphere — dark, minimal emissive (planet is background presence)
      const solidMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x0d1520),
        roughness: 0.95, metalness: 0.0,
        emissive: new THREE.Color(0x050a10),
        emissiveIntensity: 0.4,
      });
      group.add(new THREE.Mesh(new THREE.SphereGeometry(180, 48, 48), solidMat));

      // Halo — intensity uniform controls brightness AND color warmth (blue→white)
      const haloMat = new THREE.ShaderMaterial({
        uniforms: {
          time:      { value: 0 },
          intensity: { value: 1.0 }, // 1→2.5 as scroll progresses
        },
        vertexShader: `
          varying vec3 vN;
          void main() {
            vN = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          varying vec3 vN;
          uniform float time;
          uniform float intensity;
          void main() {
            float fresnel = pow(0.65 - dot(vN, vec3(0.0, 0.0, 1.0)), 2.0);
            // colour shifts from blue-steel → near-white as intensity rises
            vec3 coldCol = vec3(0.3, 0.5, 0.85);
            vec3 warmCol = vec3(0.92, 0.96, 1.0);
            float t = clamp((intensity - 1.0) / 1.5, 0.0, 1.0);
            vec3 col = mix(coldCol, warmCol, t) * fresnel * (sin(time * 1.2) * 0.06 + 0.94);
            float alpha = fresnel * 0.14 * intensity;
            gl_FragColor = vec4(col, alpha);
          }`,
        side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true,
      });
      const haloMesh = new THREE.Mesh(new THREE.SphereGeometry(215, 28, 28), haloMat);
      group.add(haloMesh);

      refs.scene.add(group);
      refs.planet = group;
      refs.halo   = haloMesh; // direct ref for scale + uniform updates
    };

    /* ── Clover — grounded 3D flower on planet top ──────── */
    const createClover = () => {
      const { current: refs } = threeRefs;

      const group = new THREE.Group();
      // Top of planet sphere: planet center y=10, radius=180 → top y=190
      group.position.set(0, 10 + 180, PLANET_Z);
      // Scale 1.5: calibrated so 3D size ≈ DOM clover size at transition camera (~93% scroll)
      group.scale.set(1.5, 1.5, 1.5);

      const mkMat = (hex) => new THREE.MeshBasicMaterial({
        color: new THREE.Color(hex), transparent: true, opacity: 0,
        side: THREE.DoubleSide, depthWrite: false, depthTest: false,
      });
      const rOrder = (m) => { m.renderOrder = 100; return m; };

      // ── Stem ─────────────────────────────────────────────
      const stemMat = mkMat('#2d6e35');
      group.add(rOrder(Object.assign(
        new THREE.Mesh(new THREE.CylinderGeometry(1, 1.8, 30, 8), stemMat),
        { position: new THREE.Vector3(0, -17, 0) }
      )));

      // ── Petals: lie flat in XZ plane, visible from above ─
      // buildPetalGeo() gives exact Klee shape (meeting point at local origin)
      const petalGeo = buildPetalGeo();

      const petalsGroup = new THREE.Group();
      petalsGroup.rotation.x = -Math.PI / 2; // XY-plane → XZ-plane (faces up)

      PETAL_COLORS.forEach((hex, idx) => {
        const m = rOrder(new THREE.Mesh(petalGeo.clone(), mkMat(hex)));
        m.rotation.z = PETAL_ANGLES[idx];
        petalsGroup.add(m);
      });
      group.add(petalsGroup);

      refs.cloverYSpin = 0; // accumulated Y-rotation (synced to DOM on transition)
      refs.scene.add(group);
      refs.clover = group;
      refs.cloverStemMat  = stemMat;
      refs.cloverPetalMats = petalsGroup.children.map(m => m.material);
    };

    const getLocation = () => {
      const { current: refs } = threeRefs;
      refs.locations = refs.mountains.map(m => m.position.z);
    };

    /* ── Render loop ─────────────────────────────────────── */
    const animate = () => {
      const { current: refs } = threeRefs;
      refs.animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Stars
      refs.stars.forEach(sf => { if (sf.material.uniforms) sf.material.uniforms.time.value = time; });
      // Nebula
      if (refs.nebula?.material.uniforms) refs.nebula.material.uniforms.time.value = time * 0.5;

      // Planet slow rotation + halo time
      if (refs.planet) {
        refs.planet.rotation.y += 0.0005;
        refs.planet.rotation.x += 0.0002;
      }
      if (refs.halo?.material.uniforms) {
        refs.halo.material.uniforms.time.value = time;

        // Smooth halo scale & intensity
        refs.currentHaloScale     += (refs.targetHaloScale     - refs.currentHaloScale)     * 0.055;
        refs.currentHaloIntensity += (refs.targetHaloIntensity - refs.currentHaloIntensity) * 0.055;

        refs.halo.scale.setScalar(refs.currentHaloScale);
        refs.halo.material.uniforms.intensity.value = refs.currentHaloIntensity;
      }

      // Smooth camera
      if (refs.camera) {
        const s = 0.05;
        smoothCameraPos.current.x += (refs.targetCameraX - smoothCameraPos.current.x) * s;
        smoothCameraPos.current.y += (refs.targetCameraY - smoothCameraPos.current.y) * s;
        smoothCameraPos.current.z += (refs.targetCameraZ - smoothCameraPos.current.z) * s;
        refs.camera.position.x = smoothCameraPos.current.x + Math.sin(time * 0.1) * 1.5;
        refs.camera.position.y = smoothCameraPos.current.y + Math.cos(time * 0.15) * 0.8;
        refs.camera.position.z = smoothCameraPos.current.z;
        // Always look at the clover on top of the planet
        refs.camera.lookAt(0, 10 + 180, PLANET_Z);
      }

      // Mountains gentle drift
      refs.mountains.forEach(m => {
        const p = 1 + (m.userData.index ?? 0) * 0.5;
        m.position.x = Math.sin(time * 0.1) * 2 * p;
        m.position.y = (m.userData.baseZ ?? -100) + 50 + Math.cos(time * 0.15) * p;
      });

      // Clover: gentle Y-spin tracked in refs so DOM clover can sync at transition
      if (refs.clover) {
        refs.cloverYSpin = (refs.cloverYSpin ?? 0) + 0.003;
        refs.clover.rotation.y = refs.cloverYSpin;
        const op = refs.cloverOpacityFactor;
        if (refs.cloverStemMat) refs.cloverStemMat.opacity = op;
        if (refs.cloverPetalMats) refs.cloverPetalMats.forEach(m => { m.opacity = op; });
      }

      if (refs.composer) refs.composer.render();
    };

    initThree();

    const handleResize = () => {
      const { current: refs } = threeRefs;
      if (!refs.camera || !refs.renderer || !refs.composer) return;
      refs.camera.aspect = window.innerWidth / window.innerHeight;
      refs.camera.updateProjectionMatrix();
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
      refs.composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      const { current: refs } = threeRefs;
      if (refs.animationId) cancelAnimationFrame(refs.animationId);
      window.removeEventListener('resize', handleResize);
      refs.stars.forEach(s    => { s.geometry.dispose(); s.material.dispose(); });
      refs.mountains.forEach(m => { m.geometry.dispose(); m.material.dispose(); });
      if (refs.nebula)  { refs.nebula.geometry.dispose(); refs.nebula.material.dispose(); }
      if (refs.planet)  { refs.planet.children.forEach(c => { c.geometry?.dispose(); c.material?.dispose(); }); refs.scene?.remove(refs.planet); }
      if (refs.clover)  {
        refs.clover.traverse(c => { if (c.isMesh) { c.geometry?.dispose(); c.material?.dispose(); } });
        refs.scene?.remove(refs.clover);
      }
      if (refs.renderer) refs.renderer.dispose();
    };
  }, []);

  /* ── DOM clover spin — syncs to 3D angle on first appear ── */
  useEffect(() => {
    if (finalCloverOpacity > 0 && !domSpinStarted.current) {
      domSpinStarted.current = true;
      // Inherit exact angle from 3D clover so there's no jump
      domAngleRef.current = ((threeRefs.current.cloverYSpin ?? 0) * 180) / Math.PI;

      const tick = () => {
        domAngleRef.current += 0.003 * (180 / Math.PI); // same rad/frame as 3D
        if (finalCloverRef.current) {
          finalCloverRef.current.style.transform =
            `translate(-50%, -50%) rotate(${domAngleRef.current}deg)`;
        }
        domSpinRef.current = requestAnimationFrame(tick);
      };
      domSpinRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (domSpinRef.current && finalCloverOpacity <= 0) {
        cancelAnimationFrame(domSpinRef.current);
        domSpinRef.current = null;
      }
    };
  }, [finalCloverOpacity]);

  /* ── GSAP intro ─────────────────────────────────────────── */
  useEffect(() => {
    if (!isReady) return;
    gsap.set([menuRef.current, titleRef.current, subtitleRef.current, scrollProgressRef.current], { visibility: 'visible' });
    const tl = gsap.timeline();
    if (menuRef.current) tl.from(menuRef.current, { x: -100, opacity: 0, duration: 1, ease: 'power3.out' });
    if (titleRef.current) tl.from(titleRef.current.querySelectorAll('.title-char'), { y: 200, opacity: 0, duration: 1.5, stagger: 0.05, ease: 'power4.out' }, '-=0.5');
    if (subtitleRef.current) tl.from(subtitleRef.current.querySelectorAll('.subtitle-line'), { y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out' }, '-=0.8');
    if (scrollProgressRef.current) tl.from(scrollProgressRef.current, { opacity: 0, y: 50, duration: 1, ease: 'power2.out' }, '-=0.5');
    return () => { tl.kill(); };
  }, [isReady]);

  /* ── Scroll handler ─────────────────────────────────────── */
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress  = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
      setScrollProgress(progress);

      const totalProg   = progress * totalSections;
      const newSection  = Math.min(Math.floor(totalProg), totalSections - 1);
      const sectionProg = totalProg >= totalSections ? 1 : totalProg % 1;
      setCurrentSection(newSection);

      const { current: refs } = threeRefs;

      // ── Camera path — orbital top-down approach ──
      // Camera always looks at clover (0, 190, -2000). Starts far-above-behind,
      // arcs over to directly above as progress increases.
      const cam = [
        { x: 0, y: 800,  z: 100  },  // section 0 start — far above-back, planet tiny
        { x: 0, y: 500,  z: -1400 }, // section 1 start — closer, still high
        { x: 0, y: 350,  z: -1800 }, // section 2 start — arcing overhead
        { x: 0, y: 280,  z: -1960 }, // section 2 end   — nearly directly above clover
      ];
      const cur  = cam[newSection]     ?? cam[cam.length - 1];
      const next = cam[newSection + 1] ?? cur;
      refs.targetCameraX = cur.x + (next.x - cur.x) * sectionProg;
      refs.targetCameraY = cur.y + (next.y - cur.y) * sectionProg;
      refs.targetCameraZ = cur.z + (next.z - cur.z) * sectionProg;

      // ── Mountains disappear at 45% ──
      refs.mountains.forEach(m => {
        m.position.z = progress > 0.45 ? 600000 : m.userData.baseZ;
      });

      // ── Three.js Clover: appear as HORIZON fades, hold until camera is nearly top-down ──
      refs.cloverOpacityFactor = progress < 0.15 ? 0
        : progress < 0.25 ? linearMap(progress, 0.15, 0.25)    // fade in with HORIZON
        : progress > 1.00 ? 0
        : progress > 0.93 ? linearMap(1.00 - progress, 0, 0.07) // fade out just before white
        : 1;

      // ── Halo expansion: builds up from 60%, dramatic peak at 93% ──
      // Three.js yonca is still clearly visible all the way to ~93%
      const haloT = linearMap(progress, 0.60, 0.93);
      refs.targetHaloScale     = 1 + haloT * 4.5;   // 1 → 5.5
      refs.targetHaloIntensity = 1 + haloT * 1.5;   // 1 → 2.5

      // ── DOM white overlay: only when camera is nearly directly overhead (93%→100%) ──
      setWhiteOpacity(linearMap(progress, 0.93, 1.00));

      // ── DOM Klee clover: fades in in last 5% (screen is already white) ──
      setFinalCloverOpacity(linearMap(progress, 0.96, 1.00));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalSections]);

  const splitTitle = (text) =>
    text.split('').map((char, i) => (
      <span key={i} className="cosmos-title-char title-char">{char}</span>
    ));

  // HORIZON title fades fast as scroll begins
  const titleOpacity = Math.max(0, 1 - scrollProgress * 5);
  // Scroll progress UI fades as white overlay appears
  const scrollUIOpacity = Math.max(0, 1 - linearMap(scrollProgress, 0.88, 0.95));

  return (
    <div ref={containerRef} className="cosmos-style hero-container">
      <canvas ref={canvasRef} className="cosmos-canvas" />

      {/* Side menu */}
      <div ref={menuRef} className="cosmos-side-menu" style={{ visibility: 'hidden' }}>
        <div className="cosmos-menu-icon"><span /><span /><span /></div>
        <div className="cosmos-vertical-text">SPACE</div>
      </div>

      {/* HORIZON title — fades on scroll */}
      <div className="cosmos-hero-content"
        style={{ opacity: titleOpacity, pointerEvents: titleOpacity < 0.05 ? 'none' : 'auto' }}>
        <h1 ref={titleRef} className="cosmos-hero-title" style={{ visibility: 'hidden' }}>
          {splitTitle('HORIZON')}
        </h1>
        <div ref={subtitleRef} className="cosmos-hero-subtitle" style={{ visibility: 'hidden' }}>
          <p className="subtitle-line">Where vision meets reality,</p>
          <p className="subtitle-line">we shape the future of tomorrow</p>
        </div>
      </div>

      {/* Scroll progress indicator — fades before white overlay */}
      <div ref={scrollProgressRef} className="cosmos-scroll-progress"
        style={{ visibility: 'hidden', opacity: scrollUIOpacity }}>
        <div className="cosmos-scroll-text">SCROLL</div>
        <div className="cosmos-progress-track">
          <div className="cosmos-progress-fill" style={{ width: `${scrollProgress * 100}%` }} />
        </div>
        <div className="cosmos-section-counter">
          {String(currentSection + 1).padStart(2, '0')} / {String(totalSections).padStart(2, '0')}
        </div>
      </div>

      {/* ── White overlay: fades in at ~85% scroll ── */}
      <div className="cosmos-white-overlay" style={{ opacity: whiteOpacity }} />

      {/* ── DOM Klee clover: final scene on white background ── */}
      {/* ref + initial transform: JS RAF updates rotate() to match 3D spin angle */}
      <div
        ref={finalCloverRef}
        className="cosmos-final-clover"
        style={{ opacity: finalCloverOpacity, transform: 'translate(-50%, -50%)' }}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(50, 50)">
            <g fill="var(--ketchup-red)">
              <path d={PETAL_PATH} transform="translate(-1, -1) rotate(-45)" />
            </g>
            <g fill="var(--sunshine-yellow)">
              <path d={PETAL_PATH} transform="translate(1, -1) rotate(45)" />
            </g>
            <g fill="var(--sky-blue)">
              <path d={PETAL_PATH} transform="translate(-1, 1) rotate(-135)" />
            </g>
            <g fill="var(--olive-green)">
              <path d={PETAL_PATH} transform="translate(1, 1) rotate(135)" />
            </g>
          </g>
        </svg>
      </div>

      {/* Scroll spacers — 3 sections = 400vh total page height */}
      <div className="cosmos-scroll-sections">
        <section className="cosmos-content-section" />
        <section className="cosmos-content-section" />
        <section className="cosmos-content-section" />
      </div>
    </div>
  );
}
