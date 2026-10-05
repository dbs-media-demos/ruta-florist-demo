"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import { cutoffState, fmtCountdown, belgradeNow } from "@/lib/delivery";
import { getDictionary } from "@/i18n/dictionary";

/** Ticks once a second after mount; renders a stable placeholder on the server. */
export function useCutoff() {
  const [state, setState] = useState<ReturnType<typeof cutoffState> | null>(null);
  useEffect(() => {
    const tick = () => setState(cutoffState());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return state;
}

/** "Order by 14:00 for delivery today · 2:14:33 left", or "Delivery tomorrow from 9:00" after the cutoff. */
export function CutoffLine({ locale, className, compact }: { locale: Locale; className?: string; compact?: boolean }) {
  const d = getDictionary(locale).cutoff;
  const s = useCutoff();
  const sunday = typeof window !== "undefined" && belgradeNow().weekday === 0;
  const live = s?.sameDay;
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <span className={clsx("relative inline-block h-2 w-2 shrink-0 rounded-full", live ? "bg-poppy" : "bg-sage")} aria-hidden>
        {live && <span className="absolute inset-0 animate-ping rounded-full bg-poppy/70" />}
      </span>
      {s === null ? (
        <span>{d.today}</span>
      ) : live ? (
        <span>
          {compact ? d.today.replace(" za dostavu danas", "").replace(" for delivery today", "") : d.today}
          <span className="mx-1.5 opacity-50">·</span>
          <span className="t-price tabular-nums" suppressHydrationWarning>
            {fmtCountdown(s.secondsLeft)}
          </span>{" "}
          <span className="opacity-70">{d.left}</span>
        </span>
      ) : (
        <span>{sunday ? d.sunday : d.tomorrow}</span>
      )}
    </span>
  );
}
