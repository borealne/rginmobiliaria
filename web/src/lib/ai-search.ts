import { money, applyFilters, type Filters } from "./properties";
import type { Operation, Property, PropertyType } from "./types";

/**
 * Intérprete local de "Buscar con IA" (simulado).
 * Solo traduce lo escrito a criterios de búsqueda (OWASP: la IA no recibe órdenes
 * del texto del visitante) y no guarda datos personales (regla 10).
 * Se reemplaza por el modelo real manteniendo esta misma salida.
 */

export type CriterionKey = "operation" | "type" | "zone" | "bedrooms" | "bathrooms" | "maxPrice" | "minPrice" | "feature" | "exclusive" | "housing" | "stage";

export interface Criterion {
  id: string;
  key: CriterionKey;
  label: string;
  value: string | number;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const TYPES: [RegExp, PropertyType, string][] = [
  [/\b(casas?|villas?|residencias?)\b/, "casa", "Casa"],
  [/\b(departamentos?|depas?|deptos?|apartamentos?|penthouse)\b/, "departamento", "Departamento"],
  [/\b(suites?)\b/, "suite", "Suite"],
  [/\b(terrenos?|lotes?|solar(es)?)\b/, "terreno", "Terreno"],
  [/\b(locales?( comerciales?)?)\b/, "local", "Local"],
  [/\b(oficinas?)\b/, "oficina", "Oficina"],
  [/\b(edificios?)\b/, "edificio", "Edificio"],
];

const FEATURES: [RegExp, string][] = [
  [/parqueadero|garaje|garage|estacionamiento|cochera/, "Parqueadero"],
  [/jardin/, "Jardín"],
  [/balcon/, "Balcón"],
  [/terraza/, "Terraza"],
  [/amoblad|amueblad/, "Amoblad"],
  [/vista/, "Vista"],
  [/piscina/, "Piscina"],
  [/ascensor/, "Ascensor"],
  [/bbq|parrilla|barbacoa/, "BBQ"],
  [/seguridad|guardiania/, "Seguridad"],
];

const FEATURE_LABEL: Record<string, string> = { Amoblad: "Amoblado", Vista: "Con vista" };

export const ZONES_ALL = [
  "Ricaurte",
  "Totoracocha",
  "El Centro Histórico",
  "Turi",
  "El Batán",
  "Machángara",
  "San Sebastián",
  "Tarqui",
  "Bellavista",
  "San Joaquín",
  "Challuabamba",
  "Puertas del Sol",
  "Yanuncay",
  "Misicata",
  "Baños",
];

function parseMoney(raw: string) {
  const s = norm(raw).replace(/\$/g, "").trim();
  const mil = /\bmil\b|k\b/.test(s);
  const num = parseFloat(s.replace(/[^\d.,]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(/,(?=\d{3}\b)/g, "").replace(",", "."));
  if (isNaN(num) || num <= 0) return undefined;
  return mil ? num * 1000 : num;
}

export function interpret(text: string): Criterion[] {
  const t = norm(text);
  const out: Criterion[] = [];
  const add = (key: CriterionKey, label: string, value: string | number) => out.push({ id: `${key}:${value}`, key, label, value });

  // Operación
  if (/\b(alquil|arrend|arriendo|renta|rentar)\w*/.test(t)) add("operation", "Alquilar", "alquiler");
  else if (/\b(compr|venta|vend)\w*/.test(t)) add("operation", "Comprar", "venta");

  // Tipo
  for (const [re, type, label] of TYPES) {
    if (re.test(t)) {
      add("type", label, type);
      break;
    }
  }

  // Zona
  if (/\bcuenca\b/.test(t)) add("zone", "Cuenca", "Cuenca");
  for (const z of ZONES_ALL) {
    const zn = norm(z).replace(/^el /, "");
    if (t.includes(zn)) {
      const i = out.findIndex((c) => c.key === "zone" && c.value === "Cuenca");
      if (i >= 0) out.splice(i, 1);
      add("zone", `Cuenca · ${z}`, z);
      break;
    }
  }
  if (/\bcentro\b/.test(t) && !out.some((c) => c.key === "zone" && c.value !== "Cuenca")) {
    const i = out.findIndex((c) => c.key === "zone");
    if (i >= 0) out.splice(i, 1);
    add("zone", "Cuenca · El Centro Histórico", "El Centro Histórico");
  }

  // Habitaciones y baños
  const hab = t.match(/(\d+|una|dos|tres|cuatro|cinco)\s*(habitacion\w*|dormitorio\w*|cuartos?|hab\b|recamaras?)/);
  const words: Record<string, number> = { una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5 };
  if (hab) {
    const n = words[hab[1]] ?? parseInt(hab[1]);
    add("bedrooms", `${n} ${n === 1 ? "habitación" : "habitaciones"}`, n);
  }
  const ban = t.match(/(\d+|un|dos|tres)\s*banos?/);
  if (ban) {
    const n = ban[1] === "un" ? 1 : (words[ban[1]] ?? parseInt(ban[1]));
    add("bathrooms", `${n} ${n === 1 ? "baño" : "baños"}`, n);
  }

  // Presupuesto
  const max = t.match(/(hasta|maximo|menos de|no mas de|tope de|alrededor de|unos|presupuesto( de)?( alrededor de)?)\s*\$?\s*([\d.,]+\s*(mil|k)?)/);
  const min = t.match(/(desde|mas de|minimo)\s*\$?\s*([\d.,]+\s*(mil|k)?)/);
  if (max) {
    const v = parseMoney(max[4]);
    if (v) {
      const around = /alrededor|unos/.test(max[1]);
      const cap = around ? Math.round((v * 1.05) / 1000) * 1000 : v;
      add("maxPrice", `Hasta ${money(cap)}`, cap);
    }
  } else if (!min) {
    const loose = text.match(/\$\s*([\d.,]+\s*(mil|k)?)/i);
    if (loose) {
      const v = parseMoney(loose[1]);
      if (v) add("maxPrice", `Hasta ${money(v)}`, v);
    }
  }
  if (min) {
    const v = parseMoney(min[2]);
    if (v) add("minPrice", `Desde ${money(v)}`, v);
  }

  // Características
  for (const [re, key] of FEATURES) if (re.test(t)) add("feature", FEATURE_LABEL[key] ?? key, key);

  if (/exclusiv/.test(t)) add("exclusive", "Exclusiva RG", "1");
  if (/\bvip\b/.test(t)) add("housing", "Vivienda VIP", "VIP");
  else if (/\bvis\b|interes social/.test(t)) add("housing", "Vivienda VIS", "VIS");
  if (/planos|preventa|en construccion|proyecto/.test(t)) add("stage", "En construcción o sobre planos", "obra");

  return out;
}

export function criteriaToFilters(cs: Criterion[]): Filters {
  const f: Filters = {};
  for (const c of cs) {
    switch (c.key) {
      case "operation":
        f.operation = c.value as Operation;
        break;
      case "type":
        f.types = [c.value as PropertyType];
        break;
      case "zone":
        if (c.value !== "Cuenca") f.zone = String(c.value);
        break;
      case "bedrooms":
        f.bedrooms = Number(c.value);
        break;
      case "bathrooms":
        f.bathrooms = Number(c.value);
        break;
      case "maxPrice":
        f.maxPrice = Number(c.value);
        break;
      case "minPrice":
        f.minPrice = Number(c.value);
        break;
      case "feature":
        f.features = [...(f.features ?? []), String(c.value)];
        break;
      case "exclusive":
        f.exclusiveOnly = true;
        break;
      case "housing":
        f.housing = c.value as "VIP" | "VIS";
        break;
      case "stage":
        f.stage = ["en-construccion", "sobre-planos"];
        break;
    }
  }
  return f;
}

/** Criterios en el orden en que se aflojan para encontrar parecidas. */
const RELAX_ORDER: CriterionKey[] = ["feature", "bathrooms", "zone", "maxPrice", "bedrooms", "stage", "housing", "exclusive", "type"];

export interface SimilarResult {
  p: Property;
  change: string;
}

function describeChange(p: Property, dropped: Criterion[]) {
  const parts: string[] = [];
  for (const c of dropped) {
    if (c.key === "zone") parts.push(`Zona (${p.zone})`);
    else if (c.key === "maxPrice") parts.push(`Precio (${money(p.price)})`);
    else if (c.key === "bedrooms") parts.push(`${p.bedrooms ?? 0} hab. (en vez de ${c.value})`);
    else if (c.key === "bathrooms") parts.push(`${p.bathrooms ?? 0} baños (en vez de ${c.value})`);
    else if (c.key === "type") parts.push(`Tipo (${p.type})`);
    else if (c.key === "feature") parts.push(`Sin ${String(c.label).toLowerCase()}`);
    else parts.push(c.label);
  }
  return parts.join(" y ");
}

/**
 * Busca coincidencias exactas; si no hay, afloja criterios uno a uno
 * y devuelve hasta 3 "Parecidas" con lo que cambió (PRD 7.2).
 */
export function aiSearch(list: Property[], cs: Criterion[], sort?: Filters["sort"]) {
  const exact = applyFilters(list, { ...criteriaToFilters(cs), sort });
  if (exact.length || !cs.length) return { exact, similar: [] as SimilarResult[] };

  const seen = new Set<string>();
  const similar: SimilarResult[] = [];
  const keep = (c: Criterion) => c.key === "operation";
  let remaining = [...cs];
  const dropped: Criterion[] = [];
  for (const key of RELAX_ORDER) {
    const drop = remaining.filter((c) => c.key === key && !keep(c));
    if (!drop.length) continue;
    remaining = remaining.filter((c) => !drop.includes(c));
    dropped.push(...drop);
    const found = applyFilters(list, { ...criteriaToFilters(remaining), sort: "menor" });
    for (const p of found) {
      if (seen.has(p.code)) continue;
      seen.add(p.code);
      // Solo menciona los criterios que realmente no cumple.
      const fails = dropped.filter((c) => applyFilters([p], criteriaToFilters([c])).length === 0);
      similar.push({ p, change: describeChange(p, fails) || "Criterios cercanos" });
      if (similar.length >= 3) return { exact, similar };
    }
  }
  return { exact, similar };
}

export const EXAMPLES = [
  "Casa de 3 habitaciones en Cuenca hasta $150.000",
  "Departamento para alquilar con parqueadero",
  "Terreno en Turi",
];
