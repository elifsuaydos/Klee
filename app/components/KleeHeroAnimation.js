"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

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

  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);
  const finalContentRef = useRef(null);

  const redPetalRef = useRef(null);
  const yellowPetalRef = useRef(null);
  const bluePetalRef = useRef(null);
  const greenPetalRef = useRef(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const clover = cloverRef.current;

      const navbar = document.querySelector("#navbar");
      if (navbar) {
        gsap.set(navbar, { opacity: 0, pointerEvents: "none" });
      }

      gsap.set(clover, { scale: 0.18, x: 0, y: 0, opacity: 1, rotation: 0 });

      const isMobile = () => section.clientWidth < 768;
      const isLandscape = () =>
        section.clientWidth > section.clientHeight && section.clientHeight < 500;

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
        else if (isMobile()) mult = 0.40;
        else mult = 0.50;
        return side === "left" ? -(section.clientWidth * mult) : section.clientWidth * mult;
      };
      const cY = (side) => {
        let mult;
        if (isLandscape()) mult = 0.36;
        else if (isMobile()) mult = 0.42;
        else mult = 0.48;
        return side === "top" ? -(section.clientHeight * mult) : section.clientHeight * mult;
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
        },
      });

      // ── Phase 0: Grow at center (speed unchanged) ─────────────────────
      master.to(clover, {
        scale: centerScale,
        duration: 0.8,
        ease: "power2.out",
      }, "grow");

      // ── Step 1: Top-left — Red / TILSIM ───────────────────────────────
      master.to(clover, {
        x: () => cX("left"),
        y: () => cY("top"),
        scale: () => cornerScale(),
        rotation: 540,
        duration: 3,
        ease: "power2.inOut",
      }, "step1");
      master.to(
        step1Ref.current.querySelectorAll(".char"),
        { opacity: 1, y: 0, duration: 0.9, stagger: { amount: 0.45 }, ease: "power2.out" },
        "step1+=1.2"
      );
      master.to(
        step1Ref.current.querySelector(".step-desc"),
        { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
        "step1+=1.5"
      );
      master.to({}, { duration: 1.5 }, "step1-hold");
      master.to([yp, bp, gp], { opacity: 0, duration: 0.35, ease: "power2.in" }, "step1-hold");
      master.to([yp, bp, gp], { opacity: 0.92, duration: 0.35, ease: "power2.out" }, "step1-hold+=1.15");

      // ── Transition 1→2 ───────────────────────────────────────────────
      master.to(
        step1Ref.current.querySelectorAll(".char"),
        { opacity: 0, y: -40, duration: 0.75, stagger: { amount: 0.3 }, ease: "power2.in" },
        "trans1"
      );
      master.to(
        step1Ref.current.querySelector(".step-desc"),
        { opacity: 0, y: -20, duration: 0.75, ease: "power2.in" },
        "trans1"
      );

      // ── Step 2: Bottom-right — Green / VİZYON ────────────────────────
      master.to(clover, {
        x: () => cX("right"),
        y: () => cY("bottom"),
        scale: () => cornerScale(),
        rotation: 900,
        duration: 3,
        ease: "power2.inOut",
      }, "step2");
      master.to(
        step2Ref.current.querySelectorAll(".char"),
        { opacity: 1, y: 0, duration: 0.9, stagger: { amount: 0.45 }, ease: "power2.out" },
        "step2+=1.2"
      );
      master.to(
        step2Ref.current.querySelector(".step-desc"),
        { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
        "step2+=1.5"
      );
      master.to({}, { duration: 1.5 }, "step2-hold");
      master.to([rp, yp, bp], { opacity: 0, duration: 0.35, ease: "power2.in" }, "step2-hold");
      master.to([rp, yp, bp], { opacity: 0.92, duration: 0.35, ease: "power2.out" }, "step2-hold+=1.15");

      // ── Transition 2→3 ───────────────────────────────────────────────
      master.to(
        step2Ref.current.querySelectorAll(".char"),
        { opacity: 0, y: -40, duration: 0.75, stagger: { amount: 0.3 }, ease: "power2.in" },
        "trans2"
      );
      master.to(
        step2Ref.current.querySelector(".step-desc"),
        { opacity: 0, y: -20, duration: 0.75, ease: "power2.in" },
        "trans2"
      );

      // ── Step 3: Bottom-left — Blue / TUTKU ───────────────────────────
      master.to(clover, {
        x: () => cX("left"),
        y: () => cY("bottom"),
        scale: () => cornerScale(),
        rotation: 1260,
        duration: 3,
        ease: "power2.inOut",
      }, "step3");
      master.to(
        step3Ref.current.querySelectorAll(".char"),
        { opacity: 1, y: 0, duration: 0.9, stagger: { amount: 0.45 }, ease: "power2.out" },
        "step3+=1.2"
      );
      master.to(
        step3Ref.current.querySelector(".step-desc"),
        { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
        "step3+=1.5"
      );
      master.to({}, { duration: 1.5 }, "step3-hold");
      master.to([rp, yp, gp], { opacity: 0, duration: 0.35, ease: "power2.in" }, "step3-hold");
      master.to([rp, yp, gp], { opacity: 0.92, duration: 0.35, ease: "power2.out" }, "step3-hold+=1.15");

      // ── Transition 3→4 ───────────────────────────────────────────────
      master.to(
        step3Ref.current.querySelectorAll(".char"),
        { opacity: 0, y: -40, duration: 0.75, stagger: { amount: 0.3 }, ease: "power2.in" },
        "trans3"
      );
      master.to(
        step3Ref.current.querySelector(".step-desc"),
        { opacity: 0, y: -20, duration: 0.75, ease: "power2.in" },
        "trans3"
      );

      // ── Step 4: Top-right — Yellow / KIVILCIM ────────────────────────
      master.to(clover, {
        x: () => cX("right"),
        y: () => cY("top"),
        scale: () => cornerScale(),
        rotation: 1620,
        duration: 3,
        ease: "power2.inOut",
      }, "step4");
      master.to(
        step4Ref.current.querySelectorAll(".char"),
        { opacity: 1, y: 0, duration: 0.9, stagger: { amount: 0.45 }, ease: "power2.out" },
        "step4+=1.2"
      );
      master.to(
        step4Ref.current.querySelector(".step-desc"),
        { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
        "step4+=1.5"
      );
      master.to({}, { duration: 1.5 }, "step4-hold");
      master.to([rp, bp, gp], { opacity: 0, duration: 0.35, ease: "power2.in" }, "step4-hold");
      master.to([rp, bp, gp], { opacity: 0.92, duration: 0.35, ease: "power2.out" }, "step4-hold+=1.15");

      // ── Phase 5: Converge to navbar logo (speed unchanged) ────────────
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
        { opacity: 0, y: -40, duration: 0.2, stagger: { amount: 0.1 }, ease: "power2.in" },
        "converge"
      );
      master.to(
        step4Ref.current.querySelector(".step-desc"),
        { opacity: 0, y: -20, duration: 0.2, ease: "power2.in" },
        "converge"
      );
      master.to(clover, {
        x: getNavX,
        y: getNavY,
        scale: 32 / 280,
        rotation: 1980,
        duration: 2.5,
        ease: "power2.inOut",
      }, "converge");
      master.fromTo(
        finalContentRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        "converge+=1.8"
      );

      // ── Phase 6: Handoff ──────────────────────────────────────────────
      master.to(clover, { opacity: 0, duration: 0.05 }, "handoff");
      if (navLogoNode) {
        master.to(navLogoNode, { opacity: 1, duration: 0.05 }, "handoff");
      }
      if (navbar) {
        master.to(
          navbar,
          { opacity: 1, pointerEvents: "auto", duration: 0.1 },
          "handoff"
        );
      }
    },
    { scope: sectionRef }
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
          <div className="step-desc step-desc--right" style={{ opacity: 0, transform: "translateY(20px)" }}>
            Klee ile çalışanların yakalayacağı o eşsiz dijital başarı şansı.
          </div>
        </div>

        {/* Step 2: VİZYON — keyword bottom-right, desc bottom-left */}
        <div ref={step2Ref} style={{ position: "absolute", inset: 0 }}>
          <h2 className="hero-keyword" style={{ bottom: "10vh", right: "5vw" }}>
            <SplitTextChars text="VİZYON" />
          </h2>
          <div className="step-desc step-desc--left" style={{ opacity: 0, transform: "translateY(20px)" }}>
            Müşterinin hayali ve Klee&apos;nin tasarım gücü.
          </div>
        </div>

        {/* Step 3: TUTKU — keyword bottom-left, desc bottom-right */}
        <div ref={step3Ref} style={{ position: "absolute", inset: 0 }}>
          <h2 className="hero-keyword" style={{ bottom: "10vh", left: "5vw" }}>
            <SplitTextChars text="TUTKU" />
          </h2>
          <div className="step-desc step-desc--right" style={{ opacity: 0, transform: "translateY(20px)" }}>
            Kodlamaya ve detaylara verilen önem.
          </div>
        </div>

        {/* Step 4: KIVILCIM — keyword top-right, desc bottom-left */}
        <div ref={step4Ref} style={{ position: "absolute", inset: 0 }}>
          <h2 className="hero-keyword" style={{ top: "10vh", right: "5vw" }}>
            <SplitTextChars text="KIVILCIM" />
          </h2>
          <div className="step-desc step-desc--left" style={{ opacity: 0, transform: "translateY(20px)" }}>
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
        <div className="hero-final-image">
          <img
            src="/project-1.png"
            alt="Klee Team"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div className="hero-final-text">
          <h1 className="hero-final-heading">
            Dijital <br /> deneyimler <br /> tasarlıyoruz.
          </h1>
        </div>
      </div>
    </section>
  );
}
