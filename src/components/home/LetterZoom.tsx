"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Scene 5: the word "Dorćol" is cut out of a garden-green wall with the studio behind it.
 * Scrolling flies the camera into the stroke of the "o" until the studio fills the screen,
 * then the story card rises over it.
 */
export function LetterZoom({ word, eyebrow, title, text, link, href, image }: { word: string; eyebrow: string; title: string; text: string; link: string; href: string; image: string }) {
  const root = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const textEl = useRef<SVGTextElement>(null);

  useGSAP(
    () => {
      const sec = root.current;
      const s = svg.current;
      const t = textEl.current;
      if (!sec || !s || !t) return;
      const q = gsap.utils.selector(sec);
      if (prefersReducedMotion()) {
        gsap.set(s, { opacity: 0 });
        return;
      }
      const origin = () => {
        // the left stroke of the first "o"
        const ext = t.getExtentOfChar(1);
        const ctm = t.getScreenCTM();
        const box = s.getBoundingClientRect();
        if (!ctm) return "50% 50%";
        const x = (ext.x + ext.width * 0.13) * ctm.a + ctm.e - box.left;
        const y = (ext.y + ext.height * 0.62) * ctm.d + ctm.f - box.top;
        return `${x}px ${y}px`;
      };
      gsap.set(s, { transformOrigin: origin() });
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: sec,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
            onRefresh: () => gsap.set(s, { transformOrigin: origin() }),
            onUpdate: (self) => sec.toggleAttribute("data-header-dark", self.progress < 0.45),
          },
        })
        .fromTo(q("[data-word-caption]"), { opacity: 1 }, { opacity: 0, duration: 0.12 }, 0.02)
        .fromTo(s, { scale: 1 }, { scale: 90, duration: 0.55, ease: "power3.in" }, 0.05)
        .fromTo(q("[data-studio]"), { scale: 1.25 }, { scale: 1, duration: 0.7 }, 0)
        .set(s, { opacity: 0 }, 0.6)
        .fromTo(q("[data-story]"), { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" }, 0.66);
    },
    { scope: root },
  );

  return (
    <section ref={root} data-header-dark className="relative h-[280vh] motion-reduce:h-auto">
      <div className="sticky top-0 h-[100svh] overflow-hidden motion-reduce:relative">
        <div data-studio className="absolute inset-0">
          <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-ink/15" />
        </div>
        <svg ref={svg} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full will-change-transform" aria-hidden>
          <defs>
            <mask id="dorcol-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900">
              <rect width="1600" height="900" fill="#fff" />
              <text ref={textEl} x="800" y="600" textAnchor="middle" fontSize="430" fill="#000" style={{ fontFamily: "var(--font-gloock), Georgia, serif", letterSpacing: "-0.04em" }}>
                {word}
              </text>
            </mask>
          </defs>
          <rect width="1600" height="900" fill="#17271f" mask="url(#dorcol-mask)" />
        </svg>
        <div data-word-caption className="wrap pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+var(--ribbon-h)+1.5rem)] flex justify-between text-paper/80">
          <p className="t-eyebrow">{eyebrow}</p>
          <p className="t-eyebrow">Strahinjića bana 19</p>
        </div>
        <div data-story className="wrap absolute inset-x-0 bottom-8 opacity-0 motion-reduce:opacity-100 md:bottom-14">
          <div className="theme-paper max-w-xl rounded-[1.75rem] p-7 shadow-[0_30px_80px_-30px_rgba(15,27,21,0.5)] md:p-10">
            <p className="t-eyebrow text-accent">{eyebrow}</p>
            <h2 className="t-h2 mt-3">{title}</h2>
            <p className="mt-4 text-muted">{text}</p>
            <Link href={href} className="btn btn-primary mt-6">
              {link} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
