"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import clsx from "clsx";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion, loadSplitText } from "@/lib/gsap";

/*
 * Scroll-driven reveals. Content is visible in the HTML. `immediate` variants (top of the page)
 * use CSS keyframes (transform only) so they paint without waiting for hydration. Everything
 * else is hidden with opacity only while it is still below the fold.
 */

const belowFold = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92;
const delayStyle = (d: number) => ({ "--d": `${d}s` }) as CSSProperties;

type SplitProps = { children: ReactNode; as?: ElementType; className?: string; delay?: number; immediate?: boolean; stagger?: number; id?: string; chars?: boolean };

/** Headline that rises line by line out of a mask (or letter by letter with `chars`). */
export function SplitReveal({ children, as: Tag = "h2", className, delay = 0, immediate, stagger = 0.09, id, chars }: SplitProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || immediate || prefersReducedMotion() || !belowFold(el)) return;
      gsap.set(el, { opacity: 0 });
      let split: { revert: () => void } | null = null;
      let cancelled = false;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          loadSplitText().then((SplitText) => {
            if (cancelled) return;
            split = SplitText.create(el, {
              type: chars ? "lines,chars" : "lines",
              mask: "lines",
              autoSplit: true,
              onSplit(self) {
                gsap.set(el, { opacity: 1 });
                return chars
                  ? gsap.from(self.chars, { yPercent: 110, rotate: 6, duration: 1.1, stagger: 0.022, delay, ease: "expo.out" })
                  : gsap.from(self.lines, { yPercent: 115, duration: 1.3, stagger, delay, ease: "expo.out" });
              },
            });
          });
        },
        { rootMargin: "0px 0px -8% 0px" },
      );
      io.observe(el);
      return () => {
        cancelled = true;
        io.disconnect();
        split?.revert();
      };
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={clsx(immediate && "anim-heading", className)} style={immediate ? delayStyle(delay) : undefined}>
      {children}
    </Tag>
  );
}

type RevealProps = { children: ReactNode; as?: ElementType; className?: string; delay?: number; y?: number; stagger?: number; immediate?: boolean; id?: string; wipe?: boolean };

/** Fade + rise when scrolled into view; `wipe` unmasks children upward like petals unfurling. */
export function Reveal({ children, as: Tag = "div", className, delay = 0, y = 36, stagger, immediate, id, wipe }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || immediate || prefersReducedMotion() || !belowFold(el)) return;
      const targets = stagger ? Array.from(el.children) : [el];
      if (wipe) {
        gsap.set(targets, { clipPath: "inset(100% 0% 0% 0% round 1.25rem)", y: 40 });
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () =>
            gsap.to(targets, { clipPath: "inset(0% 0% 0% 0% round 1.25rem)", y: 0, duration: 1.4, delay, stagger: stagger ?? 0, ease: "expo.out", clearProps: "clipPath,transform" }),
        });
        return;
      }
      gsap.set(targets, { opacity: 0, y });
      ScrollTrigger.create({
        trigger: el,
        start: "top 92%",
        once: true,
        onEnter: () => gsap.to(targets, { opacity: 1, y: 0, duration: 1.2, delay, stagger: stagger ?? 0, ease: "expo.out", clearProps: "transform" }),
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={clsx(immediate && "anim-fade", className)} style={immediate ? delayStyle(delay) : undefined}>
      {children}
    </Tag>
  );
}

/** Paragraph whose words brighten one by one as you scroll through it. */
export function ScrubWords({ text, className, as: Tag = "p", accent = [] }: { text: string; className?: string; as?: ElementType; accent?: number[] }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const words = el.querySelectorAll<HTMLElement>("[data-w]");
      gsap.fromTo(words, { opacity: 0.22 }, { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 45%", scrub: 0.6 } });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} data-w className={accent.includes(i) ? "text-accent" : undefined}>
          {w}{" "}
        </span>
      ))}
    </Tag>
  );
}

/** Image frame whose inner layer drifts with scroll (the first child moves). */
export function Parallax({ children, className, amount = 12, style }: { children: ReactNode; className?: string; amount?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      const layer = el?.firstElementChild;
      if (!el || !layer || prefersReducedMotion()) return;
      gsap.fromTo(layer, { yPercent: -amount / 2, scale: 1 + amount / 100 }, { yPercent: amount / 2, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={clsx("frame", className)} style={style}>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
