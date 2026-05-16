"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import KleeHeroAnimation from "./components/KleeHeroAnimation";
import { RandomLetterSwapPingPong } from "./components/RandomLetterSwap";
import GalleryModal from "./components/GalleryModal";
import ImageGallery from "./components/ImageGallery";

/* ================================================
   DATA
   ================================================ */
const PROJECTS_GALLERY = [
  {
    image: "/project-1.png",
    images: [
      "/project-1.png",
      "/project-1.png",
      "/project-1.png",
      "/project-1.png",
      "/project-1.png",
    ],
    tag: "E-Ticaret",
    tagClass: "tag-blue",
    title: "Luxe Commerce",
    desc: "Premium e-ticaret platformu — modern alışveriş deneyimi.",
  },
  {
    image: "/project-2.png",
    images: [
      "/project-2.png",
      "/project-2.png",
      "/project-2.png",
      "/project-2.png",
      "/project-2.png",
    ],
    tag: "Mobil Uygulama",
    tagClass: "tag-green",
    title: "FitTrack",
    desc: "Sağlık & fitness takip uygulaması.",
  },
  {
    image: "/project-3.png",
    images: [
      "/project-3.png",
      "/project-3.png",
      "/project-3.png",
      "/project-3.png",
      "/project-3.png",
    ],
    tag: "Emlak",
    tagClass: "tag-red",
    title: "Evora",
    desc: "Akıllı emlak arama platformu.",
  },
  {
    image: "/project-4.png",
    images: [
      "/project-4.png",
      "/project-4.png",
      "/project-4.png",
      "/project-4.png",
      "/project-4.png",
    ],
    tag: "SaaS",
    tagClass: "tag-yellow",
    title: "DataPulse",
    desc: "Analitik dashboard çözümü.",
  },
  {
    image: "/project-5.png",
    images: [
      "/project-5.png",
      "/project-5.png",
      "/project-5.png",
      "/project-5.png",
      "/project-5.png",
    ],
    tag: "Yemek Sipariş",
    tagClass: "tag-red",
    title: "TasteHub",
    desc: "Yemek sipariş & teslimat platformu.",
  },
];

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
    <header className="top-bar" id="top-bar">
      {/* Left: Hamburger menu trigger */}
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

      {/* Center: Klee branding */}
      <div className="top-bar-brand" id="top-bar-brand">
        {/* Hidden clover logo — hero clover animates here */}
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
        <span className="top-bar-klee-text">Klee</span>
      </div>

      {/* Right: empty spacer to balance the flex layout */}
      <div className="top-bar-right" aria-hidden="true" />
    </header>
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
          href="#contact"
          className="menu-overlay-link"
          onClick={(e) => handleNavClick(e, "contact")}
        >
          <span className="menu-overlay-link-num">03</span>
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

  useEffect(() => {
    let rafId = 0;
    let queued = false;
    const update = () => {
      queued = false;
      if (!barRef.current) return;
      // When hero handoff completes, snap bar to full
      if (document.body.dataset.heroComplete === "true") {
        barRef.current.style.transform = "scaleX(1)";
        return;
      }
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      barRef.current.style.transform = `scaleX(${pct})`;
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
    // React to hero-complete flag flips (handoff moment)
    const mo = new MutationObserver(onScroll);
    mo.observe(document.body, { attributes: true, attributeFilter: ["data-hero-complete"] });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mo.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="scroll-progress-indicator" aria-hidden="true">
      <div className="scroll-progress-track">
        <div ref={barRef} className="scroll-progress-bar" />
      </div>
      <span className="scroll-progress-label">aşağı kaydır</span>
    </div>
  );
}

// HeroSection is now handled by KleeHeroAnimation (GSAP scroll-triggered component)

/* ================================================
   PROJECTS SECTION
   ================================================ */
function ProjectsSection() {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryProjectIndex, setGalleryProjectIndex] = useState(0);

  const handleItemClick = useCallback((idx) => {
    setGalleryProjectIndex(idx);
    setGalleryOpen(true);
  }, []);

  const activeProject = PROJECTS_GALLERY[galleryProjectIndex] ?? PROJECTS_GALLERY[0];

  return (
    <section className="projects" id="projects">
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
        {/* Section header */}
        <div className="projects-header fade-in-up">
          <h2 className="projects-title">Seçilmiş Çalışmalar</h2>
          <p className="projects-description">
            Stratejik düşünce ve yaratıcı mühendislikle hayata geçirdiğimiz
            projelerden bir seçki.
          </p>
        </div>

        {/* Hover-expand image gallery */}
        <div className="fade-in-up">
          <ImageGallery
            items={PROJECTS_GALLERY}
            onItemClick={handleItemClick}
          />
        </div>
      </div>

      <GalleryModal
        isOpen={galleryOpen}
        images={activeProject.images}
        project={activeProject}
        initialIndex={0}
        onClose={() => setGalleryOpen(false)}
      />
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
          <div className="fade-in-up">
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

          <div className="contact-info fade-in-up">
            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <MailIcon />
                </div>
                <div>
                  <div className="contact-info-label">Email</div>
                  <div className="contact-info-value">hello@klee.io</div>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <PhoneIcon />
                </div>
                <div>
                  <div className="contact-info-label">Telefon</div>
                  <div className="contact-info-value">+90 00000000</div>
                </div>
              </div>

              <div className="contact-info-item">
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
          <a href="tel:+90" className="footer-link">
            Phone
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
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
