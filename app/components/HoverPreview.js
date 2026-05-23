'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useIsTouch } from '../lib/useIsTouch';

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
  const isTouch = useIsTouch();
  const { activeKey, setActiveKey, setPosition, setIsVisible, isVisible } = ctx || {};

  // Position the card near the touch/click point, with viewport clamping
  const updatePosition = useCallback((clientX, clientY) => {
    if (!setPosition) return;
    const cardWidth = 300;
    const cardHeight = 240;
    const offsetY = 20;

    let x = clientX - cardWidth / 2;
    let y = clientY - cardHeight - offsetY;

    if (x + cardWidth > window.innerWidth - 20) x = window.innerWidth - cardWidth - 20;
    if (x < 20) x = 20;
    if (y < 20) y = clientY + offsetY;

    setPosition({ x, y });
  }, [setPosition]);

  // Mouse handlers (desktop only)
  const handleEnter = useCallback((e) => {
    if (!setActiveKey) return;
    setActiveKey(previewKey);
    setIsVisible(true);
    updatePosition(e.clientX, e.clientY);
  }, [previewKey, setActiveKey, setIsVisible, updatePosition]);

  const handleMove = useCallback((e) => {
    if (!setIsVisible) return;
    setIsVisible((v) => { if (v) updatePosition(e.clientX, e.clientY); return v; });
  }, [updatePosition, setIsVisible]);

  const handleLeave = useCallback(() => {
    if (!setIsVisible) return;
    setIsVisible(false);
  }, [setIsVisible]);

  // Tap handler (touch only): toggle — tap same link again to close
  const handleTap = useCallback((e) => {
    if (!isTouch || !setActiveKey) return;
    e.preventDefault();
    const touch = e.changedTouches?.[0] || e;
    if (activeKey === previewKey && isVisible) {
      setIsVisible(false);
    } else {
      setActiveKey(previewKey);
      setIsVisible(true);
      updatePosition(touch.clientX, touch.clientY);
    }
  }, [isTouch, activeKey, previewKey, isVisible, setActiveKey, setIsVisible, updatePosition]);

  // Close when tapping outside on touch devices
  useEffect(() => {
    if (!isTouch || !isVisible) return;
    const close = (e) => {
      if (!e.target.closest('.klee-hover-link')) {
        setIsVisible(false);
      }
    };
    document.addEventListener('touchstart', close, { passive: true });
    return () => document.removeEventListener('touchstart', close);
  }, [isTouch, isVisible, setIsVisible]);

  if (!ctx) return <span>{children}</span>;

  return (
    <span
      className="klee-hover-link"
      onMouseEnter={!isTouch ? handleEnter : undefined}
      onMouseMove={!isTouch ? handleMove : undefined}
      onMouseLeave={!isTouch ? handleLeave : undefined}
      onClick={isTouch ? handleTap : undefined}
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
