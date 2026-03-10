/**
 * @file PropertyImage.tsx
 * @module ui
 * @description Property image with next/image and placeholder fallback
 * @author BharatERP
 * @created 2025-03-10
 */

import Image from "next/image";

export interface PropertyImageProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: "emoji" | "gradient";
  placeholderGradient?: string;
}

export function PropertyImage({
  src,
  alt,
  fill = true,
  className = "",
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  placeholder = "gradient",
  placeholderGradient = "linear-gradient(135deg,#132238,#1e3a5f)",
}: PropertyImageProps) {
  if (!src) {
    return (
      <div
        className={className}
        style={{ background: placeholderGradient, display: "flex", alignItems: "center", justifyContent: "center" }}
        aria-hidden
      >
        {placeholder === "emoji" ? <span style={{ fontSize: 44 }}>🏡</span> : null}
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      style={{ objectFit: "cover" }}
    />
  );
}
