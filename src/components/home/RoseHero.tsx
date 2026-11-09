"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import { gsap, useGSAP } from "@/lib/gsap";
import { CutoffLine } from "@/components/layout/Countdown";
import { Stars } from "@/components/sections/ReviewsWall";
import { after3DGate, mark3DSlow, stillMode, DESKTOP_3D_QUERY } from "@/lib/three-gate";
import { ROSE_REST } from "@/components/fx/rose-frame";
import type { RoseHandle } from "@/components/fx/RoseScene";

declare global {
  interface Window {
    __roseStill?: () => string;
  }
}

type Copy = { eyebrow: string; line1: string; line2: string; sub: string; shop: string; build: string; scroll: string; note: string; rating: string; call: string };
type Stop = { time: string; label: string };

const STILL = { phone: "/hero/rose-phone.webp", desktop: "/hero/rose-desktop.webp" };

/**
 * Scene 0: a coral garden rose.
 * - Server HTML: the heading, the buttons, the rating, the phone number and a still of the rose
 *   rendered from the 3D scene. Nothing here fades in.
 * - Desktop (big screen + mouse, motion allowed, no Save-Data): after load, three.js is imported
 *   inside the gate, warmed up unseen, and the live rose fades in over the still once it is ready
 *   (too slow in its first 2 s, it fades back to the still for the visit). Scrolling opens it petal by petal,
 *   it turns to face the visitor, then the camera dives into its heart and the page opens onto paper.
 * - Phones and tablets: the still, the same words, no pin, zero bytes of three.js.
 */
export function RoseHero({ locale, copy, day, shopHref, buildHref, phone, phoneDisplay }: { locale: Locale; copy: Copy; day: Stop[]; shopHref: string; buildHref: string; phone: string; phoneDisplay: string }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const rose = useRef<RoseHandle | null>(null);
  const progress = useRef(0);
  const [live, setLive] = useState(false);

  // Scroll scene (desktop with motion only).
  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();
      mm.add(`${DESKTOP_3D_QUERY} and (prefers-reduced-motion: no-preference)`, () => {
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.5,
              onUpdate: (self) => {
                progress.current = self.progress;
                rose.current?.setProgress(self.progress);
                // once the portal opens the header reads dark-on-paper again
                section.toggleAttribute("data-header-dark", self.progress < 0.86);
              },
            },
          })
          .to(q("[data-out]"), { x: -70, opacity: 0, stagger: 0.015, duration: 0.15 }, 0.02)
          .to(q("[data-cue], [data-note]"), { opacity: 0, duration: 0.1 }, 0.02)
          // while it opens, the bouquet's day lights up stop by stop beside it
          .fromTo(q("[data-day]"), { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.07 }, 0.27)
          .fromTo(q("[data-stop]"), { opacity: 0.28 }, { opacity: 1, stagger: 0.075, duration: 0.05 }, 0.3)
          .fromTo(q("[data-stop-dot]"), { scale: 0.5, backgroundColor: "rgba(246,242,234,0.35)" }, { scale: 1, backgroundColor: "#f08a70", stagger: 0.075, duration: 0.05 }, 0.3)
          .to(q("[data-day]"), { opacity: 0, x: -24, duration: 0.07 }, 0.62)
          // without WebGL the still carries the scene
          .to(q("[data-still]"), { scale: 1.14, duration: 0.7 }, 0)
          .fromTo(q("[data-portal]"), { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 0.2, ease: "power1.in" }, 0.8)
          .fromTo(q("[data-portal-text]"), { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.12 }, 0.88);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // The live rose: three.js is imported here, inside the gate, and nowhere else.
  useEffect(() => {
    const section = root.current;
    const still = stillMode();
    let dead = false;
    const onMove = (e: PointerEvent) => rose.current?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    const io = new IntersectionObserver(([en]) => rose.current?.setVisible(en.isIntersecting));

    let fade = 0;
    // too slow on this machine: back to the still for the rest of the visit, then free the GPU
    const onSlow = () => {
      mark3DSlow();
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
      setLive(false);
      fade = window.setTimeout(() => {
        rose.current?.dispose();
        rose.current = null;
      }, 1600);
    };

    const start = async () => {
      const cv = canvas.current;
      if (dead || rose.current || !cv || !section) return;
      performance.mark("rose:import");
      const { createRoseScene } = await import("@/components/fx/RoseScene");
      if (dead || !canvas.current) return;
      let handle: RoseHandle;
      try {
        // resolves once the shaders are compiled and a frame has been drawn unseen: the still holds until then
        handle = await createRoseScene(canvas.current, { still: still ?? undefined, onSlow });
      } catch (err) {
        if (still) console.error(err);
        performance.mark("rose:no-gpu");
        return; // no WebGL, or no real graphics chip: the still stays
      }
      if (dead) return handle.dispose();
      rose.current = handle;
      if (still) {
        canvas.current.style.opacity = "1";
        window.__roseStill = () => rose.current!.snapshot();
        return;
      }
      performance.mark("rose:ready");
      handle.setProgress(progress.current, true);
      window.addEventListener("pointermove", onMove, { passive: true });
      io.observe(section);
      requestAnimationFrame(() => {
        if (dead) return;
        handle.start();
        setLive(true);
      });
    };

    const cancel = still ? (void start(), () => {}) : after3DGate(() => void start());
    return () => {
      dead = true;
      cancel();
      window.clearTimeout(fade);
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
      rose.current?.dispose();
      rose.current = null;
      delete window.__roseStill;
    };
  }, []);

  const [w1, ...rest] = copy.line2.split(" ");

  return (
    <section ref={root} id="hero" data-header-dark className="theme-ink relative desk:h-[300vh]" aria-labelledby="hero-title">
      <div className="relative overflow-hidden lg:h-[100svh] desk:sticky desk:top-0">
        {/* garden-green glow, brightest behind the rose */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(70%_42%_at_62%_60%,#2a4535_0%,#17271f_62%,#101c16_100%)] lg:bg-[radial-gradient(42%_62%_at_var(--rx)_50%,#2c4737_0%,#18291f_58%,#0f1b15_100%)]"
          style={{ ["--rx" as string]: `${ROSE_REST.cx * 100}%` }}
        />

        {/* live canvas (desktop); the still below stays as the fallback */}
        <canvas
          ref={canvas}
          aria-hidden
          className={clsx(
            "pointer-events-none absolute inset-0 hidden h-full w-full transition-opacity duration-[1400ms] ease-[var(--ease-out-expo)] lg:block",
            live ? "opacity-100" : "opacity-0",
          )}
        />

        <div className="wrap flex flex-col pb-8 pt-[calc(var(--header-h)+var(--ribbon-h)+1.25rem)] lg:h-full lg:justify-center lg:pb-16 lg:pt-[calc(var(--header-h)+var(--ribbon-h))]">
          <p data-out className="t-eyebrow relative z-[2] text-paper/75">
            {copy.eyebrow}
          </p>
          <h1 id="hero-title" data-out className="relative z-[2] mt-4 font-serif text-[clamp(2.9rem,13.2vw,5.5rem)] leading-[0.9] tracking-[-0.04em] lg:mt-7 lg:text-[clamp(4.25rem,8.1vw,9.5rem)]">
            <span className="block">{copy.line1}</span>
            <span className="block">
              {w1} <em className="not-italic text-poppy-soft">{rest.join(" ")}</em>
            </span>
          </h1>
          <p data-out className="relative z-[2] mt-4 max-w-[24rem] text-base leading-relaxed text-paper/80 lg:mt-7 lg:max-w-md lg:text-lg">
            {copy.sub}
          </p>

          {/* the rose: a wide crop in the flow on phones, pinned to the rose's spot on desktop */}
          <div
            className="relative -mx-2 mt-3 aspect-[8/5] max-w-[30rem] lg:pointer-events-none lg:absolute lg:inset-y-0 lg:left-[var(--rx)] lg:z-[1] lg:m-0 lg:aspect-square lg:h-full lg:max-w-none lg:-translate-x-1/2"
            style={{ ["--rx" as string]: `${ROSE_REST.cx * 100}%` }}
          >
            <picture>
              <source media="(min-width: 1024px)" srcSet={STILL.desktop} width={1400} height={1400} />
              <img
                data-still
                src={STILL.phone}
                alt=""
                aria-hidden
                width={1000}
                height={625}
                fetchPriority="high"
                decoding="async"
                className={clsx(
                  "absolute inset-0 h-full w-full object-contain transition-opacity delay-300 duration-1000 max-lg:[mask-image:linear-gradient(to_bottom,#000_62%,transparent_96%)]",
                  live && "opacity-0",
                )}
              />
            </picture>
            <p data-note aria-hidden className="absolute bottom-[8%] left-[2%] w-[8.5rem] text-blush/90 lg:bottom-auto lg:left-[60%] lg:top-[56%] lg:w-[12rem] lg:rotate-[-4deg]">
              <svg width="54" height="26" viewBox="0 0 54 26" className="mb-1.5 -scale-x-100 rotate-180 text-blush/70 max-lg:ml-10 max-lg:rotate-[200deg] max-lg:scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                <path d="M2 4c14 2 30 6 46 17M48 21l-7-1M48 21l-1-7" strokeLinecap="round" />
              </svg>
              {/* phones keep to the two text fonts; desktop writes it by hand */}
              <span className="block text-[0.68rem] font-semibold uppercase leading-snug tracking-[0.16em] lg:hidden">{copy.note}</span>
              <span className="t-hand hidden text-[1.75rem] leading-tight lg:block">{copy.note}</span>
            </p>
          </div>

          <div data-out className="relative z-[2] mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.95rem] text-paper/85 lg:mt-9">
            <Stars n={5} size={15} />
            <span>{copy.rating}</span>
          </div>
          <div data-out className="relative z-[2] mt-4 flex flex-wrap gap-2 sm:gap-2.5 lg:gap-3">
            <Link href={shopHref} className="btn btn-accent max-sm:!px-5">
              {copy.shop} <span aria-hidden className="max-[389px]:hidden">→</span>
            </Link>
            <a href={`tel:${phone}`} className="btn btn-ghost whitespace-nowrap !border-paper/30 !text-paper hover:!border-paper max-sm:flex-1 max-sm:!px-4" aria-label={`${copy.call} ${phoneDisplay}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2" />
              </svg>
              {phoneDisplay}
            </a>
            <Link href={buildHref} className="btn btn-ghost hidden !border-paper/30 !text-paper hover:!border-paper lg:inline-flex">
              {copy.build}
            </Link>
          </div>
        </div>

        <div data-cue className="absolute bottom-10 right-[var(--gutter)] z-[2] hidden items-center gap-5 lg:flex">
          <span className="rounded-full border border-paper/25 px-4 py-2 text-sm text-paper/85">
            <CutoffLine locale={locale} compact />
          </span>
          <span className="hidden items-center gap-3 text-xs uppercase tracking-[0.2em] text-paper/60 desk:flex">
            <span className="relative block h-10 w-px overflow-hidden bg-paper/20">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2s_ease-in-out_infinite] bg-paper" />
            </span>
            {copy.scroll}
          </span>
        </div>

        {/* desktop scroll scene: the day from market to door (the same stops as the next section) */}
        <ol data-day aria-hidden className="pointer-events-none absolute left-[var(--gutter)] top-1/2 z-[2] hidden -translate-y-1/2 border-l border-paper/20 opacity-0 desk:block">
          {day.map((s) => (
            <li key={s.time} data-stop className="relative py-4 pl-8">
              <span data-stop-dot className="absolute left-[-0.36rem] top-[1.6rem] h-[0.7rem] w-[0.7rem] rounded-full bg-paper/35" />
              <span className="block font-serif text-[clamp(2.4rem,3.6vw,3.5rem)] leading-none tracking-[-0.02em] text-paper">{s.time}</span>
              <span className="mt-1 block text-sm uppercase tracking-[0.18em] text-paper/70">{s.label}</span>
            </li>
          ))}
        </ol>

        {/* the portal: diving into the rose opens onto paper */}
        <div data-portal aria-hidden className="pointer-events-none absolute inset-0 z-[3] hidden place-items-center bg-paper [clip-path:circle(0%_at_50%_50%)] desk:grid">
          <p data-portal-text className="t-hand text-[clamp(2.4rem,6vw,5rem)] text-poppy-ink opacity-0">
            {locale === "sr" ? "za vas." : "for you."}
          </p>
        </div>
      </div>
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
