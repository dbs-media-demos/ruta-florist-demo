"use client";

import { useEffect, useId, useState } from "react";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/i18n/dictionary";
import { deliveryDates, slotsFor, cutoffState } from "@/lib/delivery";
import { formatDate, slotLabel } from "@/lib/format";
import { setDelivery, useBag } from "@/lib/commerce/store";

/** Date chips (Today / Tomorrow / …) and the four windows. Bound to the bag's delivery choice. */
export function DeliveryPicker({ locale, invalid, compact }: { locale: Locale; invalid?: boolean; compact?: boolean }) {
  const d = getDictionary(locale).product;
  const id = useId();
  const bag = useBag();
  const [dates, setDates] = useState<string[]>([]);
  const [today, setToday] = useState("");

  useEffect(() => {
    const s = cutoffState();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- dates depend on the visitor's clock
    setDates(deliveryDates());
    setToday(s.today);
  }, []);

  const chosen = bag.delivery;
  const date = chosen && dates.includes(chosen.date) ? chosen.date : undefined;
  const slots = date ? slotsFor(date) : [];
  const slot = date && chosen && slots.includes(chosen.slot) ? chosen.slot : undefined;

  return (
    <fieldset className={clsx("rounded-2xl border p-4 transition-colors", invalid ? "border-poppy-ink bg-poppy/5" : "border-line")} aria-describedby={invalid ? `${id}-err` : undefined}>
      <legend className="px-1 text-sm font-semibold">{d.pickDate}</legend>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label={d.pickDate}>
        {dates.length === 0 && <span className="h-[2.9rem]" />}
        {dates.slice(0, compact ? 6 : 9).map((iso, i) => {
          const dt = new Date(`${iso}T12:00:00Z`);
          const isTomorrow = i === (dates[0] === today ? 1 : 0) && iso !== today;
          return (
            <button
              key={iso}
              type="button"
              role="radio"
              aria-checked={date === iso}
              onClick={() => {
                const first = slotsFor(iso)[0];
                setDelivery({ date: iso, slot: chosen?.slot && slotsFor(iso).includes(chosen.slot) ? chosen.slot : first, zone: chosen?.zone });
              }}
              className="chip shrink-0 flex-col !gap-0 !rounded-2xl !px-3.5 !py-2 leading-tight"
            >
              <span className="text-[0.82rem] font-semibold">{iso === today ? d.today : isTomorrow ? d.tomorrow : formatDate(dt, locale, { weekday: "short" })}</span>
              <span className="text-[0.72rem] opacity-70">{formatDate(dt, locale, { day: "numeric", month: "short" })}</span>
            </button>
          );
        })}
      </div>
      <p className="mb-2 mt-4 text-sm font-semibold">{d.pickSlot}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label={d.pickSlot}>
        {["09-12", "12-15", "15-18", "18-21"].map((s) => {
          const ok = !!date && slots.includes(s);
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={slot === s}
              disabled={!ok}
              onClick={() => date && setDelivery({ date, slot: s, zone: chosen?.zone })}
              className="chip !rounded-xl !px-2 text-[0.82rem] tabular-nums disabled:cursor-not-allowed disabled:opacity-35"
            >
              {slotLabel(s).replace(":00", "").replace(":00", "")}
            </button>
          );
        })}
      </div>
      {invalid && (
        <p id={`${id}-err`} className="field-error" role="alert">
          {d.required}
        </p>
      )}
      {!compact && <p className="mt-3 text-xs text-muted">{d.deliveryNote}</p>}
    </fieldset>
  );
}
