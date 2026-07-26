"use client";

import { useEffect, useState } from "react";
import { Logomark } from "@/components/Logomark";

const STATUS_LINES = [
  "Finding colleges near you...",
  "Matching your profile...",
  "Building your next steps...",
];

export function LoadingState() {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((current) => (current + 1) % STATUS_LINES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <Logomark className="h-16 w-16 animate-pulse" aria-hidden="true" />
      <p
        className="mt-6 text-base text-muted"
        aria-live="polite"
        aria-atomic="true"
      >
        {STATUS_LINES[lineIndex]}
      </p>
    </div>
  );
}
