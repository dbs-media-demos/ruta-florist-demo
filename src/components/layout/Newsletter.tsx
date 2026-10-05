"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/i18n/dictionary";

/** Demo newsletter sign-up: validates, shows a success state, sends nothing. */
export function Newsletter({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");

  if (state === "done") {
    return (
      <p className="mt-8 flex max-w-md items-center gap-3 rounded-2xl border border-line p-4" role="status">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-poppy text-white">✓</span>
        {d.footer.subscribed}
      </p>
    );
  }

  return (
    <form
      className="mt-8 max-w-md"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setState(/.+@.+\..+/.test(email) ? "done" : "error");
      }}
    >
      <label htmlFor="nl-email" className="sr-only">
        {d.footer.email}
      </label>
      <div className="flex gap-2">
        <input
          id="nl-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={d.footer.email}
          aria-invalid={state === "error"}
          aria-describedby={state === "error" ? "nl-err" : undefined}
          className="field !rounded-full"
        />
        <button className="btn btn-accent shrink-0">{d.footer.subscribe}</button>
      </div>
      {state === "error" && (
        <p id="nl-err" className="field-error">
          {d.forms.invalidEmail}
        </p>
      )}
    </form>
  );
}
