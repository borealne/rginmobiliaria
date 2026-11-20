import Link from "next/link";
import { notFound } from "next/navigation";
import type { Lang } from "@/lib/types";

interface LegalArticle {
  id: string;
  badge: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  note?: string;
}

interface LegalDocData {
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  updated: string;
  articles: Record<Lang, LegalArticle[]>;
}

const LEGAL_DOCS: Record<string, LegalDocData> = {
  privacidad: {
    title: { es: "Política de Privacidad", en: "Privacy Policy" },
    subtitle: {
      es: "Tratamiento responsable de datos personales conforme a la Ley Orgánica de Protección de Datos Personales (LODP) de Ecuador.",
      en: "Responsible personal data handling under Ecuador's Organic Law on Personal Data Protection (LODP).",
    },
    updated: "2026",
    articles: {
      es: [
        {
          id: "art-1",
          badge: "Artículo 1",
          title: "1. Responsable del tratamiento",
          paragraphs: [
            "El presente sitio web y plataforma digital inmobiliaria son operados por RG Inmobiliaria y Constructora, con sede matriz en Cuenca, Azuay, Ecuador, y oficina de enlace internacional en Miami, FL.",
          ],
          bullets: [
            "Sede Matriz: Av. Ordoñez Lasso y Calle del Ciprés, Cuenca, Azuay.",
            "Oficina de Enlace: Brickell City Centre, Miami, FL 33131, EE. UU.",
            "Correo de privacidad: privacidad@rginmobiliaria.ec",
          ],
        },
        {
          id: "art-2",
          badge: "Artículo 2",
          title: "2. Datos que recopilamos",
          paragraphs: [
            "Tratamos únicamente los datos indispensables para gestionar la intermediación inmobiliaria, la coordinación de visitas y la atención comercial solicitada por el titular.",
          ],
          bullets: [
            "Datos identificativos y de contacto: nombres, teléfono celular y correo electrónico.",
            "Preferencias inmobiliarias: presupuesto referencial, tipología y zonas de interés.",
            "Favoritos locales: los inmuebles guardados se almacenan únicamente en el navegador del dispositivo sin crear cuentas.",
          ],
        },
        {
          id: "art-3",
          badge: "Artículo 3",
          title: "3. Finalidad del tratamiento",
          paragraphs: [
            "Sus datos se procesan exclusivamente para agendar recorridos guiados, brindar asesoría comercial directa en Cuenca o Miami, enviar especificaciones técnicas solicitadas y cumplir verificaciones normativas aplicables.",
          ],
        },
        {
          id: "art-4",
          badge: "Principio Tecnológico RG",
          title: "4. Búsqueda con IA y privacidad",
          paragraphs: [
            "Nuestro buscador inteligente procesa consultas en lenguaje natural únicamente para traducir criterios de búsqueda a filtros del catálogo. No perfila identidades ni entrena modelos externos con información personal.",
          ],
        },
        {
          id: "art-5",
          badge: "Artículo 5",
          title: "5. Protección de ubicación exacta y fotografías",
          paragraphs: [
            "Por seguridad de propietarios y residentes, RG no publica direcciones exactas, números de predio ni coordenadas en la web pública. La ubicación se muestra por sector referencial y se eliminan metadatos GPS/EXIF de las fotografías antes de publicar.",
          ],
        },
        {
          id: "art-6",
          badge: "Artículo 6",
          title: "6. No venta de datos y Derechos ARCO",
          paragraphs: [
            "RG Inmobiliaria y Constructora no comercializa, alquila ni cede bases de datos personales a terceros. Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación y Oposición escribiendo a privacidad@rginmobiliaria.ec.",
          ],
          note: "Plazo de respuesta formal: hasta 15 días hábiles conforme a la LODP.",
        },
      ],
      en: [
        {
          id: "art-1",
          badge: "Article 1",
          title: "1. Data Controller",
          paragraphs: [
            "This website and digital real estate platform are operated by RG Inmobiliaria y Constructora, headquartered in Cuenca, Ecuador, with an international liaison office in Miami, FL.",
          ],
          bullets: [
            "Headquarters: Av. Ordoñez Lasso & Calle del Ciprés, Cuenca, Azuay.",
            "Miami Liaison: Brickell City Centre, Miami, FL 33131, USA.",
            "Privacy contact: privacidad@rginmobiliaria.ec",
          ],
        },
        {
          id: "art-2",
          badge: "Article 2",
          title: "2. Data We Collect",
          paragraphs: [
            "We process only the minimum information required to coordinate property visits, respond to inquiries, and deliver requested technical sheets.",
          ],
          bullets: [
            "Contact details: full name, phone number, and email address.",
            "Search preferences: budget range, property type, and preferred sectors.",
            "Local favorites: saved properties are stored solely in your browser with no user account required.",
          ],
        },
        {
          id: "art-4",
          badge: "RG Tech Principle",
          title: "3. AI Search Privacy & Approximate Locations",
          paragraphs: [
            "Natural-language AI search queries are translated ephemerally into catalog filters. Public listings never display exact street addresses or GPS coordinates, and photo EXIF/GPS metadata is stripped before publication.",
          ],
        },
        {
          id: "art-6",
          badge: "Article 4",
          title: "4. Zero Data Sale & ARCO Rights",
          paragraphs: [
            "RG never sells or rents personal data. You may exercise your Access, Rectification, Cancellation, and Opposition rights by writing to privacidad@rginmobiliaria.ec.",
          ],
        },
      ],
    },
  },
  terminos: {
    title: { es: "Términos y Condiciones", en: "Terms & Conditions" },
    subtitle: {
      es: "Condiciones de uso del catálogo inmobiliario, simuladores referenciales y agendamiento de visitas.",
      en: "Terms of use for the property catalog, reference mortgage simulators, and visit scheduling.",
    },
    updated: "2026",
    articles: {
      es: [
        {
          id: "term-1",
          badge: "Cláusula 1",
          title: "1. Aceptación y carácter informativo del catálogo",
          paragraphs: [
            "El acceso y navegación en este portal implica la aceptación de los presentes términos. La disponibilidad, precios referenciales en USD y avances de obra se actualizan periódicamente y se confirman por escrito en la hoja de reserva formal.",
          ],
        },
        {
          id: "term-2",
          badge: "Cláusula 2",
          title: "2. Simuladores de crédito referenciales",
          paragraphs: [
            "Las calculadoras de cuota mensual (incluyendo tasas referenciales VIP o BIESS) tienen fines exclusivamente ilustrativos. RG no garantiza aprobación bancaria ni ofrece tasas o cuotas preaprobadas; las condiciones definitivas dependen de la entidad financiera.",
          ],
        },
        {
          id: "term-3",
          badge: "Cláusula 3",
          title: "3. Propiedad intelectual y planos",
          paragraphs: [
            "Los diseños arquitectónicos, renders, memorias técnicas, fotografías y fichas comerciales pertenecen a RG Inmobiliaria y Constructora o cuentan con autorización expresa de sus propietarios.",
          ],
        },
        {
          id: "term-4",
          badge: "Cláusula 4",
          title: "4. Visitas y reservas",
          paragraphs: [
            "Las visitas presenciales o por videollamada se coordinan sin costo de corretaje previo registro de datos básicos de seguridad. Toda reserva requiere firma formal y verificación documental.",
          ],
        },
      ],
      en: [
        {
          id: "term-1",
          badge: "Clause 1",
          title: "1. Acceptance & Catalog Information",
          paragraphs: [
            "Using this portal implies acceptance of these terms. Availability, USD pricing, and construction progress are updated periodically and confirmed in writing upon reservation.",
          ],
        },
        {
          id: "term-2",
          badge: "Clause 2",
          title: "2. Reference Mortgage Simulators",
          paragraphs: [
            "Monthly payment calculators are illustrative only. RG does not guarantee loan approval or pre-approved rates; final terms depend on the financial institution.",
          ],
        },
        {
          id: "term-3",
          badge: "Clause 3",
          title: "3. Intellectual Property & Visits",
          paragraphs: [
            "Architectural designs, renders, and technical sheets belong to RG Inmobiliaria y Constructora. Guided visits are coordinated at no brokerage fee to the buyer.",
          ],
        },
      ],
    },
  },
  transparencia: {
    title: { es: "Transparencia y Seguridad", en: "Transparency & Security" },
    subtitle: {
      es: "Principios operativos de verificación jurídica, control de obra y protección de identidad.",
      en: "Operational standards for legal title verification, build quality control, and privacy.",
    },
    updated: "2026",
    articles: {
      es: [
        {
          id: "tr-1",
          badge: "Estándar 1",
          title: "1. Verificación jurídica previa",
          paragraphs: [
            "Cada inmueble publicado atraviesa una revisión previa de escritura, certificado de gravámenes actualizado en el Registro de la Propiedad y pagos municipales al día.",
          ],
        },
        {
          id: "tr-2",
          badge: "Estándar 2",
          title: "2. Transparencia en precios y comisiones",
          paragraphs: [
            "Publicamos valores en dólares estadounidenses (USD) sin cargos ocultos ni ofertas engañosas. En nuestros proyectos propios tratas directamente con la constructora.",
          ],
        },
        {
          id: "tr-3",
          badge: "Estándar 3",
          title: "3. Seguridad de propietarios y compradores",
          paragraphs: [
            "Nunca exponemos direcciones exactas en abierto ni solicitamos pagos en cuentas personales no verificadas. Todo desembolso se respalda con contrato notariado.",
          ],
        },
      ],
      en: [
        {
          id: "tr-1",
          badge: "Standard 1",
          title: "1. Prior Legal Verification",
          paragraphs: [
            "Every listed property undergoes title deed review, updated Property Registry lien checks, and municipal tax verification.",
          ],
        },
        {
          id: "tr-2",
          badge: "Standard 2",
          title: "2. Transparent USD Pricing",
          paragraphs: [
            "All values are displayed in USD without hidden fees or misleading discounts.",
          ],
        },
      ],
    },
  },
};

export function generateStaticParams() {
  return Object.keys(LEGAL_DOCS).flatMap((doc) => ["es", "en"].map((lang) => ({ lang, doc })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang; doc: string }> }) {
  const { lang, doc } = await params;
  const item = LEGAL_DOCS[doc];
  if (!item) return { title: "Legal" };
  return { title: item.title[lang], description: item.subtitle[lang] };
}

export default async function LegalPage({ params }: { params: Promise<{ lang: Lang; doc: string }> }) {
  const { lang, doc } = await params;
  const item = LEGAL_DOCS[doc];
  if (!item) notFound();

  const articles = item.articles[lang];

  return (
    <div className="bg-surface text-on-surface">
      <header className="border-b border-outline-variant bg-surface-container-low">
        <div className="max-w-6xl mx-auto px-gutter py-12 md:py-16">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <span className="h-[3px] w-8 bg-rg-red" aria-hidden="true" />
              <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">
                {lang === "en" ? "Legal Framework · RG" : "Marco Legal & Gobernanza · RG"}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest border border-outline-variant text-label-sm font-medium text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-rg-gold">verified</span>
              LODP Ecuador · {item.updated}
            </span>
          </div>

          <h1 className="font-display text-display-xl text-on-surface">{item.title[lang]}</h1>
          <p className="mt-4 text-body-lg text-on-surface-variant max-w-3xl">{item.subtitle[lang]}</p>

          {/* Selector entre documentos legales */}
          <div className="mt-8 flex flex-wrap gap-2">
            {Object.entries(LEGAL_DOCS).map(([key, val]) => {
              const active = key === doc;
              return (
                <Link
                  key={key}
                  href={`/${lang}/legal/${key}`}
                  className={`px-4 py-2 rounded-full text-label-md font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none ${
                    active
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-lowest border border-outline-variant text-on-surface hover:border-primary"
                  }`}
                >
                  {val.title[lang]}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-gutter py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Índice lateral */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 sticky top-24 space-y-4">
            <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
              {lang === "en" ? "Contents" : "Contenido del documento"} · {articles.length}
            </p>
            <nav className="space-y-1.5">
              {articles.map((art) => (
                <a
                  key={art.id}
                  href={`#${art.id}`}
                  className="group flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-body-sm text-on-surface hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors motion-reduce:transition-none"
                >
                  <span className="truncate">{art.title}</span>
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary">
                    arrow_forward
                  </span>
                </a>
              ))}
            </nav>

            <div className="pt-4 border-t border-outline-variant space-y-2">
              <p className="text-body-sm font-semibold text-on-surface">
                {lang === "en" ? "Direct legal inquiry?" : "¿Consulta jurídica directa?"}
              </p>
              <p className="text-body-sm text-on-surface-variant">
                {lang === "en"
                  ? "Write to privacidad@rginmobiliaria.ec for formal data or legal requests."
                  : "Escríbenos a privacidad@rginmobiliaria.ec para solicitudes formales."}
              </p>
            </div>
          </div>
        </aside>

        {/* Artículos */}
        <div className="lg:col-span-8 space-y-6">
          {articles.map((art) => (
            <section
              key={art.id}
              id={art.id}
              className="group scroll-mt-24 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 md:p-8 space-y-4 transition-all duration-300 ease-out hover:shadow-md hover:border-primary/30 motion-reduce:transition-none"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-surface-container-low text-label-sm font-semibold text-on-surface-variant">
                {art.badge}
              </span>
              <h2 className="font-display text-headline-sm text-on-surface">{art.title}</h2>
              {art.paragraphs.map((p, idx) => (
                <p key={idx} className="text-body-md text-on-surface-variant leading-relaxed">
                  {p}
                </p>
              ))}
              {art.bullets && (
                <ul className="space-y-2 pt-1">
                  {art.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-body-md text-on-surface">
                      <span className="w-2 h-2 rounded-full bg-rg-red mt-2 shrink-0" aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {art.note && (
                <div className="rounded-xl bg-surface-container-low border border-outline-variant px-4 py-3 text-body-sm text-on-surface-variant">
                  {art.note}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
