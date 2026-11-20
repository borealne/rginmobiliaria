import Link from "next/link";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const inputCls =
  "w-full h-12 px-4 rounded-lg bg-surface-container-lowest text-primary font-body-md text-body-md border-0 ring-1 ring-outline-variant focus:ring-2 focus:ring-primary outline-none transition-shadow placeholder:text-[#6B6560] aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-error";

export const textareaCls =
  "w-full p-3 rounded-lg bg-surface-container-lowest text-primary font-body-md text-body-md border-0 ring-1 ring-outline-variant focus:ring-2 focus:ring-primary outline-none resize-none transition-shadow placeholder:text-[#6B6560] aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-error";

/** Error de campo: siempre con ícono y texto, nunca solo color (PRD 9). */
export function FieldError({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="flex items-center gap-1 text-error font-body-sm text-body-sm mt-1" role="alert">
      <span className="material-symbols-outlined text-[16px]">error</span>
      {children}
    </p>
  );
}

export function Label({ htmlFor, children, optional }: { htmlFor?: string; children: ReactNode; optional?: boolean }) {
  return (
    <label className="block font-label-md text-label-md text-primary font-medium" htmlFor={htmlFor}>
      {children}
      {optional && <span className="text-secondary font-normal font-label-sm"> (opcional)</span>}
    </label>
  );
}

type Common = { label: string; id: string; error?: string; optional?: boolean; prefix?: string; className?: string };

export function TextField({ label, id, error, optional, prefix, className = "", ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} optional={optional}>
        {label}
      </Label>
      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-0 pl-3.5 pr-2.5 h-12 flex items-center text-primary font-label-md text-label-md font-semibold bg-surface-container-low rounded-l-lg pointer-events-none">
            {prefix}
          </div>
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`${inputCls} ${prefix ? "pl-20" : ""}`}
          {...rest}
        />
      </div>
      <FieldError id={`${id}-err`}>{error}</FieldError>
    </div>
  );
}

export function TextArea({ label, id, error, optional, className = "", ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} optional={optional}>
        {label}
      </Label>
      <textarea id={id} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : undefined} className={textareaCls} {...rest} />
      <FieldError id={`${id}-err`}>{error}</FieldError>
    </div>
  );
}

export function SelectField({
  label,
  id,
  error,
  optional,
  className = "",
  children,
  ...rest
}: Common & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} optional={optional}>
        {label}
      </Label>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`${inputCls} appearance-none pr-10`}
          {...rest}
        >
          {children}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">expand_more</span>
      </div>
      <FieldError id={`${id}-err`}>{error}</FieldError>
    </div>
  );
}

/** Casilla de consentimiento con el texto exacto del PRD (sección 8). */
export function Consent({
  lang,
  checked,
  onChange,
  error,
  id = "consent",
  dark = false,
}: {
  lang: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  id?: string;
  dark?: boolean;
}) {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer group min-h-11" htmlFor={id}>
        <input
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          className="mt-1 w-5 h-5 rounded accent-primary cursor-pointer flex-shrink-0"
          type="checkbox"
        />
        <span className={`font-body-sm text-body-sm select-none ${dark ? "text-primary-fixed-dim" : "text-secondary"}`}>
          Acepto que RG me contacte según la{" "}
          <Link className={`underline transition-colors ${dark ? "text-on-primary" : "text-primary hover:text-secondary"}`} href={`/${lang}/legal/privacidad`}>
            Política de privacidad
          </Link>
          .
        </span>
      </label>
      <FieldError id={`${id}-err`}>{error}</FieldError>
    </div>
  );
}

export function validatePhone(v: string) {
  const digits = v.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 12;
}

export function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
