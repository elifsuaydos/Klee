"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

export default function ScrambleText({ text, speed = 50, delay = 0, hoverOnly = false }) {
  // If hoverOnly, start with the actual text. Otherwise, start with spaces.
  const [displayText, setDisplayText] = useState(hoverOnly ? text : text.replace(/./g, " "));
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  const startScramble = useCallback(() => {
    if (animationRef.current) clearInterval(animationRef.current);
    
    let iteration = 0;
    animationRef.current = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((letter, index) => {
            if (index < Math.floor(iteration)) {
              return text[index];
            }
            if (letter === " ") return " ";
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(animationRef.current);
        setDisplayText(text); // Ensure perfect final match
      }
      
      // Increase iteration (determines how fast it resolves)
      iteration += 1; 
    }, speed);
  }, [text, speed]);

  useEffect(() => {
    if (hoverOnly) return; // Don't trigger on visibility if hoverOnly is true

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hoverOnly]);

  useEffect(() => {
    if (!isVisible || hoverOnly) return;

    const timeoutId = setTimeout(() => {
      startScramble();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [isVisible, hoverOnly, delay, startScramble]);

  const handleMouseEnter = () => {
    if (hoverOnly) {
      startScramble();
    }
  };

  return (
    <span 
      ref={containerRef} 
      onMouseEnter={handleMouseEnter}
      style={{ display: "inline-block" }}
    >
      {displayText}
    </span>
  );
}
