"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import type { CartLine, ProductLite } from "@/lib/commerce/types";
import { getDictionary } from "@/i18n/dictionary";
import { formatDate, formatRsd, slotLabel } from "@/lib/format";
import { checkout } from "@/lib/commerce/mock-checkout";
import { removeLine, restoreLine, setPromo, setQty, ui, useBag } from "@/lib/commerce/store";
import { zoneById } from "@/content/zones";
import { delivery } from "@/lib/site";
import { Price } from "@/components/shop/Price";
import { addProductToBag } from "@/components/shop/add";

const productHref = (locale: Locale, l: CartLine) => (l.slug[locale] ? `${locale === "sr" ? "/proizvod" : "/en/product"}/${l.slug[locale]}` : undefined);

/** Free-delivery progress in central zones. */
export function FreeShipBar({ locale, subtotal }: { locale: Locale; subtotal: number }) {
  const d = getDictionary(locale).bag;
  const pct = Math.min(100, (subtotal / delivery.freeOver) * 100);
  const missing = Math.max(0, delivery.freeOver - subtotal);
  return (
    <div>
      <p className="text-sm">{missing > 0 ? d.freeShip(formatRsd(missing)) : <span className="font-semibold text-moss">✓ {d.freeShipDone}</span>}</p>
      <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={d.freeShipDone}>
        <div className="absolute inset-y-0 left-0 rounded-full bg-poppy transition-[width] duration-700 ease-[var(--ease-out-expo)]" style={{ width: `${pct}%` }} />
        <span className="absolute top-1/2 -translate-y-1/2 text-[0.6rem] transition-[left] duration-700" style={{ left: `calc(${pct}% - 6px)` }} aria-hidden>
          ✿
        </span>
      </div>
    </div>
  );
}

export function QtyStepper({ line, locale, size = "md" }: { line: CartLine; locale: Locale; size?: "sm" | "md" }) {
  const d = getDictionary(locale).bag;
  const btn = clsx("grid place-items-center rounded-full hover:bg-surface-2 disabled:opacity-30", size === "sm" ? "h-9 w-9" : "h-11 w-11");
  return (
    <div className="inline-flex items-center rounded-full border border-line" role="group" aria-label={`${d.qty}: ${line.name[locale]}`}>
      <button type="button" className={btn} onClick={() => setQty(line.key, line.qty - 1)} disabled={line.qty <= 1} aria-label={d.decrease}>
        −
      </button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {line.qty}
      </span>
      <button type="button" className={btn} onClick={() => setQty(line.key, line.qty + 1)} disabled={line.qty >= line.maxQty} aria-label={d.increase}>
        +
      </button>
    </div>
  );
}

/** Line items with remove + undo. */
export function BagLines({ locale, onNavigate, large }: { locale: Locale; onNavigate?: () => void; large?: boolean }) {
  const d = getDictionary(locale).bag;
  const bag = useBag();
  const [undo, setUndo] = useState<{ line: CartLine; index: number } | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const remove = (key: string) => {
    const removed = removeLine(key);
    if (!removed) return;
    setUndo(removed);
    ui.announce(`${removed.line.name[locale]} ${d.removed}`);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setUndo(null), 6000);
  };

  return (
    <div>
      <ul className="divide-y divide-line">
        {bag.lines.map((l) => {
          const href = productHref(locale, l);
          return (
            <li key={l.key} className="flex gap-4 py-4">
              <div className={clsx("frame shrink-0 rounded-xl", large ? "h-32 w-26" : "h-24 w-20")}>
                <Image src={l.image} alt="" fill sizes="104px" className="object-cover" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {href ? (
                      <Link href={href} onClick={onNavigate} className={clsx("font-serif leading-tight hover:text-poppy-ink", large ? "text-xl" : "text-lg")}>
                        {l.name[locale]}
                      </Link>
                    ) : (
                      <p className={clsx("font-serif leading-tight", large ? "text-xl" : "text-lg")}>{l.name[locale]}</p>
                    )}
                    <p className="mt-0.5 text-sm text-muted">
                      {l.variantLabel[locale]}
                      {l.paletteLabel && ` · ${l.paletteLabel[locale]}`}
                      {l.vase && ` · ${locale === "sr" ? "+ vaza" : "+ vase"}`}
                    </p>
                    {l.recipe && <p className="mt-0.5 line-clamp-2 text-xs text-muted">{l.recipe.map((r) => r[locale]).join(", ")}</p>}
                  </div>
                  <Price amount={l.unit * l.qty} locale={locale} size="sm" eur={false} className="shrink-0" />
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <QtyStepper line={l} locale={locale} size="sm" />
                  <button type="button" onClick={() => remove(l.key)} className="link-u text-sm text-muted hover:text-fg">
                    {d.remove}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div role="status" className={clsx("overflow-hidden transition-[max-height,opacity] duration-500", undo ? "max-h-24 opacity-100" : "max-h-0 opacity-0")}>
        {undo && (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-4 py-3 text-sm">
            <span>
              <strong className="font-semibold">{undo.line.name[locale]}</strong> {d.removed}
            </span>
            <button
              type="button"
              onClick={() => {
                restoreLine(undo);
                setUndo(null);
              }}
              className="font-semibold text-poppy-ink underline underline-offset-4"
            >
              {d.undo}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function PromoField({ locale }: { locale: Locale }) {
  const d = getDictionary(locale).bag;
  const bag = useBag();
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  if (bag.promo) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-dashed border-moss/50 px-4 py-3 text-sm">
        <span>
          ✓ {d.promoOk}: <strong className="font-semibold tracking-wider">{bag.promo}</strong>
        </span>
        <button type="button" className="link-u text-muted" onClick={() => setPromo(undefined)}>
          {d.removePromo}
        </button>
      </div>
    );
  }
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const r = checkout.validatePromo(code);
        if (r.ok) {
          setPromo(r.code);
          setErr(false);
          ui.announce(d.promoOk);
        } else setErr(true);
      }}
    >
      <label htmlFor="promo" className="field-label">
        {d.promo}
      </label>
      <div className="flex gap-2">
        <input
          id="promo"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setErr(false);
          }}
          className="field !min-h-11 uppercase"
          autoComplete="off"
          aria-invalid={err}
          aria-describedby={err ? "promo-err" : undefined}
        />
        <button className="btn btn-ghost !min-h-11 shrink-0">{d.apply}</button>
      </div>
      {err && (
        <p id="promo-err" className="field-error">
          {d.promoBad}
        </p>
      )}
    </form>
  );
}

export function Totals({ locale, zoneId, className }: { locale: Locale; zoneId?: string; className?: string }) {
  const d = getDictionary(locale).bag;
  const bag = useBag();
  const zone = zoneId ?? bag.delivery?.zone;
  const t = checkout.totals(bag.lines, bag.promo, zone);
  return (
    <dl className={clsx("space-y-2 text-sm", className)}>
      <div className="flex justify-between">
        <dt>{d.subtotal}</dt>
        <dd className="t-price">{formatRsd(t.subtotal)}</dd>
      </div>
      {t.discount > 0 && (
        <div className="flex justify-between text-moss">
          <dt>
            {d.discount} ({bag.promo})
          </dt>
          <dd className="t-price">−{formatRsd(t.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt>
          {d.shipping}
          {zone && zoneById(zone) ? <span className="text-muted"> · {zoneById(zone)!.name}</span> : null}
        </dt>
        <dd className="t-price">{t.shipping.price === 0 ? d.free : zone ? formatRsd(t.shipping.price) : d.shippingFrom}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-line pt-3 text-base">
        <dt className="font-semibold">{d.total}</dt>
        <dd>
          <Price amount={t.total} locale={locale} className="text-lg" />
        </dd>
      </div>
      <p className="text-xs text-muted">{d.vat}</p>
    </dl>
  );
}

export function DeliverySummary({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const bag = useBag();
  if (!bag.delivery) return null;
  return (
    <p className="flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-3 text-sm">
      <span aria-hidden>🚲</span>
      <span>
        {d.bag.deliveryFor}: <strong className="font-semibold">{formatDate(new Date(`${bag.delivery.date}T12:00:00Z`), locale)}</strong> · {slotLabel(bag.delivery.slot)}
      </span>
    </p>
  );
}

/** Small add-on rail ("goes nicely with"). */
export function CrossSells({ locale, items }: { locale: Locale; items: ProductLite[] }) {
  const d = getDictionary(locale).bag;
  const bag = useBag();
  const shown = items.filter((p) => !bag.lines.some((l) => l.productId === p.id)).slice(0, 3);
  if (!shown.length) return null;
  return (
    <div>
      <p className="t-eyebrow text-muted">{d.alsoLike}</p>
      <ul className="mt-3 grid grid-cols-3 gap-3">
        {shown.map((p) => (
          <li key={p.id} className="group">
            <div className="frame aspect-square rounded-xl">
              <Image src={p.images[0]} alt="" fill sizes="120px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <p className="mt-1.5 truncate text-xs font-medium">{p.name[locale]}</p>
            <p className="text-xs text-muted">{formatRsd(p.variants[0].price)}</p>
            <button
              type="button"
              onClick={(e) => addProductToBag({ product: p, variantId: p.variants[0].id, locale, source: (e.currentTarget.parentElement?.querySelector("img") as HTMLElement) ?? null, openDrawer: false })}
              className="mt-1 text-xs font-semibold text-poppy-ink underline underline-offset-4"
              aria-label={`${locale === "sr" ? "Dodaj" : "Add"} ${p.name[locale]}`}
            >
              + {locale === "sr" ? "Dodaj" : "Add"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
