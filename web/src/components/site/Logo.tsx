import Link from "next/link";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

/**
 * Marcador del logo (círculo negro con "RG"). Se reemplaza por el logo original
 * cuando llegue el vector (documento maestro, pendiente 7).
 */
export function LogoMark({ inverted = false, size = 40 }: { inverted?: boolean; size?: number }) {
  return (
    <div
      aria-hidden
      style={{ width: size, height: size }}
      className={`rounded-full flex items-center justify-center font-headline-sm text-headline-sm font-bold tracking-tight flex-shrink-0 ${
        inverted ? "bg-surface-container-lowest text-primary" : "bg-primary text-on-primary"
      }`}
    >
      RG
    </div>
  );
}

export function Logo({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <Link href={`/${lang}`} className="flex items-center gap-space-sm flex-shrink-0 group" aria-label="RG Inmobiliaria Constructora, inicio">
      <LogoMark />
      <div className="flex flex-col">
        <span className="font-title-md text-[14px] sm:text-title-md text-on-surface tracking-tight leading-tight">{d.brand}</span>
        <span className="font-label-sm text-label-sm text-on-surface-variant">{d.tagline}</span>
      </div>
    </Link>
  );
}
