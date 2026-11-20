export type Lang = "es" | "en";

/** Operación y estado son cosas distintas (documento maestro, regla 6). */
export type Operation = "venta" | "alquiler";

export type Status =
  | "disponible"
  | "reservada"
  | "en-construccion"
  | "sobre-planos"
  | "vendida"
  | "alquilada";

export type PropertyType =
  | "casa"
  | "departamento"
  | "suite"
  | "terreno"
  | "local"
  | "oficina"
  | "edificio";

export type Housing = "VIP" | "VIS" | null;

export interface Photo {
  src: string;
  /** Nombre del ambiente: se muestra en la galería (retrocompatible con captionEs). */
  room: string;
  /** Título / Pie de foto en español. */
  captionEs?: string;
  /** Título / Pie de foto en inglés. */
  captionEn?: string;
  /** Subtítulo breve en español. */
  subEs?: string;
  /** Subtítulo breve en inglés. */
  subEn?: string;
  /** Mostrar u ocultar el pie de foto y el gradiente oscuro en la galería pública (por defecto true). */
  showCaption?: boolean;
  /** Nombre del icono de Material Symbols para el círculo blanco de 40px. */
  icon?: string;
  /** Icono personalizado (SVG o PNG en DataURL) subido desde el panel. */
  customIcon?: string;
}

export interface Unit {
  name: string;
  bedrooms: number;
  area: number;
  price: number;
  status: Status;
}

export interface FeatureItem {
  icon: string;
  label: string;
  labelEn?: string;
  detail?: string;
  detailEn?: string;
  /** Icono personalizado (SVG o PNG en DataURL) subido desde el panel. */
  customIcon?: string;
}

/** Categoría de la ficha técnica flexible ("Agregar categoría" / "Agregar campo" en el panel). */
export interface FeatureGroup {
  title: string;
  titleEn?: string;
  icon: string;
  customIcon?: string;
  /** Control de visibilidad pública (ojito en el panel). Por defecto true. */
  visible?: boolean;
  items: FeatureItem[];
}

export interface Property {
  code: string;
  slug: string;
  title: string;
  type: PropertyType;
  operation: Operation;
  status: Status;
  /** false = borrador; no sale en la web. */
  published: boolean;
  exclusive: boolean;
  /** Precio en USD. En alquiler es la mensualidad. */
  price: number;
  /** "desde $X" (edificios y proyectos). */
  priceFrom?: boolean;
  country: "Ecuador";
  province: "Azuay";
  city: "Cuenca";
  /** Zona o parroquia. Nunca una dirección exacta. */
  zone: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  /** m² de construcción */
  areaBuilt?: number;
  /** m² de terreno */
  areaLand?: number;
  housing: Housing;
  featured: boolean;
  /** Uno de los 5 espacios del slider Hero. */
  slider: boolean;
  /** Avance de obra (0-100) si está en construcción o sobre planos. */
  progress?: number;
  delivery?: string;
  units?: Unit[];
  features: string[];
  summary: string;
  description: string[];
  photos: Photo[];
  /** Segundos de avance automático en la galería Expanding Flex Cards (0 = manual/pausado, 1..10s, por defecto 4s). */
  galleryAutoplaySeconds?: number;
  videoThumb?: string;
  videoUrl?: string;
  yearBuilt?: number;
  condition?: string;
  bathroomsNote?: string;
  featureGroups?: FeatureGroup[];
  faqs?: { q: string; a: string }[];
  createdAt: string;
  closedAt?: string;
}

export interface HeroSlide {
  id: string;
  order: number;
  propertyCode?: string;
  slug: string;
  image: string;
  operation: Operation;
  exclusive: boolean;
  price: string;
  title: Record<Lang, string>;
  zone: Record<Lang, string>;
  summary: Record<Lang, string>;
  active: boolean;
}
