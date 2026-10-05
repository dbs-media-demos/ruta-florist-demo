"use client";

import { useState } from "react";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/i18n/dictionary";
import { toggleWish, ui, useWishlist, type ProductSnap } from "@/lib/commerce/store";

/** Wishlist heart with a little bloom when it fills. */
export function Heart({ snap, locale, className }: { snap: ProductSnap; locale: Locale; className?: string }) {
  const d = getDictionary(locale).wish;
  const wish = useWishlist();
  const on = wish.items.some((i) => i.id === snap.id);
  const [pop, setPop] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? d.remove : d.add}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleWish(snap);
        ui.announce(added ? d.added : d.removed);
        setPop(true);
      }}
      onAnimationEnd={() => setPop(false)}
      className={clsx("grid h-11 w-11 place-items-center rounded-full bg-paper/85 text-ink backdrop-blur transition-colors hover:bg-paper", className)}
    >
      <svg width="19" height="18" viewBox="0 0 24 22" aria-hidden className={clsx(pop && "heart-pop")}>
        <path
          d="M12 20.5S2 14.4 2 7.6A5.1 5.1 0 0 1 12 5a5.1 5.1 0 0 1 10 2.6c0 6.8-10 12.9-10 12.9Z"
          fill={on ? "var(--poppy)" : "none"}
          stroke={on ? "var(--poppy)" : "currentColor"}
          strokeWidth="1.6"
          className="transition-[fill,stroke] duration-300"
        />
      </svg>
    </button>
  );
}
