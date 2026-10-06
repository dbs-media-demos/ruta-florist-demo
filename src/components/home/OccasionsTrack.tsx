"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";

type Item = { id: string; name: string; line: string; image: string; href: string };

/**
 * Scene 3: occasions as a horizontal gallery. On desktop the section pins and scroll moves
 * the row sideways while each photo counter-drifts; on phones it's a native swipe row.
 */
export function OccasionsTrack({ eyebrow, title, items, cta }: { eyebrow: string; title: string; items: Item[]; cta: string }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current;
        const sec = root.current;
        if (!el || !sec) return;
        const distance = () => el.scrollWidth - window.innerWidth + 80;
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { trigger: sec, start: "top top", end: () => `+=${distance()}`, scrub: 0.6, pin: true, invalidateOnRefresh: true, anticipatePin: 1 },
        });
        gsap.utils.toArray<HTMLElement>("[data-occ-img]", el).forEach((img) => {
          gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: "none", scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
        });
        gsap.utils.toArray<HTMLElement>("[data-occ-name]", el).forEach((n) => {
          gsap.fromTo(n, { yPercent: 60, opacity: 0.2 }, { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: n, containerAnimation: tween, start: "left 95%", end: "left 55%", scrub: true } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="theme-linen relative overflow-hidden py-20 md:flex md:h-screen md:flex-col md:justify-center md:py-0">
      <div className="wrap md:pt-[calc(var(--header-h)+var(--ribbon-h))]">
        <p className="t-eyebrow text-accent">{eyebrow}</p>
        <h2 className="t-h2 mt-3">{title}</h2>
      </div>
      <ul ref={track} className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] md:mt-8 md:gap-6 md:overflow-visible md:pl-[30vw]" data-cursor="drag" data-cursor-label="→">
        {items.map((it, i) => (
          <li key={it.id} className="w-[74vw] shrink-0 snap-center md:w-[min(24vw,calc((100svh-20rem)*0.75))]" style={{ marginTop: i % 2 ? "2.5rem" : 0 }}>
            <Link href={it.href} className="group block">
              <div className="frame relative aspect-[3/4] rounded-[1.75rem]">
                <div data-occ-img className="absolute -inset-x-[10%] inset-y-0">
                  <Image src={it.image} alt="" fill sizes="(min-width: 768px) 34vw, 80vw" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 overflow-hidden p-6 text-paper">
                  <p data-occ-name className="font-serif text-[clamp(2.2rem,4vw,3.6rem)] leading-none">
                    {it.name}
                  </p>
                  <p className="mt-2 flex items-center justify-between text-sm text-paper/85">
                    {it.line}
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-paper text-ink transition-transform duration-500 group-hover:rotate-[-45deg]">→</span>
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
        <li className="flex w-[60vw] shrink-0 items-center md:w-[24vw]">
          <p className="t-hand text-[clamp(2rem,3vw,2.8rem)] text-accent">{cta}</p>
        </li>
      </ul>
    </section>
  );
}
