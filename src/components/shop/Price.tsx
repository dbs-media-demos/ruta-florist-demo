import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import { formatEur, formatRsd } from "@/lib/format";

/** RSD price (real text, never an image), struck-through compare-at, and ≈ EUR in English. */
export function Price({ amount, compareAt, locale, from, className, eur = true, size = "md" }: { amount: number; compareAt?: number; locale: Locale; from?: string; className?: string; eur?: boolean; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={clsx("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      {from && <span className="text-[0.8em] text-muted">{from}</span>}
      <span className={clsx("t-price", size === "lg" && "text-[1.6rem]", size === "sm" && "text-[0.92rem]", compareAt && "text-poppy-ink")}>{formatRsd(amount)}</span>
      {compareAt && (
        <s className="text-[0.85em] text-muted">
          <span className="sr-only">{locale === "sr" ? "Stara cena:" : "Was:"} </span>
          {formatRsd(compareAt)}
        </s>
      )}
      {eur && locale === "en" && <span className="text-[0.8em] text-muted">{formatEur(amount)}</span>}
    </span>
  );
}
