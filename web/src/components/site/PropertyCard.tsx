import Image from "next/image";
import Link from "next/link";
import { ExclusiveBadge, HousingBadge, OperationBadge, SimilarBadge, StatusChip } from "@/components/ui/Badges";
import { isClosed, priceLabel, propertyHref, zoneLabel } from "@/lib/properties";
import type { Lang, Property } from "@/lib/types";
import { FavoriteButton } from "./Favorites";

export function Specs({ p, className = "" }: { p: Property; className?: string }) {
  const items: { icon: string; text: string }[] = [];
  if (p.type === "edificio") {
    items.push({ icon: "apartment", text: `${p.units?.length ?? 0} unidades` });
    if (p.delivery) items.push({ icon: "event", text: `Entrega ${p.delivery.replace(" de ", " ").replace(/^(\w{3})\w*/, "$1")}` });
  } else if (p.type === "terreno") {
    items.push({ icon: "landscape", text: "Terreno" });
    items.push({ icon: "square_foot", text: `${p.areaLand} m²` });
  } else {
    if (p.bedrooms) items.push({ icon: "bed", text: `${p.bedrooms} hab` });
    if (p.bathrooms) items.push({ icon: "bathtub", text: `${p.bathrooms} ${p.bathrooms === 1 ? "baño" : "baños"}` });
    if (p.areaBuilt) items.push({ icon: "square_foot", text: `${p.areaBuilt} m²` });
  }
  return (
    <div className={`flex items-center gap-4 py-2 border-y border-[#ECEAE7] text-[#6B6560] font-body-sm text-body-sm ${className}`}>
      {items.map((i) => (
        <div key={i.icon + i.text} className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="material-symbols-outlined text-[18px]" aria-hidden>
            {i.icon}
          </span>
          <span>{i.text}</span>
        </div>
      ))}
    </div>
  );
}

export function Price({ p, className = "" }: { p: Property; className?: string }) {
  const l = priceLabel(p);
  return (
    <span className={`font-price-display text-price-display font-bold text-[#111111] ${className}`}>
      {l.prefix}
      {l.main}
      {l.suffix && <span className="font-body-sm text-body-sm font-normal text-[#6B6560]"> {l.suffix}</span>}
    </span>
  );
}

/**
 * Tarjeta de propiedad (PRD sección 5): foto 16:10, operación, favorito,
 * "Exclusiva RG", estado con ícono y texto, precio, título, zona (nunca dirección),
 * tres datos y botón. Variantes: parecida, cerrada (vendida o alquilada).
 */
export function PropertyCard({
  p,
  lang,
  similar,
  change,
  showSummary = false,
  priority = false,
}: {
  p: Property;
  lang: Lang;
  similar?: boolean;
  /** Qué criterio cambió (para "Parecida"). */
  change?: string;
  showSummary?: boolean;
  priority?: boolean;
}) {
  const closed = isClosed(p);
  const href = propertyHref(lang, p);
  return (
    <article
      className={`relative bg-surface-container-lowest rounded-xl border border-[#ECEAE7] overflow-hidden flex flex-col group transition-all duration-300 ease-out hover:-translate-y-1 hover:border-outline-variant hover:shadow-[0_8px_24px_rgba(17,17,17,0.08)] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${closed ? "opacity-90" : ""}`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container">
        <Image
          src={p.photos[0].src}
          alt={`${p.title}: ${p.photos[0].room}`}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
          className={`object-cover group-hover:scale-105 transition-transform duration-500 ${closed ? "grayscale" : ""}`}
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          <OperationBadge operation={p.operation} />
          {p.exclusive && <ExclusiveBadge />}
          {p.housing && <HousingBadge housing={p.housing} />}
          {similar && <SimilarBadge />}
        </div>
        <FavoriteButton code={p.code} className="absolute top-2 right-2 z-10" />
        <div className="absolute bottom-3 left-3">
          <StatusChip status={p.status} progress={p.progress} />
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow justify-between gap-4">
        <div>
          <div className="flex items-center justify-between mb-1 gap-2">
            <Price p={p} />
            <span className="font-label-sm text-label-sm text-[#6B6560] font-mono">{p.code}</span>
          </div>
          <h3 className="font-title-md text-title-md font-semibold text-[#111111] group-hover:text-rg-red-deep transition-colors truncate">
            <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
              {p.title}
            </Link>
          </h3>
          <p className="font-body-sm text-body-sm text-[#6B6560] mt-0.5 mb-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]" aria-hidden>
              location_on
            </span>
            <span>{zoneLabel(p)}</span>
          </p>
          <Specs p={p} />
          {showSummary && <p className="mt-3 font-body-sm text-body-sm text-[#6B6560] line-clamp-2">{p.summary}</p>}
          {change && (
            <p className="mt-3 flex items-start gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-[#111111]">
              <span className="material-symbols-outlined text-[16px] mt-0.5 text-[#6B6560]" aria-hidden>
                info
              </span>
              <span>
                <span className="font-semibold">Cambio:</span> {change}
              </span>
            </p>
          )}
          {p.operation === "alquiler" && showSummary && (
            <p className="mt-2 font-label-sm text-label-sm text-[#6B6560]">El precio es la mensualidad y no incluye gastos adicionales.</p>
          )}
        </div>
        <span
          aria-hidden
          className={`h-10 w-full rounded-lg font-label-md text-label-md font-medium transition-colors flex items-center justify-center ${
            closed ? "bg-surface-container-high text-[#6B6560]" : "bg-[#111111] text-surface-container-lowest group-hover:bg-black/85"
          }`}
        >
          {closed ? "Ver parecidas" : "Ver detalles"}
        </span>
      </div>
    </article>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-[#ECEAE7] overflow-hidden flex flex-col animate-pulse" aria-hidden>
      <div className="aspect-[16/10] bg-surface-container-high" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-6 w-28 rounded bg-surface-container-high" />
        <div className="h-4 w-3/4 rounded bg-surface-container-high" />
        <div className="h-4 w-1/2 rounded bg-surface-container" />
        <div className="h-9 w-full rounded bg-surface-container" />
        <div className="h-10 w-full rounded-lg bg-surface-container-high" />
      </div>
    </div>
  );
}
