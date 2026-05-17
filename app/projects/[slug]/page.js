"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getProjectBySlug, PROJECTS_GALLERY } from "../../lib/projects";
import { RandomLetterSwapPingPong } from "../../components/RandomLetterSwap";
import "../../globals.css";

export default function ProjectPage({ params }) {
  const { slug } = use(params);
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return <GalleryView project={project} />;
}

function GalleryView({ project }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);

  const images = project.images;

  const goTo = useCallback(
    (idx) => setCurrentIndex(Math.max(0, Math.min(images.length - 1, idx))),
    [images.length],
  );

  const handleBack = useCallback(() => {
    if (window.history.length > 1) router.back();
    else router.push("/#projects");
  }, [router]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        if (infoPanelOpen) setInfoPanelOpen(false);
        else handleBack();
      }
      if (e.key === "ArrowLeft") goTo(currentIndex - 1);
      if (e.key === "ArrowRight") goTo(currentIndex + 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [infoPanelOpen, currentIndex, goTo, handleBack]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <main className="gallery-immersive-page">
      {/* Single full-screen image stage */}
      <div className="gallery-immersive-stage">
        {images.map((src, idx) => (
          <div
            key={idx}
            className={`gallery-immersive-frame ${idx === currentIndex ? "active" : ""}`}
            aria-hidden={idx !== currentIndex}
          >
            <Image
              src={src}
              alt={`${project.title} — görsel ${idx + 1}`}
              fill
              style={{ objectFit: "contain", objectPosition: "center" }}
              sizes="100vw"
              priority={idx === currentIndex}
            />
          </div>
        ))}
      </div>

      {/* Prev arrow */}
      {hasPrev && (
        <button
          type="button"
          className="gallery-arrow gallery-arrow--prev"
          onClick={() => goTo(currentIndex - 1)}
          aria-label="Önceki görsel"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Next arrow */}
      {hasNext && (
        <button
          type="button"
          className="gallery-arrow gallery-arrow--next"
          onClick={() => goTo(currentIndex + 1)}
          aria-label="Sonraki görsel"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Back button — bottom left */}
      <button
        type="button"
        className="gallery-back-btn"
        onClick={handleBack}
        aria-label="Geri dön"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <RandomLetterSwapPingPong label="Geri dön" staggerDuration={0.022} />
      </button>

      {/* Project info toggle — bottom right */}
      <button
        type="button"
        className={`gallery-info-btn ${infoPanelOpen ? "active" : ""}`}
        onClick={() => setInfoPanelOpen((v) => !v)}
        aria-label="Proje bilgisi"
        aria-expanded={infoPanelOpen}
      >
        <svg viewBox="0 0 18 11" width="18" height="11" fill="none" aria-hidden="true">
          <rect y="0" width="18" height="1.5" rx="0.75" fill="currentColor" />
          <rect y="4.75" width="18" height="1.5" rx="0.75" fill="currentColor" />
          <rect y="9.5" width="18" height="1.5" rx="0.75" fill="currentColor" />
        </svg>
        <RandomLetterSwapPingPong label="Proje bilgisi" staggerDuration={0.018} />
      </button>

      {/* Thumbnail strip — bottom center */}
      <div className="gallery-thumbnail-strip">
        {images.map((src, idx) => (
          <button
            key={idx}
            type="button"
            className={`gallery-thumbnail ${currentIndex === idx ? "active" : ""}`}
            onClick={() => goTo(idx)}
            aria-label={`${project.title} görsel ${idx + 1}`}
          >
            <Image
              src={src}
              alt={`${project.title} küçük resim ${idx + 1}`}
              fill
              style={{ objectFit: "cover" }}
              sizes="80px"
            />
          </button>
        ))}
      </div>

      {/* Right slide-out info panel */}
      <aside
        className={`gallery-info-panel ${infoPanelOpen ? "open" : ""}`}
        aria-label="Proje bilgisi paneli"
      >
        <button
          type="button"
          className="gallery-info-panel-close"
          onPointerDown={(e) => {
            e.stopPropagation();
            setInfoPanelOpen(false);
          }}
          aria-label="Paneli kapat"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="gallery-info-panel-content">
          <p className="gallery-info-panel-eyebrow">Proje</p>
          <h2 className="gallery-info-panel-title">{project.title}</h2>

          <div className="gallery-info-panel-section">
            <h3 className="gallery-info-panel-label">Hizmetler</h3>
            <p className="gallery-info-panel-value">{project.tag}</p>
          </div>

          <div className="gallery-info-panel-section">
            <h3 className="gallery-info-panel-label">Ekip</h3>
            <p className="gallery-info-panel-value">Klee Studio</p>
          </div>

          <div className="gallery-info-panel-section gallery-info-panel-desc">
            <p>{project.desc}</p>
          </div>
        </div>
      </aside>
    </main>
  );
}
