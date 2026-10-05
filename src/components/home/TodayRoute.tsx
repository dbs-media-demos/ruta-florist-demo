"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { ScrubWords } from "@/components/ui/Reveal";

const PATH = "M40 150 C 210 30, 360 210, 540 112 S 860 24, 1000 118 S 1130 176, 1160 120";

type Stop = { time: string; label: string };
type Stat = { value: number; suffix: string; label: string };

/** Scene 1: the day of a bouquet. A dotted route draws itself while a little bike rides it. */
export function TodayRoute({ eyebrow, text, stops, stats }: { eyebrow: string; text: string; stops: Stop[]; stats: Stat[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const path = q("[data-route]")[0] as SVGPathElement;
      const bike = q("[data-bike]")[0] as SVGGElement;
      const len = path.getTotalLength();
      const place = (t: number) => {
        const p = path.getPointAtLength(len * t);
        const p2 = path.getPointAtLength(Math.min(len, len * t + 1));
        const angle = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;
        bike.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${angle * 0.35})`);
      };
      // counters
      (q("[data-count]") as HTMLElement[]).forEach((c) => {
        const target = Number(c.dataset.count);
        const dec = target % 1 ? 1 : 0;
        const o = { v: 0 };
        if (prefersReducedMotion()) return;
        c.textContent = (0).toFixed(dec);
        gsap.to(o, {
          v: target,
          duration: 1.8,
          ease: "power3.out",
          scrollTrigger: { trigger: c, start: "top 90%", once: true },
          onUpdate: () => (c.textContent = o.v.toFixed(dec).replace(".", ",")),
        });
      });
      if (prefersReducedMotion()) {
        place(1);
        return;
      }
      gsap.set(path, { strokeDashoffset: len, strokeDasharray: `${len}` });
      const state = { t: 0 };
      place(0);
      gsap
        .timeline({ scrollTrigger: { trigger: q("[data-map]")[0], start: "top 80%", end: "bottom 35%", scrub: 0.8 } })
        .to(path, { strokeDashoffset: 0, ease: "none" }, 0)
        .to(state, { t: 1, ease: "none", onUpdate: () => place(state.t) }, 0)
        .fromTo(q("[data-stop]"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, stagger: 0.3, ease: "back.out(3)", duration: 0.12 }, 0);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="theme-paper relative overflow-hidden pb-24 pt-28 md:pb-36 md:pt-40">
      <div className="wrap">
        <p className="t-eyebrow text-accent">{eyebrow}</p>
        <ScrubWords text={text} className="t-h2 mt-6 max-w-[22ch] md:max-w-[26ch]" accent={[1, 2]} />

        <div data-map className="relative mt-16 md:mt-24">
          <svg viewBox="0 0 1200 230" className="w-full overflow-visible" aria-hidden>
            <path d={PATH} fill="none" stroke="var(--sand)" strokeWidth="2" strokeDasharray="1 10" strokeLinecap="round" />
            <path data-route d={PATH} fill="none" stroke="var(--poppy)" strokeWidth="2.5" strokeLinecap="round" />
            <g data-bike>
              <g transform="translate(-22 -36)">
                <circle cx="8" cy="28" r="7" fill="none" stroke="var(--ink)" strokeWidth="2" />
                <circle cx="36" cy="28" r="7" fill="none" stroke="var(--ink)" strokeWidth="2" />
                <path d="M8 28 L17 14 L30 14 L36 28 M17 14 L23 28 L30 14 M14 9 h7" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M30 14 l2 -6 h5" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
                {/* bouquet in the basket */}
                <circle cx="38" cy="4" r="4" fill="var(--poppy)" />
                <circle cx="43" cy="7" r="3.2" fill="var(--blush)" />
                <circle cx="34" cy="7" r="3" fill="#f3c64b" />
              </g>
            </g>
          </svg>
          <ol className="absolute inset-0">
            {stops.map((s, i) => (
              <li
                key={s.time}
                className="absolute -translate-x-1/2 text-center"
                style={{ left: `${[3.3, 38, 72, 96.5][i]}%`, top: `${[66, 52, 18, 54][i]}%` }}
              >
                <span data-stop className="mx-auto block h-3.5 w-3.5 rounded-full border-2 border-paper bg-ink shadow-[0_0_0_4px_var(--paper)]" />
                <span className="t-price mt-3 block text-sm md:text-lg">{s.time}</span>
                <span className="block whitespace-nowrap text-[0.7rem] text-muted md:text-sm">{s.label}</span>
              </li>
            ))}
          </ol>
        </div>

        <dl className="mt-24 grid gap-10 border-t border-line pt-10 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="font-serif text-[clamp(3rem,6vw,5.5rem)] leading-none">
                  <span data-count={s.value}>{String(s.value).replace(".", ",")}</span>
                  <span className="text-[0.5em] text-accent">{s.suffix}</span>
                </span>
                <span className="mt-2 block text-muted">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
