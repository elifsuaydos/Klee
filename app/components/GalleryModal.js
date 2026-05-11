"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

export default function GalleryModal({ isOpen, images, initialIndex, onClose }) {
  const scrollContainerRef = useRef(null);

  const scrollToIndex = (index) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const itemWidth = container.clientWidth;
    container.scrollTo({ left: itemWidth * index, behavior: "smooth" });
  };

  const handlePrev = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const itemWidth = container.clientWidth;
    const currentIndex = Math.round(container.scrollLeft / itemWidth);
    const nextIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(nextIndex);
  };

  const handleNext = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const itemWidth = container.clientWidth;
    const currentIndex = Math.round(container.scrollLeft / itemWidth);
    const nextIndex = Math.min(images.length - 1, currentIndex + 1);
    scrollToIndex(nextIndex);
  };

  // When modal opens, scroll to the correct initial index
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Use setTimeout to ensure DOM has updated and layout is calculated
      setTimeout(() => {
        const itemWidth = container.clientWidth;
        container.scrollTo({
          left: itemWidth * initialIndex,
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

  if (!isOpen) return null;

  return (
    <div className="gallery-modal-overlay">
      <button className="gallery-nav gallery-nav-left" onClick={handlePrev} aria-label="Previous image">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button className="gallery-nav gallery-nav-right" onClick={handleNext} aria-label="Next image">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5L15.75 12l-7.5 7.5" />
        </svg>
      </button>
      <button className="gallery-modal-close" onClick={onClose} aria-label="Close Gallery">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div className="gallery-modal-scroll" ref={scrollContainerRef}>
        {images.map((img, idx) => (
          <div key={idx} className="gallery-modal-slide">
            <Image
              src={img.image}
              alt={`Gallery Image ${idx + 1}`}
              fill
              style={{ objectFit: "contain", padding: "80px" }}
              sizes="100vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
