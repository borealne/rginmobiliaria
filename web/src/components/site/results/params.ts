import type { Filters } from "@/lib/properties";
import type { Operation, PropertyType } from "@/lib/types";

/** Lectura y escritura de filtros en la URL (para compartir y volver atrás). */
export function filtersFromParams(sp: URLSearchParams): Filters {
  const list = (k: string) => (sp.get(k) ? sp.get(k)!.split(",").filter(Boolean) : undefined);
  const num = (k: string) => (sp.get(k) ? Number(sp.get(k)) : undefined);
  const op = sp.get("op");
  return {
    operation: op === "alquiler" || op === "venta" ? (op as Operation) : undefined,
    q: sp.get("texto") || undefined,
    zone: sp.get("zona") || undefined,
    types: list("tipo") as PropertyType[] | undefined,
    minPrice: num("min"),
    maxPrice: num("max"),
    bedrooms: num("hab"),
    bathrooms: num("ban"),
    features: list("carac"),
    stage: list("etapa") as Filters["stage"],
    housing: (sp.get("viv") as "VIP" | "VIS") || undefined,
    exclusiveOnly: sp.get("exclusivas") === "1",
    sort: (sp.get("orden") as Filters["sort"]) || undefined,
  };
}

export function filtersToParams(f: Filters, base?: URLSearchParams) {
  const sp = new URLSearchParams();
  sp.set("modo", "filtros");
  if (f.operation) sp.set("op", f.operation);
  if (f.q) sp.set("texto", f.q);
  if (f.zone) sp.set("zona", f.zone);
  if (f.types?.length) sp.set("tipo", f.types.join(","));
  if (f.minPrice != null) sp.set("min", String(f.minPrice));
  if (f.maxPrice != null) sp.set("max", String(f.maxPrice));
  if (f.bedrooms) sp.set("hab", String(f.bedrooms));
  if (f.bathrooms) sp.set("ban", String(f.bathrooms));
  if (f.features?.length) sp.set("carac", f.features.join(","));
  if (f.stage?.length) sp.set("etapa", f.stage.join(","));
  if (f.housing) sp.set("viv", f.housing);
  if (f.exclusiveOnly) sp.set("exclusivas", "1");
  if (f.sort && f.sort !== "recientes") sp.set("orden", f.sort);
  if (base?.get("vista")) sp.set("vista", base.get("vista")!);
  return sp;
}

export const FEATURE_OPTIONS = [
  { value: "Parqueadero", label: "Parqueadero" },
  { value: "Balcón", label: "Balcón" },
  { value: "Terraza", label: "Terraza" },
  { value: "Jardín", label: "Jardín" },
  { value: "Amoblad", label: "Amoblado" },
  { value: "Ascensor", label: "Ascensor" },
  { value: "Seguridad", label: "Seguridad 24 h" },
];
