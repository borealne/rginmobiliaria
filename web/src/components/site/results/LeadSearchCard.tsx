"use client";

import { useState, type FormEvent } from "react";
import { Consent, FieldError, validatePhone } from "@/components/ui/Field";
import { submitLead } from "@/lib/leads-local";
import type { Lang, Operation } from "@/lib/types";

const inputCls =
  "h-12 w-full px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest shadow-[inset_0_0_0_1px_rgba(28,27,27,0.12)] focus:shadow-[inset_0_0_0_1.5px_#111111] transition-all aria-[invalid=true]:shadow-[inset_0_0_0_2px_#b3261e]";

/** "¿Prefieres que te ayudemos?" (S4): nombre, teléfono, consentimiento. */
export function LeadSearchCard({ lang, summary, operation, title = "¿Prefieres que te ayudemos?" }: { lang: Lang; summary: string; operation?: Operation; title?: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (name.trim().length < 3) er.name = "Escribe tu nombre.";
    if (!validatePhone(phone)) er.phone = "Escribe un número de 9 a 10 dígitos.";
    if (!consent) er.consent = "Necesitamos tu permiso para contactarte.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setState("sending");
    await submitLead({
      origin: "web-busqueda",
      kind: operation === "alquiler" ? "arrendatario" : "comprador",
      name: name.trim(),
      phone,
      note: `Dejó su búsqueda: ${summary}`,
      stage: "nuevo",
    });
    setState("done");
  };

  return (
    <div id="dejar-busqueda" className="scroll-mt-24 max-w-[900px] mx-auto bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm">
      <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-space-lg">
        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center mb-space-sm text-primary">
          <span className="material-symbols-outlined text-[22px]" aria-hidden>
            support_agent
          </span>
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface tracking-tight">{state === "done" ? "Recibimos tu búsqueda" : title}</h3>
        <div className="w-10 h-[3px] bg-rg-red mt-2 mb-3" aria-hidden />
        <p className="font-body-md text-body-md text-secondary" role={state === "done" ? "status" : undefined}>
          {state === "done"
            ? "Un asesor te escribirá en nuestro horario de atención (lunes a viernes de 9:00 a 18:00)."
            : "Deja tu búsqueda y un asesor te contactará cuando tengamos algo que encaje."}
        </p>
      </div>
      {state !== "done" && (
        <form className="flex flex-col gap-space-md" onSubmit={submit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md">
            <div className="md:col-span-5 flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-secondary" htmlFor="ls-name">
                Nombre
              </label>
              <input
                className={inputCls}
                id="ls-name"
                placeholder="Tu nombre completo"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "ls-name-err" : undefined}
              />
              <FieldError id="ls-name-err">{errors.name}</FieldError>
            </div>
            <div className="md:col-span-4 flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-secondary" htmlFor="ls-phone">
                Teléfono (WhatsApp)
              </label>
              <input
                className={inputCls}
                id="ls-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+593 9..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={errors.phone ? "ls-phone-err" : undefined}
              />
              <FieldError id="ls-phone-err">{errors.phone}</FieldError>
            </div>
            <div className="md:col-span-3 flex flex-col justify-start md:pt-5">
              <button
                className="h-12 w-full rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center transition-colors shadow-sm disabled:opacity-70"
                type="submit"
                disabled={state === "sending"}
              >
                {state === "sending" ? "Enviando…" : "Dejar mi búsqueda"}
              </button>
            </div>
          </div>
          <Consent lang={lang} id="ls-consent" checked={consent} onChange={setConsent} error={errors.consent} />
        </form>
      )}
    </div>
  );
}
