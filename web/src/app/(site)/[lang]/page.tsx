import Image from "next/image";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/Badges";
import { Carousel } from "@/components/site/Carousel";
import { HomeDynamicSections } from "@/components/site/HomeDynamicSections";
import { PropertyCard } from "@/components/site/PropertyCard";
import { SearchBox } from "@/components/site/SearchBox";
import { HERO_COPY, HERO_SLIDES, resolveHeroSlides } from "@/lib/data/content";
import { ZONES } from "@/lib/data/properties";
import { isClosed, publicProperties, zoneCounts } from "@/lib/properties";
import type { Lang } from "@/lib/types";

export default async function Home({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const all = publicProperties();
  const open = all.filter((p) => !isClosed(p));
  const heroSlides = resolveHeroSlides(HERO_SLIDES, open);
  const exclusives = open.filter((p) => p.exclusive).slice(0, 3);
  const featured = open.filter((p) => p.featured).slice(0, 6);
  const projects = open.filter((p) => p.status === "en-construccion" || p.status === "sobre-planos");
  const counts = zoneCounts();
  const heroCopy = HERO_COPY[lang];

  return (
    <div className="flex flex-col w-full">
      {/* HERO: Escenario Negro Tinta (#141414) + Carrusel 3D Coverflow 5 slides + Buscador en borde Arena (#F5F3EE) */}
      <section className="relative w-full bg-[#F5F3EE] pb-8 md:pb-10 border-b border-[#E5E0D8] overflow-x-hidden">
        <div className="relative w-full bg-[#141414] text-[#F5F3EE] pt-6 pb-20 md:pt-7 md:pb-24 overflow-hidden">
          {/* Textura arquitectónica sutil y trazos Cuenca • Miami (opacity-15) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(245,243,238,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,243,238,0.18) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none w-full max-w-7xl mx-auto px-gutter-mobile md:px-gutter flex justify-center overflow-hidden mb-1"
          >
            <span className="font-display text-[11px] tracking-[0.35em] uppercase text-[#F5F3EE]/85 text-center select-none">
              {lang === "en"
                ? "CUENCA · AZUAY · MIAMI · ARCHITECTURE & HERITAGE"
                : "CUENCA · AZUAY · MIAMI · ARQUITECTURA & PATRIMONIO"}
            </span>
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-gutter-mobile md:px-gutter flex flex-col items-center text-center gap-3 md:gap-4">
            <div className="max-w-3xl pt-3">
              <h1 className="font-display-xl-mobile text-[26px] leading-[32px] md:font-display-xl md:text-[40px] md:leading-[46px] font-bold text-[#F5F3EE] tracking-tight">
                {heroCopy.title}
              </h1>
              <p className="font-body-md text-[14px] md:text-[16px] text-[#F5F3EE]/80 mt-1.5 font-normal">
                {heroCopy.subtitle}
              </p>
            </div>

            <Carousel slides={heroSlides} fallbackProperties={open} lang={lang} />
          </div>
        </div>

        {/* Buscador flotante en la transición Negro Tinta -> Arena */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-gutter-mobile md:px-gutter -mt-14 md:-mt-16 flex justify-center">
          <SearchBox lang={lang} variant="hero" />
        </div>
      </section>

      {/* EXCLUSIVAS RG (antes que destacadas) */}
      <section className="w-full bg-[#F5F3F1] py-space-xl border-y border-[#ECEAE7]" aria-labelledby="exclusivas">
        <div className="max-w-7xl mx-auto px-gutter-mobile md:px-gutter">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-4">
            <div>
              <SectionTitle id="exclusivas">Exclusivas RG</SectionTitle>
              <p className="font-body-md text-body-md text-[#6B6560] mt-2">Propiedades que solo encuentras con nosotros</p>
            </div>
            <Link
              className="inline-flex items-center gap-1 min-h-11 font-label-md text-label-md font-semibold text-[#111111] hover:text-rg-red-deep transition-colors"
              href={`/${lang}/propiedades?modo=filtros&exclusivas=1`}
            >
              <span>Ver todas las exclusivas</span>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exclusives.map((p) => (
              <PropertyCard key={p.code} p={p} lang={lang} />
            ))}
          </div>
        </div>
      </section>

      {/* PROPIEDADES DESTACADAS */}
      <section className="w-full max-w-7xl mx-auto px-gutter-mobile md:px-gutter py-space-xl" aria-labelledby="destacadas">
        <SectionTitle id="destacadas" className="mb-space-lg">
          Propiedades destacadas
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p) => (
            <PropertyCard key={p.code} p={p} lang={lang} />
          ))}
        </div>
        <div className="mt-space-xl flex justify-center">
          <Link
            className="inline-flex items-center justify-center px-8 min-h-12 rounded-lg border-2 border-[#111111] text-[#111111] font-label-md text-label-md font-semibold hover:bg-[#111111] hover:text-surface-container-lowest transition-all"
            href={`/${lang}/propiedades?modo=filtros`}
          >
            Ver todas las propiedades
          </Link>
        </div>
      </section>

      {/* EXPLORA POR ZONAS (sin pines) */}
      <section id="zonas" className="w-full bg-surface-container-lowest py-16 md:py-20 px-gutter-mobile md:px-12 scroll-mt-20" aria-labelledby="zonas-t">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-10 md:mb-12">
            <SectionTitle id="zonas-t">Explora por zonas</SectionTitle>
            <p className="font-body-md text-body-md text-secondary mt-3">Encuentra opciones en las mejores ubicaciones de Cuenca y sus alrededores</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {ZONES.map((z) => {
              const n = counts.get(z.name) ?? 0;
              return (
                <Link
                  key={z.name}
                  href={`/${lang}/propiedades?modo=filtros&zona=${encodeURIComponent(z.name)}`}
                  className="group relative h-44 md:h-80 rounded-xl overflow-hidden bg-surface-container shadow-sm hover:shadow-md transition-all duration-300 ease-out hover:-translate-y-1 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 block"
                >
                  <Image src={z.image} alt="" fill sizes="(min-width: 1024px) 400px, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
                  <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end items-start">
                    <span className="font-label-sm text-label-sm px-3 py-1 rounded-full bg-surface-container-lowest/20 backdrop-blur-md text-on-primary mb-2">
                      {n} {n === 1 ? "propiedad" : "propiedades"}
                    </span>
                    <h3 className="font-title-md text-title-md md:font-headline-sm md:text-headline-sm text-on-primary font-bold">{z.name}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECCIONES MODULARES DINÁMICAS (Constructor de Secciones en /panel/contenido · ES/EN · 390px) */}
      <HomeDynamicSections lang={lang} projects={projects} />
    </div>
  );
}
