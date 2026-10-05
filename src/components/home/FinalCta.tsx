import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { PETAL } from "@/components/brand/Logo";
import { CutoffLine } from "@/components/layout/Countdown";

const PETALS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: -(i * 1.7) % 14,
  dur: 11 + (i % 5) * 2.2,
  size: 14 + (i % 4) * 7,
  color: ["#f08a70", "#f2cdbe", "#f7e3da", "#e0533a"][i % 4],
  dx: `${(i % 2 ? 1 : -1) * (30 + (i % 3) * 25)}px`,
  rot: `${180 + i * 23}deg`,
}));

/** Scene 11: petals drift down through the closing call to action. */
export function FinalCta({ locale, title, text, shopHref, contactHref, shop, visit }: { locale: Locale; title: string; text: string; shopHref: string; contactHref: string; shop: string; visit: string }) {
  return (
    <section data-header-dark className="theme-ink relative overflow-hidden py-32 md:py-48">
      <div aria-hidden className="pointer-events-none absolute inset-0 motion-reduce:hidden">
        {PETALS.map((p, i) => (
          <svg
            key={i}
            viewBox="12 2 8 10"
            width={p.size}
            height={p.size * 1.25}
            className="absolute top-0"
            style={{ left: `${p.left}%`, animation: `drift ${p.dur}s linear ${p.delay}s infinite`, ["--dx" as string]: p.dx, ["--rot" as string]: p.rot, opacity: 0.85 }}
          >
            <path d={PETAL} fill={p.color} />
          </svg>
        ))}
      </div>
      <div className="wrap relative text-center">
        <p className="mx-auto inline-flex rounded-full border border-line px-4 py-2 text-sm">
          <CutoffLine locale={locale} />
        </p>
        <h2 className="mx-auto mt-8 max-w-5xl font-serif text-[clamp(3rem,8vw,8.5rem)] leading-[0.92] tracking-[-0.035em]">{title}</h2>
        <p className="t-lead mx-auto mt-6 max-w-xl">{text}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href={shopHref} className="btn btn-accent">
            {shop} →
          </Link>
          <Link href={contactHref} className="btn btn-ghost">
            {visit}
          </Link>
        </div>
      </div>
    </section>
  );
}
