"use client";

import { useId, useRef, useState } from "react";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/i18n/dictionary";

export type FieldSpec = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select" | "date" | "number";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  half?: boolean;
  autoComplete?: string;
};

/** Validated demo form with a polished success state. It never sends anything. */
export function DemoForm({ locale, fields, submit, success, className }: { locale: Locale; fields: FieldSpec[]; submit: string; success: string; className?: string }) {
  const d = getDictionary(locale).forms;
  const id = useId();
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const root = useRef<HTMLFormElement>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    for (const f of fields) {
      const v = (values[f.name] ?? "").trim();
      if (f.required && !v) e[f.name] = d.required;
      else if (v && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) e[f.name] = d.invalidEmail;
      else if (v && f.type === "tel" && v.replace(/\D/g, "").length < 8) e[f.name] = d.invalidPhone;
    }
    return e;
  };

  if (state === "done") {
    return (
      <div className={clsx("rounded-[1.5rem] bg-surface p-8 text-center", className)} role="status">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-moss text-2xl text-paper">✓</span>
        <p className="t-h3 mt-5">{success}</p>
        <p className="mt-3 text-sm text-muted">{d.demoNote}</p>
      </div>
    );
  }

  return (
    <form
      ref={root}
      noValidate
      className={clsx("grid gap-4 sm:grid-cols-2", className)}
      onSubmit={(ev) => {
        ev.preventDefault();
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) {
          window.setTimeout(() => root.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(), 20);
          return;
        }
        setState("sending");
        window.setTimeout(() => setState("done"), 900);
      }}
    >
      {fields.map((f) => {
        const fid = `${id}-${f.name}`;
        const common = {
          id: fid,
          name: f.name,
          value: values[f.name] ?? "",
          "aria-invalid": !!errors[f.name],
          "aria-describedby": errors[f.name] ? `${fid}-e` : undefined,
          className: "field",
          autoComplete: f.autoComplete,
          placeholder: f.placeholder,
          onChange: (e: { target: { value: string } }) => setValues((v) => ({ ...v, [f.name]: e.target.value })),
        };
        return (
          <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
            <label htmlFor={fid} className="field-label">
              {f.label}
              {f.required && <span className="text-poppy-ink"> *</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea rows={4} {...common} className="field resize-none" />
            ) : f.type === "select" ? (
              <select {...common}>
                <option value="">—</option>
                {f.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input type={f.type ?? "text"} {...common} />
            )}
            {errors[f.name] && (
              <p id={`${fid}-e`} className="field-error">
                {errors[f.name]}
              </p>
            )}
          </div>
        );
      })}
      <div className="sm:col-span-2">
        <button className="btn btn-primary" disabled={state === "sending"}>
          {state === "sending" ? d.sending : submit} →
        </button>
        <p className="mt-3 text-xs text-muted">{d.demoNote}</p>
      </div>
    </form>
  );
}
