"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ComponentStyles = dynamic(
  () => import("./product-detail-component-styles").then((mod) => mod.ProductDetailComponentStyles),
  { ssr: false },
);

export function ProductDetailDeferredStyles() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let completed = false;
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
    const minDelay = window.matchMedia("(max-width: 42rem)").matches ? 2800 : 900;

    function clearScheduledWork() {
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
        idleId = null;
      }

      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
        timeoutId = null;
      }
    }

    function complete() {
      if (cancelled || completed) {
        return;
      }

      completed = true;
      clearScheduledWork();
      window.removeEventListener("pointerdown", complete);
      window.removeEventListener("touchstart", complete);
      window.removeEventListener("keydown", complete);
      setReady(true);
    }

    function scheduleIdleLoad() {
      if (cancelled || completed) {
        return;
      }

      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(complete, { timeout: 1200 });
      } else {
        timeoutId = globalThis.setTimeout(complete, 400);
      }
    }

    timeoutId = globalThis.setTimeout(scheduleIdleLoad, minDelay);
    window.addEventListener("pointerdown", complete, { once: true, passive: true });
    window.addEventListener("touchstart", complete, { once: true, passive: true });
    window.addEventListener("keydown", complete, { once: true });

    return () => {
      cancelled = true;
      clearScheduledWork();
      window.removeEventListener("pointerdown", complete);
      window.removeEventListener("touchstart", complete);
      window.removeEventListener("keydown", complete);
    };
  }, []);

  return ready ? <ComponentStyles /> : null;
}
