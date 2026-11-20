"use client";

import { useState } from "react";
import { ZoneMapSingle } from "@/components/site/ZoneMap";
import { ZONES_ALL } from "@/lib/ai-search";
import { ADVISORS } from "@/lib/data/leads";
import { normalizeCode, PROPERTY_CODE_PREFIX, TYPE_LABEL } from "@/lib/properties";
import type { PropertyType } from "@/lib/types";
import { Card, PField, PrivateBox, Segmented, Toggle, pInput } from "../ui";
import type { Draft } from "./types";

export function MainData({
  d,
  set,
  sliderUsed,
  codeConflict = false,
  onGenerateCode,
  onChangeType,
}: {
  d: Draft;
  set: (p: Partial<Draft>) => void;
  sliderUsed: number;
  codeConflict?: boolean;
  onGenerateCode?: () => void;
  onChangeType?: (t: PropertyType) => void;
}) {
  const [lang, setLang] = useState<"es" | "en">("es");
  const title = lang === "es" ? d.title : d.titleEn;
  const sel = `${pInput} appearance-none pr-10`;
  const Chevron = () => <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">expand_more</span>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      <div className="xl:col-span-8 flex flex-col gap-6">
        <Card
          icon="translate"
          title="Títulos y descripciones"
          subtitle="Lo que se ve en la ficha y en las tarjetas de la web"
          aside={<Segmented label="Idioma" value={lang} onChange={setLang} options={[{ v: "es", l: "Español · ES" }, { v: "en", l: "English · EN" }]} />}
        >
          <PField label={lang === "es" ? "Título en español" : "Título en inglés"} required counter={`${title.length} / 70`}>
            {(id) => (
              <input id={id} className={pInput} maxLength={70} value={title} onChange={(e) => set(lang === "es" ? { title: e.target.value } : { titleEn: e.target.value })} placeholder={lang === "es" ? "Ej. Casa moderna en Ricaurte" : "E.g. Modern house in Ricaurte"} />
            )}
          </PField>
          {lang === "es" ? (
            <>
              <PField label="Descripción breve (tarjetas y búsqueda)" required counter={`${d.summary.length} / 200`} hint="Se ve en las tarjetas de propiedad, en una o dos líneas.">
                {(id) => <textarea id={id} rows={2} maxLength={200} className={`${pInput} h-auto py-3 resize-none`} value={d.summary} onChange={(e) => set({ summary: e.target.value })} />}
              </PField>
              <PField label="Descripción detallada" required>
                {(id) => <textarea id={id} rows={7} className={`${pInput} h-auto py-3`} value={d.description} onChange={(e) => set({ description: e.target.value })} />}
              </PField>
            </>
          ) : (
            <p className="font-body-sm text-body-sm text-secondary bg-surface-container-low rounded-lg p-3">La descripción en inglés se completa igual que en español. Si falta, la web muestra la versión en español.</p>
          )}
        </Card>

        <Card icon="verified" title="Tipo de publicación" subtitle="Define si la propiedad lleva la etiqueta “Exclusiva RG”">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Tipo de publicación">
            {(
              [
                { v: true, icon: "hotel_class", t: "Exclusiva RG", s: "Solo RG la comercializa. En la web lleva la etiqueta negra con dorado." },
                { v: false, icon: "handshake", t: "Compartida", s: "Se comparte con otra inmobiliaria. No lleva etiqueta en la web." },
              ] as const
            ).map((o) => (
              <button
                key={o.t}
                type="button"
                role="radio"
                aria-checked={d.exclusive === o.v}
                onClick={() => set({ exclusive: o.v })}
                className={`text-left p-4 rounded-xl border-2 transition-all ${d.exclusive === o.v ? "border-primary bg-surface-container-low" : "border-[#ECEAE7] hover:border-outline"}`}
              >
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-title-md text-title-md">
                    <span className={`material-symbols-outlined ${o.v ? "text-rg-gold icon-fill" : ""}`}>{o.icon}</span>
                    {o.t}
                  </span>
                  {d.exclusive === o.v && <span className="material-symbols-outlined icon-fill text-primary">check_circle</span>}
                </span>
                <span className="block font-body-sm text-body-sm text-secondary mt-1">{o.s}</span>
              </button>
            ))}
          </div>
          <PrivateBox>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {d.exclusive ? (
                <PField label="Vence el" required>
                  {(id) => <input id={id} type="date" className={pInput} value={d.priv.expires ?? ""} onChange={(e) => set({ priv: { ...d.priv, expires: e.target.value } })} />}
                </PField>
              ) : (
                <PField label="Compartida con">
                  {(id) => <input id={id} className={pInput} placeholder="Nombre de la inmobiliaria" value={d.priv.sharedWith ?? ""} onChange={(e) => set({ priv: { ...d.priv, sharedWith: e.target.value } })} />}
                </PField>
              )}
              <PField label="Asesor a cargo">
                {(id) => (
                  <div className="relative">
                    <select id={id} className={sel} value={d.priv.advisor} onChange={(e) => set({ priv: { ...d.priv, advisor: e.target.value } })}>
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
              <PField label="Comisión">
                {(id) => <input id={id} className={pInput} placeholder="Ej. 4 %" value={d.priv.fee ?? ""} onChange={(e) => set({ priv: { ...d.priv, fee: e.target.value } })} />}
              </PField>
            </div>
            <PField label="Nota interna">
              {(id) => <textarea id={id} rows={3} className={`${pInput} h-auto py-3 resize-none`} value={d.priv.note ?? ""} onChange={(e) => set({ priv: { ...d.priv, note: e.target.value } })} />}
            </PField>
          </PrivateBox>
        </Card>

        <Card icon="share_location" title="Ubicación y privacidad" subtitle="En la web solo se muestra la zona, nunca la dirección">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["País", "Ecuador"],
              ["Provincia", "Azuay"],
              ["Ciudad", "Cuenca"],
            ].map(([l, v]) => (
              <PField key={l} label={l}>
                {(id) => (
                  <div className="relative">
                    <select id={id} className={sel} defaultValue={v}>
                      <option>{v}</option>
                    </select>
                    <Chevron />
                  </div>
                )}
              </PField>
            ))}
            <PField label="Parroquia" required>
              {(id) => (
                <div className="relative">
                  <select id={id} className={sel} value={d.zone} onChange={(e) => set({ zone: e.target.value })}>
                    {ZONES_ALL.map((z) => (
                      <option key={z}>{z}</option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              )}
            </PField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold mb-1.5">Así se ve en la web</p>
              <ZoneMapSingle zone={d.zone} className="h-44" />
              <p className="font-body-sm text-[12px] text-secondary mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">visibility</span> En la web: Cuenca · {d.zone}
              </p>
            </div>
            <PrivateBox title="Dirección exacta (privada)">
              <PField label="Dirección y referencias">
                {(id) => <textarea id={id} rows={3} className={`${pInput} h-auto py-3 resize-none`} value={d.priv.address ?? ""} onChange={(e) => set({ priv: { ...d.priv, address: e.target.value } })} placeholder="Solo la ve el equipo al coordinar visitas" />}
              </PField>
            </PrivateBox>
          </div>
        </Card>
      </div>

      <div className="xl:col-span-4 flex flex-col gap-6">
        <Card icon="payments" title="Datos base" subtitle="Operación, precio y tipo">
          <PField
            label="Código"
            required
            hint={
              codeConflict ? (
                <span role="alert" className="text-[#D9381E] font-semibold flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[15px]">cancel</span>
                  ✕ Este código ya fue utilizado y está bloqueado
                </span>
              ) : !d.code.trim() ? (
                <span role="alert" className="text-[#D9381E] font-semibold flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[15px]">error</span>
                  Escribe un código único o pulsa «Generar automático»
                </span>
              ) : (
                <span className="text-st-available font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  ✓ Código único disponible · Prefijo sugerido {PROPERTY_CODE_PREFIX[d.type]}-
                </span>
              )
            }
          >
            {(id) => (
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-secondary" aria-hidden>
                    tag
                  </span>
                  <input
                    id={id}
                    className={`${pInput} pl-9 font-mono font-bold uppercase tracking-wider ${
                      codeConflict || !d.code.trim()
                        ? "border-[#D9381E] ring-1 ring-[#D9381E] bg-[#D9381E]/5 text-[#D9381E]"
                        : ""
                    }`}
                    value={d.code}
                    onChange={(e) => set({ code: normalizeCode(e.target.value) })}
                    placeholder={`Ej. ${PROPERTY_CODE_PREFIX[d.type]}-001`}
                    aria-invalid={codeConflict || !d.code.trim() ? true : undefined}
                  />
                </div>
                {onGenerateCode && (
                  <button
                    type="button"
                    onClick={onGenerateCode}
                    className="h-12 px-3.5 rounded-lg bg-[#141414] text-[#F5F3EE] hover:bg-[#D9381E] font-label-sm text-label-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[17px]">autorenew</span>
                    Generar automático
                  </button>
                )}
              </div>
            )}
          </PField>
          <div className="flex flex-col gap-1.5">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Operación <span className="text-error">*</span>
            </span>
            <Segmented
              label="Operación"
              value={d.operation}
              onChange={(v) => set({ operation: v, status: d.status === "vendida" || d.status === "alquilada" ? (v === "venta" ? "vendida" : "alquilada") : d.status })}
              options={[
                { v: "venta", l: "Venta" },
                { v: "alquiler", l: "Alquiler" },
              ]}
            />
            <p className="font-body-sm text-[12px] text-secondary">Operación y estado son cosas distintas.</p>
          </div>
          <PField label={d.operation === "alquiler" ? "Precio mensual (USD)" : "Precio (USD)"} required>
            {(id) => (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">$</span>
                <input id={id} inputMode="numeric" className={`${pInput} pl-8`} value={d.price ? d.price.toLocaleString("es-EC").replace(/,/g, ".") : ""} onChange={(e) => set({ price: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
              </div>
            )}
          </PField>
          {d.operation === "venta" && (
            <label className="flex items-center gap-2 min-h-11 font-body-sm text-body-sm">
              <input type="checkbox" className="w-5 h-5 accent-primary" checked={!!d.priceFrom} onChange={(e) => set({ priceFrom: e.target.checked })} />
              Mostrar como “Desde” (edificios y proyectos)
            </label>
          )}
          <PField label="Tipo de propiedad" required hint="Al cambiar el tipo se sugiere el siguiente código correlativo disponible.">
            {(id) => (
              <div className="relative">
                <select
                  id={id}
                  className={sel}
                  value={d.type}
                  onChange={(e) => {
                    const nextType = e.target.value as PropertyType;
                    if (onChangeType) {
                      onChangeType(nextType);
                    } else {
                      set({ type: nextType });
                    }
                  }}
                >
                  {Object.entries(TYPE_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l} ({PROPERTY_CODE_PREFIX[v as PropertyType]}-)
                    </option>
                  ))}
                </select>
                <Chevron />
              </div>
            )}
          </PField>
        </Card>

        <Card icon="foundation" title="Etapa de la obra">
          <PField label="Etapa" required>
            {(id) => (
              <div className="relative">
                <select
                  id={id}
                  className={sel}
                  value={d.status === "en-construccion" || d.status === "sobre-planos" ? d.status : "terminada"}
                  onChange={(e) => set({ status: e.target.value === "terminada" ? "disponible" : (e.target.value as Draft["status"]) })}
                >
                  <option value="terminada">Terminada</option>
                  <option value="en-construccion">En construcción</option>
                  <option value="sobre-planos">Sobre planos</option>
                </select>
                <Chevron />
              </div>
            )}
          </PField>
          {(d.status === "en-construccion" || d.status === "sobre-planos") && (
            <div className="grid grid-cols-2 gap-3">
              <PField label="Avance (%)">
                {(id) => <input id={id} type="number" min={0} max={100} className={pInput} value={d.progress ?? 0} onChange={(e) => set({ progress: Math.min(100, Math.max(0, Number(e.target.value))) })} />}
              </PField>
              <PField label="Entrega estimada">
                {(id) => <input id={id} className={pInput} placeholder="junio de 2027" value={d.delivery ?? ""} onChange={(e) => set({ delivery: e.target.value })} />}
              </PField>
            </div>
          )}
          <PField label="Año de construcción">
            {(id) => <input id={id} type="number" className={pInput} value={d.yearBuilt ?? ""} onChange={(e) => set({ yearBuilt: Number(e.target.value) || undefined })} />}
          </PField>
        </Card>

        <Card icon="stars" title="Vitrina y vivienda">
          <Toggle checked={d.featured} onChange={(v) => set({ featured: v })} label="Destacada" description="Aparece en “Propiedades destacadas” del inicio." />
          <Toggle
            checked={d.slider}
            onChange={(v) => set({ slider: v })}
            disabled={!d.slider && sliderUsed >= 5}
            label="Slider de inicio"
            badge={<span className="px-2 py-0.5 rounded-full bg-st-reserved-bg text-st-reserved font-label-sm text-[11px]">{sliderUsed} de 5</span>}
            description={!d.slider && sliderUsed >= 5 ? "Los 5 espacios están ocupados. Libera uno en el inventario." : "Carrusel 3D del Hero (5 espacios)."}
          />
          <fieldset>
            <legend className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold mb-2">Vivienda</legend>
            <div className="flex flex-col gap-2">
              {(
                [
                  [null, "General", "Crédito hipotecario normal (banco o BIESS)."],
                  ["VIP", "Vivienda VIP", "Vivienda de interés público."],
                  ["VIS", "Vivienda VIS", "Vivienda de interés social."],
                ] as const
              ).map(([v, l, s]) => (
                <label key={l} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${d.housing === v ? "border-primary bg-surface-container-low" : "border-[#ECEAE7]"}`}>
                  <input type="radio" name="housing" className="mt-1 w-4 h-4 accent-primary" checked={d.housing === v} onChange={() => set({ housing: v })} />
                  <span>
                    <span className="block font-label-md text-label-md font-semibold">{l}</span>
                    <span className="block font-body-sm text-[12px] text-secondary">{s}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </Card>
      </div>
    </div>
  );
}
