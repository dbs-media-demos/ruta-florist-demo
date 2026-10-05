"use client";

import { useEffect, useId, useState } from "react";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";

/**
 * Card payment UI (design only). Card data lives ONLY in this component's state: it is never
 * sent anywhere, never stored, never logged. The parent only learns whether the form is valid,
 * and remounts the component after "payment" to wipe it.
 * A real client would replace this with the bank gateway's hosted fields or redirect.
 */

type Brand = "visa" | "mastercard" | "amex" | "dinacard" | null;

export function detectBrand(n: string): Brand {
  if (/^9891/.test(n)) return "dinacard";
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return null;
}

export function luhn(n: string) {
  let sum = 0;
  let dbl = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = Number(n[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return n.length >= 12 && sum % 10 === 0;
}

const group = (digits: string, brand: Brand) =>
  brand === "amex" ? digits.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" ")) : digits.replace(/(\d{4})(?=\d)/g, "$1 ");

const BrandMark = ({ brand }: { brand: Brand }) => {
  if (brand === "visa") return <span className="font-serif text-xl italic tracking-tight">VISA</span>;
  if (brand === "mastercard")
    return (
      <span className="flex" aria-label="Mastercard">
        <span className="h-6 w-6 rounded-full bg-[#eb001b]" />
        <span className="-ml-2.5 h-6 w-6 rounded-full bg-[#f79e1b] mix-blend-multiply" />
      </span>
    );
  if (brand === "amex") return <span className="text-sm font-black tracking-wider">AMEX</span>;
  if (brand === "dinacard") return <span className="text-sm font-black tracking-wide">Dina<span className="text-poppy-soft">Card</span></span>;
  return <span className="h-6 w-9 rounded bg-white/15" />;
};

export function CardForm({ locale, onValid, showErrors }: { locale: Locale; onValid: (ok: boolean) => void; showErrors: boolean }) {
  const sr = locale === "sr";
  const id = useId();
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [flip, setFlip] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const digits = number.replace(/\D/g, "");
  const brand = detectBrand(digits);
  const [mm, yy] = exp.split("/");
  const now = new Date();
  const expOk = /^\d{2}\/\d{2}$/.test(exp) && Number(mm) >= 1 && Number(mm) <= 12 && (Number(yy) > now.getFullYear() % 100 || (Number(yy) === now.getFullYear() % 100 && Number(mm) >= now.getMonth() + 1));
  const errors = {
    number: !luhn(digits) ? (sr ? "Broj kartice nije ispravan" : "That card number isn't valid") : "",
    name: name.trim().length < 3 ? (sr ? "Unesite ime sa kartice" : "Enter the name on the card") : "",
    exp: !expOk ? (sr ? "Datum isteka nije ispravan (MM/GG)" : "Expiry isn't valid (MM/YY)") : "",
    cvc: !(brand === "amex" ? /^\d{4}$/ : /^\d{3}$/).test(cvc) ? (sr ? "CVC nije ispravan" : "CVC isn't valid") : "",
  };
  const valid = !errors.number && !errors.name && !errors.exp && !errors.cvc;

  useEffect(() => onValid(valid), [valid, onValid]);

  const err = (k: keyof typeof errors) => (showErrors || touched[k]) && errors[k];
  const blur = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const field = (k: keyof typeof errors) => ({ "aria-invalid": !!err(k), "aria-describedby": err(k) ? `${id}-${k}-e` : undefined });

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_17rem] md:items-start">
      <div className="grid gap-4">
        <div>
          <label htmlFor={`${id}-n`} className="field-label">
            {sr ? "Broj kartice" : "Card number"}
          </label>
          <div className="relative">
            <input
              id={`${id}-n`}
              inputMode="numeric"
              autoComplete="cc-number"
              value={number}
              onChange={(e) => setNumber(group(e.target.value.replace(/\D/g, "").slice(0, brand === "amex" ? 15 : 19), detectBrand(e.target.value.replace(/\D/g, ""))))}
              onBlur={() => blur("number")}
              placeholder="4242 4242 4242 4242"
              className="field pr-24 tabular-nums tracking-wider"
              {...field("number")}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-ink px-2 py-1 text-paper">
              <BrandMark brand={brand} />
            </span>
          </div>
          {err("number") && (
            <p id={`${id}-number-e`} className="field-error">
              {errors.number}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${id}-h`} className="field-label">
            {sr ? "Ime na kartici" : "Name on card"}
          </label>
          <input id={`${id}-h`} autoComplete="cc-name" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => blur("name")} className="field uppercase" {...field("name")} />
          {err("name") && (
            <p id={`${id}-name-e`} className="field-error">
              {errors.name}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${id}-e`} className="field-label">
              {sr ? "Važi do" : "Expiry"}
            </label>
            <input
              id={`${id}-e`}
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder={sr ? "MM/GG" : "MM/YY"}
              value={exp}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                setExp(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
              }}
              onBlur={() => blur("exp")}
              className="field tabular-nums"
              {...field("exp")}
            />
            {err("exp") && (
              <p id={`${id}-exp-e`} className="field-error">
                {errors.exp}
              </p>
            )}
          </div>
          <div>
            <label htmlFor={`${id}-c`} className="field-label">
              CVC
            </label>
            <input
              id={`${id}-c`}
              inputMode="numeric"
              autoComplete="cc-csc"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
              onFocus={() => setFlip(true)}
              onBlur={() => {
                setFlip(false);
                blur("cvc");
              }}
              className="field tabular-nums"
              {...field("cvc")}
            />
            {err("cvc") && (
              <p id={`${id}-cvc-e`} className="field-error">
                {errors.cvc}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* card preview that flips to its back while the CVC is focused */}
      <div className="mx-auto w-full max-w-[17rem] [perspective:1000px]" aria-hidden>
        <div className={clsx("relative aspect-[1.586] w-full transition-transform duration-700 ease-[var(--ease-out-expo)] [transform-style:preserve-3d]", flip && "[transform:rotateY(180deg)]")}>
          <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl bg-[radial-gradient(120%_120%_at_0%_0%,#2b4335,#17271f_55%,#0f1b15)] p-4 text-paper shadow-[0_20px_40px_-18px_rgba(15,27,21,0.6)] [backface-visibility:hidden]">
            <div className="flex items-start justify-between">
              <span className="h-7 w-9 rounded-md bg-[linear-gradient(135deg,#d9c38f,#a98b4c)]" />
              <BrandMark brand={brand} />
            </div>
            <p className="font-mono text-[1.02rem] tracking-[0.12em] tabular-nums">{number || "•••• •••• •••• ••••"}</p>
            <div className="flex justify-between text-[0.65rem] uppercase tracking-[0.12em]">
              <span className="max-w-[70%] truncate">{name || (sr ? "IME PREZIME" : "FULL NAME")}</span>
              <span>{exp || "MM/YY"}</span>
            </div>
            <svg viewBox="0 0 32 40" className="pointer-events-none absolute -right-4 -top-2 h-28 w-auto text-paper/[0.06]">
              <path d="M16 12 C 12.6 9.4, 12.4 4.2, 16 2.2 C 19.6 4.2, 19.4 9.4, 16 12 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute inset-0 overflow-hidden rounded-2xl bg-ink-3 text-paper [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="mt-5 h-9 bg-ink-2" />
            <div className="mx-4 mt-4 flex items-center justify-end rounded bg-paper/90 px-3 py-1.5 font-mono text-ink">{cvc || "•••"}</div>
            <p className="mx-4 mt-3 text-[0.6rem] text-paper/60">{sr ? "Demo kartica · ništa se ne šalje" : "Demo card · nothing is sent"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
