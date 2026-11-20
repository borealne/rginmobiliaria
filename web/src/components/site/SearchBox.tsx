"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { EXAMPLES, ZONES_ALL } from "@/lib/ai-search";
import { TYPE_LABEL } from "@/lib/properties";
import type { Lang, Operation } from "@/lib/types";

export const PRIVACY_NOTE = "Buscamos solo entre las propiedades de RG. No escribas datos personales.";

export const PRICE_STEPS: Record<Operation, { value: number; label: string }[]> = {
  venta: [
    { value: 60000, label: "Hasta $60.000" },
    { value: 100000, label: "Hasta $100.000" },
    { value: 150000, label: "Hasta $150.000" },
    { value: 250000, label: "Hasta $250.000" },
    { value: 500000, label: "Hasta $500.000" },
  ],
  alquiler: [
    { value: 400, label: "Hasta $400 / mes" },
    { value: 600, label: "Hasta $600 / mes" },
    { value: 900, label: "Hasta $900 / mes" },
    { value: 1500, label: "Hasta $1.500 / mes" },
  ],
};

type Mode = "ia" | "filtros";

const selectCls =
  "w-full h-12 pl-3 pr-9 rounded-lg border border-[#ECEAE7] bg-surface-container-lowest font-body-md text-body-md text-[#111111] appearance-none focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111]";

/**
 * Buscador de dos modos (PRD sección 5): Comprar/Alquilar,
 * "Buscar con IA" (texto + ejemplos + aviso de privacidad) y "Usar filtros".
 */
export function SearchBox({
  lang,
  variant = "hero",
  initialMode = "ia",
  initialOp = "venta",
  initialQuery = "",
  onModeChange,
  children,
}: {
  lang: Lang;
  variant?: "hero" | "results";
  initialMode?: Mode;
  initialOp?: Operation;
  initialQuery?: string;
  onModeChange?: (m: Mode) => void;
  /** Contenido extra dentro del panel (p. ej. "Entendí esto:" en resultados). */
  children?: ReactNode;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [op, setOp] = useState<Operation>(initialOp);
  const [q, setQ] = useState(initialQuery);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({ zona: "", tipo: "", max: "", hab: "", texto: "" });

  useEffect(() => setQ(initialQuery), [initialQuery]);
  useEffect(() => setOp(initialOp), [initialOp]);
  useEffect(() => setMode(initialMode), [initialMode]);

  const changeMode = (m: Mode) => {
    setMode(m);
    onModeChange?.(m);
  };

  const submitAI = (e?: FormEvent, text = q) => {
    e?.preventDefault();
    if (text.trim().length < 3) {
      setError("Cuéntanos qué buscas. Prueba con tipo, zona y presupuesto.");
      return;
    }
    setError(null);
    setSending(true);
    const params = new URLSearchParams({ modo: "ia", op, q: text.trim() });
    router.push(`/${lang}/propiedades?${params}`);
    setTimeout(() => setSending(false), 1200);
  };

  const submitFilters = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ modo: "filtros", op });
    if (f.zona) params.set("zona", f.zona);
    if (f.tipo) params.set("tipo", f.tipo);
    if (f.max) params.set("max", f.max);
    if (f.hab) params.set("hab", f.hab);
    if (f.texto) params.set("texto", f.texto);
    router.push(`/${lang}/propiedades?${params}`);
  };

  const hero = variant === "hero";

  const opTabs = (
    <div className={hero ? "flex items-center gap-2" : "inline-flex p-1 bg-surface-container rounded-lg self-start"} role="radiogroup" aria-label="Operación">
      {(["venta", "alquiler"] as Operation[]).map((o) => {
        const on = op === o;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setOp(o)}
            className={
              hero
                ? `min-h-11 px-5 rounded-lg font-label-md text-label-md cursor-pointer active:scale-[0.98] transition-all ${on ? "bg-[#141414] text-white font-semibold shadow-sm" : "bg-white/80 text-[#6B6560] hover:bg-white hover:text-[#141414] font-medium border border-[#E5E0D8]"}`
                : `min-h-11 px-6 py-2.5 rounded-lg font-label-md text-label-md cursor-pointer active:scale-[0.98] transition-all ${on ? "bg-primary text-on-primary" : "text-secondary hover:text-primary"}`
            }
          >
            {o === "venta" ? "Comprar" : "Alquilar"}
          </button>
        );
      })}
    </div>
  );

  const modeTabs = (
    <div className={hero ? "flex items-center gap-2" : "flex items-center gap-6"} role="tablist" aria-label="Modo de búsqueda">
      {(
        [
          { m: "ia", label: "Buscar con IA", icon: "auto_awesome" },
          { m: "filtros", label: "Usar filtros", icon: "tune" },
        ] as const
      ).map(({ m, label, icon }) => {
        const on = mode === m;
        return (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => changeMode(m)}
            className={
              hero
                ? `flex items-center gap-1.5 px-3.5 min-h-11 rounded-full font-label-md text-label-sm cursor-pointer active:scale-[0.98] transition-colors ${on ? "bg-[#141414] text-white font-semibold" : "bg-white/80 text-[#6B6560] hover:text-[#141414] font-medium border border-[#E5E0D8]"}`
                : `flex items-center gap-1.5 min-h-11 pb-1 cursor-pointer transition-colors ${on ? "text-primary font-title-md text-title-md border-b-2 border-primary" : "text-secondary hover:text-primary font-label-md text-label-md"}`
            }
          >
            <span className={`material-symbols-outlined text-[18px] ${on ? "icon-fill" : ""}`}>{icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      className={
        hero
          ? "w-full max-w-5xl bg-[#F5F3EE] rounded-2xl shadow-2xl p-4 sm:p-5 text-left flex flex-col gap-3 border border-[#E5E0D8]"
          : "w-full bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(17,17,17,0.06)] p-4 sm:p-6 md:p-8 flex flex-col gap-5"
      }
    >
      {hero ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {opTabs}
          {modeTabs}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {opTabs}
          {modeTabs}
        </div>
      )}

      {mode === "ia" ? (
        <form onSubmit={submitAI} className="flex flex-col gap-3" role="search" aria-label="Buscar con IA">
          <div className="flex flex-col md:flex-row items-stretch gap-3">
            <div className="relative flex-grow">
              <label htmlFor={`ai-${variant}`} className="sr-only">
                Cuéntanos qué buscas
              </label>
              <textarea
                id={`ai-${variant}`}
                rows={hero ? 1 : 2}
                maxLength={300}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitAI();
                  }
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={`ai-note-${variant}${error ? ` ai-err-${variant}` : ""}`}
                placeholder="Cuéntanos qué buscas. Ej: departamento de 3 habitaciones en Ricaurte hasta $120.000"
                className="w-full min-h-12 resize-none rounded-lg border border-[#E5E0D8] px-3.5 py-3 text-body-md text-[#141414] placeholder:text-[#6B6560] focus:outline-none focus:border-[#141414] focus:ring-1 focus:ring-[#141414] bg-white font-body-md aria-[invalid=true]:border-error"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="min-h-12 px-7 rounded-lg bg-[#141414] text-white font-label-md text-label-md font-semibold hover:bg-[#D9381E] active:scale-[0.98] transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer disabled:opacity-80"
            >
              {sending ? (
                <span className="flex items-center gap-1" aria-label="Buscando">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-white animate-dot" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">search</span>
                  <span>Buscar</span>
                </>
              )}
            </button>
          </div>
          {error && (
            <p id={`ai-err-${variant}`} role="alert" className="flex items-center gap-1 text-error font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}
          {hero && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="font-label-sm text-label-sm text-[#6B6560] font-medium mr-1">Prueba con:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setQ(ex);
                    if (/alquil/i.test(ex)) setOp("alquiler");
                    submitAI(undefined, ex);
                  }}
                  className="min-h-11 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#eae6dc] text-label-sm text-[#141414] font-label-sm border border-[#E5E0D8] transition-colors text-left cursor-pointer"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
          <p id={`ai-note-${variant}`} className="font-body-sm text-label-sm text-[#6B6560] pt-2 border-t border-[#ECEAE7]/60 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]" aria-hidden>
              lock
            </span>
            {PRIVACY_NOTE}
          </p>
        </form>
      ) : (
        <form onSubmit={submitFilters} className="flex flex-col gap-3" role="search" aria-label="Buscar con filtros">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(
              [
                { k: "zona", label: "Ubicación", any: "Cuenca · Todas las zonas", opts: ZONES_ALL.map((z) => ({ v: z, l: z })) },
                { k: "tipo", label: "Tipo de propiedad", any: "Todos los tipos", opts: Object.entries(TYPE_LABEL).map(([v, l]) => ({ v, l })) },
                { k: "max", label: "Precio", any: "Cualquier precio", opts: PRICE_STEPS[op].map((s) => ({ v: String(s.value), l: s.label })) },
                { k: "hab", label: "Habitaciones", any: "Cualquiera", opts: [1, 2, 3, 4].map((n) => ({ v: String(n), l: `${n}+ habitaciones` })) },
              ] as const
            ).map((s) => (
              <div key={s.k} className="flex flex-col gap-1">
                <label htmlFor={`f-${variant}-${s.k}`} className="font-label-sm text-label-sm text-[#6B6560]">
                  {s.label}
                </label>
                <div className="relative">
                  <select
                    id={`f-${variant}-${s.k}`}
                    className={selectCls}
                    value={f[s.k]}
                    onChange={(e) => setF((x) => ({ ...x, [s.k]: e.target.value }))}
                  >
                    <option value="">{s.any}</option>
                    {s.opts.map((o) => (
                      <option key={o.v} value={o.v}>
                        {o.l}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B6560] pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <label htmlFor={`f-${variant}-texto`} className="sr-only">
                Nombre o código de la propiedad
              </label>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6560] text-[20px]" aria-hidden>
                search
              </span>
              <input
                id={`f-${variant}-texto`}
                value={f.texto}
                onChange={(e) => setF((x) => ({ ...x, texto: e.target.value }))}
                placeholder="Nombre o código (ej. CA-001)"
                className="w-full h-12 pl-10 pr-3 rounded-lg border border-[#ECEAE7] bg-surface-container-lowest font-body-md text-body-md text-[#111111] placeholder:text-[#6B6560] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111]"
              />
            </div>
            <button
              type="submit"
              className="h-12 px-8 rounded-lg bg-[#111111] text-surface-container-lowest font-label-md text-label-md font-medium hover:bg-black/90 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              <span>Buscar</span>
            </button>
          </div>
        </form>
      )}
      {children}
    </div>
  );
}
