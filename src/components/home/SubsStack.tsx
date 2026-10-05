"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { formatRsd } from "@/lib/format";

type Plan = { id: string; name: string; every: string; price: number; saving: number; note: string; image: string };

/** Scene 8: subscription plans as cards that stack on top of each other as you scroll. */
export function SubsStack({ eyebrow, title, plans, perDelivery, save, cta, href }: { eyebrow: string; title: string; plans: Plan[]; perDelivery: string; save: string; cta: string; href: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !root.current) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-sub-card]", root.current);
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.fromTo(card, { scale: 1, filter: "brightness(1)" }, {
          scale: 0.9 + i * 0.02,
          filter: "brightness(0.82)",
          ease: "none",
          scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 20%", scrub: true },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-saving]", root.current).forEach((el) => {
        const target = Number(el.dataset.saving);
        const o = { v: 0 };
        gsap.to(o, { v: target, duration: 1.4, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%", once: true }, onUpdate: () => (el.textContent = `−${Math.round(o.v)}%`) });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="theme-ink relative py-24 md:py-36" data-header-dark>
      <div className="wrap">
        <div className="max-w-3xl">
          <p className="t-eyebrow text-accent">{eyebrow}</p>
          <h2 className="t-h2 mt-4">{title}</h2>
        </div>
        <div className="mt-14 space-y-6 md:mt-20">
          {plans.map((p, i) => (
            <article
              key={p.id}
              data-sub-card
              className="sticky grid origin-top overflow-hidden rounded-[2rem] bg-surface md:grid-cols-[1.1fr_1fr]"
              style={{ top: `calc(var(--header-h) + var(--ribbon-h) + ${1.5 + i * 1.25}rem)` }}
            >
              <div className="flex flex-col justify-between gap-10 p-8 md:p-12">
                <div>
                  <p className="text-sm text-muted">0{i + 1} / 0{plans.length}</p>
                  <h3 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.5rem)] leading-none">{p.name}</h3>
                  <p className="mt-3 text-muted">{p.every}</p>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <p className="t-price text-3xl">{formatRsd(p.price)}</p>
                    <p className="text-sm text-muted">{perDelivery}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-5xl text-accent" data-saving={p.saving}>
                      −{p.saving}%
                    </p>
                    <p className="text-sm text-muted">{save}</p>
                  </div>
                </div>
                <p className="t-hand text-2xl text-paper/80">{p.note}</p>
              </div>
              <div className="frame relative min-h-[16rem]">
                <Image src={p.image} alt="" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
              </div>
            </article>
          ))}
        </div>
        <div className="mt-14 flex justify-center">
          <Link href={href} className="btn btn-accent">
            {cta} →
          </Link>
        </div>
      </div>
    </section>
  );
}
