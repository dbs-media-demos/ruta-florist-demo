"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import type { CategoryId, OccasionId, PaletteId, ProductLite } from "@/lib/commerce/types";
import { getDictionary } from "@/i18n/dictionary";
import { gsap, loadFlip, prefersReducedMotion } from "@/lib/gsap";
import { Dialog, CloseButton } from "@/components/ui/Dialog";
import { ProductCard } from "./ProductCard";

type Cat = { id: CategoryId; name: string; href: string; image: string };
type Occ = { id: OccasionId; name: string; image: string };

const PRICES = [
  { id: "0-3000", min: 0, max: 3000 },
  { id: "3000-6000", min: 3000, max: 6000 },
  { id: "6000-10000", min: 6000, max: 10000 },
  { id: "10000-", min: 10000, max: Infinity },
];
const COLORS: PaletteId[] = ["white", "blush", "bright", "sunny", "blue", "green", "neutral"];
const SWATCH: Record<PaletteId, string> = { white: "#f4f1ea", blush: "#f2c3c0", bright: "#e0533a", sunny: "#f1c84b", blue: "#9cb7d8", green: "#6f8f6a", neutral: "#d6c09a" };
const SORTS = ["featured", "newest", "priceAsc", "priceDesc", "rating"] as const;
type Sort = (typeof SORTS)[number];

type Filters = { cat: string[]; occ: string; color: string[]; price: string; sale: boolean; sort: Sort };

const parse = (sp: URLSearchParams | null): Filters => ({
  cat: sp?.get("kat")?.split(",").filter(Boolean) ?? [],
  occ: sp?.get("povod") ?? "",
  color: sp?.get("boja")?.split(",").filter(Boolean) ?? [],
  price: sp?.get("cena") ?? "",
  sale: sp?.get("akcija") === "1",
  sort: (SORTS as readonly string[]).includes(sp?.get("sort") ?? "") ? (sp!.get("sort") as Sort) : "featured",
});

const toQuery = (f: Filters) => {
  const p = new URLSearchParams();
  if (f.cat.length) p.set("kat", f.cat.join(","));
  if (f.occ) p.set("povod", f.occ);
  if (f.color.length) p.set("boja", f.color.join(","));
  if (f.price) p.set("cena", f.price);
  if (f.sale) p.set("akcija", "1");
  if (f.sort !== "featured") p.set("sort", f.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
};

const minPrice = (p: ProductLite) => Math.min(...p.variants.map((v) => v.price));

/** Server-rendered grid (everything visible) that becomes the interactive one after hydration. */
export function ShopGridStatic({ items, locale }: { items: ProductLite[]; locale: Locale }) {
  return (
    <div className="wrap">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
        {items.map((p, i) => (
          <li key={p.id}>
            <ProductCard product={p} locale={locale} priority={i < 2} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ShopGrid({
  items,
  locale,
  categories,
  occasions,
  showCategories = true,
  calm = false,
}: {
  items: ProductLite[];
  locale: Locale;
  categories: Cat[];
  occasions: Occ[];
  showCategories?: boolean;
  calm?: boolean;
}) {
  const d = getDictionary(locale);
  const sr = locale === "sr";
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [f, setF] = useState<Filters>(() => parse(sp));
  const [sheet, setSheet] = useState(false);
  const grid = useRef<HTMLUListElement>(null);
  const flipState = useRef<unknown>(null);
  const FlipRef = useRef<Awaited<ReturnType<typeof loadFlip>> | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const animate = !calm;

  // keep state in sync with back/forward navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL is the source of truth
    setF(parse(sp));
  }, [sp]);

  useEffect(() => {
    if (animate && !prefersReducedMotion()) loadFlip().then((F) => (FlipRef.current = F));
  }, [animate]);

  // condense the sticky filter bar once it sticks
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(e.intersectionRatio < 1), { threshold: [1], rootMargin: "-120px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const update = (next: Partial<Filters>) => {
    const F = FlipRef.current;
    if (F && grid.current) flipState.current = F.getState(grid.current.querySelectorAll("[data-flip]"));
    const merged = { ...f, ...next };
    setF(merged);
    router.replace(`${pathname}${toQuery(merged)}`, { scroll: false });
  };

  const { visible, order } = useMemo(() => {
    const priceRange = PRICES.find((p) => p.id === f.price);
    const match = (p: ProductLite) =>
      (!f.cat.length || f.cat.includes(p.category)) &&
      (!f.occ || p.occasions.includes(f.occ as OccasionId)) &&
      (!f.color.length || f.color.includes(p.palette)) &&
      (!priceRange || (minPrice(p) >= priceRange.min && minPrice(p) < priceRange.max)) &&
      (!f.sale || p.variants.some((v) => v.compareAt));
    const sorted = [...items].sort((a, b) => {
      switch (f.sort) {
        case "newest":
          return b.addedAt.localeCompare(a.addedAt);
        case "priceAsc":
          return minPrice(a) - minPrice(b);
        case "priceDesc":
          return minPrice(b) - minPrice(a);
        case "rating":
          return b.rating - a.rating || b.reviewCount - a.reviewCount;
        default:
          return a.featured - b.featured;
      }
    });
    return { visible: new Set(sorted.filter(match).map((p) => p.id)), order: new Map(sorted.map((p, i) => [p.id, i])) };
  }, [items, f]);

  useLayoutEffect(() => {
    const F = FlipRef.current;
    const state = flipState.current;
    if (!F || !state) return;
    flipState.current = null;
    F.from(state as Parameters<typeof F.from>[0], {
      duration: 0.8,
      ease: "expo.inOut",
      stagger: 0.015,
      absolute: true,
      scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "expo.out", delay: 0.15 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.4 }),
    });
  }, [visible, order]);

  // first reveal: staggered petal wipes
  useEffect(() => {
    if (!animate || prefersReducedMotion() || !grid.current) return;
    const cards = Array.from(grid.current.querySelectorAll<HTMLElement>("[data-flip]")).filter((c) => c.getBoundingClientRect().top > window.innerHeight * 0.9);
    gsap.set(cards, { clipPath: "inset(100% 0% 0% 0%)", y: 50 });
    const st = cards.map((c) =>
      gsap.to(c, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.2, ease: "expo.out", clearProps: "clipPath,transform", scrollTrigger: { trigger: c, start: "top 92%", once: true } }),
    );
    return () => st.forEach((t) => t.scrollTrigger?.kill());
  }, [animate]);

  const count = visible.size;
  const active = f.color.length + (f.price ? 1 : 0) + (f.sale ? 1 : 0);
  const occName = occasions.find((o) => o.id === f.occ)?.name;
  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const clear = () => update({ cat: [], occ: "", color: [], price: "", sale: false });

  const facets = (
    <div className="space-y-8">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">{d.shop.color}</legend>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button key={c} type="button" aria-pressed={f.color.includes(c)} onClick={() => update({ color: toggle(f.color, c) })} className="chip">
              <span aria-hidden className="h-4 w-4 rounded-full border border-black/10" style={{ background: SWATCH[c] }} />
              {d.colors[c]}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">{d.shop.price}</legend>
        <div className="flex flex-wrap gap-2">
          {PRICES.map((p) => (
            <button key={p.id} type="button" aria-pressed={f.price === p.id} onClick={() => update({ price: f.price === p.id ? "" : p.id })} className="chip tabular-nums">
              {p.max === Infinity ? d.shop.over("10.000") : p.min === 0 ? d.shop.under("3.000") : `${p.min / 1000}–${p.max / 1000}.000`}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="flex cursor-pointer items-center gap-3">
        <input type="checkbox" checked={f.sale} onChange={(e) => update({ sale: e.target.checked })} className="h-5 w-5 accent-[var(--poppy-ink)]" />
        <span className="font-medium">{d.badges.sale}</span>
      </label>
    </div>
  );

  return (
    <div>
      {/* occasions rail */}
      {!calm && (
        <div className="wrap">
          <p className="t-eyebrow mb-4 text-muted">{d.shop.occasionsTitle}</p>
          <ul className="no-scrollbar -mx-[var(--gutter)] flex gap-3 overflow-x-auto px-[var(--gutter)] pb-2" data-cursor="drag" data-cursor-label={d.shop.drag}>
            {occasions.map((o) => {
              const on = f.occ === o.id;
              return (
                <li key={o.id} className="shrink-0">
                  <button type="button" aria-pressed={on} onClick={() => update({ occ: on ? "" : o.id })} className={clsx("group flex items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-5 transition-colors", on ? "border-ink bg-ink text-paper" : "border-line bg-surface hover:border-ink")}>
                    <span className="frame relative h-11 w-11 rounded-full">
                      <Image src={o.image} alt="" fill sizes="44px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    </span>
                    <span className="text-sm font-semibold">{o.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* sticky filter bar */}
      <div ref={bar} className={clsx("sticky z-[40] mt-8 transition-[padding,background-color,box-shadow] duration-500", stuck ? "bg-paper/92 py-2 shadow-[0_1px_0_var(--line)] backdrop-blur-xl" : "py-4")} style={{ top: "calc(var(--header-h) + var(--ribbon-h))" }}>
        <div className="wrap flex flex-wrap items-center gap-2">
          {showCategories && (
            <div className="no-scrollbar -mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1">
              <button type="button" aria-pressed={!f.cat.length} onClick={() => update({ cat: [] })} className="chip shrink-0">
                {d.shop.all}
              </button>
              {categories.map((c) => (
                <button key={c.id} type="button" aria-pressed={f.cat.includes(c.id)} onClick={() => update({ cat: toggle(f.cat, c.id) })} className="chip shrink-0">
                  {c.name}
                </button>
              ))}
            </div>
          )}
          {!showCategories && <p className="flex-1 text-sm text-muted">{d.shop.results(count)}</p>}
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => setSheet(true)} className="chip" aria-haspopup="dialog">
              <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 5h14M6 10h8M8.5 15h3" />
              </svg>
              {d.shop.filters}
              {active > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-poppy-ink px-1 text-[0.7rem] font-bold text-white">{active}</span>}
            </button>
            <label className="sr-only" htmlFor="shop-sort">
              {d.shop.sort}
            </label>
            <select id="shop-sort" value={f.sort} onChange={(e) => update({ sort: e.target.value as Sort })} className="chip appearance-none bg-[length:10px] pr-8" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2317271f' fill='none' stroke-width='1.4'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.9rem center" }}>
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {d.shop.sortOptions[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="wrap mt-4">
        <div className="flex flex-wrap items-center gap-2 text-sm" aria-live="polite">
          {showCategories && <span className="mr-2 text-muted">{d.shop.results(count)}</span>}
          {occName && (
            <button type="button" className="chip !min-h-9 !py-1 text-xs" onClick={() => update({ occ: "" })}>
              {d.occasion}: {occName} ×
            </button>
          )}
          {f.color.map((c) => (
            <button key={c} type="button" className="chip !min-h-9 !py-1 text-xs" onClick={() => update({ color: f.color.filter((x) => x !== c) })}>
              {d.colors[c as PaletteId]} ×
            </button>
          ))}
          {f.price && (
            <button type="button" className="chip !min-h-9 !py-1 text-xs" onClick={() => update({ price: "" })}>
              {d.shop.price}: {f.price.replace("-", "–")} ×
            </button>
          )}
          {f.sale && (
            <button type="button" className="chip !min-h-9 !py-1 text-xs" onClick={() => update({ sale: false })}>
              {d.badges.sale} ×
            </button>
          )}
          {(active > 0 || f.occ || f.cat.length > 0) && (
            <button type="button" onClick={clear} className="link-u ml-1 text-xs font-semibold text-accent">
              {d.shop.clear}
            </button>
          )}
        </div>

        <ul ref={grid} className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
          {items.map((p, i) => (
            <li key={p.id} data-flip data-flip-id={p.id} className={clsx(!visible.has(p.id) && "hidden")} style={{ order: order.get(p.id) }}>
              <ProductCard product={p} locale={locale} priority={i < 2} />
            </li>
          ))}
        </ul>

        {count === 0 && (
          <div className="mx-auto max-w-lg py-20 text-center">
            <svg width="64" height="80" viewBox="0 0 32 40" aria-hidden className="mx-auto text-sand">
              <path d="M16 12 C 12.6 9.4, 12.4 4.2, 16 2.2 C 19.6 4.2, 19.4 9.4, 16 12 Z" fill="currentColor" transform="rotate(30 16 12)" />
              <path d="M16 14 C 16 22, 12 28, 16 38" stroke="currentColor" strokeWidth="1.4" fill="none" strokeDasharray="0.01 3" strokeLinecap="round" />
            </svg>
            <p className="t-h3 mt-6">{d.shop.noResults}</p>
            <p className="mt-3 text-muted">{d.shop.noResultsText}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button type="button" onClick={clear} className="btn btn-primary">
                {d.shop.clear}
              </button>
              <Link href={sr ? "/proizvod/izbor-floristkinje" : "/en/product/florists-choice"} className="btn btn-ghost">
                {sr ? "Izbor floristkinje" : "Florist's Choice"}
              </Link>
            </div>
          </div>
        )}
      </div>

      <Dialog open={sheet} onClose={() => setSheet(false)} label={d.shop.filters}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <p className="t-h3">{d.shop.filters}</p>
          <CloseButton onClick={() => setSheet(false)} label={d.dismiss} />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{facets}</div>
        <div className="grid grid-cols-[1fr_1.4fr] gap-2 border-t border-line px-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
          <button type="button" onClick={clear} className="btn btn-ghost">
            {d.shop.clear}
          </button>
          <button type="button" onClick={() => setSheet(false)} className="btn btn-accent">
            {d.shop.apply} · {count}
          </button>
        </div>
      </Dialog>
    </div>
  );
}
