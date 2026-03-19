/**
 * @file PropertyGallery.tsx
 * @module property
 * @description Clickable gallery with lightbox for property detail page.
 * @author BharatERP
 * @created 2025-03-19
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "@/components/ui/Lightbox";
import { DEMO_IMAGES } from "@/lib/demo-images";

interface PropertyGalleryProps {
  coverImage?: string | null;
  galleryImages?: string[] | null;
  title: string;
}

export function PropertyGallery({
  coverImage,
  galleryImages,
  title,
}: PropertyGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const cover = coverImage ?? DEMO_IMAGES.defaultPropertyCover;
  const sub1 = galleryImages?.[0] ?? DEMO_IMAGES.defaultPropertyCover;
  const sub2 = galleryImages?.[1] ?? DEMO_IMAGES.defaultPropertyCover;
  const allImages = [cover, ...(galleryImages ?? [])].filter(
    Boolean,
  ) as string[];

  const openAt = (i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="gallery">
        <button
          type="button"
          className="gallery-main"
          onClick={() => openAt(0)}
          aria-label="Open image gallery"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Image
            src={cover}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            className="gallery-main-img"
            style={{ objectFit: "cover" }}
            priority
            unoptimized
          />
          <div className="gallery-actions">
            <button
              type="button"
              className="gal-btn"
              onClick={(e) => {
                e.stopPropagation();
                openAt(0);
              }}
            >
              📸 All Photos ({allImages.length})
            </button>
          </div>
        </button>
        <button
          type="button"
          className="gallery-sub"
          onClick={() => openAt(1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Image
            src={sub1}
            alt={`${title} — view 2`}
            fill
            sizes="33vw"
            className="gallery-sub-img"
            style={{ objectFit: "cover" }}
            unoptimized
          />
        </button>
        <button
          type="button"
          className="gallery-sub"
          onClick={() => openAt(2)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Image
            src={sub2}
            alt={`${title} — view 3`}
            fill
            sizes="33vw"
            className="gallery-sub-img"
            style={{ objectFit: "cover" }}
            unoptimized
          />
        </button>
      </div>
      {lightboxOpen && (
        <Lightbox
          images={allImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          alt={title}
        />
      )}
    </>
  );
}
