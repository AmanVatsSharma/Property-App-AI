/**
 * @file MobileAppPrompt.tsx
 * @module layout
 * @description Dismissible banner on mobile inviting users to download the app or continue on device.
 * @author BharatERP
 * @created 2025-03-13
 */

"use client";

import { useEffect, useState } from "react";
import { MOBILE_PROMPT_COPY, APP_STORE_URL, PLAY_STORE_URL } from "@/lib/copy";

const STORAGE_KEY = "urbannest_mobile_prompt_dismissed";
const MOBILE_BREAKPOINT_PX = 768;

export default function MobileAppPrompt() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`);
    const onChange = () => setIsMobile(media.matches);
    media.addEventListener("change", onChange);
    onChange();

    try {
      setIsDismissed(sessionStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setIsDismissed(false);
    }
    setMounted(true);

    return () => media.removeEventListener("change", onChange);
  }, []);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setIsDismissed(true);
  };

  if (!mounted || !isMobile || isDismissed) {
    return null;
  }

  return (
    <section
      className="mobile-app-prompt"
      aria-label={MOBILE_PROMPT_COPY.headline}
      data-testid="mobile-app-prompt"
    >
      <div className="mobile-app-prompt-inner">
        <p className="mobile-app-prompt-headline">{MOBILE_PROMPT_COPY.headline}</p>
        <p className="mobile-app-prompt-body">{MOBILE_PROMPT_COPY.body}</p>
        <div className="mobile-app-prompt-actions">
          <div className="mobile-app-prompt-download">
            <span className="mobile-app-prompt-download-label">{MOBILE_PROMPT_COPY.downloadApp}</span>
            <div className="mobile-app-prompt-store-links">
              <a
                href={APP_STORE_URL}
                className="btn-cta-primary mobile-app-prompt-btn"
                aria-label="Download on the App Store"
              >
                App Store
              </a>
              <a
                href={PLAY_STORE_URL}
                className="btn-cta-primary mobile-app-prompt-btn"
                aria-label="Get it on Google Play"
              >
                Google Play
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="btn-cta-outline mobile-app-prompt-btn"
            aria-label={MOBILE_PROMPT_COPY.continueHere}
          >
            {MOBILE_PROMPT_COPY.continueHere}
          </button>
        </div>
      </div>
    </section>
  );
}
