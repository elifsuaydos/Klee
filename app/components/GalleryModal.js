"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { RandomLetterSwapPingPong } from "./RandomLetterSwap";

export default function GalleryModal({
  isOpen,
  images,
  project,
  initialIndex,
  onClose,
}) {
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);

  const scrollToIndex = useCallback((index) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const itemWidth = container.clientWidth;
    container.scrollTo({ left: itemWidth * index, behavior: "smooth" });
    setCurrentIndex(index);
  }, []);

  const handleThumbnailClick = (index) => {
    scrollToIndex(index);
  };

  // Track current slide via scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const itemWidth = container.clientWidth;
      const idx = Math.round(container.scrollLeft / itemWidth);
      setCurrentIndex(idx);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  // When modal opens, scroll to the correct initial index
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      setCurrentIndex(initialIndex || 0);
      setInfoPanelOpen(false);
      setTimeout(() => {
        const itemWidth = container.clientWidth;
        container.scrollTo({
          left: itemWidth * (initialIndex || 0),
          behavior: "instant",
        });
      }, 50);
    }
  }, [isOpen, initialIndex]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ESC key closes panel or modal
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        if (infoPanelOpen) setInfoPanelOpen(false);
        else onClose();
      }
      if (e.key === "ArrowLeft") {
        scrollToIndex(Math.max(0, currentIndex - 1));
      }
      if (e.key === "ArrowRight") {
        scrollToIndex(Math.min(images.length - 1, currentIndex + 1));
      }
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, infoPanelOpen, currentIndex, images, onClose, scrollToIndex]);

  if (!isOpen) return null;

  const projectInfo = {
    title: project?.title || "Proje Başlığı",
    services: project?.tag || "Web Tasarım, Geliştirme",
    team: "Klee Studio",
    description:
      project?.desc ||
      "Bu proje, müşterimizin dijital varlığını güçlendirmek amacıyla tasarlanmış premium bir web deneyimidir. Modern tasarım prensipleri ve kullanıcı odaklı yaklaşımla hayata geçirildi.",
  };

  return (
    <div className="gallery-immersive-overlay" role="dialog" aria-modal="true">
      {/* Top-left: Back button */}
      <button
        className="gallery-back-btn"
        onClick={onClose}
        aria-label="Geri dön"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <RandomLetterSwapPingPong label="Geri dön" staggerDuration={0.022} />
      </button>

      {/* Top-right: Project info button */}
      <button
        className={`gallery-info-btn ${infoPanelOpen ? "active" : ""}`}
        onClick={() => setInfoPanelOpen((v) => !v)}
        aria-label="Proje bilgisi"
        aria-expanded={infoPanelOpen}
      >
        {/* Hamburger icon — matches the menu trigger's 3-bar style */}
        <svg
          viewBox="0 0 18 11"
          width="18"
          height="11"
          fill="none"
          aria-hidden="true"
        >
          <rect y="0" width="18" height="1.5" rx="0.75" fill="currentColor" />
          <rect y="4.75" width="18" height="1.5" rx="0.75" fill="currentColor" />
          <rect y="9.5" width="18" height="1.5" rx="0.75" fill="currentColor" />
        </svg>
        <RandomLetterSwapPingPong label="Proje bilgisi" staggerDuration={0.018} />
      </button>

      {/* Full-screen image/video display */}
      <div className="gallery-immersive-scroll" ref={scrollContainerRef}>
        {images.map((src, idx) => (
          <div key={idx} className="gallery-immersive-slide">
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

      {/* Bottom: Thumbnail strip */}
      <div className="gallery-thumbnail-strip">
        {images.map((src, idx) => (
          <button
            key={idx}
            className={`gallery-thumbnail ${currentIndex === idx ? "active" : ""}`}
            onClick={() => handleThumbnailClick(idx)}
            aria-label={`${projectInfo.title} ${idx + 1}`}
          >
            <Image
              src={src}
              alt={`${projectInfo.title} küçük resim ${idx + 1}`}
              fill
              style={{ objectFit: "cover" }}
              sizes="80px"
            />
          </button>
        ))}
      </div>

      {/* Right slide-out: Project info panel */}
      <aside
        className={`gallery-info-panel ${infoPanelOpen ? "open" : ""}`}
        aria-label="Proje bilgisi paneli"
      >
        {/* Close button overlapping gallery */}
        <button
          className="gallery-info-panel-close"
          onClick={() => setInfoPanelOpen(false)}
          aria-label="Paneli kapat"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
