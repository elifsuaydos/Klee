"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { RandomLetterSwapPingPong } from "./RandomLetterSwap";

export default function GalleryModal({
  isOpen,
  images,
  project,
  initialIndex,
  onClose,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);

  const goTo = useCallback(
    (idx) => setCurrentIndex(Math.max(0, Math.min(images.length - 1, idx))),
    [images.length],
  );

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex || 0);
      setInfoPanelOpen(false);
    }
  }, [isOpen, initialIndex]);

  // Body scroll lock + gallery-open flag (hides scroll progress)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.dataset.galleryOpen = "true";
    } else {
      document.body.style.overflow = "";
      delete document.body.dataset.galleryOpen;
    }
    return () => {
      document.body.style.overflow = "";
      delete document.body.dataset.galleryOpen;
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        if (infoPanelOpen) setInfoPanelOpen(false);
        else onClose();
      }
      if (e.key === "ArrowLeft") goTo(currentIndex - 1);
      if (e.key === "ArrowRight") goTo(currentIndex + 1);
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, infoPanelOpen, currentIndex, onClose, goTo]);

  if (!isOpen) return null;

  const projectInfo = {
    title: project?.title || "Proje Başlığı",
    services: project?.tag || "Web Tasarım, Geliştirme",
    team: "Klee Studio",
    description:
      project?.desc ||
      "Bu proje, müşterimizin dijital varlığını güçlendirmek amacıyla tasarlanmış premium bir web deneyimidir.",
  };

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <div
      className="gallery-immersive-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={projectInfo.title}
    >
      {/* Single full-screen image — no scrolling */}
      <div className="gallery-immersive-stage">
        {images.map((src, idx) => (
          <div
            key={idx}
            className={`gallery-immersive-frame ${idx === currentIndex ? "active" : ""}`}
            aria-hidden={idx !== currentIndex}
          >
            <Image
              src={src}
              alt={`${projectInfo.title} — görsel ${idx + 1}`}
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
          className="gallery-arrow gallery-arrow--next"
          onClick={() => goTo(currentIndex + 1)}
          aria-label="Sonraki görsel"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Bottom bar: back | thumbnails | info */}
      <div className="gallery-bottom-bar" onClick={(e) => e.stopPropagation()}>
        <button
          className="gallery-back-btn"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label="Geri dön"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <RandomLetterSwapPingPong label="Geri" staggerDuration={0.022} />
        </button>

        <div className="gallery-thumbnail-strip">
          {images.map((src, idx) => (
            <button
              key={idx}
              className={`gallery-thumbnail ${currentIndex === idx ? "active" : ""}`}
              onClick={() => goTo(idx)}
              aria-label={`${projectInfo.title} ${idx + 1}`}
            >
              <Image
                src={src}
                alt={`${projectInfo.title} küçük resim ${idx + 1}`}
                fill
                style={{ objectFit: "cover" }}
                sizes="56px"
              />
            </button>
          ))}
        </div>

        <button
          className={`gallery-info-btn ${infoPanelOpen ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); setInfoPanelOpen((v) => !v); }}
          aria-label="Proje bilgisi"
          aria-expanded={infoPanelOpen}
        >
          <RandomLetterSwapPingPong label="Bilgi" staggerDuration={0.018} />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
            <path d="M13 16h-1v-4h-1m1-4h.01" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </button>
      </div>

      {/* Right slide-out: Project info panel */}
      <aside
        className={`gallery-info-panel ${infoPanelOpen ? "open" : ""}`}
        aria-label="Proje bilgisi paneli"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="gallery-info-panel-close"
          onClick={() => setInfoPanelOpen(false)}
          aria-label="Paneli kapat"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="gallery-info-panel-content">
          <p className="gallery-info-panel-eyebrow">Proje</p>
          <h2 className="gallery-info-panel-title">{projectInfo.title}</h2>

          <div className="gallery-info-panel-section">
            <h3 className="gallery-info-panel-label">Hizmetler</h3>
            <p className="gallery-info-panel-value">{projectInfo.services}</p>
          </div>

          <div className="gallery-info-panel-section">
            <h3 className="gallery-info-panel-label">Ekip</h3>
            <p className="gallery-info-panel-value">{projectInfo.team}</p>
          </div>

          <div className="gallery-info-panel-section gallery-info-panel-desc">
            <p>{projectInfo.description}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
