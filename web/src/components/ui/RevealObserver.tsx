/**
 * @file RevealObserver.tsx
 * @module ui
 * @description Observes all .reveal elements and adds .visible on scroll into view
 * @author BharatERP
 * @created 2025-03-10
 */

"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("visible"), i * 70);
          }
        });
      },
      { threshold: 0.07 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [pathname]);

  return null;
}
