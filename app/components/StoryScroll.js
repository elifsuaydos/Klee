'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

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

function countChildren(children) {
  let count = 0;
  const traverse = (child) => {
    if (!child) return;
    if (Array.isArray(child)) { child.forEach(traverse); return; }
    count++;
  };
  traverse(children);
  return count;
}

export default function FlowArt({ children, className, 'aria-label': ariaLabel = 'Story scroll' }) {
  const containerRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);

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
    { scope: containerRef, dependencies: [reducedMotion] },
  );

  return (
    <main
      ref={containerRef}
      aria-label={ariaLabel}
      className={cx('klee-flow-art', className)}
    >
      {children}
    </main>
  );
}
