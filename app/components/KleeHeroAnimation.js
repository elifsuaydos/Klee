"use client";

/**
 * KleeHeroAnimation
 * ─────────────────
 * A scroll-triggered, pinned hero section for the Klee brand.
 *
 * Animation timeline (all tied to scroll via ScrollTrigger pin):
 *
 *  Phase 1  – SVG scales up; petals A, B, C fly off-screen (opacity → 0).
 *  Phase 2  – Petal D (the survivor) translates to the top-right corner.
 *  Phase 3  – Petal D rotates continuously AND its fill cycles through
 *             the four brand hex codes as scroll advances.
 *
 * All refs are used instead of string selectors per the requirements.
 */

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// ─── Register plugins once at module scope (safe for SSR because the
//     import guard in ScrollTrigger itself handles the window check) ─────────
gsap.registerPlugin(ScrollTrigger, useGSAP);

// ─── Brand palette ────────────────────────────────────────────────────────────
const BRAND_COLORS = ["#D14C18", "#F4D68C", "#7C9DD2", "#B2AB2B"];

// ─── Hex → [r, g, b] helper ──────────────────────────────────────────────────
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

// ─── Interpolate across the palette at progress t ∈ [0, 1] ──────────────────
function interpolatePalette(t) {
  const segments = BRAND_COLORS.length - 1; // 3 segments
  const scaled = t * segments;
  const idx = Math.min(Math.floor(scaled), segments - 1);
  const local = scaled - idx; // 0→1 within the segment

  const [r1, g1, b1] = hexToRgb(BRAND_COLORS[idx]);
  const [r2, g2, b2] = hexToRgb(BRAND_COLORS[idx + 1]);

  const r = Math.round(r1 + (r2 - r1) * local);
  const g = Math.round(g1 + (g2 - g1) * local);
  const b = Math.round(b1 + (b2 - b1) * local);
  return `rgb(${r},${g},${b})`;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function KleeHeroAnimation() {
  // Container – pinned by ScrollTrigger
  const sectionRef = useRef(null);

  // The whole SVG – scaled up in Phase 1
  const svgRef = useRef(null);

  // Individual petals
  const petalARef = useRef(null); // Red        – flies off top-left
  const petalBRef = useRef(null); // Yellow     – flies off top-right
  const petalCRef = useRef(null); // Blue       – flies off bottom-left
  const petalDRef = useRef(null); // Green      – the survivor

  // ─── GSAP animation ────────────────────────────────────────────────────────
  useGSAP(
    () => {
      // Total scroll distance while pinned (controls how long each phase lasts)
      const SCROLL_TOTAL = "500vh";

      // ── Master timeline pinned to the section ─────────────────────────────
      const master = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: SCROLL_TOTAL,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // Calculate corner targets to place the center of the clover 
      // exactly at each corner of the screen.
      const section = sectionRef.current;
      const bottomRightX = () => section.clientWidth / 2;
      const bottomRightY = () => section.clientHeight / 2;

      const topLeftX = () => -(section.clientWidth / 2);
      const topLeftY = () => -(section.clientHeight / 2);

      const topRightX = () => section.clientWidth / 2;
      const topRightY = () => -(section.clientHeight / 2);

      const bottomLeftX = () => -(section.clientWidth / 2);
      const bottomLeftY = () => section.clientHeight / 2;

      // ── Phase 1: Center to Bottom Right ────────────────────────────────
      master.to(
        svgRef.current,
        { 
          scale: 8, // Smaller than 12, but still large and impactful
          x: bottomRightX, 
          y: bottomRightY, 
          rotation: 180, // Turn 180 degrees while moving to first corner
          transformOrigin: "center center", 
          ease: "power2.inOut" 
        },
        "phase1"
      );

      // (Fade out removed to keep all petals visible)

      // ── Phase 2: Bottom Right to Top Left ──────────────────────────────
      // Turn 90 degrees (180 + 90 = 270)
      master.to(
        svgRef.current,
        {
          x: topLeftX,
          y: topLeftY,
          rotation: 270,
          ease: "power2.inOut",
        },
        "phase2"
      );

      // ── Phase 3: Top Left to Top Right ─────────────────────────────────
      // Slide horizontally (keep rotation at 270).
      // As it slides, the Blue petal exits and the Red petal naturally enters the view.
      master.to(
        svgRef.current,
        {
          x: topRightX,
          y: topRightY,
          rotation: 270,
          ease: "power2.inOut",
        },
        "phase3"
      );

      // ── Phase 4: Top Right to Bottom Left ──────────────────────────────
      // Turn 90 degrees (270 + 90 = 360) to reveal the Yellow petal.
      master.to(
        svgRef.current,
        {
          x: bottomLeftX,
          y: bottomLeftY,
          rotation: 360, 
          ease: "power2.inOut",
        },
        "phase4"
      );

      // ── Phase 5: Fly to Navbar & Shrink ────────────────────────────────
      master.to(
        svgRef.current,
        {
          x: () => {
            const navLogo = document.querySelector(".navbar-clover-logo");
            if (!navLogo) return 0;
            const navRect = navLogo.getBoundingClientRect();
            return (navRect.left + navRect.width / 2) - (section.clientWidth / 2);
          },
          y: () => {
            const navLogo = document.querySelector(".navbar-clover-logo");
            if (!navLogo) return 0;
            const navRect = navLogo.getBoundingClientRect();
            return (navRect.top + navRect.height / 2) - (section.clientHeight / 2);
          },
          scale: 32 / 280, // Match the 32px width of the navbar logo
          rotation: 720, // Spin one full revolution while flying to the navbar
          ease: "power2.inOut",
        },
        "phase5"
      );

      // ── Phase 6: Seamless Handoff ──────────────────────────────────────
      // Instantly fade out the giant animated SVG and reveal the static navbar logo
      master.to(svgRef.current, { opacity: 0, duration: 0.05 }, "phase6");
      
      // We must query the DOM node directly because the string selector 
      // ".navbar-clover-logo" would fail due to the useGSAP scope being limited to sectionRef.
      const navLogoNode = document.querySelector(".navbar-clover-logo");
      if (navLogoNode) {
        master.to(navLogoNode, { opacity: 1, duration: 0.05 }, "phase6");
      }
    },
    { scope: sectionRef } // useGSAP config – scope limits any potential string selector lookups
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        overflow: "hidden",
      }}
      aria-label="Klee animated hero"
    >
      {/*
        ── Klee Four-Leaf Clover SVG ───────────────────────────────────────
        Geometrically optimized heart-shaped petals.
        Coordinate system (viewBox 0 0 100 100):
          Centre translates to (50, 50). Local origin is (0, 0).
          Petal A: top-left, ketchup-red
          Petal B: top-right, sunshine-yellow
          Petal C: bottom-left, sky-blue
          Petal D: bottom-right, olive-green  ← survivor
      */}
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        width="280"
        height="280"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ transformOrigin: "center center" }}
      >
        <g transform="translate(50, 50)">
          {/* Petal A – flies top-left */}
          <g ref={petalARef} fill="var(--ketchup-red)" style={{ transformOrigin: "0px 0px" }}>
            <path 
              d="M 0 0 l -2.9 -2.64 C -13.2 -11.98 -20 -18.14 -20 -25.7 C -20 -31.86 -15.16 -36.7 -9 -36.7 C -5.52 -36.7 -2.18 -35.08 0 -32.52 C 2.18 -35.08 5.52 -36.7 9 -36.7 C 15.16 -36.7 20 -31.86 20 -25.7 C 20 -18.14 13.2 -11.98 2.9 -2.64 L 0 0 z" 
              opacity="0.92"
              transform="translate(-1, -1) rotate(-45)" 
            />
          </g>

          {/* Petal B – flies top-right */}
          <g ref={petalBRef} fill="var(--sunshine-yellow)" style={{ transformOrigin: "0px 0px" }}>
            <path 
              d="M 0 0 l -2.9 -2.64 C -13.2 -11.98 -20 -18.14 -20 -25.7 C -20 -31.86 -15.16 -36.7 -9 -36.7 C -5.52 -36.7 -2.18 -35.08 0 -32.52 C 2.18 -35.08 5.52 -36.7 9 -36.7 C 15.16 -36.7 20 -31.86 20 -25.7 C 20 -18.14 13.2 -11.98 2.9 -2.64 L 0 0 z" 
              opacity="0.92"
              transform="translate(1, -1) rotate(45)" 
            />
          </g>

          {/* Petal C – flies bottom-left */}
          <g ref={petalCRef} fill="var(--sky-blue)" style={{ transformOrigin: "0px 0px" }}>
            <path 
              d="M 0 0 l -2.9 -2.64 C -13.2 -11.98 -20 -18.14 -20 -25.7 C -20 -31.86 -15.16 -36.7 -9 -36.7 C -5.52 -36.7 -2.18 -35.08 0 -32.52 C 2.18 -35.08 5.52 -36.7 9 -36.7 C 15.16 -36.7 20 -31.86 20 -25.7 C 20 -18.14 13.2 -11.98 2.9 -2.64 L 0 0 z" 
              opacity="0.92"
              transform="translate(-1, 1) rotate(-135)" 
            />
          </g>

          {/* Petal D – the survivor */}
          <g ref={petalDRef} fill="var(--olive-green)" style={{ transformOrigin: "0px 0px" }}>
            <path 
              d="M 0 0 l -2.9 -2.64 C -13.2 -11.98 -20 -18.14 -20 -25.7 C -20 -31.86 -15.16 -36.7 -9 -36.7 C -5.52 -36.7 -2.18 -35.08 0 -32.52 C 2.18 -35.08 5.52 -36.7 9 -36.7 C 15.16 -36.7 20 -31.86 20 -25.7 C 20 -18.14 13.2 -11.98 2.9 -2.64 L 0 0 z" 
              opacity="0.92"
              transform="translate(1, 1) rotate(135)" 
            />
          </g>

        </g>
      </svg>
    </section>
  );
}
