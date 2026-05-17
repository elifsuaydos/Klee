"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// ── Images ────────────────────────────────────────────────────────────────────
const STACK_IMAGES = [
  "/project-1.png",
  "/project-2.png",
  "/project-3.png",
  "/project-4.png",
  "/project-5.png",
];
const N = STACK_IMAGES.length;

// ── Card geometry ─────────────────────────────────────────────────────────────
const IMG_W = 202.5;
const IMG_H = 142.5;
// Direct child of <body> → root stacking context → no parent z-index to fight.
// 9050 = above hero content, below grain overlay (9998) and GalleryModal (9999).
const Z_CARD = 9050;

// ── Invisible grid ────────────────────────────────────────────────────────────
const COLS = 10;
const ROWS = 6;

const CELL_MAP = Array.from({ length: ROWS }, (_, row) =>
  Array.from({ length: COLS }, (_, col) => (col * 2 + row) % N),
);

// ── Timing ────────────────────────────────────────────────────────────────────
const FOLLOW_DUR = 0.07;
const FADE_OUT = 0.12;
const FADE_IN = 0.18;
const ENTER_DUR = 0.22;
const LEAVE_DUR = 0.16;

const BASE_STYLE = `
  position: fixed;
  pointer-events: none;
  width: ${IMG_W}px;
  height: ${IMG_H}px;
  object-fit: cover;
  opacity: 0;
  transform-origin: center center;
  box-shadow: 0 8px 28px rgba(0,0,0,0.32), 0 2px 6px rgba(0,0,0,0.14);
  will-change: transform, opacity;
  user-select: none;
`;

export default function HeroFinalCardStack({ sectionRef }) {
  const gridRef = useRef(null);
  const bufsRef = useRef([]); // two <img> buffers appended to <body>
  const frontRef = useRef(0);
  const isActiveRef = useRef(false);
  const cxRef = useRef(0);
  const cyRef = useRef(0);
  const prevCellRef = useRef(-1);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    // ── Buffers appended straight to <body> (root stacking context) ───────────
    [0, 1].forEach((i) => {
      const img = document.createElement("img");
      img.alt = "";
      img.draggable = false;
      img.style.cssText = BASE_STYLE + `z-index: ${Z_CARD + i};`;
      document.body.appendChild(img);
      bufsRef.current.push(img);
    });

    // ── Grid cells ────────────────────────────────────────────────────────────
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement("div");
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.dataset.imgIdx = CELL_MAP[r][c];
        grid.appendChild(cell);
      }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    const moveToPos = (animated) => {
      const target = {
        left: cxRef.current,
        top: cyRef.current,
      };
      bufsRef.current.forEach((img) => {
        if (animated) {
          gsap.to(img, {
            ...target,
            duration: FOLLOW_DUR,
            ease: "power1.out",
            overwrite: "auto",
          });
        } else {
          gsap.set(img, target);
        }
      });
    };

    const crossfadeTo = (src) => {
      const next = 1 - frontRef.current;
      const outImg = bufsRef.current[frontRef.current];
      const inImg = bufsRef.current[next];

      inImg.src = src;
      gsap.killTweensOf(inImg);
      gsap.killTweensOf(outImg);

      gsap.set(inImg, { zIndex: Z_CARD + 1 });
      gsap.set(outImg, { zIndex: Z_CARD });

      gsap.to(outImg, { opacity: 0, duration: FADE_OUT, ease: "power2.in" });
      gsap.fromTo(
        inImg,
        { opacity: 0 },
        { opacity: 1, duration: FADE_IN, ease: "power2.out" },
      );

      frontRef.current = next;
    };

    // ── Cell enter ────────────────────────────────────────────────────────────
    const handleCellEnter = (e) => {
      const cell = e.currentTarget;
      const imgIdx = parseInt(cell.dataset.imgIdx, 10);
      const flatIdx =
        parseInt(cell.dataset.row, 10) * COLS + parseInt(cell.dataset.col, 10);
      if (flatIdx === prevCellRef.current) return;
      prevCellRef.current = flatIdx;
      if (isActiveRef.current) crossfadeTo(STACK_IMAGES[imgIdx]);
    };

    // ── Grid show / move / hide ───────────────────────────────────────────────
    const handleGridEnter = (e) => {
      if (isActiveRef.current) return;
      isActiveRef.current = true;
      cxRef.current = e.clientX;
      cyRef.current = e.clientY;
      prevCellRef.current = -1;

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const imgIdx =
        el?.dataset?.imgIdx != null ? parseInt(el.dataset.imgIdx, 10) : 0;
      const front = bufsRef.current[frontRef.current];

      moveToPos(false);
      front.src = STACK_IMAGES[imgIdx];

      gsap.killTweensOf(front);
      gsap.killTweensOf(front);
      gsap.fromTo(
        front,
        { scale: 0.88, opacity: 0, y: 8 },
        { scale: 1, opacity: 1, y: 0, duration: ENTER_DUR, ease: "back.out(1.3)" },
      );
    };

    const handleGridMove = (e) => {
      if (!isActiveRef.current) return;
      cxRef.current = e.clientX;
      cyRef.current = e.clientY;
      moveToPos(true);
    };

    const handleGridLeave = () => {
      if (!isActiveRef.current) return;
      isActiveRef.current = false;
      prevCellRef.current = -1;
      bufsRef.current.forEach((img) => {
        gsap.killTweensOf(img);
        gsap.to(img, {
          opacity: 0,
          scale: 0.82,
          y: -8,
          duration: LEAVE_DUR,
          ease: "power2.in",
        });
      });
    };

    // ── Enable grid only during the final hero section ───────────────────────
    // data-hero-final="true"  → final content visible  → show grid
    // data-hero-complete="true" → hero fully done       → hide grid
    const syncGrid = () => {
      const isFinal    = document.body.dataset.heroFinal    === "true";
      const isComplete = document.body.dataset.heroComplete === "true";
      if (isFinal && !isComplete) {
        grid.style.pointerEvents = "auto";
      } else {
        grid.style.pointerEvents = "none";
        handleGridLeave();
      }
    };
    const mo = new MutationObserver(syncGrid);
    mo.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-hero-final", "data-hero-complete"],
    });

    // ── Wire events ───────────────────────────────────────────────────────────
    const cells = Array.from(grid.children);
    cells.forEach((cell) =>
      cell.addEventListener("mouseenter", handleCellEnter),
    );
    grid.addEventListener("mouseenter", handleGridEnter);
    grid.addEventListener("mousemove", handleGridMove);
    grid.addEventListener("mouseleave", handleGridLeave);

    return () => {
      mo.disconnect();
      cells.forEach((cell) =>
        cell.removeEventListener("mouseenter", handleCellEnter),
      );
      grid.removeEventListener("mouseenter", handleGridEnter);
      grid.removeEventListener("mousemove", handleGridMove);
      grid.removeEventListener("mouseleave", handleGridLeave);
      bufsRef.current.forEach((img) => img.remove());
      bufsRef.current = [];
      grid.innerHTML = "";
    };
  }, [sectionRef]);

  return (
    // Invisible 10×6 hover-detection grid (position:fixed, z-index:5)
    <div
      ref={gridRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        zIndex: 5,
        pointerEvents: "none",
      }}
    />
  );
}
