"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale, Localized } from "@/lib/i18n";
import { getDictionary } from "@/i18n/dictionary";
import { formatRsd } from "@/lib/format";
import { ui, useUI } from "@/lib/commerce/store";
import { Dialog, CloseButton } from "@/components/ui/Dialog";

export type SearchItem = { id: string; name: Localized<string>; href: Localized<string>; image: string; price: number; compareAt?: number; terms: string };

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "dj")
    .replace(/\./g, "");

/** Instant search with thumbnails, prices and helpful suggestions when nothing matches. */
export function SearchOverlay({ locale, items }: { locale: Locale; items: SearchItem[] }) {
  const d = getDictionary(locale).search;
  const { search } = useUI();
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);

  const results = useMemo(() => {
    const n = norm(dq.trim());
    if (!n) return [];
    const words = n.split(/\s+/);
    const priceCap = Number(n.replace(/\D/g, ""));
    return items
      .filter((it) => {
        if (/(do|under)\s*\d/.test(n) && priceCap > 0) return it.price <= priceCap;
        const hay = norm(`${it.name.sr} ${it.name.en} ${it.terms}`);
        return words.every((w) => hay.includes(w));
      })
      .slice(0, 8);
  }, [dq, items]);

  const popular = items.slice(0, 4);
  const close = () => {
    ui.closeSearch();
  };

  return (
    <Dialog open={search} onClose={close} label={d.label} variant="top" initialFocus="input">
      <div className="wrap py-6">
        <div className="flex items-center gap-4">
          <label htmlFor="site-search" className="sr-only">
            {d.label}
          </label>
          <svg width="22" height="22" viewBox="0 0 20 20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" className="shrink-0">
            <circle cx="8.5" cy="8.5" r="6.5" />
            <path d="M13.5 13.5L19 19" />
          </svg>
          <input
            id="site-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={d.placeholder}
            className="w-full bg-transparent py-3 font-serif text-[clamp(1.6rem,4vw,3rem)] leading-none outline-none placeholder:text-muted/60"
            autoComplete="off"
            aria-controls="search-results"
          />
          <CloseButton onClick={close} label={d.close} />
        </div>
        <div className="mt-4 border-t border-line pt-6" id="search-results" aria-live="polite">
          {q.trim() && results.length === 0 ? (
            <div className="pb-6">
              <p className="t-h4">
                {d.empty} “{q}”
              </p>
              <p className="mt-3 text-muted">{d.try}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {d.suggestions.map((s) => (
                  <button key={s} type="button" className="chip" onClick={() => setQ(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {!q.trim() && <p className="t-eyebrow mb-4 text-muted">{d.popular}</p>}
              <ul className="grid grid-cols-2 gap-x-4 gap-y-6 pb-6 sm:grid-cols-4">
                {(q.trim() ? results : popular).map((it, i) => (
                  <li key={it.id} className="group" style={{ animation: `rise-sm .6s var(--ease-out-expo) ${i * 40}ms both` }}>
                    <Link href={it.href[locale]} onClick={close} className="block">
                      <div className="frame aspect-[4/5] rounded-2xl">
                        <Image src={it.image} alt="" fill sizes="(min-width: 640px) 22vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                      <p className="mt-2 font-serif text-lg leading-tight group-hover:text-poppy-ink">{it.name[locale]}</p>
                      <p className="text-sm text-muted">
                        {formatRsd(it.price)}
                        {it.compareAt && <s className="ml-2">{formatRsd(it.compareAt)}</s>}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
