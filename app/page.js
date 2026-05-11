"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";

import Image from "next/image";
import KleeHeroAnimation from "./components/KleeHeroAnimation";
import ScrambleText from "./components/ScrambleText";
import GalleryModal from "./components/GalleryModal";

/* ================================================
   DATA
   ================================================ */
const PROJECT_TABS = ["PROJE 1", "PROJE 2", "PROJE 3", "PROJE 4", "PROJE 5"];

const PROJECTS_DATA = {
  "PROJE 1": [
    {
      image: "/project-1.png",
      tag: "E-Ticaret",
      tagClass: "tag-blue",
      title: "Luxe Commerce",
      desc: "Premium e-ticaret platformu — modern alışveriş deneyimi.",
    },
    {
      image: "/project-2.png",
      tag: "Mobil Uygulama",
      tagClass: "tag-green",
      title: "FitTrack",
      desc: "Sağlık & fitness takip uygulaması.",
    },
    {
      image: "/project-3.png",
      tag: "Emlak",
      tagClass: "tag-red",
      title: "Evora",
      desc: "Akıllı emlak arama platformu.",
    },
    {
      image: "/project-4.png",
      tag: "SaaS",
      tagClass: "tag-yellow",
      title: "DataPulse",
      desc: "Analitik dashboard çözümü.",
    },
    {
      image: "/project-5.png",
      tag: "Yemek Sipariş",
      tagClass: "tag-red",
      title: "TasteHub",
      desc: "Yemek sipariş & teslimat platformu.",
    },
  ],
  "PROJE 2": [
    {
      image: "/project-3.png",
      tag: "Web Tasarım",
      tagClass: "tag-red",
      title: "Artisan Studio",
      desc: "Kreatif ajans web sitesi tasarımı.",
    },
    {
      image: "/project-1.png",
      tag: "Dijital Pazarlama",
      tagClass: "tag-blue",
      title: "GrowthLab",
      desc: "SEO ve dijital büyüme platformu.",
    },
    {
      image: "/project-5.png",
      tag: "Sosyal Medya",
      tagClass: "tag-green",
      title: "Connekt",
      desc: "Sosyal medya yönetim aracı.",
    },
    {
      image: "/project-2.png",
      tag: "Fintech",
      tagClass: "tag-yellow",
      title: "PayFlow",
      desc: "Ödeme altyapısı ve yönetim paneli.",
    },
    {
      image: "/project-4.png",
      tag: "Eğitim",
      tagClass: "tag-blue",
      title: "EduVerse",
      desc: "Online eğitim platformu.",
    },
  ],
  "PROJE 3": [
    {
      image: "/project-4.png",
      tag: "Blockchain",
      tagClass: "tag-yellow",
      title: "ChainVault",
      desc: "Web3 cüzdan ve DeFi platformu.",
    },
    {
      image: "/project-2.png",
      tag: "Sağlık",
      tagClass: "tag-green",
      title: "MedConnect",
      desc: "Tele-tıp randevu sistemi.",
    },
    {
      image: "/project-1.png",
      tag: "E-Ticaret",
      tagClass: "tag-blue",
      title: "MarketPro",
      desc: "B2B pazar yeri çözümü.",
    },
    {
      image: "/project-5.png",
      tag: "Lojistik",
      tagClass: "tag-red",
      title: "RouteWise",
      desc: "Akıllı rota planlama sistemi.",
    },
    {
      image: "/project-3.png",
      tag: "IoT",
      tagClass: "tag-green",
      title: "SmartNest",
      desc: "Akıllı ev otomasyon paneli.",
    },
  ],
  "PROJE 4": [
    {
      image: "/project-5.png",
      tag: "Eğlence",
      tagClass: "tag-red",
      title: "StreamWave",
      desc: "İçerik yayın platformu.",
    },
    {
      image: "/project-3.png",
      tag: "Spor",
      tagClass: "tag-green",
      title: "GameDay",
      desc: "Canlı skor ve istatistik uygulaması.",
    },
    {
      image: "/project-4.png",
      tag: "CRM",
      tagClass: "tag-yellow",
      title: "ClientHub",
      desc: "Müşteri ilişkileri yönetimi.",
    },
    {
      image: "/project-1.png",
      tag: "Gayrimenkul",
      tagClass: "tag-blue",
      title: "PropTech",
      desc: "Gayrimenkul değerleme aracı.",
    },
    {
      image: "/project-2.png",
      tag: "Seyahat",
      tagClass: "tag-green",
      title: "Wanderlust",
      desc: "Seyahat planlama uygulaması.",
    },
  ],
  "PROJE 5": [
    {
      image: "/project-2.png",
      tag: "AI / ML",
      tagClass: "tag-green",
      title: "NeuralDesk",
      desc: "Yapay zeka destekli iş asistanı.",
    },
    {
      image: "/project-4.png",
      tag: "HR Tech",
      tagClass: "tag-yellow",
      title: "TeamForge",
      desc: "İnsan kaynakları yönetim sistemi.",
    },
    {
      image: "/project-5.png",
      tag: "Medya",
      tagClass: "tag-red",
      title: "PressBox",
      desc: "Dijital haber ve medya platformu.",
    },
    {
      image: "/project-1.png",
      tag: "Otomasyon",
      tagClass: "tag-blue",
      title: "FlowEngine",
      desc: "İş süreçleri otomasyon aracı.",
    },
    {
      image: "/project-3.png",
      tag: "Güvenlik",
      tagClass: "tag-red",
      title: "ShieldNet",
      desc: "Siber güvenlik izleme paneli.",
    },
  ],
};

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

const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
    />
  </svg>
);

/* ================================================
   NAVBAR COMPONENT
   ================================================ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = useCallback((e, targetId) => {
    e.preventDefault();
    setMobileOpen(false);
    
    if (targetId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
      <div className="navbar-inner">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg
            className="navbar-clover-logo"
            viewBox="0 0 100 100"
            width="32"
            height="32"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0, transformOrigin: "center center" }}
            aria-hidden="true"
          >
            <g transform="translate(50, 50)">
              <g fill="var(--ketchup-red)">
                <path
                  d="M 0 0 l -2.9 -2.64 C -13.2 -11.98 -20 -18.14 -20 -25.7 C -20 -31.86 -15.16 -36.7 -9 -36.7 C -5.52 -36.7 -2.18 -35.08 0 -32.52 C 2.18 -35.08 5.52 -36.7 9 -36.7 C 15.16 -36.7 20 -31.86 20 -25.7 C 20 -18.14 13.2 -11.98 2.9 -2.64 L 0 0 z"
                  transform="translate(-1, -1) rotate(-45)"
                />
              </g>
              <g fill="var(--sunshine-yellow)">
                <path
                  d="M 0 0 l -2.9 -2.64 C -13.2 -11.98 -20 -18.14 -20 -25.7 C -20 -31.86 -15.16 -36.7 -9 -36.7 C -5.52 -36.7 -2.18 -35.08 0 -32.52 C 2.18 -35.08 5.52 -36.7 9 -36.7 C 15.16 -36.7 20 -31.86 20 -25.7 C 20 -18.14 13.2 -11.98 2.9 -2.64 L 0 0 z"
                  transform="translate(1, -1) rotate(45)"
                />
              </g>
              <g fill="var(--sky-blue)">
                <path
                  d="M 0 0 l -2.9 -2.64 C -13.2 -11.98 -20 -18.14 -20 -25.7 C -20 -31.86 -15.16 -36.7 -9 -36.7 C -5.52 -36.7 -2.18 -35.08 0 -32.52 C 2.18 -35.08 5.52 -36.7 9 -36.7 C 15.16 -36.7 20 -31.86 20 -25.7 C 20 -18.14 13.2 -11.98 2.9 -2.64 L 0 0 z"
                  transform="translate(-1, 1) rotate(-135)"
                />
              </g>
              <g fill="var(--olive-green)">
                <path
                  d="M 0 0 l -2.9 -2.64 C -13.2 -11.98 -20 -18.14 -20 -25.7 C -20 -31.86 -15.16 -36.7 -9 -36.7 C -5.52 -36.7 -2.18 -35.08 0 -32.52 C 2.18 -35.08 5.52 -36.7 9 -36.7 C 15.16 -36.7 20 -31.86 20 -25.7 C 20 -18.14 13.2 -11.98 2.9 -2.64 L 0 0 z"
                  transform="translate(1, 1) rotate(135)"
                />
              </g>
            </g>
          </svg>
          <a
            href="#home"
            className="navbar-brand"
            onClick={(e) => handleNavClick(e, "home")}
          >
            Klee
          </a>
        </div>
        <button
          className="navbar-menu-btn"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>
        <div className={`navbar-links ${mobileOpen ? "open" : ""}`}>
          <a
            href="#home"
            className="navbar-link"
            onClick={(e) => handleNavClick(e, "home")}
          >
            ANA SAYFA
          </a>
          <a
            href="#projects"
            className="navbar-link"
            onClick={(e) => handleNavClick(e, "projects")}
          >
            PROJELER
          </a>
          <a
            href="#contact"
            className="navbar-link"
            onClick={(e) => handleNavClick(e, "contact")}
          >
            İLETİŞİM
          </a>
        </div>
      </div>
    </nav>
  );
}

// HeroSection is now handled by KleeHeroAnimation (GSAP scroll-triggered component)

/* ================================================
   PROJECTS SECTION
   ================================================ */
function ProjectsSection() {
  const [activeTab, setActiveTab] = useState(PROJECT_TABS[0]);
  const [fading, setFading] = useState(false);
  const [displayedProjects, setDisplayedProjects] = useState(
    PROJECTS_DATA[PROJECT_TABS[0]],
  );
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setFading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setDisplayedProjects(PROJECTS_DATA[tab]);
      setFading(false);
    }, 280);
  };

  return (
    <section className="projects" id="projects">
      <div className="container">
        <div className="projects-header fade-in-up">
          <h2 className="projects-title">Seçilmiş Çalışmalar</h2>
          <p className="projects-description">
            Stratejik düşünce ve yaratıcı mühendislikle hayata geçirdiğimiz
            projelerden bir seçki.
          </p>
        </div>

        <div className="project-tabs fade-in-up">
          {PROJECT_TABS.map((tab, index) => (
            <Fragment key={tab}>
              <button
                className={`project-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => handleTabChange(tab)}
              >
                <ScrambleText text={tab} speed={30} hoverOnly={true} />
              </button>
              {index < PROJECT_TABS.length - 1 && (
                <span className="project-tab-spacer" aria-hidden="true" />
              )}
            </Fragment>
          ))}
        </div>

        <div className={`project-grid ${fading ? "fade-out" : ""}`}>
          {displayedProjects.map((project, index) => (
            <div
              key={`${activeTab}-${index}`}
              className={`project-card fade-in-up stagger-${index + 1}`}
              onClick={() => {
                setGalleryIndex(index);
                setGalleryOpen(true);
              }}
            >
              <div className="project-card-image">
                <Image
                  src={project.image}
                  alt={project.title}
                  width={800}
                  height={500}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  priority={index < 2}
                />
              </div>
              {project.title === "Luxe Commerce" && (
                <div className="project-card-content">
                  <h3 className="project-card-title">
                    <ScrambleText
                      text={project.title}
                      speed={40}
                      delay={index * 100}
                    />
                  </h3>
                  <p className="project-card-desc">{project.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <GalleryModal
        isOpen={galleryOpen}
        images={displayedProjects}
        initialIndex={galleryIndex}
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
              <ScrambleText
                text="WHATSAPP'TAN İLETİŞİME GEÇİN"
                speed={40}
                hoverOnly={true}
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

  return (
    <>
      <Navbar />
      <main>
        <KleeHeroAnimation />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
