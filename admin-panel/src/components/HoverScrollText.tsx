"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

interface HoverScrollTextProps {
  text: string;
  className?: string;
  title?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

/**
 * Vercel-style interactive cell text auto-scroller.
 * Displays clean text by default. On hover, if the text exceeds its container,
 * it smoothly pans horizontally so the administrator can read the full text effortlessly.
 */
export function HoverScrollText({
  text,
  className = "",
  title,
  onClick,
}: HoverScrollTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowDistance, setOverflowDistance] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const checkOverflow = useCallback(() => {
    if (containerRef.current && textRef.current) {
      const diff = textRef.current.scrollWidth - containerRef.current.clientWidth;
      setOverflowDistance(diff > 3 ? diff + 8 : 0);
    }
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [text, checkOverflow]);

  // Smooth readable scrolling speed (~45px per second, minimum 1.8s)
  const duration = Math.max(1.8, overflowDistance / 45);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        checkOverflow();
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className={`overflow-hidden whitespace-nowrap block max-w-full ${
        onClick ? "cursor-pointer" : "cursor-default"
      } ${className}`}
      title={title || text}
    >
      <span
        ref={textRef}
        className="inline-block transition-transform ease-linear will-change-transform"
        style={{
          transform:
            isHovered && overflowDistance > 0
              ? `translateX(-${overflowDistance}px)`
              : "translateX(0)",
          transitionDuration:
            isHovered && overflowDistance > 0 ? `${duration}s` : "0.3s",
        }}
      >
        {text}
      </span>
    </div>
  );
}
