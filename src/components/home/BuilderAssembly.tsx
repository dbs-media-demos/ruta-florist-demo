"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { formatRsd } from "@/lib/format";
import { BouquetStage, type StagedStem } from "@/components/builder/BouquetStage";

const DEMO: StagedStem[] = [
  { key: "eucalyptus", image: "/images/builder/eucalyptus.webp", head: 1, kind: "green" },
  { key: "fern", image: "/images/builder/fern.webp", head: 1, kind: "green" },
  { key: "gypsophila", image: "/images/builder/gypsophila.webp", head: 1, kind: "green" },
  { key: "carnation-pink", image: "/images/builder/carnation-pink.webp", head: 0.9, kind: "flower" },
  { key: "rose-white", image: "/images/builder/rose-white.webp", head: 1, kind: "flower" },
  { key: "rose-red", image: "/images/builder/rose-red.webp", head: 1, kind: "flower" },
  { key: "sunflower", image: "/images/builder/sunflower.webp", head: 1.2, kind: "flower" },
  { key: "hydrangea", image: "/images/builder/hydrangea.webp", head: 1.6, kind: "flower" },
];
const PRICES = [190, 150, 250, 190, 290, 290, 350, 690];

/** Scene 6: stems fly in from all sides and settle into the wrap while the price counts up. */
export function BuilderAssembly({ eyebrow, title, text, cta, href }: { eyebrow: string; title: string; text: string; cta: string; href: string }) {
  const root = useRef<HTMLElement>(null);
  const price = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const sec = root.current;
      if (!sec || prefersReducedMotion()) return;
      const q = gsap.utils.selector(sec);
      const items = q("[data-stem]") as HTMLElement[];
      const tl = gsap.timeline({ scrollTrigger: { trigger: q("[data-stage]")[0], start: "top 80%", end: "bottom 45%", scrub: 0.8 } });
      items.forEach((el, i) => {
        const side = i % 2 ? 1 : -1;
        const img = el.firstElementChild as HTMLElement;
        tl.fromTo(img, { x: side * (180 + i * 25), y: -160 - (i % 3) * 60, rotate: side * 35, opacity: 0 }, { x: 0, y: 0, rotate: 0, opacity: 1, duration: 1, ease: "power2.out" }, i * 0.35);
      });
      const total = { v: 1100 };
      tl.to(total, { v: 1100 + PRICES.reduce((a, b) => a + b, 0), duration: items.length * 0.35 + 0.6, ease: "none", onUpdate: () => price.current && (price.current.textContent = formatRsd(Math.round(total.v / 10) * 10)) }, 0);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="theme-linen relative overflow-hidden py-24 md:py-36">
      <div className="wrap grid items-center gap-14 md:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="t-eyebrow text-accent">{eyebrow}</p>
          <h2 className="t-h2 mt-4">{title}</h2>
          <p className="t-lead mt-6 max-w-md">{text}</p>
          <div className="mt-8 flex items-center gap-6">
            <Link href={href} className="btn btn-primary">
              {cta} →
            </Link>
            <span className="t-price text-2xl" ref={price} aria-hidden>
              {formatRsd(1100 + PRICES.reduce((a, b) => a + b, 0))}
            </span>
          </div>
        </div>
        <div data-stage className="relative mx-auto w-full max-w-[34rem]">
          <div aria-hidden className="absolute inset-[8%] rounded-full bg-paper/70 blur-2xl" />
          <BouquetStage items={DEMO} paper={{ color: "#c9a57b", shade: "#b08a5e" }} />
        </div>
      </div>
    </section>
  );
}
