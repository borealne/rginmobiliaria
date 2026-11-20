"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { ZONES_ALL } from "@/lib/ai-search";
import { applyFilters, money, publicProperties, TYPE_LABEL, type Filters } from "@/lib/properties";
import type { PropertyType } from "@/lib/types";
import { FEATURE_OPTIONS } from "./params";

const PRICE_MAX: Record<string, number> = { venta: 300000, alquiler: 1500 };

function Group({ title, children, defaultOpen = true, aside }: { title: string; children: ReactNode; defaultOpen?: boolean; aside?: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="py-space-sm">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex-1 min-h-11 flex items-center justify-between text-left font-title-md text-[14px] text-on-surface font-semibold"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
        >
          <span>{title}</span>
          <span className={`material-symbols-outlined text-[20px] text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`}>expand_more</span>
        </button>
        {aside}
      </div>
      <div id={id} hidden={!open} className="pt-1">
        {children}
      </div>
    </div>
  );
}

const smallSelect =
  "w-full h-11 px-3 pr-8 rounded bg-surface font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none focus:ring-1 focus:ring-primary";

function Select({ label, value, onChange, children, disabled }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode; disabled?: boolean }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block mb-1">
        {label}
      </label>
      <div className="relative">
        <select id={id} className={`${smallSelect} disabled:opacity-60`} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
          {children}
        </select>
        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">expand_more</span>
      </div>
    </div>
  );
}

function Pills<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { v: T; l: string }[];
  value?: T;
  onChange: (v?: T) => void;
  label: string;
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const on = value === o.v;
        return (
          <button
            key={String(o.v)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(on ? undefined : o.v)}
            className={`h-11 rounded font-label-sm text-label-sm transition-colors ${on ? "bg-primary text-on-primary font-semibold" : "text-on-surface-variant bg-surface hover:bg-surface-container"}`}
          >
            {o.l}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Panel de filtros (PRD sección 5): Ubicación en cascada, Tipo, Precio,
 * Habitaciones, Baños, Características, Etapa de la obra, Vivienda,
 * "Solo Exclusivas RG", "Limpiar" y "Ver N propiedades".
 */
export function FilterPanel({ value, onApply, onClose }: { value: Filters; onApply: (f: Filters) => void; onClose?: () => void }) {
  const [f, setF] = useState<Filters>(value);
  const [country, setCountry] = useState("Ecuador");
  const set = (patch: Partial<Filters>) => setF((x) => ({ ...x, ...patch }));
  const op = f.operation ?? "venta";
  const max = PRICE_MAX[op];

  const base = useMemo(() => publicProperties(), []);
  const count = useMemo(() => (country === "Ecuador" ? applyFilters(base, f).length : 0), [base, f, country]);
  const typeCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of applyFilters(base, { operation: f.operation })) m.set(p.type, (m.get(p.type) ?? 0) + 1);
    return m;
  }, [base, f.operation]);

  const toggleIn = <T,>(arr: T[] | undefined, v: T) => (arr?.includes(v) ? arr.filter((x) => x !== v) : [...(arr ?? []), v]);
  const lo = f.minPrice ?? 0;
  const hi = f.maxPrice ?? max;

  return (
    <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
      <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
        <div className="flex flex-col">
          <h2 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">Filtros</h2>
          <span className="w-8 h-[3px] bg-rg-red mt-1 rounded-full" aria-hidden />
        </div>
        <div className="flex items-center gap-1">
          <button
            className="min-h-11 px-2 font-label-sm text-label-sm text-secondary hover:text-primary transition-colors underline decoration-secondary/40 underline-offset-4"
            type="button"
            onClick={() => {
              setF({ operation: f.operation, sort: f.sort });
              setCountry("Ecuador");
            }}
          >
            Limpiar
          </button>
          {onClose && (
            <button type="button" aria-label="Cerrar filtros" onClick={onClose} className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-surface-container-low">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col divide-y divide-surface-container">
        <Group title="Ubicación">
          <div className="flex flex-col gap-2">
            <Select label="País" value={country} onChange={setCountry}>
              <option>Ecuador</option>
              <option>Estados Unidos</option>
            </Select>
            <Select label={country === "Ecuador" ? "Provincia" : "Estado"} value={country === "Ecuador" ? "Azuay" : "Florida"} onChange={() => {}}>
              {country === "Ecuador" ? (
                <>
                  <option>Azuay</option>
                </>
              ) : (
                <option>Florida</option>
              )}
            </Select>
            <Select label="Ciudad" value={country === "Ecuador" ? "Cuenca" : "Miami"} onChange={() => {}}>
              <option>{country === "Ecuador" ? "Cuenca" : "Miami"}</option>
            </Select>
            {/* Parroquia solo en Ecuador */}
            {country === "Ecuador" && (
              <Select label="Parroquia o zona" value={f.zone ?? ""} onChange={(v) => set({ zone: v || undefined })}>
                <option value="">Todas las parroquias</option>
                {ZONES_ALL.map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </Select>
            )}
            {country !== "Ecuador" && (
              <p className="font-body-sm text-body-sm text-secondary bg-surface-container-low rounded p-2">Pronto publicaremos propiedades en Miami. Escríbenos y te avisamos.</p>
            )}
          </div>
        </Group>

        <Group title="Tipo de propiedad">
          <div className="flex flex-col">
            {(Object.keys(TYPE_LABEL) as PropertyType[]).map((t) => (
              <label key={t} className="flex items-center justify-between min-h-11 px-1.5 rounded hover:bg-surface transition-colors cursor-pointer">
                <span className="flex items-center gap-2">
                  <input
                    className="w-4 h-4 rounded accent-primary"
                    type="checkbox"
                    checked={!!f.types?.includes(t)}
                    onChange={() => set({ types: toggleIn(f.types, t) })}
                  />
                  <span className="font-body-sm text-body-sm text-on-surface">{TYPE_LABEL[t]}</span>
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">{typeCounts.get(t) ?? 0}</span>
              </label>
            ))}
          </div>
        </Group>

        <Group title={op === "alquiler" ? "Precio mensual (USD)" : "Precio (USD)"} aside={<span className="font-label-sm text-[11px] text-on-surface-variant whitespace-nowrap">Hasta {money(hi)}</span>}>
          <div className="relative h-8 mx-1">
            <div className="absolute top-1/2 -translate-y-1/2 h-1.5 w-full bg-surface-container rounded-full" />
            <div className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-primary rounded-full" style={{ left: `${(lo / max) * 100}%`, right: `${100 - (hi / max) * 100}%` }} />
            <input
              type="range"
              aria-label="Precio mínimo"
              min={0}
              max={max}
              step={op === "alquiler" ? 50 : 5000}
              value={lo}
              onChange={(e) => set({ minPrice: Math.min(Number(e.target.value), hi) || undefined })}
              className="range-thumb absolute inset-0 w-full appearance-none bg-transparent pointer-events-none"
            />
            <input
              type="range"
              aria-label="Precio máximo"
              min={0}
              max={max}
              step={op === "alquiler" ? 50 : 5000}
              value={hi}
              onChange={(e) => {
                const v = Math.max(Number(e.target.value), lo);
                set({ maxPrice: v >= max ? undefined : v });
              }}
              className="range-thumb absolute inset-0 w-full appearance-none bg-transparent pointer-events-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { k: "minPrice" as const, label: "Mínimo", v: f.minPrice },
              { k: "maxPrice" as const, label: "Máximo", v: f.maxPrice },
            ].map((x) => (
              <label key={x.k} className="block">
                <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">{x.label}</span>
                <span className="h-11 px-2 rounded bg-surface font-body-sm text-body-sm text-on-surface flex items-center focus-within:ring-1 focus-within:ring-primary">
                  <span className="text-on-surface-variant mr-1">$</span>
                  <input
                    inputMode="numeric"
                    className="w-full bg-transparent outline-none"
                    placeholder={x.k === "minPrice" ? "0" : String(max).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                    value={x.v != null ? String(x.v).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""}
                    onChange={(e) => {
                      const n = Number(e.target.value.replace(/\D/g, ""));
                      set({ [x.k]: n ? n : undefined } as Partial<Filters>);
                    }}
                  />
                </span>
              </label>
            ))}
          </div>
        </Group>

        <Group title="Habitaciones">
          <Pills
            label="Habitaciones"
            options={[
              { v: 1, l: "1+" },
              { v: 2, l: "2+" },
              { v: 3, l: "3+" },
              { v: 4, l: "4+" },
            ]}
            value={f.bedrooms}
            onChange={(v) => set({ bedrooms: v })}
          />
        </Group>

        <Group title="Baños">
          <Pills
            label="Baños"
            options={[
              { v: 1, l: "1+" },
              { v: 2, l: "2+" },
              { v: 3, l: "3+" },
            ]}
            value={f.bathrooms}
            onChange={(v) => set({ bathrooms: v })}
          />
        </Group>

        <Group title="Características" defaultOpen={false}>
          <div className="flex flex-col">
            {FEATURE_OPTIONS.map((o) => (
              <label key={o.value} className="flex items-center gap-2 min-h-11 px-1.5 rounded hover:bg-surface cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" checked={!!f.features?.includes(o.value)} onChange={() => set({ features: toggleIn(f.features, o.value) })} />
                <span className="font-body-sm text-body-sm text-on-surface">{o.label}</span>
              </label>
            ))}
          </div>
        </Group>

        <Group title="Etapa de la obra" defaultOpen={false}>
          <div className="flex flex-col">
            {(
              [
                ["terminada", "Terminada"],
                ["en-construccion", "En construcción"],
                ["sobre-planos", "Sobre planos"],
              ] as const
            ).map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 min-h-11 px-1.5 rounded hover:bg-surface cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" checked={!!f.stage?.includes(v)} onChange={() => set({ stage: toggleIn(f.stage, v) })} />
                <span className="font-body-sm text-body-sm text-on-surface">{l}</span>
              </label>
            ))}
          </div>
        </Group>

        <Group title="Vivienda">
          <Pills
            label="Vivienda"
            options={[
              { v: "VIP" as const, l: "VIP" },
              { v: "VIS" as const, l: "VIS" },
            ]}
            value={f.housing}
            onChange={(v) => set({ housing: v })}
          />
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">Sin selección: todas.</p>
        </Group>

        <div className="py-space-sm flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined icon-fill text-[18px] text-rg-gold" aria-hidden>
              star
            </span>
            <span className="font-label-md text-label-md text-on-surface font-medium" id="excl-lbl">
              Solo Exclusivas RG
            </span>
          </span>
          <label className="relative inline-flex items-center cursor-pointer min-h-11">
            <input
              type="checkbox"
              role="switch"
              aria-labelledby="excl-lbl"
              className="sr-only peer"
              checked={!!f.exclusiveOnly}
              onChange={(e) => set({ exclusiveOnly: e.target.checked || undefined })}
            />
            <span className="w-10 h-6 bg-surface-container-high rounded-full relative transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
          </label>
        </div>
      </div>

      <div className="pt-space-md">
        <button
          className="h-12 w-full rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
          type="button"
          onClick={() => onApply(f)}
        >
          <span>
            Ver {count} {count === 1 ? "propiedad" : "propiedades"}
          </span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
