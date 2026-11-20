"use client";

import { useId, type ReactNode } from "react";

/** Piezas comunes de los formularios del panel. */

export const pInput =
  "w-full h-12 px-4 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-on-surface font-body-md text-body-md placeholder:text-secondary/70 focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-black/10 transition-all disabled:bg-surface-container-low disabled:text-secondary";

export function Card({ icon, title, subtitle, children, aside, className = "" }: { icon: string; title: string; subtitle?: string; children: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <section className={`group bg-surface-container-lowest rounded-xl shadow-sm border border-[#ECEAE7] p-5 sm:p-6 animate-fade-in transition-all duration-300 ease-out hover:shadow-md hover:border-outline-variant motion-reduce:transition-none ${className}`}>
      <div className="flex items-start justify-between gap-3 pb-4 mb-5 border-b border-surface-container">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary shrink-0 transition-colors duration-300 group-hover:bg-primary group-hover:text-on-primary motion-reduce:transition-none">
            <span className="material-symbols-outlined text-[20px]" aria-hidden>
              {icon}
            </span>
          </div>
          <div>
            <h2 className="font-title-md text-title-md font-bold text-primary">{title}</h2>
            {subtitle && <p className="font-body-sm text-body-sm text-secondary">{subtitle}</p>}
          </div>
        </div>
        {aside}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

export function PField({
  label,
  hint,
  required,
  counter,
  children,
  id,
}: {
  label: string;
  hint?: ReactNode;
  required?: boolean;
  counter?: string;
  children: (id: string) => ReactNode;
  id?: string;
}) {
  const gen = useId();
  const fid = id ?? gen;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={fid} className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
        {counter && <span className="font-label-sm text-[11px] text-secondary">{counter}</span>}
      </div>
      {children(fid)}
      {hint && <div className="font-body-sm text-[12px] text-secondary">{hint}</div>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description, disabled, badge }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; disabled?: boolean; badge?: ReactNode }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-2 flex-wrap">
          {label} {badge}
        </label>
        {description && <p className="font-body-sm text-[12px] text-secondary mt-0.5">{description}</p>}
      </div>
      <label className={`relative inline-flex items-center min-h-11 shrink-0 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
        <input id={id} type="checkbox" role="switch" className="sr-only peer" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span className="w-11 h-6 bg-surface-variant rounded-full relative transition-colors peer-checked:bg-primary peer-disabled:opacity-50 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
      </label>
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { v: T; l: string }[]; label: string }) {
  return (
    <div className="flex flex-wrap sm:inline-flex sm:flex-nowrap gap-1 p-1 bg-surface-container rounded-lg w-full" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={`flex-1 min-h-10 px-2.5 rounded-md font-label-md text-label-md transition-all cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none whitespace-nowrap ${value === o.v ? "bg-primary text-on-primary font-semibold shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

export function PrivateBox({ children, title = "Solo uso interno de RG" }: { children: ReactNode; title?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-outline bg-surface-container-low p-4 flex flex-col gap-3">
      <p className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider">
        <span className="material-symbols-outlined text-[16px]" aria-hidden>
          lock
        </span>
        {title}
      </p>
      {children}
      <p className="flex items-start gap-1.5 font-body-sm text-[12px] text-secondary">
        <span className="material-symbols-outlined text-[14px] mt-0.5" aria-hidden>
          security
        </span>
        <span>
          <strong className="text-on-surface">Nunca</strong> se publica en la web ni la ven compradores, visitantes o inmobiliarias externas.
        </span>
      </p>
    </div>
  );
}
