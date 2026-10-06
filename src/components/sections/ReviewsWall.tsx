import type { Locale } from "@/lib/i18n";
import { storeReviews, ratingSummary } from "@/content/reviews";
import { formatDate } from "@/lib/format";

function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${n}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" aria-hidden>
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 15l-5.2 2.7 1-5.9L1.5 7.7l5.9-.8Z" fill={i < n ? "#f4b400" : "var(--sand)"} />
        </svg>
      ))}
    </span>
  );
}

export { Stars };

export function ReviewCard({ r, locale }: { r: (typeof storeReviews)[number]; locale: Locale }) {
  return (
    <figure className="flex h-full w-[min(82vw,24rem)] shrink-0 flex-col rounded-[1.5rem] border border-line bg-surface p-6">
      <div className="flex items-center justify-between">
        <Stars n={r.rating} />
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[0.7rem] font-semibold">{r.tag[locale]}</span>
      </div>
      <blockquote className="mt-4 flex-1 text-[0.98rem] leading-relaxed">“{r.text[locale]}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 text-sm">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-moss font-semibold text-paper">{r.name[0]}</span>
        <span>
          <span className="block font-semibold">{r.name}</span>
          <span className="text-muted">
            {r.area} · {formatDate(new Date(r.date), locale, { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/** Scene 9: Google-style rating plus two rows of reviews drifting in opposite directions. */
export function ReviewsWall({ locale, eyebrow, title }: { locale: Locale; eyebrow: string; title: string }) {
  const rows = [storeReviews.slice(0, 6), storeReviews.slice(6)];
  return (
    <section className="theme-paper overflow-hidden py-24 md:py-36">
      <div className="wrap flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="t-eyebrow text-accent">{eyebrow}</p>
          <h2 className="t-h2 mt-4 max-w-2xl">{title}</h2>
        </div>
        <div className="flex items-center gap-5 rounded-[1.5rem] border border-line bg-surface p-5">
          <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden>
            <path fill="#4285F4" d="M45 24.5c0-1.6-.1-2.8-.4-4.1H24v7.7h12c-.2 2-1.6 5-4.6 7l7.1 5.5C42.7 36.8 45 31.2 45 24.5z" />
            <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-1.9 1.3-4.4 2.2-7.4 2.2-5.7 0-10.5-3.8-12.2-9L4.5 33.9C8.1 41 15.5 46 24 46z" />
            <path fill="#FBBC05" d="M11.8 28.3c-.4-1.3-.7-2.7-.7-4.3s.3-3 .7-4.3l-7.3-5.7C3 17 2 20.4 2 24s1 7 2.5 10l7.3-5.7z" />
            <path fill="#EA4335" d="M24 10.8c4.1 0 6.9 1.8 8.5 3.3l6.2-6.1C34.9 4.4 29.9 2 24 2 15.5 2 8.1 7 4.5 14l7.3 5.7c1.7-5.2 6.5-8.9 12.2-8.9z" />
          </svg>
          <div>
            <p className="flex items-center gap-2">
              <span className="font-serif text-3xl">{ratingSummary.value.toFixed(1).replace(".", locale === "sr" ? "," : ".")}</span>
              <Stars n={5} size={16} />
            </p>
            <p className="text-sm text-muted">{locale === "sr" ? `${ratingSummary.count} Google utisaka` : `${ratingSummary.count} Google reviews`}</p>
          </div>
        </div>
      </div>
      <div className="mt-14 space-y-5">
        {rows.map((row, i) => (
          <div key={i} className="marquee-wrap overflow-hidden">
            <ul className="marquee gap-5 pl-5" style={{ ["--marquee-d" as string]: `${55 + i * 12}s`, animationDirection: i ? "reverse" : "normal" }}>
              {[...row, ...row].map((r, k) => (
                <li key={`${r.id}-${k}`} aria-hidden={k >= row.length} className="h-auto">
                  <ReviewCard r={r} locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
