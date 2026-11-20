import type { Lang } from "@/lib/types";

export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: string;
}

export interface BlogPost {
  slug: string;
  category: "inversion" | "arquitectura" | "credito" | "zonas";
  categoryLabel: Record<Lang, string>;
  tagLabel: Record<Lang, string>;
  date: Record<Lang, string>;
  readTime: Record<Lang, string>;
  author: string;
  authorInitials: string;
  authorRole: Record<Lang, string>;
  image: string;
  featured?: boolean;
  highlightStat?: { label: Record<Lang, string>; value: Record<Lang, string> };
  title: Record<Lang, string>;
  excerpt: Record<Lang, string>;
  sections: Record<Lang, BlogSection[]>;
}

export const BLOG_CATEGORIES: { id: "all" | BlogPost["category"]; label: Record<Lang, string> }[] = [
  { id: "all", label: { es: "Todos", en: "All" } },
  { id: "inversion", label: { es: "Inversión & Mercado", en: "Investment & Market" } },
  { id: "arquitectura", label: { es: "Arquitectura & Obras", en: "Architecture & Build" } },
  { id: "credito", label: { es: "Guías de Compra & Crédito VIP", en: "Buying Guides & VIP Credit" } },
  { id: "zonas", label: { es: "Vida en Cuenca", en: "Life in Cuenca" } },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "guia-credito-hipotecario-vip-cuenca-2026",
    category: "credito",
    categoryLabel: { es: "Guías de Compra & Crédito VIP", en: "Buying Guides & VIP Credit" },
    tagLabel: { es: "Tasa 4.99%", en: "4.99% Rate" },
    date: { es: "12 de Noviembre, 2026", en: "November 12, 2026" },
    readTime: { es: "6 min de lectura", en: "6 min read" },
    author: "Ec. Raúl García",
    authorInitials: "RG",
    authorRole: { es: "Director General · Super admin", en: "Managing Director · Super admin" },
    image: "/img/p/01.jpg",
    featured: true,
    highlightStat: {
      label: { es: "Ahorro financiero proyectado", en: "Projected interest savings" },
      value: { es: "Hasta 38% en intereses", en: "Up to 38% in interest" },
    },
    title: {
      es: "Guía completa 2026: Cómo acceder al crédito hipotecario VIP del 4.99% para viviendas en Cuenca",
      en: "Complete 2026 Guide: How to qualify for Ecuador's 4.99% VIP mortgage in Cuenca",
    },
    excerpt: {
      es: "Desglosamos los requisitos actualizados, topes de avalúo, entidades financieras participantes y el impacto de la tasa preferencial en tu cuota mensual frente al crédito tradicional.",
      en: "We break down updated requirements, appraisal caps, participating banks, and how the preferential rate impacts your monthly payment vs. standard loans.",
    },
    sections: {
      es: [
        {
          heading: "¿Qué es el Crédito VIP y por qué transforma el acceso a vivienda en Cuenca?",
          paragraphs: [
            "El programa de Vivienda de Interés Público (Crédito VIP) es un mecanismo respaldado por el Estado ecuatoriano junto a entidades financieras calificadas como Banco Pichincha, Mutualista Azuay, Banco del Austro y cooperativas autorizadas.",
            "Permite acceder a una tasa fija anual preferencial del 4.99% durante todo el plazo del crédito, reduciendo la cuota mensual frente a hipotecas convencionales del 8.5% al 9.5%.",
          ],
          bullets: [
            "Tasa preferencial fija del 4.99% anual hasta 20 o 25 años plazo.",
            "Entrada mínima desde el 5% al 10% del valor comercial.",
            "Aplica para primera y única vivienda nueva registrada a nombre del solicitante.",
          ],
        },
        {
          heading: "Requisitos documentales y precalificación en RG",
          paragraphs: [
            "Antes de reservar, nuestro equipo legal y financiero verifica que la unidad elegida cuente con código de calificación VIP vigente y propiedad horizontal inscrita.",
            "Si resides en el exterior (Miami, New York o New Jersey), puedes iniciar la precalificación con historial de ingresos apostillado y designar un apoderado en Cuenca.",
          ],
          callout:
            "Las simulaciones referenciales no constituyen aprobación bancaria; cada carpeta es evaluada por la entidad financiera elegida según tu perfil crediticio.",
        },
      ],
      en: [
        {
          heading: "What is the VIP Mortgage and why does it matter in Cuenca?",
          paragraphs: [
            "The Public Interest Housing program (Crédito VIP) is backed by Ecuadorian housing policy through participating financial institutions such as Banco Pichincha, Mutualista Azuay, and Banco del Austro.",
            "It offers a fixed 4.99% annual rate over 20–25 years, substantially lowering monthly payments compared to standard 8.5%–9.5% commercial mortgages.",
          ],
          bullets: [
            "Fixed 4.99% annual preferential rate for up to 20 or 25 years.",
            "Down payment starting from 5% to 10% of the commercial price.",
            "Applies to a buyer's first and sole new residential property in Ecuador.",
          ],
        },
        {
          heading: "Documentation and pre-qualification with RG",
          paragraphs: [
            "Before reserving a unit, our legal team verifies active VIP project qualification and registered horizontal property deeds.",
            "Buyers living abroad (Miami, New York, New Jersey) can start pre-qualification with apostilled income records and a local power of attorney.",
          ],
          callout:
            "Reference simulations do not guarantee loan approval; final terms are evaluated by the chosen financial institution.",
        },
      ],
    },
  },
  {
    slug: "diseno-bioclimatico-desarrollos-el-batan",
    category: "arquitectura",
    categoryLabel: { es: "Arquitectura & Obras", en: "Architecture & Build" },
    tagLabel: { es: "El Batán", en: "El Batán" },
    date: { es: "08 Nov, 2026", en: "Nov 08, 2026" },
    readTime: { es: "4 min lectura", en: "4 min read" },
    author: "Arq. Mateo Vega",
    authorInitials: "MV",
    authorRole: { es: "Arquitecto de Diseño", en: "Design Architect" },
    image: "/img/p/04.jpg",
    title: {
      es: "Tendencias de diseño bioclimático en los nuevos desarrollos residenciales de El Batán",
      en: "Bioclimatic design trends in El Batán's newest residential developments",
    },
    excerpt: {
      es: "Aprovechamiento térmico pasivo, ventilación cruzada y orientación solar: cómo optimizar el confort sin recurrir a climatización artificial en el valle de Cuenca.",
      en: "Passive thermal gain, cross-ventilation, and solar orientation: optimizing indoor comfort in Cuenca's valley without artificial HVAC.",
    },
    sections: {
      es: [
        {
          heading: "Orientación solar y confort térmico andino",
          paragraphs: [
            "A 2.550 metros sobre el nivel del mar, Cuenca combina mañanas soleadas con noches frescas. Ubicar dormitorios y áreas sociales hacia el este-oeste permite capturar radiación solar controlada durante la tarde.",
            "En nuestros proyectos incorporamos ventanería con ruptura de puente térmico y doble vidrio hermético para conservar el calor interior y aislar el ruido urbano.",
          ],
        },
      ],
      en: [
        {
          heading: "Solar orientation and Andean thermal comfort",
          paragraphs: [
            "At 2,550 meters above sea level, Cuenca blends bright mornings with crisp nights. Orienting living areas to capture afternoon sun reduces heating needs naturally.",
            "Our builds integrate double-glazed thermal break windows to retain indoor warmth and attenuate street noise.",
          ],
        },
      ],
    },
  },
  {
    slug: "plusvalia-terrenos-turi-challuabamba",
    category: "inversion",
    categoryLabel: { es: "Inversión & Mercado", en: "Investment & Market" },
    tagLabel: { es: "Inversión", en: "Investment" },
    date: { es: "03 Nov, 2026", en: "Nov 03, 2026" },
    readTime: { es: "7 min lectura", en: "7 min read" },
    author: "Ec. Carla Palacios",
    authorInitials: "EC",
    authorRole: { es: "Analista de Mercado", en: "Market Analyst" },
    image: "/img/p/07.jpg",
    title: {
      es: "Plusvalía en el Austro: ¿Por qué invertir en terrenos con vista en Turi y Challuabamba?",
      en: "Appreciation in Southern Ecuador: Why invest in view lots in Turi and Challuabamba?",
    },
    excerpt: {
      es: "Evaluamos el retorno anual histórico, la expansión de servicios básicos y el perfil de compradores que consolidan estas dos zonas de alta demanda.",
      en: "Evaluating historical appreciation, utility expansion, and buyer demand shaping these two premier Cuenca sectors.",
    },
    sections: {
      es: [
        {
          heading: "Dos perfiles de valorización complementarios",
          paragraphs: [
            "Turi ofrece vistas panorámicas hacia el valle y cercanía inmediata al centro urbano, mientras Challuabamba destaca por su microclima más cálido y urbanizaciones cerradas de baja densidad.",
            "Antes de adquirir un lote, siempre validamos el Informe de Regulación Metropolitana (IRM), retiros obligatorios y factibilidad real de agua potable y alcantarillado.",
          ],
        },
      ],
      en: [
        {
          heading: "Two complementary appreciation profiles",
          paragraphs: [
            "Turi offers sweeping city views just minutes from downtown, while Challuabamba features a milder microclimate and low-density gated communities.",
            "Before acquiring any parcel, we verify municipal zoning (IRM), setbacks, and certified water/sewer connections.",
          ],
        },
      ],
    },
  },
  {
    slug: "comprar-sobre-planos-sin-riesgos-legales",
    category: "credito",
    categoryLabel: { es: "Guías de Compra & Crédito VIP", en: "Buying Guides & VIP Credit" },
    tagLabel: { es: "Legal & Fideicomisos", en: "Legal & Trusts" },
    date: { es: "27 Oct, 2026", en: "Oct 27, 2026" },
    readTime: { es: "5 min lectura", en: "5 min read" },
    author: "Abg. Diego Rivas",
    authorInitials: "DR",
    authorRole: { es: "Asesor Jurídico", en: "Legal Counsel" },
    image: "/img/p/10.jpg",
    title: {
      es: "Paso a paso para comprar sobre planos sin riesgos legales ni constructivos",
      en: "Step-by-step guide to buying pre-construction safely in Cuenca",
    },
    excerpt: {
      es: "Claves para auditar permisos municipales, garantías de cumplimiento y cronogramas de desembolso antes de firmar tu promesa de compraventa.",
      en: "Key checkpoints for auditing municipal permits, completion guarantees, and payment milestones before signing.",
    },
    sections: {
      es: [
        {
          heading: "Documentos que debes exigir antes de reservar",
          paragraphs: [
            "Toda preventa responsable debe mostrar permiso de construcción aprobado, memoria estructural, certificado de gravámenes limpio del terreno matriz y cronograma de obra verificable.",
            "En RG Constructora los avances físicos se publican mensualmente con registro fotográfico para total tranquilidad del comprador.",
          ],
        },
      ],
      en: [
        {
          heading: "Documents to verify before placing a reservation",
          paragraphs: [
            "Responsible pre-sales require approved municipal building permits, structural engineering sign-off, a clean title certificate on the parent lot, and a transparent build schedule.",
            "At RG Constructora we publish monthly physical progress updates with verified site photos.",
          ],
        },
      ],
    },
  },
  {
    slug: "ricaurte-vs-machangara-comparativa-zonas",
    category: "zonas",
    categoryLabel: { es: "Vida en Cuenca", en: "Life in Cuenca" },
    tagLabel: { es: "Análisis de Zonas", en: "Zone Analysis" },
    date: { es: "21 Oct, 2026", en: "Oct 21, 2026" },
    readTime: { es: "6 min lectura", en: "6 min read" },
    author: "Equipo de Análisis RG",
    authorInitials: "RG",
    authorRole: { es: "Investigación Urbana", en: "Urban Research" },
    image: "/img/p/12.jpg",
    title: {
      es: "Ricaurte vs. Machángara: Comparativa de conectividad y valor por metro cuadrado",
      en: "Ricaurte vs. Machángara: Connectivity and price per square meter compared",
    },
    excerpt: {
      es: "Analizamos tiempos de traslado hacia el Centro Histórico, equipamiento comercial, perfil acústico y proyecciones de valor para los próximos 36 meses.",
      en: "Comparing commute times to the Historic Center, retail access, quietness, and 36-month value projections.",
    },
    sections: {
      es: [
        {
          heading: "Conectividad norte y crecimiento residencial",
          paragraphs: [
            "Ambos sectores concentran una oferta dinámica de casas adosadas y departamentos familiares con acceso rápido a parques industriales, colegios y vías arteriales.",
            "La elección depende de si priorizas la cercanía inmediata al Parque Miraflores y Av. González Suárez o lotes ligeramente más amplios hacia Ricaurte.",
          ],
        },
      ],
      en: [
        {
          heading: "Northern connectivity and residential growth",
          paragraphs: [
            "Both neighborhoods concentrate modern townhomes and family apartments with quick access to schools and main avenues.",
            "Your choice comes down to prioritizing proximity to Miraflores Park or slightly larger residential lots toward Ricaurte.",
          ],
        },
      ],
    },
  },
  {
    slug: "materiales-nobles-estandar-constructivo-rg",
    category: "arquitectura",
    categoryLabel: { es: "Arquitectura & Obras", en: "Architecture & Build" },
    tagLabel: { es: "Ingeniería & Calidad", en: "Engineering & Quality" },
    date: { es: "15 Oct, 2026", en: "Oct 15, 2026" },
    readTime: { es: "8 min lectura", en: "8 min read" },
    author: "Ing. Jorge Alvarado",
    authorInitials: "JA",
    authorRole: { es: "Ingeniero Residente", en: "Lead Civil Engineer" },
    image: "/img/p/15.jpg",
    title: {
      es: "Materiales nobles y eficiencia térmica: El estándar constructivo de RG",
      en: "Noble materials and thermal efficiency: The RG construction standard",
    },
    excerpt: {
      es: "Piedra andesita local, ventanería con doble vidrio hermético y carpintería en maderas certificadas: la combinación que asegura valor residual y confort acústico.",
      en: "Local andesite stone, sealed double-pane glazing, and certified woodwork designed for lasting value and acoustic comfort.",
    },
    sections: {
      es: [
        {
          heading: "Construcción sismorresistente bajo norma NEC",
          paragraphs: [
            "Cada estructura ejecutada por RG cumple la Norma Ecuatoriana de la Construcción vigente, con ensayos de cilindros de hormigón y control estricto de acero de refuerzo.",
            "Los acabados se seleccionan para envejecer con elegancia y requerir bajo mantenimiento a largo plazo.",
          ],
        },
      ],
      en: [
        {
          heading: "Seismic-resistant construction under NEC standards",
          paragraphs: [
            "Every RG structure adheres to Ecuador's national building code (NEC), with certified concrete cylinder testing and rebar inspection.",
            "Finishes are chosen for timeless durability and low long-term maintenance.",
          ],
        },
      ],
    },
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
