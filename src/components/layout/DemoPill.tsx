"use client";

import { useEffect, useState } from "react";
import { agencyUrl } from "@/lib/site";

/** Small fixed pill marking this as a Scale by Noon concept site. Dismissal lasts for the session. */
export function DemoPill({ label, dismiss }: { label: string; dismiss: string }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem("ruta-demo-pill") === "0";
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read session storage after mount
    setHidden(dismissed);
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed bottom-[calc(4.9rem+env(safe-area-inset-bottom))] left-3 z-[180] flex items-center rounded-full bg-ink/92 pl-4 pr-1 text-paper shadow-[0_10px_30px_rgba(15,27,21,0.28)] backdrop-blur md:bottom-5 md:left-5">
      <a href={agencyUrl} target="_blank" rel="noopener" className="py-2.5 text-[0.7rem] font-semibold tracking-[0.06em] hover:text-poppy-soft">
        {label} ↗
      </a>
      <button
        type="button"
        onClick={() => {
          try {
            sessionStorage.setItem("ruta-demo-pill", "0");
          } catch {}
          setHidden(true);
        }}
        className="ml-1 grid h-10 w-10 place-items-center rounded-full text-lg leading-none hover:bg-white/10"
        aria-label={dismiss}
      >
        ×
      </button>
    </div>
  );
}
