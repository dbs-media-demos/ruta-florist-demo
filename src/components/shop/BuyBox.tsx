"use client";

import { useId, useState } from "react";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import type { PaletteId, ProductLite } from "@/lib/commerce/types";
import { getDictionary } from "@/i18n/dictionary";
import { useBag } from "@/lib/commerce/store";
import { VASE_PRICE } from "@/lib/commerce/mock-checkout";
import { Price } from "./Price";
import { DeliveryPicker } from "./DeliveryPicker";
import { addProductToBag } from "./add";
import { CutoffLine } from "@/components/layout/Countdown";

type Props = {
  product: ProductLite;
  locale: Locale;
  /** element to fly from (the product photo) */
  getSource?: () => HTMLElement | null;
  onPalette?: (imageIndex: number) => void;
  onVariant?: (variantId: string) => void;
  compact?: boolean;
  /** id of the add button, so a sticky mobile bar can mirror it */
  addId?: string;
};

/** Variant pickers (accessible radio groups), live price, delivery slot, stock, add / notify. */
export function BuyBox({ product, locale, getSource, onPalette, onVariant, compact, addId }: Props) {
  const d = getDictionary(locale);
  const id = useId();
  const bag = useBag();
  const firstInStock = product.variants.find((v) => v.id === "m" && v.stock > 0) ?? product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstInStock.id);
  const [palette, setPalette] = useState<PaletteId | undefined>(product.palettes?.[0]?.id);
  const [vase, setVase] = useState(false);
  const [busy, setBusy] = useState(false);
  const [missingDelivery, setMissingDelivery] = useState(false);
  const [notify, setNotify] = useState<"idle" | "open" | "done" | "err">("idle");
  const [email, setEmail] = useState("");

  const v = product.variants.find((x) => x.id === variantId) ?? firstInStock;
  const soldOut = v.stock === 0;
  const showVase = product.category === "bouquets" || product.category === "roses";
  const unit = v.price + (vase ? VASE_PRICE : 0);

  const add = async () => {
    if (product.needsDelivery && !bag.delivery) {
      setMissingDelivery(true);
      document.getElementById(`${id}-delivery`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setMissingDelivery(false);
    setBusy(true);
    await addProductToBag({ product, variantId: v.id, palette, vase, locale, source: getSource?.() });
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <Price amount={unit} compareAt={v.compareAt ? v.compareAt + (vase ? VASE_PRICE : 0) : undefined} locale={locale} size="lg" />
        <p className={clsx("text-sm font-medium", soldOut ? "text-poppy-ink" : v.stock <= 2 ? "text-poppy-ink" : "text-moss")} aria-live="polite">
          {soldOut ? d.product.soldOut : v.stock <= 2 ? `● ${d.product.low(v.stock)}` : `● ${d.product.inStock}`}
        </p>
      </div>

      {product.variants.length > 1 && (
        <fieldset>
          <legend className="mb-2.5 text-sm font-semibold">{d.product.size}</legend>
          <div className={clsx("grid gap-2", product.variants.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3")}>
            {product.variants.map((x) => (
              <label key={x.id} className="chip !rounded-2xl flex-col !gap-0 !py-2.5 text-center">
                <input
                  type="radio"
                  name={`${id}-size`}
                  value={x.id}
                  checked={variantId === x.id}
                  disabled={x.stock === 0}
                  onChange={() => {
                    setVariantId(x.id);
                    onVariant?.(x.id);
                  }}
                  className="sr-input"
                />
                <span className="font-semibold">{x.label[locale]}</span>
                {x.note && <span className="text-[0.72rem] opacity-70">{x.note[locale]}</span>}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {product.palettes && (
        <fieldset>
          <legend className="mb-2.5 text-sm font-semibold">
            {d.product.palette}: <span className="font-normal text-muted">{product.palettes.find((p) => p.id === palette)?.label[locale]}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.palettes.map((p) => (
              <label key={p.id} className="chip">
                <input
                  type="radio"
                  name={`${id}-palette`}
                  value={p.id}
                  checked={palette === p.id}
                  onChange={() => {
                    setPalette(p.id);
                    onPalette?.(p.image);
                  }}
                  className="sr-input"
                />
                <span aria-hidden className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: swatch[p.id] }} />
                {p.label[locale]}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {showVase && !soldOut && (
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line p-3.5 hover:border-fg">
          <input type="checkbox" checked={vase} onChange={(e) => setVase(e.target.checked)} className="h-5 w-5 accent-[var(--poppy-ink)]" />
          <span className="flex-1">
            <span className="block text-sm font-semibold">{d.product.vase}</span>
            <span className="block text-xs text-muted">{d.product.vaseNote}</span>
          </span>
        </label>
      )}

      {product.needsDelivery && !soldOut && (
        <div id={`${id}-delivery`}>
          <p className="mb-2 text-sm">
            <CutoffLine locale={locale} className="font-medium" />
          </p>
          <DeliveryPicker locale={locale} invalid={missingDelivery && !bag.delivery} compact={compact} />
        </div>
      )}

      {soldOut ? (
        <div className="rounded-2xl bg-surface-2 p-4">
          {notify === "done" ? (
            <p role="status" className="text-sm">
              ✓ {d.product.notifyOk}
            </p>
          ) : notify === "idle" ? (
            <button type="button" className="btn btn-primary w-full" onClick={() => setNotify("open")}>
              {d.product.notify}
            </button>
          ) : (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                setNotify(/.+@.+\..+/.test(email) ? "done" : "err");
              }}
            >
              <label htmlFor={`${id}-n`} className="field-label">
                {d.product.notifyEmail}
              </label>
              <div className="flex gap-2">
                <input id={`${id}-n`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" aria-invalid={notify === "err"} />
                <button className="btn btn-primary shrink-0">{d.product.notifySend}</button>
              </div>
              {notify === "err" && <p className="field-error">{d.forms.invalidEmail}</p>}
            </form>
          )}
        </div>
      ) : (
        <button id={addId} type="button" onClick={add} disabled={busy} className="btn btn-accent w-full !min-h-14 text-base">
          {busy ? d.product.adding : d.product.add}
          <span className="opacity-70">·</span>
          <span className="t-price">{new Intl.NumberFormat("sr-Latn-RS").format(unit)} RSD</span>
        </button>
      )}
    </div>
  );
}

const swatch: Record<string, string> = {
  white: "#f4f1ea",
  blush: "#f2c3c0",
  bright: "linear-gradient(135deg,#e0533a 0 50%,#f3c64b 50%)",
  sunny: "#f1c84b",
  blue: "#9cb7d8",
  green: "#6f8f6a",
  neutral: "#d6c09a",
};
