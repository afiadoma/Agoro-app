"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // registration failing shouldn't break the app — install prompt just won't show
      });
    }
  }, []);

  return null;
}
