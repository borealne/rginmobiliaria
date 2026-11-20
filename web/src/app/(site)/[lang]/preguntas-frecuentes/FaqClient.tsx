"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import type { Lang } from "@/lib/types";

type FaqCategory = "all" | "credito" | "compra" | "obra" | "alquiler" | "propietarios";

interface FaqItem {
  category: Exclude<FaqCategory, "all">;
  q: Record<Lang, string>;
  a: Record<Lang, string>;
}

const CATEGORIES: { id: FaqCategory; label: Record<Lang, string> }[] = [
  { id: "all", label: { es: "Todas", en: "All" } },
  { id: "credito", label: { es: "Financiamiento & Crédito VIP / Biess", en: "Financing & VIP / Biess" } },
  { id: "compra", label: { es: "Proceso de compra & escrituración", en: "Buying & Closing Process" } },
  { id: "obra", label: { es: "Construcción & Garantías de obra", en: "Construction & Warranties" } },
  { id: "alquiler", label: { es: "Alquiler & Contratos", en: "Rentals & Contracts" } },
  { id: "propietarios", label: { es: "Propietarios (Vender con RG)", en: "Owners (Sell with RG)" } },
];

const FAQS: FaqItem[] = [
  {
    category: "credito",
    q: {
      es: "¿Cómo funciona el crédito de Vivienda de Interés Público (VIP) al 4.99%?",
      en: "How does the 4.99% Public Interest Housing (VIP) mortgage work?",
    },
    a: {
      es: "Está respaldado por el Estado ecuatoriano junto a entidades financieras calificadas (Banco Pichincha, Mutualista Azuay, Banco del Austro y cooperativas autorizadas). Ofrece una tasa referencial fija del 4.99% anual a plazos de hasta 20 o 25 años para primera vivienda nueva dentro de los topes vigentes, con entrada mínima desde el 5% al 10%. Nuestro equipo legal prepara tu carpeta sin costo administrativo adicional.",
      en: "Backed by Ecuadorian housing policy through qualified lenders (Banco Pichincha, Mutualista Azuay, Banco del Austro, and authorized cooperatives), it offers a fixed 4.99% annual rate for up to 20–25 years on a buyer's first new home within official caps, with 5%–10% down payment.",
    },
  },
  {
    category: "credito",
    q: {
      es: "¿Puedo financiar mi propiedad con el Biess o con un banco privado?",
      en: "Can I finance my property through BIESS or a private bank?",
    },
    a: {
      es: "Sí. Todas nuestras propiedades en cartera y proyectos propios cuentan con planos aprobados, propiedad horizontal inscrita y documentación saneada para agilizar el trámite tanto en BIESS como en banca privada (Produbanco, Pichincha, Guayaquil, Internacional o Pacífico). La aprobación final depende siempre de la evaluación crediticia de la entidad financiera.",
      en: "Yes. All our properties and own developments have approved plans, registered horizontal property deeds, and clean titles for fast processing with BIESS or private banks. Final approval always depends on the lender's credit evaluation.",
    },
  },
  {
    category: "credito",
    q: {
      es: "¿Cuánto dinero necesito para la entrada de una vivienda sobre planos?",
      en: "How much down payment do I need for a pre-construction home?",
    },
    a: {
      es: "En preventa o sobre planos la estructura habitual se divide en: 1) Reserva referencial desde $2.000 a $5.000 USD para asegurar la unidad; 2) Entrada del 20% al 30% diferida en cuotas mensuales sin intereses durante los 12 a 24 meses de obra; y 3) Saldo final del 70% al 80% contra entrega mediante crédito hipotecario o fondos propios.",
      en: "In pre-construction: 1) A reservation deposit from $2,000–$5,000 USD; 2) A 20%–30% down payment split into interest-free monthly installments during construction (12–24 months); and 3) The remaining 70%–80% upon delivery via mortgage or own funds.",
    },
  },
  {
    category: "compra",
    q: {
      es: "¿Cuál es el proceso formal para reservar una propiedad en RG Inmobiliaria?",
      en: "What is the formal process to reserve a property with RG?",
    },
    a: {
      es: "Trabajamos en cuatro etapas: Hoja de Reserva y Ficha Técnica con precio y plazos claros; Due Diligence Notarial en 72 horas verificando certificados de gravámenes y predios; firma de Promesa de Compraventa ante Notario Público en Cuenca (o mediante poder consular apostillado si resides en el exterior); y Minuta Definitiva e inscripción en el Registro de la Propiedad.",
      en: "We follow four clear steps: Reservation Sheet & Spec Sheet; 72-hour Notarial Due Diligence checking liens and municipal taxes; Promissory Sale Agreement before a Notary Public in Cuenca (or apostilled power of attorney if living abroad); and Final Deed registration.",
    },
  },
  {
    category: "compra",
    q: {
      es: "¿Cómo se garantiza que una propiedad esté libre de gravámenes o litigios?",
      en: "How do you guarantee a property is free of liens or legal disputes?",
    },
    a: {
      es: "Ninguna propiedad entra a nuestro catálogo sin un Dictamen Jurídico de Título previo. Solicitamos el Certificado de Gravámenes e Historiado actualizado en el Registro de la Propiedad de Cuenca para validar ausencia de hipotecas abiertas, embargos, prohibiciones de enajenar o afecciones viales.",
      en: "No property enters our catalog without prior legal title verification. We obtain an updated Certificate of Liens & History from Cuenca's Property Registry confirming no open mortgages, embargos, or municipal road restrictions.",
    },
  },
  {
    category: "compra",
    q: {
      es: "¿Puedo comprar desde Estados Unidos (Miami, New York, New Jersey) sin viajar?",
      en: "Can I buy from the United States without traveling to Ecuador?",
    },
    a: {
      es: "Sí. Contamos con oficina de enlace en Miami y acompañamos todo el proceso a distancia con recorridos en video en vivo, revisión documental digital y coordinación de poder especial apostillado ante el consulado ecuatoriano más cercano.",
      en: "Yes. With our Miami liaison office, we coordinate live video walkthroughs, digital document review, and apostilled power-of-attorney execution through your nearest Ecuadorian consulate.",
    },
  },
  {
    category: "obra",
    q: {
      es: "¿Qué garantías estructurales y de acabados incluyen las construcciones de RG?",
      en: "What structural and finish warranties are included in RG builds?",
    },
    a: {
      es: "Todas nuestras obras se ejecutan bajo la Norma Ecuatoriana de la Construcción (NEC) con control de ensayos de hormigón y acero. Entregamos garantía estructural conforme a la ley ecuatoriana y cobertura directa de postventa sobre instalaciones hidrosanitarias, eléctricas y acabados tras el acta de entrega formal.",
      en: "All builds follow Ecuador's National Building Code (NEC) with certified concrete and steel testing, statutory structural warranty, and direct post-delivery support on plumbing, electrical, and finishes.",
    },
  },
  {
    category: "obra",
    q: {
      es: "¿Por qué no muestran la dirección exacta de las propiedades en la web?",
      en: "Why don't you display exact street addresses on the public website?",
    },
    a: {
      es: "Por seguridad y privacidad tanto de los propietarios actuales como de futuros residentes, en la web pública mostramos únicamente la zona o sector referencial (por ejemplo Ricaurte, El Batán o Challuabamba) y eliminamos metadatos GPS de las fotos. La ubicación exacta se comparte al agendar una visita verificada.",
      en: "For the safety and privacy of owners and future residents, we only show approximate neighborhood sectors publicly and strip GPS metadata from photos. Exact addresses are shared once a verified visit is scheduled.",
    },
  },
  {
    category: "alquiler",
    q: {
      es: "¿Qué requisitos solicitan para alquilar un departamento o casa con RG?",
      en: "What are the requirements to rent an apartment or house with RG?",
    },
    a: {
      es: "Solicitamos documento de identidad vigente, respaldo de ingresos o estabilidad laboral, referencias verificables y depósito de garantía estándar según el inmueble. Todos los contratos se formalizan por escrito con inventario fotográfico de entrega.",
      en: "We require valid ID, proof of income or employment, verifiable references, and a standard security deposit. Every lease is formalized in writing with a photographic move-in inventory.",
    },
  },
  {
    category: "propietarios",
    q: {
      es: "¿Cómo puedo vender o alquilar mi propiedad a través de RG Inmobiliaria?",
      en: "How can I sell or rent my property through RG?",
    },
    a: {
      es: "Completa el formulario en nuestra sección Vende o Alquila con RG. Un asesor realiza una inspección técnica y valoración referencial de mercado, verifica la documentación legal y produce fotografía profesional manteniendo tu dirección exacta en reserva.",
      en: "Complete the form in our Sell or Rent with RG section. An advisor conducts a technical inspection and market valuation, verifies title documents, and produces professional photography while keeping your exact address private.",
    },
  },
];

export function FaqClient({ lang }: { lang: Lang }) {
  const [category, setCategory] = useState<FaqCategory>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      return item.q[lang].toLowerCase().includes(q) || item.a[lang].toLowerCase().includes(q);
    });
  }, [category, query, lang]);

  return (
    <div className="bg-surface text-on-surface">
      <section className="border-b border-outline-variant bg-surface-container-low">
        <div className="max-w-5xl mx-auto px-gutter py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[3px] w-8 bg-rg-red" aria-hidden="true" />
            <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">
              {lang === "en" ? "Help Center & RG Guide" : "Centro de Asistencia & Guía RG"}
            </span>
          </div>
          <h1 className="font-display text-display-xl text-on-surface">
            {lang === "en" ? "Frequently Asked Questions" : "Preguntas frecuentes"}
          </h1>
          <p className="mt-4 text-body-lg text-on-surface-variant max-w-2xl">
            {lang === "en"
              ? "Clear answers on buying, selling, renting, VIP mortgages, and construction guarantees at RG Inmobiliaria y Constructora."
              : "Resolvemos tus inquietudes sobre compra, venta, alquiler, créditos preferenciales y el proceso constructivo en RG Inmobiliaria y Constructora."}
          </p>

          <div className="mt-8 relative max-w-xl">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              search
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                lang === "en"
                  ? "Search by topic (e.g. VIP credit, BIESS, title deed)..."
                  : "Buscar por tema (ej. crédito VIP, Biess, escrituras)..."
              }
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-lowest border border-outline-variant text-body-md focus:outline-none focus:border-primary"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`px-4 py-2 rounded-full text-label-md font-medium transition-all duration-200 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none ${
                    active
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-lowest border border-outline-variant text-on-surface hover:border-primary"
                  }`}
                >
                  {c.label[lang]}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-gutter py-10 md:py-14 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-2 text-label-md text-on-surface-variant">
          <span>
            {lang === "en"
              ? `Showing ${filtered.length} verified answers`
              : `Mostrando ${filtered.length} respuestas verificadas`}
          </span>
          <span>{lang === "en" ? "Updated 2026" : "Actualizado 2026"}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-10 text-center">
            <p className="font-display text-title-md text-on-surface">
              {lang === "en" ? "No questions match your search" : "No encontramos preguntas con ese criterio"}
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory("all");
                setQuery("");
              }}
              className="mt-4 px-4 py-2 rounded-xl border border-outline-variant text-label-md font-semibold hover:border-primary cursor-pointer"
            >
              {lang === "en" ? "Show all questions" : "Ver todas las preguntas"}
            </button>
          </div>
        ) : (
          <Accordion
            key={`${category}-${query}`}
            items={filtered.map((f) => ({ q: f.q[lang], a: f.a[lang] }))}
            defaultOpen={0}
            variant="compact"
          />
        )}

        <div className="rounded-2xl bg-primary text-on-primary p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-headline-sm">
              {lang === "en" ? "Still have a specific question?" : "¿Tienes una consulta puntual sobre tu caso?"}
            </h2>
            <p className="mt-1.5 text-body-md text-on-primary/80">
              {lang === "en"
                ? "Our legal and commercial team in Cuenca & Miami can guide you directly."
                : "Nuestro equipo comercial y legal en Cuenca y Miami puede orientarte directamente."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href={`/${lang}/propiedades`}
              className="px-5 py-3 rounded-xl bg-on-primary text-primary text-label-md font-semibold hover:bg-on-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary transition-all motion-reduce:transition-none"
            >
              {lang === "en" ? "Browse catalog" : "Ver propiedades"}
            </Link>
            <Link
              href={`/${lang}/blog`}
              className="px-5 py-3 rounded-xl border border-on-primary/30 text-on-primary text-label-md font-semibold hover:bg-on-primary/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary transition-all motion-reduce:transition-none"
            >
              {lang === "en" ? "Read guides" : "Leer guías en el Blog"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
