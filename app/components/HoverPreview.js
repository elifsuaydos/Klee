'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export const PREVIEW_DATA = {
  tasarim: {
    image: '/project-1.png',
    title: 'UI/UX Tasarım',
    subtitle: 'Kullanıcı odaklı arayüz deneyimleri',
  },
  gelistirme: {
    image: '/project-2.png',
    title: 'Web Geliştirme',
    subtitle: 'Hızlı, ölçeklenebilir modern altyapı',
  },
  strateji: {
    image: '/project-3.png',
    title: 'Dijital Strateji',
    subtitle: 'Büyümeyi destekleyen ürün kararları',
  },
  marka: {
    image: '/project-4.png',
    title: 'Marka Kimliği',
    subtitle: 'Akılda kalan görsel dil ve ton',
  },
  animasyon: {
    image: '/project-5.png',
    title: 'Motion & Animasyon',
    subtitle: 'Harekete hayat katan mikro etkileşimler',
  },
  eticaret: {
    image: '/project-1.png',
    title: 'E-Ticaret',
    subtitle: 'Satışa odaklı alışveriş deneyimleri',
  },
};

const HoverPreviewContext = createContext(null);

function PreviewCard({ cardRef }) {
  const ctx = useContext(HoverPreviewContext);
  const { activeKey, position, isVisible } = ctx || {};
  const data = activeKey ? PREVIEW_DATA[activeKey] : null;

  if (!ctx || !data) return null;

  return (
    <div
      ref={cardRef}
      className={`klee-preview-card${isVisible ? ' is-visible' : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="klee-preview-card-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.image} alt={data.title} />
        <div className="klee-preview-card-title">{data.title}</div>
        <div className="klee-preview-card-subtitle">{data.subtitle}</div>
      </div>
    </div>
  );
}

export function HoverLink({ previewKey, children }) {
  const ctx = useContext(HoverPreviewContext);
  const { setActiveKey, setPosition, setIsVisible } = ctx || {};

  const updatePosition = useCallback((e) => {
    if (!setPosition) return;
    const cardWidth = 300;
    const cardHeight = 240;
    const offsetY = 20;

    let x = e.clientX - cardWidth / 2;
    let y = e.clientY - cardHeight - offsetY;

    if (x + cardWidth > window.innerWidth - 20) x = window.innerWidth - cardWidth - 20;
    if (x < 20) x = 20;
    if (y < 20) y = e.clientY + offsetY;

    setPosition({ x, y });
  }, [setPosition]);

  const handleEnter = useCallback((e) => {
    if (!setActiveKey) return;
    setActiveKey(previewKey);
    setIsVisible(true);
    updatePosition(e);
  }, [previewKey, setActiveKey, setIsVisible, updatePosition]);

  const handleMove = useCallback((e) => {
    if (!setIsVisible) return;
    setIsVisible((v) => { if (v) updatePosition(e); return v; });
  }, [updatePosition, setIsVisible]);

  const handleLeave = useCallback(() => {
    if (!setIsVisible) return;
    setIsVisible(false);
  }, [setIsVisible]);

  if (!ctx) return <span>{children}</span>;

  return (
    <span
      className="klee-hover-link"
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </span>
  );
}

export function HoverPreviewProvider({ children }) {
  const [activeKey, setActiveKey] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    Object.values(PREVIEW_DATA).forEach(({ image }) => {
      const img = new Image();
      img.src = image;
    });
  }, []);

  return (
    <HoverPreviewContext.Provider value={{ activeKey, setActiveKey, position, setPosition, isVisible, setIsVisible }}>
      {children}
      <PreviewCard cardRef={cardRef} />
    </HoverPreviewContext.Provider>
  );
}
