"use client";

import { useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";
import { lockScroll } from "@/components/layout/SmoothScroll";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select,textarea,[tabindex]:not([tabindex="-1"])';

/**
 * Accessible overlay: traps focus, closes on Esc and backdrop click, returns focus to the opener.
 * Panels slide from the right (drawer), rise from the bottom on phones (sheet) or scale (modal).
 */
export function Dialog({
  open,
  onClose,
  label,
  children,
  variant = "drawer",
  className,
  initialFocus,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  variant?: "drawer" | "modal" | "top";
  className?: string;
  initialFocus?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    lockScroll(true);
    const el = panel.current;
    const first = (initialFocus ? el?.querySelector<HTMLElement>(initialFocus) : null) ?? el?.querySelector<HTMLElement>(FOCUSABLE);
    window.setTimeout(() => first?.focus({ preventScroll: true }), 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((x) => x.offsetParent !== null);
      if (!items.length) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      const o = opener.current as HTMLElement | null;
      if (o && document.contains(o)) o.focus({ preventScroll: true });
    };
  }, [open, onClose, initialFocus]);

  return (
    <div className={clsx("fixed inset-0 z-[260]", !open && "pointer-events-none")} aria-hidden={!open}>
      <div
        className={clsx("absolute inset-0 bg-ink-2/45 backdrop-blur-[2px] transition-opacity duration-500", open ? "opacity-100" : "opacity-0")}
        onClick={onClose}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        inert={!open}
        data-lenis-prevent
        className={clsx(
          "theme-paper absolute flex flex-col shadow-[0_30px_80px_rgba(15,27,21,0.3)] transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)]",
          variant === "drawer" && ["inset-y-0 right-0 w-full max-w-[30rem]", open ? "translate-x-0" : "translate-x-full"],
          variant === "modal" && [
            "inset-x-0 bottom-0 max-h-[92vh] rounded-t-[1.75rem] md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[88vh] md:w-[min(64rem,92vw)] md:rounded-[1.75rem]",
            open ? "translate-y-0 md:-translate-x-1/2 md:-translate-y-1/2 md:scale-100 md:opacity-100" : "translate-y-full md:-translate-x-1/2 md:-translate-y-[46%] md:scale-95 md:opacity-0",
          ],
          variant === "top" && ["inset-x-0 top-0 max-h-[92vh]", open ? "translate-y-0" : "-translate-y-full"],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function CloseButton({ onClick, label, className }: { onClick: () => void; label: string; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={clsx("grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line hover:border-fg", className)}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </button>
  );
}
