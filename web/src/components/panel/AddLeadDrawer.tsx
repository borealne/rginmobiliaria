"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CloseButton, Modal } from "@/components/ui/Modal";
import { FieldError } from "@/components/ui/Field";
import { ADVISORS, MANUAL_SOURCES, STAGES, type Lead, type LeadKind } from "@/lib/data/leads";
import { usePanel } from "./PanelProvider";
import { PField, pInput } from "./ui";

const digits = (s: string) => s.replace(/\D/g, "").slice(-9);

/** A5 · Agregar lead: origen obligatorio, marca "Cargada a mano" y avisa si el teléfono ya existe. */
export function AddLeadDrawer({ onClose, kinds }: { onClose: () => void; kinds: { id: string; label: string }[] }) {
  const { addLead, leads, properties, role, user, toast } = usePanel();
  const [f, setF] = useState({
    name: "",
    phone: "",
    email: "",
    kind: "comprador" as LeadKind,
    source: "",
    campaign: "",
    propertyCode: "",
    interest: "",
    budget: "",
    advisor: role === "super" ? "raul" : user.id,
    stage: "nuevo",
    note: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ignoreDup, setIgnoreDup] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  const dup = useMemo<Lead | undefined>(() => {
    const d = digits(f.phone);
    return d.length >= 8 ? leads.find((l) => digits(l.phone) === d) : undefined;
  }, [f.phone, leads]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 3) er.name = "Escribe el nombre.";
    if (digits(f.phone).length < 9) er.phone = "Escribe un teléfono válido.";
    if (!f.source) er.source = "El origen es obligatorio.";
    setErrors(er);
    if (Object.keys(er).length) return;
    if (dup && !ignoreDup) return;
    addLead({
      name: f.name.trim(),
      phone: f.phone.trim(),
      email: f.email || undefined,
      kind: f.kind,
      origin: "manual",
      campaign: f.campaign ? `${f.source} · ${f.campaign}` : f.source,
      propertyCode: f.propertyCode || undefined,
      interest: f.interest || undefined,
      budget: f.budget || undefined,
      note: f.note || undefined,
      advisor: f.advisor,
      stage: f.stage,
      noReply: true,
    });
    toast(`${f.name.trim()} se agregó al pipeline como “Cargada a mano”`);
    onClose();
  };

  const sel = `${pInput} appearance-none pr-10`;
  const Chevron = () => <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">expand_more</span>;

  return (
    <Modal open onClose={onClose} labelledBy="al-title" align="right" className="max-w-[520px]">
      <form onSubmit={submit} noValidate className="flex flex-col h-full">
        <div className="px-6 pt-6 pb-4 border-b border-surface-container flex items-start justify-between gap-3">
          <div>
            <h2 id="al-title" className="font-headline-sm text-headline-sm text-primary">
              Agregar lead
            </h2>
            <p className="font-body-sm text-body-sm text-secondary mt-1">Para contactos que no entran solos: TikTok, Instagram, llamadas, referidos o ferias.</p>
          </div>
          <CloseButton onClick={onClose} label="Cerrar panel" />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <p className="p-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            <span>
              Se registra con la etiqueta <strong>“Cargada a mano”</strong>, que no se puede cambiar.
            </span>
          </p>

          <PField label="Nombre" required hint={<FieldError id="al-name-err">{errors.name}</FieldError>}>
            {(id) => <input id={id} className={pInput} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Ej. Carlos Morales" aria-invalid={errors.name ? true : undefined} />}
          </PField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PField label="Teléfono (WhatsApp)" required hint={<FieldError id="al-phone-err">{errors.phone}</FieldError>}>
              {(id) => <input id={id} type="tel" className={pInput} value={f.phone} onChange={(e) => (set("phone", e.target.value), setIgnoreDup(false))} placeholder="+593 99 999 9999" aria-invalid={errors.phone ? true : undefined} />}
            </PField>
            <PField label="Correo">{(id) => <input id={id} type="email" className={pInput} value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="opcional" />}</PField>
          </div>

          {dup && !ignoreDup && (
            <aside role="alert" aria-label="Alerta de duplicado" className="p-4 rounded-lg bg-st-reserved-bg text-on-surface flex flex-col gap-3 border border-st-reserved/30">
              <p className="flex items-start gap-2 font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-st-reserved">warning</span>
                <span>
                  <strong className="block font-title-md text-[14px]">Posible contacto duplicado</strong>
                  El teléfono <strong>{dup.phone}</strong> ya está registrado para <strong>{dup.name}</strong>, en la etapa “{STAGES.find((s) => s.id === dup.stage)?.label}”.
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={onClose} className="min-h-10 px-3 rounded-lg bg-surface-container-lowest font-label-md text-label-md border border-[#ECEAE7]">
                  Ver el contacto existente
                </button>
                <button type="button" onClick={() => setIgnoreDup(true)} className="min-h-10 px-3 rounded-lg font-label-md text-label-md underline">
                  Continuar como nuevo
                </button>
              </div>
            </aside>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PField label="Tipo de tarjeta" required>
              {(id) => (
                <div className="relative">
                  <select id={id} className={sel} value={f.kind} onChange={(e) => set("kind", e.target.value)}>
                    {kinds.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              )}
            </PField>
            <PField label="Origen" required hint={<FieldError id="al-source-err">{errors.source}</FieldError>}>
              {(id) => (
                <div className="relative">
                  <select id={id} className={sel} value={f.source} onChange={(e) => set("source", e.target.value)} aria-invalid={errors.source ? true : undefined}>
                    <option value="">Elige el origen</option>
                    {MANUAL_SOURCES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              )}
            </PField>
          </div>
          <PField label="Campaña o detalle del origen">{(id) => <input id={id} className={pInput} value={f.campaign} onChange={(e) => set("campaign", e.target.value)} placeholder="Ej. Video de Casas Ricaurte" />}</PField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PField label="Propiedad de interés">
              {(id) => (
                <div className="relative">
                  <select id={id} className={sel} value={f.propertyCode} onChange={(e) => set("propertyCode", e.target.value)}>
                    <option value="">Sin propiedad específica</option>
                    {properties.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.code} · {p.title}
                      </option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              )}
            </PField>
            <PField label="Presupuesto">{(id) => <input id={id} className={pInput} value={f.budget} onChange={(e) => set("budget", e.target.value)} placeholder="Ej. $120.000" />}</PField>
          </div>
          {!f.propertyCode && <PField label="Qué busca">{(id) => <input id={id} className={pInput} value={f.interest} onChange={(e) => set("interest", e.target.value)} placeholder="Ej. Casa de 3 habitaciones en Ricaurte" />}</PField>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PField label="Asesor">
              {(id) => (
                <div className="relative">
                  <select id={id} className={sel} value={f.advisor} onChange={(e) => set("advisor", e.target.value)} disabled={role !== "super"}>
                    {ADVISORS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              )}
            </PField>
            <PField label="Etapa">
              {(id) => (
                <div className="relative">
                  <select id={id} className={sel} value={f.stage} onChange={(e) => set("stage", e.target.value)}>
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              )}
            </PField>
          </div>
          <PField label="Nota">{(id) => <textarea id={id} rows={3} className={`${pInput} h-auto py-3 resize-none`} value={f.note} onChange={(e) => set("note", e.target.value)} />}</PField>
        </div>
        <div className="px-6 py-4 border-t border-surface-container flex justify-end gap-2 bg-surface-container-lowest">
          <button type="button" onClick={onClose} className="h-12 px-5 rounded-lg bg-surface-container font-label-md text-label-md">
            Cancelar
          </button>
          <button type="submit" disabled={!!dup && !ignoreDup} className="h-12 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md disabled:opacity-50">
            Agregar al pipeline
          </button>
        </div>
      </form>
    </Modal>
  );
}
