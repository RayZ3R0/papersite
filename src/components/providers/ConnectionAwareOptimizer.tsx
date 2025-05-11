// src/components/providers/ConnectionAwareOptimizer.tsx
"use client";

import { useEffect, useState } from "react";

export default function ConnectionAwareOptimizer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [connectionQuality, setConnectionQuality] = useState<string>("unknown");

  useEffect(() => {
    // Check for slow connection and apply optimizations
    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const conn = (navigator as any).connection;

      const updateConnectionQuality = () => {
        const effectiveType = conn.effectiveType || "unknown";
        setConnectionQuality(effectiveType);
        document.documentElement.dataset.connection = effectiveType;

        // Apply class-based optimizations for slow connections
        if (["slow-2g", "2g", "3g"].includes(effectiveType) || conn.saveData) {
          document.documentElement.classList.add("reduced-motion");
          document.documentElement.classList.add("data-saving");

          // Adjust CSS variables for low-data mode
          document.documentElement.style.setProperty(
            "--animation-duration-factor",
            "0.1",
          );

          // Update meta viewport to prevent zooming which can be heavy
          const viewportMeta = document.querySelector('meta[name="viewport"]');
          if (viewportMeta) {
            viewportMeta.setAttribute(
              "content",
              "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
            );
          }
        } else {
          document.documentElement.classList.remove("reduced-motion");
          document.documentElement.classList.remove("data-saving");
          document.documentElement.style.setProperty(
            "--animation-duration-factor",
            "1",
          );

          // Reset viewport
          const viewportMeta = document.querySelector('meta[name="viewport"]');
          if (viewportMeta) {
            viewportMeta.setAttribute(
              "content",
              "width=device-width, initial-scale=1, viewportFit=cover",
            );
          }
        }
      };

      updateConnectionQuality();
      conn.addEventListener("change", updateConnectionQuality);
      return () => conn.removeEventListener("change", updateConnectionQuality);
    }

    // Fallback detection for browsers without Network Information API
    const slowConnectionCheck = () => {
      let startTime = performance.now();
      const img = new Image();
      img.onload = () => {
        const loadTime = performance.now() - startTime;
        // If loading a tiny image takes more than 300ms, assume slow connection
        if (loadTime > 300) {
          document.documentElement.classList.add("reduced-motion");
          document.documentElement.classList.add("data-saving");
          document.documentElement.style.setProperty(
            "--animation-duration-factor",
            "0.1",
          );
        }
      };
      // Load a tiny image to test connection speed
      img.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    };

    slowConnectionCheck();
  }, []);

  return <>{children}</>;
}
