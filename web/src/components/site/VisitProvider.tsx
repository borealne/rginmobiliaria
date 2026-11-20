"use client";

import Image from "next/image";
import { createContext, useCallback, useContext, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { CloseButton, Modal } from "@/components/ui/Modal";
import { Consent, TextArea, TextField, validateEmail, validatePhone } from "@/components/ui/Field";
import { submitLead } from "@/lib/leads-local";
import { priceText, zoneLabel } from "@/lib/properties";
import type { Lang, Property } from "@/lib/types";

type Ctx = { openVisit: (p?: Property) => void };
const VisitCtx = createContext<Ctx>({ openVisit: () => {} });
export const useVisit = () => useContext(VisitCtx);

export function VisitProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; property?: Property }>({ open: false });
  const openVisit = useCallback((property?: Property) => setState({ open: true, property }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  const value = useMemo(() => ({ openVisit }), [openVisit]);
  return (
    <VisitCtx.Provider value={value}>
      {children}
      {state.open && <VisitModal lang={lang} property={state.property} onClose={close} />}
    </VisitCtx.Provider>
  );
}

const DAY = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTH = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/** Próximos 4 días de recorrido (lunes a sábado). */
function nextDays() {
  const out: { value: string; title: string; sub: string }[] = [];
  const d = new Date();
  for (let i = 0; out.length < 4 && i < 10; i++) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    if (x.getDay() === 0) continue;
    if (i === 0 && d.getHours() >= 16) continue;
    const title = i === 0 ? "Hoy" : i === 1 ? "Mañana" : DAY[x.getDay()];
    const sub = i === 0 ? "14:00+" : `${x.getDate()} ${MONTH[x.getMonth()]}`;
    out.push({ value: x.toISOString().slice(0, 10), title, sub });
  }
  return out;
}

const SLOTS = [
  { value: "manana", title: "Mañana", sub: "9:00 - 13:00", icon: "wb_sunny" },
  { value: "tarde", title: "Tarde", sub: "14:00 - 18:00", icon: "partly_cloudy_day" },
  { value: "cualquiera", title: "Cualquiera", sub: "Según agenda", icon: "schedule" },
];

function VisitModal({ lang, property, onClose }: { lang: Lang; property?: Property; onClose: () => void }) {
  const days = useMemo(nextDays, []);
  const [form, setForm] = useState({ name: "", phone: "", email: "", day: days[1]?.value ?? days[0].value, slot: "manana", notes: "", consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"form" | "sending" | "done">("form");
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (form.name.trim().length < 3) er.name = "Escribe tu nombre completo.";
    if (!validatePhone(form.phone)) er.phone = "Escribe un número de 9 a 10 dígitos.";
    if (form.email && !validateEmail(form.email)) er.email = "Revisa el correo. Ejemplo: nombre@correo.com";
    if (!form.consent) er.consent = "Necesitamos tu permiso para contactarte.";
    setErrors(er);
    if (Object.keys(er).length) {
      document.getElementById(`visit-${Object.keys(er)[0]}`)?.focus();
      return;
    }
    setStatus("sending");
    const day = days.find((d) => d.value === form.day);
    const slot = SLOTS.find((s) => s.value === form.slot);
    await submitLead({
      origin: "web-visita",
      kind: property?.operation === "alquiler" ? "arrendatario" : "comprador",
      name: form.name.trim(),
      phone: `+593 ${form.phone.trim()}`,
      email: form.email || undefined,
      propertyCode: property?.code,
      propertyTitle: property?.title,
      note: `Visita: ${day?.title} ${day?.sub} · ${slot?.title}${form.notes ? ` · ${form.notes}` : ""}`,
      stage: "visita",
    });
    setStatus("done");
  };

  const slot = SLOTS.find((s) => s.value === form.slot)!;
  const backLabel = property ? "Volver a la propiedad" : "Volver";

  return (
    <Modal open onClose={onClose} labelledBy="visit-title">
      <div className="overflow-y-auto">
        <div className="px-gutter-mobile sm:px-space-xl pt-space-lg pb-space-sm flex items-start justify-between gap-space-md">
          <div>
            <h2 id="visit-title" className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-primary tracking-tight">
              {status === "done" ? "¡Solicitud recibida!" : "Agendar una visita"}
            </h2>
            {status !== "done" && <p className="font-body-md text-body-md text-secondary mt-1">Un asesor te confirmará el día y la hora de tu recorrido.</p>}
          </div>
          <CloseButton onClick={onClose} className="-mr-2" />
        </div>

        {property && status !== "done" && (
          <div className="px-gutter-mobile sm:px-space-xl py-space-sm">
            <div className="p-3 bg-surface-container-low rounded-xl flex items-center gap-space-md">
              <div className="w-28 h-20 rounded-lg overflow-hidden flex-shrink-0 relative bg-surface-container-high">
                <Image className="object-cover" src={property.photos[0].src} alt={property.photos[0].room} fill sizes="112px" />
                {property.exclusive && (
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-primary/90 text-[10px] font-label-sm text-rg-gold font-semibold tracking-wide uppercase">
                    Exclusiva RG
                  </div>
                )}
              </div>
              <div className="flex-grow min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-between gap-space-xs flex-wrap">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Cód. {property.code}</span>
                  <span className="font-price-display text-[18px] sm:text-price-display text-primary font-bold tracking-tight">{priceText(property)}</span>
                </div>
                <h3 className="font-title-md text-title-md text-primary truncate">{property.title}</h3>
                <div className="flex items-center gap-1 text-secondary font-body-sm text-body-sm mt-0.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
                  <span className="truncate">{zoneLabel(property)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {status !== "done" ? (
          <form className="px-gutter-mobile sm:px-space-xl py-space-md space-y-space-md" onSubmit={submit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <TextField
                className="md:col-span-2"
                label="Nombre completo"
                id="visit-name"
                placeholder="Ej. Carlos Morales"
                autoComplete="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                error={errors.name}
              />
              <TextField
                label="Teléfono (WhatsApp)"
                id="visit-phone"
                prefix="+593"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="99 999 9999"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                error={errors.phone}
              />
              <TextField
                label="Correo electrónico"
                optional
                id="visit-email"
                type="email"
                autoComplete="email"
                placeholder="carlos@correo.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                error={errors.email}
              />
            </div>

            <fieldset className="space-y-2 pt-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <legend className="font-label-md text-label-md text-primary font-medium">Día preferido</legend>
                <span className="text-secondary font-label-sm text-label-sm">Recorridos de lunes a sábado</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {days.map((d) => (
                  <label key={d.value} className="cursor-pointer">
                    <input className="peer sr-only" name="visit_date" type="radio" value={d.value} checked={form.day === d.value} onChange={() => set("day", d.value)} />
                    <div className="h-12 rounded-lg bg-surface-container-low text-primary flex flex-col items-center justify-center text-center peer-checked:bg-primary peer-checked:text-on-primary transition-all hover:bg-surface-container peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2">
                      <span className="font-label-md text-label-md font-semibold leading-tight">{d.title}</span>
                      <span className="font-label-sm text-[11px] opacity-80 leading-none">{d.sub}</span>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="font-label-md text-label-md text-primary font-medium mb-2">Franja horaria preferida</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {SLOTS.map((s) => (
                  <label key={s.value} className="cursor-pointer">
                    <input className="peer sr-only" name="visit_time" type="radio" value={s.value} checked={form.slot === s.value} onChange={() => set("slot", s.value)} />
                    <div className="h-12 px-3 rounded-lg bg-surface-container-low text-primary flex items-center gap-2 peer-checked:bg-primary peer-checked:text-on-primary transition-all hover:bg-surface-container peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2">
                      <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                      <div className="flex flex-col text-left">
                        <span className="font-label-md text-label-md font-medium leading-tight">{s.title}</span>
                        <span className="text-[11px] opacity-75 leading-none">{s.sub}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            <TextArea
              label="Comentarios o preguntas adicionales"
              optional
              id="visit-notes"
              rows={2}
              placeholder="Ej. Asistiré acompañado por mi arquitecto; quiero revisar los planos."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />

            <Consent lang={lang} id="visit-consent" checked={form.consent} onChange={(v) => set("consent", v)} error={errors.consent} />

            <div className="pt-space-sm flex flex-col gap-2">
              <button
                className="w-full h-12 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-[0.99] shadow-sm disabled:opacity-70"
                type="submit"
                disabled={status === "sending"}
              >
                {status === "sending" ? (
                  <span>Enviando…</span>
                ) : (
                  <>
                    <span>Confirmar solicitud de visita</span>
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                  </>
                )}
              </button>
              <button className="w-full min-h-11 text-center text-secondary hover:text-primary font-label-md text-label-md transition-colors" type="button" onClick={onClose}>
                {backLabel}
              </button>
            </div>
          </form>
        ) : (
          <div className="px-gutter-mobile sm:px-space-xl py-space-lg flex flex-col items-center text-center space-y-space-lg" role="status">
            <div className="w-20 h-20 rounded-full bg-st-available-bg text-st-available flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined icon-fill text-[44px]">check_circle</span>
            </div>
            <p className="font-body-md text-body-md text-secondary leading-relaxed max-w-md">Recibimos tu solicitud. Un asesor te confirmará el día y la hora.</p>
            <div className="w-full p-space-md rounded-xl bg-surface-container-low text-left space-y-space-sm">
              <div className="text-label-sm font-label-sm text-secondary uppercase tracking-widest font-semibold pb-1 border-b border-surface-container">
                Resumen de la cita solicitada
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm pt-1">
                <div>
                  <span className="text-secondary font-body-sm text-body-sm block">Propiedad</span>
                  <span className="text-primary font-title-md text-title-md block">{property?.title ?? "Por definir con el asesor"}</span>
                  {property && (
                    <span className="text-secondary font-label-sm text-label-sm">
                      Cód. {property.code} • {property.zone}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-secondary font-body-sm text-body-sm block">Asesor asignado</span>
                  <span className="text-primary font-title-md text-title-md block">Equipo RG Cuenca</span>
                </div>
                <div>
                  <span className="text-secondary font-body-sm text-body-sm block">Preferencia</span>
                  <span className="text-primary font-label-md text-label-md font-semibold block">
                    {days.find((d) => d.value === form.day)?.title} · {slot.title} ({slot.sub})
                  </span>
                </div>
                <div>
                  <span className="text-secondary font-body-sm text-body-sm block">Canal de confirmación</span>
                  <span className="text-primary font-label-md text-label-md font-semibold block">WhatsApp y llamada</span>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col gap-2.5 pt-2">
              <button
                className="w-full h-12 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-primary-container transition-all"
                type="button"
                onClick={onClose}
              >
                {property ? "Entendido, volver a la propiedad" : "Entendido"}
              </button>
              <a
                className="w-full h-12 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md font-semibold ring-1 ring-outline-variant hover:ring-primary flex items-center justify-center gap-2 transition-all"
                href={`https://wa.me/59372840000?text=${encodeURIComponent(property ? `Hola, pedí una visita para la propiedad ${property.code}.` : "Hola, pedí una visita.")}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="material-symbols-outlined icon-fill text-[20px] text-st-available">chat</span>
                <span>Escribir por WhatsApp a un asesor</span>
              </a>
            </div>
          </div>
        )}

        <div className="px-gutter-mobile sm:px-space-xl py-3 bg-surface-container-low flex items-center gap-1.5 text-secondary font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
          <span>Usamos tus datos solo para coordinar la visita.</span>
        </div>
      </div>
    </Modal>
  );
}
