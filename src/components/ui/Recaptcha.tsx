"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6Le8QjEtAAAAAC26DAKyEYMmIwLCK06dcWGhTDM7";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    grecaptcha?: any;
  }
}

let loaderPromise: Promise<void> | null = null;

/** Load the reCAPTCHA v2 script once and resolve when grecaptcha.render is ready. */
function loadRecaptcha(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha?.render) return Promise.resolve();
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise<void>((resolve) => {
    if (!document.querySelector("script[data-recaptcha]")) {
      const s = document.createElement("script");
      s.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.setAttribute("data-recaptcha", "true");
      document.head.appendChild(s);
    }
    const check = () => (window.grecaptcha?.render ? resolve() : setTimeout(check, 100));
    check();
  });
  return loaderPromise;
}

export interface RecaptchaHandle {
  reset: () => void;
}

/**
 * Google reCAPTCHA v2 ("I'm not a robot") checkbox. Calls `onChange` with the
 * token when solved, or null when it expires/errors. Use the ref to reset it.
 */
export const Recaptcha = forwardRef<RecaptchaHandle, { onChange: (token: string | null) => void; className?: string }>(
  function Recaptcha({ onChange, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<number | null>(null);
    const cb = useRef(onChange);
    cb.current = onChange;

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetId.current !== null && window.grecaptcha) {
          window.grecaptcha.reset(widgetId.current);
          cb.current(null);
        }
      },
    }));

    useEffect(() => {
      let active = true;
      loadRecaptcha().then(() => {
        if (!active || !containerRef.current || widgetId.current !== null) return;
        widgetId.current = window.grecaptcha.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: (token: string) => cb.current(token),
          "expired-callback": () => cb.current(null),
          "error-callback": () => cb.current(null),
        });
      });
      return () => {
        active = false;
      };
    }, []);

    return <div ref={containerRef} className={className} />;
  },
);
