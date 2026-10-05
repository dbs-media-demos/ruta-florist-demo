import clsx from "clsx";

/**
 * Ruta's mark: a four-petal rue flower whose stem becomes a dotted delivery route that ends
 * at a door (the dot). "Ruta" is rue in Serbian and reads as "route" in English.
 */
export const PETAL = "M16 12 C 12.6 9.4, 12.4 4.2, 16 2.2 C 19.6 4.2, 19.4 9.4, 16 12 Z";

export function Mark({ className, accent = "var(--poppy)", title }: { className?: string; accent?: string; title?: string }) {
  return (
    <svg viewBox="0 0 32 40" className={className} aria-hidden={title ? undefined : true} role={title ? "img" : undefined} fill="none">
      {title && <title>{title}</title>}
      <g fill="currentColor">
        {[0, 90, 180, 270].map((r) => (
          <path key={r} d={PETAL} transform={`rotate(${r} 16 12)`} />
        ))}
      </g>
      <circle cx="16" cy="12" r="1.9" fill={accent} />
      <path d="M16 15.5 C 16 22, 10.5 25, 12 30.5 S 20 34.5, 23 37.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.01 3.2" />
      <circle cx="23.4" cy="37.8" r="1.7" fill={accent} />
    </svg>
  );
}

export function Logo({ className, markClass = "h-[1.55em] w-auto" }: { className?: string; markClass?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-[0.35em] leading-none", className)}>
      <Mark className={markClass} />
      <span className="font-serif text-[1.5em] tracking-[-0.03em]">Ruta</span>
    </span>
  );
}
