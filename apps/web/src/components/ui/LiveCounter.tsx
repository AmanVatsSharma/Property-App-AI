/**
 * @file LiveCounter.tsx
 * @module ui
 * @description Animated number counter that counts up on mount.
 * @author BharatERP
 * @created 2025-03-19
 */

"use client";

import { useEffect, useRef, useState } from "react";

interface LiveCounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function LiveCounter({
  target,
  duration = 1800,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: LiveCounterProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(
              parseFloat((eased * target).toFixed(decimals)),
            );
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  return (
    <span ref={ref} className={`live-counter ${className ?? ""}`}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
