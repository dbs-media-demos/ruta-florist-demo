"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import { formatRsd } from "@/lib/format";
import { addLine, ui } from "@/lib/commerce/store";
import { flyToBag } from "@/components/shop/fly";
import { Mark } from "@/components/brand/Logo";

const AMOUNTS = [2000, 3000, 5000, 10000, 20000];
const DESIGNS = [
  { id: "ink", bg: "bg-[radial-gradient(120%_120%_at_0%_0%,#2b4335,#17271f_60%)] text-paper", name: { sr: "Bašta", en: "Garden" } },
  { id: "blush", bg: "bg-[linear-gradient(135deg,#f7e3da,#f2cdbe)] text-ink", name: { sr: "Ruž", en: "Blush" } },
  { id: "poppy", bg: "bg-[linear-gradient(135deg,#e0533a,#b23a22)] text-white", name: { sr: "Mak", en: "Poppy" } },
];

/** Gift card designer: amount, design, names and message on a live card; adds to the bag. */
export function GiftCardDesigner({ locale }: { locale: Locale }) {
  const sr = locale === "sr";
  const [amount, setAmount] = useState(5000);
  const [design, setDesign] = useState("ink");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const dz = DESIGNS.find((x) => x.id === design)!;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
      <div className="lg:sticky lg:top-[calc(var(--header-h)+var(--ribbon-h)+1.5rem)]">
        <div ref={card} className={clsx("relative mx-auto aspect-[1.6] w-full max-w-[30rem] overflow-hidden rounded-[1.5rem] p-7 shadow-[0_30px_60px_-30px_rgba(15,27,21,0.5)] transition-[background] duration-700", dz.bg)} role="img" aria-label={`${sr ? "Poklon kartica" : "Gift card"} ${formatRsd(amount)}`}>
          <Mark className="absolute -right-6 -top-4 h-[85%] w-auto opacity-15" accent="currentColor" />
          <div className="relative flex h-full flex-col justify-between">
            <p className="font-serif text-2xl">Ruta</p>
            <div>
              <p className="t-hand text-[1.6rem] leading-tight">{msg || (sr ? "Izaberi svoje cveće." : "Pick your own flowers.")}</p>
              <p className="mt-2 text-sm opacity-80">
                {to ? `${sr ? "Za" : "For"} ${to}` : ""}
                {from ? ` · ${sr ? "od" : "from"} ${from}` : ""}
              </p>
            </div>
            <p className="t-price text-3xl">{formatRsd(amount)}</p>
          </div>
        </div>
      </div>

      <form
        noValidate
        className="space-y-7"
        onSubmit={async (e) => {
          e.preventDefault();
          if (to.trim().length < 2) return setErr(true);
          setErr(false);
          addLine({
            productId: "gift-card",
            variantId: `${amount}-${design}`,
            qty: 1,
            name: { sr: "Poklon kartica", en: "Gift card" },
            slug: { sr: "", en: "" },
            variantLabel: { sr: `${formatRsd(amount)} · za ${to}`, en: `${formatRsd(amount)} · for ${to}` },
            image: "/images/studio/flower-wall.jpg",
            unit: amount,
            maxQty: 5,
            needsDelivery: false,
          });
          ui.announce(sr ? "Poklon kartica je dodata u korpu." : "Gift card added to your bag.");
          await flyToBag(card.current);
          ui.bump();
          window.setTimeout(ui.openDrawer, 120);
        }}
      >
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">{sr ? "Iznos" : "Amount"}</legend>
          <div className="flex flex-wrap gap-2">
            {AMOUNTS.map((a) => (
              <label key={a} className="chip tabular-nums">
                <input type="radio" name="gc-amount" checked={amount === a} onChange={() => setAmount(a)} className="sr-input" />
                {formatRsd(a)}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">{sr ? "Dizajn" : "Design"}</legend>
          <div className="flex flex-wrap gap-2">
            {DESIGNS.map((x) => (
              <label key={x.id} className="chip">
                <input type="radio" name="gc-design" checked={design === x.id} onChange={() => setDesign(x.id)} className="sr-input" />
                <span aria-hidden className={clsx("h-5 w-5 rounded-full", x.bg)} />
                {x.name[locale]}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="gc-to" className="field-label">
              {sr ? "Za koga" : "For"} <span className="text-poppy-ink">*</span>
            </label>
            <input id="gc-to" value={to} onChange={(e) => setTo(e.target.value)} className="field" aria-invalid={err} aria-describedby={err ? "gc-err" : undefined} />
            {err && (
              <p id="gc-err" className="field-error">
                {sr ? "Unesite ime primaoca" : "Enter the recipient's name"}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="gc-from" className="field-label">
              {sr ? "Od koga" : "From"}
            </label>
            <input id="gc-from" value={from} onChange={(e) => setFrom(e.target.value)} className="field" />
          </div>
        </div>
        <div>
          <label htmlFor="gc-msg" className="field-label">
            {sr ? "Poruka" : "Message"}
          </label>
          <textarea id="gc-msg" rows={3} maxLength={120} value={msg} onChange={(e) => setMsg(e.target.value)} className="field resize-none" />
        </div>
        <p className="text-sm text-muted">{sr ? "Kartica stiže e-mailom u roku od par minuta i važi 12 meseci, za sve u prodavnici i ateljeu." : "The card arrives by email within minutes and is valid for 12 months, online and in the studio."}</p>
        <button className="btn btn-accent w-full !min-h-14">
          {sr ? "Dodaj u korpu" : "Add to bag"} · {formatRsd(amount)}
        </button>
      </form>
    </div>
  );
}
