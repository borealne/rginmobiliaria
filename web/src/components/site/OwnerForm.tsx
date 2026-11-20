"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Consent, SelectField, TextArea, TextField, validateEmail, validatePhone } from "@/components/ui/Field";
import { submitLead } from "@/lib/leads-local";
import type { Lang } from "@/lib/types";

const OPS = [
  { v: "vender", l: "Vender" },
  { v: "alquilar", l: "Alquilar" },
  { v: "ambos", l: "Ambos / Evaluar" },
];

/** Formulario de propietarios (S8): solo datos de contacto y lo básico del inmueble. Sin fotos. */
export function OwnerForm({ lang }: { lang: Lang }) {
  const sp = useSearchParams();
  const [f, setF] = useState({
    name: "",
    phone: "",
    email: "",
    op: "vender",
    type: sp.get("interes") === "construir" ? "construir" : "",
    zone: "",
    price: "",
    msg: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const set = (k: keyof typeof f, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 3) er.name = "Escribe tu nombre y apellido.";
    if (!validatePhone(f.phone)) er.phone = "Escribe un número de 9 a 10 dígitos.";
    if (f.email && !validateEmail(f.email)) er.email = "Revisa el correo. Ejemplo: nombre@correo.com";
    if (!f.type) er.type = "Elige el tipo de propiedad.";
    if (f.zone.trim().length < 3) er.zone = "Escribe la parroquia o el sector.";
    if (!f.consent) er.consent = "Necesitamos tu permiso para contactarte.";
    setErrors(er);
    if (Object.keys(er).length) {
      document.getElementById(`ow-${Object.keys(er)[0]}`)?.focus();
      return;
    }
    setState("sending");
    await submitLead({
      origin: "web-propietario",
      kind: "propietario",
      name: f.name.trim(),
      phone: `+593 ${f.phone}`,
      email: f.email || undefined,
      note: `Quiere ${OPS.find((o) => o.v === f.op)?.l.toLowerCase()} · ${f.type} en ${f.zone}${f.price ? ` · ${f.price}` : ""}${f.msg ? ` · ${f.msg}` : ""}`,
      stage: "nuevo",
    });
    setState("done");
  };

  if (state === "done")
    return (
      <div className="p-space-lg rounded-xl bg-st-available-bg text-on-surface flex items-start gap-space-sm" role="status">
        <span className="material-symbols-outlined icon-fill text-st-available">check_circle</span>
        <div>
          <p className="font-title-md text-title-md">Recibimos tu solicitud</p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Un asesor de RG te contactará en las próximas 24 horas hábiles para coordinar la visita.</p>
        </div>
      </div>
    );

  return (
    <form className="flex flex-col gap-space-md" onSubmit={submit} noValidate>
      <TextField label="Nombre y apellido" id="ow-name" placeholder="Ej. Carlos Vázquez" autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        <TextField label="Teléfono (WhatsApp)" id="ow-phone" prefix="+593" type="tel" inputMode="tel" placeholder="99 123 4567" value={f.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} />
        <TextField label="Correo electrónico" optional id="ow-email" type="email" placeholder="ejemplo@correo.com" value={f.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
      </div>
      <fieldset className="flex flex-col gap-space-xs">
        <legend className="font-label-md text-label-md text-primary font-medium mb-1.5">¿Qué quieres hacer?</legend>
        <div className="grid grid-cols-3 gap-space-sm">
          {OPS.map((o) => (
            <label key={o.v} className="cursor-pointer">
              <input className="peer sr-only" name="operacion" type="radio" value={o.v} checked={f.op === o.v} onChange={() => set("op", o.v)} />
              <span className="h-12 rounded-lg bg-surface-container-high peer-checked:bg-primary peer-checked:text-on-primary text-on-surface flex items-center justify-center font-label-md text-label-md transition-colors text-center px-2 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2">
                {o.l}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        <SelectField label="Tipo de propiedad" id="ow-type" value={f.type} onChange={(e) => set("type", e.target.value)} error={errors.type}>
          <option value="" disabled>
            Elige una opción
          </option>
          <option value="Casa">Casa</option>
          <option value="Departamento">Departamento</option>
          <option value="Terreno">Terreno o lote</option>
          <option value="Edificio">Edificio o proyecto</option>
          <option value="Local u oficina">Local u oficina</option>
          <option value="Quinta">Quinta o finca</option>
          <option value="construir">Quiero construir con RG</option>
        </SelectField>
        <TextField label="Parroquia o sector" id="ow-zone" placeholder="Ej. Challuabamba, Ricaurte…" value={f.zone} onChange={(e) => set("zone", e.target.value)} error={errors.zone} />
      </div>
      <TextField label="Precio que tienes en mente (USD)" optional id="ow-price" placeholder="Ej. $140.000 - $180.000" value={f.price} onChange={(e) => set("price", e.target.value)} />
      <TextArea label="Mensaje" optional id="ow-msg" rows={3} placeholder="Cuéntanos lo más importante (ej. 3 habitaciones, jardín amplio, vista)." value={f.msg} onChange={(e) => set("msg", e.target.value)} />
      <Consent lang={lang} id="ow-consent" checked={f.consent} onChange={(v) => set("consent", v)} error={errors.consent} />
      <button
        className="h-12 px-space-lg rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-space-sm hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70"
        type="submit"
        disabled={state === "sending"}
      >
        {state === "sending" ? (
          "Enviando…"
        ) : (
          <>
            <span>Quiero que me contacten</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </>
        )}
      </button>
      <p className="font-label-sm text-label-sm text-on-surface-variant text-center flex items-center justify-center gap-space-xs">
        <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden>
          lock
        </span>
        <span>No te pedimos la dirección exacta ni fotos. Eso lo vemos juntos en la visita.</span>
      </p>
    </form>
  );
}
