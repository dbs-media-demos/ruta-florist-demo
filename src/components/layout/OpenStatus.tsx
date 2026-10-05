"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import { hours } from "@/lib/site";
import { belgradeNow } from "@/lib/delivery";
import { getDictionary } from "@/i18n/dictionary";

/** Live "Open now · closes at 20:00" badge in Belgrade time. */
export function OpenStatus({ locale, className }: { locale: Locale; className?: string }) {
  const d = getDictionary(locale);
  const [label, setLabel] = useState<{ open: boolean; text: string } | null>(null);

  useEffect(() => {
    const compute = () => {
      const b = belgradeNow();
      const today = hours.find((h) => h.day === b.weekday);
      const mins = b.hour * 60 + b.minute;
      const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
      if (today && mins >= toMin(today.open) && mins < toMin(today.close)) {
        setLabel({ open: true, text: `${d.open.open} · ${d.open.closes} ${today.close}` });
        return;
      }
      // next opening
      for (let i = 0; i < 8; i++) {
        const day = (b.weekday + i) % 7;
        const h = hours.find((x) => x.day === day);
        if (!h) continue;
        if (i === 0 && mins >= toMin(h.open)) continue;
        const dayName = i === 0 ? "" : i === 1 ? (locale === "sr" ? "sutra " : "tomorrow ") : `${d.footer.days[day]} `;
        setLabel({ open: false, text: `${d.open.closed} · ${d.open.opens} ${dayName}${h.open}` });
        return;
      }
    };
    compute();
    const id = window.setInterval(compute, 60000);
    return () => window.clearInterval(id);
  }, [d, locale]);

  return (
    <span className={clsx("inline-flex items-center gap-2 text-sm", className)}>
      <span className={clsx("h-2 w-2 rounded-full", label?.open ? "bg-[#4f9a62]" : label ? "bg-poppy" : "bg-sage")} aria-hidden />
      <span>{label?.text ?? d.footer.hours}</span>
    </span>
  );
}
