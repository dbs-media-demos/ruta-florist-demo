"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

type Photo = { src: string; caption: string };

/** Scene 10: three columns of Belgrade doorsteps and interiors drifting at different speeds. */
export function DoorsParallax({ eyebrow, title, columns }: { eyebrow: string; title: string; columns: Photo[][] }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion() || !root.current) return;
      const cols = gsap.utils.toArray<HTMLElement>("[data-col]", root.current);
      const speeds = [-120, 80, -60];
      cols.forEach((c, i) => gsap.fromTo(c, { y: -speeds[i] / 2 }, { y: speeds[i], ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } }));
      gsap.fromTo("[data-doors-title]", { scale: 0.85 }, { scale: 1.05, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="theme-blush relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
        <div data-doors-title className="text-center">
          <p className="t-eyebrow text-accent">{eyebrow}</p>
          <h2 className="mt-3 font-serif text-[clamp(3rem,9vw,9rem)] leading-[0.9] tracking-[-0.03em] text-ink [text-shadow:0_2px_40px_var(--petal)]">{title}</h2>
        </div>
      </div>
      <div className="wrap grid grid-cols-2 gap-4 opacity-95 md:grid-cols-3 md:gap-6">
        {columns.map((col, i) => (
          <div key={i} data-col className={i === 2 ? "hidden space-y-6 md:block" : "space-y-4 md:space-y-6"}>
            {col.map((p) => (
              <figure key={p.src}>
                <div className="frame relative aspect-[4/5] rounded-[1.5rem]">
                  <Image src={p.src} alt={p.caption} fill sizes="(min-width: 768px) 30vw, 46vw" className="object-cover" />
                </div>
                <figcaption className="mt-2 text-xs text-muted">{p.caption}</figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
