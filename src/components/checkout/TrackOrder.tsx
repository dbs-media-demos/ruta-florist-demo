"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { TrackingStep } from "@/lib/commerce/provider";
import { checkout } from "@/lib/commerce/mock-checkout";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/** Order tracking: number + email → an animated status timeline (mock data). */
export function TrackOrder({ locale }: { locale: Locale }) {
  const sr = locale === "sr";
  const [num, setNum] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [steps, setSteps] = useState<TrackingStep[]>([]);
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ruta-last-order");
      if (raw) {
        const o = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill from this tab's last order
        setNum(o.number ?? "");
        setEmail(o.email ?? "");
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (state !== "done" || !list.current || prefersReducedMotion()) return;
    const q = gsap.utils.selector(list.current);
    gsap.fromTo(q("[data-line]"), { scaleY: 0 }, { scaleY: 1, transformOrigin: "top", duration: 1.6, ease: "power2.inOut" });
    gsap.fromTo(q("li"), { opacity: 0, x: -16 }, { opacity: 1, x: 0, stagger: 0.25, duration: 0.6, ease: "expo.out" });
  }, [state]);

  const labels: Record<TrackingStep["id"], [string, string]> = sr
    ? { placed: ["Porudžbina primljena", "Plaćanje potvrđeno"], arranged: ["Buket je vezan", "Fotografija je poslata na e-mail"], courier: ["Kurir je krenuo", "Biciklom kroz Dorćol"], delivered: ["Isporučeno", "Očekujemo u vašem terminu"] }
    : { placed: ["Order received", "Payment confirmed"], arranged: ["Bouquet tied", "Photo sent to your email"], courier: ["Courier on the way", "By bike through Dorćol"], delivered: ["Delivered", "Expected in your window"] };

  return (
    <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
      <form
        noValidate
        className="space-y-4 self-start rounded-[1.5rem] bg-surface p-6 md:p-8"
        onSubmit={async (e) => {
          e.preventDefault();
          setState("loading");
          const r = await checkout.trackOrder(num, email);
          if (!r) return setState("error");
          setSteps(r);
          setState("done");
        }}
      >
        <div>
          <label htmlFor="tr-n" className="field-label">
            {sr ? "Broj porudžbine" : "Order number"}
          </label>
          <input id="tr-n" value={num} onChange={(e) => setNum(e.target.value)} placeholder="RT-123456" className="field uppercase" aria-invalid={state === "error"} aria-describedby={state === "error" ? "tr-e" : undefined} />
        </div>
        <div>
          <label htmlFor="tr-m" className="field-label">
            E-mail
          </label>
          <input id="tr-m" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" aria-invalid={state === "error"} />
        </div>
        {state === "error" && (
          <p id="tr-e" className="field-error" role="alert">
            {sr ? "Ne nalazimo porudžbinu. Broj izgleda ovako: RT-123456." : "We can't find that order. Numbers look like RT-123456."}
          </p>
        )}
        <button className="btn btn-primary w-full" disabled={state === "loading"}>
          {state === "loading" ? (sr ? "Tražimo…" : "Looking…") : sr ? "Prati" : "Track"}
        </button>
        <p className="text-xs text-muted">{sr ? "Demo: status je simuliran." : "Demo: the status is simulated."}</p>
      </form>

      <div aria-live="polite">
        {state === "done" ? (
          <ol ref={list} className="relative space-y-8 pl-10">
            <span data-line aria-hidden className="absolute bottom-3 left-[0.6rem] top-3 w-0.5 bg-[linear-gradient(var(--poppy)_75%,var(--sand)_75%)]" />
            {steps.map((s) => (
              <li key={s.id} className="relative">
                <span className={`absolute -left-10 top-0.5 grid h-5 w-5 place-items-center rounded-full ${s.done ? "bg-poppy text-white" : "border-2 border-sand bg-paper"}`}>
                  {s.done && <span className="text-[0.6rem]">✓</span>}
                </span>
                <p className={`font-serif text-2xl ${s.done ? "" : "text-muted"}`}>{labels[s.id][0]}</p>
                <p className="text-sm text-muted">
                  {labels[s.id][1]}
                  {s.at && ` · ${new Date(s.at).toLocaleTimeString(sr ? "sr-Latn-RS" : "en-GB", { hour: "2-digit", minute: "2-digit" })}`}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <div className="grid h-full min-h-60 place-items-center rounded-[1.5rem] border border-dashed border-line p-8 text-center text-muted">
            <p className="t-hand text-3xl">{sr ? "Gde je moj buket?" : "Where's my bouquet?"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
