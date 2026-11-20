"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { inferPhotoIcon, normalizePhotos } from "@/lib/properties";
import type { Lang, Photo, Property } from "@/lib/types";

const GROUP_SIZE = 5;
const K_GALLERY_AUTOPLAY = "rg_gallery_autoplay_v1";

export interface ExpandingPhotoGalleryProps {
  photos: (Photo | string)[];
  title: string;
  muted?: boolean;
  lang?: Lang;
  code?: string;
  autoplaySeconds?: number;
}

export function ExpandingPhotoGallery({
  photos: initialPhotos,
  title,
  muted = false,
  lang = "es",
  code,
  autoplaySeconds = 4,
}: ExpandingPhotoGalleryProps) {
  const [overridePhotos, setOverridePhotos] = useState<(Photo | string)[] | null>(null);
  const [overrideAutoplay, setOverrideAutoplay] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Estados del protocolo de Autoplay e interacción humana
  const [isHovered, setIsHovered] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [isPageHidden, setIsPageHidden] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0);

  const resetTimer = useCallback(() => {
    setTimerResetKey((k) => k + 1);
  }, []);

  // Sincronización en vivo con el Panel Administrativo (localStorage)
  useEffect(() => {
    if (!code) return;
    const sync = () => {
      try {
        const rawAdded = localStorage.getItem("rg-panel-propiedades-nuevas");
        if (rawAdded) {
          const addedList = JSON.parse(rawAdded) as Property[];
          const found = Array.isArray(addedList) ? addedList.find((item) => item.code === code) : undefined;
          if (found) {
            if (Array.isArray(found.photos) && found.photos.length > 0) {
              setOverridePhotos(found.photos);
            }
            if (typeof found.galleryAutoplaySeconds === "number" && Number.isFinite(found.galleryAutoplaySeconds)) {
              setOverrideAutoplay(Math.min(10, Math.max(0, Math.round(found.galleryAutoplaySeconds))));
            }
          }
        }
        const rawProps = localStorage.getItem("rg-panel-propiedades");
        if (rawProps) {
          const map = JSON.parse(rawProps) as Record<string, Partial<Property>>;
          const ov = map[code];
          if (ov) {
            if (Array.isArray(ov.photos) && ov.photos.length > 0) {
              setOverridePhotos(ov.photos);
            }
            if (typeof ov.galleryAutoplaySeconds === "number" && Number.isFinite(ov.galleryAutoplaySeconds)) {
              setOverrideAutoplay(Math.min(10, Math.max(0, Math.round(ov.galleryAutoplaySeconds))));
            }
          }
        }
        const rawAutoplay = localStorage.getItem(K_GALLERY_AUTOPLAY);
        if (rawAutoplay) {
          const autoMap = JSON.parse(rawAutoplay) as Record<string, number>;
          if (typeof autoMap?.[code] === "number" && Number.isFinite(autoMap[code])) {
            setOverrideAutoplay(Math.min(10, Math.max(0, Math.round(autoMap[code]))));
          }
        }
      } catch {
        /* ignore */
      }
    };
    sync();
    window.addEventListener("rg-panel-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("rg-panel-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [code]);

  // Detección de visibilidad de pestaña y prefers-reduced-motion
  useEffect(() => {
    const onVisibility = () => {
      setIsPageHidden(document.visibilityState === "hidden");
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setPrefersReducedMotion(mq.matches);
    onMotion();
    mq.addEventListener("change", onMotion);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      mq.removeEventListener("change", onMotion);
    };
  }, []);

  // Solo fotos reales con src válido (nunca casillas vacías)
  const photos = useMemo(
    () =>
      normalizePhotos(overridePhotos ?? initialPhotos).filter((p) =>
        Boolean(p.src && p.src.trim()),
      ),
    [overridePhotos, initialPhotos],
  );

  const effectiveAutoplaySeconds = useMemo(() => {
    const raw = overrideAutoplay ?? autoplaySeconds ?? 4;
    return Math.min(10, Math.max(0, Math.round(Number.isFinite(raw) ? raw : 4)));
  }, [overrideAutoplay, autoplaySeconds]);

  const totalGroups = Math.max(1, Math.ceil(photos.length / GROUP_SIZE));
  const safeGlobalIndex = photos.length > 0 ? activeIndex % photos.length : 0;
  const safeGroupIdx = Math.min(totalGroups - 1, Math.floor(safeGlobalIndex / GROUP_SIZE));
  const visiblePhotos = useMemo(
    () => photos.slice(safeGroupIdx * GROUP_SIZE, (safeGroupIdx + 1) * GROUP_SIZE),
    [photos, safeGroupIdx],
  );
  const safeActiveIdx = Math.max(0, Math.min(visiblePhotos.length - 1, safeGlobalIndex - safeGroupIdx * GROUP_SIZE));

  // Temporizador continuo de Autoplay que recorre todas las fotos (1 a N, cruzando Fotos 1–5 y Fotos 6–10)
  useEffect(() => {
    if (
      effectiveAutoplaySeconds <= 0 ||
      photos.length <= 1 ||
      isHovered ||
      isTouching ||
      isPageHidden ||
      prefersReducedMotion ||
      lightboxIndex !== null
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % photos.length);
    }, effectiveAutoplaySeconds * 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    effectiveAutoplaySeconds,
    photos.length,
    isHovered,
    isTouching,
    isPageHidden,
    prefersReducedMotion,
    lightboxIndex,
    timerResetKey,
  ]);

  const prevLightbox = useCallback(
    () => setLightboxIndex((cur) => (cur == null ? null : (cur - 1 + photos.length) % photos.length)),
    [photos.length],
  );
  const nextLightbox = useCallback(
    () => setLightboxIndex((cur) => (cur == null ? null : (cur + 1) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (lightboxIndex == null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") prevLightbox();
      if (e.key === "ArrowRight") nextLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxIndex, prevLightbox, nextLightbox]);

  if (photos.length === 0) return null;

  const switchGroup = (nextGroup: number) => {
    setActiveIndex(nextGroup * GROUP_SIZE);
    resetTimer();
  };

  return (
    <>
      <section
        aria-label={lang === "en" ? "Property photo gallery" : "Galería de fotos de la propiedad"}
        className={`mt-6 mb-10 ${muted ? "grayscale-[30%]" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          resetTimer();
        }}
        onTouchStart={() => {
          setIsTouching(true);
          resetTimer();
        }}
        onTouchEnd={() => {
          setIsTouching(false);
          resetTimer();
        }}
      >
        <style>{`
          .rg-expanding-cards {
            display: flex;
            flex-direction: row;
            gap: 12px;
            height: 460px;
            width: 100%;
            overflow: hidden;
          }
          .rg-expanding-card {
            position: relative;
            flex: 1 1 0%;
            min-width: 60px;
            border-radius: 30px;
            background-position: center;
            background-size: cover;
            background-repeat: no-repeat;
            cursor: pointer;
            overflow: hidden;
            transition:
              flex-grow 0.5s cubic-bezier(0.05, 0.61, 0.41, 0.95),
              border-radius 0.5s cubic-bezier(0.05, 0.61, 0.41, 0.95),
              filter 0.25s ease;
            user-select: none;
            outline: none;
          }
          .rg-expanding-card:not(.is-active):hover {
            filter: brightness(1.1);
          }
          .rg-expanding-card:focus-visible {
            box-shadow: 0 0 0 3px #D9381E;
          }
          .rg-expanding-card.is-active {
            flex-grow: 10;
            border-radius: 32px;
            cursor: default;
          }
          .rg-expanding-card .rg-card-shadow {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 130px;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
            opacity: 0;
            transition: opacity 0.35s ease;
            pointer-events: none;
          }
          .rg-expanding-card.is-active .rg-card-shadow {
            opacity: 1;
          }
          .rg-expanding-card .rg-card-label {
            position: absolute;
            left: 10px;
            bottom: 10px;
            right: 10px;
            display: flex;
            align-items: center;
            gap: 12px;
            transition:
              left 0.5s cubic-bezier(0.05, 0.61, 0.41, 0.95),
              bottom 0.5s cubic-bezier(0.05, 0.61, 0.41, 0.95);
            pointer-events: none;
            z-index: 2;
          }
          .rg-expanding-card.is-active .rg-card-label {
            left: 24px;
            bottom: 20px;
            right: 24px;
          }
          .rg-expanding-card .rg-card-icon {
            flex: 0 0 40px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #FFFFFF;
            color: #141414;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
          }
          .rg-expanding-card .rg-card-info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            color: #FFFFFF;
            white-space: nowrap;
            opacity: 0;
            transform: translateX(12px);
            transition: opacity 0s ease, transform 0s ease;
            min-width: 0;
          }
          .rg-expanding-card.is-active .rg-card-info {
            opacity: 1;
            transform: translateX(0);
            transition:
              opacity 0.35s ease 0.25s,
              transform 0.35s ease 0.25s;
          }
          @media (max-width: 768px) {
            .rg-expanding-cards {
              flex-direction: column;
              height: 560px;
              gap: 10px;
            }
            .rg-expanding-card {
              min-width: 0;
              min-height: 56px;
              border-radius: 24px;
            }
            .rg-expanding-card.is-active {
              border-radius: 26px;
            }
            .rg-expanding-card .rg-card-label {
              left: 10px;
              bottom: 8px;
            }
            .rg-expanding-card.is-active .rg-card-label {
              left: 16px;
              bottom: 16px;
              right: 16px;
            }
            .rg-expanding-card .rg-card-info {
              white-space: normal;
              max-width: 240px;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .rg-expanding-card,
            .rg-expanding-card .rg-card-shadow,
            .rg-expanding-card .rg-card-label,
            .rg-expanding-card .rg-card-info,
            .rg-expanding-card.is-active .rg-card-info {
              transition: none !important;
            }
          }
        `}</style>

        <div className="rg-expanding-cards">
          {visiblePhotos.map((ph, idx) => {
            const isActive = idx === safeActiveIdx;
            const globalIndex = safeGroupIdx * GROUP_SIZE + idx;
            const captionText =
              lang === "en"
                ? (ph.captionEn || ph.captionEs || ph.room || "").trim()
                : (ph.captionEs || ph.room || "").trim();
            const subText =
              lang === "en" ? (ph.subEn || ph.subEs || "").trim() : (ph.subEs || "").trim();
            const shouldShowCaption = ph.showCaption !== false && (captionText.length > 0 || subText.length > 0);
            const iconName = ph.icon || inferPhotoIcon(ph.captionEs || ph.room);

            const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                resetTimer();
                if (isActive) {
                  setLightboxIndex(globalIndex);
                } else {
                  setActiveIndex(globalIndex);
                }
              }
            };

            return (
              <div
                key={`${ph.src}-${globalIndex}`}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                aria-label={
                  captionText
                    ? `${title} — ${captionText} (${globalIndex + 1}/${photos.length})`
                    : `${title} — ${lang === "en" ? "Photo" : "Foto"} ${globalIndex + 1}/${photos.length}`
                }
                onClick={() => {
                  resetTimer();
                  if (!isActive) {
                    setActiveIndex(globalIndex);
                  }
                }}
                onKeyDown={handleKeyDown}
                className={`rg-expanding-card ${isActive ? "is-active" : ""}`}
                style={{ backgroundImage: `url("${ph.src}")` }}
              >
                {/* Botón discreto en esquina superior derecha de la tarjeta activa para abrir Lightbox */}
                {isActive && (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={lang === "en" ? "Open full screen photo" : "Ampliar fotografía a pantalla completa"}
                    onClick={(e) => {
                      e.stopPropagation();
                      resetTimer();
                      setLightboxIndex(globalIndex);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        e.preventDefault();
                        resetTimer();
                        setLightboxIndex(globalIndex);
                      }
                    }}
                    className="absolute top-4 right-4 z-10 h-9 px-3 rounded-full bg-[#141414]/80 hover:bg-[#D9381E] text-[#F5F3EE] backdrop-blur-sm font-label-sm text-[11px] font-semibold inline-flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]" aria-hidden>
                      open_in_full
                    </span>
                    <span className="hidden sm:inline">
                      {lang === "en" ? "Expand" : "Ampliar"}
                    </span>
                  </div>
                )}

                {/* Gradiente oscuro inferior: SOLO se renderiza si el ojito está activo y hay texto */}
                {shouldShowCaption && <div className="rg-card-shadow" aria-hidden />}

                {/* Círculo blanco (40px) con icono + bloque .info */}
                <div className="rg-card-label">
                  <div className="rg-card-icon">
                    {ph.customIcon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ph.customIcon} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                      <span className="material-symbols-outlined text-[20px] text-[#141414]" aria-hidden>
                        {iconName}
                      </span>
                    )}
                  </div>

                  {shouldShowCaption && (
                    <div className="rg-card-info">
                      {captionText && (
                        <div className="font-title-md text-[15px] md:text-[17px] font-bold leading-snug text-white drop-shadow-sm line-clamp-2 md:truncate">
                          {captionText}
                        </div>
                      )}
                      {subText && (
                        <div className="font-body-sm text-[12px] md:text-[13px] text-white/85 leading-snug drop-shadow-sm line-clamp-2 md:truncate">
                          {subText}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Barra inferior de paginación (solo si hay más de 5 fotos reales) + Botón «Ver todas las fotos (N)» */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {totalGroups > 1 ? (
            <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-surface-container-low border border-[#ECEAE7]">
              {Array.from({ length: totalGroups }, (_, gIdx) => {
                const startNum = gIdx * GROUP_SIZE + 1;
                const endNum = Math.min((gIdx + 1) * GROUP_SIZE, photos.length);
                const selected = gIdx === safeGroupIdx;
                return (
                  <button
                    key={gIdx}
                    type="button"
                    onClick={() => switchGroup(gIdx)}
                    className={`h-9 px-3.5 rounded-lg font-label-sm text-label-sm font-semibold transition-all cursor-pointer ${
                      selected
                        ? "bg-[#141414] text-[#F5F3EE] shadow-sm"
                        : "text-secondary hover:text-primary"
                    }`}
                  >
                    {lang === "en" ? `Photos ${startNum}–${endNum}` : `Fotos ${startNum}–${endNum}`}
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden>
                touch_app
              </span>
              {lang === "en"
                ? "Click any strip to expand the space"
                : "Haz clic en cada franja para desplegar el ambiente"}
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              resetTimer();
              setLightboxIndex(safeGlobalIndex);
            }}
            className="h-11 px-4 rounded-xl bg-surface-container-lowest hover:bg-[#141414] text-[#141414] hover:text-[#F5F3EE] border border-[#ECEAE7] hover:border-[#141414] font-label-md text-label-md font-semibold inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden>
              grid_view
            </span>
            <span>
              {lang === "en"
                ? `View all photos (${photos.length})`
                : `Ver todas las fotos (${photos.length})`}
            </span>
          </button>
        </div>
      </section>

      {/* Visor Lightbox a pantalla completa */}
      {lightboxIndex != null && photos[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lang === "en" ? "Full screen photo viewer" : "Visor de fotos a pantalla completa"}
          className="fixed inset-0 z-[80] bg-black/92 flex flex-col justify-between p-4 md:p-8 animate-fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          <div className="flex items-center justify-between text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white text-[#141414] flex items-center justify-center shrink-0">
                {photos[lightboxIndex].customIcon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photos[lightboxIndex].customIcon} alt="" className="w-5 h-5 object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]" aria-hidden>
                    {photos[lightboxIndex].icon || inferPhotoIcon(photos[lightboxIndex].captionEs || photos[lightboxIndex].room)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <span className="block font-label-md text-label-md font-semibold truncate">
                  {photos[lightboxIndex].showCaption !== false
                    ? (lang === "en"
                        ? photos[lightboxIndex].captionEn || photos[lightboxIndex].captionEs || photos[lightboxIndex].room
                        : photos[lightboxIndex].captionEs || photos[lightboxIndex].room) || title
                    : title}{" "}
                  · {lightboxIndex + 1} / {photos.length}
                </span>
                {photos[lightboxIndex].showCaption !== false &&
                  (lang === "en" ? photos[lightboxIndex].subEn || photos[lightboxIndex].subEs : photos[lightboxIndex].subEs) && (
                    <span className="block font-body-sm text-[12px] text-white/75 truncate">
                      {lang === "en"
                        ? photos[lightboxIndex].subEn || photos[lightboxIndex].subEs
                        : photos[lightboxIndex].subEs}
                    </span>
                  )}
              </div>
            </div>
            <button
              type="button"
              aria-label={lang === "en" ? "Close viewer" : "Cerrar visor"}
              onClick={() => setLightboxIndex(null)}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div
            className="relative flex-1 my-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[lightboxIndex].src}
              alt={photos[lightboxIndex].captionEs || photos[lightboxIndex].room || title}
              fill
              sizes="100vw"
              className="object-contain"
              unoptimized={
                photos[lightboxIndex].src.startsWith("blob:") ||
                photos[lightboxIndex].src.startsWith("data:")
              }
            />
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label={lang === "en" ? "Previous photo" : "Foto anterior"}
                  onClick={prevLightbox}
                  className="absolute left-2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  type="button"
                  aria-label={lang === "en" ? "Next photo" : "Foto siguiente"}
                  onClick={nextLightbox}
                  className="absolute right-2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </>
            )}
          </div>

          <div
            className="flex gap-2 overflow-x-auto no-scrollbar justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {photos.map((p, k) => (
              <button
                key={`${p.src}-${k}`}
                type="button"
                aria-label={`${lang === "en" ? "Go to photo" : "Ir a foto"} ${k + 1}`}
                onClick={() => setLightboxIndex(k)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 cursor-pointer ${
                  k === lightboxIndex ? "border-white" : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <Image
                  src={p.src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized={p.src.startsWith("blob:") || p.src.startsWith("data:")}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
