import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/i18n/dictionary";
import { breadcrumbSchema, graph } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SplitReveal } from "@/components/ui/Reveal";

export type Crumb = { name: string; url: string };

/** Visible breadcrumbs plus BreadcrumbList JSON-LD. */
export function Breadcrumbs({ items, locale, className }: { items: Crumb[]; locale: Locale; className?: string }) {
  const d = getDictionary(locale);
  return (
    <>
      <JsonLd data={graph(breadcrumbSchema(items))} />
      <nav aria-label={d.breadcrumbs} className={clsx("text-sm text-muted", className)}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((c, i) => (
            <li key={c.url} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden>/</span>}
              {i === items.length - 1 ? (
                <span aria-current="page" className="text-fg">
                  {c.name}
                </span>
              ) : (
                <Link href={c.url} className="link-u">
                  {c.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/**
 * Inner-page hero: the title lands letter by letter (CSS on first paint), optional image that
 * opens like a window. `tone="calm"` drops the playful motion (sympathy).
 */
export function PageHero({
  locale,
  crumbs,
  eyebrow,
  title,
  intro,
  image,
  imageAlt = "",
  children,
  tone = "paper",
}: {
  locale: Locale;
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  intro?: string;
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
  tone?: "paper" | "linen" | "calm" | "ink";
}) {
  const calm = tone === "calm";
  return (
    <section className={clsx(`theme-${tone}`, "relative overflow-hidden pb-14 pt-8 md:pb-20 md:pt-12")} data-header-dark={tone === "ink" ? "" : undefined}>
      <div className="wrap">
        <Breadcrumbs items={crumbs} locale={locale} />
        <div className={clsx("mt-10 grid gap-10 md:mt-16", image && "md:grid-cols-[1.25fr_1fr] md:items-end")}>
          <div>
            {eyebrow && <p className="t-eyebrow text-accent">{eyebrow}</p>}
            <h1 className="t-h1 mt-4">
              {calm ? (
                title
              ) : (
                <>
                <span className="sr-only">{title}</span>
                <span aria-hidden>
                  {title.split(" ").map((w, wi, arr) => (
                    <span key={wi} className="inline-block whitespace-nowrap">
                      {Array.from(w).map((ch, ci) => (
                        <span key={ci} className="line-mask inline-block align-bottom">
                          <span className="anim-heading inline-block" style={{ ["--d" as string]: `${0.02 * (wi * 4 + ci)}s` }}>
                            {ch}
                          </span>
                        </span>
                      ))}
                      {wi < arr.length - 1 && " "}
                    </span>
                  ))}
                </span>
                </>
              )}
            </h1>
            {intro && (
              <p className="t-lead anim-fade mt-6 max-w-2xl" style={{ ["--d" as string]: "0.25s" }}>
                {intro}
              </p>
            )}
            {children}
          </div>
          {image && (
            <div className={clsx("frame relative aspect-[4/3] rounded-[1.75rem] md:aspect-[5/4] md:max-h-[62vh]", !calm && "anim-unfold")}>
              <Image src={image} alt={imageAlt} fill preload sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, text, className, as = "h2" }: { eyebrow?: string; title: string; text?: string; className?: string; as?: "h2" | "h3" }) {
  return (
    <div className={clsx("max-w-3xl", className)}>
      {eyebrow && <p className="t-eyebrow text-accent">{eyebrow}</p>}
      <SplitReveal as={as} className="t-h2 mt-4">
        {title}
      </SplitReveal>
      {text && <p className="t-lead mt-5">{text}</p>}
    </div>
  );
}

/** Native <details> accordion: keyboard and screen-reader friendly with no JS. */
export function Accordion({ items, className, defaultOpen = 0 }: { items: { q: string; a: ReactNode }[]; className?: string; defaultOpen?: number }) {
  return (
    <div className={clsx("divide-y divide-line border-y border-line", className)}>
      {items.map((it, i) => (
        <details key={it.q} open={i === defaultOpen} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-serif text-[1.25rem] leading-snug [&::-webkit-details-marker]:hidden">
            {it.q}
            <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line transition-transform duration-500 group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="pb-6 pr-12 text-muted">{it.a}</div>
        </details>
      ))}
    </div>
  );
}

export function CtaBand({ title, text, primary, secondary, image }: { title: string; text?: string; primary: { label: string; href: string }; secondary?: { label: string; href: string }; image?: string }) {
  return (
    <section className="theme-ink relative overflow-hidden" data-header-dark>
      {image && (
        <div className="absolute inset-0 opacity-35">
          <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
        </div>
      )}
      <div className="wrap relative py-24 text-center md:py-32">
        <SplitReveal className="mx-auto max-w-4xl font-serif text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.03em]">{title}</SplitReveal>
        {text && <p className="t-lead mx-auto mt-6 max-w-xl">{text}</p>}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href={primary.href} className="btn btn-accent">
            {primary.label} →
          </Link>
          {secondary && (
            <Link href={secondary.href} className="btn btn-ghost">
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
