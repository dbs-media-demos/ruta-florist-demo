"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { gsap, useGSAP, prefersReducedMotion, isTouch, onIdle } from "@/lib/gsap";
import { CutoffLine } from "@/components/layout/Countdown";

const FRAMES = 48;
const src = (set: "d" | "m", i: number) => `/bloom/${set}/${String(i + 1).padStart(3, "0")}.webp`;

type Copy = { eyebrow: string; line1: string; line2: string; sub: string; shop: string; build: string; scroll: string };

/**
 * Scene 0: an alstroemeria opens as you scroll (a 48-frame time-lapse drawn on canvas and
 * screen-blended onto the garden-green ink), then the camera dives into its throat and the
 * page opens into paper. Intro is CSS-only; frames load when the browser is idle.
 */
export function BloomHero({ locale, copy, shopHref, buildHref }: { locale: Locale; copy: Copy; shopHref: string; buildHref: string }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const poster = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      const cv = canvas.current;
      if (!section || !cv) return;
      const q = gsap.utils.selector(section);
      const ctx = cv.getContext("2d");
      const reduce = prefersReducedMotion();
      const set: "d" | "m" = window.innerWidth < 768 ? "m" : "d";
      const images: (HTMLImageElement | undefined)[] = new Array(FRAMES);
      const state = { frame: 0, intro: 0 };
      let drawn = -1;

      const fit = () => {
        const r = cv.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(r.width * dpr);
        cv.height = Math.round(r.height * dpr);
        drawn = -1;
        draw();
      };

      function draw() {
        if (!ctx || !cv) return;
        const want = Math.round(Math.max(state.frame, state.intro));
        // nearest loaded frame at or below the wanted one
        let i = Math.min(FRAMES - 1, want);
        while (i > 0 && !images[i]?.complete) i--;
        const img = images[i];
        if (!img?.complete || i === drawn) return;
        drawn = i;
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
        if (poster.current) poster.current.style.opacity = "0";
      }

      let loading = false;
      const load = () => {
        if (loading) return;
        loading = true;
        const order = reduce ? [FRAMES - 1] : Array.from({ length: FRAMES }, (_, i) => i);
        order.forEach((i, n) => {
          const im = new Image();
          im.decoding = "async";
          im.src = src(set, i);
          im.onload = () => {
            images[i] = im;
            if (n === 0 || i === Math.round(Math.max(state.frame, state.intro))) draw();
          };
        });
        if (!reduce) {
          // the bloom stirs on its own a little, inviting the scroll
          gsap.to(state, { intro: 9, duration: 3.2, delay: 0.6, ease: "sine.inOut", onUpdate: draw });
        }
      };

      const ro = new ResizeObserver(fit);
      ro.observe(cv);

      let cancelIdle = () => {};
      const kick = () => {
        load();
        window.removeEventListener("scroll", kick);
        window.removeEventListener("pointerdown", kick);
      };
      if (isTouch()) {
        window.addEventListener("scroll", kick, { passive: true, once: true });
        window.addEventListener("pointerdown", kick, { passive: true, once: true });
        const t = window.setTimeout(kick, 3500);
        cancelIdle = () => window.clearTimeout(t);
      } else {
        cancelIdle = onIdle(load, 1500);
      }

      if (reduce) {
        state.frame = FRAMES - 1;
        return () => {
          ro.disconnect();
          cancelIdle();
        };
      }

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          // once the portal opens the header should read dark-on-paper again
          onUpdate: (self) => section.toggleAttribute("data-header-dark", self.progress < 0.86),
        },
      });
      tl.to(state, { frame: FRAMES - 1, duration: 0.62, onUpdate: draw }, 0)
        .fromTo(q("[data-flower]"), { scale: 1 }, { scale: 1.18, duration: 0.62 }, 0)
        .to(q("[data-l1]"), { xPercent: -14, opacity: 0.0, duration: 0.5 }, 0.08)
        .to(q("[data-l2]"), { xPercent: 14, opacity: 0.0, duration: 0.5 }, 0.08)
        .to(q("[data-fade]"), { y: -30, opacity: 0, duration: 0.25 }, 0.02)
        .to(q("[data-flower]"), { scale: 16, duration: 0.38, ease: "power2.in" }, 0.62)
        .fromTo(q("[data-portal]"), { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 0.22, ease: "power1.in" }, 0.78)
        .fromTo(q("[data-portal-text]"), { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.12 }, 0.88);

      return () => {
        ro.disconnect();
        cancelIdle();
        window.removeEventListener("scroll", kick);
        window.removeEventListener("pointerdown", kick);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} data-header-dark className="theme-ink relative h-[300vh] motion-reduce:h-[100svh]" aria-labelledby="hero-title">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* soft garden glow behind the bloom */}
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_55%,#2c4636_0%,#17271f_60%,#0f1b15_100%)]" />

        <div className="absolute left-1/2 top-[54%] aspect-[960/898] w-[min(96vw,calc(78svh*1.07))] -translate-x-1/2 -translate-y-1/2 mix-blend-screen md:top-[52%]">
          <div data-flower className="absolute inset-0 will-change-transform [mask-image:linear-gradient(to_bottom,#000_72%,transparent_98%)]" style={{ transformOrigin: "49% 44%" }}>
            <div className="anim-unfold absolute inset-0" style={{ ["--d" as string]: "0.15s" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- frame 1 of the sequence, swapped for the canvas */}
              <picture>
                <source media="(min-width: 768px)" srcSet={src("d", 0)} />
                <img ref={poster} src={src("m", 0)} alt="" aria-hidden className="absolute inset-0 h-full w-full transition-opacity duration-300" fetchPriority="low" />
              </picture>
              <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,transparent_60%,#000_100%)]" />
            </div>
          </div>
        </div>

        <div className="wrap relative flex h-full flex-col justify-between pb-8 pt-[calc(var(--header-h)+var(--ribbon-h)+1.5rem)] md:pb-10">
          <div data-fade className="flex items-start justify-between gap-6">
            <p className="t-eyebrow anim-fade text-paper/75">{copy.eyebrow}</p>
            <p className="anim-fade hidden max-w-[16rem] text-right text-sm text-paper/70 md:block" style={{ ["--d" as string]: "0.3s" }}>
              {copy.sub}
            </p>
          </div>

          <h1 id="hero-title" className="pointer-events-none relative font-serif leading-[0.86] tracking-[-0.04em]">
            <span data-l1 className="line-mask">
              <span className="anim-heading text-[clamp(3.6rem,13.5vw,14.5rem)]" style={{ ["--d" as string]: "0.05s" }}>
                {copy.line1}
              </span>
            </span>
            <span data-l2 className="line-mask mt-[18svh] text-right md:mt-[24svh]">
              <span className="anim-heading text-[clamp(3.6rem,13.5vw,14.5rem)]" style={{ ["--d" as string]: "0.18s" }}>
                {copy.line2.split(" ")[0]} <em className="not-italic text-poppy-soft">{copy.line2.split(" ").slice(1).join(" ")}</em>
              </span>
            </span>
          </h1>

          <div data-fade className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <p className="max-w-sm text-paper/80 md:hidden">{copy.sub}</p>
            <div className="anim-fade flex flex-wrap gap-3" style={{ ["--d" as string]: "0.35s" }}>
              <Link href={shopHref} className="btn btn-accent">
                {copy.shop} →
              </Link>
              <Link href={buildHref} className="btn btn-ghost !border-paper/30 !text-paper hover:!border-paper">
                {copy.build}
              </Link>
            </div>
            <div className="flex items-center gap-5">
              <span className="hidden rounded-full border border-paper/25 px-4 py-2 text-sm text-paper/85 md:inline-flex">
                <CutoffLine locale={locale} compact />
              </span>
              <span className="hidden items-center gap-3 text-xs uppercase tracking-[0.2em] text-paper/60 md:flex">
                <span className="relative block h-10 w-px overflow-hidden bg-paper/20">
                  <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2s_ease-in-out_infinite] bg-paper" />
                </span>
                {copy.scroll}
              </span>
            </div>
          </div>
        </div>

        {/* the portal: diving through the flower opens into paper */}
        <div data-portal aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center bg-paper [clip-path:circle(0%_at_50%_50%)]">
          <p data-portal-text className="t-hand text-[clamp(2.4rem,6vw,5rem)] text-poppy-ink opacity-0">
            {locale === "sr" ? "za vas." : "for you."}
          </p>
        </div>
      </div>
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
