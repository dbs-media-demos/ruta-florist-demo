"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import type { CheckoutDraft } from "@/lib/commerce/types";
import { getDictionary } from "@/i18n/dictionary";
import { checkout } from "@/lib/commerce/mock-checkout";
import { bagCount, clearBag, setCard, setDelivery, useBag } from "@/lib/commerce/store";
import { zones } from "@/content/zones";
import { formatDate, formatRsd, slotLabel } from "@/lib/format";
import { DeliveryPicker } from "@/components/shop/DeliveryPicker";
import { CardEditor, PaperCard } from "@/components/shop/CardMessage";
import { Totals, PromoField } from "@/components/cart/BagParts";
import { Dialog, CloseButton } from "@/components/ui/Dialog";
import { CardForm } from "./CardForm";

type Step = 1 | 2 | 3 | 4 | 5;
type Errors = Record<string, string>;

const phoneOk = (s: string) => s.replace(/\D/g, "").length >= 8;
const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());

function Field({ id, label, error, children, hint }: { id: string; label: string; error?: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-e`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function StepShell({ n, step, onEdit, editLabel, title, summary, children }: { n: Step; step: Step; onEdit: (n: Step) => void; editLabel: string; title: string; summary?: ReactNode; children: ReactNode }) {
  const open = step === n;
  const done = step > n;
  return (
    <section id={`step-${n}`} className={clsx("scroll-mt-36 rounded-[1.5rem] border transition-colors", open ? "border-fg/25 bg-surface" : "border-line")} aria-labelledby={`step-${n}-t`}>
      <div className="flex items-center justify-between gap-4 p-5 md:p-6">
        <h2 id={`step-${n}-t`} className="flex items-center gap-3 font-serif text-xl md:text-2xl">
          <span className={clsx("grid h-8 w-8 place-items-center rounded-full font-sans text-sm font-bold", done ? "bg-moss text-paper" : open ? "bg-ink text-paper" : "bg-surface-2 text-muted")}>{done ? "✓" : n}</span>
          {title}
        </h2>
        {done && (
          <button type="button" onClick={() => onEdit(n)} className="link-u text-sm font-semibold">
            {editLabel}
          </button>
        )}
      </div>
      {done && summary && <div className="-mt-2 px-5 pb-5 pl-[4.25rem] text-sm text-muted md:px-6 md:pl-[4.75rem]">{summary}</div>}
      <div className={clsx("grid transition-[grid-template-rows] duration-700 ease-[var(--ease-out-expo)]", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden" inert={!open}>
          <div className="px-5 pb-6 md:px-6">{children}</div>
        </div>
      </div>
    </section>
  );
}

/**
 * Checkout: calm, step by step. Contact → recipient & address → delivery window → payment →
 * review & pay. Two columns on desktop with a sticky summary; an accordion summary on phones.
 * Demo only: nothing is charged and nothing leaves the browser.
 */
export function Checkout({ locale, successHref, shopHref, cartHref }: { locale: Locale; successHref: string; shopHref: string; cartHref: string }) {
  const d = getDictionary(locale);
  const sr = locale === "sr";
  const router = useRouter();
  const bag = useBag();
  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<Errors>({});
  const [express, setExpress] = useState(false);
  const [cardValid, setCardValid] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [paying, setPaying] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<CheckoutDraft>({
    email: "",
    sender: { name: "", phone: "" },
    recipient: { name: "", phone: "", street: "", apartment: "", zone: "", notes: "" },
    recipientIsBuyer: false,
    surprise: false,
    delivery: { date: "", slot: "" },
    payment: "card",
  });

  const zone = draft.recipient.zone || bag.delivery?.zone || "";
  const t = checkout.totals(bag.lines, bag.promo, zone || undefined);
  const count = bagCount(bag);

  const onCardValid = useCallback((ok: boolean) => setCardValid(ok), []);

  const set = (patch: Partial<CheckoutDraft>) => setDraft((x) => ({ ...x, ...patch }));
  const setR = (patch: Partial<CheckoutDraft["recipient"]>) => setDraft((x) => ({ ...x, recipient: { ...x.recipient, ...patch } }));

  const focusFirstError = () => window.setTimeout(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(), 30);

  const validate = (s: Step): Errors => {
    const e: Errors = {};
    if (s === 1) {
      if (!emailOk(draft.email)) e.email = d.forms.invalidEmail;
      if (draft.sender.name.trim().length < 2) e.sname = d.forms.required;
      if (!phoneOk(draft.sender.phone)) e.sphone = d.forms.invalidPhone;
    }
    if (s === 2) {
      if (!draft.recipientIsBuyer && draft.recipient.name.trim().length < 2) e.rname = d.forms.required;
      if (!draft.recipientIsBuyer && !phoneOk(draft.recipient.phone)) e.rphone = d.forms.invalidPhone;
      if (draft.recipient.street.trim().length < 5 || !/\d/.test(draft.recipient.street)) e.street = sr ? "Unesite ulicu i broj, npr. Cara Dušana 12" : "Enter the street and number, e.g. Cara Dušana 12";
      if (!zone) e.zone = sr ? "Izaberite zonu dostave" : "Choose a delivery zone";
    }
    if (s === 3) {
      if (!bag.delivery?.date || !bag.delivery?.slot) e.delivery = d.product.required;
    }
    if (s === 4) {
      if (draft.payment === "card" && !cardValid) e.card = sr ? "Proverite podatke sa kartice" : "Check your card details";
      if (draft.payment === "cod" && !draft.recipientIsBuyer) e.payment = sr ? "Pouzećem je moguće samo kada ste vi primalac" : "Cash on delivery only works when you are the recipient";
    }
    return e;
  };

  const next = (s: Step) => {
    const e = validate(s);
    setErrors(e);
    if (Object.keys(e).length) return focusFirstError();
    setStep((s + 1) as Step);
    window.setTimeout(() => document.getElementById(`step-${s + 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const pay = async () => {
    for (const s of [1, 2, 3, 4] as Step[]) {
      const e = validate(s);
      if (Object.keys(e).length) {
        setErrors(e);
        setStep(s);
        return focusFirstError();
      }
    }
    setPaying(true);
    const recipient = { ...(draft.recipientIsBuyer ? { ...draft.recipient, name: draft.sender.name, phone: draft.sender.phone } : draft.recipient), zone };
    const order = await checkout.placeOrder({
      draft: { ...draft, recipient, delivery: { ...bag.delivery!, zone: recipient.zone }, card: bag.card },
      lines: bag.lines,
      promo: bag.promo,
    });
    try {
      sessionStorage.setItem("ruta-last-order", JSON.stringify(order));
    } catch {}
    // wipe the card fields by remounting the form, then clear the bag
    setCardKey((k) => k + 1);
    setCardValid(false);
    clearBag();
    router.push(successHref);
  };

  if (count === 0 && !paying) {
    return (
      <div className="wrap py-20 text-center">
        <p className="t-h2">{d.bag.empty}</p>
        <p className="t-lead mt-4">{d.bag.emptyText}</p>
        <Link href={shopHref} className="btn btn-primary mt-8">
          {d.bag.emptyCta} →
        </Link>
      </div>
    );
  }

  const inputProps = (key: string) => ({ "aria-invalid": !!errors[key], "aria-describedby": errors[key] ? `co-${key}-e` : undefined, className: "field" });

  const summary = (
    <div className="space-y-5">
      <ul className="divide-y divide-line">
        {bag.lines.map((l) => (
          <li key={l.key} className="flex items-center gap-3 py-3">
            <span className="frame relative h-16 w-13 shrink-0 rounded-lg">
              <Image src={l.image} alt="" fill sizes="52px" className="object-cover" />
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.65rem] font-bold text-paper">{l.qty}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-serif">{l.name[locale]}</span>
              <span className="block truncate text-xs text-muted">{l.variantLabel[locale]}</span>
            </span>
            <span className="t-price text-sm">{formatRsd(l.unit * l.qty)}</span>
          </li>
        ))}
      </ul>
      {bag.card && <PaperCard text={bag.card.text} from={bag.card.from} className="rotate-[-1deg] scale-95" />}
      <PromoField locale={locale} />
      <Totals locale={locale} zoneId={zone || undefined} />
    </div>
  );

  return (
    <div ref={formRef}>
      {/* demo notice */}
      <div className="wrap">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-dashed border-poppy-ink/40 bg-poppy/5 px-4 py-3 text-sm" role="note">
          <strong className="font-semibold">{sr ? "Demo prodavnica, ništa se ne naplaćuje." : "Demo store, no payment is taken."}</strong>
          <span>
            {sr ? "Test kartica" : "Test card"} <span className="font-mono tracking-wider">4242 4242 4242 4242</span>. {sr ? "Forma za karticu je samo dizajn: podaci ne napuštaju vaš pregledač." : "The card form is a design only: details never leave your browser."}
          </span>
        </p>
      </div>

      <div className="wrap mt-8 grid gap-10 lg:grid-cols-[1.35fr_1fr]">
        {/* mobile summary */}
        <div className="rounded-2xl border border-line lg:hidden">
          <button type="button" onClick={() => setSummaryOpen((o) => !o)} className="flex w-full items-center justify-between p-4 text-left" aria-expanded={summaryOpen}>
            <span className="font-semibold">
              {summaryOpen ? (sr ? "Sakrij porudžbinu" : "Hide order") : sr ? "Prikaži porudžbinu" : "Show order"} ({count})
            </span>
            <span className="t-price">{formatRsd(t.total)}</span>
          </button>
          <div className={clsx("grid transition-[grid-template-rows] duration-500", summaryOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
            <div className="overflow-hidden" inert={!summaryOpen}>
              <div className="px-4 pb-4">{summary}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* express */}
          <div className="rounded-[1.5rem] border border-line p-5 md:p-6">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted">{sr ? "Brzo plaćanje" : "Express checkout"}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { k: "apple", label: " Pay", cls: "bg-black text-white" },
                { k: "google", label: "G Pay", cls: "bg-white text-ink border border-line" },
                { k: "paypal", label: "PayPal", cls: "bg-[#ffc439] text-[#253b80] italic font-black" },
              ].map((b) => (
                <button key={b.k} type="button" onClick={() => setExpress(true)} className={clsx("h-12 rounded-xl text-base font-semibold", b.cls)}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <StepShell n={1} step={step} onEdit={setStep} editLabel={sr ? "Izmeni" : "Edit"} title={sr ? "Kontakt i pošiljalac" : "Contact & sender"} summary={`${draft.sender.name} · ${draft.email} · ${draft.sender.phone}`}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field id="co-email" label={d.forms.email} error={errors.email} hint={sr ? "Ovde stiže potvrda i fotografija buketa" : "Your confirmation and a photo of the bouquet go here"}>
                  <input id="co-email" type="email" autoComplete="email" value={draft.email} onChange={(e) => set({ email: e.target.value })} {...inputProps("email")} />
                </Field>
              </div>
              <Field id="co-sname" label={sr ? "Vaše ime i prezime" : "Your full name"} error={errors.sname}>
                <input id="co-sname" autoComplete="name" value={draft.sender.name} onChange={(e) => set({ sender: { ...draft.sender, name: e.target.value } })} {...inputProps("sname")} />
              </Field>
              <Field id="co-sphone" label={sr ? "Vaš telefon" : "Your phone"} error={errors.sphone}>
                <input id="co-sphone" type="tel" autoComplete="tel" value={draft.sender.phone} onChange={(e) => set({ sender: { ...draft.sender, phone: e.target.value } })} placeholder="+381 64 000 0000" {...inputProps("sphone")} />
              </Field>
            </div>
            <button type="button" onClick={() => next(1)} className="btn btn-primary mt-6">
              {sr ? "Nastavi na primaoca" : "Continue to recipient"} →
            </button>
          </StepShell>

          <StepShell
            n={2}
            step={step}
            onEdit={setStep}
            editLabel={sr ? "Izmeni" : "Edit"}
            title={sr ? "Primalac i adresa" : "Recipient & address"}
            summary={`${draft.recipientIsBuyer ? draft.sender.name : draft.recipient.name} · ${draft.recipient.street}, ${zones.find((z) => z.id === zone)?.name ?? ""}${draft.surprise ? (sr ? " · iznenađenje" : " · surprise") : ""}`}
          >
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-surface-2 p-4">
              <input type="checkbox" checked={draft.recipientIsBuyer} onChange={(e) => set({ recipientIsBuyer: e.target.checked, surprise: e.target.checked ? false : draft.surprise })} className="h-5 w-5 accent-[var(--poppy-ink)]" />
              <span className="text-sm font-medium">{sr ? "Cveće je za mene (ja sam primalac)" : "The flowers are for me (I'm the recipient)"}</span>
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {!draft.recipientIsBuyer && (
                <>
                  <Field id="co-rname" label={sr ? "Ime primaoca" : "Recipient's name"} error={errors.rname}>
                    <input id="co-rname" value={draft.recipient.name} onChange={(e) => setR({ name: e.target.value })} {...inputProps("rname")} />
                  </Field>
                  <Field id="co-rphone" label={sr ? "Telefon primaoca" : "Recipient's phone"} error={errors.rphone} hint={sr ? "Kurir zove samo ako ne može da uđe" : "The courier only calls if they can't get in"}>
                    <input id="co-rphone" type="tel" value={draft.recipient.phone} onChange={(e) => setR({ phone: e.target.value })} placeholder="+381 64 000 0000" {...inputProps("rphone")} />
                  </Field>
                </>
              )}
              <div className="sm:col-span-2">
                <Field id="co-street" label={sr ? "Ulica i broj" : "Street and number"} error={errors.street}>
                  <input id="co-street" autoComplete="street-address" value={draft.recipient.street} onChange={(e) => setR({ street: e.target.value })} placeholder={sr ? "Cara Dušana 12" : "Cara Dušana 12"} {...inputProps("street")} />
                </Field>
              </div>
              <Field id="co-apt" label={sr ? "Sprat, stan, interfon (opciono)" : "Floor, flat, buzzer (optional)"}>
                <input id="co-apt" value={draft.recipient.apartment} onChange={(e) => setR({ apartment: e.target.value })} className="field" />
              </Field>
              <Field id="co-zone" label={sr ? "Zona dostave" : "Delivery zone"} error={errors.zone}>
                <select
                  id="co-zone"
                  value={zone}
                  onChange={(e) => {
                    setR({ zone: e.target.value });
                    if (bag.delivery) setDelivery({ ...bag.delivery, zone: e.target.value });
                  }}
                  {...inputProps("zone")}
                >
                  <option value="">{sr ? "Izaberite…" : "Choose…"}</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} · {z.price === 0 ? (sr ? "besplatno" : "free") : formatRsd(z.price)}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field id="co-notes" label={sr ? "Napomena za kurira (opciono)" : "Note for the courier (optional)"}>
                  <textarea id="co-notes" rows={2} value={draft.recipient.notes} onChange={(e) => setR({ notes: e.target.value })} className="field resize-none" />
                </Field>
              </div>
            </div>
            {!draft.recipientIsBuyer && (
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4">
                <input type="checkbox" role="switch" checked={draft.surprise} onChange={(e) => set({ surprise: e.target.checked })} className="mt-0.5 h-5 w-5 accent-[var(--poppy-ink)]" />
                <span>
                  <span className="block text-sm font-semibold">🎁 {sr ? "Dostava kao iznenađenje" : "Surprise delivery"}</span>
                  <span className="block text-xs text-muted">{sr ? "Ne zovemo primaoca unapred. Ako niko nije kod kuće, zovemo vas." : "We won't call the recipient ahead. If nobody is home, we call you."}</span>
                </span>
              </label>
            )}
            <button type="button" onClick={() => next(2)} className="btn btn-primary mt-6">
              {sr ? "Nastavi na termin" : "Continue to delivery time"} →
            </button>
          </StepShell>

          <StepShell
            n={3}
            step={step}
            onEdit={setStep}
            editLabel={sr ? "Izmeni" : "Edit"}
            title={sr ? "Termin dostave" : "Delivery window"}
            summary={bag.delivery?.date ? `${formatDate(new Date(`${bag.delivery.date}T12:00:00Z`), locale, { weekday: "long", day: "numeric", month: "long" })} · ${slotLabel(bag.delivery.slot)}` : ""}
          >
            <DeliveryPicker locale={locale} invalid={!!errors.delivery} />
            <p className="mt-3 text-sm">
              {d.bag.shipping}: <strong className="font-semibold">{t.shipping.price === 0 ? d.bag.free : formatRsd(t.shipping.price)}</strong>
              {zone && ` · ${zones.find((z) => z.id === zone)?.name}`}
            </p>
            <button type="button" onClick={() => next(3)} className="btn btn-primary mt-6">
              {sr ? "Nastavi na plaćanje" : "Continue to payment"} →
            </button>
          </StepShell>

          <StepShell n={4} step={step} onEdit={setStep} editLabel={sr ? "Izmeni" : "Edit"} title={sr ? "Plaćanje" : "Payment"} summary={draft.payment === "card" ? (sr ? "Kartica" : "Card") : draft.payment === "cod" ? (sr ? "Pouzećem" : "Cash on delivery") : "IPS QR"}>
            <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={sr ? "Način plaćanja" : "Payment method"}>
              {(
                [
                  { id: "card", label: sr ? "Kartica" : "Card", note: "Visa · Mastercard · DinaCard" },
                  { id: "ips", label: "IPS QR", note: sr ? "m-banking aplikacija" : "mobile banking app" },
                  { id: "cod", label: sr ? "Pouzećem" : "Cash on delivery", note: sr ? "samo kad ste primalac" : "only if you're the recipient" },
                ] as const
              ).map((m) => {
                const disabled = m.id === "cod" && !draft.recipientIsBuyer;
                return (
                  <label key={m.id} className={clsx("chip !h-auto !flex-col !items-start !gap-0.5 !rounded-2xl !p-4 text-left", disabled && "opacity-50")}>
                    <input type="radio" name="pay" value={m.id} checked={draft.payment === m.id} disabled={disabled} onChange={() => set({ payment: m.id })} className="sr-input" />
                    <span className="font-semibold">{m.label}</span>
                    <span className="text-xs opacity-75">{m.note}</span>
                  </label>
                );
              })}
            </div>
            {errors.payment && (
              <p className="field-error" role="alert">
                {errors.payment}
              </p>
            )}
            <div className="mt-6">
              {draft.payment === "card" && (
                <>
                  <CardForm key={cardKey} locale={locale} onValid={onCardValid} showErrors={!!errors.card} />
                  {/* a real client plugs the local bank gateway (e.g. NestPay / Banca Intesa / Raiffeisen) in here */}
                </>
              )}
              {draft.payment === "ips" && (
                <div className="flex flex-col items-center gap-5 rounded-2xl bg-surface-2 p-6 sm:flex-row">
                  <div className="relative grid h-40 w-40 shrink-0 place-items-center rounded-xl bg-white p-3" aria-label={sr ? "Primer IPS QR koda (demo)" : "Sample IPS QR code (demo)"} role="img">
                    <svg viewBox="0 0 29 29" className="h-full w-full" shapeRendering="crispEdges" aria-hidden>
                      {Array.from({ length: 29 * 29 }, (_, i) => {
                        const x = i % 29;
                        const y = Math.floor(i / 29);
                        const finder = (a: number, b: number) => x >= a && x < a + 7 && y >= b && y < b + 7 && (x === a || x === a + 6 || y === b || y === b + 6 || (x >= a + 2 && x <= a + 4 && y >= b + 2 && y <= b + 4));
                        const inFinderZone = (x < 8 && y < 8) || (x > 20 && y < 8) || (x < 8 && y > 20);
                        const on = finder(0, 0) || finder(22, 0) || finder(0, 22) || (!inFinderZone && ((x * 7 + y * 13 + x * y) % 5 < 2));
                        return on ? <rect key={i} x={x} y={y} width="1" height="1" fill="#17271f" /> : null;
                      })}
                    </svg>
                    <span className="absolute grid h-9 w-9 place-items-center rounded-lg bg-white">
                      <svg viewBox="0 0 32 40" className="h-7 w-auto" aria-hidden>
                        <path d="M16 12 C 12.6 9.4, 12.4 4.2, 16 2.2 C 19.6 4.2, 19.4 9.4, 16 12 Z" fill="#e0533a" />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{sr ? "Skeniraj u m-banking aplikaciji" : "Scan in your mobile banking app"}</p>
                    <p className="mt-1 text-sm text-muted">
                      {sr ? "Iznos" : "Amount"}: <strong className="text-fg">{formatRsd(t.total)}</strong> · {sr ? "Primalac: Ruta d.o.o." : "Payee: Ruta d.o.o."}
                    </p>
                    <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-xs text-muted">{sr ? "Demo: ovo nije pravi QR kod. Pravi sajt ga generiše preko banke po NBS IPS standardu." : "Demo: this is not a real QR code. A live site generates it through the bank to the NBS IPS standard."}</p>
                  </div>
                </div>
              )}
              {draft.payment === "cod" && <p className="rounded-2xl bg-surface-2 p-5 text-sm">{sr ? "Plaćate kuriru gotovinom ili karticom pri preuzimanju." : "Pay the courier in cash or by card on delivery."}</p>}
            </div>
            <button type="button" onClick={() => next(4)} className="btn btn-primary mt-6">
              {sr ? "Pregled porudžbine" : "Review order"} →
            </button>
          </StepShell>

          <StepShell n={5} step={step} onEdit={setStep} editLabel={sr ? "Izmeni" : "Edit"} title={sr ? "Pregled i plaćanje" : "Review & pay"}>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-surface-2 p-4">
                <dt className="text-xs text-muted">{sr ? "Primalac" : "Recipient"}</dt>
                <dd className="mt-1 font-medium">
                  {draft.recipientIsBuyer ? draft.sender.name : draft.recipient.name}
                  <br />
                  {draft.recipient.street} {draft.recipient.apartment}
                  <br />
                  {zones.find((z) => z.id === zone)?.name}
                </dd>
              </div>
              <div className="rounded-2xl bg-surface-2 p-4">
                <dt className="text-xs text-muted">{d.bag.deliveryFor}</dt>
                <dd className="mt-1 font-medium">
                  {bag.delivery?.date && formatDate(new Date(`${bag.delivery.date}T12:00:00Z`), locale, { weekday: "long", day: "numeric", month: "long" })}
                  <br />
                  {bag.delivery?.slot && slotLabel(bag.delivery.slot)}
                  {draft.surprise && <span className="block text-poppy-ink">🎁 {sr ? "iznenađenje" : "surprise"}</span>}
                </dd>
              </div>
            </dl>
            <details className="mt-4 rounded-2xl border border-line p-4" open={!bag.card}>
              <summary className="cursor-pointer text-sm font-semibold">✉ {bag.card ? d.bag.giftEdit : d.bag.giftAdd}</summary>
              <div className="mt-4">
                <CardEditor locale={locale} compact value={bag.card} onSave={setCard} />
              </div>
            </details>
            <button type="button" onClick={pay} disabled={paying} className="btn btn-accent mt-6 w-full !min-h-14 text-base" aria-live="polite">
              {paying ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
                  {sr ? "Obrađujemo plaćanje…" : "Processing payment…"}
                </>
              ) : (
                <>
                  {draft.payment === "cod" ? (sr ? "Potvrdi porudžbinu" : "Place order") : `${sr ? "Plati" : "Pay"} ${formatRsd(t.total)}`}
                </>
              )}
            </button>
            <p className="mt-3 text-center text-xs text-muted">
              {sr ? "Klikom potvrđujete " : "By paying you accept the "}
              <Link href={sr ? "/uslovi-koriscenja" : "/en/terms"} className="underline">
                {sr ? "uslove kupovine" : "terms of sale"}
              </Link>
              .
            </p>
          </StepShell>

          <Link href={cartHref} className="link-u inline-block pt-2 text-sm text-muted">
            ← {sr ? "Nazad u korpu" : "Back to bag"}
          </Link>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+var(--ribbon-h)+1.5rem)] rounded-[1.75rem] bg-surface p-7 shadow-[0_20px_60px_-30px_rgba(15,27,21,0.25)]">
            <p className="t-h3 mb-2">{sr ? "Vaša porudžbina" : "Your order"}</p>
            {summary}
          </div>
        </aside>
      </div>

      <Dialog open={express} onClose={() => setExpress(false)} label={sr ? "Brzo plaćanje" : "Express checkout"} variant="modal" className="md:!w-[min(28rem,92vw)]">
        <div className="relative p-8 text-center">
          <CloseButton onClick={() => setExpress(false)} label={d.dismiss} className="absolute right-4 top-4" />
          <p className="text-4xl" aria-hidden>
            ✿
          </p>
          <p className="t-h3 mt-4">{sr ? "Demo prodavnica" : "Demo store"}</p>
          <p className="mt-3 text-muted">{sr ? "Brzo plaćanje je isključeno u demo verziji. Pravi sajt bi ovde otvorio Apple Pay, Google Pay ili PayPal." : "Express pay is disabled in the demo. A live site would open Apple Pay, Google Pay or PayPal here."}</p>
          <button type="button" onClick={() => setExpress(false)} className="btn btn-primary mt-6">
            {sr ? "U redu" : "Got it"}
          </button>
        </div>
      </Dialog>
    </div>
  );
}
