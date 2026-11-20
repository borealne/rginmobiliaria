import { PROPERTIES } from "./data/properties";
import type { FeatureGroup, Operation, Photo, Property, PropertyType, Status } from "./types";

export const CLOSED_VISIBLE_DAYS = 30;

const fmt = new Intl.NumberFormat("es-EC", { maximumFractionDigits: 0 });

/** $145.000 (punto como separador de miles, como en el prototipo). */
export function money(n: number) {
  return "$" + fmt.format(n).replace(/[\s,]/g, ".");
}

export function priceLabel(p: Pick<Property, "price" | "priceFrom" | "operation">, opts?: { capitalFrom?: boolean }) {
  const base = money(p.price);
  if (p.operation === "alquiler") return { main: base, suffix: "/ mes", prefix: "" };
  if (p.priceFrom) return { main: base, suffix: "", prefix: opts?.capitalFrom === false ? "desde " : "Desde " };
  return { main: base, suffix: "", prefix: "" };
}

export function priceText(p: Property) {
  const l = priceLabel(p);
  return `${l.prefix}${l.main}${l.suffix ? " " + l.suffix : ""}`;
}

export function zoneLabel(p: Pick<Property, "city" | "zone">) {
  return `${p.city} · ${p.zone}`;
}

export const OPERATION_LABEL: Record<Operation, string> = { venta: "Venta", alquiler: "Alquiler" };

export const TYPE_LABEL: Record<PropertyType, string> = {
  casa: "Casa",
  departamento: "Departamento",
  suite: "Suite",
  terreno: "Terreno",
  local: "Local",
  oficina: "Oficina",
  edificio: "Edificio",
};

/** Estados: siempre con ícono y texto, nunca solo color (regla 5). */
export const STATUS_META: Record<Status, { label: string; icon: string; fg: string; bg: string; border: string }> = {
  disponible: { label: "Disponible", icon: "check_circle", fg: "text-st-available", bg: "bg-st-available-bg", border: "border-st-available/20" },
  reservada: { label: "Reservada", icon: "schedule", fg: "text-st-reserved", bg: "bg-st-reserved-bg", border: "border-st-reserved/20" },
  "en-construccion": { label: "En construcción", icon: "construction", fg: "text-st-building", bg: "bg-st-building-bg", border: "border-st-building/20" },
  "sobre-planos": { label: "Sobre planos", icon: "architecture", fg: "text-st-building", bg: "bg-st-building-bg", border: "border-st-building/20" },
  vendida: { label: "Vendida", icon: "sell", fg: "text-st-closed", bg: "bg-st-closed-bg", border: "border-st-closed/20" },
  alquilada: { label: "Alquilada", icon: "key", fg: "text-st-closed", bg: "bg-st-closed-bg", border: "border-st-closed/20" },
};

export function statusText(p: Pick<Property, "status" | "progress">) {
  const m = STATUS_META[p.status];
  if ((p.status === "en-construccion" || p.status === "sobre-planos") && p.progress != null) return `${m.label} ${p.progress} %`;
  return m.label;
}

export const isClosed = (p: Property) => p.status === "vendida" || p.status === "alquilada";

function daysSince(iso: string, now = new Date()) {
  return (now.getTime() - new Date(iso + "T12:00:00").getTime()) / 86_400_000;
}

/**
 * Lo que se ve en la web pública: publicadas, y las vendidas o alquiladas
 * solo durante 30 días desde el cierre (después se ocultan, no se borran).
 */
export function isPublic(p: Property, now = new Date()) {
  if (!p.published) return false;
  if (isClosed(p)) return !!p.closedAt && daysSince(p.closedAt, now) <= CLOSED_VISIBLE_DAYS;
  return true;
}

export function allProperties() {
  return PROPERTIES;
}

export function publicProperties() {
  return PROPERTIES.filter((p) => isPublic(p));
}

export function getProperty(codeOrSlug: string) {
  const k = codeOrSlug.toLowerCase();
  return PROPERTIES.find((p) => p.slug === k || p.code.toLowerCase() === k);
}

export function propertyHref(lang: string, p: Pick<Property, "slug">) {
  return `/${lang}/propiedades/${p.slug}`;
}

/** Parecidas: misma operación, disponibles, priorizando tipo y zona. */
export function similarTo(p: Property, n = 3) {
  return publicProperties()
    .filter((o) => o.code !== p.code && o.operation === p.operation && !isClosed(o))
    .map((o) => ({ o, score: (o.type === p.type ? 2 : 0) + (o.zone === p.zone ? 1 : 0) - Math.abs(o.price - p.price) / Math.max(p.price, 1) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.o);
}

export function zoneCounts() {
  const counts = new Map<string, number>();
  for (const p of publicProperties()) {
    if (isClosed(p)) continue;
    counts.set(p.zone, (counts.get(p.zone) ?? 0) + 1);
  }
  return counts;
}

/* ------------------------------------------------------------------ */
/* Búsqueda con filtros                                                */
/* ------------------------------------------------------------------ */

export interface Filters {
  operation?: Operation;
  q?: string;
  zone?: string;
  types?: PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  features?: string[];
  stage?: ("en-construccion" | "sobre-planos" | "terminada")[];
  housing?: "VIP" | "VIS";
  exclusiveOnly?: boolean;
  sort?: "recientes" | "menor" | "mayor";
}

export function applyFilters(list: Property[], f: Filters) {
  let r = list.filter((p) => {
    if (f.operation && p.operation !== f.operation) return false;
    if (f.q) {
      const q = f.q.toLowerCase();
      if (!(`${p.title} ${p.code} ${p.zone}`.toLowerCase().includes(q))) return false;
    }
    if (f.zone && p.zone !== f.zone) return false;
    if (f.types?.length && !f.types.includes(p.type)) return false;
    if (f.minPrice != null && p.price < f.minPrice) return false;
    if (f.maxPrice != null && p.price > f.maxPrice) return false;
    if (f.bedrooms && (p.bedrooms ?? 0) < f.bedrooms) return false;
    if (f.bathrooms && (p.bathrooms ?? 0) < f.bathrooms) return false;
    if (f.features?.length && !f.features.every((x) => p.features.some((pf) => pf.toLowerCase().includes(x.toLowerCase())))) return false;
    if (f.stage?.length) {
      const st = p.status === "en-construccion" || p.status === "sobre-planos" ? p.status : "terminada";
      if (!f.stage.includes(st)) return false;
    }
    if (f.housing && p.housing !== f.housing) return false;
    if (f.exclusiveOnly && !p.exclusive) return false;
    return true;
  });
  const sort = f.sort ?? "recientes";
  r = [...r].sort((a, b) =>
    sort === "menor" ? a.price - b.price : sort === "mayor" ? b.price - a.price : b.createdAt.localeCompare(a.createdAt),
  );
  return r;
}

export const PAGE_SIZE = 6;

/* -------------------------------------------------------------------------- */
/* Códigos únicos configurables + Autogeneración inteligente por prefijo      */
/* -------------------------------------------------------------------------- */

export const PROPERTY_CODE_PREFIX: Record<PropertyType, string> = {
  casa: "CA",
  departamento: "DP",
  suite: "SU",
  terreno: "TR",
  local: "LC",
  oficina: "LC",
  edificio: "PR",
};

export const USED_CODES_STORAGE_KEY = "rg_used_property_codes_v1";

export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/\s+/g, "");
}

/**
 * Reúne todos los códigos utilizados en el catálogo semilla, propiedades creadas,
 * sobreescrituras del panel e historial persistente en localStorage.
 */
export function collectUsedPropertyCodes(extraCodes?: Iterable<string>): Set<string> {
  const used = new Set<string>();
  for (const p of PROPERTIES) {
    if (p.code) used.add(normalizeCode(p.code));
  }
  if (extraCodes) {
    for (const c of extraCodes) {
      if (c) used.add(normalizeCode(c));
    }
  }
  if (typeof window !== "undefined") {
    try {
      const rawHist = localStorage.getItem(USED_CODES_STORAGE_KEY);
      if (rawHist) {
        const list = JSON.parse(rawHist) as string[];
        if (Array.isArray(list)) list.forEach((c) => c && used.add(normalizeCode(c)));
      }
      const rawAdded = localStorage.getItem("rg-panel-propiedades-nuevas");
      if (rawAdded) {
        const added = JSON.parse(rawAdded) as Property[];
        if (Array.isArray(added)) added.forEach((p) => p?.code && used.add(normalizeCode(p.code)));
      }
      const rawOv = localStorage.getItem("rg-panel-propiedades");
      if (rawOv) {
        const ov = JSON.parse(rawOv) as Record<string, unknown>;
        if (ov && typeof ov === "object") Object.keys(ov).forEach((k) => k && used.add(normalizeCode(k)));
      }
    } catch {
      /* ignore storage errors */
    }
  }
  return used;
}

export function registerUsedPropertyCode(code: string): void {
  if (typeof window === "undefined") return;
  const clean = normalizeCode(code);
  if (!clean) return;
  try {
    const raw = localStorage.getItem(USED_CODES_STORAGE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = Array.from(new Set([...(Array.isArray(list) ? list : []).map(normalizeCode), clean]));
    localStorage.setItem(USED_CODES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/**
 * Sugiere el siguiente código correlativo disponible para un tipo de propiedad
 * que no exista en el inventario activo ni en el historial.
 */
export function generateNextPropertyCode(type: PropertyType, extraCodes?: Iterable<string>): string {
  const prefix = PROPERTY_CODE_PREFIX[type] ?? "CA";
  const used = collectUsedPropertyCodes(extraCodes);
  let seq = 1;
  while (seq < 9999) {
    const candidate = `${prefix}-${String(seq).padStart(3, "0")}`;
    if (!used.has(candidate)) {
      return candidate;
    }
    seq += 1;
  }
  return `${prefix}-${Date.now().toString().slice(-4)}`;
}

/* -------------------------------------------------------------------------- */
/* Normalización retrocompatible de Fotos y Ficha Técnica Dinámica            */
/* -------------------------------------------------------------------------- */

export function inferPhotoIcon(room?: string): string {
  const r = (room ?? "").toLowerCase();
  if (r.includes("dormitorio") || r.includes("habitaci") || r.includes("alcoba") || r.includes("master")) return "bed";
  if (r.includes("sala") || r.includes("estar") || r.includes("living")) return "weekend";
  if (r.includes("cocina") || r.includes("comedor") || r.includes("isla")) return "countertops";
  if (r.includes("jard") || r.includes("patio") || r.includes("verde") || r.includes("exterior")) return "yard";
  if (r.includes("piscina") || r.includes("jacuzzi")) return "pool";
  if (r.includes("terraza") || r.includes("balc") || r.includes("mirador")) return "balcony";
  if (r.includes("baño") || r.includes("bano") || r.includes("sanitario")) return "bathtub";
  if (r.includes("vista") || r.includes("lote") || r.includes("terreno") || r.includes("zona") || r.includes("cuenca")) return "landscape";
  if (r.includes("parqueadero") || r.includes("garaje")) return "directions_car";
  if (r.includes("estudio") || r.includes("oficina") || r.includes("reunion")) return "menu_book";
  if (r.includes("altura") || r.includes("escalera") || r.includes("ingreso") || r.includes("hall")) return "stairs";
  if (r.includes("chimenea") || r.includes("bbq") || r.includes("social")) return "fireplace";
  if (r.includes("plano") || r.includes("distribuci")) return "grid_view";
  return "home";
}

const ROOM_EN_MAP: Record<string, string> = {
  "Fachada principal y jardines": "Main Facade & Gardens",
  "Fachada principal": "Main Facade",
  "Fachada": "Main Facade",
  "Sala": "Living Room",
  "Sala con chimenea": "Living Room with Fireplace",
  "Sala y balcón": "Living Room & Balcony",
  "Sala con vista": "Living Room with View",
  "Sala con vista al río": "Riverfront Living Room",
  "Sala y dormitorio": "Living & Bedroom",
  "Sala y cocina": "Living & Kitchen",
  "Cocina con isla": "Kitchen with Island",
  "Cocina": "Kitchen",
  "Dormitorio principal": "Primary Suite",
  "Dormitorio": "Bedroom",
  "Dormitorio secundario": "Guest Bedroom",
  "Baño principal": "Primary Bathroom",
  "Baño": "Primary Bathroom",
  "Terraza": "Terrace",
  "Terraza cubierta": "Covered Terrace",
  "Balcón": "Balcony",
  "Jardín": "Private Garden",
  "Patio y BBQ": "Private Patio & BBQ",
  "Área social": "Social Lounge & Fireplace",
  "Plano de distribución": "Architectural Floor Plan",
  "Plano de planta": "Architectural Floor Plan",
  "Estudio": "Home Office / Study",
  "Vista general": "Panoramic Overview",
  "Lote": "Land Parcel",
  "Vista a Cuenca": "Cuenca Valley View",
  "Perspectiva (render)": "Architectural Perspective",
  "Obra": "Construction Progress",
  "Render exterior": "Exterior Render",
  "Render del proyecto": "Project Render",
  "Exterior": "Exterior View",
  "Volumetría (render)": "Massing & Volume Render",
  "Edificio": "Building Exterior",
  "Vista de la zona": "Neighborhood View",
};

export function translateRoomToEn(room?: string): string {
  if (!room) return "Architectural Space";
  return ROOM_EN_MAP[room] ?? room;
}

export function normalizePhoto(raw: Photo | string, idx = 0): Photo {
  if (typeof raw === "string") {
    const fallbackRoom = idx === 0 ? "Fachada principal" : `Ambiente ${idx + 1}`;
    return {
      src: raw,
      room: fallbackRoom,
      captionEs: fallbackRoom,
      captionEn: idx === 0 ? "Main Facade" : `Space ${idx + 1}`,
      subEs: "",
      subEn: "",
      showCaption: true,
      icon: inferPhotoIcon(fallbackRoom),
    };
  }
  const room = raw.room || raw.captionEs || `Ambiente ${idx + 1}`;
  const captionEs = raw.captionEs !== undefined ? raw.captionEs : room;
  const captionEn = raw.captionEn !== undefined && raw.captionEn !== "" ? raw.captionEn : translateRoomToEn(captionEs || room);
  return {
    src: raw.src,
    room: captionEs || room,
    captionEs,
    captionEn,
    subEs: raw.subEs ?? "",
    subEn: raw.subEn ?? "",
    showCaption: raw.showCaption !== false,
    icon: raw.icon || inferPhotoIcon(captionEs || room),
    customIcon: raw.customIcon,
  };
}

export function normalizePhotos(list?: (Photo | string)[]): Photo[] {
  if (!Array.isArray(list)) return [];
  return list.map((item, idx) => normalizePhoto(item, idx));
}

export function createDefaultFeatureGroups(): FeatureGroup[] {
  return [
    { title: "Interior", titleEn: "Interior", icon: "chair", visible: true, items: [] },
    { title: "Exterior", titleEn: "Exterior", icon: "deck", visible: true, items: [] },
    { title: "Amenidades y seguridad", titleEn: "Amenities & Security", icon: "verified_user", visible: true, items: [] },
    { title: "Servicios y eficiencia", titleEn: "Utilities & Efficiency", icon: "bolt", visible: true, items: [] },
  ];
}

export function inferFeatureIcon(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("jard") || l.includes("patio") || l.includes("verde")) return "yard";
  if (l.includes("piscina")) return "pool";
  if (l.includes("parqueadero") || l.includes("garaje")) return "directions_car";
  if (l.includes("ascensor")) return "elevator";
  if (l.includes("seguridad") || l.includes("guardia") || l.includes("control")) return "verified_user";
  if (l.includes("internet") || l.includes("wifi") || l.includes("fibra")) return "wifi";
  if (l.includes("agua") || l.includes("servicios")) return "water_drop";
  if (l.includes("luz") || l.includes("eléctric") || l.includes("solar")) return "bolt";
  if (l.includes("cocina") || l.includes("isla")) return "countertops";
  if (l.includes("terraza") || l.includes("balc")) return "balcony";
  if (l.includes("vista")) return "landscape";
  if (l.includes("chimenea")) return "fireplace";
  if (l.includes("bbq") || l.includes("parrilla")) return "outdoor_grill";
  if (l.includes("estudio") || l.includes("reuniones")) return "menu_book";
  if (l.includes("bodega")) return "inventory_2";
  if (l.includes("lavander")) return "local_laundry_service";
  if (l.includes("baño")) return "bathtub";
  if (l.includes("amoblad")) return "chair";
  return "check_circle";
}

export function ensureFeatureGroups(p: Property): FeatureGroup[] {
  if (p.featureGroups && p.featureGroups.length > 0) {
    return p.featureGroups.map((g) => ({
      ...g,
      visible: g.visible !== false,
    }));
  }
  const baseGroups = createDefaultFeatureGroups();
  for (const feat of p.features ?? []) {
    const fLow = feat.toLowerCase();
    const item = { icon: inferFeatureIcon(feat), label: feat, labelEn: feat };
    if (fLow.includes("jard") || fLow.includes("patio") || fLow.includes("terraza") || fLow.includes("balc") || fLow.includes("vista") || fLow.includes("parqueadero") || fLow.includes("verde")) {
      baseGroups[1].items.push(item);
    } else if (fLow.includes("seguridad") || fLow.includes("ascensor") || fLow.includes("piscina") || fLow.includes("bbq")) {
      baseGroups[2].items.push(item);
    } else if (fLow.includes("internet") || fLow.includes("servicios") || fLow.includes("agua") || fLow.includes("luz")) {
      baseGroups[3].items.push(item);
    } else {
      baseGroups[0].items.push(item);
    }
  }
  const nonEmpty = baseGroups.filter((g) => g.items.length > 0);
  return nonEmpty.length > 0 ? nonEmpty : baseGroups;
}
