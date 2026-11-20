"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExclusiveBadge } from "@/components/ui/Badges";
import { resolveHeroSlides } from "@/lib/data/content";
import {
  DEFAULT_AUTOPLAY_SECONDS,
  HERO_UPDATED_EVENT,
  clampAutoplaySeconds,
  loadHeroCmsConfig,
  type HeroCmsConfig,
} from "@/lib/hero-settings";
import type { HeroSlide, Lang, Property } from "@/lib/types";

export const COVERFLOW_CONFIG = {
  centerScale: 1.12,
  sideScale: 0.86,
  outerScale: 0.72,
  rotateYDeg: 20,
  outerRotateYDeg: 28,
  transitionMs: 550,
  dragThresholdPx: 8,
  defaultAutoplaySeconds: DEFAULT_AUTOPLAY_SECONDS,
  minAutoplaySeconds: 1,
  maxAutoplaySeconds: 10,
} as const;

function circularOffset(index: number, active: number, total: number): number {
  let diff = index - active;
  const half = Math.floor(total / 2);
  if (diff > half) diff -= total;
  if (diff < -half) diff += total;
  return diff;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Carrusel 3D Coverflow de 5 tarjetas (60 FPS, solo transform y opacity):
 * - Escritorio (lg+): 5 tarjetas en abanico 3D con perspectiva.
 * - Tablet (md): 3 tarjetas visibles.
 * - Móvil (390 px): Deslizador táctil nativo con "peek" lateral (~84% ancho).
 * - Autoplay gobernado por CMS (1-10s), pausa e reinicio obligatorio, y modal WCAG.
 */
export function Carousel({
  slides: initialSlides,
  fallbackProperties = [],
  lang,
}: {
  slides: HeroSlide[];
  fallbackProperties?: Property[];
  lang: Lang;
}) {
  const [cmsSlides, setCmsSlides] = useState<HeroSlide[]>(initialSlides);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [autoplaySeconds, setAutoplaySeconds] = useState<number>(
    COVERFLOW_CONFIG.defaultAutoplaySeconds,
  );

  const [active, setActive] = useState(0);
  const [interactionTick, setInteractionTick] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [expanded, setExpanded] = useState<HeroSlide | null>(null);

  const reducedMotion = useReducedMotion();
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const wasDragged = useRef(false);

  // Sincronización con CMS localStorage tras montaje (evita hydration mismatch)
  useEffect(() => {
    const applyConfig = (cfg: HeroCmsConfig) => {
      setCmsSlides(cfg.slides);
      setAutoplayEnabled(cfg.autoplayEnabled);
      setAutoplaySeconds(clampAutoplaySeconds(cfg.autoplaySeconds));
    };

    applyConfig(loadHeroCmsConfig());

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<HeroCmsConfig>).detail;
      if (detail) applyConfig(detail);
      else applyConfig(loadHeroCmsConfig());
    };
    const onStorage = () => applyConfig(loadHeroCmsConfig());

    window.addEventListener(HERO_UPDATED_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(HERO_UPDATED_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const slides = useMemo(
    () => resolveHeroSlides(cmsSlides, fallbackProperties),
    [cmsSlides, fallbackProperties],
  );
  const n = slides.length;

  const go = useCallback(
    (nextIndex: number, manual = true) => {
      if (n === 0) return;
      const target = ((nextIndex % n) + n) % n;
      setActive(target);
      if (manual) setInteractionTick((t) => t + 1);
      const track = mobileTrackRef.current;
      if (track && track.children[target]) {
        (track.children[target] as HTMLElement).scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    },
    [n],
  );

  // Autoplay gobernado por CMS con pausa y reinicio desde cero tras cada cambio manual
  useEffect(() => {
    if (!autoplayEnabled || isPaused || isDragging || expanded || reducedMotion || n < 2) {
      return;
    }
    const ms = clampAutoplaySeconds(autoplaySeconds) * 1000;
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % n);
    }, ms);
    return () => window.clearInterval(timer);
  }, [autoplayEnabled, autoplaySeconds, isPaused, isDragging, expanded, reducedMotion, n, active, interactionTick]);

  // Cerrar modal con Esc y bloquear scroll de fondo
  useEffect(() => {
    if (!expanded) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  const handleMobileScroll = useCallback(() => {
    const track = mobileTrackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    Array.from(track.children).forEach((child, idx) => {
      const el = child as HTMLElement;
      const elCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(elCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });
    setActive(bestIdx);
  }, []);

  // Arrastre con mouse (umbral > 8px para no abrir modal al soltar)
  const onStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    dragStartX.current = e.clientX;
    wasDragged.current = false;
    setIsDragging(true);
  };

  const onStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    if (Math.abs(e.clientX - dragStartX.current) > COVERFLOW_CONFIG.dragThresholdPx) {
      wasDragged.current = true;
    }
  };

  const onStagePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = null;
    setIsDragging(false);
    if (Math.abs(dx) > COVERFLOW_CONFIG.dragThresholdPx) {
      if (dx < 0) go(active + 1, true);
      else go(active - 1, true);
      window.setTimeout(() => {
        wasDragged.current = false;
      }, 60);
    }
  };

  if (n === 0) return null;

  const opLabel = (op: HeroSlide["operation"]) =>
    op === "venta" ? (lang === "en" ? "SALE" : "VENTA") : lang === "en" ? "RENT" : "ALQUILER";

  const viewBtnLabel = lang === "en" ? "View property" : "Ver propiedad";

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label={lang === "en" ? "Featured properties showcase" : "Vitrina de propiedades destacadas"}
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        dragStartX.current = null;
        setIsDragging(false);
      }}
      onTouchStart={() => {
        setIsPaused(true);
        setInteractionTick((t) => t + 1);
      }}
      onTouchEnd={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(active - 1, true);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          go(active + 1, true);
        }
      }}
      className="w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F3EE]/60 rounded-2xl"
    >
      {/* ==================== ESCRITORIO (lg: 5 tarjetas) & TABLET (md: 3 tarjetas) ==================== */}
      <div className="hidden md:block relative w-full">
        <div
          onPointerDown={onStagePointerDown}
          onPointerMove={onStagePointerMove}
          onPointerUp={onStagePointerUp}
          onPointerCancel={() => {
            dragStartX.current = null;
            setIsDragging(false);
          }}
          style={{ perspective: "1200px" }}
          className="relative h-[375px] lg:h-[395px] w-full flex items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing"
        >
          {/* Resplandor radial suave detrás de la tarjeta activa */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full opacity-35 blur-2xl"
            style={{
              background:
                "radial-gradient(circle, rgba(217,56,30,0.28) 0%, rgba(245,243,238,0.10) 45%, rgba(20,20,20,0) 75%)",
            }}
          />

          {slides.map((s, idx) => {
            const diff = circularOffset(idx, active, n);
            const abs = Math.abs(diff);
            const isCenter = diff === 0;
            const isImmediate = abs === 1;
            const isOuter = abs >= 2;

            const translatePct =
              diff === 0 ? 0 : diff === 1 ? 82 : diff === -1 ? -82 : diff > 1 ? 148 : -148;
            const scaleVal = isCenter
              ? COVERFLOW_CONFIG.centerScale
              : isImmediate
                ? COVERFLOW_CONFIG.sideScale
                : COVERFLOW_CONFIG.outerScale;
            const rotateY = isCenter
              ? 0
              : diff === 1
                ? -COVERFLOW_CONFIG.rotateYDeg
                : diff === -1
                  ? COVERFLOW_CONFIG.rotateYDeg
                  : diff > 1
                    ? -COVERFLOW_CONFIG.outerRotateYDeg
                    : COVERFLOW_CONFIG.outerRotateYDeg;

            const zCls = isCenter ? "z-30" : isImmediate ? "z-20" : "z-10";
            const opacityCls = isCenter
              ? "opacity-100"
              : isImmediate
                ? "opacity-75 hover:opacity-90"
                : "opacity-35 hover:opacity-55";

            return (
              <div
                key={s.id}
                role="group"
                aria-roledescription="diapositiva"
                aria-label={`${idx + 1} de ${n}: ${s.title[lang]}`}
                style={{
                  transform: `translate3d(${translatePct}%, 0, 0) rotateY(${rotateY}deg) scale(${scaleVal})`,
                  transitionProperty: "transform, opacity",
                  transitionDuration: `${COVERFLOW_CONFIG.transitionMs}ms`,
                  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                }}
                onClick={
                  !isCenter
                    ? () => {
                      if (wasDragged.current) return;
                      go(idx, true);
                    }
                    : undefined
                }
                className={`group absolute left-1/2 -translate-x-1/2 w-[235px] lg:w-[250px] aspect-[3/4] rounded-2xl overflow-hidden bg-[#1D1D1D] will-change-transform motion-reduce:transition-none ${isOuter ? "hidden lg:block" : ""
                  } ${zCls} ${opacityCls} ${isCenter
                    ? "shadow-2xl ring-1 ring-white/20 hover:-translate-y-1"
                    : "shadow-xl cursor-pointer ring-1 ring-white/10"
                  }`}
              >
                <Image
                  src={s.image}
                  alt={s.title[lang]}
                  fill
                  priority={idx === 0 || isCenter}
                  sizes="(min-width: 1024px) 280px, 240px"
                  className={`object-cover transition-transform duration-500 ease-out motion-reduce:transition-none ${isCenter ? "group-hover:scale-105" : ""
                    }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/15 pointer-events-none" />

                {isCenter && (
                  <button
                    type="button"
                    onClick={() => {
                      if (wasDragged.current) return;
                      setExpanded(s);
                    }}
                    aria-label={
                      lang === "en"
                        ? `Expand view: ${s.title[lang]}`
                        : `Ampliar vista: ${s.title[lang]}`
                    }
                    className="absolute inset-0 z-10 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F5F3EE]"
                  />
                )}

                {isCenter ? (
                  <div className="absolute inset-x-0 bottom-0 z-20 p-4 flex flex-col justify-end text-left pointer-events-none">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#141414]/90 backdrop-blur-sm text-[#F5F3EE] font-label-sm text-[10px] font-semibold tracking-wider uppercase border border-white/15">
                        {opLabel(s.operation)}
                      </span>
                      {s.exclusive && <ExclusiveBadge className="px-2 py-0.5 text-[10px]" />}
                    </div>
                    <h2 className="font-display text-[16px] lg:text-[17px] font-bold text-white leading-snug line-clamp-2">
                      {s.title[lang]}
                    </h2>
                    <p className="text-[12px] text-[#F5F3EE]/85 flex items-center gap-1 mt-1 mb-2.5">
                      <span className="material-symbols-outlined text-[14px]" aria-hidden>
                        location_on
                      </span>
                      <span className="truncate">{s.zone[lang]}</span>
                    </p>
                        <div className="flex flex-col gap-2 pt-2 border-t border-white/20">
                          <span className="font-price-display text-[18px] font-bold text-white leading-tight truncate">
                            {s.price}
                          </span>
                          <Link
                            href={`/${lang}/propiedades/${s.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="pointer-events-auto w-full h-9 px-3 rounded-lg bg-[#D9381E] text-white font-label-md text-[12px] font-semibold hover:bg-[#b92d17] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 shadow-md"
                          >
                            <span>{viewBtnLabel}</span>
                              <span className="material-symbols-outlined text-[14px] shrink-0" aria-hidden>
                                arrow_forward
                              </span>
                          </Link>
                        </div>
                    </div>
                    ) : (
                    <div className="absolute inset-x-0 bottom-0 z-10 p-3.5 text-left pointer-events-none">
                      <p className="text-[11px] text-[#F5F3EE]/85 flex items-center gap-1 truncate">
                        <span className="material-symbols-outlined text-[13px]" aria-hidden>
                          location_on
                        </span>
                        <span className="truncate">{s.zone[lang]}</span>
                      </p>
                      <p className="font-price-display text-[15px] font-bold text-white mt-0.5">
                        {s.price}
                      </p>
                    </div>
                )}
                  </div>
                );
          })}

                {/* Flechas laterales escritorio (44x44px mínimo) */}
                <button
                  type="button"
                  onClick={() => go(active - 1, true)}
                  aria-label={lang === "en" ? "Previous property" : "Propiedad anterior"}
                  className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-[#F5F3EE]/95 text-[#141414] border border-white/20 shadow-lg flex items-center justify-center hover:bg-[#D9381E] hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F3EE] transition-all cursor-pointer motion-reduce:transition-none"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(active + 1, true)}
                  aria-label={lang === "en" ? "Next property" : "Siguiente propiedad"}
                  className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-[#F5F3EE]/95 text-[#141414] border border-white/20 shadow-lg flex items-center justify-center hover:bg-[#D9381E] hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F3EE] transition-all cursor-pointer motion-reduce:transition-none"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </div>
      </div>

        {/* ==================== VISTA MÓVIL (390 px): TOUCH SNAP PEEK (~84%) ==================== */}
        <div className="md:hidden w-full overflow-x-hidden">
          <div
            ref={mobileTrackRef}
            onScroll={handleMobileScroll}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-y px-[8%] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {slides.map((s, idx) => (
              <article
                key={s.id}
                className="w-[84%] shrink-0 snap-center rounded-2xl overflow-hidden bg-[#1D1D1D] shadow-xl border border-white/10 flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(s)}
                  aria-label={
                    lang === "en"
                      ? `Expand view: ${s.title[lang]}`
                      : `Ampliar vista: ${s.title[lang]}`
                  }
                  className="relative w-full aspect-[4/3] block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F5F3EE]"
                >
                  <Image
                    src={s.image}
                    alt={s.title[lang]}
                    fill
                    priority={idx === 0}
                    sizes="84vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/15" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded bg-[#141414]/90 text-[#F5F3EE] font-label-sm text-[11px] font-semibold uppercase tracking-wider">
                      {opLabel(s.operation)}
                    </span>
                    {s.exclusive && <ExclusiveBadge className="px-2.5 py-0.5 text-[11px]" />}
                  </div>
                </button>

                <div className="p-4 bg-[#F5F3EE] text-left flex flex-col gap-2">
                    <h2 className="font-display text-[17px] font-bold text-[#141414] leading-snug line-clamp-2 min-h-[2.75rem]">
                      {s.title[lang]}
                    </h2>
                    <p className="text-[13px] text-[#6B6560] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] shrink-0" aria-hidden>
                          location_on
                        </span>
                        <span className="truncate">{s.zone[lang]}</span>
                    </p>
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5E0D8]">
                          <span className="font-price-display text-[17px] font-bold text-[#141414] truncate">
                            {s.price}
                          </span>
                          <Link
                            href={`/${lang}/propiedades/${s.slug}`}
                            className="min-h-11 px-3.5 rounded-lg bg-[#D9381E] text-white font-label-md text-[13px] font-semibold active:scale-[0.98] inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                          >
                            <span>{viewBtnLabel}</span>
                              <span className="material-symbols-outlined text-[16px] shrink-0" aria-hidden>
                                arrow_forward
                              </span>
                          </Link>
                        </div>
                    </div>
                  </article>
          ))}
                </div>
              </div>

      {/* ==================== INDICADORES INFERIORES ==================== */ }
              < div className = "flex items-center justify-center gap-1 mt-1" >
              {
                slides.map((s, idx) => {
                  const isCurrent = idx === active;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => go(idx, true)}
                      aria-label={`${lang === "en" ? "Go to slide" : "Ir a diapositiva"} ${idx + 1}: ${s.title[lang]}`}
                      aria-current={isCurrent ? "true" : undefined}
                      className="min-w-11 min-h-11 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F3EE] rounded-full"
                    >
                      <span
                        className={`block h-2 rounded-full transition-all duration-300 motion-reduce:transition-none ${isCurrent ? "w-7 bg-[#D9381E]" : "w-2 bg-[#F5F3EE]/40 hover:bg-[#F5F3EE]/75"
                          }`}
                      />
                    </button>
                  );
                })
              }
      </div>

          {/* ==================== MODAL EXPANDIDO ACCESIBLE (WCAG) ==================== */}
          {expanded && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="hero-modal-title"
              onClick={() => setExpanded(null)}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#F5F3EE] text-[#141414] shadow-2xl border border-[#E5E0D8]"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(null)}
                  aria-label={lang === "en" ? "Close expanded view" : "Cerrar vista ampliada"}
                  className="absolute top-3 right-3 z-20 w-11 h-11 rounded-full bg-[#141414]/90 text-white flex items-center justify-center hover:bg-[#D9381E] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>

                <div className="relative w-full h-[240px] sm:h-[340px] bg-[#141414]">
                  <Image
                    src={expanded.image}
                    alt={expanded.title[lang]}
                    fill
                    sizes="(min-width: 768px) 672px, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded bg-[#141414]/90 text-[#F5F3EE] font-label-sm text-label-sm font-semibold uppercase tracking-wider">
                      {opLabel(expanded.operation)}
                    </span>
                    {expanded.exclusive && <ExclusiveBadge className="px-3 py-1" />}
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <p className="text-[13px] text-[#6B6560] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]" aria-hidden>
                        location_on
                      </span>
                      <span>{expanded.zone[lang]}</span>
                    </p>
                    <h2 id="hero-modal-title" className="font-display text-headline-md text-[#141414] mt-1">
                      {expanded.title[lang]}
                    </h2>
                    <p className="font-body-md text-[#6B6560] mt-2 leading-relaxed">
                      {expanded.summary[lang]}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E5E0D8]">
                    <span className="font-price-display text-[24px] font-bold text-[#141414]">
                      {expanded.price}
                    </span>
                    <Link
                      href={`/${lang}/propiedades/${expanded.slug}`}
                      className="min-h-11 px-6 rounded-xl bg-[#D9381E] text-white font-label-md text-label-md font-semibold hover:bg-[#141414] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141414] transition-colors inline-flex items-center gap-2"
                    >
                      <span>{viewBtnLabel}</span>
                      <span className="material-symbols-outlined text-[18px]" aria-hidden>
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        );
}
