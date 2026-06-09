"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Brand logo. The image lives at `public/images/rdtherm-logo.png`.
 * - Expanded: the full logo image is shown.
 * - Collapsed (narrow sidebar rail): a compact "R" badge is shown so it fits.
 * If the image is missing/fails to load, a lettered badge + wordmark is used
 * as a fallback so the UI never renders a broken image.
 */
const LOGO_SRC = "/images/rdtherm-logo.png";

export function Logo({ collapsed = false, className }: { collapsed?: boolean; className?: string }) {
  const [imgOk, setImgOk] = useState(true);

  const badge = (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-brand-strong)] text-base font-bold text-white">
      R
    </span>
  );

  // Narrow rail — only room for a square mark.
  if (collapsed) {
    return <span className={cn("flex items-center", className)}>{badge}</span>;
  }

  if (imgOk) {
    return (
      <span className={cn("flex items-center", className)}>
        <img
          src={LOGO_SRC}
          alt="R&D Therm"
          onError={() => setImgOk(false)}
          className="h-12 w-auto max-w-[205px] object-contain object-left"
        />
      </span>
    );
  }

  // Fallback if the image can't load.
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      {badge}
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-bold tracking-tight text-[var(--color-content)]">
          R&amp;D Therm
        </span>
        <span className="mt-0.5 text-[11px] font-medium text-[var(--color-muted)]">CMS Admin</span>
      </span>
    </span>
  );
}
