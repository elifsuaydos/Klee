"use client";

import { useRef, useCallback } from "react";
import gsap from "gsap";

/* ─────────────────────────────────────────────
   Shared styles (vanilla, no Tailwind)
───────────────────────────────────────────── */
const WRAPPER_STYLE = {
  display: "inline-flex",
  alignItems: "center",
  position: "relative",
};

const LETTER_CELL_STYLE = {
  display: "inline-block",
  position: "relative",
  overflow: "hidden",
  whiteSpace: "pre",
  verticalAlign: "top",
  lineHeight: "inherit",
};

const PRIMARY_STYLE = {
  display: "inline-block",
  position: "relative",
  transform: "translateY(0)",
};

/* ─────────────────────────────────────────────
   Shared hook
───────────────────────────────────────────── */
function useLetterSwap({ label, reverse, duration, stagger, pingPong }) {
  const scopeRef = useRef(null);
  const blockedRef = useRef(false);

  // Stable shuffled order per mount
  const shuffledRef = useRef(
    Array.from({ length: label.length }, (_, i) => i)
      .sort(() => Math.random() - 0.5)
  );

  const animateIn = useCallback(() => {
    if (blockedRef.current) return;
    blockedRef.current = true;

    const el = scopeRef.current;
    if (!el) return;

    const shuffled = shuffledRef.current;

    shuffled.forEach((idx, order) => {
      const delay = order * stagger;
      const primary = el.querySelector(`.rls-p-${idx}`);
      const secondary = el.querySelector(`.rls-s-${idx}`);
      if (!primary || !secondary) return;

      // Primary slides out
      gsap.to(primary, {
        y: reverse ? "100%" : "-100%",
        duration,
        delay,
        ease: "power2.inOut",
        onComplete: () => {
          if (!pingPong) {
            gsap.set(primary, { y: 0 });
          }
        },
      });

      // Secondary slides in
      gsap.to(secondary, {
        top: "0%",
        duration,
        delay,
        ease: "power2.inOut",
        onComplete: () => {
          if (!pingPong) {
            gsap.set(secondary, { top: reverse ? "-100%" : "100%" });
          }
          if (order === shuffled.length - 1) {
            blockedRef.current = false;
          }
        },
      });
    });
  }, [label, reverse, duration, stagger, pingPong]);

  const animateOut = useCallback(() => {
    if (!pingPong) return;
    blockedRef.current = false;

    const el = scopeRef.current;
    if (!el) return;

    const shuffled = shuffledRef.current;

    shuffled.forEach((idx, order) => {
      const delay = order * stagger;
      const primary = el.querySelector(`.rls-p-${idx}`);
      const secondary = el.querySelector(`.rls-s-${idx}`);
      if (!primary || !secondary) return;

      gsap.to(primary, { y: 0, duration, delay, ease: "power2.inOut" });
      gsap.to(secondary, {
        top: reverse ? "-100%" : "100%",
        duration,
        delay,
        ease: "power2.inOut",
      });
    });
  }, [reverse, duration, stagger, pingPong]);

  return { scopeRef, animateIn, animateOut };
}

/* ─────────────────────────────────────────────
   Letter spans
───────────────────────────────────────────── */
function LetterSpans({ label, reverse }) {
  return (
    <>
      {/* Screen-reader text */}
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
        {label}
      </span>

      {label.split("").map((char, i) => (
        <span key={i} style={LETTER_CELL_STYLE} aria-hidden="true">
          {/* Visible letter */}
          <span className={`rls-p-${i}`} style={PRIMARY_STYLE}>
            {char}
          </span>
          {/* Ghost letter */}
          <span
            className={`rls-s-${i}`}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: reverse ? "-100%" : "100%",
              display: "inline-block",
            }}
          >
            {char}
          </span>
        </span>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────
   PingPong — letters return on mouse-leave
   Use for: nav links, tabs, interactive labels
───────────────────────────────────────────── */
export function RandomLetterSwapPingPong({
  label,
  reverse = true,
  duration = 0.4,
  staggerDuration = 0.018,
  className = "",
  style,
  onClick,
}) {
  const { scopeRef, animateIn, animateOut } = useLetterSwap({
    label,
    reverse,
    duration,
    stagger: staggerDuration,
    pingPong: true,
  });

  return (
    <span
      ref={scopeRef}
      className={className}
      style={{ ...WRAPPER_STYLE, ...style }}
      onMouseEnter={animateIn}
      onMouseLeave={animateOut}
      onClick={onClick}
    >
      <LetterSpans label={label} reverse={reverse} />
    </span>
  );
}

/* ─────────────────────────────────────────────
   Forward — letters cycle once then reset
   Use for: CTAs, one-shot on-hover
───────────────────────────────────────────── */
export function RandomLetterSwapForward({
  label,
  reverse = true,
  duration = 0.35,
  staggerDuration = 0.015,
  className = "",
  style,
  onClick,
}) {
  const { scopeRef, animateIn } = useLetterSwap({
    label,
    reverse,
    duration,
    stagger: staggerDuration,
    pingPong: false,
  });

  return (
    <span
      ref={scopeRef}
      className={className}
      style={{ ...WRAPPER_STYLE, ...style }}
      onMouseEnter={animateIn}
      onClick={onClick}
    >
      <LetterSpans label={label} reverse={reverse} />
    </span>
  );
}

export default RandomLetterSwapPingPong;
