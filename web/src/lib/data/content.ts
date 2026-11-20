import type { HeroSlide, Lang, Property } from "../types";

/**
 * Contenido del inicio. En el panel, módulo "Contenido web", el equipo lo cambia
 * (regla de oro: si el visitante lo ve, el equipo lo cambia desde el panel).
 */

export const HERO = {
  title: "Encuentra tu próximo hogar",
  subtitle: "Casas, departamentos y terrenos en Ecuador y Miami, con asesoría de principio a fin.",
  image: "/img/p/19.jpg",
};

export const HERO_COPY: Record<Lang, { title: string; subtitle: string }> = {
  es: {
    title: "Encuentra tu próximo hogar",
    subtitle: "Casas, departamentos y terrenos en Ecuador y Miami, con asesoría de principio a fin.",
  },
  en: {
    title: "Find your next home",
    subtitle: "Homes, apartments and land in Ecuador and Miami, with end-to-end legal and financial advisory.",
  },
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    order: 1,
    propertyCode: "CA-001",
    slug: "ca-001-casa-moderna-en-ricaurte",
    image: "/img/p/55.jpg",
    operation: "venta",
    exclusive: true,
    price: "$145.000",
    title: {
      es: "Casa moderna en Ricaurte",
      en: "Modern Home in Ricaurte",
    },
    zone: {
      es: "Cuenca · Ricaurte",
      en: "Cuenca · Ricaurte",
    },
    summary: {
      es: "Residencia unifamiliar con jardín privado, terraza panorámica, 3 habitaciones y acabados de primera.",
      en: "Single-family residence with private garden, panoramic terrace, 3 bedrooms and premium finishes.",
    },
    active: true,
  },
  {
    id: "slide-2",
    order: 2,
    propertyCode: "DP-014",
    slug: "dp-014-departamento-con-balcon-en-totoracocha",
    image: "/img/p/21.jpg",
    operation: "venta",
    exclusive: false,
    price: "$98.500",
    title: {
      es: "Departamento con balcón en Totoracocha",
      en: "Balcony Apartment in Totoracocha",
    },
    zone: {
      es: "Cuenca · Totoracocha",
      en: "Cuenca · Totoracocha",
    },
    summary: {
      es: "Amplio departamento de 3 habitaciones, 92 m², balcón soleado y parqueadero cubierto.",
      en: "Spacious 3-bedroom apartment, 92 m², sunlit balcony and covered parking.",
    },
    active: true,
  },
  {
    id: "slide-3",
    order: 3,
    propertyCode: "DP-021",
    slug: "dp-021-suite-amoblada-en-el-centro",
    image: "/img/p/28.jpg",
    operation: "alquiler",
    exclusive: true,
    price: "$450 / mes",
    title: {
      es: "Suite amoblada en El Centro",
      en: "Furnished Suite in Historic Center",
    },
    zone: {
      es: "Cuenca · El Centro Histórico",
      en: "Cuenca · Historic Center",
    },
    summary: {
      es: "Suite ejecutiva totalmente equipada de 48 m², lista para habitar en zona patrimonial.",
      en: "Fully equipped 48 m² executive suite, move-in ready in the heritage district.",
    },
    active: true,
  },
  {
    id: "slide-4",
    order: 4,
    propertyCode: "TE-007",
    slug: "te-007-terreno-con-vista-en-turi",
    image: "/img/p/29.jpg",
    operation: "venta",
    exclusive: false,
    price: "$62.000",
    title: {
      es: "Terreno con vista en Turi",
      en: "Scenic Lot in Turi",
    },
    zone: {
      es: "Cuenca · Turi",
      en: "Cuenca · Turi",
    },
    summary: {
      es: "Lote de 400 m² con vista abierta a la ciudad, servicios básicos listos y fácil acceso.",
      en: "400 m² residential lot with panoramic city views, utilities ready and easy access.",
    },
    active: true,
  },
  {
    id: "slide-5",
    order: 5,
    propertyCode: "ED-003",
    slug: "ed-003-edificio-mirador",
    image: "/img/p/30.jpg",
    operation: "venta",
    exclusive: true,
    price: "Desde $89.000",
    title: {
      es: "Edificio Mirador · El Batán",
      en: "Mirador Building · El Batán",
    },
    zone: {
      es: "Cuenca · El Batán",
      en: "Cuenca · El Batán",
    },
    summary: {
      es: "Proyecto boutique en construcción (60%), 4 unidades con terrazas y entrega estimada junio 2027.",
      en: "Boutique development under construction (60%), 4 units with terraces, est. delivery June 2027.",
    },
    active: true,
  },
];

/** Garantiza siempre exactamente 5 slides activos usando propiedades destacadas como respaldo automático. */
export function resolveHeroSlides(slides: HeroSlide[], catalog: Property[]): HeroSlide[] {
  const active = [...slides]
    .filter((s) => s.active)
    .sort((a, b) => a.order - b.order)
    .slice(0, 5);

  if (active.length >= 5) return active;

  const usedSlugs = new Set(active.map((s) => s.slug));
  const candidates = [
    ...catalog.filter((p) => p.featured),
    ...catalog.filter((p) => !p.featured),
  ];

  for (const p of candidates) {
    if (active.length >= 5) break;
    if (usedSlugs.has(p.slug)) continue;
    usedSlugs.add(p.slug);
    const formattedPrice = `${p.priceFrom ? "Desde " : ""}$${p.price.toLocaleString("es-EC")}${p.operation === "alquiler" ? " / mes" : ""}`;
    active.push({
      id: `fallback-${p.code}`,
      order: active.length + 1,
      propertyCode: p.code,
      slug: p.slug,
      image: p.photos[0]?.src ?? "/img/p/19.jpg",
      operation: p.operation,
      exclusive: p.exclusive,
      price: formattedPrice,
      title: { es: p.title, en: p.title },
      zone: { es: `${p.city} · ${p.zone}`, en: `${p.city} · ${p.zone}` },
      summary: { es: p.summary, en: p.summary },
      active: true,
    });
  }

  return active;
}

export const SERVICES = [
  {
    icon: "home",
    title: "Comprar",
    text: "Te guiamos para encontrar la propiedad ideal con asesoría legal, técnica y financiera personalizada.",
    href: "/propiedades?op=venta",
  },
  {
    icon: "key",
    title: "Alquilar",
    text: "Opciones verificadas y contratos claros para que disfrutes de tu nuevo espacio con tranquilidad.",
    href: "/propiedades?op=alquiler",
  },
  {
    icon: "handshake",
    title: "Vender o alquilar tu propiedad",
    text: "Valoración profesional, fotografía de alta calidad y gestión integral con compradores calificados.",
    href: "/vende-o-alquila",
  },
  {
    icon: "architecture",
    title: "Construir con nosotros",
    text: "Diseñamos y construimos proyectos a tu medida con altos estándares y garantía constructiva.",
    href: "/vende-o-alquila?interes=construir",
  },
];

/** Un solo componente de contador; el equipo puede agregar más. */
export const COUNTERS = [
  { prefix: "+", value: 120, label: "propiedades gestionadas" },
  { prefix: "+", value: 15, label: "años de experiencia" },
  { prefix: "", value: 4, label: "ciudades en Ecuador y Miami" },
  { prefix: "+", value: 300, label: "familias acompañadas" },
];

export const STEPS = [
  { title: "Cuéntanos qué buscas", text: "Escribe tus necesidades con IA o usa nuestros filtros por zona y presupuesto." },
  { title: "Te mostramos opciones", text: "Revisamos nuestro inventario verificado para presentarte opciones a tu medida." },
  { title: "Visitamos juntos", text: "Coordinamos un recorrido presencial en el horario que mejor te convenga." },
  { title: "Te ayudamos con el crédito", text: "Simulamos cuotas y te orientamos con BIESS, banca privada o financiamiento directo." },
  { title: "Cierras con tranquilidad", text: "Acompañamiento legal y notarial completo hasta la entrega de llaves." },
];

export const ABOUT = {
  kicker: "RG Inmobiliaria y Constructora",
  title: "Más que una inmobiliaria, tu aliado en cada etapa",
  text: "Con base en Cuenca, combinamos más de 15 años de experiencia en construcción y en compra, venta y alquiler de propiedades. Acompañamos a compradores, inversionistas y familias en Ecuador y Miami con un servicio serio, honesto y transparente.",
  bullets: ["Proyectos propios con garantía estructural", "Cartera exclusiva de propiedades seleccionadas", "Asesoría integral legal y tributaria"],
  badge: "Trayectoria y solidez en Cuenca",
  image: "/img/p/38.jpg",
  works: [
    { year: "2027", name: "Edificio Mirador", place: "El Batán", state: "En construcción" },
    { year: "2023", name: "Conjunto Los Álamos", place: "Yanuncay", state: "Entregado" },
    { year: "2021", name: "Casas Ricaurte", place: "Ricaurte", state: "Entregado" },
  ],
};

export const TESTIMONIALS = [
  {
    quote: "La asesoría para el crédito fue clave. Encontramos la casa en Ricaurte en dos semanas y el proceso notarial fue impecable.",
    name: "Carlos Sarmiento y familia",
    place: "Cuenca",
    photo: "/img/p/39.jpg",
  },
  {
    quote: "Buscaba invertir desde Estados Unidos y la claridad con la información de los proyectos me dio total confianza.",
    name: "Patricia Webster",
    place: "Miami / Cuenca",
    photo: "/img/p/40.jpg",
  },
  {
    quote: "Pusimos en venta nuestro departamento en Totoracocha y RG lo gestionó en tiempo récord con un comprador calificado.",
    name: "Esteban Mora",
    place: "Cuenca",
    photo: "/img/p/41.jpg",
  },
];

export const HOME_FAQS = [
  {
    q: "¿Puedo comprar una casa con crédito del BIESS?",
    a: "Sí, la mayoría de nuestras propiedades tienen la documentación al día y son aptas para crédito hipotecario con el BIESS, la banca privada o cooperativas. Te ayudamos con los requisitos y con la simulación de la cuota.",
  },
  {
    q: "¿Cuánto cuesta alquilar o vender con RG?",
    a: "Trabajamos con comisiones de mercado, acordadas de forma transparente desde el primer contrato. La valoración inicial de tu propiedad no tiene costo.",
  },
  {
    q: "¿Puedo comprar una propiedad si vivo en el exterior?",
    a: "Sí. Tenemos representación en Miami y te acompañamos a distancia con poderes consulares, revisión de documentos y transferencias bancarias seguras.",
  },
  {
    q: "¿Por qué no publican la dirección exacta de las propiedades?",
    a: "Para proteger la seguridad y la privacidad de los propietarios. Cuando coordinas la visita, tu asesor te comparte la dirección exacta.",
  },
  {
    q: "¿Qué diferencia a una propiedad Exclusiva RG?",
    a: "Son propiedades que solo encuentras con RG. Revisamos su documentación y sus acabados, y la negociación es directa con nosotros.",
  },
  {
    q: "¿Qué garantía ofrecen en sus proyectos de construcción?",
    a: "Nuestras obras tienen garantía sobre la estructura principal y garantías técnicas en instalaciones eléctricas y sanitarias, según la normativa ecuatoriana.",
  },
];

export const OWNER_BAND = {
  title: "¿Tienes una propiedad para vender o alquilar?",
  text: "Déjanos tus datos y un asesor de RG te contactará para una valoración sin compromiso.",
  cta: "Vende o alquila con nosotros",
};

export const OFFICE_HOURS = "Lunes a viernes, 9:00 a 18:00 · Sábados 9:00 a 13:00";
export const PHONE = "+593 7 284 0000";
export const WHATSAPP = "59372840000";

/** Ventana emergente (panel → Contenido web → Ventanas emergentes). Anuncia una propiedad o proyecto; nunca descuentos. */
export const POPUP = {
  code: "ED-003",
  kicker: "Nueva Exclusiva RG",
  subtitle: "Suites y departamentos",
  image: "/img/p/73.jpg",
  text: "Un edificio boutique en El Batán, con terrazas privadas, acabados en piedra local y vista abierta al valle de Cuenca.",
};

/* ============================================================================
 * CONSTRUCTOR MODULAR DE SECCIONES DE PORTADA (B1 · Bloques Web ES/EN)
 * ========================================================================== */

export const SITE_SECTIONS_STORAGE_KEY = "rg_site_sections_v1";

export type SiteSectionType =
  | "services_grid"
  | "steps_timeline"
  | "cta_banner"
  | "editorial_split";

export interface ServiceCardItem {
  id: string;
  icon: string;
  customIcon?: string;
  titleEs: string;
  titleEn: string;
  textEs: string;
  textEn: string;
  linkLabelEs: string;
  linkLabelEn: string;
  actionType: "venta" | "alquiler" | "captacion" | "construir" | "visita" | "zonas" | "custom";
  href: string;
}

export interface StepTimelineItem {
  id: string;
  titleEs: string;
  titleEn: string;
  textEs: string;
  textEn: string;
  highlight?: boolean;
}

export interface EditorialBulletItem {
  id: string;
  textEs: string;
  textEn: string;
}

export interface TeamMemberItem {
  id: string;
  name: string;
  roleEs: string;
  roleEn: string;
  experienceEs: string;
  experienceEn: string;
  bioEs: string;
  bioEn: string;
  photo?: string;
  archColor?: string;
  isDirector?: boolean;
  visible: boolean;
}

export const TEAM_ARCH_PALETTE: { hex: string; label: string }[] = [
  { hex: "#242424", label: "Carbón Fundador" },
  { hex: "#F5F3EE", label: "Arena" },
  { hex: "#D5CFC4", label: "Piedra cálida" },
  { hex: "#E6DFD3", label: "Marfil" },
  { hex: "#C8BEB0", label: "Topo" },
  { hex: "#EAD8D3", label: "Terracota suave" },
];

export function isDarkHexColor(hex?: string): boolean {
  const clean = (hex || "").trim().replace("#", "");
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;
  // Luminancia relativa sRGB simplificada (umbral WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.52;
}

export interface AboutParagraphItem {
  id: string;
  titleEs: string;
  titleEn: string;
  bodyEs: string;
  bodyEn: string;
  visible: boolean;
}

export interface AboutInstitutionalData {
  missionEs: string;
  missionEn: string;
  missionVisible: boolean;
  visionEs: string;
  visionEn: string;
  visionVisible: boolean;
  extraParagraphs: AboutParagraphItem[];
  team: TeamMemberItem[];
}

export interface SiteSectionBlock {
  id: string;
  type: SiteSectionType;
  visible: boolean;
  titleEs: string;
  titleEn: string;
  subtitleEs?: string;
  subtitleEn?: string;
  // Para "services_grid"
  columns?: 2 | 3 | 4;
  cards?: ServiceCardItem[];
  // Para "steps_timeline"
  steps?: StepTimelineItem[];
  // Para "cta_banner" y "editorial_split"
  kickerEs?: string;
  kickerEn?: string;
  badgeEs?: string;
  badgeEn?: string;
  bodyEs?: string;
  bodyEn?: string;
  ctaLabelEs?: string;
  ctaLabelEn?: string;
  ctaHref?: string;
  image?: string;
  bullets?: EditorialBulletItem[];
  aboutData?: AboutInstitutionalData;
}

export const SECTION_ICON_LIBRARY: { id: string; label: string }[] = [
  { id: "home", label: "Casa / Comprar" },
  { id: "key", label: "Llave / Alquilar" },
  { id: "handshake", label: "Alianza / Captación" },
  { id: "architecture", label: "Arquitectura / Construir" },
  { id: "verified_user", label: "Garantía / Seguridad" },
  { id: "account_balance", label: "Crédito / Financiamiento" },
  { id: "apartment", label: "Edificio / Proyecto" },
  { id: "real_estate_agent", label: "Asesoría Inmobiliaria" },
  { id: "gavel", label: "Gestión Legal / Notarial" },
  { id: "calculate", label: "Avalúo / Simulación" },
  { id: "support_agent", label: "Atención Personalizada" },
  { id: "public", label: "Inversión Exterior / Miami" },
];

export const SERVICE_ACTION_PRESETS: {
  id: ServiceCardItem["actionType"];
  label: string;
  defaultHref: string;
}[] = [
  { id: "venta", label: "Filtrar propiedades en venta (/propiedades?op=venta)", defaultHref: "/propiedades?op=venta" },
  { id: "alquiler", label: "Filtrar propiedades en alquiler (/propiedades?op=alquiler)", defaultHref: "/propiedades?op=alquiler" },
  { id: "captacion", label: "Captación: Vender o alquilar (/vende-o-alquila)", defaultHref: "/vende-o-alquila" },
  { id: "construir", label: "Construir con nosotros (/vende-o-alquila?interes=construir)", defaultHref: "/vende-o-alquila?interes=construir" },
  { id: "visita", label: "Abrir modal de Agendar Visita (#agendar-visita)", defaultHref: "#agendar-visita" },
  { id: "zonas", label: "Ancla interna: Explora por zonas (#zonas)", defaultHref: "#zonas" },
  { id: "custom", label: "Ruta interna o enlace personalizado", defaultHref: "/propiedades" },
];

export const DEFAULT_ABOUT_INSTITUTIONAL: AboutInstitutionalData = {
  missionEs:
    "Acompañar a familias e inversionistas en Cuenca y Miami con asesoría inmobiliaria, financiera y constructiva transparente, garantizando seguridad jurídica y calidad arquitectónica en cada proyecto.",
  missionEn:
    "Guide families and investors in Cuenca and Miami with transparent real estate, financial, and construction advisory, ensuring legal certainty and architectural quality in every project.",
  missionVisible: true,
  visionEs:
    "Consolidarnos como la firma inmobiliaria y constructora referente del Austro ecuatoriano con proyección internacional, reconocida por su solidez técnica, ética comercial y confianza patrimonial.",
  visionEn:
    "Establish ourselves as the leading real estate and construction firm in southern Ecuador with international reach, recognized for technical excellence, commercial ethics, and asset trust.",
  visionVisible: true,
  extraParagraphs: [],
  team: [
    {
      id: "team-1",
      name: "Ec. Raúl García",
      roleEs: "Fundador & Gerente General",
      roleEn: "Founder & General Manager",
      experienceEs: "+15 años · Dirección & Estructuración",
      experienceEn: "15+ years · Leadership & Structuring",
      bioEs:
        "+15 años liderando desarrollo inmobiliario, estructuración financiera y proyectos constructivos en Cuenca y Miami.",
      bioEn:
        "15+ years leading real estate development, financial structuring, and construction projects in Cuenca and Miami.",
      photo: "/images/team/raul-garcia.png",
      archColor: "#242424",
      isDirector: true,
      visible: true,
    },
    {
      id: "team-2",
      name: "Arq. Valeria Andrade",
      roleEs: "Directora de Arquitectura y Obra",
      roleEn: "Director of Architecture & Construction",
      experienceEs: "11 años · Diseño & Control Técnico",
      experienceEn: "11 years · Design & Technical Control",
      bioEs:
        "11 años diseñando viviendas contemporáneas, control estructural y acabados de alta gama en Azuay.",
      bioEn:
        "11 years designing contemporary homes, structural supervision, and high-end finishes across Azuay.",
      photo: "/images/team/valeria-andrade.png",
      archColor: "#F5F3EE",
      isDirector: false,
      visible: true,
    },
    {
      id: "team-3",
      name: "Ing. Sebastián Cordero",
      roleEs: "Asesor Senior de Inversiones & Miami",
      roleEn: "Senior Investment & Miami Advisor",
      experienceEs: "9 años · Inversión Patrimonial",
      experienceEn: "9 years · Wealth & Asset Advisory",
      bioEs:
        "9 años asesorando a familias e inversionistas ecuatorianos en compra patrimonial y rentabilidad en dólares.",
      bioEn:
        "9 years advising Ecuadorian families and investors on asset acquisition and dollar-denominated returns.",
      photo: "/images/team/sebastian-cordero.png",
      archColor: "#D5CFC4",
      isDirector: false,
      visible: true,
    },
    {
      id: "team-4",
      name: "Abg. Camila Villavicencio",
      roleEs: "Coordinadora Legal & Crédito VIP / BIESS",
      roleEn: "Legal & VIP / BIESS Credit Coordinator",
      experienceEs: "8 años · Titulación & Hipotecas",
      experienceEn: "8 years · Deeds & Mortgages",
      bioEs:
        "8 años gestionando escrituración, estudios de títulos y aprobación ágil de créditos hipotecarios.",
      bioEn:
        "8 years managing property deeds, title due diligence, and streamlined mortgage approvals.",
      photo: "/images/team/camila-villavicencio.png",
      archColor: "#E6DFD3",
      isDirector: false,
      visible: true,
    },
    {
      id: "team-5",
      name: "Arq. Mateo Benítez",
      roleEs: "Asesor Comercial de Proyectos & Casas",
      roleEn: "Commercial Advisor for Projects & Homes",
      experienceEs: "7 años · Vivienda Residencial",
      experienceEn: "7 years · Residential Sales",
      bioEs:
        "7 años acompañando a compradores en selección de vivienda residencial y recorridos técnicos.",
      bioEn:
        "7 years guiding buyers through residential home selection and technical property tours.",
      photo: "/images/team/mateo-benitez.png",
      archColor: "#CFC7BA",
      isDirector: false,
      visible: true,
    },
    {
      id: "team-6",
      name: "Ing. Daniela Ortiz",
      roleEs: "Asesora de Alquileres & Gestión Patrimonial",
      roleEn: "Rentals & Asset Management Advisor",
      experienceEs: "6 años · Alquileres & Administración",
      experienceEn: "6 years · Rentals & Management",
      bioEs:
        "6 años conectando propietarios verificados con inquilinos calificados y administración integral.",
      bioEn:
        "6 years connecting verified owners with qualified tenants and full property management.",
      photo: "/images/team/daniela-ortiz.png",
      archColor: "#F5F3EE",
      isDirector: false,
      visible: true,
    },
  ],
};

export function cloneDefaultAboutInstitutional(): AboutInstitutionalData {
  return JSON.parse(JSON.stringify(DEFAULT_ABOUT_INSTITUTIONAL)) as AboutInstitutionalData;
}

export function ensureAboutData(sec?: SiteSectionBlock): AboutInstitutionalData {
  const base = cloneDefaultAboutInstitutional();
  const raw = sec?.aboutData;
  if (!raw) return base;
  const legacySet = new Set([
    "/img/p/39.jpg",
    "/img/p/40.jpg",
    "/img/p/41.jpg",
    "/img/p/42.jpg",
    "/img/p/43.jpg",
    "/img/p/44.jpg",
  ]);
  const rawTeam = Array.isArray(raw.team) && raw.team.length > 0 ? raw.team : base.team;
  const upgradedTeam = rawTeam.map((m, idx) => {
    const baseMatch = base.team.find((b) => b.id === m.id) ?? base.team[idx % base.team.length];
    const shouldUpgradePhoto = !m.photo || legacySet.has(m.photo);
    return {
      ...m,
      photo: shouldUpgradePhoto ? baseMatch.photo : m.photo,
      archColor:
        m.archColor ||
        (m.isDirector ? "#242424" : baseMatch?.archColor ?? TEAM_ARCH_PALETTE[(idx + 1) % TEAM_ARCH_PALETTE.length].hex),
    };
  });
  return {
    missionEs: raw.missionEs ?? base.missionEs,
    missionEn: raw.missionEn ?? base.missionEn,
    missionVisible: raw.missionVisible !== false,
    visionEs: raw.visionEs ?? base.visionEs,
    visionEn: raw.visionEn ?? base.visionEn,
    visionVisible: raw.visionVisible !== false,
    extraParagraphs: Array.isArray(raw.extraParagraphs) ? raw.extraParagraphs : [],
    team: upgradedTeam,
  };
}

export const DEFAULT_SITE_SECTIONS: SiteSectionBlock[] = [
  {
    id: "sec-services",
    type: "services_grid",
    visible: true,
    titleEs: "¿Cómo podemos ayudarte?",
    titleEn: "How can we help you?",
    subtitleEs: "Soluciones inmobiliarias y constructivas integrales en Cuenca y Miami",
    subtitleEn: "Comprehensive real estate and construction solutions in Cuenca and Miami",
    columns: 4,
    cards: [
      {
        id: "srv-1",
        icon: "home",
        titleEs: "Comprar",
        titleEn: "Buy a property",
        textEs: "Te guiamos para encontrar la propiedad ideal con asesoría legal, técnica y financiera personalizada.",
        textEn: "We guide you to find the ideal property with personalized legal, technical, and financial advisory.",
        linkLabelEs: "Conocer más",
        linkLabelEn: "Learn more",
        actionType: "venta",
        href: "/propiedades?op=venta",
      },
      {
        id: "srv-2",
        icon: "key",
        titleEs: "Alquilar",
        titleEn: "Rent a property",
        textEs: "Opciones verificadas y contratos claros para que disfrutes de tu nuevo espacio con tranquilidad.",
        textEn: "Verified options and clear contracts so you can enjoy your new space with peace of mind.",
        linkLabelEs: "Conocer más",
        linkLabelEn: "Learn more",
        actionType: "alquiler",
        href: "/propiedades?op=alquiler",
      },
      {
        id: "srv-3",
        icon: "handshake",
        titleEs: "Vender o alquilar tu propiedad",
        titleEn: "Sell or rent your property",
        textEs: "Valoración profesional, fotografía de alta calidad y gestión integral con compradores calificados.",
        textEn: "Professional valuation, high-quality photography, and end-to-end management with qualified buyers.",
        linkLabelEs: "Conocer más",
        linkLabelEn: "Learn more",
        actionType: "captacion",
        href: "/vende-o-alquila",
      },
      {
        id: "srv-4",
        icon: "architecture",
        titleEs: "Construir con nosotros",
        titleEn: "Build with us",
        textEs: "Diseñamos y construimos proyectos a tu medida con altos estándares y garantía constructiva.",
        textEn: "We design and build custom projects to the highest standards with structural warranty.",
        linkLabelEs: "Conocer más",
        linkLabelEn: "Learn more",
        actionType: "construir",
        href: "/vende-o-alquila?interes=construir",
      },
    ],
  },
  {
    id: "sec-steps",
    type: "steps_timeline",
    visible: true,
    titleEs: "Tu próximo hogar, paso a paso",
    titleEn: "Your next home, step by step",
    subtitleEs: "Un proceso claro, acompañado por especialistas desde la búsqueda hasta la entrega de llaves",
    subtitleEn: "A clear process guided by specialists from search to key handover",
    steps: [
      {
        id: "step-1",
        titleEs: "Cuéntanos qué buscas",
        titleEn: "Tell us what you need",
        textEs: "Escribe tus necesidades con IA o usa nuestros filtros por zona y presupuesto.",
        textEn: "Describe your needs with AI or use our filters by zone and budget.",
        highlight: false,
      },
      {
        id: "step-2",
        titleEs: "Te mostramos opciones",
        titleEn: "We curate options",
        textEs: "Revisamos nuestro inventario verificado para presentarte opciones a tu medida.",
        textEn: "We review our verified inventory to present tailored options for you.",
        highlight: false,
      },
      {
        id: "step-3",
        titleEs: "Visitamos juntos",
        titleEn: "We visit together",
        textEs: "Coordinamos un recorrido presencial en el horario que mejor te convenga.",
        textEn: "We schedule an in-person or video tour at your preferred time.",
        highlight: false,
      },
      {
        id: "step-4",
        titleEs: "Te ayudamos con el crédito",
        titleEn: "We assist with financing",
        textEs: "Simulamos cuotas y te orientamos con BIESS, banca privada o financiamiento directo.",
        textEn: "We simulate monthly payments and guide you with BIESS, private banks, or direct financing.",
        highlight: false,
      },
      {
        id: "step-5",
        titleEs: "Cierras con tranquilidad",
        titleEn: "Close with peace of mind",
        textEs: "Acompañamiento legal y notarial completo hasta la entrega de llaves.",
        textEn: "Full legal and notarial support all the way to key delivery.",
        highlight: false,
      },
    ],
  },
  {
    id: "sec-editorial-about",
    type: "editorial_split",
    visible: true,
    kickerEs: ABOUT.kicker,
    kickerEn: "RG Real Estate & Construction",
    titleEs: ABOUT.title,
    titleEn: "More than a real estate agency, your partner at every stage",
    bodyEs: ABOUT.text,
    bodyEn:
      "Based in Cuenca, we combine over 15 years of experience in construction and property buying, selling, and renting. We support buyers, investors, and families in Ecuador and Miami with transparent, reliable service.",
    badgeEs: ABOUT.badge,
    badgeEn: "Proven track record in Cuenca",
    image: ABOUT.image,
    ctaLabelEs: "Conversar con el equipo",
    ctaLabelEn: "Talk to our team",
    ctaHref: "/vende-o-alquila",
    bullets: [
      {
        id: "bul-1",
        textEs: "Proyectos propios con garantía estructural",
        textEn: "In-house developments with structural warranty",
      },
      {
        id: "bul-2",
        textEs: "Cartera exclusiva de propiedades seleccionadas",
        textEn: "Exclusive portfolio of curated properties",
      },
      {
        id: "bul-3",
        textEs: "Asesoría integral legal y tributaria",
        textEn: "Comprehensive legal and tax advisory",
      },
    ],
    aboutData: DEFAULT_ABOUT_INSTITUTIONAL,
  },
  {
    id: "sec-cta-owner",
    type: "cta_banner",
    visible: true,
    titleEs: OWNER_BAND.title,
    titleEn: "Do you have a property to sell or rent?",
    subtitleEs: OWNER_BAND.text,
    subtitleEn: "Leave us your details and an RG advisor will contact you for a no-obligation valuation.",
    ctaLabelEs: OWNER_BAND.cta,
    ctaLabelEn: "Sell or rent with us",
    ctaHref: "/vende-o-alquila",
    image: "",
  },
];

export function cloneDefaultSiteSections(): SiteSectionBlock[] {
  return JSON.parse(JSON.stringify(DEFAULT_SITE_SECTIONS)) as SiteSectionBlock[];
}

export function loadSiteSections(): SiteSectionBlock[] {
  if (typeof window === "undefined") return cloneDefaultSiteSections();
  try {
    const raw = localStorage.getItem(SITE_SECTIONS_STORAGE_KEY);
    if (!raw) return cloneDefaultSiteSections();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return (parsed as SiteSectionBlock[]).map((sec) => {
        if (sec.id === "sec-editorial-about") {
          return { ...sec, aboutData: ensureAboutData(sec) };
        }
        if (sec.type === "steps_timeline" && Array.isArray(sec.steps)) {
          return {
            ...sec,
            steps: sec.steps.map((st) => ({ ...st, highlight: false })),
          };
        }
        return sec;
      });
    }
    return cloneDefaultSiteSections();
  } catch {
    return cloneDefaultSiteSections();
  }
}

export function getDefaultAboutSection(): SiteSectionBlock {
  const found = cloneDefaultSiteSections().find((s) => s.id === "sec-editorial-about");
  return found ?? {
    id: "sec-editorial-about",
    type: "editorial_split",
    visible: true,
    kickerEs: ABOUT.kicker,
    kickerEn: "RG Real Estate & Construction",
    titleEs: ABOUT.title,
    titleEn: "More than a real estate agency, your partner at every stage",
    bodyEs: ABOUT.text,
    bodyEn:
      "Based in Cuenca, we combine over 15 years of experience in construction and property buying, selling, and renting. We support buyers, investors, and families in Ecuador and Miami with transparent, reliable service.",
    badgeEs: ABOUT.badge,
    badgeEn: "Proven track record in Cuenca",
    image: ABOUT.image,
    ctaLabelEs: "Conversar con el equipo",
    ctaLabelEn: "Talk to our team",
    ctaHref: "/vende-o-alquila",
    bullets: [],
    aboutData: cloneDefaultAboutInstitutional(),
  };
}

export function saveSiteSections(sections: SiteSectionBlock[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SITE_SECTIONS_STORAGE_KEY, JSON.stringify(sections));
    window.dispatchEvent(new Event("rg-panel-updated"));
  } catch {
    /* ignore quota errors */
  }
}
