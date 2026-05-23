'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useIsTouch } from '../lib/useIsTouch';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

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

export default function FlowArt({ children, className, 'aria-label': ariaLabel = 'Story scroll' }) {
  const containerRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const isTouch = useIsTouch();
  const count = React.Children.count(children);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Touch: IntersectionObserver fade-in (no pin, no rotation)
  useEffect(() => {
    if (!isTouch || !containerRef.current) return;

    const sections = Array.from(
      containerRef.current.querySelectorAll('[data-flow-section]'),
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.dataset.flowVisible = 'true';
          }
        });
      },
      { threshold: 0.12 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isTouch, count]);

  // Desktop: GSAP pinned stacking + rotation (unchanged)
  useGSAP(
    () => {
      if (!containerRef.current || reducedMotion || isTouch) return;

      const sections = Array.from(
        containerRef.current.querySelectorAll('[data-flow-section]'),
      );
      if (sections.length === 0) return;

      const triggers = [];

      sections.forEach((section, i) => {
        gsap.set(section, { zIndex: i + 1 });

        const inner = section.querySelector('[data-flow-inner]');
        if (!inner) return;

        if (i > 0) {
          gsap.set(inner, { rotation: 30, transformOrigin: 'bottom left' });
          const tween = gsap.to(inner, {
            rotation: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'top 25%',
              scrub: true,
            },
          });
          if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
        }

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
    { scope: containerRef, dependencies: [reducedMotion, isTouch, count] },
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
