'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

// ─────────────────────────────────────────────────────────────────────────────
// FlowSection — one stacking card
// ─────────────────────────────────────────────────────────────────────────────
export function FlowSection({ className, style = {}, children, 'aria-label': ariaLabel }) {
  return (
    <section
      data-flow-section
      aria-label={ariaLabel}
      className={cx('klee-flow-section', className)}
    >
      <div
        data-flow-inner
        className="klee-flow-inner"
        style={{ transformOrigin: 'bottom left', ...style }}
      >
        {children}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FlowArt — stacking cards container
//
// Animation (matches the demo component):
//   • Each section except the last is PINNED (pin: true, pinSpacing: false).
//     GSAP keeps it in place while the next section scrolls up over it.
//   • Each section except the first starts at rotation: 30° (bottom-left origin)
//     and rotates to 0° as it scrolls from the viewport bottom to 25% from the top.
//   • z-index 1..N ensures later cards visually stack on top of earlier ones.
// ─────────────────────────────────────────────────────────────────────────────
export default function FlowArt({ children, className, 'aria-label': ariaLabel = 'Story scroll' }) {
  const containerRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // React.Children.count is stable and correctly counts JSX children
  const count = React.Children.count(children);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current || reducedMotion) return;

      const sections = Array.from(
        containerRef.current.querySelectorAll('[data-flow-section]'),
      );
      if (sections.length === 0) return;

      const triggers = [];

      sections.forEach((section, i) => {
        // Stack order: each card sits on top of the one before it
        gsap.set(section, { zIndex: i + 1 });

        const inner = section.querySelector('[data-flow-inner]');
        if (!inner) return;

        // ── Rotation entrance animation (cards 2..N) ────────────────────
        // Mirrors demo: start tilted 30° from bottom-left, straighten to 0°
        // as the card rises from the viewport bottom to 25% from the top.
        if (i > 0) {
          gsap.set(inner, { rotation: 30, transformOrigin: 'bottom left' });
          const tween = gsap.to(inner, {
            rotation: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',  // section top enters viewport from below
              end: 'top 25%',       // section top is 25% down from viewport top
              scrub: true,
            },
          });
          if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
        }

        // ── Pin all cards except the last ────────────────────────────────
        // Mirrors demo: each card stays fixed while the next card scrolls up.
        // pinSpacing: false keeps the next card's DOM position tight against
        // the pinned card so the rotation trigger fires at the right scroll value.
        if (i < sections.length - 1) {
          triggers.push(
            ScrollTrigger.create({
              trigger: section,
              start: 'bottom bottom',
              end: 'bottom top',
              pin: true,
              pinSpacing: false,
            }),
          );
        }
      });

      ScrollTrigger.refresh();

      return () => {
        triggers.forEach((t) => t.kill());
      };
    },
    { scope: containerRef, dependencies: [reducedMotion, count] },
  );

  return (
    <div
      ref={containerRef}
      aria-label={ariaLabel}
      className={cx('klee-flow-art', className)}
    >
      {children}
    </div>
  );
}
