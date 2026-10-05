"use client";

import { forwardRef } from "react";
import clsx from "clsx";

export type StagedStem = { key: string; image: string; head: number; kind: "flower" | "green" };

/**
 * The composed bouquet: stems fan out from the wrap's neck (layered photo cut-outs), with the
 * paper's front panel drawn over their lower stems so they look tucked in.
 */
export function fan(items: StagedStem[]) {
  const greens = items.filter((s) => s.kind === "green");
  const flowers = items.filter((s) => s.kind === "flower");
  const n = items.length;
  // greens behind and wide, big heads in the middle front, small ones at the sides
  const ordered = [...greens, ...flowers.sort((a, b) => a.head - b.head)];
  return ordered.map((s, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const spread = s.kind === "green" ? 34 : 24;
    const centerBias = s.head > 1.2 ? 0.25 : 1;
    const angle = (t - 0.5) * 2 * spread * centerBias + (i % 2 ? 3 : -3);
    const height = s.kind === "green" ? 78 : 70 - (s.head - 1) * 14 + (i % 3) * 3;
    return { ...s, angle, height, z: s.kind === "green" ? 1 + i : 10 + Math.round(s.head * 10) + (i % 3) };
  });
}

export const BouquetStage = forwardRef<HTMLDivElement, { items: StagedStem[]; paper: { color: string; shade: string }; className?: string; label?: string }>(function BouquetStage(
  { items, paper, className, label },
  ref,
) {
  const placed = fan(items);
  return (
    <div ref={ref} className={clsx("relative aspect-[4/5] w-full", className)} role={label ? "img" : undefined} aria-label={label}>
      {/* back panel of the paper */}
      <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d="M70 250 L200 470 L330 250 L300 230 L200 300 L100 230 Z" fill={paper.shade} className="transition-[fill] duration-700" />
      </svg>
      {placed.map((s) => (
        <div
          key={s.key}
          data-stem={s.key}
          className="absolute bottom-[22%] left-1/2 origin-bottom transition-transform duration-700 ease-[var(--ease-bloom)]"
          style={{ height: `${s.height}%`, zIndex: s.z, transform: `translateX(-50%) rotate(${s.angle}deg)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- transparent cut-outs, already sized */}
          <img src={s.image} alt="" className="stem-in h-full w-auto max-w-none select-none drop-shadow-[0_10px_14px_rgba(15,27,21,0.18)]" draggable={false} loading="lazy" />
        </div>
      ))}
      {/* front panel: the wrap folds over the stems */}
      <svg viewBox="0 0 400 500" className="pointer-events-none absolute inset-0 z-[60] h-full w-full" aria-hidden>
        <path d="M84 300 L200 480 L316 300 L262 334 L200 316 L138 334 Z" fill={paper.color} className="transition-[fill] duration-700" />
        <path d="M84 300 L138 334 L200 316 L200 480 Z" fill={paper.shade} opacity="0.45" className="transition-[fill] duration-700" />
        <path d="M170 372 q30 -10 60 0 q-10 16 -30 16 q-20 0 -30 -16Z" fill="var(--poppy)" opacity="0.9" />
        <path d="M200 380 l-26 44 M200 380 l24 46" stroke="var(--poppy)" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </div>
  );
});
