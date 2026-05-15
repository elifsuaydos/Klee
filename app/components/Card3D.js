"use client";

/**
 * Card3D — 3D tilt card system
 * Converted from aceternity-ui TypeScript → plain JS, inline styles (no Tailwind, no cn)
 *
 * Key improvement: transition duration is dynamic —
 *   • While tracking mouse → fast (80ms), feels responsive
 *   • On mouse leave   → slow (700ms cubic-bezier spring), no snap
 */

import React, { createContext, useState, useContext, useRef, useEffect } from "react";

const TRACK_TRANSITION  = "transform 0.08s linear";
const RETURN_TRANSITION = "transform 0.7s cubic-bezier(0.23, 1, 0.32, 1)";

/* ── Context ─────────────────────────────────────────── */
const MouseEnterContext = createContext(undefined);

/* ── CardContainer ───────────────────────────────────── */
export function CardContainer({ children, style, containerStyle }) {
  const containerRef = useRef(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    // Keep transition fast while tracking
    containerRef.current.style.transition = TRACK_TRANSITION;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 20;
    const y = (e.clientY - top - height / 2) / 20;
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  };

  const handleMouseEnter = () => setIsMouseEntered(true);

  const handleMouseLeave = () => {
    setIsMouseEntered(false);
    if (!containerRef.current) return;
    // Switch to slow easing BEFORE setting the neutral transform
    containerRef.current.style.transition = RETURN_TRANSITION;
    containerRef.current.style.transform = "rotateY(0deg) rotateX(0deg)";
  };

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        style={{
          perspective: "1000px",
          ...containerStyle,
        }}
      >
        <div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            position: "relative",
            transformStyle: "preserve-3d",
            transition: RETURN_TRANSITION,
            ...style,
          }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
}

/* ── CardBody ────────────────────────────────────────── */
export function CardBody({ children, style }) {
  return (
    <div
      style={{
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── CardItem ────────────────────────────────────────── */
export function CardItem({
  as: Tag = "div",
  children,
  style,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}) {
  const ref = useRef(null);
  const [isMouseEntered] = useMouseEnter();

  useEffect(() => {
    if (!ref.current) return;
    if (isMouseEntered) {
      // Entering: match the fast tracking speed
      ref.current.style.transition = TRACK_TRANSITION;
      ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
    } else {
      // Leaving: slow spring back
      ref.current.style.transition = RETURN_TRANSITION;
      ref.current.style.transform = "translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)";
    }
  }, [isMouseEntered, translateX, translateY, translateZ, rotateX, rotateY, rotateZ]);

  return (
    <Tag
      ref={ref}
      style={{
        transition: RETURN_TRANSITION,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ── Hook ────────────────────────────────────────────── */
export function useMouseEnter() {
  const context = useContext(MouseEnterContext);
  if (context === undefined) {
    throw new Error("useMouseEnter must be used inside a CardContainer");
  }
  return context;
}
