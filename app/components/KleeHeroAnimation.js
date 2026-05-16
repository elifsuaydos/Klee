"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CardContainer, CardBody, CardItem } from "./Card3D";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function SplitTextChars({ text }) {
  return (
    <>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="char"
          style={{
            display: "inline-block",
            opacity: 0,
            transform: "translateY(40px)",
            willChange: "transform, opacity",
          }}
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </>
  );
}

const PETAL_PATH =
  "M 0 0 l -2.9 -2.64 C -13.2 -11.98 -20 -18.14 -20 -25.7 C -20 -31.86 -15.16 -36.7 -9 -36.7 C -5.52 -36.7 -2.18 -35.08 0 -32.52 C 2.18 -35.08 5.52 -36.7 9 -36.7 C 15.16 -36.7 20 -31.86 20 -25.7 C 20 -18.14 13.2 -11.98 2.9 -2.64 L 0 0 z";

/* ──────────────────────────────────────────────────────
   Cycling word — all words always in DOM, GSAP coordinates
   entrance (slide + blur in) and exit (slide + blur out)
────────────────────────────────────────────────────── */
const CYCLE_WORDS = ["deneyimler", "websiteleri", "hayalleri", "projeleri"];

function CyclingWord() {
  const [activeIndex, setActiveIndex] = useState(0);
  const wordRefs = useRef([]);
  const indexRef = useRef(0);
  const isAnimating = useRef(false);

  // Set initial state: first word visible, rest hidden below
  useEffect(() => {
    CYCLE_WORDS.forEach((_, i) => {
      const el = wordRefs.current[i];
      if (!el) return;
      if (i === 0) {
        gsap.set(el, { y: "0%", opacity: 1, filter: "blur(0px)", scale: 1 });
      } else {
        gsap.set(el, {
          y: "60%",
          opacity: 0,
          filter: "blur(8px)",
          scale: 0.92,
        });
      }
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      const current = indexRef.current;
      const next = (current + 1) % CYCLE_WORDS.length;

      const currentEl = wordRefs.current[current];
      const nextEl = wordRefs.current[next];
      if (!currentEl || !nextEl) {
        isAnimating.current = false;
        return;
      }

      // Prep next word below
      gsap.set(nextEl, {
        y: "60%",
        opacity: 0,
        filter: "blur(8px)",
        scale: 0.92,
      });

      const tl = gsap.timeline({
        onComplete: () => {
          indexRef.current = next;
          setActiveIndex(next);
          isAnimating.current = false;
        },
      });

      // Exit: current word slides up and blurs out
      tl.to(currentEl, {
        y: "-60%",
        opacity: 0,
        filter: "blur(8px)",
        scale: 0.92,
        duration: 0.5,
        ease: "power3.in",
      });

      // Enter: next word slides up into place, clears blur
      tl.to(
        nextEl,
        {
          y: "0%",
          opacity: 1,
          filter: "blur(0px)",
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.15",
      ); // slight overlap for snappiness
    }, 2400);

    return () => clearInterval(id);
  }, []);

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        overflow: "hidden",
        verticalAlign: "bottom",
        /* Match longest word so layout doesn't jump */
        minWidth: `${Math.max(...CYCLE_WORDS.map((w) => w.length))}ch`,
      }}
    >
      {CYCLE_WORDS.map((word, i) => (
        <span
          key={word}
          ref={(el) => {
            wordRefs.current[i] = el;
          }}
          style={{
            position: i === 0 ? "relative" : "absolute",
            top: 0,
            left: 0,
            display: "inline-block",
            whiteSpace: "nowrap",
            willChange: "transform, opacity, filter",
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

const CLOVER_STYLE = {
  position: "absolute",
  left: "50%",
  top: "50%",
  marginLeft: "-140px",
  marginTop: "-140px",
  transformOrigin: "center center",
};

export default function KleeHeroAnimation() {
  const sectionRef = useRef(null);
  const cloverRef = useRef(null);
  const introScreenRef = useRef(null);
  const introTextRef = useRef(null);
  const glowLayerRef = useRef(null);
  const tintLayerRef = useRef(null);

  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);
  const finalContentRef = useRef(null);

  const redPetalRef = useRef(null);
  const yellowPetalRef = useRef(null);
  const bluePetalRef = useRef(null);
  const greenPetalRef = useRef(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      delete document.body.dataset.heroComplete;
    }
    return () => {
      if (typeof document !== "undefined") {
        delete document.body.dataset.heroComplete;
      }
    };
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const clover = cloverRef.current;
      const introScreen = introScreenRef.current;

      const topBar = document.querySelector("#top-bar");
      let heroComplete = false;

      const glowLayer = glowLayerRef.current;
      if (glowLayer) {
        glowLayer.style.setProperty("--gx", "50%");
        glowLayer.style.setProperty("--gy", "50%");
        glowLayer.style.setProperty("--glow-color", "transparent");
        glowLayer.style.setProperty("--glow-opacity", "0");
      }
      const tintLayer = tintLayerRef.current;
      if (tintLayer) {
        tintLayer.style.setProperty("--tint-color", "transparent");
        tintLayer.style.setProperty("--tint-opacity", "0");
      }

      // Top-bar Klee text: shift left so it sits at TRUE viewport center
      // during the hero animation. Will slide back to its natural position
      // during the converge phase as the clover lands in the slot beside it.
      const navLogoNodeInit = document.querySelector(".navbar-clover-logo");
      const slotW = navLogoNodeInit?.offsetWidth ?? 28;
      const brandGap = 8;
      const kleeOffsetX = -(slotW + brandGap) / 2;
      const kleeTextNode = document.querySelector(".top-bar-klee-text");
      if (kleeTextNode) {
        gsap.set(kleeTextNode, { x: kleeOffsetX });
      }

      const isMobile = () => section.clientWidth < 768;
      const isLandscape = () =>
        section.clientWidth > section.clientHeight &&
        section.clientHeight < 500;

      // ── Intro scale: clover starts BIG and semi-transparent ──────
      const introScale = () => {
        if (isLandscape()) return 1.0;
        return isMobile() ? 1.3 : 1.86;
      };
      gsap.set(clover, {
        scale: introScale(),
        x: 0,
        y: 0,
        opacity: 1,
        rotation: 0,
      });

      // Independent idle spin (runs until first scroll)
      const idleSpin = gsap.to(clover, {
        rotation: "+=360",
        duration: 18,
        ease: "none",
        repeat: -1,
      });

      // Animate intro text chars in on mount
      const introChars = introTextRef.current?.querySelectorAll(".char");
      if (introChars && introChars.length) {
        gsap.to(introChars, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: { amount: 0.6 },
          ease: "power2.out",
          delay: 0.3,
        });
      }

      const centerScale = () => {
        if (isLandscape()) return 1.2;
        return isMobile() ? 1.8 : 2.8;
      };
      const cornerScale = () => {
        if (isLandscape()) return 2.5;
        return isMobile() ? 3.5 : 6;
      };
      const cX = (side) => {
        let mult;
        if (isLandscape()) mult = 0.38;
        else if (isMobile()) mult = 0.4;
        else mult = 0.5;
        return side === "left"
          ? -(section.clientWidth * mult)
          : section.clientWidth * mult;
      };
      const cY = (side) => {
        let mult;
        if (isLandscape()) mult = 0.36;
        else if (isMobile()) mult = 0.42;
        else mult = 0.48;
        return side === "top"
          ? -(section.clientHeight * mult)
          : section.clientHeight * mult;
      };
      const scrollEnd = () => {
        if (isLandscape()) return "900vh";
        if (isMobile()) return "1100vh";
        return "1550vh";
      };

      const rp = redPetalRef.current;
      const yp = yellowPetalRef.current;
      const bp = bluePetalRef.current;
      const gp = greenPetalRef.current;

      const master = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: scrollEnd,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const isComplete = self.progress >= 0.999;
            if (
              isComplete !== heroComplete &&
              typeof document !== "undefined"
            ) {
              heroComplete = isComplete;
              if (isComplete) {
                document.body.dataset.heroComplete = "true";
              } else {
                delete document.body.dataset.heroComplete;
              }
            }
            // Smooth idle spin kill once scrolling begins
            if (self.progress > 0.001 && idleSpin.isActive()) {
              gsap.to(idleSpin, {
                timeScale: 0,
                duration: 0.4,
                ease: "power2.out",
                onComplete: () => idleSpin.kill(),
              });
            }
            // Fade out intro screen (tagline + scroll prompt)
            if (introScreen && self.progress > 0.001) {
              gsap.to(introScreen, {
                opacity: 0,
                duration: 0.4,
                ease: "power2.out",
                overwrite: true,
              });
            } else if (introScreen && self.progress <= 0.001) {
              gsap.to(introScreen, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out",
                overwrite: true,
              });
            }
          },
        },
      });

      // ── Phase 0: Transition from intro state → full-opacity center ─────
      master.to(
        clover,
        {
          scale: centerScale,
          duration: 0.8,
          ease: "power2.out",
        },
        "grow",
      );

      // ── Step 1: Top-left — Red / TILSIM ───────────────────────────────
      master.to(
        clover,
        {
          x: () => cX("left"),
          y: () => cY("top"),
          scale: () => cornerScale(),
          duration: 3,
          ease: "expo.inOut",
        },
        "step1",
      );
      master.to(
        clover,
        {
          rotation: 540,
          duration: 3,
          ease: "sine.inOut",
        },
        "step1",
      );
      if (glowLayer) {
        master.to(
          glowLayer,
          {
            "--gx": "18%",
            "--gy": "22%",
            "--glow-color": "#D14C18",
            "--glow-opacity": "0.55",
            duration: 3,
            ease: "expo.inOut",
          },
          "step1",
        );
      }
      if (tintLayer) {
        master.to(
          tintLayer,
          {
            "--tint-color": "#D14C18",
            "--tint-opacity": "0.12",
            duration: 3,
            ease: "expo.inOut",
          },
          "step1",
        );
      }
      master.to(
        step1Ref.current.querySelectorAll(".char"),
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: { amount: 0.45 },
          ease: "back.out(1.2)",
        },
        "step1+=1.2",
      );
      master.to(
        step1Ref.current.querySelector(".step-desc"),
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
        "step1+=1.5",
      );
      master.to({}, { duration: 1.5 }, "step1-hold");
      master.to(
        [yp, bp, gp],
        { opacity: 0.15, duration: 0.5, ease: "power2.inOut" },
        "step1-hold",
      );
      master.to(
        [yp, bp, gp],
        { opacity: 0.92, duration: 0.5, ease: "power2.inOut" },
        "step1-hold+=1.0",
      );

      // ── Transition 1→2 ───────────────────────────────────────────────
      master.to(
        step1Ref.current.querySelectorAll(".char"),
        {
          opacity: 0,
          y: -40,
          duration: 0.75,
          stagger: { amount: 0.3 },
          ease: "power2.in",
        },
        "trans1",
      );
      master.to(
        step1Ref.current.querySelector(".step-desc"),
        { opacity: 0, y: -20, duration: 0.75, ease: "power2.in" },
        "trans1",
      );

      // ── Step 2: Bottom-right — Green / VİZYON ────────────────────────
      master.to(
        clover,
        {
          x: () => cX("right"),
          y: () => cY("bottom"),
          scale: () => cornerScale(),
          duration: 3,
          ease: "expo.inOut",
        },
        "step2",
      );
      master.to(
        clover,
        {
          rotation: 900,
          duration: 3,
          ease: "sine.inOut",
        },
        "step2",
      );
      if (glowLayer) {
        master.to(
          glowLayer,
          {
            "--gx": "82%",
            "--gy": "78%",
            "--glow-color": "#B2AB2B",
            "--glow-opacity": "0.55",
            duration: 3,
            ease: "expo.inOut",
          },
          "step2",
        );
      }
      if (tintLayer) {
        master.to(
          tintLayer,
          {
            "--tint-color": "#B2AB2B",
            "--tint-opacity": "0.12",
            duration: 3,
            ease: "expo.inOut",
          },
          "step2",
        );
      }
      master.to(
        step2Ref.current.querySelectorAll(".char"),
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: { amount: 0.45 },
          ease: "back.out(1.2)",
        },
        "step2+=1.2",
      );
      master.to(
        step2Ref.current.querySelector(".step-desc"),
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
        "step2+=1.5",
      );
      master.to({}, { duration: 1.5 }, "step2-hold");
      master.to(
        [rp, yp, bp],
        { opacity: 0.15, duration: 0.5, ease: "power2.inOut" },
        "step2-hold",
      );
      master.to(
        [rp, yp, bp],
        { opacity: 0.92, duration: 0.5, ease: "power2.inOut" },
        "step2-hold+=1.0",
      );

      // ── Transition 2→3 ───────────────────────────────────────────────
      master.to(
        step2Ref.current.querySelectorAll(".char"),
        {
          opacity: 0,
          y: -40,
          duration: 0.75,
          stagger: { amount: 0.3 },
          ease: "power2.in",
        },
        "trans2",
      );
      master.to(
        step2Ref.current.querySelector(".step-desc"),
        { opacity: 0, y: -20, duration: 0.75, ease: "power2.in" },
        "trans2",
      );

      // ── Step 3: Bottom-left — Blue / TUTKU ───────────────────────────
      master.to(
        clover,
        {
          x: () => cX("left"),
          y: () => cY("bottom"),
          scale: () => cornerScale(),
          duration: 3,
          ease: "expo.inOut",
        },
        "step3",
      );
      master.to(
        clover,
        {
          rotation: 1260,
          duration: 3,
          ease: "sine.inOut",
        },
        "step3",
      );
      if (glowLayer) {
        master.to(
          glowLayer,
          {
            "--gx": "18%",
            "--gy": "78%",
            "--glow-color": "#7C9DD2",
            "--glow-opacity": "0.55",
            duration: 3,
            ease: "expo.inOut",
          },
          "step3",
        );
      }
      if (tintLayer) {
        master.to(
          tintLayer,
          {
            "--tint-color": "#7C9DD2",
            "--tint-opacity": "0.12",
            duration: 3,
            ease: "expo.inOut",
          },
          "step3",
        );
      }
      master.to(
        step3Ref.current.querySelectorAll(".char"),
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: { amount: 0.45 },
          ease: "back.out(1.2)",
        },
        "step3+=1.2",
      );
      master.to(
        step3Ref.current.querySelector(".step-desc"),
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
        "step3+=1.5",
      );
      master.to({}, { duration: 1.5 }, "step3-hold");
      master.to(
        [rp, yp, gp],
        { opacity: 0.15, duration: 0.5, ease: "power2.inOut" },
        "step3-hold",
      );
      master.to(
        [rp, yp, gp],
        { opacity: 0.92, duration: 0.5, ease: "power2.inOut" },
        "step3-hold+=1.0",
      );

      // ── Transition 3→4 ───────────────────────────────────────────────
      master.to(
        step3Ref.current.querySelectorAll(".char"),
        {
          opacity: 0,
          y: -40,
          duration: 0.75,
          stagger: { amount: 0.3 },
          ease: "power2.in",
        },
        "trans3",
      );
      master.to(
        step3Ref.current.querySelector(".step-desc"),
        { opacity: 0, y: -20, duration: 0.75, ease: "power2.in" },
        "trans3",
      );

      // ── Step 4: Top-right — Yellow / KIVILCIM ────────────────────────
      master.to(
        clover,
        {
          x: () => cX("right"),
          y: () => cY("top"),
          scale: () => cornerScale(),
          duration: 3,
          ease: "expo.inOut",
        },
        "step4",
      );
      master.to(
        clover,
        {
          rotation: 1620,
          duration: 3,
          ease: "sine.inOut",
        },
        "step4",
      );
      if (glowLayer) {
        master.to(
          glowLayer,
          {
            "--gx": "82%",
            "--gy": "22%",
            "--glow-color": "#F4D68C",
            "--glow-opacity": "0.6",
            duration: 3,
            ease: "expo.inOut",
          },
          "step4",
        );
      }
      if (tintLayer) {
        master.to(
          tintLayer,
          {
            "--tint-color": "#F4D68C",
            "--tint-opacity": "0.14",
            duration: 3,
            ease: "expo.inOut",
          },
          "step4",
        );
      }
      master.to(
        step4Ref.current.querySelectorAll(".char"),
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: { amount: 0.45 },
          ease: "back.out(1.2)",
        },
        "step4+=1.2",
      );
      master.to(
        step4Ref.current.querySelector(".step-desc"),
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
        "step4+=1.5",
      );
      master.to({}, { duration: 1.5 }, "step4-hold");
      master.to(
        [rp, bp, gp],
        { opacity: 0.15, duration: 0.5, ease: "power2.inOut" },
        "step4-hold",
      );
      master.to(
        [rp, bp, gp],
        { opacity: 0.92, duration: 0.5, ease: "power2.inOut" },
        "step4-hold+=1.0",
      );

      // ── Phase 5: Converge to top-bar clover logo (top center) ────────
      const navLogoNode = document.querySelector(".navbar-clover-logo");
      const getNavX = () => {
        if (!navLogoNode) return 0;
        const r = navLogoNode.getBoundingClientRect();
        return r.left + r.width / 2 - section.clientWidth / 2;
      };
      const getNavY = () => {
        if (!navLogoNode) return 0;
        const r = navLogoNode.getBoundingClientRect();
        return r.top + r.height / 2 - section.clientHeight / 2;
      };

      master.to(
        step4Ref.current.querySelectorAll(".char"),
        {
          opacity: 0,
          y: -40,
          duration: 0.2,
          stagger: { amount: 0.1 },
          ease: "power2.in",
        },
        "converge",
      );
      master.to(
        step4Ref.current.querySelector(".step-desc"),
        { opacity: 0, y: -20, duration: 0.2, ease: "power2.in" },
        "converge",
      );
      master.to(
        clover,
        {
          x: getNavX,
          y: getNavY,
          scale: 28 / 280,
          rotation: 1980,
          duration: 2.5,
          ease: "power2.inOut",
        },
        "converge",
      );
      if (glowLayer) {
        master.to(
          glowLayer,
          {
            "--glow-opacity": "0",
            duration: 1.2,
            ease: "power2.inOut",
          },
          "converge",
        );
      }
      if (tintLayer) {
        master.to(
          tintLayer,
          {
            "--tint-opacity": "0",
            duration: 1.2,
            ease: "power2.inOut",
          },
          "converge",
        );
      }
      if (kleeTextNode) {
        master.to(
          kleeTextNode,
          { x: 0, duration: 1.0, ease: "power2.inOut" },
          "converge+=0.9",
        );
      }
      master.fromTo(
        finalContentRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        "converge+=1.8",
      );

      // ── Phase 6: Handoff ──────────────────────────────────────────────
      master.to(clover, { opacity: 0, duration: 0.05 }, "handoff");
      if (navLogoNode) {
        master.to(navLogoNode, { opacity: 1, duration: 0.05 }, "handoff");
      }
      if (topBar) {
        master.to(
          topBar,
          { opacity: 1, pointerEvents: "auto", duration: 0.1 },
          "handoff",
        );
      }
    },
    { scope: sectionRef },
  );

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
      {/* ── Color glow layer (synced with clover corner travel) ─── */}
      <div
        ref={glowLayerRef}
        className="hero-glow-layer"
        aria-hidden="true"
      />

      {/* ── Intro screen: tagline only (no scroll prompt — replaced by scroll progress bar) */}
      <div
        ref={introScreenRef}
        className="hero-intro-screen"
        aria-hidden="true"
      >
        <h2 ref={introTextRef} className="hero-intro-text">
          <SplitTextChars text="Klee ile " />
          <span className="hero-intro-emphasis">
            <SplitTextChars text="Hayalindeki Websitene" />
          </span>
          <br/>
          <SplitTextChars text=" kavuş." />
        </h2>
      </div>
      {/* ── Single clover SVG (all petals as one unit) ──────────────── */}
      <svg
        ref={cloverRef}
        viewBox="0 0 100 100"
        width="280"
        height="280"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={CLOVER_STYLE}
      >
        <g transform="translate(50, 50)">
          <path
            ref={redPetalRef}
            d={PETAL_PATH}
            fill="var(--ketchup-red)"
            opacity="0.92"
            transform="translate(-1, -1) rotate(-45)"
          />
          <path
            ref={yellowPetalRef}
            d={PETAL_PATH}
            fill="var(--sunshine-yellow)"
            opacity="0.92"
            transform="translate(1, -1) rotate(45)"
          />
          <path
            ref={bluePetalRef}
            d={PETAL_PATH}
            fill="var(--sky-blue)"
            opacity="0.92"
            transform="translate(-1, 1) rotate(-135)"
          />
          <path
            ref={greenPetalRef}
            d={PETAL_PATH}
            fill="var(--olive-green)"
            opacity="0.92"
            transform="translate(1, 1) rotate(135)"
          />
        </g>
      </svg>

      {/* ── Text overlays (above clover) ────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 10,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {/* Step 1: TILSIM — keyword top-left, desc bottom-right */}
        <div ref={step1Ref} style={{ position: "absolute", inset: 0 }}>
          <h2 className="hero-keyword" style={{ top: "10vh", left: "5vw" }}>
            <SplitTextChars text="TILSIM" />
          </h2>
          <div
            className="step-desc step-desc--right"
            style={{ opacity: 0, transform: "translateY(20px)" }}
          >
            Klee ile çalışanların yakalayacağı o eşsiz dijital başarı şansı.
          </div>
        </div>

        {/* Step 2: VİZYON — keyword bottom-right, desc bottom-left */}
        <div ref={step2Ref} style={{ position: "absolute", inset: 0 }}>
          <h2 className="hero-keyword" style={{ bottom: "10vh", right: "5vw" }}>
            <SplitTextChars text="VİZYON" />
          </h2>
          <div
            className="step-desc step-desc--left"
            style={{ opacity: 0, transform: "translateY(20px)" }}
          >
            Müşterinin hayali ve Klee&apos;nin tasarım gücü.
          </div>
        </div>

        {/* Step 3: TUTKU — keyword bottom-left, desc bottom-right */}
        <div ref={step3Ref} style={{ position: "absolute", inset: 0 }}>
          <h2 className="hero-keyword" style={{ bottom: "10vh", left: "5vw" }}>
            <SplitTextChars text="TUTKU" />
          </h2>
          <div
            className="step-desc step-desc--right"
            style={{ opacity: 0, transform: "translateY(20px)" }}
          >
            Kodlamaya ve detaylara verilen önem.
          </div>
        </div>

        {/* Step 4: KIVILCIM — keyword top-right, desc bottom-left */}
        <div ref={step4Ref} style={{ position: "absolute", inset: 0 }}>
          <h2 className="hero-keyword" style={{ top: "10vh", right: "5vw" }}>
            <SplitTextChars text="KIVILCIM" />
          </h2>
          <div
            className="step-desc step-desc--left"
            style={{ opacity: 0, transform: "translateY(20px)" }}
          >
            İnovasyon, farklı olma, yeni fikirler üretme.
          </div>
        </div>
      </div>

      {/* ── Final content (appears when clover flies to navbar) ─────── */}
      <div
        ref={finalContentRef}
        className="hero-final-content"
        style={{ opacity: 0 }}
      >
        {/* 3D tilt card wrapping the project image */}
        <CardContainer
          containerStyle={{ flex: 1 }}
          style={{ width: "100%", height: "100%" }}
        >
          <CardBody style={{ width: "100%", height: "100%" }}>
            <CardItem
              translateZ={60}
              style={{
                width: "100%",
                height: "60vh",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.18), 0 10px 30px rgba(0,0,0,0.10)",
                display: "block",
              }}
            >
              <img
                src="/project-1.png"
                alt="Klee Team"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </CardItem>

            {/* Floating glare layer */}
            <CardItem
              translateZ={80}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "24px",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 60%)",
                pointerEvents: "none",
              }}
            />
          </CardBody>
        </CardContainer>
        <div className="hero-final-text">
          <h1 className="hero-final-heading">
            Dijital <br />
            <CyclingWord /> <br />
            tasarlıyoruz.
          </h1>
        </div>
      </div>
    </section>
  );
}
