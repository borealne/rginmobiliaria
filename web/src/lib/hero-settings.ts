import { HERO_SLIDES } from "@/lib/data/content";
import type { HeroSlide } from "@/lib/types";

export interface HeroCmsConfig {
  slides: HeroSlide[];
  autoplayEnabled: boolean;
  autoplaySeconds: number;
}

export const HERO_STORAGE_KEY = "rg_hero_cms_v1";
export const HERO_UPDATED_EVENT = "rg-hero-updated";
export const DEFAULT_AUTOPLAY_SECONDS = 4;

export function clampAutoplaySeconds(seconds: number): number {
  if (!Number.isFinite(seconds)) return DEFAULT_AUTOPLAY_SECONDS;
  return Math.min(10, Math.max(1, Math.round(seconds)));
}

export function getDefaultHeroCmsConfig(): HeroCmsConfig {
  return {
    slides: HERO_SLIDES.map((s) => ({
      ...s,
      title: { ...s.title },
      zone: { ...s.zone },
      summary: { ...s.summary },
    })),
    autoplayEnabled: true,
    autoplaySeconds: DEFAULT_AUTOPLAY_SECONDS,
  };
}

export function loadHeroCmsConfig(): HeroCmsConfig {
  const fallback = getDefaultHeroCmsConfig();
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(HERO_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<HeroCmsConfig>;
    const slides =
      Array.isArray(parsed.slides) && parsed.slides.length > 0
        ? parsed.slides
        : fallback.slides;
    return {
      slides,
      autoplayEnabled:
        typeof parsed.autoplayEnabled === "boolean"
          ? parsed.autoplayEnabled
          : fallback.autoplayEnabled,
      autoplaySeconds: clampAutoplaySeconds(
        typeof parsed.autoplaySeconds === "number"
          ? parsed.autoplaySeconds
          : DEFAULT_AUTOPLAY_SECONDS,
      ),
    };
  } catch {
    return fallback;
  }
}

export function saveHeroCmsConfig(config: HeroCmsConfig): HeroCmsConfig {
  const normalized: HeroCmsConfig = {
    slides: config.slides,
    autoplayEnabled: Boolean(config.autoplayEnabled),
    autoplaySeconds: clampAutoplaySeconds(config.autoplaySeconds),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(normalized));
      window.dispatchEvent(new CustomEvent(HERO_UPDATED_EVENT, { detail: normalized }));
    } catch {
      /* almacenamiento no disponible */
    }
  }
  return normalized;
}
