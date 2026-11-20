"use client";

import { useState, type FormEvent } from "react";
import { FieldError } from "@/components/ui/Field";
import { money } from "@/lib/properties";
import type { Housing } from "@/lib/types";

/**
 * Simulador de crédito (PRD 5 y 8): siempre "Resultado referencial".
 * Tasas referenciales de ejemplo; se configuran en el panel ("Programas de crédito").
 * Umbrales del semáforo: pendiente de decisión del cliente (PRD 11, pregunta 8).
 */
const RATE = { general: 0.095, social: 0.0499 };
const COMFORT = 0.3;
const HIGH = 0.4;

const parse = (s: string) => Number(s.replace(/\D/g, "")) || 0;
const fmt = (n: number) => (n ? String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "");

export function Simulator({ price, housing }: { price: number; housing: Housing }) {
  const [value, setValue] = useState(fmt(price));
  const [down, setDown] = useState(fmt(price * 0.2));
  const [years, setYears] = useState("20");
  const [income, setIncome] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<null | { payment: number; ratio: number | null; rate: number }>(null);
  const rate = housing ? RATE.social : RATE.general;

  const simulate = (e: FormEvent) => {
    e.preventDefault();
    const v = parse(value);
    const d = parse(down);
    const inc = parse(income);
    const er: Record<string, string> = {};
    if (v < 10000) er.value = "Escribe el valor de la vivienda (mínimo $10.000).";
    if (d < v * 0.2) er.down = `La entrada debe ser al menos el 20 % (${money(Math.ceil(v * 0.2))}).`;
    if (d >= v) er.down = "La entrada debe ser menor que el valor de la vivienda.";
    setErrors(er);
    if (Object.keys(er).length) {
      setResult(null);
      return;
    }
    const n = Number(years) * 12;
    const r = rate / 12;
    const payment = ((v - d) * r) / (1 - Math.pow(1 + r, -n));
    setResult({ payment, ratio: inc ? payment / inc : null, rate });
  };

  const light =
    result?.ratio == null
      ? null
      : result.ratio <= COMFORT
        ? { label: "Probablemente te alcanza · Cuota cómoda", icon: "check_circle", cls: "text-st-available bg-st-available-bg" }
        : result.ratio <= HIGH
          ? { label: "Cuota ajustada", icon: "error", cls: "text-st-reserved bg-st-reserved-bg" }
          : { label: "Cuota alta para tus ingresos", icon: "warning", cls: "text-error bg-error-container" };

  const field = (id: string, label: string, val: string, set: (v: string) => void, opt?: boolean) => (
    <div>
      <label htmlFor={id} className="block font-label-sm text-label-sm font-semibold text-primary mb-1.5">
        {label}
        {opt && <span className="font-normal text-secondary"> (opcional)</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary font-label-md" aria-hidden>
          $
        </span>
        <input
          id={id}
          inputMode="numeric"
          value={val}
          onChange={(e) => set(fmt(parse(e.target.value)))}
          aria-invalid={errors[id.replace("sim-", "")] ? true : undefined}
          aria-describedby={errors[id.replace("sim-", "")] ? `${id}-err` : undefined}
          className="w-full h-12 pl-8 pr-4 rounded-lg border border-[#ECEAE7] bg-surface-container-lowest font-body-md text-primary font-medium focus:outline-none focus:ring-1 focus:ring-primary aria-[invalid=true]:border-error aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error"
        />
      </div>
      <FieldError id={`${id}-err`}>{errors[id.replace("sim-", "")]}</FieldError>
    </div>
  );

  return (
    <form onSubmit={simulate} className="bg-surface-container-lowest rounded-xl p-5 sm:p-8 border border-[#ECEAE7]" noValidate>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-primary">Simula tu crédito hipotecario</h3>
          <p className="font-body-sm text-body-sm text-secondary">Ajusta los valores para estimar tu cuota mensual aproximada</p>
        </div>
        <span className="material-symbols-outlined text-[28px] text-secondary" aria-hidden>
          calculate
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {field("sim-value", "Valor de la vivienda", value, setValue)}
        {field("sim-down", "Entrada (mínimo 20 %)", down, setDown)}
        <div>
          <label htmlFor="sim-years" className="block font-label-sm text-label-sm font-semibold text-primary mb-1.5">
            Plazo (años)
          </label>
          <div className="relative">
            <select
              id="sim-years"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full h-12 px-4 pr-10 appearance-none rounded-lg border border-[#ECEAE7] bg-surface-container-lowest font-body-md text-primary font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {[10, 15, 20, 25].map((y) => (
                <option key={y} value={y}>
                  {y} años ({y * 12} meses)
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">expand_more</span>
          </div>
        </div>
        {field("sim-income", "Ingresos mensuales", income, setIncome, true)}
      </div>
      <button className="w-full sm:w-auto h-12 px-8 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary/90 transition-colors mb-6" type="submit">
        Simular
      </button>

      <div className="bg-[#F5F3F1] rounded-xl p-5 sm:p-6 flex flex-col gap-4" aria-live="polite">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ECEAE7] pb-4">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">Cálculo estimativo</span>
            <h4 className="font-headline-sm text-headline-sm font-bold text-primary">Resultado referencial</h4>
          </div>
          {light && (
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-sm text-label-sm font-semibold self-start sm:self-auto ${light.cls}`}>
              <span className="material-symbols-outlined icon-fill text-[16px]" aria-hidden>
                {light.icon}
              </span>
              {light.label}
            </span>
          )}
        </div>
        {result ? (
          <>
            <p className="font-display-xl text-[24px] sm:text-[28px] leading-tight font-bold text-primary">Cuota estimada: {money(Math.round(result.payment))} / mes</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Calculada con una tasa referencial de {(result.rate * 100).toFixed(2).replace(".", ",")} % anual. {result.ratio == null && "Agrega tus ingresos para ver si la cuota es cómoda."}
            </p>
          </>
        ) : (
          <p className="font-body-md text-body-md text-secondary">Completa los datos y toca “Simular” para ver una cuota aproximada.</p>
        )}
        <p className="font-body-sm text-body-sm text-on-surface-variant">Valores referenciales. Una entidad financiera puede darte otros valores.</p>
        <div className="pt-3 border-t border-[#ECEAE7] text-secondary font-label-sm text-[11px] leading-relaxed">
          No garantizamos aprobación ni ofrecemos tasas o cuotas preaprobadas. Las condiciones y la elegibilidad están sujetas a evaluación de la entidad financiera. No incluye gastos legales, impuestos, seguros, avalúo ni comisiones.
        </div>
      </div>
    </form>
  );
}
