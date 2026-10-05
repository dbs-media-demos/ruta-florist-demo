import { delivery } from "./site";

/** Belgrade wall-clock parts for a given instant. */
export function belgradeNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Belgrade",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const hour = Number(get("hour")) % 24;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour,
    minute: Number(get("minute")),
    second: Number(get("second")),
    weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")),
  };
}

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export const weekdayOf = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay();

/** The live "Order by 14:00 for delivery today" state. */
export function cutoffState(now = new Date()) {
  const b = belgradeNow(now);
  const secondsNow = b.hour * 3600 + b.minute * 60 + b.second;
  const cutoff = delivery.cutoffHour * 3600;
  const sunday = b.weekday === 0;
  const sameDay = !sunday && secondsNow < cutoff;
  return {
    sameDay,
    secondsLeft: sameDay ? cutoff - secondsNow : 0,
    today: b.date,
    tomorrow: addDays(b.date, 1),
    nextDate: sameDay ? b.date : addDays(b.date, weekdayOf(addDays(b.date, 1)) === 0 ? 1 : 1),
  };
}

/** Delivery windows for a date. Sundays: mornings only. Today: windows that still fit. */
export function slotsFor(dateIso: string, now = new Date()): string[] {
  const b = belgradeNow(now);
  const all = [...delivery.slots] as string[];
  const day = weekdayOf(dateIso);
  let slots = day === 0 ? all.slice(0, 2) : all;
  if (dateIso === b.date) {
    if (b.hour >= delivery.cutoffHour || day === 0) return [];
    slots = slots.filter((s) => Number(s.slice(0, 2)) >= b.hour + 1);
  }
  return slots;
}

/** The next 14 selectable delivery dates. */
export function deliveryDates(now = new Date()): string[] {
  const b = belgradeNow(now);
  return Array.from({ length: 15 }, (_, i) => addDays(b.date, i)).filter((d) => slotsFor(d, now).length > 0).slice(0, 14);
}

export const fmtCountdown = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};
