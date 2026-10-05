"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/i18n/dictionary";
import { Logo } from "@/components/brand/Logo";
import { bagCount, ui, useBag, useUI, useWishlist } from "@/lib/commerce/store";
import { CutoffLine } from "./Countdown";
import { lockScroll } from "./SmoothScroll";

export type NavItem = { key: string; label: string; href: string; image?: string; note?: string };

type Props = {
  locale: Locale;
  homeHref: string;
  primary: NavItem[];
  shopHref: string;
  categories: NavItem[];
  collections: NavItem[];
  menu: NavItem[];
  wishlistHref: string;
  builderHref: string;
  altMap: Record<string, string>;
  otherHome: string;
  phone: string;
  phoneDisplay: string;
};

export function Header(p: Props) {
  const d = getDictionary(p.locale);
  const pathname = usePathname();
  const bag = useBag();
  const wish = useWishlist();
  const { bump } = useUI();
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [menu, setMenu] = useState(false);
  const [bumping, setBumping] = useState(false);
  const megaTimer = useRef<number | null>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstMenuLink = useRef<HTMLAnchorElement>(null);
  const isHome = pathname === p.homeHref;
  const count = bagCount(bag);

  // Dark sections under the header ([data-header-dark]) flip it to light-on-transparent.
  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 24);
      const probe = 40;
      const hit = Array.from(document.querySelectorAll<HTMLElement>("[data-header-dark]")).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= probe && r.bottom > probe;
      });
      setDark(hit);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const id = window.setTimeout(update, 300);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.clearTimeout(id);
    };
  }, [pathname]);

  useEffect(() => {
    if (bump === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restart the bump animation on each add
    setBumping(false);
    const id = window.requestAnimationFrame(() => setBumping(true));
    return () => window.cancelAnimationFrame(id);
  }, [bump]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close menus on navigation
    setMenu(false);
    setMega(false);
  }, [pathname]);

  useEffect(() => {
    lockScroll(menu);
    if (!menu) return;
    firstMenuLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        menuBtn.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const openMega = () => {
    if (megaTimer.current) window.clearTimeout(megaTimer.current);
    setMega(true);
  };
  const closeMega = () => {
    megaTimer.current = window.setTimeout(() => setMega(false), 160);
  };

  const altHref = p.altMap[pathname] ?? p.otherHome;
  const light = dark && !mega && !menu;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[150]" onMouseLeave={closeMega}>
        <div className="flex h-[var(--ribbon-h)] items-center justify-center bg-ink px-4 text-[0.78rem] font-medium text-paper">
          <CutoffLine locale={p.locale} />
          <span className="ml-3 hidden text-paper/70 lg:inline">· {d.shop.marquee[0]}</span>
        </div>
        <div
          className={clsx(
            "relative h-[var(--header-h)] transition-[background-color,color,box-shadow] duration-500",
            light ? "bg-transparent text-paper" : "bg-paper/88 text-ink backdrop-blur-xl",
            !light && scrolled && "shadow-[0_1px_0_var(--line)]",
          )}
          style={{ ["--line" as string]: "color-mix(in oklab, var(--ink) 12%, transparent)" }}
        >
          <div className="wrap grid h-full grid-cols-[1fr_auto_1fr] items-center gap-4">
            <nav aria-label="Primary" className="flex items-center gap-1">
              <button
                ref={menuBtn}
                type="button"
                className="-ml-2 grid h-11 w-11 place-items-center rounded-full lg:hidden"
                aria-label={d.menu.open}
                aria-expanded={menu}
                aria-controls="mobile-menu"
                onClick={() => setMenu(true)}
              >
                <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden>
                  <path d="M0 1h22M0 7h14M0 13h22" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
              <ul className="hidden items-center gap-1 lg:flex">
                <li onMouseEnter={openMega}>
                  <Link
                    href={p.shopHref}
                    className="flex h-11 items-center gap-1.5 rounded-full px-3.5 text-[0.92rem] font-medium hover:bg-current/5"
                    aria-expanded={mega}
                    aria-haspopup="true"
                    onFocus={openMega}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setMega(false);
                    }}
                  >
                    {d.nav.shop}
                    <svg width="9" height="6" viewBox="0 0 9 6" aria-hidden className={clsx("transition-transform", mega && "rotate-180")}>
                      <path d="M1 1l3.5 3.5L8 1" stroke="currentColor" strokeWidth="1.4" fill="none" />
                    </svg>
                  </Link>
                </li>
                {p.primary.map((n) => (
                  <li key={n.key} onMouseEnter={closeMega}>
                    <Link
                      href={n.href}
                      className={clsx(
                        "flex h-11 items-center rounded-full px-3.5 text-[0.92rem] font-medium hover:bg-current/5",
                        pathname.startsWith(n.href) && "underline decoration-poppy decoration-2 underline-offset-[6px]",
                      )}
                    >
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <Link href={p.homeHref} aria-label="Ruta, početna" className="justify-self-center text-[1.05rem] md:text-[1.2rem]">
              <Logo />
            </Link>

            <div className="flex items-center justify-end gap-0.5">
              <button type="button" onClick={ui.openSearch} className="grid h-11 w-11 place-items-center rounded-full hover:bg-current/5" aria-label={d.search.label}>
                <svg width="19" height="19" viewBox="0 0 20 20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="8.5" cy="8.5" r="6.5" />
                  <path d="M13.5 13.5L19 19" />
                </svg>
              </button>
              <a
                href={altHref}
                hrefLang={p.locale === "sr" ? "en" : "sr"}
                aria-label={d.lang.label}
                className="hidden h-11 items-center rounded-full px-3 text-[0.8rem] font-semibold tracking-[0.08em] hover:bg-current/5 sm:flex"
              >
                {p.locale === "sr" ? "EN" : "SR"}
              </a>
              <Link href={p.wishlistHref} className="relative hidden h-11 w-11 place-items-center rounded-full hover:bg-current/5 sm:grid" aria-label={`${d.wish.title} (${wish.items.length})`}>
                <svg width="20" height="19" viewBox="0 0 24 22" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 20.5S2 14.4 2 7.6A5.1 5.1 0 0 1 12 5a5.1 5.1 0 0 1 10 2.6c0 6.8-10 12.9-10 12.9Z" />
                </svg>
                {wish.items.length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-poppy" />}
              </Link>
              <button
                type="button"
                onClick={ui.openDrawer}
                data-bag-icon
                className="relative grid h-11 w-11 place-items-center rounded-full hover:bg-current/5"
                aria-label={`${d.bag.open}, ${d.bag.items(count)}`}
              >
                <svg width="20" height="21" viewBox="0 0 20 22" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 7h14l-1.2 13H4.2L3 7Z" />
                  <path d="M7 9V5a3 3 0 0 1 6 0v4" />
                </svg>
                <span
                  className={clsx(
                    "absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-poppy-ink px-1 text-[0.68rem] font-bold text-white transition-opacity",
                    count === 0 && "opacity-0",
                    bumping && "bump",
                  )}
                  onAnimationEnd={() => setBumping(false)}
                  suppressHydrationWarning
                >
                  {count}
                </span>
              </button>
            </div>
          </div>

          {/* Mega menu */}
          <div
            className={clsx(
              "absolute inset-x-0 top-full hidden text-ink transition-[clip-path,opacity] duration-700 ease-[var(--ease-out-expo)] lg:block",
              mega ? "visible opacity-100 [clip-path:inset(0_0_0_0)]" : "invisible opacity-0 [clip-path:inset(0_0_100%_0)]",
            )}
            onMouseEnter={openMega}
            onMouseLeave={closeMega}
          >
            <div className="theme-paper border-t border-line shadow-[0_30px_60px_-30px_rgba(15,27,21,0.35)]">
              <div className="wrap grid grid-cols-[1fr_1fr_1.35fr] gap-10 py-10">
                <div>
                  <p className="t-eyebrow text-muted">{d.nav.shop}</p>
                  <ul className="mt-4 space-y-1">
                    {p.categories.map((c, i) => (
                      <li key={c.key} style={{ transitionDelay: `${mega ? 60 + i * 40 : 0}ms` }} className={clsx("transition-[transform,opacity] duration-700", mega ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")}>
                        <Link href={c.href} className="group flex items-center gap-4 rounded-2xl py-1.5 pr-3">
                          {c.image && (
                            <span className="frame h-12 w-10 shrink-0 rounded-lg">
                              <Image src={c.image} alt="" fill sizes="40px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                            </span>
                          )}
                          <span className="t-h4 transition-colors group-hover:text-poppy-ink">{c.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="t-eyebrow text-muted">{d.nav.collections}</p>
                  <ul className="mt-4 space-y-2.5">
                    {p.collections.map((c, i) => (
                      <li key={c.key} style={{ transitionDelay: `${mega ? 120 + i * 40 : 0}ms` }} className={clsx("transition-[transform,opacity] duration-700", mega ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")}>
                        <Link href={c.href} className="link-u text-[1.02rem]">
                          {c.label}
                        </Link>
                      </li>
                    ))}
                    <li className="pt-3">
                      <Link href={p.shopHref} className="t-eyebrow inline-flex items-center gap-2 text-poppy-ink">
                        {d.menu.shopAll} →
                      </Link>
                    </li>
                  </ul>
                </div>
                <Link href={p.builderHref} className="group relative block overflow-hidden rounded-3xl" data-cursor="view" data-cursor-label="→">
                  <span className="frame block aspect-[16/10]">
                    <Image src="/images/studio/flower-wall-wide.jpg" alt="" fill sizes="520px" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-ink/70 to-transparent p-6 text-paper">
                    <span className="t-h3">{d.nav.builder}</span>
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-paper text-ink transition-transform duration-500 group-hover:rotate-45">↗</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      {!isHome && <div aria-hidden className="h-[calc(var(--header-h)+var(--ribbon-h))]" />}

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={d.menu.open}
        className={clsx("theme-ink fixed inset-0 z-[220] flex flex-col transition-[clip-path] duration-700 ease-[var(--ease-in-out-quart)] lg:hidden", menu ? "[clip-path:circle(150%_at_2rem_4rem)]" : "pointer-events-none invisible [clip-path:circle(0%_at_2rem_4rem)]")}
      >
        <div className="wrap flex h-[calc(var(--header-h)+var(--ribbon-h))] items-center justify-between pt-[var(--ribbon-h)]">
          <Logo className="text-[1.05rem]" />
          <button type="button" onClick={() => setMenu(false)} className="grid h-11 w-11 place-items-center rounded-full border border-line" aria-label={d.menu.close}>
            ×
          </button>
        </div>
        <nav className="wrap flex-1 overflow-y-auto pb-10" data-lenis-prevent>
          <ul className="mt-4 space-y-1">
            {p.menu.map((n, i) => (
              <li key={n.key} style={{ transitionDelay: `${menu ? 150 + i * 45 : 0}ms` }} className={clsx("transition-[transform,opacity] duration-700", menu ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0")}>
                <Link ref={i === 0 ? firstMenuLink : undefined} href={n.href} className="flex items-baseline justify-between border-b border-line py-3">
                  <span className="font-serif text-[2rem] leading-tight">{n.label}</span>
                  {n.note && <span className="text-xs text-muted">{n.note}</span>}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`tel:${p.phone}`} className="btn btn-ghost">
              {d.cta.call} · {p.phoneDisplay}
            </a>
            <a href={altHref} hrefLang={p.locale === "sr" ? "en" : "sr"} className="btn btn-ghost">
              {d.lang.switch}
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
