import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/i18n/dictionary";
import { pageHref } from "@/lib/routes";
import { agencyUrl, hours, site } from "@/lib/site";
import { Mark } from "@/components/brand/Logo";
import { OpenStatus } from "./OpenStatus";
import { Newsletter } from "./Newsletter";

export function Footer({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const h = (k: Parameters<typeof pageHref>[1]) => pageHref(locale, k);
  const order = [1, 2, 3, 4, 5, 6, 0];
  const grouped = order.map((day) => hours.find((x) => x.day === day)!);

  const cols: { title: string; links: [string, string][] }[] = [
    {
      title: d.footer.shop,
      links: [
        [d.nav.shop, h("shop")],
        [d.nav.collections, h("collections")],
        [d.nav.builder, h("builder")],
        [d.nav.subscriptions, h("subscriptions")],
        [d.nav.giftCards, h("giftCards")],
      ],
    },
    {
      title: d.footer.studio,
      links: [
        [d.nav.about, h("about")],
        [d.nav.weddings, h("weddings")],
        [d.nav.business, h("business")],
        [d.nav.care, h("care")],
        [d.nav.reviews, h("reviews")],
      ],
    },
    {
      title: d.footer.help,
      links: [
        [d.nav.delivery, h("delivery")],
        [d.nav.track, h("track")],
        [d.nav.faq, h("faq")],
        [d.nav.contact, h("contact")],
        [d.nav.privacy, h("privacy")],
        [d.nav.terms, h("terms")],
      ],
    },
  ];

  return (
    <footer className="theme-ink relative overflow-hidden pb-24 pt-20 md:pb-10">
      <div className="wrap">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <p className="t-h2 max-w-md">{d.footer.newsletter}</p>
            <p className="mt-4 max-w-sm text-muted">{d.footer.newsletterText}</p>
            <Newsletter locale={locale} />
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="t-eyebrow text-muted">{c.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="link-u">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-10 border-t border-line pt-10 md:grid-cols-3">
          <div>
            <p className="t-eyebrow text-muted">{d.footer.visit}</p>
            <address className="mt-4 not-italic leading-relaxed">
              Ruta · {locale === "sr" ? "cvetni atelje" : "flower studio"}
              <br />
              {site.street}, {site.district}
              <br />
              {site.postalCode} {site.city}
            </address>
            <p className="mt-3">
              <a href={`tel:${site.phone}`} className="link-u">
                {site.phoneDisplay}
              </a>
              <br />
              <a href={`mailto:${site.email}`} className="link-u">
                {site.email}
              </a>
            </p>
          </div>
          <div>
            <p className="t-eyebrow text-muted">{d.footer.hours}</p>
            <OpenStatus locale={locale} className="mt-4" />
            <dl className="mt-3 grid max-w-[15rem] grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
              {grouped.map((g) => (
                <div key={g.day} className="contents">
                  <dt className="text-muted">{d.footer.days[g.day]}</dt>
                  <dd className="tabular-nums">
                    {g.open}–{g.close}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="t-eyebrow text-muted">{d.bag.shipping}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted">{d.footer.payments}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[0.7rem] font-semibold tracking-[0.08em]">
              {["VISA", "MASTERCARD", "DINACARD", "IPS QR", locale === "sr" ? "POUZEĆEM" : "CASH ON DELIVERY"].map((m) => (
                <span key={m} className="rounded-md border border-line px-2 py-1">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap relative mt-16">
        <svg aria-hidden viewBox="0 0 1000 300" className="pointer-events-none w-full select-none">
          <text x="0" y="250" fontSize="330" letterSpacing="-16" fill="currentColor" opacity="0.07" style={{ fontFamily: "var(--font-gloock), Georgia, serif" }}>
            Ruta
          </text>
        </svg>
        <Mark className="absolute right-[var(--gutter)] top-[8%] h-[16vw] w-auto text-paper/[0.08]" accent="color-mix(in oklab, var(--poppy) 40%, transparent)" />
      </div>

      <div className="wrap mt-6 flex flex-col gap-3 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} Ruta · {d.footer.rights}
        </p>
        <a href={agencyUrl} target="_blank" rel="noopener" className="link-u">
          {d.footer.credit} ↗
        </a>
      </div>
    </footer>
  );
}
