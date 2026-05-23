"use client";

import Image from "next/image";

export default function ImageGallery({ items, onItemClick }) {
  return (
    <div className="klee-gallery" role="list">
      {items.map((item, idx) => (
        <div
          key={`${item.title}-${idx}`}
          role="listitem"
          tabIndex={0}
          aria-label={`${item.title} — Galeriyi aç`}
          className={`klee-gallery-item${item.featured ? ` is-featured is-${item.tagClass}` : ""}`}
          data-featured={item.featured ? "true" : "false"}
          onClick={() => onItemClick?.(idx)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onItemClick?.(idx);
            }
          }}
        >
          <div className="klee-gallery-item-img">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 767px) 92vw, 22vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
              priority={idx < 2}
            />
          </div>
          <div className="klee-gallery-item-overlay" aria-hidden="true">
            <span className={`klee-gallery-item-tag ${item.tagClass}`}>
              — {item.tag}
            </span>
            <p className="klee-gallery-item-title">{item.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
