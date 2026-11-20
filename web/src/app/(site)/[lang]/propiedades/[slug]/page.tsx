import type { Metadata } from "next";
import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import { ExclusiveBadge, SectionTitle, StatusChip } from "@/components/ui/Badges";
import { PropertyCard } from "@/components/site/PropertyCard";
import { MAP_NOTICE, ZoneMapSingle } from "@/components/site/ZoneMap";
import { ExpandingPhotoGallery } from "@/components/site/property/ExpandingPhotoGallery";
import { ContactCard, FeatureTabs, SaveShare, SectionNav, VideoBlock } from "@/components/site/property/Interactive";
import { Simulator } from "@/components/site/property/Simulator";
import { OFFICE_HOURS, PHONE } from "@/lib/data/content";
import { PROPERTIES } from "@/lib/data/properties";
import { LANGS } from "@/lib/i18n";
import { ensureFeatureGroups, getProperty, isClosed, isPublic, money, priceLabel, publicProperties, similarTo, STATUS_META } from "@/lib/properties";
import type { Lang, Property } from "@/lib/types";

export function generateStaticParams() {
  return LANGS.flatMap((lang) => PROPERTIES.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p || !isPublic(p)) return { title: "Propiedad no disponible", robots: { index: false } };
  return { title: `${p.title} · ${p.zone}`, description: p.summary };
}

function Tile({ icon, label, value, unit, note }: { icon: string; label: string; value: string | number; unit?: string; note?: string }) {
  return (
    <div className="p-3.5 rounded-lg bg-surface-container-low/70 border border-[#ECEAE7] flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-secondary">
        <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden>
          {icon}
        </span>
        <span className="font-label-sm text-label-sm">{label}</span>
      </div>
      <span className="font-headline-sm text-headline-sm font-bold text-primary mt-1">
        {value}
        {unit && <span className="text-[14px] font-medium"> {unit}</span>}
      </span>
      {note && <span className="font-body-sm text-[11px] text-secondary">{note}</span>}
    </div>
  );
}

function Unavailable({ lang }: { lang: Lang; p?: Property }) {
  const others = publicProperties()
    .filter((o) => !isClosed(o))
    .slice(0, 3);
  return (
    <div className="max-w-7xl mx-auto px-gutter-mobile md:px-gutter py-space-xl">
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center py-10">
        <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[28px] text-primary">home_work</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary">Esta propiedad ya no está disponible.</h1>
        <p className="font-body-md text-body-md text-secondary mt-3">Puede que se haya vendido o alquilado. Te mostramos otras opciones parecidas.</p>
        <Link href={`/${lang}/propiedades?modo=filtros`} className="mt-6 h-12 px-6 rounded-lg bg-primary text-on-primary font-label-md text-label-md inline-flex items-center">
          Ver todas las propiedades
        </Link>
      </div>
      <SectionTitle className="mb-6">Propiedades parecidas</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {others.map((o) => (
          <PropertyCard key={o.code} p={o} lang={lang} />
        ))}
      </div>
    </div>
  );
}

export default async function PropertyPage({ params }: { params: Promise<{ lang: Lang; slug: string }> }) {
  const { lang, slug } = await params;
  const p = getProperty(slug);
  // Propiedad oculta o inexistente: aviso amable, nunca una página de error (PRD 7.3).
  if (!p || !isPublic(p)) return <Unavailable lang={lang} p={p} />;

  const closed = isClosed(p);
  const price = priceLabel(p);
  const similar = similarTo(p);
  const inWorks = p.status === "en-construccion" || p.status === "sobre-planos";
  const hasSim = p.operation === "venta" && p.type !== "terreno" && p.type !== "local" && p.type !== "oficina";
  const opLabel = p.operation === "venta" ? "Comprar" : "Alquilar";
  const sections = [
    { id: "descripcion", label: "Descripción" },
    { id: "ficha-tecnica", label: "Ficha técnica" },
    ...(p.videoThumb ? [{ id: "video", label: "Video" }] : []),
    ...(hasSim ? [{ id: "financiacion", label: "Financiación" }] : []),
    ...(p.faqs?.length ? [{ id: "faqs", label: "Preguntas frecuentes" }] : []),
  ];
  const bathsLabel = p.bathroomsNote ? p.bathroomsNote : undefined;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-gutter-mobile md:px-gutter py-space-lg">
      <nav aria-label="Ruta de navegación" className="flex flex-wrap items-center gap-2 font-body-sm text-body-sm text-secondary mb-6">
        <Link href={`/${lang}`} className="hover:text-primary">
          Inicio
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/${lang}/propiedades?modo=filtros&op=${p.operation}`} className="hover:text-primary">
          {opLabel}
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/${lang}/propiedades?modo=filtros&op=${p.operation}`} className="hover:text-primary">
          {p.city}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-primary font-medium" aria-current="page">
          {p.zone}
        </span>
      </nav>

      {closed && (
        <div className="mb-6 p-4 rounded-xl bg-st-closed-bg flex items-start gap-3" role="status">
          <span className="material-symbols-outlined text-st-closed">{STATUS_META[p.status].icon}</span>
          <p className="font-body-md text-body-md text-on-surface">
            Esta propiedad ya se {p.status === "vendida" ? "vendió" : "alquiló"}. La mostramos unos días como referencia; abajo tienes propiedades parecidas.
          </p>
        </div>
      )}

      {/* Título, chips y precio */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-surface-variant">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              {p.operation === "venta" ? "Venta" : "Alquiler"}
            </span>
            <StatusChip status={p.status} progress={p.progress} shape="tag" />
            {p.exclusive && <ExclusiveBadge />}
            {p.housing && <span className="px-2.5 py-1 rounded border border-[#ECEAE7] font-label-sm text-label-sm font-semibold">Vivienda {p.housing}</span>}
            <span className="font-body-sm text-body-sm text-secondary ml-1">Cód. {p.code}</span>
          </div>
          <h1 className="font-display-xl text-[28px] leading-[36px] lg:text-[36px] lg:leading-[44px] font-bold text-primary tracking-tight mt-1">{p.title}</h1>
          <div className="flex items-center gap-1 text-secondary font-body-md text-body-md">
            <span className="material-symbols-outlined text-[18px]" aria-hidden>
              location_on
            </span>
            <span>
              {p.city} · {p.zone}
            </span>
          </div>
          <div className="mt-2">
            <span className="font-display-xl text-[28px] md:text-[32px] leading-tight font-bold text-primary tracking-tight">
              {price.prefix}
              {price.main}
            </span>
            {price.suffix && <span className="font-body-md text-body-md text-secondary"> {price.suffix}</span>}
            {p.operation === "alquiler" && <p className="font-body-sm text-body-sm text-secondary mt-1">El precio es la mensualidad y no incluye gastos adicionales.</p>}
          </div>
        </div>
        <SaveShare p={p} />
      </div>

      <ExpandingPhotoGallery
        photos={p.photos}
        title={p.title}
        muted={closed}
        lang={lang}
        code={p.code}
        autoplaySeconds={p.galleryAutoplaySeconds ?? 4}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative items-start">
        {/* Columna izquierda */}
        <div className="lg:col-span-8 flex flex-col gap-12 min-w-0">
          <SectionNav items={sections} />

          {inWorks && (
            <div className="bg-st-building-bg/60 border border-st-building/20 rounded-xl p-5">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="font-title-md text-title-md text-primary">Avance de obra</span>
                <span className="font-headline-sm text-headline-sm text-st-building font-bold">{p.progress ?? 0} %</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-surface-container-lowest overflow-hidden" role="progressbar" aria-valuenow={p.progress ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label="Avance de obra">
                <div className="h-full bg-st-building rounded-full" style={{ width: `${p.progress ?? 0}%` }} />
              </div>
              {p.delivery && (
                <p className="mt-3 font-body-md text-body-md text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-st-building" aria-hidden>
                    event
                  </span>
                  Entrega estimada: <strong className="font-semibold">{p.delivery}</strong>
                </p>
              )}
            </div>
          )}

          <section className="scroll-mt-36" id="descripcion">
            <SectionTitle className="mb-4">Descripción general</SectionTitle>
            <div className="flex flex-col gap-4 font-body-md text-body-md md:text-[16px] md:leading-7 text-on-surface-variant leading-relaxed">
              {p.description.map((d, k) => (
                <p key={`${k}-${d.slice(0, 20)}`}>{d}</p>
              ))}
            </div>
          </section>

          <section className="scroll-mt-36" id="ficha-tecnica">
            <SectionTitle className="mb-6">Ficha técnica</SectionTitle>
            <div className="flex flex-col gap-6">
              <div className="bg-surface-container-lowest rounded-xl p-5 sm:p-6 border border-[#ECEAE7] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between gap-3 flex-wrap pb-4 mb-5 border-b border-surface-variant">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]" aria-hidden>
                        analytics
                      </span>
                    </div>
                    <div>
                      <h3 className="font-title-md text-title-md font-bold text-primary">Datos principales</h3>
                      <p className="font-body-sm text-body-sm text-secondary">Construcción y terreno, por separado</p>
                    </div>
                  </div>
                  {p.condition && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold text-st-available bg-st-available-bg">
                      <span className="material-symbols-outlined icon-fill text-[14px]" aria-hidden>
                        check_circle
                      </span>
                      {p.condition}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {p.bedrooms != null && <Tile icon="bed" label="Habitaciones" value={p.bedrooms} />}
                  {p.bathrooms != null && <Tile icon="bathtub" label="Baños" value={p.bathrooms} note={bathsLabel} />}
                  {p.parking != null && <Tile icon="directions_car" label="Parqueaderos" value={p.parking} />}
                  {p.areaBuilt != null && <Tile icon="straighten" label="Construcción" value={p.areaBuilt} unit="m²" note="Área de construcción" />}
                  {p.areaLand != null && <Tile icon="crop_free" label="Terreno" value={p.areaLand} unit="m²" note="Área del lote" />}
                  {p.yearBuilt != null && <Tile icon="event" label="Año" value={p.yearBuilt} note="Construcción" />}
                </div>
              </div>

              {p.units && (
                <div className="bg-surface-container-lowest rounded-xl p-5 sm:p-6 border border-[#ECEAE7]">
                  <h3 className="font-title-md text-title-md font-bold text-primary">
                    {p.units.length} unidades, desde {money(Math.min(...p.units.map((u) => u.price)))}
                  </h3>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left font-body-sm text-body-sm">
                      <caption className="sr-only">Unidades del edificio</caption>
                      <thead className="text-secondary border-b border-[#ECEAE7]">
                        <tr>
                          <th className="py-2 pr-4 font-medium">Unidad</th>
                          <th className="py-2 pr-4 font-medium">Habitaciones</th>
                          <th className="py-2 pr-4 font-medium">Área</th>
                          <th className="py-2 pr-4 font-medium">Precio</th>
                          <th className="py-2 font-medium">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ECEAE7]">
                        {p.units.map((u) => (
                          <tr key={u.name}>
                            <td className="py-3 pr-4 font-semibold text-primary">{u.name}</td>
                            <td className="py-3 pr-4">{u.bedrooms}</td>
                            <td className="py-3 pr-4">{u.area} m²</td>
                            <td className="py-3 pr-4">{money(u.price)}</td>
                            <td className="py-3">
                              <StatusChip status={u.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <FeatureTabs groups={ensureFeatureGroups(p)} lang={lang} code={p.code} />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-surface-container-low border border-[#ECEAE7]">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary border border-[#ECEAE7] shadow-sm flex-shrink-0">
                    <span className="material-symbols-outlined text-[24px]" aria-hidden>
                      picture_as_pdf
                    </span>
                  </div>
                  <div>
                    <p className="font-title-md text-title-md font-bold text-primary">Ficha de la propiedad</p>
                    <p className="font-body-sm text-body-sm text-secondary">Datos, fotos y zona en un PDF para guardar o imprimir.</p>
                  </div>
                </div>
                <Link
                  href={`/${lang}/propiedades/${p.slug}/ficha`}
                  target="_blank"
                  className="h-11 px-5 rounded-lg border border-primary bg-surface-container-lowest hover:bg-primary hover:text-on-primary text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden>
                    download
                  </span>
                  <span>Descargar ficha</span>
                </Link>
              </div>
            </div>
          </section>

          <VideoBlock thumb={p.videoThumb} videoUrl={p.videoUrl} title={p.title} code={p.code} />

          {hasSim && (
            <section className="scroll-mt-36" id="financiacion">
              <SectionTitle className="mb-4">Financiación</SectionTitle>
              <Simulator price={p.price} housing={p.housing} />
            </section>
          )}

          {p.faqs?.length ? (
            <section className="scroll-mt-36" id="faqs">
              <SectionTitle className="mb-4">Preguntas frecuentes sobre esta propiedad</SectionTitle>
              <Accordion items={p.faqs} variant="compact" initialVisible={3} />
            </section>
          ) : null}
        </div>

        {/* Columna derecha fija */}
        <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24" aria-label="Contacto y zona">
          <ContactCard p={p} lang={lang} />

          <div className="bg-surface-container-lowest rounded-xl p-5 border border-[#ECEAE7]">
            <h2 className="font-headline-sm text-title-md font-bold text-primary mb-3">Zona · {p.zone}</h2>
            <ZoneMapSingle zone={p.zone} />
            <p className="font-body-sm text-[12px] leading-relaxed text-secondary mt-3">{MAP_NOTICE}</p>
            <Link
              className="inline-flex items-center gap-1 min-h-11 font-body-sm text-body-sm font-semibold text-primary hover:underline"
              href={`/${lang}/propiedades?modo=filtros&zona=${encodeURIComponent(p.zone)}`}
            >
              Ver propiedades en {p.zone}
              <span className="material-symbols-outlined text-[16px]" aria-hidden>
                arrow_forward
              </span>
            </Link>
          </div>

          <div className="bg-[#F5F3F1] rounded-xl p-5 border border-[#ECEAE7] flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[16px] tracking-tight" aria-hidden>
                RG
              </div>
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">Te acompañamos</span>
                <p className="font-title-md text-body-md font-bold text-primary">Asesor asignado: Equipo RG Cuenca</p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#ECEAE7] flex flex-col gap-1.5 font-body-sm text-body-sm text-secondary">
              <a href="tel:+59372840000" className="flex items-center gap-2 text-primary font-medium min-h-9">
                <span className="material-symbols-outlined text-[18px]" aria-hidden>
                  phone
                </span>
                {PHONE}
              </a>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]" aria-hidden>
                  schedule
                </span>
                {OFFICE_HOURS}
              </span>
            </div>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-20 pt-12 border-t border-surface-variant" aria-labelledby="comparar">
          <SectionTitle id="comparar" className="mb-8">
            {closed ? "Propiedades parecidas" : "Otras propiedades para comparar"}
          </SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.map((o) => (
              <PropertyCard key={o.code} p={o} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
