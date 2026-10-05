"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { bagCount, ui, useBag } from "@/lib/commerce/store";

/** Sticky bottom bar on phones: Call + Order. Hidden where a page has its own sticky bar. */
export function MobileBar({ callLabel, orderLabel, orderHref, bagLabel, phone, hideOn }: { callLabel: string; orderLabel: string; orderHref: string; bagLabel: string; phone: string; hideOn: string[] }) {
  const pathname = usePathname();
  const bag = useBag();
  const count = bagCount(bag);
  if (hideOn.some((p) => pathname.startsWith(p))) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[170] border-t border-ink/10 bg-paper/92 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl md:hidden">
      <div className="flex gap-2">
        <a href={`tel:${phone}`} className="btn btn-ghost flex-1 !border-ink/20 !text-ink">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2" />
          </svg>
          {callLabel}
        </a>
        {count > 0 ? (
          <button type="button" onClick={ui.openDrawer} className={clsx("btn btn-accent flex-[1.4]")}>
            {bagLabel} · {count}
          </button>
        ) : (
          <Link href={orderHref} className="btn btn-accent flex-[1.4]">
            {orderLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
