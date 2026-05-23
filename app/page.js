"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import KleeHeroAnimation from "./components/KleeHeroAnimation";
import { RandomLetterSwapPingPong } from "./components/RandomLetterSwap";
import ImageGallery from "./components/ImageGallery";
import FlowArt, { FlowSection } from "./components/StoryScroll";
import { PROJECTS_GALLERY } from "./lib/projects";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* PROJECTS_GALLERY imported from ./lib/projects */

/* ================================================
   ICONS (inline SVG)
   ================================================ */
const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
    />
  </svg>
);

const LocationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
    />
  </svg>
);

const PhoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .319.216.694.825.576C20.565 21.796 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

/* ================================================
   PETAL PATH (same as KleeHeroAnimation.js)
   ================================================ */
const PETAL_PATH =
  "M 0 0 l -2.9 -2.64 C -13.2 -11.98 -20 -18.14 -20 -25.7 C -20 -31.86 -15.16 -36.7 -9 -36.7 C -5.52 -36.7 -2.18 -35.08 0 -32.52 C 2.18 -35.08 5.52 -36.7 9 -36.7 C 15.16 -36.7 20 -31.86 20 -25.7 C 20 -18.14 13.2 -11.98 2.9 -2.64 L 0 0 z";

/* ================================================
   MINIMALIST TOP BAR (Menu trigger + Klee branding)
   ================================================ */
function TopBar({ onMenuOpen }) {
  return (
    <>
      {/* Blend-mode header — only the menu trigger is inside so only it inverts */}
      <header className="top-bar" id="top-bar">
        <button
          className="menu-trigger"
          onClick={onMenuOpen}
          aria-label="Menüyü aç"
          id="menu-trigger-btn"
        >
          <span className="menu-trigger-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="menu-trigger-label">
            <RandomLetterSwapPingPong label="MENU" staggerDuration={0.025} />
          </span>
        </button>
      </header>

      {/* Clover only — no blend-mode, positioned at center-left of brand slot */}
      <div className="top-bar-brand" id="top-bar-brand">
        <svg
          className="navbar-clover-logo"
          viewBox="0 0 100 100"
          width="28"
          height="28"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0, transformOrigin: "center center" }}
          aria-hidden="true"
        >
          <g transform="translate(50, 50)">
            <g fill="var(--ketchup-red)">
              <path d={PETAL_PATH} transform="translate(-1, -1) rotate(-45)" />
            </g>
            <g fill="var(--sunshine-yellow)">
              <path d={PETAL_PATH} transform="translate(1, -1) rotate(45)" />
            </g>
            <g fill="var(--sky-blue)">
              <path d={PETAL_PATH} transform="translate(-1, 1) rotate(-135)" />
            </g>
            <g fill="var(--olive-green)">
              <path d={PETAL_PATH} transform="translate(1, 1) rotate(135)" />
            </g>
          </g>
        </svg>
      </div>

      {/* Klee text in its own fixed stacking-context root with mix-blend-mode — clover unaffected */}
      <div className="top-bar-klee-blend">
        <span className="top-bar-klee-text">Klee</span>
      </div>
    </>
  );
}

/* ================================================
   FULL-PAGE MENU OVERLAY
   ================================================ */
function MenuOverlay({ isOpen, onClose }) {
  const handleNavClick = useCallback(
    (e, targetId) => {
      e.preventDefault();
      onClose();
      setTimeout(() => {
        if (targetId === "home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 400); // wait for overlay close animation
    },
    [onClose],
  );

  // ESC key closes overlay
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <div
      className={`menu-overlay ${isOpen ? "open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Ana navigasyon menüsü"
    >
      {/* Close button */}
      <button
        className="menu-overlay-close"
        onClick={onClose}
        aria-label="Menüyü kapat"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="18"
          height="18"
          aria-hidden="true"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
        <span>
          <RandomLetterSwapPingPong label="KAPAT" staggerDuration={0.025} />
        </span>
      </button>

      <nav className="menu-overlay-nav" aria-label="Sayfa navigasyonu">
        <a
          href="#home"
          className="menu-overlay-link"
          onClick={(e) => handleNavClick(e, "home")}
        >
          <span className="menu-overlay-link-num">01</span>
          <span className="menu-overlay-link-label">
            <RandomLetterSwapPingPong
              label="Ana Sayfa"
              staggerDuration={0.025}
            />
          </span>
        </a>
        <a
          href="#projects"
          className="menu-overlay-link"
          onClick={(e) => handleNavClick(e, "projects")}
        >
          <span className="menu-overlay-link-num">02</span>
          <span className="menu-overlay-link-label">
            <RandomLetterSwapPingPong
              label="Projeler"
              staggerDuration={0.025}
            />
          </span>
        </a>
        <a
          href="#storybridge"
          className="menu-overlay-link"
          onClick={(e) => handleNavClick(e, "storybridge")}
        >
          <span className="menu-overlay-link-num">03</span>
          <span className="menu-overlay-link-label">
            <RandomLetterSwapPingPong
              label="Hakkımızda"
              staggerDuration={0.025}
            />
          </span>
        </a>
        <a
          href="#contact"
          className="menu-overlay-link"
          onClick={(e) => handleNavClick(e, "contact")}
        >
          <span className="menu-overlay-link-num">04</span>
          <span className="menu-overlay-link-label">
            <RandomLetterSwapPingPong
              label="İletişim"
              staggerDuration={0.025}
            />
          </span>
        </a>
      </nav>

      <div className="menu-overlay-footer">
        <span>Klee — Ankara, Türkiye</span>
        <span>hello@klee.io</span>
      </div>
    </div>
  );
}

/* ================================================
   SCROLL PROGRESS INDICATOR (bottom right) — rAF + scaleX, no React state
   ================================================ */
function ScrollProgress() {
  const barRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    let rafId = 0;
    let queued = false;
    const update = () => {
      queued = false;
      if (!barRef.current || !wrapRef.current) return;
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      // translateY(-50%) centers the thicker bar over the thin track
      barRef.current.style.transform = `translateY(-50%) scaleX(${pct})`;
      // fade out when within ~3% of the bottom
      wrapRef.current.style.opacity = pct >= 0.97 ? "0" : "1";
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        rafId = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={wrapRef} className="scroll-progress-indicator" aria-hidden="true">
      <div className="scroll-progress-track">
        <div ref={barRef} className="scroll-progress-bar" />
      </div>
      <span className="scroll-progress-label">aşağı kaydır</span>
    </div>
  );
}

// HeroSection is now handled by KleeHeroAnimation (GSAP scroll-triggered component)

/* ================================================
   STORY BRIDGE SECTIONS
   ================================================ */

function StoryBridgeAll() {
  return (
    <section id="storybridge">
      <FlowArt aria-label="Klee değerleri — TILSIM, VİZYON, Hakkımızda">
        {/* Panel 1 — HAKKIMIZDA1 / Yeşil */}
        <FlowSection
          aria-label="HAKKIMIZDA1"
          style={{ backgroundColor: "var(--olive-green)", color: "#fff" }}
        >
          <p className="story-panel-label">01 — HAKKIMIZDA</p>
          <hr className="story-panel-divider" />
          <div>
            <h2 className="story-panel-heading">
              Öğrenciler{" "}
              <br />
              Tarafından{" "}
              <br />
              Kurulan
            </h2>
          </div>
          <hr className="story-panel-divider" />
          <p className="story-panel-body-right">
            Sıradan olanı olağanüstüye dönüştüren şey detaylardır. Her piksel,
            her geçiş, her etkileşim — hepsinde anlam ve özen arıyoruz.
            Yaptığımız işin büyüsü bu dikkatten doğuyor.
          </p>
        </FlowSection>

        {/* Panel 2 — HAKKIMIZDA2 / Mavi */}
        <FlowSection
          aria-label="HAKKIMIZDA2"
          style={{ backgroundColor: "var(--sky-blue)", color: "#fff" }}
        >
          <p className="story-panel-label">02 — HAKKIMIZDA</p>
          <hr className="story-panel-divider" />
          <div>
            <h2 className="story-panel-heading">
              Hayallerimiz{" "}
              <br />
              Sayesinde{" "}
              <br />
              Şekillenen
            </h2>
          </div>
          <hr className="story-panel-divider" />
          <p className="story-panel-body-right">
            Kod satırlarının arasında büyüyen hayaller, en iyi ürünlerin
            tohumlarıdır...
          </p>
        </FlowSection>

        {/* Panel 3 — HAKKIMIZDA / Kırmızı */}
        <FlowSection
          aria-label="HAKKIMIZDA"
          style={{ backgroundColor: "var(--ketchup-red)", color: "#ffffff" }}
        >
          <p className="story-panel-label">03 — HAKKIMIZDA</p>
          <hr className="story-panel-divider" />
          <div>
            <h2 className="story-panel-heading">
              Ankara{" "}
              <br />
              Merkezli Bir{" "}
              <br />
              Oluşumuz
            </h2>
          </div>
          <hr className="story-panel-divider" />
          <p className="story-panel-body-right">
            Ankara&apos;dan dünyaya uzanan bağlantılarla, coğrafi sınırları aşan
            projeler üretiyoruz...
          </p>
        </FlowSection>
      </FlowArt>
    </section>
  );
}

/* ================================================
   PROJECTS SECTION
   ================================================ */
function ProjectsSection() {
  const sectionRef = useRef(null);
  const router = useRouter();

  useGSAP(
    () => {
      // Dwell pin feels jarring on touch — skip it on mobile
      if (window.innerWidth < 768) return;
      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=500",
        pin: true,
        pinSpacing: true,
      });
      return () => trigger.kill();
    },
    { scope: sectionRef },
  );

  const handleItemClick = useCallback(
    (idx) => {
      router.push(`/projects/${PROJECTS_GALLERY[idx].slug}`);
    },
    [router],
  );

  return (
    <section className="projects" id="projects" ref={sectionRef}>
      {/* Clover-shaped dark background */}
      <svg
        className="projects-clover-bg"
        viewBox="0 0 200 140"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        aria-hidden="true"
      >
        <path
          d="M 30 0 L 170 0 Q 200 0 200 30 L 200 110 Q 200 140 170 140 L 30 140 Q 0 140 0 110 L 0 30 Q 0 0 30 0 Z
             M 0 70 Q 30 50 30 0 L 0 0 Z
             M 200 70 Q 170 50 170 0 L 200 0 Z
             M 0 70 Q 30 90 30 140 L 0 140 Z
             M 200 70 Q 170 90 170 140 L 200 140 Z"
          fill="#000000"
          fillRule="evenodd"
        />
      </svg>

      <div className="container">
        <div className="projects-header">
          <h2 className="projects-title">Seçilmiş Çalışmalar</h2>
          <p className="projects-description">
            Stratejik düşünce ve yaratıcı mühendislikle hayata geçirdiğimiz
            projelerden bir seçki.
          </p>
        </div>
      </div>

      {/* Gallery breaks out of container to span full section width */}
      <div className="projects-gallery-full">
        <ImageGallery items={PROJECTS_GALLERY} onItemClick={handleItemClick} />
      </div>
    </section>
  );
}

/* ================================================
   CONTACT SECTION
   ================================================ */
function ContactSection() {
  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="contact-inner">
          <div>
            <h2 className="contact-header-title">
              Geleceği birlikte
              <br />
              inşa edelim.
            </h2>
            <p className="contact-header-desc">
              Bir sonraki projeniz için doğru ortağı arıyorsanız, size yardımcı
              olmaktan mutluluk duyarız. Hemen iletişime geçin.
            </p>
          </div>

          <div className="contact-info">
            <div className="contact-info-list">
              <div className="contact-info-item contact-info-item--email">
                <div className="contact-info-icon">
                  <MailIcon />
                </div>
                <div>
                  <div className="contact-info-label">Email</div>
                  <div className="contact-info-value">hello@klee.io</div>
                </div>
              </div>

              <div className="contact-info-item contact-info-item--phone">
                <div className="contact-info-icon">
                  <PhoneIcon />
                </div>
                <div>
                  <div className="contact-info-label">Telefon</div>
                  <div className="contact-info-value">+90 544 370 65 33</div>
                </div>
              </div>

              <div className="contact-info-item contact-info-item--location">
                <div className="contact-info-icon">
                  <LocationIcon />
                </div>
                <div>
                  <div className="contact-info-label">Konum</div>
                  <div className="contact-info-value">Ankara, Türkiye</div>
                  <div className="contact-info-sub">
                    Dünya genelinde uzaktan çalışmaya açığız.
                  </div>
                </div>
              </div>

              <div className="contact-info-item contact-info-item--github">
                <div className="contact-info-icon">
                  <GitHubIcon />
                </div>
                <div>
                  <div className="contact-info-label">GitHub</div>
                  <a
                    href="https://github.com/klee-agency"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-info-value contact-info-link"
                  >
                    github.com/klee-agency
                  </a>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-cta"
            >
              <RandomLetterSwapPingPong
                label="WHATSAPP'TAN İLETİŞİME GEÇİN"
                staggerDuration={0.012}
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================
   FOOTER
   ================================================ */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-brand">Klee</span>
        <div className="footer-links">
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Whatsapp
          </a>
          <a href="mailto:hello@klee.io" className="footer-link">
            Gmail
          </a>
          <a href="tel:05443706533" className="footer-link">
            Phone
          </a>
          <a
            href="https://github.com/klee-agency"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            GitHub
          </a>
        </div>
        <span className="footer-copy">© MADE WITH ❤️ BY ENGINEERS.</span>
      </div>
    </footer>
  );
}

/* ================================================
   MAIN PAGE
   ================================================ */
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  /* Intersection Observer for fade-in-up scroll animations */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    const elements = document.querySelectorAll(".fade-in-up");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Prevent body scroll when menu is open + expose menu-open flag for CSS
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      document.body.dataset.menuOpen = "true";
    } else {
      document.body.style.overflow = "";
      document.body.dataset.menuOpen = "false";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Dark theme when over .projects section (black bg) — top-bar text turns white
  useEffect(() => {
    const projects = document.querySelector(".projects");
    if (!projects) return;
    document.body.dataset.theme = "light";
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          document.body.dataset.theme = entry.isIntersecting ? "dark" : "light";
        });
      },
      { rootMargin: "-80px 0px -85% 0px", threshold: 0 },
    );
    observer.observe(projects);
    return () => {
      observer.disconnect();
      document.body.dataset.theme = "light";
    };
  }, []);

  return (
    <>
      {/* Minimalist top bar with menu trigger + centered Klee branding */}
      <TopBar onMenuOpen={() => setMenuOpen(true)} />

      {/* Full-page menu overlay */}
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Scroll progress indicator */}
      <ScrollProgress />

      <main>
        <KleeHeroAnimation />
        <ProjectsSection />
        <StoryBridgeAll />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
