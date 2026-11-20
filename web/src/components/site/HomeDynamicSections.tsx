"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Accordion } from "@/components/ui/Accordion";
import { SectionTitle } from "@/components/ui/Badges";
import { AboutInstitutionalBlock } from "@/components/site/AboutInstitutionalBlock";
import { Counter } from "@/components/site/Counter";
import { PropertyCard } from "@/components/site/PropertyCard";
import { useVisit } from "@/components/site/VisitProvider";
import {
  ABOUT,
  COUNTERS,
  DEFAULT_SITE_SECTIONS,
  HOME_FAQS,
  TESTIMONIALS,
  loadSiteSections,
  type SiteSectionBlock,
} from "@/lib/data/content";
import type { Lang, Property } from "@/lib/types";

function resolveHref(lang: Lang, rawHref?: string): string {
  const href = (rawHref || "/propiedades").trim();
  if (href.startsWith("#") || href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }
  if (href.startsWith(`/${lang}/`) || href === `/${lang}`) {
    return href;
  }
  return `/${lang}${href.startsWith("/") ? href : `/${href}`}`;
}

export function HomeDynamicSections({
  lang,
  projects,
}: {
  lang: Lang;
  projects: Property[];
}) {
  const { openVisit: openVisitModal } = useVisit();

  // Inicialización determinista (SSR === Primer render en cliente) para evitar Hydration Mismatch
  const [sections, setSections] = useState<SiteSectionBlock[]>(DEFAULT_SITE_SECTIONS);
  const [counters, setCounters] = useState(COUNTERS);
  const [faqs, setFaqs] = useState(HOME_FAQS);

  useEffect(() => {
    const syncAll = () => {
      setSections(loadSiteSections());
      try {
        const rawCounters = localStorage.getItem("rg_counters_cms_v1");
        if (rawCounters) {
          const parsed = JSON.parse(rawCounters);
          if (Array.isArray(parsed) && parsed.length > 0) setCounters(parsed);
        }
        const rawFaqs = localStorage.getItem("rg_faqs_cms_v1");
        if (rawFaqs) {
          const parsed = JSON.parse(rawFaqs);
          if (Array.isArray(parsed) && parsed.length > 0) setFaqs(parsed);
        }
      } catch {
        /* ignore */
      }
    };

    syncAll();
    window.addEventListener("rg-panel-updated", syncAll);
    window.addEventListener("storage", syncAll);
    return () => {
      window.removeEventListener("rg-panel-updated", syncAll);
      window.removeEventListener("storage", syncAll);
    };
  }, []);

  const visibleSections = sections.filter((s) => s.visible !== false);

  const renderSection = (sec: SiteSectionBlock, idx: number) => {
    const title = (lang === "en" ? sec.titleEn || sec.titleEs : sec.titleEs).trim();
    const subtitle = (lang === "en" ? sec.subtitleEn || sec.subtitleEs : sec.subtitleEs)?.trim();

    if (sec.type === "services_grid") {
      const cards = sec.cards ?? [];
      const cols = sec.columns ?? 4;
      const gridColsClass =
        cols === 2
          ? "grid-cols-1 md:grid-cols-2"
          : cols === 3
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

      return (
        <section
          key={sec.id}
          id={idx === 0 ? "servicios" : sec.id}
          className="w-full bg-surface-container-low py-16 md:py-20 px-gutter-mobile md:px-12 scroll-mt-20 overflow-x-hidden"
          aria-labelledby={`sec-title-${sec.id}`}
        >
          <div className="max-w-[1200px] mx-auto">
            <div className="mb-10 md:mb-12">
              <SectionTitle id={`sec-title-${sec.id}`}>{title}</SectionTitle>
              {subtitle && (
                <p className="font-body-md text-body-md text-secondary mt-3 max-w-2xl">{subtitle}</p>
              )}
            </div>

            <div className={`grid ${gridColsClass} gap-6`}>
              {cards.map((c) => {
                const cTitle = (lang === "en" ? c.titleEn || c.titleEs : c.titleEs).trim();
                const cText = (lang === "en" ? c.textEn || c.textEs : c.textEs).trim();
                const cLink =
                  (lang === "en" ? c.linkLabelEn || c.linkLabelEs : c.linkLabelEs).trim() ||
                  (lang === "en" ? "Learn more" : "Conocer más");
                const isVisitModal = c.actionType === "visita" || c.href === "#agendar-visita";
                const resolvedHref = resolveHref(lang, c.href);

                return (
                  <div
                    key={c.id}
                    className="group bg-surface-container-lowest rounded-xl p-6 md:p-8 flex flex-col justify-between border border-transparent hover:border-[#ECEAE7] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-[#141414] group-hover:bg-[#141414] group-hover:text-[#F5F3EE] transition-colors duration-300 motion-reduce:transition-none mb-6 overflow-hidden">
                        {c.customIcon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.customIcon} alt="" className="w-6 h-6 object-contain" />
                        ) : (
                          <span className="material-symbols-outlined text-[28px]" aria-hidden>
                            {c.icon || "home"}
                          </span>
                        )}
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 break-words">
                        {cTitle}
                      </h3>
                      <p className="font-body-md text-body-md text-secondary leading-relaxed break-words">
                        {cText}
                      </p>
                    </div>

                    {isVisitModal ? (
                      <button
                        type="button"
                        onClick={() => openVisitModal()}
                        aria-label={`${cLink}: ${cTitle}`}
                        className="inline-flex items-center gap-1 min-h-11 font-label-md text-label-md text-primary font-semibold hover:text-[#D9381E] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md transition-all duration-200 motion-reduce:transition-none mt-6 cursor-pointer self-start"
                      >
                        <span>{cLink}</span>
                        <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none">
                          arrow_forward
                        </span>
                      </button>
                    ) : (
                      <Link
                        className="inline-flex items-center gap-1 min-h-11 font-label-md text-label-md text-primary font-semibold hover:text-[#D9381E] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md transition-all duration-200 motion-reduce:transition-none mt-6 self-start"
                        href={resolvedHref}
                        aria-label={`${cLink}: ${cTitle}`}
                      >
                        <span>{cLink}</span>
                        <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none">
                          arrow_forward
                        </span>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    if (sec.type === "steps_timeline") {
      const steps = sec.steps ?? [];
      return (
        <section
          key={sec.id}
          id={sec.id}
          className="w-full bg-surface py-16 md:py-20 px-gutter-mobile md:px-12 overflow-x-hidden"
          aria-labelledby={`sec-title-${sec.id}`}
        >
          <div className="max-w-[1200px] mx-auto">
            <div className="mb-12 md:mb-16">
              <SectionTitle id={`sec-title-${sec.id}`}>{title}</SectionTitle>
              {subtitle && (
                <p className="font-body-md text-body-md text-secondary mt-3 max-w-2xl">{subtitle}</p>
              )}
            </div>
            <div className="relative">
              <div
                className="hidden lg:block absolute top-7 left-10 right-10 h-0.5 bg-surface-variant z-0"
                aria-hidden
              />
              <ol className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                {steps.map((s, k) => {
                  const sTitle = (lang === "en" ? s.titleEn || s.titleEs : s.titleEs).trim();
                  const sText = (lang === "en" ? s.textEn || s.textEs : s.textEs).trim();

                  return (
                    <li
                      key={s.id || `step-${k}`}
                      tabIndex={0}
                      className="group cursor-default flex flex-col items-start rounded-xl p-3 -m-3 outline-none transition-all duration-300 ease-out hover:-translate-y-0.5 focus-within:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                    >
                      <div
                        className="w-14 h-14 rounded-full bg-white text-[#141414] border border-[#141414]/15 group-hover:bg-[#141414] group-hover:border-[#141414] group-hover:text-white group-focus-within:bg-[#141414] group-focus-within:border-[#141414] group-focus-within:text-white group-active:bg-[#141414] group-active:border-[#141414] group-active:text-white font-headline-sm text-headline-sm flex items-center justify-center font-bold shadow-sm mb-6 transition-colors duration-300 ease-out motion-reduce:transition-none"
                        aria-hidden
                      >
                        {String(k + 1).padStart(2, "0")}
                      </div>
                      <h3 className="font-title-md text-title-md text-[#141414] group-hover:text-[#D9381E] group-focus-within:text-[#D9381E] group-active:text-[#D9381E] transition-colors duration-300 motion-reduce:transition-none mb-2 font-semibold break-words">
                        {k + 1}. {sTitle}
                      </h3>
                      <p className="font-body-sm text-body-sm text-secondary leading-relaxed break-words">
                        {sText}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>
      );
    }

    if (sec.type === "editorial_split") {
      if (sec.id === "sec-editorial-about" || sec.aboutData) {
        return <AboutInstitutionalBlock key={sec.id} sec={sec} lang={lang} />;
      }
      const kicker = (lang === "en" ? sec.kickerEn || sec.kickerEs : sec.kickerEs)?.trim();
      const body = (lang === "en" ? sec.bodyEn || sec.bodyEs : sec.bodyEs)?.trim();
      const badge = (lang === "en" ? sec.badgeEn || sec.badgeEs : sec.badgeEs)?.trim();
      const ctaLabel =
        (lang === "en" ? sec.ctaLabelEn || sec.ctaLabelEs : sec.ctaLabelEs)?.trim() ||
        (lang === "en" ? "Talk to our team" : "Conversar con el equipo");
      const ctaHref = resolveHref(lang, sec.ctaHref || "/vende-o-alquila");
      const imgSrc = sec.image && sec.image.trim() ? sec.image : ABOUT.image;
      const bullets = sec.bullets ?? [];
      const showWorks = sec.id === "sec-editorial-about";

      return (
        <section
          key={sec.id}
          id={sec.id === "sec-editorial-about" ? "quienes-somos" : sec.id}
          className="w-full bg-surface-container-lowest py-16 md:py-20 px-gutter-mobile md:px-12 scroll-mt-20 overflow-x-hidden"
          aria-labelledby={`sec-title-${sec.id}`}
        >
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-5 relative">
              <div className="relative w-full h-[300px] md:h-[460px] rounded-xl overflow-hidden shadow-md bg-surface-container">
                <Image
                  src={imgSrc}
                  alt={title}
                  fill
                  sizes="(min-width: 1024px) 480px, 100vw"
                  className="object-cover"
                  unoptimized={imgSrc.startsWith("data:") || imgSrc.startsWith("blob:")}
                />
              </div>
              {badge && (
                <div className="absolute bottom-5 left-5 right-5 bg-surface-container-lowest/95 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined icon-fill text-[20px] text-[#D9381E]" aria-hidden>
                      verified
                    </span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      {badge}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-7 flex flex-col items-start">
              {kicker && (
                <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase mb-2">
                  {kicker}
                </span>
              )}
              <h2
                id={`sec-title-${sec.id}`}
                className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface font-bold mb-4 tracking-tight leading-snug break-words"
              >
                {title}
              </h2>
              {body && (
                <p className="font-body-md text-body-md text-secondary leading-relaxed mb-6 break-words">
                  {body}
                </p>
              )}

              {bullets.length > 0 && (
                <ul className="flex flex-col gap-3 mb-8 w-full">
                  {bullets.map((b) => {
                    const bText = (lang === "en" ? b.textEn || b.textEs : b.textEs).trim();
                    if (!bText) return null;
                    return (
                      <li key={b.id} className="flex items-center gap-3">
                        <span className="material-symbols-outlined icon-fill text-[20px] text-primary shrink-0" aria-hidden>
                          check_circle
                        </span>
                        <span className="font-body-md text-body-md text-on-surface">{bText}</span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {showWorks && (
                <div className="w-full mb-8">
                  <h3 className="font-label-sm text-label-sm text-secondary tracking-widest uppercase mb-3">
                    {lang === "en" ? "Project Track Record" : "Trayectoria de obras"}
                  </h3>
                  <ul className="divide-y divide-[#ECEAE7] border-y border-[#ECEAE7]">
                    {ABOUT.works.map((w) => (
                      <li key={w.name} className="flex items-center justify-between gap-4 py-3">
                        <span className="font-title-md text-title-md text-on-surface">
                          {w.name}{" "}
                          <span className="font-body-sm text-body-sm text-secondary font-normal">
                            · {w.place}
                          </span>
                        </span>
                        <span className="font-label-sm text-label-sm text-secondary whitespace-nowrap">
                          {w.state} · {w.year}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ctaLabel && (
                <Link
                  className="h-12 px-6 rounded-lg bg-[#141414] text-[#F5F3EE] font-label-md text-label-md font-semibold flex items-center justify-center hover:bg-[#D9381E] transition-colors"
                  href={ctaHref}
                >
                  {ctaLabel}
                </Link>
              )}
            </div>
          </div>
        </section>
      );
    }

    if (sec.type === "cta_banner") {
      const ctaLabel =
        (lang === "en" ? sec.ctaLabelEn || sec.ctaLabelEs : sec.ctaLabelEs)?.trim() ||
        (lang === "en" ? "Sell or rent with us" : "Vende o alquila con nosotros");
      const ctaHref = resolveHref(lang, sec.ctaHref || "/vende-o-alquila");
      const hasBgImg = Boolean(sec.image && sec.image.trim());

      return (
        <section
          key={sec.id}
          id={sec.id}
          className="relative w-full bg-[#141414] text-[#F5F3EE] py-16 md:py-20 px-gutter-mobile md:px-12 overflow-hidden"
          aria-labelledby={`sec-title-${sec.id}`}
        >
          {hasBgImg && (
            <>
              <Image
                src={sec.image!}
                alt=""
                fill
                sizes="100vw"
                className="object-cover opacity-25"
                unoptimized={sec.image!.startsWith("data:") || sec.image!.startsWith("blob:")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-[#141414]/60" />
            </>
          )}
          <div className="relative z-10 max-w-[1200px] mx-auto flex flex-col items-center text-center">
            <h2
              id={`sec-title-${sec.id}`}
              className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-[#F5F3EE] font-bold mb-4 tracking-tight max-w-2xl break-words"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="font-body-md text-body-md md:font-body-lg md:text-body-lg text-[#F5F3EE]/80 max-w-xl mb-8 leading-relaxed break-words">
                {subtitle}
              </p>
            )}
            <Link
              className="h-12 w-full sm:w-auto px-8 rounded-lg bg-[#F5F3EE] text-[#141414] font-label-md text-label-md font-semibold flex items-center justify-center hover:bg-[#D9381E] hover:text-white transition-colors shadow-sm"
              href={ctaHref}
            >
              {ctaLabel}
            </Link>
          </div>
        </section>
      );
    }

    return null;
  };

  // Separamos el último bloque CTA (si existe al final) para mantener Contadores, Proyectos, Testimonios y FAQs integrados orgánicamente sin duplicados
  const firstBlock = visibleSections[0];
  const middleBlocks = visibleSections.slice(1, visibleSections.length > 1 ? visibleSections.length - 1 : 1);
  const lastBlock = visibleSections.length > 1 ? visibleSections[visibleSections.length - 1] : null;

  return (
    <>
      {/* Bloque 1 del Constructor (ej. ¿Cómo podemos ayudarte?) */}
      {firstBlock && renderSection(firstBlock, 0)}

      {/* CONTADORES INSTITUCIONALES */}
      <section
        className="w-full bg-[#141414] text-[#F5F3EE] py-14 md:py-16 px-gutter-mobile md:px-12"
        aria-label={lang === "en" ? "RG in numbers" : "RG en números"}
      >
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {counters.map((c, idx) => (
            <Counter key={`${c.label}-${idx}`} value={c.value} prefix={c.prefix} label={c.label} />
          ))}
        </div>
      </section>

      {/* Bloques intermedios del Constructor (ej. Paso a paso, Quiénes somos y cualquier nueva sección creada) */}
      {middleBlocks.map((sec, idx) => renderSection(sec, idx + 1))}

      {/* PRÓXIMOS PROYECTOS (constructora) */}
      {projects.length > 0 && (
        <section
          className="w-full bg-[#F5F3F1] py-16 md:py-20 px-gutter-mobile md:px-12 border-y border-[#ECEAE7]"
          aria-labelledby="proyectos"
        >
          <div className="max-w-[1200px] mx-auto">
            <div className="mb-10">
              <SectionTitle id="proyectos">
                {lang === "en" ? "Upcoming Projects" : "Próximos proyectos"}
              </SectionTitle>
              <p className="font-body-md text-body-md text-secondary mt-3">
                {lang === "en"
                  ? "RG Constructora developments under construction or pre-launch"
                  : "Obras de RG Constructora en construcción o por lanzar"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <PropertyCard key={p.code} p={p} lang={lang} showSummary />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIOS */}
      <section
        className="w-full bg-surface-container-low py-16 md:py-20 px-gutter-mobile md:px-12"
        aria-labelledby="testimonios"
      >
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle id="testimonios" className="mb-10 md:mb-12">
            {lang === "en" ? "What our clients say" : "Lo que dicen nuestros clientes"}
          </SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="group bg-surface-container-lowest rounded-xl p-6 md:p-8 border border-[#ECEAE7]/60 hover:border-outline-variant shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:hover:translate-y-0 flex flex-col justify-between"
              >
                <div>
                  <div
                    className="flex items-center gap-0.5 text-primary group-hover:text-rg-gold transition-colors duration-300 motion-reduce:transition-none mb-4"
                    aria-label="5 de 5"
                  >
                    {[0, 1, 2, 3, 4].map((k) => (
                      <span key={k} className="material-symbols-outlined icon-fill text-[18px]" aria-hidden>
                        star
                      </span>
                    ))}
                  </div>
                  <blockquote className="font-body-md text-body-md text-on-surface italic leading-relaxed mb-6">
                    “{t.quote}”
                  </blockquote>
                </div>
                <figcaption className="flex items-center gap-3 pt-4 border-t border-[#ECEAE7]">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-surface-container flex-shrink-0">
                    <Image src={t.photo} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-semibold leading-tight">
                      {t.name}
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">{t.place}</span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES */}
      <section
        className="w-full bg-surface-container-lowest py-16 md:py-20 px-gutter-mobile md:px-12"
        aria-labelledby="faq"
      >
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle id="faq" className="mb-10 md:mb-12">
            {lang === "en" ? "Frequently Asked Questions" : "Preguntas frecuentes"}
          </SectionTitle>
          <div className="max-w-3xl">
            <Accordion items={faqs} />
          </div>
        </div>
      </section>

      {/* Último bloque del Constructor (ej. Banda Propietarios / CTA final) */}
      {lastBlock && renderSection(lastBlock, visibleSections.length - 1)}
    </>
  );
}
