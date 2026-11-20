import { STATUS_META, statusText } from "@/lib/properties";
import type { Property, Status } from "@/lib/types";

/** Estado con ícono y texto (regla 5). */
export function StatusChip({
  status,
  progress,
  className = "",
  shape = "pill",
}: {
  status: Status;
  progress?: number;
  className?: string;
  shape?: "pill" | "tag";
}) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${shape === "pill" ? "rounded-full" : "rounded-md"} ${m.bg} ${m.fg} font-label-sm text-label-sm font-medium border ${m.border} hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ${className}`}
    >
      <span className="material-symbols-outlined icon-fill text-[14px]">{m.icon}</span>
      <span>{statusText({ status, progress })}</span>
    </span>
  );
}

/** "Exclusiva RG": negro con dorado (regla 4). */
export function ExclusiveBadge({ className = "", size = "sm" }: { className?: string; size?: "sm" | "md" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 ${size === "md" ? "px-3 py-1.5 text-label-md" : "px-2.5 py-1 text-label-sm"} rounded bg-[#111111] text-rg-gold font-label-sm font-semibold tracking-tight shadow-sm ${className}`}
    >
      <span aria-hidden>★</span>
      Exclusiva RG
    </span>
  );
}

export function OperationBadge({ operation, className = "" }: { operation: Property["operation"]; className?: string }) {
  return (
    <span className={`px-2.5 py-1 rounded bg-[#111111]/85 backdrop-blur-sm text-surface-container-lowest font-label-sm text-label-sm font-medium ${className}`}>
      {operation === "venta" ? "Venta" : "Alquiler"}
    </span>
  );
}

export function HousingBadge({ housing, className = "" }: { housing: "VIP" | "VIS"; className?: string }) {
  return (
    <span className={`px-2.5 py-1 rounded bg-surface-container-lowest/95 text-[#111111] font-label-sm text-label-sm font-semibold border border-[#ECEAE7] ${className}`}>
      Vivienda {housing}
    </span>
  );
}

export function SimilarBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-lowest text-[#111111] font-label-sm text-label-sm font-semibold border border-[#111111]/20 shadow-sm ${className}`}>
      <span className="material-symbols-outlined text-[14px]">compare_arrows</span>
      Parecida
    </span>
  );
}

/** Título de sección con la línea roja de 3 px (único uso del rojo de marca). */
export function SectionTitle({
  children,
  as: Tag = "h2",
  className = "",
  center = false,
  id,
  invert = false,
}: {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
  center?: boolean;
  id?: string;
  invert?: boolean;
}) {
  return (
    <div className={`flex flex-col ${center ? "items-center text-center" : "items-start"} ${className}`}>
      <Tag
        id={id}
        className={`font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg font-bold tracking-tight ${invert ? "text-on-primary" : "text-[#111111]"}`}
      >
        {children}
      </Tag>
      <div className="w-12 h-[3px] bg-rg-red rounded-full mt-2" aria-hidden />
    </div>
  );
}
