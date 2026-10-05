"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import { plans, REGULAR, savingPercent, subsCopy } from "@/content/subscriptions";
import { formatRsd } from "@/lib/format";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/** Subscription plan picker: home/office, rhythm, animated monthly savings, demo sign-up. */
export function PlanPicker({ locale }: { locale: Locale }) {
  const sr = locale === "sr";
  const c = subsCopy;
  const [audience, setAudience] = useState(0);
  const [plan, setPlan] = useState<(typeof plans)[number]["id"]>("weekly");
  const [vase, setVase] = useState(audience === 1);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "err" | "done">("idle");
  const saveRef = useRef<HTMLSpanElement>(null);
  const last = useRef(0);
  const p = plans.find((x) => x.id === plan)!;
  const officeBump = audience === 1 ? 1500 : 0;
  const perDelivery = p.price + officeBump;
  const monthly = perDelivery * p.deliveries;
  const saving = (REGULAR + officeBump - perDelivery) * p.deliveries;

  useEffect(() => {
    const el = saveRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = formatRsd(saving);
      return;
    }
    const o = { v: last.current };
    gsap.to(o, { v: saving, duration: 0.8, ease: "power3.out", onUpdate: () => (el.textContent = formatRsd(Math.round(o.v / 10) * 10)) });
    last.current = saving;
  }, [saving]);

  if (state === "done") {
    return (
      <div className="rounded-[1.75rem] bg-surface p-10 text-center" role="status">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-moss text-2xl text-paper">✓</span>
        <p className="t-h3 mt-5">
          {p.name[locale]} · {formatRsd(perDelivery)}
        </p>
        <p className="mt-3 text-muted">{c.started[locale]}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <div className="inline-flex rounded-full border border-line p-1" role="radiogroup" aria-label={sr ? "Za koga" : "For"}>
          {c.homeOffice[locale].map((label, i) => (
            <button key={label} type="button" role="radio" aria-checked={audience === i} onClick={() => setAudience(i)} className={clsx("rounded-full px-5 py-2.5 text-sm font-semibold transition-colors", audience === i ? "bg-ink text-paper" : "hover:bg-surface-2")}>
              {label}
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3" role="radiogroup" aria-label={c.choose[locale]}>
          {plans.map((x) => {
            const on = x.id === plan;
            return (
              <button key={x.id} type="button" role="radio" aria-checked={on} onClick={() => setPlan(x.id)} className={clsx("group overflow-hidden rounded-[1.5rem] border text-left transition-[border-color,transform] duration-500", on ? "-translate-y-1 border-ink" : "border-line hover:border-ink/40")}>
                <div className="frame relative aspect-[4/3]">
                  <Image src={x.image} alt="" fill sizes="(min-width: 768px) 22vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-full bg-poppy-ink px-2.5 py-1 text-xs font-bold text-white">−{savingPercent(x.price)}%</span>
                </div>
                <div className="p-5">
                  <p className="font-serif text-2xl">{x.name[locale]}</p>
                  <p className="text-sm text-muted">{x.every[locale]}</p>
                  <p className="t-price mt-3">
                    {formatRsd(x.price + officeBump)} <span className="text-sm font-normal text-muted">{c.perDelivery[locale]}</span>
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <label className="mt-5 flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={vase} onChange={(e) => setVase(e.target.checked)} className="h-5 w-5 accent-[var(--poppy-ink)]" />
          <span className="text-sm">{sr ? "Prvi put pošaljite i keramičku vazu (gratis)" : "Send a ceramic vase with the first delivery (free)"}</span>
        </label>
      </div>

      <div className="theme-ink self-start rounded-[1.75rem] p-7 md:p-9">
        <p className="t-eyebrow text-accent">{p.name[locale]}</p>
        <p className="mt-4 font-serif text-5xl">{formatRsd(monthly)}</p>
        <p className="text-sm text-muted">
          {c.perMonth[locale]} · {p.deliveries}× {formatRsd(perDelivery)}
        </p>
        <p className="mt-6 text-sm text-muted">{c.save[locale]}</p>
        <p className="font-serif text-4xl text-accent" aria-live="polite">
          <span ref={saveRef}>{formatRsd(saving)}</span>
        </p>
        <p className="mt-6 text-sm text-paper/80">⏸ {c.pause[locale]}</p>
        <form
          noValidate
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            setState(/.+@.+\..+/.test(email) ? "done" : "err");
          }}
        >
          <label htmlFor="sub-email" className="field-label">
            E-mail
          </label>
          <input id="sub-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" aria-invalid={state === "err"} aria-describedby={state === "err" ? "sub-err" : undefined} />
          {state === "err" && (
            <p id="sub-err" className="field-error">
              {sr ? "Unesite ispravnu e-mail adresu" : "Enter a valid email address"}
            </p>
          )}
          <button className="btn btn-accent mt-4 w-full">{c.start[locale]} →</button>
          <p className="mt-3 text-xs text-muted">{sr ? "Demo: ništa se ne naplaćuje." : "Demo: nothing is charged."}</p>
        </form>
      </div>
    </div>
  );
}
