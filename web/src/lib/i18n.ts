import type { Lang } from "./types";

export const LANGS: Lang[] = ["es", "en"];

export function isLang(x: string): x is Lang {
  return (LANGS as string[]).includes(x);
}

/**
 * Textos de la interfaz común (encabezado, pie, buscador).
 * El contenido de las páginas va en español en esta etapa; la versión en inglés
 * se completa después (PRD, "Idioma").
 */
const DICT = {
  es: {
    nav: {
      comprar: "Comprar",
      alquilar: "Alquilar",
      zonas: "Zonas",
      servicios: "Servicios",
      blog: "Blog",
      quienes: "Quiénes somos",
      contacto: "Contacto",
      favoritos: "Favoritos",
      faq: "Preguntas frecuentes",
    },
    tagline: "Cuenca • Miami",
    brand: "Inmobiliaria Constructora",
    visit: "Agendar una visita",
    menu: "Menú",
    close: "Cerrar",
    footer: {
      about: "Venta y alquiler de propiedades exclusivas y proyectos de construcción en Ecuador y Miami.",
      properties: "Propiedades",
      company: "Empresa",
      legal: "Legal",
      houses: "Casas en Cuenca",
      apartments: "Departamentos",
      land: "Terrenos",
      plans: "Proyectos sobre planos",
      exclusives: "Exclusivas RG",
      privacy: "Política de privacidad",
      terms: "Términos y condiciones",
      termsShort: "Términos",
      transparency: "Transparencia",
      rights: "RG Inmobiliaria y Constructora. Todos los derechos reservados.",
    },
  },
  en: {
    nav: {
      comprar: "Buy",
      alquilar: "Rent",
      zonas: "Areas",
      servicios: "Services",
      blog: "Blog",
      quienes: "About us",
      contacto: "Contact",
      favoritos: "Favorites",
      faq: "FAQ",
    },
    tagline: "Cuenca • Miami",
    brand: "Real Estate & Construction",
    visit: "Book a visit",
    menu: "Menu",
    close: "Close",
    footer: {
      about: "Sale and rental of exclusive properties and construction projects in Ecuador and Miami.",
      properties: "Properties",
      company: "Company",
      legal: "Legal",
      houses: "Houses in Cuenca",
      apartments: "Apartments",
      land: "Land",
      plans: "Off-plan projects",
      exclusives: "RG Exclusives",
      privacy: "Privacy policy",
      terms: "Terms and conditions",
      termsShort: "Terms",
      transparency: "Transparency",
      rights: "RG Inmobiliaria y Constructora. All rights reserved.",
    },
  },
} as const;

export type Dict = (typeof DICT)["es"];

export function t(lang: Lang): Dict {
  return DICT[lang] as Dict;
}
