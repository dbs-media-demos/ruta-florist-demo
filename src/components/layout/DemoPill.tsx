"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { agencyUrl } from "@/lib/site";

const KEY = "ruta-demo-pill";
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const dismissedNow = () => {
  try {
    return sessionStorage.getItem(KEY) === "0";
  } catch {
    return false;
  }
};

/** Shown/dismissed state shared by the corner pill and the phone strip. Dismissal lasts for the session. */
function useDemoBadge() {
  // the server renders no badge; it appears after hydration (it is fixed, so nothing moves)
  const dismissed = useSyncExternalStore(subscribe, dismissedNow, () => true);
  const dismiss = () => {
    try {
      sessionStorage.setItem(KEY, "0");
    } catch {}
    listeners.forEach((l) => l());
  };
  return [!dismissed, dismiss] as const;
}

/** Phones: a slim strip on top of the bottom bar, so the badge never sits over the page. */
export function DemoStrip({ label, dismiss: dismissLabel }: { label: string; dismiss: string }) {
  const [show, dismiss] = useDemoBadge();
  if (!show) return null;
  return (
    <div className="-mx-3 -mt-2.5 mb-2 flex items-center justify-between bg-ink pl-4 text-[0.7rem] font-semibold tracking-[0.06em] text-paper/85">
      <a href={agencyUrl} target="_blank" rel="noopener" className="flex min-h-8 items-center gap-2">
        <span aria-hidden className="size-1.5 rounded-full bg-poppy-soft" />
        {label} ↗
      </a>
      <button type="button" onClick={dismiss} aria-label={dismissLabel} className="grid min-h-8 w-11 place-items-center text-base leading-none text-paper/70">
        ×
      </button>
    </div>
  );
}

/** Small fixed pill marking this as a Scale by Noon concept site. On phones it lives in the bottom bar instead, where there is one. */
export function DemoPill({ label, dismiss: dismissLabel, barOff }: { label: string; dismiss: string; barOff: string[] }) {
  const pathname = usePathname();
  const [show, dismiss] = useDemoBadge();
  if (!show) return null;
  const bar = !barOff.some((p) => pathname.startsWith(p));

  return (
    <div
      className={clsx(
        "fixed bottom-[calc(4.9rem+env(safe-area-inset-bottom))] left-3 z-[180] flex items-center rounded-full bg-ink/92 pl-4 pr-1 text-paper shadow-[0_10px_30px_rgba(15,27,21,0.28)] backdrop-blur md:bottom-5 md:left-5",
        bar && "max-md:hidden",
      )}
    >
      <a href={agencyUrl} target="_blank" rel="noopener" className="py-2.5 text-[0.7rem] font-semibold tracking-[0.06em] hover:text-poppy-soft">
        {label} ↗
      </a>
      <button type="button" onClick={dismiss} className="ml-1 grid h-10 w-10 place-items-center rounded-full text-lg leading-none hover:bg-white/10" aria-label={dismissLabel}>
        ×
      </button>
    </div>
  );
}
