"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

gsap.registerPlugin(ScrollTrigger);

const PETAL_PATH =
  "M 0 0 l -2.9 -2.64 C -13.2 -11.98 -20 -18.14 -20 -25.7 C -20 -31.86 -15.16 -36.7 -9 -36.7 C -5.52 -36.7 -2.18 -35.08 0 -32.52 C 2.18 -35.08 5.52 -36.7 9 -36.7 C 15.16 -36.7 20 -31.86 20 -25.7 C 20 -18.14 13.2 -11.98 2.9 -2.64 L 0 0 z";

const PLANET_Z = -2000;

const PETAL_COLORS = [
  '#D14C18', // ketchup-red   / TILSIM
  '#F4D68C', // sunshine-yellow / KIVILCIM
  '#7C9DD2', // sky-blue      / TUTKU
  '#B2AB2B', // olive-green   / VIZYON
];
const PETAL_ANGLES = [
  -Math.PI / 4,
   Math.PI / 4,
  -3 * Math.PI / 4,
   3 * Math.PI / 4,
];

export default function HorizonHeroSection() {
  const containerRef    = useRef(null);
  const canvasRef       = useRef(null);
  const titleRef        = useRef(null);
  const subtitleRef     = useRef(null);
  const scrollProgressRef = useRef(null);
  const menuRef         = useRef(null);

  const smoothCameraPos = useRef({ x: 0, y: 30, z: 300 });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isReady, setIsReady]     = useState(false);
  const totalSections = 2;

  const threeRefs = useRef({
    scene: null, camera: null, renderer: null, composer: null,
    stars: [], nebula: null, mountains: [], locations: [],
    planet: null, clover: null, animationId: null,
    targetCameraX: 0, targetCameraY: 30, targetCameraZ: 300,
    targetCloverScale: 0, cloverScale: 0,
  });

  /* ── Three.js init ─────────────────────────────────────── */
  useEffect(() => {
    const initThree = () => {
      const { current: refs } = threeRefs;

      refs.scene = new THREE.Scene();
      // NO scene fog — it would completely hide the planet at 2000+ units

      refs.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3500);
      refs.camera.position.set(0, 30, 300);

      refs.renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
      refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      refs.renderer.toneMappingExposure = 0.6;

      refs.composer = new EffectComposer(refs.renderer);
      refs.composer.addPass(new RenderPass(refs.scene, refs.camera));
      // Low threshold so Klee brand colors actually bloom
      refs.composer.addPass(new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.7,   // strength
        0.6,   // radius
        0.2    // threshold — Klee colors (luminance ~0.4–0.8) will glow
      ));

      // Lighting for planet surface
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

    /* ── Stars ─────────────────────────────────────────────── */
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

    /* ── Nebula ─────────────────────────────────────────────── */
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
      nebula.position.z = -2500; // behind planet, never moves
      refs.scene.add(nebula);
      refs.nebula = nebula;
    };

    /* ── Mountains ──────────────────────────────────────────── */
    const createMountains = () => {
      const { current: refs } = threeRefs;
      const layers = [
        { distance: -50,  height: 60,  color: 0x1a1a2e, opacity: 1   },
        { distance: -100, height: 80,  color: 0x16213e, opacity: 0.85 },
        { distance: -150, height: 100, color: 0x0f3460, opacity: 0.7  },
        { distance: -200, height: 120, color: 0x0a4668, opacity: 0.5  },
      ];
      layers.forEach((layer) => {
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

    /* ── Planet — dim solid sphere + faint halo ─────────────── */
    const createPlanet = () => {
      const { current: refs } = threeRefs;
      const group = new THREE.Group();
      group.position.set(0, 10, PLANET_Z);

      // Solid sphere — subdued presence, lets clover be the star
      const solidMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x1a2540),
        roughness: 0.9, metalness: 0.0,
        emissive: new THREE.Color(0x0a1428),
        emissiveIntensity: 0.5,
      });
      group.add(new THREE.Mesh(new THREE.SphereGeometry(180, 48, 48), solidMat));

      // Dim halo rim
      const haloMat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
          varying vec3 vN;
          void main() { vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
          varying vec3 vN; uniform float time;
          void main() {
            float i = pow(0.6 - dot(vN, vec3(0,0,1)), 2.0);
            vec3 c = vec3(0.3,0.5,0.8)*i*(sin(time*1.2)*0.08+0.92);
            gl_FragColor = vec4(c, i*0.12);
          }`,
        side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true,
      });
      group.add(new THREE.Mesh(new THREE.SphereGeometry(215, 28, 28), haloMat));

      refs.scene.add(group);
      refs.planet = group;
    };

    /* ── Clover — 4 Klee-brand petals via SVGLoader ─────────── */
    const createClover = () => {
      const { current: refs } = threeRefs;
      const group = new THREE.Group();
      group.position.set(0, 10, PLANET_Z + 12); // slightly in front of planet

      let shapes = [];
      try {
        const loader  = new SVGLoader();
        const svgData = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${PETAL_PATH}"/></svg>`);
        if (svgData.paths && svgData.paths.length > 0) {
          shapes = svgData.paths[0].toShapes(true);
        }
      } catch (e) {
        console.warn('[HorizonHero] SVGLoader failed, using fallback petal');
      }

      let petalGeo;
      if (shapes.length > 0) {
        petalGeo = new THREE.ShapeGeometry(shapes);
        // Center around origin
        petalGeo.computeBoundingBox();
        const bb = petalGeo.boundingBox;
        petalGeo.translate(
          -((bb.min.x + bb.max.x) / 2),
          -((bb.min.y + bb.max.y) / 2),
          0
        );
        // Flip Y — SVG y-down vs Three.js y-up
        petalGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, -1, 1));
      } else {
        // Fallback: teardrop-style heart petal
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.bezierCurveTo(-12, -4, -20, -12, -20, -20);
        shape.bezierCurveTo(-20, -30, -10, -36, 0, -30);
        shape.bezierCurveTo(10, -36, 20, -30, 20, -20);
        shape.bezierCurveTo(20, -12, 12, -4, 0, 0);
        petalGeo = new THREE.ShapeGeometry(shape);
        petalGeo.computeBoundingBox();
        const bb = petalGeo.boundingBox;
        petalGeo.translate(-((bb.min.x+bb.max.x)/2), -((bb.min.y+bb.max.y)/2), 0);
      }

      PETAL_COLORS.forEach((hex, idx) => {
        const mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(hex),
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(petalGeo.clone(), mat);
        mesh.rotation.z = PETAL_ANGLES[idx];
        group.add(mesh);
      });

      // Start invisible
      group.scale.set(0.001, 0.001, 0.001);
      refs.scene.add(group);
      refs.clover = group;
    };

    const getLocation = () => {
      const { current: refs } = threeRefs;
      refs.locations = refs.mountains.map(m => m.position.z);
    };

    /* ── Render loop ─────────────────────────────────────────── */
    const animate = () => {
      const { current: refs } = threeRefs;
      refs.animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      refs.stars.forEach(sf => { if (sf.material.uniforms) sf.material.uniforms.time.value = time; });
      if (refs.nebula?.material.uniforms) refs.nebula.material.uniforms.time.value = time * 0.5;

      if (refs.planet) {
        refs.planet.rotation.y  += 0.0006;
        refs.planet.rotation.x  += 0.0002;
        const halo = refs.planet.children[1];
        if (halo?.material.uniforms) halo.material.uniforms.time.value = time;
      }

      // Smooth camera
      if (refs.camera) {
        const s = 0.05;
        smoothCameraPos.current.x += (refs.targetCameraX - smoothCameraPos.current.x) * s;
        smoothCameraPos.current.y += (refs.targetCameraY - smoothCameraPos.current.y) * s;
        smoothCameraPos.current.z += (refs.targetCameraZ - smoothCameraPos.current.z) * s;
        refs.camera.position.x = smoothCameraPos.current.x + Math.sin(time*0.1)*1.5;
        refs.camera.position.y = smoothCameraPos.current.y + Math.cos(time*0.15)*0.8;
        refs.camera.position.z = smoothCameraPos.current.z;
        refs.camera.lookAt(0, 10, PLANET_Z);
      }

      refs.mountains.forEach((m, i) => {
        const p = 1 + i * 0.5;
        m.position.x = Math.sin(time*0.1)*2*p;
        // Keep y at base position with gentle bob
        m.position.y = (m.userData.baseZ ?? -100) + 50 + Math.cos(time*0.15)*p;
      });

      // Clover: smooth scale + billboard + spin
      if (refs.clover && refs.camera) {
        refs.cloverScale += (refs.targetCloverScale - refs.cloverScale) * 0.08;
        const s = Math.max(refs.cloverScale * 12, 0.001); // scale 12 = ~480 units wide at full
        refs.clover.scale.set(s, s, s);

        // Face the camera each frame
        refs.clover.lookAt(refs.camera.position);

        // All petals idle-spin as one clover
        refs.clover.rotateZ(0.005);

        // Petal opacity
        const op = Math.min(refs.cloverScale * 2, 1);
        refs.clover.children.forEach(p => { p.material.opacity = op; });
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
      if (refs.planet)  { refs.planet.children.forEach(c => { c.geometry.dispose(); c.material.dispose(); }); refs.scene?.remove(refs.planet); }
      if (refs.clover)  { refs.clover.children.forEach(c => { c.geometry.dispose(); c.material.dispose(); }); refs.scene?.remove(refs.clover); }
      if (refs.renderer) refs.renderer.dispose();
    };
  }, []);

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

      const totalProg     = progress * totalSections;
      const newSection    = Math.min(Math.floor(totalProg), totalSections - 1);
      const sectionProg   = totalProg >= totalSections ? 1 : totalProg % 1;
      setCurrentSection(newSection);

      const { current: refs } = threeRefs;

      const cameraPositions = [
        { x: 0, y: 30, z: 300  },   // HORIZON
        { x: 0, y: 20, z: -300 },   // COSMOS
        { x: 0, y: 10, z: -1700 },  // APPROACH
      ];
      const cur  = cameraPositions[newSection]     ?? cameraPositions[cameraPositions.length - 1];
      const next = cameraPositions[newSection + 1] ?? cur;
      refs.targetCameraX = cur.x + (next.x - cur.x) * sectionProg;
      refs.targetCameraY = cur.y + (next.y - cur.y) * sectionProg;
      refs.targetCameraZ = cur.z + (next.z - cur.z) * sectionProg;

      // Mountains disappear at 55%
      refs.mountains.forEach(m => {
        m.position.z = progress > 0.55 ? 600000 : m.userData.baseZ;
      });

      // Clover: start appearing at 45%, full at 70%
      let cloverTarget = 0;
      if (progress >= 0.70) {
        cloverTarget = 1;
      } else if (progress > 0.45) {
        cloverTarget = (progress - 0.45) / 0.25;
      }
      refs.targetCloverScale = cloverTarget;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalSections]);

  const splitTitle = (text) =>
    text.split('').map((char, i) => (
      <span key={i} className="cosmos-title-char title-char">{char}</span>
    ));

  // Hero title fades out once scrolling begins
  const titleOpacity = Math.max(0, 1 - scrollProgress * 5);

  return (
    <div ref={containerRef} className="cosmos-style hero-container">
      <canvas ref={canvasRef} className="cosmos-canvas" />

      {/* Side menu */}
      <div ref={menuRef} className="cosmos-side-menu" style={{ visibility: 'hidden' }}>
        <div className="cosmos-menu-icon"><span /><span /><span /></div>
        <div className="cosmos-vertical-text">SPACE</div>
      </div>

      {/* HORIZON title — fades out on scroll */}
      <div className="cosmos-hero-content" style={{ opacity: titleOpacity, pointerEvents: titleOpacity < 0.05 ? 'none' : 'auto' }}>
        <h1 ref={titleRef} className="cosmos-hero-title" style={{ visibility: 'hidden' }}>
          {splitTitle('HORIZON')}
        </h1>
        <div ref={subtitleRef} className="cosmos-hero-subtitle" style={{ visibility: 'hidden' }}>
          <p className="subtitle-line">Where vision meets reality,</p>
          <p className="subtitle-line">we shape the future of tomorrow</p>
        </div>
      </div>

      {/* Scroll progress */}
      <div ref={scrollProgressRef} className="cosmos-scroll-progress" style={{ visibility: 'hidden' }}>
        <div className="cosmos-scroll-text">SCROLL</div>
        <div className="cosmos-progress-track">
          <div className="cosmos-progress-fill" style={{ width: `${scrollProgress * 100}%` }} />
        </div>
        <div className="cosmos-section-counter">
          {String(currentSection + 1).padStart(2, '0')} / {String(totalSections).padStart(2, '0')}
        </div>
      </div>

      {/* Scroll spacers — invisible, provide page height for scrolling */}
      <div className="cosmos-scroll-sections">
        <section className="cosmos-content-section" />
        <section className="cosmos-content-section" />
      </div>
    </div>
  );
}
