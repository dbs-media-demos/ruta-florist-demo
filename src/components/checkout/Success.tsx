"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { OrderSummary } from "@/lib/commerce/types";
import { formatDate, formatRsd, slotLabel } from "@/lib/format";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { BouquetStage } from "@/components/builder/BouquetStage";
import { PaperCard } from "@/components/shop/CardMessage";

const STEMS = [
  { key: "eucalyptus", image: "/images/builder/eucalyptus.webp", head: 1, kind: "green" as const },
  { key: "gypsophila", image: "/images/builder/gypsophila.webp", head: 1, kind: "green" as const },
  { key: "carnation-pink", image: "/images/builder/carnation-pink.webp", head: 0.9, kind: "flower" as const },
  { key: "rose-white", image: "/images/builder/rose-white.webp", head: 1, kind: "flower" as const },
  { key: "rose-red", image: "/images/builder/rose-red.webp", head: 1, kind: "flower" as const },
  { key: "hydrangea", image: "/images/builder/hydrangea.webp", head: 1.6, kind: "flower" as const },
];

/** Order confirmation: the bouquet is wrapped and tied, then a bike carries it off. */
export function Success({ locale, shopHref, trackHref }: { locale: Locale; shopHref: string; trackHref: string }) {
  const sr = locale === "sr";
  const [order, setOrder] = useState<OrderSummary | null | undefined>(undefined);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let o: OrderSummary | null = null;
    try {
      const raw = sessionStorage.getItem("ruta-last-order");
      if (raw) o = JSON.parse(raw);
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the stored order after mount
    setOrder(o);
  }, []);

  useEffect(() => {
    const el = stage.current;
    if (!el || !order || prefersReducedMotion()) return;
    const q = gsap.utils.selector(el);
    const tl = gsap.timeline({ delay: 0.3 });
    tl.from(q("[data-stem] img"), { y: -60, opacity: 0, rotate: (i) => (i % 2 ? 12 : -12), duration: 0.8, stagger: 0.08, ease: "back.out(1.6)" })
      .from(q("[data-flap-l]"), { xPercent: -120, rotate: -40, transformOrigin: "100% 100%", duration: 0.9, ease: "expo.out" }, "-=0.2")
      .from(q("[data-flap-r]"), { xPercent: 120, rotate: 40, transformOrigin: "0% 100%", duration: 0.9, ease: "expo.out" }, "<0.1")
      .fromTo(q("[data-ribbon]"), { strokeDashoffset: 120 }, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" })
      .from(q("[data-bow]"), { scale: 0, transformOrigin: "50% 50%", duration: 0.6, ease: "back.out(3)" }, "-=0.2")
      .to(q("[data-bouquet]"), { scale: 0.38, y: 120, x: -40, duration: 0.9, ease: "power3.inOut" }, "+=0.4")
      .fromTo(q("[data-bike]"), { xPercent: -160, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, "<0.2")
      .to(q("[data-ride]"), { x: () => el.offsetWidth * 0.95, duration: 2.4, ease: "power1.in" }, "+=0.5")
      .fromTo(q("[data-eta]"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=1.6");
    return () => {
      tl.kill();
    };
  }, [order]);

  if (order === undefined) return <div className="h-[60vh]" />;

  if (!order) {
    return (
      <div className="wrap py-20 text-center">
        <p className="t-h2">{sr ? "Nema nedavne porudžbine" : "No recent order"}</p>
        <p className="t-lead mt-4">{sr ? "Ova stranica prikazuje porudžbinu napravljenu u ovom prozoru." : "This page shows an order made in this browser tab."}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href={shopHref} className="btn btn-primary">
            {sr ? "U prodavnicu" : "Go to the shop"}
          </Link>
          <Link href={trackHref} className="btn btn-ghost">
            {sr ? "Prati porudžbinu" : "Track an order"}
          </Link>
        </div>
      </div>
    );
  }

  const when = `${formatDate(new Date(`${order.delivery.date}T12:00:00Z`), locale, { weekday: "long", day: "numeric", month: "long" })}, ${slotLabel(order.delivery.slot)}`;
  const steps = sr
    ? [
        ["Primljeno", "Potvrda je poslata na " + order.email],
        ["Vezujemo", "Floristkinja bira cveće i piše vašu karticu"],
        ["Fotografija", "Šaljemo vam sliku buketa pre polaska"],
        ["Na putu", `Kurir stiže: ${when}`],
      ]
    : [
        ["Received", "Confirmation sent to " + order.email],
        ["Tying", "A florist picks the stems and writes your card"],
        ["Photo", "We send you a photo of the bouquet before it leaves"],
        ["On its way", `Courier arrives: ${when}`],
      ];

  return (
    <div className="wrap grid gap-12 pb-24 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <div ref={stage} className="relative overflow-hidden rounded-[2rem] bg-linen p-6" role="img" aria-label={sr ? "Animacija: buket se pakuje i kreće na biciklu" : "Animation: the bouquet is wrapped and leaves by bike"}>
          <div className="relative mx-auto aspect-[4/5] max-w-[22rem]">
            <div data-ride className="absolute inset-0">
              <div data-bouquet className="absolute inset-0">
                <BouquetStage items={STEMS} paper={{ color: "#c9a57b", shade: "#b08a5e" }} />
                <svg viewBox="0 0 400 500" className="pointer-events-none absolute inset-0 z-[70] h-full w-full" aria-hidden>
                  <path data-flap-l d="M84 300 L200 480 L200 316 L138 334 Z" fill="#d9b88f" />
                  <path data-flap-r d="M316 300 L200 480 L200 316 L262 334 Z" fill="#c9a57b" />
                  <path data-ribbon d="M150 380 Q200 360 250 380" stroke="var(--poppy)" strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray="120" />
                  <g data-bow>
                    <path d="M200 372 q-34 -26 -40 2 q22 12 40 -2Z M200 372 q34 -26 40 2 q-22 12 -40 -2Z" fill="var(--poppy-ink)" />
                    <circle cx="200" cy="373" r="7" fill="var(--poppy)" />
                    <path d="M200 378 l-18 40 M200 378 l16 42" stroke="var(--poppy)" strokeWidth="5" strokeLinecap="round" />
                  </g>
                </svg>
              </div>
              <svg data-bike viewBox="0 0 120 70" className="absolute bottom-0 left-[8%] w-[75%] opacity-0" aria-hidden>
                <circle cx="22" cy="52" r="15" fill="none" stroke="var(--ink)" strokeWidth="3" />
                <circle cx="96" cy="52" r="15" fill="none" stroke="var(--ink)" strokeWidth="3" />
                <path d="M22 52 L45 22 L80 22 L96 52 M45 22 L58 52 L80 22 M38 14 h16 M80 22 l5 -10 h10" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="78" y="2" width="26" height="12" rx="3" fill="none" stroke="var(--ink)" strokeWidth="2.5" />
              </svg>
            </div>
          </div>
          <p data-eta className="t-hand mt-4 text-center text-[1.9rem] text-poppy-ink">
            {sr ? "Stiže" : "Arriving"} {when}
          </p>
        </div>
      </div>

      <div>
        <p className="t-eyebrow text-accent">{sr ? "Porudžbina" : "Order"} {order.number}</p>
        <h1 className="t-h1 mt-4 !text-[clamp(2.6rem,5vw,4.6rem)]">{sr ? "Hvala! Vaš buket se vezuje." : "Thank you! Your bouquet is being tied."}</h1>
        <p className="t-lead mt-5">
          {sr ? `Za ${order.recipientName}, ${order.zoneName}. ` : `For ${order.recipientName}, ${order.zoneName}. `}
          {order.surprise && (sr ? "Dostava je iznenađenje: ne zovemo unapred." : "It's a surprise delivery: we won't call ahead.")}
        </p>

        <ol className="mt-10 space-y-0 border-l border-line pl-6">
          {steps.map(([t, x], i) => (
            <li key={t} className="relative pb-7 last:pb-0">
              <span className={`absolute -left-[1.95rem] top-0.5 grid h-5 w-5 place-items-center rounded-full text-[0.6rem] font-bold ${i === 0 ? "bg-moss text-paper" : "border border-line bg-paper"}`}>{i === 0 ? "✓" : i + 1}</span>
              <p className="font-semibold">{t}</p>
              <p className="text-sm text-muted">{x}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-[1.5rem] bg-surface p-6">
          <ul className="divide-y divide-line">
            {order.lines.map((l, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <span className="frame relative h-14 w-12 shrink-0 rounded-lg">
                  <Image src={l.image} alt="" fill sizes="48px" className="object-cover" />
                </span>
                <span className="flex-1">
                  <span className="block font-serif">
                    {l.name[locale]} × {l.qty}
                  </span>
                  <span className="text-xs text-muted">{l.variant[locale]}</span>
                </span>
                <span className="t-price text-sm">{formatRsd(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
            {order.discount > 0 && (
              <div className="flex justify-between text-moss">
                <dt>{sr ? "Popust" : "Discount"}</dt>
                <dd>−{formatRsd(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>{sr ? "Dostava" : "Delivery"}</dt>
              <dd>{order.shipping === 0 ? (sr ? "Besplatno" : "Free") : formatRsd(order.shipping)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>{sr ? "Ukupno" : "Total"}</dt>
              <dd className="t-price">{formatRsd(order.total)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>{sr ? "Plaćanje" : "Payment"}</dt>
              <dd>{order.payment === "card" ? (sr ? "Kartica (demo)" : "Card (demo)") : order.payment === "ips" ? "IPS QR (demo)" : sr ? "Pouzećem" : "Cash on delivery"}</dd>
            </div>
          </dl>
          {order.card && <PaperCard text={order.card.text} from={order.card.from} className="mt-5 rotate-[-1.5deg]" />}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={trackHref} className="btn btn-primary">
            {sr ? "Prati porudžbinu" : "Track this order"}
          </Link>
          <Link href={shopHref} className="btn btn-ghost">
            {sr ? "Nastavi kupovinu" : "Keep shopping"}
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted">{sr ? "Demo: ništa nije naplaćeno niti poslato." : "Demo: nothing was charged or sent."}</p>
      </div>
    </div>
  );
}
