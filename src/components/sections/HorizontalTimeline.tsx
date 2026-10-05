"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";

type Item = { year: string; title: string; text: string; image: string };

/** About: the years as a pinned horizontal track with a growing stem line. Native swipe on phones. */
export function HorizontalTimeline({ eyebrow, title, items }: { eyebrow: string; title: string; items: Item[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current;
        const sec = root.current;
        if (!el || !sec) return;
        const distance = () => el.scrollWidth - window.innerWidth + 120;
        const tw = gsap.to(el, { x: () => -distance(), ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: () => `+=${distance()}`, scrub: 0.6, pin: true, invalidateOnRefresh: true } });
        gsap.fromTo("[data-stemline]", { scaleX: 0 }, { scaleX: 1, transformOrigin: "left", ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: () => `+=${distance()}`, scrub: true } });
        gsap.utils.toArray<HTMLElement>("[data-year]", el).forEach((y) =>
          gsap.fromTo(y, { yPercent: 40, opacity: 0.25 }, { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: y, containerAnimation: tw, start: "left 90%", end: "left 50%", scrub: true } }),
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="theme-linen relative overflow-hidden py-20 md:flex md:h-screen md:flex-col md:justify-center md:py-0">
      <div className="wrap md:absolute md:inset-x-0 md:top-[calc(var(--header-h)+var(--ribbon-h)+2rem)]">
        <p className="t-eyebrow text-accent">{eyebrow}</p>
        <h2 className="t-h2 mt-3">{title}</h2>
      </div>
      <div className="relative mt-10 md:mt-24">
        <span data-stemline aria-hidden className="absolute left-0 right-0 top-[3.6rem] hidden h-px bg-poppy md:block" />
        <ol ref={track} className="no-scrollbar flex snap-x gap-6 overflow-x-auto px-[var(--gutter)] md:gap-14 md:overflow-visible md:pl-[30vw]">
          {items.map((it) => (
            <li key={it.year} className="w-[78vw] shrink-0 snap-center md:w-[26vw]">
              <p data-year className="font-serif text-[clamp(3rem,6vw,5.5rem)] leading-none">
                {it.year}
              </p>
              <span aria-hidden className="mt-3 block h-3 w-3 rounded-full bg-poppy" />
              <div className="frame relative mt-5 aspect-[4/3] rounded-[1.25rem]">
                <Image src={it.image} alt="" fill sizes="(min-width: 768px) 26vw, 78vw" className="object-cover" />
              </div>
              <h3 className="t-h4 mt-4">{it.title}</h3>
              <p className="mt-1 text-sm text-muted">{it.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
