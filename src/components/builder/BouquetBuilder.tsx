"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/i18n/dictionary";
import { builderPrice, moods, papers, recipe, sizes, stems, type PaperId, type SizeId } from "@/content/builder";
import { formatRsd } from "@/lib/format";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useBag } from "@/lib/commerce/store";
import { DeliveryPicker } from "@/components/shop/DeliveryPicker";
import { addCustomToBag } from "@/components/shop/add";
import { BouquetStage, type StagedStem } from "./BouquetStage";

const MAX_KINDS = 5;

/** Build-a-bouquet: the arrangement composes itself from cut-outs as you choose; price updates live. */
export function BouquetBuilder({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const sr = locale === "sr";
  const bag = useBag();
  const [size, setSize] = useState<SizeId>("m");
  const [mood, setMood] = useState<string>("soft");
  const [picked, setPicked] = useState<string[]>([...moods[0].picks]);
  const [paper, setPaper] = useState<PaperId>("kraft");
  const [needDelivery, setNeedDelivery] = useState(false);
  const [busy, setBusy] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);

  const price = builderPrice(picked, size, paper);
  const rec = recipe(picked, size);
  const paperObj = papers.find((p) => p.id === paper)!;

  // animate the price like an odometer
  useEffect(() => {
    const el = priceRef.current;
    if (!el) return;
    if (prefersReducedMotion() || shown.current === 0) {
      shown.current = price;
      el.textContent = formatRsd(price);
      return;
    }
    const o = { v: shown.current };
    gsap.to(o, { v: price, duration: 0.6, ease: "power2.out", onUpdate: () => (el.textContent = formatRsd(Math.round(o.v / 10) * 10)) });
    shown.current = price;
  }, [price]);

  // spread the recipe into visible stems (at most 14 on stage)
  const staged: StagedStem[] = useMemo(() => {
    const total = rec.reduce((a, r) => a + r.count, 0) || 1;
    const cap = Math.min(14, total);
    return rec.flatMap((r) => {
      const n = Math.max(1, Math.round((r.count / total) * cap));
      return Array.from({ length: n }, (_, i) => ({ key: `${r.stem.id}-${i}`, image: r.stem.image, head: r.stem.head, kind: r.stem.kind }));
    });
  }, [rec]);

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? (p.length > 1 ? p.filter((x) => x !== id) : p) : p.length >= MAX_KINDS ? p : [...p, id]));

  const add = async () => {
    if (!bag.delivery) {
      setNeedDelivery(true);
      document.getElementById("builder-delivery")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setBusy(true);
    const sizeObj = sizes.find((s) => s.id === size)!;
    await addCustomToBag({
      name: { sr: "Vaš buket", en: "Your bouquet" },
      price,
      image: "/images/products/florists-choice-1.jpg",
      recipe: [...rec.map((r) => ({ sr: `${r.count}× ${r.stem.name.sr}`, en: `${r.count}× ${r.stem.name.en}` })), { sr: `papir ${paperObj.name.sr}`, en: `${paperObj.name.en} paper` }],
      sizeLabel: sizeObj.name,
      source: stageRef.current,
      locale,
    });
    setBusy(false);
  };

  const step = (n: number, title: string) => (
    <p className="flex items-center gap-3 font-serif text-2xl">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-ink font-sans text-sm font-bold text-paper">{n}</span>
      {title}
    </p>
  );

  return (
    <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr]">
      {/* stage */}
      <div className="lg:sticky lg:top-[calc(var(--header-h)+var(--ribbon-h)+1rem)] lg:self-start">
        <div className="relative overflow-hidden rounded-[2rem] bg-linen p-6 md:p-10">
          <div aria-hidden className="absolute inset-[12%] rounded-full bg-paper/80 blur-3xl" />
          <BouquetStage ref={stageRef} items={staged} paper={paperObj} className="relative mx-auto max-w-[30rem]" label={`${sr ? "Vaš buket" : "Your bouquet"}: ${rec.map((r) => `${r.count} ${r.stem.name[locale]}`).join(", ")}`} />
          <div className="relative mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted">{sizes.find((s) => s.id === size)!.name[locale]} · {rec.reduce((a, r) => a + r.count, 0)} {sr ? "stabala" : "stems"}</p>
              <p className="t-price text-3xl" aria-live="polite">
                <span ref={priceRef}>{formatRsd(price)}</span>
              </p>
            </div>
            <p className="max-w-[14rem] text-right text-xs text-muted">{rec.map((r) => `${r.count}× ${r.stem.name[locale]}`).join(" · ")}</p>
          </div>
        </div>
      </div>

      {/* choices */}
      <div className="space-y-10">
        <fieldset>
          <legend>{step(1, sr ? "Veličina" : "Size")}</legend>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {sizes.map((s) => (
              <label key={s.id} className="chip !rounded-2xl flex-col !gap-0 !py-2.5">
                <input type="radio" name="b-size" checked={size === s.id} onChange={() => setSize(s.id)} className="sr-input" />
                <span className="font-semibold">{s.name[locale]}</span>
                <span className="text-[0.72rem] opacity-70">{s.stems} {sr ? "stabala" : "stems"}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>{step(2, sr ? "Paleta" : "Palette")}</legend>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {moods.map((m) => (
              <label key={m.id} className="chip !h-auto !justify-start !rounded-2xl !p-2.5">
                <input
                  type="radio"
                  name="b-mood"
                  checked={mood === m.id}
                  onChange={() => {
                    setMood(m.id);
                    setPicked([...m.picks]);
                  }}
                  className="sr-input"
                />
                <span aria-hidden className="h-8 w-8 shrink-0 rounded-full border border-black/10" style={{ background: m.swatch }} />
                <span className="font-semibold">{m.name[locale]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>{step(3, sr ? "Cveće" : "Stems")}</legend>
          <p className="mt-2 text-sm text-muted">{sr ? `Izaberite do ${MAX_KINDS} vrsta.` : `Choose up to ${MAX_KINDS} kinds.`}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {stems.map((s) => {
              const on = picked.includes(s.id);
              const disabled = !on && picked.length >= MAX_KINDS;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  disabled={disabled}
                  onClick={() => toggle(s.id)}
                  className={clsx("group relative flex flex-col items-center rounded-2xl border p-2 pb-3 text-center transition-colors disabled:opacity-40", on ? "border-ink bg-surface" : "border-line hover:border-ink")}
                >
                  <span className="relative block h-20 w-full">
                    <Image src={s.image} alt="" fill sizes="96px" className="object-contain transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
                  </span>
                  <span className="mt-1 text-xs font-semibold leading-tight">{s.name[locale]}</span>
                  <span className="text-[0.68rem] text-muted">{formatRsd(s.price)}</span>
                  {on && <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-poppy text-[0.6rem] text-white">✓</span>}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend>{step(4, sr ? "Papir" : "Wrapping")}</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {papers.map((p) => (
              <label key={p.id} className="chip">
                <input type="radio" name="b-paper" checked={paper === p.id} onChange={() => setPaper(p.id)} className="sr-input" />
                <span aria-hidden className="h-5 w-5 rounded-full border border-black/10" style={{ background: p.color }} />
                {p.name[locale]}
                {p.price > 0 && <span className="text-xs opacity-70">+{p.price}</span>}
              </label>
            ))}
          </div>
        </fieldset>

        <div id="builder-delivery">
          {step(5, sr ? "Termin i korpa" : "Delivery & bag")}
          <div className="mt-4">
            <DeliveryPicker locale={locale} invalid={needDelivery && !bag.delivery} />
          </div>
          <button type="button" onClick={add} disabled={busy} className="btn btn-accent mt-6 w-full !min-h-14 text-base">
            {busy ? d.product.adding : d.product.add} · <span className="t-price">{formatRsd(price)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
