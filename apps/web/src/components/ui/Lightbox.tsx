/**
 * @file Lightbox.tsx
 * @module ui
 * @description Full-screen image gallery lightbox with keyboard nav.
 * @author BharatERP
 * @created 2025-03-19
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface LightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  alt?: string;
}

export function Lightbox({
  images,
  initialIndex = 0,
  onClose,
  alt = "Property image",
}: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-label="Image gallery"
    >
      <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="lightbox-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <div className="lightbox-main">
          <Image
            src={images[current]}
            alt={`${alt} ${current + 1} of ${images.length}`}
            fill
            sizes="100vw"
            style={{ objectFit: "contain" }}
            priority
            unoptimized
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="lightbox-nav prev"
                onClick={prev}
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                type="button"
                className="lightbox-nav next"
                onClick={next}
                aria-label="Next"
              >
                ›
              </button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="lightbox-thumbs">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                className={`lightbox-thumb ${i === current ? "active" : ""}`}
                onClick={() => setCurrent(i)}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="80px"
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            marginTop: 4,
          }}
        >
          {current + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
