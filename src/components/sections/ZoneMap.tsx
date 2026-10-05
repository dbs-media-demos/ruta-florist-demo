"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import { zones, rivers, studioPin, type Zone } from "@/content/zones";
import { formatRsd } from "@/lib/format";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Stylised map of Belgrade's delivery zones (not to scale). Hover, focus or tap a zone to see
 * its price and delivery time; the zones ink in one by one when the map scrolls into view.
 */
export function ZoneMap({ locale, value, onSelect, className }: { locale: Locale; value?: string; onSelect?: (id: string) => void; className?: string }) {
  const [active, setActive] = useState<string>(value ?? "stari-grad");
  const root = useRef<HTMLDivElement>(null);
  const z = zones.find((x) => x.id === (value ?? active)) as Zone;
  const sr = locale === "sr";

  useGSAP(
    () => {
      if (prefersReducedMotion() || !root.current) return;
      const q = gsap.utils.selector(root);
      const paths = q("[data-zone-path]") as SVGPathElement[];
      (q("[data-river]") as SVGPathElement[]).forEach((r) => {
        const len = r.getTotalLength();
        gsap.set(r, { strokeDasharray: len, strokeDashoffset: len });
      });
      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 75%", once: true } });
      tl.to(q("[data-river]"), { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" })
        .to(paths, { strokeDashoffset: 0, duration: 1.1, stagger: 0.08, ease: "power2.out" }, 0.2)
        .fromTo(q("[data-zone-fill]"), { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.08 }, 0.6)
        .fromTo(q("[data-label]"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05 }, 0.9)
        .fromTo(q("[data-pin]"), { scale: 0, transformOrigin: "50% 100%" }, { scale: 1, duration: 0.8, ease: "back.out(2.4)" }, 1.2);
    },
    { scope: root },
  );

  const pick = (id: string) => {
    setActive(id);
    onSelect?.(id);
  };

  return (
    <div ref={root} className={clsx("grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-center", className)}>
      <svg viewBox="0 0 600 460" className="w-full overflow-visible" role="group" aria-label={sr ? "Mapa zona dostave u Beogradu" : "Map of Belgrade delivery zones"}>
        <defs>
          <pattern id="zm-dots" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="currentColor" opacity="0.12" />
          </pattern>
        </defs>
        <rect width="600" height="460" fill="url(#zm-dots)" rx="24" />
        <path data-river d={rivers.danube} fill="none" stroke="#9cb7c8" strokeWidth="16" strokeLinecap="round" opacity="0.55" />
        <path data-river d={rivers.sava} fill="none" stroke="#9cb7c8" strokeWidth="13" strokeLinecap="round" opacity="0.55" />
        <text x="520" y="52" className="fill-current text-[11px] italic opacity-50">Dunav</text>
        <text x="30" y="318" className="fill-current text-[11px] italic opacity-50">Sava</text>
        {zones.map((zone) => {
          const on = zone.id === z.id;
          return (
            <g
              key={zone.id}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={`${zone.name}: ${zone.price === 0 ? (sr ? "besplatna dostava" : "free delivery") : formatRsd(zone.price)}, ${zone.eta[locale]}`}
              onMouseEnter={() => !onSelect && setActive(zone.id)}
              onFocus={() => !onSelect && setActive(zone.id)}
              onClick={() => pick(zone.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  pick(zone.id);
                }
              }}
              className="cursor-pointer outline-none [&:focus-visible>path:last-of-type]:stroke-[var(--poppy)] [&:focus-visible>path:last-of-type]:stroke-[3]"
            >
              <path
                data-zone-fill
                d={zone.path}
                className="transition-[fill] duration-500"
                fill={on ? "var(--poppy)" : zone.central ? "color-mix(in oklab, var(--moss) 22%, var(--surface))" : "color-mix(in oklab, var(--moss) 10%, var(--surface))"}
              />
              <path data-zone-path d={zone.path} fill="none" stroke={on ? "var(--poppy-ink)" : "currentColor"} strokeOpacity={on ? 1 : 0.35} strokeWidth={on ? 2 : 1.2} strokeLinejoin="round" />
              <text data-label x={zone.label[0]} y={zone.label[1]} textAnchor="middle" className={clsx("pointer-events-none select-none text-[11.5px] font-semibold transition-[fill]", on ? "fill-white" : "fill-current")}>
                {zone.name}
              </text>
            </g>
          );
        })}
        <g data-pin transform={`translate(${studioPin[0]} ${studioPin[1]})`} className="pointer-events-none">
          <circle r="16" fill="var(--poppy)" opacity="0.18" className="animate-ping [transform-box:fill-box] [transform-origin:center]" />
          <circle r="6.5" fill="var(--ink)" stroke="#fff" strokeWidth="2" />
          <text y="-14" textAnchor="middle" className="fill-current text-[10px] font-bold uppercase tracking-[0.12em]">
            Ruta
          </text>
        </g>
      </svg>

      <div className="rounded-[1.5rem] border border-line bg-surface p-6" aria-live="polite">
        <p className="t-eyebrow text-muted">{sr ? "Zona dostave" : "Delivery zone"}</p>
        <p className="t-h3 mt-2">{z.name}</p>
        <p className="mt-1 text-sm text-muted">{z.hoods[locale]}</p>
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5">
          <div>
            <dt className="text-xs text-muted">{sr ? "Cena dostave" : "Delivery"}</dt>
            <dd className="t-price mt-1 text-xl">{z.price === 0 ? (sr ? "Besplatno" : "Free") : formatRsd(z.price)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{sr ? "Hitna isporuka" : "Express"}</dt>
            <dd className="mt-1 text-xl font-semibold">{z.eta[locale]}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted">{z.central ? (sr ? "Besplatno preko 6.000 RSD." : "Free over 6,000 RSD.") : sr ? "Termini 9–21h, i nedeljom do 15h." : "Windows 9:00–21:00, Sundays until 15:00."}</p>
      </div>
    </div>
  );
}
