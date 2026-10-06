"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import type { CardMessage as Card } from "@/lib/commerce/types";
import { getDictionary } from "@/i18n/dictionary";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/** The little cotton-paper card, in handwriting. */
export function PaperCard({ text, from, className, placeholder }: { text: string; from: string; className?: string; placeholder?: string }) {
  return (
    <div className={clsx("relative rounded-[6px] bg-[#fbf8f1] px-5 pb-5 pt-6 text-ink shadow-[0_14px_30px_-12px_rgba(15,27,21,0.35)]", className)}>
      <span aria-hidden className="absolute left-1/2 top-2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-sand" />
      <p className={clsx("t-hand min-h-[3.2em] whitespace-pre-wrap break-words text-[1.45rem]", !text && "text-[#5f6862]")}>{text || placeholder}</p>
      <p className="t-hand mt-2 text-right text-[1.25rem] text-poppy-ink">{from ? `— ${from}` : ""}</p>
      <svg aria-hidden viewBox="0 0 32 40" className="absolute bottom-2 left-4 h-4 w-auto text-ink/25">
        <path d="M16 12 C 12.6 9.4, 12.4 4.2, 16 2.2 C 19.6 4.2, 19.4 9.4, 16 12 Z" fill="currentColor" />
      </svg>
    </div>
  );
}

/**
 * Write the card and watch it tuck into the bouquet. `compact` drops the bouquet stage
 * (cart drawer); the product page and checkout use the full moment.
 */
export function CardEditor({ locale, value, onSave, image, compact }: { locale: Locale; value?: Card; onSave: (c: Card | undefined) => void; image?: string; compact?: boolean }) {
  const d = getDictionary(locale).card;
  const id = useId();
  const [text, setText] = useState(value?.text ?? "");
  const [from, setFrom] = useState(value?.from ?? "");
  const [saved, setSaved] = useState(!!value?.text);
  const card = useRef<HTMLDivElement>(null);

  const save = () => {
    const trimmed = text.trim();
    onSave(trimmed ? { text: trimmed.slice(0, 200), from: from.trim().slice(0, 40) } : undefined);
    setSaved(!!trimmed);
    if (card.current && !compact && !prefersReducedMotion() && trimmed) {
      gsap
        .timeline()
        .to(card.current, { y: -14, rotation: -9, duration: 0.35, ease: "power2.out" })
        .to(card.current, { y: "62%", rotation: 5, scale: 0.9, duration: 1, ease: "expo.inOut" });
    }
  };

  const edit = () => {
    setSaved(false);
    if (card.current && !compact) gsap.to(card.current, { y: 0, rotation: -3, scale: 1, duration: 0.8, ease: "expo.out" });
  };

  const fields = (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor={`${id}-t`} className="field-label">
            {d.title}
          </label>
          <span className="text-xs text-muted">{d.chars(text.length)}</span>
        </div>
        <textarea
          id={`${id}-t`}
          rows={compact ? 2 : 3}
          maxLength={200}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (saved) setSaved(false);
          }}
          onFocus={() => saved && edit()}
          placeholder={d.placeholder}
          className="field resize-none"
        />
      </div>
      <div>
        <label htmlFor={`${id}-f`} className="field-label">
          {d.from}
        </label>
        <input id={`${id}-f`} value={from} maxLength={40} onChange={(e) => setFrom(e.target.value)} placeholder={d.fromPlaceholder} className="field" />
      </div>
      <p className="text-xs text-muted">{d.note}</p>
      <button type="button" onClick={save} className="btn btn-primary w-full">
        {d.save}
      </button>
      <p role="status" className={clsx("text-sm text-moss transition-opacity", saved ? "opacity-100" : "opacity-0")}>
        {saved ? `✓ ${d.saved}` : ""}
      </p>
    </div>
  );

  if (compact) {
    return (
      <div className="grid gap-4">
        <PaperCard text={text} from={from} placeholder={d.placeholder} className="rotate-[-1.5deg]" />
        {fields}
      </div>
    );
  }

  return (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_1.05fr]">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[24rem]" aria-label={d.preview} role="img">
        {image && (
          <>
            <div className="frame absolute inset-0 rounded-[1.5rem]">
              <Image src={image} alt="" fill sizes="(min-width: 768px) 24rem, 90vw" className="object-cover" />
            </div>
            <div ref={card} className="absolute left-[12%] top-[6%] z-10 w-[64%] origin-bottom rotate-[-3deg]">
              <PaperCard text={text} from={from} placeholder={d.placeholder} />
            </div>
            {/* the bouquet's lower half sits in front of the card: it looks tucked in */}
            <div className="frame pointer-events-none absolute inset-0 z-20 rounded-[1.5rem] [clip-path:inset(58%_0_0_0_round_0_0_1.5rem_1.5rem)]">
              <Image src={image} alt="" fill sizes="(min-width: 768px) 24rem, 90vw" className="object-cover" />
            </div>
          </>
        )}
      </div>
      {fields}
    </div>
  );
}
