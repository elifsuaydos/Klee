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

// Klee brand petal path (same as KleeHeroAnimation.js)
const PETAL_PATH =
  "M 0 0 l -2.9 -2.64 C -13.2 -11.98 -20 -18.14 -20 -25.7 C -20 -31.86 -15.16 -36.7 -9 -36.7 C -5.52 -36.7 -2.18 -35.08 0 -32.52 C 2.18 -35.08 5.52 -36.7 9 -36.7 C 15.16 -36.7 20 -31.86 20 -25.7 C 20 -18.14 13.2 -11.98 2.9 -2.64 L 0 0 z";

// Planet is fixed at this depth — camera approaches it on scroll
const PLANET_Z = -2000;

export default function HorizonHeroSection() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const scrollProgressRef = useRef(null);
  const menuRef = useRef(null);

  const smoothCameraPos = useRef({ x: 0, y: 30, z: 300 });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const totalSections = 2;

  const threeRefs = useRef({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    stars: [],
    nebula: null,
    mountains: [],
    locations: [],
    planet: null,       // THREE.Group (solid sphere + halo)
    clover: null,       // THREE.Group (4 petals)
    animationId: null,
    targetCameraX: 0,
    targetCameraY: 30,
    targetCameraZ: 300,
    targetCloverScale: 0,
    cloverScale: 0,
  });

  useEffect(() => {
    const initThree = () => {
      const { current: refs } = threeRefs;

      refs.scene = new THREE.Scene();
      refs.scene.fog = new THREE.FogExp2(0x000000, 0.00012); // lighter fog — planet visible far away

      // Camera far plane extended to 3500 — planet at -2000 must be visible
      refs.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3500);
      refs.camera.position.set(0, 30, 300);

      refs.renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
      refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      refs.renderer.toneMappingExposure = 0.5;

      refs.composer = new EffectComposer(refs.renderer);
      refs.composer.addPass(new RenderPass(refs.scene, refs.camera));
      // Bloom strength reduced: 0.8 → 0.45 (soluk his)
      refs.composer.addPass(new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight), 0.45, 0.4, 0.85
      ));

      // Subtle ambient + directional light for planet surface shading
      const ambientLight = new THREE.AmbientLight(0x111133, 0.5);
      refs.scene.add(ambientLight);
      const dirLight = new THREE.DirectionalLight(0x4466bb, 0.8);
      dirLight.position.set(500, 300, 200);
      refs.scene.add(dirLight);

      createStarField();
      createNebula();
      createMountains();
      createPlanet();
      createClover();
      getLocation();
      animate();

      setIsReady(true);
    };

    // ── Star field ─────────────────────────────────────────────────────────
    const createStarField = () => {
      const { current: refs } = threeRefs;
      const starCount = 5000;
      for (let i = 0; i < 3; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors    = new Float32Array(starCount * 3);
        const sizes     = new Float32Array(starCount);

        for (let j = 0; j < starCount; j++) {
          const radius = 300 + Math.random() * 900;
          const theta  = Math.random() * Math.PI * 2;
          const phi    = Math.acos(Math.random() * 2 - 1);
          positions[j * 3]     = radius * Math.sin(phi) * Math.cos(theta);
          positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[j * 3 + 2] = radius * Math.cos(phi);

          const color = new THREE.Color();
          const c = Math.random();
          if (c < 0.7)      color.setHSL(0, 0, 0.8 + Math.random() * 0.2);
          else if (c < 0.9) color.setHSL(0.08, 0.5, 0.8);
          else              color.setHSL(0.6, 0.5, 0.8);
          colors[j * 3] = color.r; colors[j * 3 + 1] = color.g; colors[j * 3 + 2] = color.b;
          sizes[j] = Math.random() * 2 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
        geometry.setAttribute('size',     new THREE.BufferAttribute(sizes,     1));

        const material = new THREE.ShaderMaterial({
          uniforms: { time: { value: 0 }, depth: { value: i } },
          vertexShader: `
            attribute float size; attribute vec3 color; varying vec3 vColor;
            uniform float time; uniform float depth;
            void main() {
              vColor = color;
              vec3 pos = position;
              float angle = time * 0.05 * (1.0 - depth * 0.3);
              mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
              pos.xy = rot * pos.xy;
              vec4 mvp = modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = size * (300.0 / -mvp.z);
              gl_Position = projectionMatrix * mvp;
            }
          `,
          fragmentShader: `
            varying vec3 vColor;
            void main() {
              float d = length(gl_PointCoord - vec2(0.5));
              if (d > 0.5) discard;
              gl_FragColor = vec4(vColor, 1.0 - smoothstep(0.0, 0.5, d));
            }
          `,
          transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        });
        const stars = new THREE.Points(geometry, material);
        refs.scene.add(stars);
        refs.stars.push(stars);
      }
    };

    // ── Nebula — static, behind planet ─────────────────────────────────────
    const createNebula = () => {
      const { current: refs } = threeRefs;
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(0x0033ff) },
          color2: { value: new THREE.Color(0xff0066) },
          opacity: { value: 0.25 },
        },
        vertexShader: `
          varying vec2 vUv; varying float vElevation; uniform float time;
          void main() {
            vUv = uv;
            vec3 pos = position;
            float e = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
            pos.z += e; vElevation = e;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1; uniform vec3 color2;
          uniform float opacity; uniform float time;
          varying vec2 vUv; varying float vElevation;
          void main() {
            float m = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
            vec3 color = mix(color1, color2, m * 0.5 + 0.5);
            float a = opacity * (1.0 - length(vUv - 0.5) * 2.0);
            gl_FragColor = vec4(color, a * (1.0 + vElevation * 0.01));
          }
        `,
        transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
      });
      const nebula = new THREE.Mesh(new THREE.PlaneGeometry(8000, 4000, 100, 100), material);
      // Nebula stays behind the planet — independent of mountains
      nebula.position.z = -2500;
      refs.scene.add(nebula);
      refs.nebula = nebula;
    };

    // ── Mountains ──────────────────────────────────────────────────────────
    const createMountains = () => {
      const { current: refs } = threeRefs;
      const layers = [
        { distance: -50,  height: 60,  color: 0x1a1a2e, opacity: 1   },
        { distance: -100, height: 80,  color: 0x16213e, opacity: 0.8  },
        { distance: -150, height: 100, color: 0x0f3460, opacity: 0.6  },
        { distance: -200, height: 120, color: 0x0a4668, opacity: 0.4  },
      ];
      layers.forEach((layer, index) => {
        const points = [];
        for (let i = 0; i <= 50; i++) {
          const x = (i / 50 - 0.5) * 1000;
          const y = Math.sin(i * 0.1) * layer.height + Math.sin(i * 0.05) * layer.height * 0.5
                  + Math.random() * layer.height * 0.2 - 100;
          points.push(new THREE.Vector2(x, y));
        }
        points.push(new THREE.Vector2(5000, -300));
        points.push(new THREE.Vector2(-5000, -300));

        const mountain = new THREE.Mesh(
          new THREE.ShapeGeometry(new THREE.Shape(points)),
          new THREE.MeshBasicMaterial({ color: layer.color, transparent: true, opacity: layer.opacity, side: THREE.DoubleSide })
        );
        mountain.position.z = layer.distance;
        mountain.position.y = layer.distance;
        mountain.userData = { baseZ: layer.distance, index };
        refs.scene.add(mountain);
        refs.mountains.push(mountain);
      });
    };

    // ── Planet (replaces atmosphere) ───────────────────────────────────────
    const createPlanet = () => {
      const { current: refs } = threeRefs;
      const group = new THREE.Group();
      group.position.set(0, 10, PLANET_Z);

      // (a) Solid sphere — mat, dark blue-purple
      const solidGeo = new THREE.SphereGeometry(180, 64, 64);
      const solidMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x1f2847),
        roughness: 0.88,
        metalness: 0.0,
        emissive: new THREE.Color(0x060d1f),
        emissiveIntensity: 0.4,
      });
      group.add(new THREE.Mesh(solidGeo, solidMat));

      // (b) Halo — dim fresnel rim, BackSide
      const haloGeo = new THREE.SphereGeometry(210, 32, 32);
      const haloMat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          uniform float time;
          void main() {
            float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            vec3 col = vec3(0.4, 0.55, 0.85) * intensity;
            float pulse = sin(time * 1.5) * 0.05 + 0.95;
            gl_FragColor = vec4(col * pulse, intensity * 0.10);
          }
        `,
        side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true,
      });
      group.add(new THREE.Mesh(haloGeo, haloMat));

      refs.scene.add(group);
      refs.planet = group;
    };

    // ── Clover — 4 Klee-branded petals via SVGLoader ───────────────────────
    const createClover = () => {
      const { current: refs } = threeRefs;
      const loader = new SVGLoader();
      const svgData = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${PETAL_PATH}"/></svg>`);
      const shapes = svgData.paths[0].toShapes(true);

      // Build and center geometry once, flip Y (SVG Y-down → Three.js Y-up)
      const rawGeo = new THREE.ShapeGeometry(shapes);
      rawGeo.computeBoundingBox();
      const bb = rawGeo.boundingBox;
      rawGeo.translate(
        -(bb.min.x + bb.max.x) / 2,
        -(bb.min.y + bb.max.y) / 2,
        0
      );
      rawGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, -1, 1)); // flip Y

      const petals = [
        { color: '#D14C18', rotZ: -Math.PI / 4      },  // ketchup-red  / TILSIM
        { color: '#F4D68C', rotZ:  Math.PI / 4      },  // sunshine-yellow / KIVILCIM
        { color: '#7C9DD2', rotZ: -3 * Math.PI / 4  },  // sky-blue     / TUTKU
        { color: '#B2AB2B', rotZ:  3 * Math.PI / 4  },  // olive-green  / VIZYON
      ];

      const group = new THREE.Group();
      group.position.set(0, 10, PLANET_Z + 10); // slightly in front of planet surface

      petals.forEach(({ color, rotZ }) => {
        const mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(rawGeo.clone(), mat);
        mesh.rotation.z = rotZ;
        group.add(mesh);
      });

      // Start invisible; scale 8 makes petal ~320 units wide at full size
      group.scale.set(0.001, 0.001, 0.001);
      refs.scene.add(group);
      refs.clover = group;
    };

    // ── Store original mountain Z positions ───────────────────────────────
    const getLocation = () => {
      const { current: refs } = threeRefs;
      refs.locations = refs.mountains.map(m => m.position.z);
    };

    // ── Render loop ────────────────────────────────────────────────────────
    const animate = () => {
      const { current: refs } = threeRefs;
      refs.animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Stars
      refs.stars.forEach(sf => { if (sf.material.uniforms) sf.material.uniforms.time.value = time; });
      // Nebula
      if (refs.nebula?.material.uniforms) refs.nebula.material.uniforms.time.value = time * 0.5;

      // Planet halo pulse
      if (refs.planet) {
        const halo = refs.planet.children[1];
        if (halo?.material.uniforms) halo.material.uniforms.time.value = time;
        refs.planet.rotation.y += 0.0008; // slow planetary rotation
      }

      // Smooth camera position
      if (refs.camera) {
        const s = 0.05;
        smoothCameraPos.current.x += (refs.targetCameraX - smoothCameraPos.current.x) * s;
        smoothCameraPos.current.y += (refs.targetCameraY - smoothCameraPos.current.y) * s;
        smoothCameraPos.current.z += (refs.targetCameraZ - smoothCameraPos.current.z) * s;

        refs.camera.position.x = smoothCameraPos.current.x + Math.sin(time * 0.1) * 1.5;
        refs.camera.position.y = smoothCameraPos.current.y + Math.cos(time * 0.15) * 0.8;
        refs.camera.position.z = smoothCameraPos.current.z;

        // Always look at the planet
        refs.camera.lookAt(0, 10, PLANET_Z);
      }

      // Mountain parallax animation (gentle horizontal drift)
      refs.mountains.forEach((m, i) => {
        const p = 1 + i * 0.5;
        m.position.x = Math.sin(time * 0.1) * 2 * p;
        m.position.y = (refs.locations[i] ?? m.userData.baseZ) + 50
                     + Math.cos(time * 0.15) * p;
      });

      // Clover — smooth scale + lookAt camera
      if (refs.clover) {
        const targetS = refs.targetCloverScale;
        refs.cloverScale += (targetS - refs.cloverScale) * 0.06;
        const s = refs.cloverScale * 8; // base scale factor = 8 (~320 unit wide clover)
        refs.clover.scale.set(Math.max(s, 0.001), Math.max(s, 0.001), Math.max(s, 0.001));

        // Billboard: clover always faces camera
        refs.clover.lookAt(refs.camera.position);

        // Idle z-spin (on top of billboard)
        refs.clover.children.forEach(petal => {
          petal.rotation.z += 0.003;
        });

        // Update petal opacity
        const opacity = Math.min(refs.cloverScale * 1.5, 1);
        refs.clover.children.forEach(p => {
          p.material.opacity = opacity;
        });
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
      refs.stars.forEach(s => { s.geometry.dispose(); s.material.dispose(); });
      refs.mountains.forEach(m => { m.geometry.dispose(); m.material.dispose(); });
      if (refs.nebula) { refs.nebula.geometry.dispose(); refs.nebula.material.dispose(); }
      if (refs.planet) {
        refs.planet.children.forEach(c => { c.geometry.dispose(); c.material.dispose(); });
        refs.scene?.remove(refs.planet);
      }
      if (refs.clover) {
        refs.clover.children.forEach(c => { c.geometry.dispose(); c.material.dispose(); });
        refs.scene?.remove(refs.clover);
      }
      if (refs.renderer) refs.renderer.dispose();
    };
  }, []);

  // GSAP intro animations
  useEffect(() => {
    if (!isReady) return;
    gsap.set([menuRef.current, titleRef.current, subtitleRef.current, scrollProgressRef.current], {
      visibility: 'visible',
    });
    const tl = gsap.timeline();
    if (menuRef.current) tl.from(menuRef.current, { x: -100, opacity: 0, duration: 1, ease: 'power3.out' });
    if (titleRef.current) {
      tl.from(titleRef.current.querySelectorAll('.title-char'), {
        y: 200, opacity: 0, duration: 1.5, stagger: 0.05, ease: 'power4.out',
      }, '-=0.5');
    }
    if (subtitleRef.current) {
      tl.from(subtitleRef.current.querySelectorAll('.subtitle-line'), {
        y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out',
      }, '-=0.8');
    }
    if (scrollProgressRef.current) {
      tl.from(scrollProgressRef.current, { opacity: 0, y: 50, duration: 1, ease: 'power2.out' }, '-=0.5');
    }
    return () => { tl.kill(); };
  }, [isReady]);

  // Scroll handler — camera + clover scale
  useEffect(() => {
    const handleScroll = () => {
      const scrollY   = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress  = Math.min(scrollY / maxScroll, 1);
      setScrollProgress(progress);

      const newSection = Math.min(Math.floor(progress * totalSections), totalSections - 1);
      setCurrentSection(newSection);

      const { current: refs } = threeRefs;
      const totalProg = progress * totalSections;
      // At progress=1, totalProg=totalSections → modulo wraps to 0. Clamp to 1 at end.
      const sectionProgress = totalProg >= totalSections ? 1 : totalProg % 1;

      // Camera: HORIZON → COSMOS → APPROACH (planet)
      const cameraPositions = [
        { x: 0, y: 30,  z: 300  },  // Section 0 — HORIZON
        { x: 0, y: 20,  z: -300 },  // Section 1 — COSMOS
        { x: 0, y: 10,  z: -1700 }, // Section 2 — APPROACH (planet close-up)
      ];
      const cur  = cameraPositions[newSection]     ?? cameraPositions[cameraPositions.length - 1];
      const next = cameraPositions[newSection + 1] ?? cur;

      refs.targetCameraX = cur.x + (next.x - cur.x) * sectionProgress;
      refs.targetCameraY = cur.y + (next.y - cur.y) * sectionProgress;
      refs.targetCameraZ = cur.z + (next.z - cur.z) * sectionProgress;

      // Mountains fly away at 60% scroll
      refs.mountains.forEach((mountain, i) => {
        mountain.position.z = progress > 0.6 ? 600000 : refs.locations[i];
      });
      // Nebula stays put (no mountain link)

      // Clover focus: appear from 60%, full at 85%
      let cloverTarget = 0;
      if (progress >= 0.85) {
        cloverTarget = 1;
      } else if (progress > 0.6) {
        cloverTarget = (progress - 0.6) / 0.25; // 0 → 1 over 60%–85%
      }
      refs.targetCloverScale = cloverTarget;
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalSections]);

  const splitTitle = (text) =>
    text.split('').map((char, i) => (
      <span key={i} className="cosmos-title-char title-char">{char}</span>
    ));

  const sections = [
    { title: 'COSMOS',   sub1: 'Beyond the boundaries of imagination,',     sub2: 'lies the universe of possibilities'          },
    { title: 'APPROACH', sub1: 'As we draw closer to the unknown,',          sub2: 'a new world comes into focus'                },
  ];

  return (
    <div ref={containerRef} className="cosmos-style hero-container">
      <canvas ref={canvasRef} className="cosmos-canvas" />

      <div ref={menuRef} className="cosmos-side-menu" style={{ visibility: 'hidden' }}>
        <div className="cosmos-menu-icon"><span /><span /><span /></div>
        <div className="cosmos-vertical-text">SPACE</div>
      </div>

      <div className="cosmos-hero-content">
        <h1 ref={titleRef} className="cosmos-hero-title" style={{ visibility: 'hidden' }}>
          {splitTitle('HORIZON')}
        </h1>
        <div ref={subtitleRef} className="cosmos-hero-subtitle" style={{ visibility: 'hidden' }}>
          <p className="subtitle-line">Where vision meets reality,</p>
          <p className="subtitle-line">we shape the future of tomorrow</p>
        </div>
      </div>

      <div ref={scrollProgressRef} className="cosmos-scroll-progress" style={{ visibility: 'hidden' }}>
        <div className="cosmos-scroll-text">SCROLL</div>
        <div className="cosmos-progress-track">
          <div className="cosmos-progress-fill" style={{ width: `${scrollProgress * 100}%` }} />
        </div>
        <div className="cosmos-section-counter">
          {String(currentSection + 1).padStart(2, '0')} / {String(totalSections).padStart(2, '0')}
        </div>
      </div>

      <div className="cosmos-scroll-sections">
        {sections.map((sec, i) => (
          <section key={i} className="cosmos-content-section">
            <h2 className="cosmos-section-title">{sec.title}</h2>
            <div className="cosmos-section-subtitle">
              <p className="subtitle-line">{sec.sub1}</p>
              <p className="subtitle-line">{sec.sub2}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
