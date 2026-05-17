"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function LenisProvider({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    // Horizon ve projects sayfalarında Lenis kapalı
    if (pathname.startsWith("/horizon") || pathname.startsWith("/projects")) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    // GSAP ScrollTrigger proxy — Lenis scroll'u GSAP'a aktarır
    const scrollTriggerUpdate = () => ScrollTrigger.update();
    lenis.on("scroll", scrollTriggerUpdate);

    const tick = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick, undefined, false);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tick);
    };
  }, [pathname]);

  return children;
}
