"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const STACK_IMAGES = ["/project-3.png", "/project-1.png", "/project-4.png"];

const IMG_W = 240;
const IMG_H = 168;

// Fixed visual positions for the 3 slots in the stack
const SLOTS = [
  { dx: -24, dy: 18,  rotation: -12, z: 9100 }, // back-left
  { dx:  10, dy: -6,  rotation:   4, z: 9101 }, // middle
  { dx:  30, dy:  8,  rotation:  13, z: 9102 }, // front-right
];

const CYCLE_INTERVAL = 700; // ms between position swaps

export default function AboutCursorTrail({ targetClass }) {
  const containerRef   = useRef(null);
  const imgsRef        = useRef([]);
  const isActiveRef    = useRef(false);
  const lastCxRef      = useRef(0);
  const lastCyRef      = useRef(0);
  const intervalRef    = useRef(null);
  // slotOrder[i] = which SLOTS index image i is currently assigned to
  const slotOrderRef   = useRef([0, 1, 2]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Build the 3 image elements
    STACK_IMAGES.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.style.cssText = `
        position: fixed;
        pointer-events: none;
        width: ${IMG_W}px;
        height: ${IMG_H}px;
        object-fit: cover;
        border-radius: 0;
        opacity: 0;
        z-index: ${SLOTS[i].z};
        transform-origin: center center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.35);
        will-change: transform, opacity;
      `;
      container.appendChild(img);
      imgsRef.current.push(img);
    });

    // Place / animate images to their current slot positions
    const syncPositions = (animated = false) => {
      const cx = lastCxRef.current;
      const cy = lastCyRef.current;

      imgsRef.current.forEach((img, i) => {
        const slot = SLOTS[slotOrderRef.current[i]];
        const props = {
          left:     cx - IMG_W / 2 + slot.dx,
          top:      cy - IMG_H / 2 + slot.dy,
          rotation: slot.rotation,
          zIndex:   slot.z,
        };
        if (animated) {
          gsap.to(img, { ...props, duration: 0.45, ease: "power2.inOut" });
        } else {
          gsap.set(img, props);
        }
      });
    };

    // Rotate slot assignments by 1 position then animate
    const cyclePositions = () => {
      if (!isActiveRef.current) return;
      slotOrderRef.current = slotOrderRef.current.map((s) => (s + 1) % 3);
      syncPositions(true);
    };

    const handleEnter = (e) => {
      isActiveRef.current = true;
      lastCxRef.current = e.clientX;
      lastCyRef.current = e.clientY;
      slotOrderRef.current = [0, 1, 2];

      syncPositions(false);

      // Snap in with fast stagger
      imgsRef.current.forEach((img, i) => {
        gsap.killTweensOf(img);
        gsap.fromTo(
          img,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.12, ease: "power2.out", delay: i * 0.04 }
        );
      });

      // Start continuous position cycling
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(cyclePositions, CYCLE_INTERVAL);
    };

    const handleMove = (e) => {
      if (!isActiveRef.current) return;
      lastCxRef.current = e.clientX;
      lastCyRef.current = e.clientY;
      syncPositions(false); // follow cursor instantly
    };

    const handleLeave = () => {
      isActiveRef.current = false;
      clearInterval(intervalRef.current);

      imgsRef.current.forEach((img) => {
        gsap.killTweensOf(img);
        gsap.to(img, { opacity: 0, scale: 0.85, duration: 0.14, ease: "power2.in" });
      });
    };

    const targets = document.querySelectorAll(`.${targetClass}`);
    targets.forEach((el) => {
      el.addEventListener("mouseenter", handleEnter);
      el.addEventListener("mousemove",  handleMove);
      el.addEventListener("mouseleave", handleLeave);
    });

    return () => {
      clearInterval(intervalRef.current);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mousemove",  handleMove);
        el.removeEventListener("mouseleave", handleLeave);
      });
      imgsRef.current.forEach((img) => img.remove());
      imgsRef.current = [];
    };
  }, [targetClass]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9099 }}
    />
  );
}
