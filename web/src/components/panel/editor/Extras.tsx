"use client";

import { Card, PField, Toggle, pInput } from "../ui";
import type { Draft } from "./types";

export function SimulatorTab({ d, set }: { d: Draft; set: (p: Partial<Draft>) => void }) {
  return (
    <Card icon="calculate" title="Simulador de crédito" subtitle="Se muestra en la ficha de propiedades en venta">
      <Toggle
        checked={d.showSimulator}
        onChange={(v) => set({ showSimulator: v })}
        disabled={d.operation === "alquiler"}
        label="Mostrar el simulador en la ficha"
        description={d.operation === "alquiler" ? "No aplica a propiedades en alquiler." : "Calcula una cuota referencial con el precio de esta propiedad."}
      />
      <div className="p-4 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface-variant flex flex-col gap-2">
        <p>
          Programa usado: <strong className="text-on-surface">{d.housing ? `Vivienda ${d.housing}` : "General"}</strong> (se cambia en “Datos principales → Vivienda”).
        </p>
        <p>Las tasas referenciales de cada programa se configuran en Configuración → Programas de crédito.</p>
        <p className="text-secondary">La ficha siempre muestra “Resultado referencial” y el aviso legal completo.</p>
      </div>
    </Card>
  );
}

export function FaqTab({ d, set }: { d: Draft; set: (p: Partial<Draft>) => void }) {
  const upd = (k: number, patch: Partial<{ q: string; a: string }>) => set({ faqs: d.faqs.map((f, i) => (i === k ? { ...f, ...patch } : f)) });
  return (
    <Card icon="help_outline" title="Preguntas frecuentes de esta propiedad" subtitle="En la ficha se ven 3 abiertas y el resto con “Ver más”">
      {d.faqs.length === 0 && <p className="font-body-md text-body-md text-secondary">Aún no hay preguntas. Agrega la primera.</p>}
      <ol className="flex flex-col gap-4">
        {d.faqs.map((f, k) => (
          <li key={k} className="p-4 rounded-lg border border-[#ECEAE7] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Pregunta {k + 1}</span>
              <div className="flex gap-1">
                <button type="button" aria-label={`Subir pregunta ${k + 1}`} disabled={k === 0} onClick={() => set({ faqs: swap(d.faqs, k, k - 1) })} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surface-container disabled:opacity-30">
                  <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                </button>
                <button type="button" aria-label={`Bajar pregunta ${k + 1}`} disabled={k === d.faqs.length - 1} onClick={() => set({ faqs: swap(d.faqs, k, k + 1) })} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surface-container disabled:opacity-30">
                  <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                </button>
                <button type="button" aria-label={`Eliminar pregunta ${k + 1}`} onClick={() => set({ faqs: d.faqs.filter((_, i) => i !== k) })} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surface-container hover:text-error">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
            <PField label="Pregunta">{(id) => <input id={id} className={pInput} value={f.q} onChange={(e) => upd(k, { q: e.target.value })} />}</PField>
            <PField label="Respuesta">{(id) => <textarea id={id} rows={3} className={`${pInput} h-auto py-3 resize-none`} value={f.a} onChange={(e) => upd(k, { a: e.target.value })} />}</PField>
          </li>
        ))}
      </ol>
      <button type="button" onClick={() => set({ faqs: [...d.faqs, { q: "", a: "" }] })} className="self-start h-11 px-4 rounded-lg bg-surface-container font-label-md text-label-md flex items-center gap-1.5 hover:bg-surface-variant">
        <span className="material-symbols-outlined text-[18px]">add</span>+ Agregar pregunta
      </button>
    </Card>
  );
}

function swap<T>(arr: T[], a: number, b: number) {
  const x = [...arr];
  [x[a], x[b]] = [x[b], x[a]];
  return x;
}
