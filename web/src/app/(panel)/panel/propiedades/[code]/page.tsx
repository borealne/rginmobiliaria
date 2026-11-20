"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { usePanel } from "@/components/panel/PanelProvider";
import { FaqTab, SimulatorTab } from "@/components/panel/editor/Extras";
import { MainData } from "@/components/panel/editor/MainData";
import { Photos, TechSheet, VideoTab } from "@/components/panel/editor/TechAndPhotos";
import type { Draft } from "@/components/panel/editor/types";
import { StatusChip } from "@/components/ui/Badges";
import { privateOf } from "@/lib/data/private";
import {
  collectUsedPropertyCodes,
  createDefaultFeatureGroups,
  ensureFeatureGroups,
  generateNextPropertyCode,
  inferPhotoIcon,
  isPublic,
  normalizeCode,
  normalizePhotos,
  registerUsedPropertyCode,
  STATUS_META,
} from "@/lib/properties";
import type { Property, PropertyType, Status } from "@/lib/types";

const TABS = [
  { id: "datos", label: "1. Datos principales", icon: "tune" },
  { id: "ficha", label: "2. Ficha técnica y fotos", icon: "photo_library" },
  { id: "video", label: "3. Video", icon: "videocam" },
  { id: "simulador", label: "4. Simulador", icon: "calculate" },
  { id: "preguntas", label: "5. Preguntas frecuentes", icon: "help_outline" },
];

const K_PHOTO_SLOTS = "rg-panel-photo-slots";
const K_GALLERY_AUTOPLAY = "rg_gallery_autoplay_v1";

function loadSavedGalleryAutoplay(code: string, fallback = 4): number {
  const safeFallback = Math.min(10, Math.max(0, Math.round(Number.isFinite(fallback) ? fallback : 4)));
  if (typeof window === "undefined" || !code) return safeFallback;
  try {
    const raw = localStorage.getItem(K_GALLERY_AUTOPLAY);
    if (!raw) return safeFallback;
    const map = JSON.parse(raw) as Record<string, number>;
    const val = map?.[code];
    return typeof val === "number" && Number.isFinite(val)
      ? Math.min(10, Math.max(0, Math.round(val)))
      : safeFallback;
  } catch {
    return safeFallback;
  }
}

function saveGalleryAutoplay(code: string, seconds: number) {
  if (typeof window === "undefined" || !code) return;
  try {
    const clamped = Math.min(10, Math.max(0, Math.round(Number.isFinite(seconds) ? seconds : 4)));
    const raw = localStorage.getItem(K_GALLERY_AUTOPLAY);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    map[code] = clamped;
    localStorage.setItem(K_GALLERY_AUTOPLAY, JSON.stringify(map));
    window.dispatchEvent(new Event("rg-panel-updated"));
  } catch {
    /* ignore */
  }
}

const memoryPhotoSlots = new Map<string, Draft["photos"]>();

function loadSavedPhotoSlots(code: string): Draft["photos"] | null {
  if (!code) return null;
  const inMem = memoryPhotoSlots.get(code);
  if (inMem && Array.isArray(inMem)) return inMem;
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(K_PHOTO_SLOTS);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, Draft["photos"]>;
    if (Array.isArray(map?.[code])) {
      memoryPhotoSlots.set(code, map[code]);
      return map[code];
    }
    return null;
  } catch {
    return null;
  }
}

function savePhotoSlots(code: string, photos: Draft["photos"]) {
  if (!code) return;
  memoryPhotoSlots.set(code, photos);
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(K_PHOTO_SLOTS);
    const map: Record<string, Draft["photos"]> = raw ? JSON.parse(raw) : {};
    map[code] = photos;
    localStorage.setItem(K_PHOTO_SLOTS, JSON.stringify(map));
  } catch {
    /* Si las fotos en base64 exceden la cuota de localStorage, memoryPhotoSlots conserva el estado en sesión */
  }
}

function toDraft(p?: Property, code = "CA-002"): Draft {
  if (!p)
    return {
      code,
      title: "",
      titleEn: "",
      summary: "",
      description: "",
      operation: "venta",
      status: "disponible",
      type: "casa",
      price: 0,
      zone: "Ricaurte",
      exclusive: false,
      featured: false,
      slider: false,
      housing: null,
      base: baseFields(),
      groups: createDefaultFeatureGroups(),
      photos: loadSavedPhotoSlots(code) ?? [],
      galleryAutoplaySeconds: loadSavedGalleryAutoplay(code, 4),
      video: "",
      showSimulator: true,
      faqs: [],
      priv: { kind: "compartida", advisor: "raul" },
    };
  const savedSlots = loadSavedPhotoSlots(p.code);
  const normPhotos = normalizePhotos(p.photos);
  const mappedPhotos: Draft["photos"] = normPhotos.map((ph, k) => ({
    id: `${p.code}-${k}`,
    src: ph.src,
    room: ph.captionEs ?? ph.room,
    captionEs: ph.captionEs ?? ph.room,
    captionEn: ph.captionEn ?? "",
    subEs: ph.subEs ?? "",
    subEn: ph.subEn ?? "",
    showCaption: ph.showCaption !== false,
    icon: ph.icon ?? inferPhotoIcon(ph.captionEs ?? ph.room),
    customIcon: ph.customIcon,
  }));
  return {
    code: p.code,
    title: p.title,
    titleEn: "",
    summary: p.summary,
    description: p.description.join("\n\n"),
    operation: p.operation,
    status: p.status,
    type: p.type,
    price: p.price,
    priceFrom: p.priceFrom,
    zone: p.zone,
    exclusive: p.exclusive,
    featured: p.featured,
    slider: p.slider,
    housing: p.housing,
    progress: p.progress,
    delivery: p.delivery,
    yearBuilt: p.yearBuilt,
    base: baseFields(p),
    groups: ensureFeatureGroups(p),
    photos: savedSlots ?? mappedPhotos,
    galleryAutoplaySeconds: loadSavedGalleryAutoplay(p.code, p.galleryAutoplaySeconds ?? 4),
    video: p.videoUrl ?? (p.videoThumb ? "https://youtu.be/ejemplo123" : ""),
    showSimulator: p.operation === "venta",
    faqs: p.faqs ?? [],
    priv: { ...privateOf(p.code), kind: p.exclusive ? "exclusiva" : "compartida" },
  };
}

function baseFields(p?: Property): Draft["base"] {
  const s = (v?: number) => (v == null ? "" : String(v));
  return [
    { id: "built", label: "Área de construcción", value: s(p?.areaBuilt), unit: "m²", icon: "straighten" },
    { id: "land", label: "Área de terreno", value: s(p?.areaLand), unit: "m²", icon: "crop_free" },
    { id: "bed", label: "Habitaciones", value: s(p?.bedrooms), icon: "bed" },
    { id: "bath", label: "Baños completos", value: s(p?.bathrooms), icon: "shower" },
    { id: "half", label: "Medios baños", value: p?.bathroomsNote ? "1" : "", icon: "bathtub" },
    { id: "park", label: "Parqueaderos", value: s(p?.parking), icon: "garage" },
    { id: "year", label: "Año de construcción", value: s(p?.yearBuilt), icon: "calendar_today" },
    { id: "floors", label: "Niveles / pisos", value: p?.type === "casa" ? "2" : "", icon: "stairs" },
  ];
}

function statusOptions(op: Property["operation"]): Status[] {
  return op === "venta" ? ["disponible", "reservada", "en-construccion", "sobre-planos", "vendida"] : ["disponible", "reservada", "alquilada"];
}

function Editor() {
  const { code } = useParams<{ code: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const tab = sp.get("tab") ?? "datos";
  const { properties, addProperty, updateProperty, toast } = usePanel();
  const isNew = code === "nueva";
  const original = useMemo(() => properties.find((p) => p.code === code), [properties, code]);
  const [d, setD] = useState<Draft>(() =>
    toDraft(original, isNew ? generateNextPropertyCode("casa", properties.map((p) => p.code)) : code),
  );
  const [dirty, setDirty] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const justSavedRef = useRef(false);

  useEffect(() => {
    if (justSavedRef.current) {
      justSavedRef.current = false;
      return;
    }
    if (!dirty) {
      setD(
        toDraft(
          original,
          isNew ? generateNextPropertyCode("casa", properties.map((p) => p.code)) : code,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [original]);

  const set = (patch: Partial<Draft>) => {
    setD((x) => ({ ...x, ...patch }));
    setDirty(true);
  };

  const usedCodesWithoutSelf = useMemo(() => {
    const setCodes = collectUsedPropertyCodes(properties.map((p) => p.code));
    if (!isNew && original?.code) {
      setCodes.delete(normalizeCode(original.code));
    }
    return setCodes;
  }, [properties, isNew, original]);

  const codeConflict = useMemo(() => {
    const clean = normalizeCode(d.code);
    if (!clean) return false;
    return usedCodesWithoutSelf.has(clean);
  }, [d.code, usedCodesWithoutSelf]);

  const handleGenerateCode = () => {
    const nextCode = generateNextPropertyCode(d.type, properties.map((p) => p.code));
    set({ code: nextCode });
  };

  const handleChangeType = (nextType: PropertyType) => {
    const nextCode = generateNextPropertyCode(nextType, properties.map((p) => p.code));
    set({ type: nextType, code: nextCode });
  };

  const sliderUsed = properties.filter((p) => p.slider && p.code !== d.code).length + (d.slider ? 1 : 0);

  if (!isNew && !original)
    return (
      <div className="py-20 text-center">
        <p className="font-headline-sm text-headline-sm">No encontramos la propiedad {code}.</p>
        <Link href="/panel/propiedades" className="mt-4 inline-flex h-12 px-6 items-center rounded-lg bg-primary text-on-primary">
          Volver al inventario
        </Link>
      </div>
    );

  const save = () => {
    if (!d.code.trim() || codeConflict) {
      toast("Corrige el código único antes de guardar.");
      return;
    }
    const normalizedCode = normalizeCode(d.code);
    const effectiveTitle = d.title.trim() || original?.title || `Propiedad ${normalizedCode}`;
    const num = (id: string) => {
      const v = d.base.find((b) => b.id === id)?.value;
      return v ? Number(v.replace(",", ".")) : undefined;
    };
    registerUsedPropertyCode(normalizedCode);
    if (original?.code) {
      registerUsedPropertyCode(original.code);
    }
    const clampedAutoplay = Math.min(10, Math.max(0, Math.round(d.galleryAutoplaySeconds ?? 4)));
    savePhotoSlots(normalizedCode, d.photos);
    saveGalleryAutoplay(normalizedCode, clampedAutoplay);
    const sanitizedGroups = d.groups.map((g) => ({
      ...g,
      items: g.items
        .filter((it) => Boolean((it.label && it.label.trim()) || (it.labelEn && it.labelEn.trim())))
        .map((it) => ({
          ...it,
          label: (it.label || it.labelEn || "").trim(),
          labelEn: it.labelEn?.trim() || undefined,
          detail: it.detail?.trim() || undefined,
          detailEn: it.detailEn?.trim() || undefined,
        })),
    }));
    const uploadedPhotos = d.photos.filter((p) => Boolean(p.src && p.src.trim()));
    const payload = {
      code: normalizedCode,
      title: effectiveTitle,
      summary: d.summary,
      description: d.description.split(/\n{2,}/).filter(Boolean),
      operation: d.operation,
      status: d.status,
      type: d.type,
      price: d.price,
      priceFrom: d.priceFrom,
      zone: d.zone,
      exclusive: d.exclusive,
      featured: d.featured,
      slider: d.status === "vendida" || d.status === "alquilada" ? false : d.slider,
      housing: d.housing,
      progress: d.progress,
      delivery: d.delivery,
      yearBuilt: d.yearBuilt,
      areaBuilt: num("built"),
      areaLand: num("land"),
      bedrooms: num("bed"),
      bathrooms: num("bath"),
      parking: num("park"),
      featureGroups: sanitizedGroups,
      galleryAutoplaySeconds: clampedAutoplay,
      photos: uploadedPhotos.map((p) => {
        const capEs = (p.captionEs ?? p.room ?? "").trim() || "Sin nombre";
        return {
          src: p.src,
          room: capEs,
          captionEs: capEs,
          captionEn: (p.captionEn ?? "").trim(),
          subEs: (p.subEs ?? "").trim(),
          subEn: (p.subEn ?? "").trim(),
          showCaption: p.showCaption !== false,
          icon: p.icon || inferPhotoIcon(capEs),
          customIcon: p.customIcon,
        };
      }),
      videoUrl: d.video.trim() || undefined,
      videoThumb: d.video.trim() ? (original?.videoThumb ?? uploadedPhotos[0]?.src ?? "/img/p/19.jpg") : undefined,
      faqs: d.faqs.filter((f) => f.q && f.a),
      ...(d.status === "vendida" || d.status === "alquilada" ? { closedAt: original?.closedAt ?? new Date().toISOString().slice(0, 10) } : {}),
    };
    justSavedRef.current = true;
    if (isNew) {
      const slug = `${normalizedCode}-${effectiveTitle}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      addProperty({
        ...payload,
        code: normalizedCode,
        slug,
        published: false,
        country: "Ecuador",
        province: "Azuay",
        city: "Cuenca",
        features: d.groups.flatMap((g) => g.items.map((i) => i.label)),
        createdAt: new Date().toISOString().slice(0, 10),
      });
      setDirty(false);
      toast(`Borrador ${normalizedCode} guardado en este navegador`);
      router.replace(`/panel/propiedades/${normalizedCode}?tab=${tab}`, { scroll: false });
      return;
    }
    updateProperty(original!.code, payload);
    setDirty(false);
    toast(`Cambios de ${normalizedCode} guardados`);
  };

  const discard = () => {
    setD(toDraft(original, d.code));
    setDirty(false);
  };

  const pub = original && isPublic(original);

  return (
    <div className="flex flex-col w-full pt-6 pb-24">
      <header className="w-full bg-surface-container-lowest shadow-sm rounded-xl mb-6 px-5 sm:px-6 py-5 border border-[#ECEAE7]">
        <nav className="flex items-center gap-2 text-secondary font-label-sm text-label-sm flex-wrap mb-3" aria-label="Ruta">
          <span className="material-symbols-outlined text-[16px]">home</span>
          <Link href="/panel/propiedades" className="hover:text-primary">
            Propiedades
          </Link>
          <span>/</span>
          <span className="text-primary font-medium">{isNew ? "Nueva propiedad" : `${d.code} · ${d.title}`}</span>
        </nav>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-headline-md text-headline-md text-primary">{d.title || "Nueva propiedad"}</h1>
            <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-2 py-1 rounded">{d.code}</span>
            <div className="relative">
              <button type="button" aria-haspopup="listbox" aria-expanded={statusOpen} onClick={() => setStatusOpen((v) => !v)} className="flex items-center gap-1 min-h-11" aria-label="Cambiar estado">
                <StatusChip status={d.status} progress={d.progress} />
                <span className="material-symbols-outlined text-secondary">arrow_drop_down</span>
              </button>
              {statusOpen && (
                <ul role="listbox" aria-label="Estado" className="absolute z-30 top-12 left-0 w-56 bg-surface-container-lowest border border-[#ECEAE7] rounded-lg shadow-lg py-1">
                  {statusOptions(d.operation).map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={d.status === s}
                        onClick={() => {
                          set({ status: s, slider: s === "vendida" || s === "alquilada" ? false : d.slider });
                          setStatusOpen(false);
                        }}
                        className="w-full min-h-11 px-3 flex items-center justify-between hover:bg-surface-container-low font-body-sm text-body-sm"
                      >
                        <span className="flex items-center gap-2">
                          <span className={`material-symbols-outlined icon-fill text-[16px] ${STATUS_META[s].fg}`}>{STATUS_META[s].icon}</span>
                          {STATUS_META[s].label}
                        </span>
                        {d.status === s && <span className="material-symbols-outlined text-[16px]">check</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={discard} disabled={!dirty} className="h-11 px-4 rounded-lg font-label-md text-label-md text-secondary hover:bg-surface-container flex items-center gap-1.5 disabled:opacity-40">
              <span className="material-symbols-outlined text-[18px]">undo</span>Descartar cambios
            </button>
            {pub && (
              <a href={`/es/propiedades/${original!.slug}`} target="_blank" className="h-11 px-4 rounded-lg bg-surface-container font-label-md text-label-md flex items-center gap-1.5 hover:bg-surface-variant">
                <span className="material-symbols-outlined text-[18px]">visibility</span>Ver ficha pública
              </a>
            )}
            <button
              type="button"
              onClick={save}
              disabled={codeConflict || !d.code.trim()}
              className="h-11 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>Guardar cambios
            </button>
          </div>
        </div>
      </header>

      <nav className="w-full bg-surface-container-lowest rounded-xl shadow-sm px-2 sm:px-4 mb-6 overflow-x-auto no-scrollbar border border-[#ECEAE7]" aria-label="Secciones del editor">
        <ul className="flex gap-1 min-w-max">
          {TABS.map((t) => (
            <li key={t.id}>
              <Link
                href={`?tab=${t.id}`}
                scroll={false}
                aria-current={tab === t.id ? "page" : undefined}
                className={`flex items-center gap-2 px-3 min-h-12 border-b-2 font-label-md text-label-md whitespace-nowrap transition-colors ${
                  tab === t.id ? "border-primary text-primary font-semibold" : "border-transparent text-secondary hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden>
                  {t.icon}
                </span>
                {t.label}
                {t.id === "ficha" && (
                  <span className="px-1.5 py-0.5 rounded-full bg-surface-container font-label-sm text-[11px]">
                    {d.photos.filter((p) => Boolean(p.src && p.src.trim())).length}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {tab === "datos" && (
        <MainData
          d={d}
          set={set}
          sliderUsed={sliderUsed}
          codeConflict={codeConflict}
          onGenerateCode={handleGenerateCode}
          onChangeType={handleChangeType}
        />
      )}
      {tab === "ficha" && (
        <div className="flex flex-col gap-6">
          <TechSheet d={d} set={set} />
          <Photos d={d} set={set} onSave={save} dirty={dirty} />
          <VideoTab d={d} set={set} />
        </div>
      )}
      {tab === "video" && <VideoTab d={d} set={set} />}
      {tab === "simulador" && <SimulatorTab d={d} set={set} />}
      {tab === "preguntas" && <FaqTab d={d} set={set} />}

      {dirty && (
        <div className="fixed bottom-4 left-1/2 lg:left-[calc(50%+130px)] -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl bg-primary text-on-primary rounded-xl shadow-2xl px-4 py-3 flex items-center justify-between gap-3 animate-fade-in" role="status">
          <span className="font-body-sm text-body-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rg-red" aria-hidden />
            Hay cambios sin guardar en {d.code}
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={discard} className="h-10 px-3 rounded-lg font-label-md text-label-md hover:bg-white/10">
              Descartar
            </button>
            <button
              type="button"
              onClick={save}
              disabled={codeConflict || !d.code.trim()}
              className="h-10 px-4 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense>
      <Editor />
    </Suspense>
  );
}
