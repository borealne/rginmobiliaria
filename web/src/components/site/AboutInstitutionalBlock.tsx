"use client";

import Link from "next/link";
import { TeamArchShowcase } from "@/components/site/TeamArchShowcase";
import { ABOUT, ensureAboutData, type SiteSectionBlock } from "@/lib/data/content";
import type { Lang } from "@/lib/types";

function renderEditorialHeadline(title: string) {
  const words = title.trim().split(/\s+/);
  if (words.length <= 3) {
    return <span className="text-[#F5F3EE]">{title}</span>;
  }
  const splitAt = Math.max(2, words.length - 3);
  const leading = words.slice(0, splitAt).join(" ");
  const accent = words.slice(splitAt).join(" ");
  return (
    <>
      <span className="text-[#F5F3EE]">{leading} </span>
      <span className="text-[#D9381E]">{accent}</span>
    </>
  );
}

export function AboutInstitutionalBlock({
  sec,
  lang,
  asPageHero = false,
}: {
  sec: SiteSectionBlock;
  lang: Lang;
  asPageHero?: boolean;
}) {
  const kicker = (lang === "en" ? sec.kickerEn || sec.kickerEs : sec.kickerEs)?.trim();
  const title = (lang === "en" ? sec.titleEn || sec.titleEs : sec.titleEs).trim();
  const body = (lang === "en" ? sec.bodyEn || sec.bodyEs : sec.bodyEs)?.trim();
  const ctaLabel =
    (lang === "en" ? sec.ctaLabelEn || sec.ctaLabelEs : sec.ctaLabelEs)?.trim() ||
    (lang === "en" ? "Talk to our team" : "Conversar con el equipo");
  const rawHref = (sec.ctaHref || "/vende-o-alquila").trim();
  const ctaHref =
    rawHref.startsWith("#") || rawHref.startsWith("http") || rawHref.startsWith(`/${lang}`)
      ? rawHref
      : `/${lang}${rawHref.startsWith("/") ? rawHref : `/${rawHref}`}`;

  const aboutData = ensureAboutData(sec);
  const missionText = (
    lang === "en" ? aboutData.missionEn || aboutData.missionEs : aboutData.missionEs
  ).trim();
  const visionText = (
    lang === "en" ? aboutData.visionEn || aboutData.visionEs : aboutData.visionEs
  ).trim();
  const visibleExtraParagraphs = aboutData.extraParagraphs.filter((p) => p.visible !== false);
  const bullets = sec.bullets ?? [];

  return (
    <section
      id={sec.id === "sec-editorial-about" ? "quienes-somos" : sec.id}
      className="w-full scroll-mt-20 overflow-x-hidden"
      aria-labelledby={`sec-title-${sec.id}`}
    >
      {/* ESCENARIO OSCURO EDITORIAL (#141414 Negro Tinta) + ARCOS ESCALONADOS PEGADOS A LA BASE */}
      <div className="w-full bg-[#141414] text-[#F5F3EE] pt-14 md:pt-20 pb-0 px-gutter-mobile md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Cabecera superior en 2 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end pb-10 md:pb-12">
            <div className="lg:col-span-7">
              {kicker && (
                <span className="inline-flex items-center gap-2 font-label-sm text-[11px] text-[#F5F3EE]/70 tracking-[0.25em] uppercase font-semibold mb-3">
                  <span className="w-5 h-0.5 bg-[#D9381E]" aria-hidden />
                  {kicker}
                </span>
              )}
              {asPageHero ? (
                <h1
                  id={`sec-title-${sec.id}`}
                  className="font-display-xl-mobile text-[30px] leading-[36px] md:font-display-xl md:text-[46px] md:leading-[52px] font-bold tracking-tight break-words"
                >
                  {renderEditorialHeadline(title)}
                </h1>
              ) : (
                <h2
                  id={`sec-title-${sec.id}`}
                  className="font-headline-lg-mobile text-headline-lg-mobile md:font-display-xl md:text-[42px] md:leading-[48px] font-bold tracking-tight break-words"
                >
                  {renderEditorialHeadline(title)}
                </h2>
              )}
            </div>

            <div className="lg:col-span-5 flex flex-col items-start gap-5">
              {body && (
                <p className="font-body-md text-[14px] md:text-[16px] text-[#F5F3EE]/80 leading-relaxed break-words">
                  {body}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  className="h-11 px-6 rounded-full border border-[#F5F3EE]/40 hover:border-[#F5F3EE] hover:bg-[#F5F3EE] hover:text-[#141414] text-[#F5F3EE] font-label-md text-label-md font-semibold inline-flex items-center gap-2 transition-colors"
                  href={ctaHref}
                >
                  <span>{ctaLabel}</span>
                  <span className="material-symbols-outlined text-[16px]" aria-hidden>
                    arrow_forward
                  </span>
                </Link>
                {!asPageHero && (
                  <Link
                    className="h-11 px-5 rounded-full border border-white/15 hover:border-[#D9381E] text-[#F5F3EE]/85 hover:text-[#F5F3EE] font-label-sm text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                    href={`/${lang}/quienes-somos`}
                  >
                    <span>{lang === "en" ? "Mission & Team" : "Misión y Equipo"}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Vitrina de 4 Arcos Escalonados pegada al borde inferior del bloque #141414 */}
          <TeamArchShowcase team={aboutData.team} lang={lang} />
        </div>
      </div>

      {/* BLOQUE INFERIOR EN ARENA (#F5F3EE): Misión, Visión, Párrafos Extras y Trayectoria de Obras */}
      <div className="w-full bg-[#F5F3EE] py-14 md:py-16 px-gutter-mobile md:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {(aboutData.missionVisible || aboutData.visionVisible) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aboutData.missionVisible && missionText && (
                <div className="rounded-2xl bg-surface-container-lowest border border-[#ECEAE7] p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-xl bg-[#141414] text-[#F5F3EE] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]" aria-hidden>
                        flag
                      </span>
                    </span>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-[#141414]">
                      {lang === "en" ? "Our Mission" : "Nuestra Misión"}
                    </h3>
                  </div>
                  <p className="font-body-md text-body-md text-secondary leading-relaxed break-words">
                    {missionText}
                  </p>
                </div>
              )}

              {aboutData.visionVisible && visionText && (
                <div className="rounded-2xl bg-surface-container-lowest border border-[#ECEAE7] p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-xl bg-[#D9381E] text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]" aria-hidden>
                        visibility
                      </span>
                    </span>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-[#141414]">
                      {lang === "en" ? "Our Vision" : "Nuestra Visión"}
                    </h3>
                  </div>
                  <p className="font-body-md text-body-md text-secondary leading-relaxed break-words">
                    {visionText}
                  </p>
                </div>
              )}
            </div>
          )}

          {visibleExtraParagraphs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleExtraParagraphs.map((p) => {
                const pTitle = (lang === "en" ? p.titleEn || p.titleEs : p.titleEs).trim();
                const pBody = (lang === "en" ? p.bodyEn || p.bodyEs : p.bodyEs).trim();
                if (!pTitle && !pBody) return null;
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl bg-surface-container-lowest border border-[#ECEAE7] p-6 md:p-7 shadow-sm space-y-2.5"
                  >
                    {pTitle && (
                      <h3 className="font-title-md text-title-md font-bold text-[#141414] break-words">
                        {pTitle}
                      </h3>
                    )}
                    {pBody && (
                      <p className="font-body-md text-body-md text-secondary leading-relaxed break-words">
                        {pBody}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Trayectoria de Obras + Viñetas */}
          <div className="rounded-2xl bg-surface-container-lowest border border-[#ECEAE7] p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-sm">
            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-label-sm text-label-sm text-secondary tracking-widest uppercase font-bold">
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

            <div className="lg:col-span-6 flex flex-col items-start gap-5">
              {bullets.length > 0 && (
                <ul className="flex flex-col gap-2.5 w-full">
                  {bullets.map((b) => {
                    const bText = (lang === "en" ? b.textEn || b.textEs : b.textEs).trim();
                    if (!bText) return null;
                    return (
                      <li key={b.id} className="flex items-center gap-3">
                        <span
                          className="material-symbols-outlined icon-fill text-[20px] text-[#D9381E] shrink-0"
                          aria-hidden
                        >
                          check_circle
                        </span>
                        <span className="font-body-md text-body-md text-on-surface">{bText}</span>
                      </li>
                    );
                  })}
                </ul>
              )}

              <Link
                className="h-11 px-6 rounded-full bg-[#141414] text-[#F5F3EE] font-label-md text-label-md font-semibold inline-flex items-center justify-center hover:bg-[#D9381E] transition-colors"
                href={ctaHref}
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
