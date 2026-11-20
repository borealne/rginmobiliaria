"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { CloseButton, Modal } from "@/components/ui/Modal";
import { parseVideoUrl } from "@/lib/video";
import type { FeatureGroup, FeatureItem, Lang } from "@/lib/types";
import { Card, PField, Segmented, pInput } from "../ui";
import type { Draft, DraftPhoto } from "./types";

const MAX_PHOTOS = 10;
const MAX_MB = 5;
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const ICON_TYPES = ["image/svg+xml", "image/png", "image/webp"];

/** Librería técnica e inmobiliaria para Ficha Técnica (Parte 2.1). */
export const TECH_ICON_LIBRARY: { id: string; label: string }[] = [
  { id: "wifi", label: "Wi-Fi / Fibra" },
  { id: "water_drop", label: "Agua potable" },
  { id: "bolt", label: "Electricidad / Rayo" },
  { id: "cable", label: "Cableado soterrado" },
  { id: "speed", label: "Medidor" },
  { id: "verified_user", label: "Seguridad / Escudo" },
  { id: "pool", label: "Piscina" },
  { id: "yard", label: "Jardín" },
  { id: "park", label: "Árbol / Parque" },
  { id: "elevator", label: "Ascensor" },
  { id: "fitness_center", label: "Gimnasio" },
  { id: "directions_car", label: "Parqueadero" },
  { id: "countertops", label: "Cocina / Mesones" },
  { id: "ac_unit", label: "Aire acondicionado" },
  { id: "landscape", label: "Vista / Montaña" },
  { id: "fireplace", label: "Chimenea" },
  { id: "window", label: "Ventanales" },
  { id: "checkroom", label: "Closets / Vestidor" },
  { id: "outdoor_grill", label: "BBQ / Parrilla" },
  { id: "fence", label: "Cerramiento" },
  { id: "notifications_active", label: "Alarma / Sensores" },
  { id: "ring_volume", label: "Citófono / Video portero" },
  { id: "add_road", label: "Vía / Acceso" },
  { id: "grid_view", label: "Porcelanato / Acabados" },
  { id: "balcony", label: "Terraza / Balcón" },
  { id: "chair", label: "Sala / Mobiliario" },
  { id: "inventory_2", label: "Bodega" },
  { id: "local_laundry_service", label: "Lavandería" },
];

/** Librería de iconos para el círculo blanco de 40px en cada foto (Parte 2.2). */
export const PHOTO_ICON_LIBRARY: { id: string; label: string }[] = [
  { id: "bed", label: "Dormitorio" },
  { id: "weekend", label: "Sala" },
  { id: "countertops", label: "Cocina" },
  { id: "yard", label: "Jardín" },
  { id: "pool", label: "Piscina" },
  { id: "balcony", label: "Terraza" },
  { id: "bathtub", label: "Baño" },
  { id: "home", label: "Fachada" },
  { id: "landscape", label: "Vista / Montaña" },
  { id: "directions_car", label: "Parqueadero" },
  { id: "menu_book", label: "Estudio" },
  { id: "stairs", label: "Doble Altura" },
  { id: "fireplace", label: "Chimenea / BBQ" },
  { id: "grid_view", label: "Plano arquitectónico" },
];

const CATEGORY_ICON_LIBRARY: { id: string; label: string }[] = [
  { id: "chair", label: "Interior" },
  { id: "deck", label: "Exterior" },
  { id: "verified_user", label: "Amenidades y seguridad" },
  { id: "bolt", label: "Servicios y eficiencia" },
  { id: "pool", label: "Áreas sociales" },
  { id: "domain", label: "Edificio / Proyecto" },
  { id: "eco", label: "Sostenibilidad" },
  { id: "tune", label: "General" },
];

const MAX_ICON_BYTES = 500 * 1024; // 500 KB

function readIconAsDataUrl(file: File, onDone: (dataUrl: string) => void, onError?: (msg: string) => void) {
  if (!ICON_TYPES.includes(file.type)) {
    onError?.(
      "Formato no admitido para icono. Sube un archivo SVG, PNG o WebP (máx. 500 KB). Si querías subir la fotografía de la propiedad, usa el recuadro de imagen de la izquierda.",
    );
    return;
  }
  if (file.size > MAX_ICON_BYTES) {
    const sizeLabel =
      file.size >= 1024 * 1024
        ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
    onError?.(
      `El archivo seleccionado (${sizeLabel}) supera el máximo de 500 KB para un icono. Si querías subir la fotografía de la propiedad, usa el recuadro «+ Subir imagen» de la izquierda.`,
    );
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") {
      onDone(reader.result);
    }
  };
  reader.readAsDataURL(file);
}

/** A3 · Ficha técnica flexible y fotos con iconos personalizables. */
export function TechSheet({ d, set }: { d: Draft; set: (p: Partial<Draft>) => void }) {
  const [lang, setLang] = useState<Lang>("es");
  const [fieldModal, setFieldModal] = useState<{ catIndex: number; itemIndex?: number } | null>(null);
  const [catModal, setCatModal] = useState(false);
  const [collapsedCats, setCollapsedCats] = useState<Record<number, boolean>>({});
  const [openIconPopover, setOpenIconPopover] = useState<string | null>(null);
  const [popoverIconErr, setPopoverIconErr] = useState<string | null>(null);
  const popoverFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const toggleCategoryVisibility = (gi: number) => {
    const groups = d.groups.map((g, k) => (k === gi ? { ...g, visible: g.visible === false ? true : false } : g));
    set({ groups });
  };

  const toggleCategoryCollapse = (gi: number) => {
    setCollapsedCats((prev) => ({ ...prev, [gi]: !prev[gi] }));
    setOpenIconPopover(null);
    setPopoverIconErr(null);
  };

  const updateCategoryIcon = (gi: number, icon: string, customIcon?: string) => {
    const groups = d.groups.map((g, k) => (k === gi ? { ...g, icon, customIcon } : g));
    set({ groups });
  };

  const updateCategoryTitle = (gi: number, val: string) => {
    const groups = d.groups.map((g, k) =>
      k === gi ? (lang === "es" ? { ...g, title: val } : { ...g, titleEn: val }) : g,
    );
    set({ groups });
  };

  const updateItem = (gi: number, ii: number, patch: Partial<FeatureItem>) => {
    const groups = d.groups.map((g, k) => {
      if (k !== gi) return g;
      const items = g.items.map((it, j) => (j === ii ? { ...it, ...patch } : it));
      return { ...g, items };
    });
    set({ groups });
  };

  const removeItem = (gi: number, ii: number) => {
    const key = `${gi}-${ii}`;
    if (openIconPopover === key) {
      setOpenIconPopover(null);
      setPopoverIconErr(null);
    }
    const groups = d.groups.map((g, k) =>
      k === gi ? { ...g, items: g.items.filter((_, j) => j !== ii) } : g,
    );
    set({ groups });
  };

  const addInlineItem = (gi: number) => {
    setCollapsedCats((prev) => ({ ...prev, [gi]: false }));
    const defaultIcon = TECH_ICON_LIBRARY[d.groups[gi]?.items.length % TECH_ICON_LIBRARY.length]?.id ?? "check_circle";
    const nextGroups = d.groups.map((g, k) =>
      k === gi
        ? {
            ...g,
            items: [
              ...g.items,
              {
                icon: defaultIcon,
                label: "",
                labelEn: "",
                detail: "",
                detailEn: "",
              },
            ],
          }
        : g,
    );
    set({ groups: nextGroups });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 bg-surface-container-low rounded-xl border border-[#ECEAE7]">
        <div>
          <p className="font-title-md text-title-md font-bold text-primary">Ficha técnica dinámica (ES / EN)</p>
          <p className="font-body-sm text-body-sm text-secondary">
            Configura las 4 categorías base en cuadrícula de 2 columnas o crea nuevas, elige iconos de la librería o sube tu propio SVG/PNG, y activa u oculta categorías con el ojito.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="shrink-0">
            <Segmented
              label="Idioma de ficha técnica"
              value={lang}
              onChange={setLang}
              options={[
                { v: "es", l: "Español · ES" },
                { v: "en", l: "English · EN" },
              ]}
            />
          </div>
          <button
            type="button"
            onClick={() => setFieldModal({ catIndex: 0 })}
            className="h-11 px-4 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] hover:border-[#141414]/25 hover:shadow-sm font-label-md text-label-md font-semibold flex items-center gap-1.5 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>+ Agregar campo
          </button>
          <button
            type="button"
            onClick={() => setCatModal(true)}
            className="h-11 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 hover:shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">create_new_folder</span>+ Agregar categoría
          </button>
        </div>
      </div>

      <Card icon="square_foot" title="Datos principales" subtitle="Construcción y terreno siempre por separado">
        <div className="p-3 rounded-lg bg-st-building-bg/60 text-on-surface font-body-sm text-body-sm flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px] text-st-building">info</span>
          El área de terreno y el área de construcción se registran por separado.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {d.base.map((f, k) => (
            <PField key={f.id} label={f.label}>
              {(id) => (
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-secondary" aria-hidden>
                    {f.icon}
                  </span>
                  <input
                    id={id}
                    className={`${pInput} pl-10 ${f.unit ? "pr-10" : ""}`}
                    value={f.value}
                    onChange={(e) => {
                      const base = [...d.base];
                      base[k] = { ...f, value: e.target.value };
                      set({ base });
                    }}
                  />
                  {f.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary font-label-md">{f.unit}</span>}
                </div>
              )}
            </PField>
          ))}
        </div>
      </Card>

      {/* Cuadrícula compacta de 2 columnas adaptada al sidebar (xl:grid-cols-2) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        {d.groups.map((g, gi) => {
          const isVisible = g.visible !== false;
          const isCollapsed = Boolean(collapsedCats[gi]);
          const displayTitle = (lang === "en" ? g.titleEn || g.title : g.title) || `Categoría ${gi + 1}`;
          return (
            <section
              key={`cat-card-${gi}`}
              aria-label={`Categoría ${gi + 1}: ${displayTitle}`}
              className={`rounded-2xl bg-surface-container-lowest border border-[#ECEAE7] hover:border-[#141414]/25 hover:shadow-sm transition-all duration-200 p-4 flex flex-col gap-3 ${
                !isVisible ? "opacity-75 border-dashed" : ""
              }`}
            >
              {/* Cabecera limpia y compacta de la categoría */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#141414]/10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-[#141414] text-[#F5F3EE] flex items-center justify-center shrink-0">
                    {g.customIcon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={g.customIcon} alt="" className="w-4 h-4 object-contain" />
                    ) : (
                      <span className="material-symbols-outlined text-[18px]" aria-hidden>
                        {g.icon || "tune"}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex items-center gap-2 flex-wrap">
                    <h3 className="font-title-md text-[14px] font-bold text-primary truncate">
                      {gi + 1}. {displayTitle}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-[11px] font-semibold text-secondary shrink-0">
                      {g.items.length} {g.items.length === 1 ? "campo" : "campos"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Selector compacto de icono de categoría */}
                  <label className="sr-only" htmlFor={`cat-icon-${gi}`}>
                    Icono de categoría {g.title}
                  </label>
                  <select
                    id={`cat-icon-${gi}`}
                    value={g.icon || "chair"}
                    onChange={(e) => updateCategoryIcon(gi, e.target.value, g.customIcon)}
                    className="h-8 px-2 rounded-lg bg-surface-container-low border border-[#ECEAE7] hover:border-[#141414]/25 font-label-sm text-[11px] text-primary transition-all duration-200 cursor-pointer"
                    title="Cambiar icono de categoría"
                  >
                    {CATEGORY_ICON_LIBRARY.map((ic) => (
                      <option key={ic.id} value={ic.id}>
                        {ic.label}
                      </option>
                    ))}
                  </select>

                  {/* Botón de visibilidad (Ojito Visible / Oculto) */}
                  <button
                    type="button"
                    onClick={() => toggleCategoryVisibility(gi)}
                    aria-pressed={isVisible}
                    title={isVisible ? "Ocultar esta categoría en la web pública" : "Mostrar esta categoría en la web pública"}
                    className={`h-8 px-2.5 rounded-lg font-label-sm text-[11px] font-semibold inline-flex items-center gap-1 border transition-all duration-200 active:scale-[0.98] cursor-pointer shrink-0 ${
                      isVisible
                        ? "bg-[#141414] text-[#F5F3EE] border-[#141414]"
                        : "bg-surface-container-low text-secondary border-[#ECEAE7] hover:border-[#141414]/25 hover:text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {isVisible ? "visibility" : "visibility_off"}
                    </span>
                    <span>{isVisible ? "Visible" : "Oculto"}</span>
                  </button>

                  {/* Botón de colapsar / expandir tarjeta */}
                  <button
                    type="button"
                    aria-expanded={!isCollapsed}
                    aria-label={isCollapsed ? `Expandir categoría ${displayTitle}` : `Colapsar categoría ${displayTitle}`}
                    onClick={() => toggleCategoryCollapse(gi)}
                    title={isCollapsed ? "Expandir categoría" : "Colapsar categoría"}
                    className="w-8 h-8 rounded-lg bg-surface-container-low border border-[#ECEAE7] hover:border-[#141414]/25 flex items-center justify-center text-secondary hover:text-primary transition-all duration-200 active:scale-[0.98] cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isCollapsed ? "expand_more" : "expand_less"}
                    </span>
                  </button>

                  {/* Botón de eliminar categoría */}
                  <button
                    type="button"
                    aria-label={`Eliminar categoría ${g.title}`}
                    onClick={() => set({ groups: d.groups.filter((_, k) => k !== gi) })}
                    title="Eliminar categoría"
                    className="w-8 h-8 rounded-lg bg-surface-container-low border border-[#ECEAE7] hover:border-error/40 flex items-center justify-center text-secondary hover:text-error transition-all duration-200 active:scale-[0.98] cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-[17px]">delete</span>
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <>
                  {/* Edición bilingüe (ES / EN) compacta del nombre de la categoría ocupando el 100% del ancho */}
                  <div className="flex items-center gap-2 w-full">
                    <span className="px-2 py-1 rounded-md bg-surface-container font-label-sm text-[10px] uppercase tracking-wider text-secondary font-bold shrink-0">
                      Nombre ({lang.toUpperCase()})
                    </span>
                    <input
                      className="h-9 text-sm px-3 rounded-lg bg-surface-container-low border border-[#ECEAE7] hover:border-[#141414]/25 focus:border-[#141414] focus:outline-none text-primary font-medium w-full transition-all duration-200"
                      value={lang === "es" ? g.title : g.titleEn ?? ""}
                      placeholder={lang === "es" ? "Ej. Interior" : `Traducción EN de ${g.title}`}
                      onChange={(e) => updateCategoryTitle(gi, e.target.value)}
                    />
                  </div>

                  {/* Lista compacta de características con Popover de icono 36x36px o estado vacío sutil */}
                  {g.items.length > 0 && (
                    <ul className="flex flex-col gap-2">
                      {g.items.map((it, ii) => {
                        const popKey = `${gi}-${ii}`;
                        const isPopoverOpen = openIconPopover === popKey;
                        const currentTitle = lang === "es" ? it.label : (it.labelEn ?? "");
                        const currentDetail = lang === "es" ? (it.detail ?? "") : (it.detailEn ?? "");
                        return (
                          <li
                            key={`cat-${gi}-item-${ii}`}
                            className="relative flex items-start gap-2 p-2 rounded-xl bg-surface-container-low/70 border border-[#ECEAE7] hover:border-[#141414]/25 hover:shadow-sm transition-all duration-200"
                          >
                            {/* Botón cuadrado compacto (36px × 36px) con Popover de iconos */}
                            <div className="relative shrink-0">
                              <button
                                type="button"
                                aria-label={`Cambiar icono de ${it.label || `campo ${ii + 1}`}`}
                                aria-expanded={isPopoverOpen}
                                onClick={() => {
                                  setPopoverIconErr(null);
                                  setOpenIconPopover(isPopoverOpen ? null : popKey);
                                }}
                                title="Elegir o subir icono para esta característica"
                                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                                  isPopoverOpen
                                    ? "bg-[#141414] text-[#F5F3EE] border-[#141414] shadow-sm"
                                    : "bg-white text-[#141414] border-[#ECEAE7] hover:border-[#141414]/35 shadow-sm"
                                }`}
                              >
                                {it.customIcon ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={it.customIcon} alt="" className="w-5 h-5 object-contain" />
                                ) : (
                                  <span className="material-symbols-outlined text-[18px]" aria-hidden>
                                    {it.icon || "check_circle"}
                                  </span>
                                )}
                              </button>

                              {/* Popover flotante de selección y subida de icono */}
                              {isPopoverOpen && (
                                <div
                                  role="dialog"
                                  aria-label={`Selector de icono para ${it.label || `campo ${ii + 1}`}`}
                                  className="absolute left-0 top-11 z-40 w-72 sm:w-80 p-3 rounded-xl bg-surface-container-lowest border border-[#141414]/15 shadow-xl flex flex-col gap-2.5 animate-fade-in"
                                >
                                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#ECEAE7]">
                                    <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-primary">
                                      Icono de característica
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <input
                                        ref={(el) => {
                                          popoverFileRefs.current[popKey] = el;
                                        }}
                                        type="file"
                                        accept={ICON_TYPES.join(",")}
                                        className="sr-only"
                                        onChange={(e) => {
                                          const f = e.target.files?.[0];
                                          if (f) {
                                            readIconAsDataUrl(
                                              f,
                                              (url) => {
                                                setPopoverIconErr(null);
                                                updateItem(gi, ii, { customIcon: url });
                                                setOpenIconPopover(null);
                                              },
                                              (errMsg) => setPopoverIconErr(errMsg),
                                            );
                                          }
                                          e.target.value = "";
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => popoverFileRefs.current[popKey]?.click()}
                                        className="h-7 px-2 rounded-md bg-[#141414] text-[#F5F3EE] hover:bg-[#D9381E] font-label-sm text-[10px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[13px]">upload</span>
                                        SVG/PNG
                                      </button>
                                      {it.customIcon && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPopoverIconErr(null);
                                            updateItem(gi, ii, { customIcon: undefined });
                                          }}
                                          className="h-7 px-2 rounded-md bg-surface-container text-secondary hover:text-error font-label-sm text-[10px] cursor-pointer"
                                        >
                                          Librería
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        aria-label="Cerrar selector de icono"
                                        onClick={() => {
                                          setOpenIconPopover(null);
                                          setPopoverIconErr(null);
                                        }}
                                        className="w-7 h-7 rounded-md hover:bg-surface-container flex items-center justify-center text-secondary hover:text-primary cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[15px]">close</span>
                                      </button>
                                    </div>
                                  </div>

                                  {popoverIconErr && (
                                    <div
                                      role="alert"
                                      className="p-2.5 rounded-lg bg-error-container text-on-error-container flex items-start justify-between gap-2 text-[11px]"
                                    >
                                      <span className="flex items-start gap-1.5">
                                        <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5">
                                          error
                                        </span>
                                        <span>{popoverIconErr}</span>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setPopoverIconErr(null)}
                                        className="w-6 h-6 rounded hover:bg-black/10 flex items-center justify-center shrink-0 cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                      </button>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-4 gap-1 max-h-44 overflow-y-auto pr-0.5">
                                    {TECH_ICON_LIBRARY.map((ic) => {
                                      const active = !it.customIcon && (it.icon || "check_circle") === ic.id;
                                      return (
                                        <button
                                          key={ic.id}
                                          type="button"
                                          onClick={() => {
                                            setPopoverIconErr(null);
                                            updateItem(gi, ii, { icon: ic.id, customIcon: undefined });
                                            setOpenIconPopover(null);
                                          }}
                                          title={ic.label}
                                          className={`py-1.5 px-1 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                                            active
                                              ? "bg-[#141414] text-[#F5F3EE] border-[#141414] font-semibold"
                                              : "bg-surface-container-low/60 text-primary border-[#ECEAE7] hover:border-primary"
                                          }`}
                                        >
                                          <span className="material-symbols-outlined text-[17px] leading-none" aria-hidden>
                                            {ic.id}
                                          </span>
                                          <span className="font-label-sm text-[9px] leading-tight truncate max-w-full">
                                            {ic.label.split(" ")[0]}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Inputs compactos (h-9 text-sm) para Título y Subtítulo breve en ES / EN */}
                            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              <input
                                className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] hover:border-[#141414]/25 focus:border-[#141414] focus:outline-none text-primary font-medium w-full transition-all duration-200"
                                value={currentTitle}
                                placeholder={
                                  lang === "es"
                                    ? "Título (ej. Cocina con isla)"
                                    : it.label
                                      ? `EN: ${it.label}`
                                      : "Title in English"
                                }
                                aria-label={`Título de característica ${ii + 1} (${lang.toUpperCase()})`}
                                onChange={(e) =>
                                  updateItem(
                                    gi,
                                    ii,
                                    lang === "es" ? { label: e.target.value } : { labelEn: e.target.value },
                                  )
                                }
                              />
                              <input
                                className="h-9 text-sm px-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] hover:border-[#141414]/25 focus:border-[#141414] focus:outline-none text-secondary w-full transition-all duration-200"
                                value={currentDetail}
                                placeholder={
                                  lang === "es"
                                    ? "Subtítulo breve (opcional)"
                                    : it.detail
                                      ? `EN: ${it.detail}`
                                      : "Short subtitle (optional)"
                                }
                                aria-label={`Subtítulo de característica ${ii + 1} (${lang.toUpperCase()})`}
                                onChange={(e) =>
                                  updateItem(
                                    gi,
                                    ii,
                                    lang === "es" ? { detail: e.target.value } : { detailEn: e.target.value },
                                  )
                                }
                              />
                            </div>

                            {/* Botón compacto de eliminar ítem */}
                            <button
                              type="button"
                              aria-label={`Eliminar característica ${it.label || ii + 1}`}
                              onClick={() => removeItem(gi, ii)}
                              title="Eliminar característica"
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-secondary hover:bg-surface-container hover:text-error shrink-0 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[17px]">close</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* Pie de la tarjeta: Línea discreta de estado vacío (si 0 campos) + Botón + Agregar campo */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    {g.items.length === 0 && (
                      <p className="font-body-sm text-[12px] text-secondary flex items-center gap-1.5 px-1">
                        <span className="material-symbols-outlined text-[15px] text-secondary/75" aria-hidden>
                          info
                        </span>
                        <span>Sin campos registrados en {displayTitle}.</span>
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => addInlineItem(gi)}
                      className="self-start h-9 px-3.5 rounded-lg bg-surface-container-low hover:bg-surface-container border border-[#ECEAE7] hover:border-[#141414]/25 hover:shadow-sm inline-flex items-center gap-1.5 font-label-sm text-[12px] font-semibold text-primary transition-all duration-200 active:scale-[0.98] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>+ Agregar campo
                    </button>
                  </div>
                </>
              )}
            </section>
          );
        })}
      </div>

      {fieldModal && (
        <FieldEditorModal
          groups={d.groups}
          initialCatIndex={fieldModal.catIndex}
          editItemIndex={fieldModal.itemIndex}
          onClose={() => setFieldModal(null)}
          onSave={(targetCatIdx, item, originalCatIdx, originalItemIdx) => {
            const nextGroups = d.groups.map((g) => ({ ...g, items: [...g.items] }));
            if (originalItemIdx !== undefined && originalCatIdx !== undefined) {
              if (originalCatIdx === targetCatIdx) {
                nextGroups[targetCatIdx].items[originalItemIdx] = item;
              } else {
                nextGroups[originalCatIdx].items.splice(originalItemIdx, 1);
                nextGroups[targetCatIdx].items.push(item);
              }
            } else if (nextGroups[targetCatIdx]) {
              nextGroups[targetCatIdx].items.push(item);
            }
            set({ groups: nextGroups });
            setFieldModal(null);
          }}
        />
      )}

      {catModal && (
        <NewCategoryModal
          onClose={() => setCatModal(false)}
          onCreate={(newGroup) => {
            set({ groups: [...d.groups, newGroup] });
            setCatModal(false);
          }}
        />
      )}
    </div>
  );
}

function FieldEditorModal({
  groups,
  initialCatIndex,
  editItemIndex,
  onClose,
  onSave,
}: {
  groups: FeatureGroup[];
  initialCatIndex: number;
  editItemIndex?: number;
  onClose: () => void;
  onSave: (targetCatIdx: number, item: FeatureItem, originalCatIdx?: number, originalItemIdx?: number) => void;
}) {
  const existing = editItemIndex !== undefined ? groups[initialCatIndex]?.items[editItemIndex] : undefined;
  const [catIdx, setCatIdx] = useState<number>(initialCatIndex >= 0 && initialCatIndex < groups.length ? initialCatIndex : 0);
  const [label, setLabel] = useState(existing?.label ?? "");
  const [labelEn, setLabelEn] = useState(existing?.labelEn ?? "");
  const [detail, setDetail] = useState(existing?.detail ?? "");
  const [detailEn, setDetailEn] = useState(existing?.detailEn ?? "");
  const [icon, setIcon] = useState(existing?.icon ?? "wifi");
  const [customIcon, setCustomIcon] = useState<string | undefined>(existing?.customIcon);
  const [err, setErr] = useState("");
  const [iconErr, setIconErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (label.trim().length < 2) {
      setErr("Escribe el título de la característica en español.");
      return;
    }
    onSave(
      catIdx,
      {
        icon,
        customIcon,
        label: label.trim(),
        labelEn: labelEn.trim() || undefined,
        detail: detail.trim() || undefined,
        detailEn: detailEn.trim() || undefined,
      },
      initialCatIndex,
      editItemIndex,
    );
  };

  return (
    <Modal open onClose={onClose} labelledBy="nf-title" className="max-w-xl">
      <form onSubmit={submit} className="p-6 flex flex-col gap-4 max-h-[88vh] overflow-y-auto" noValidate>
        <div className="flex items-start justify-between">
          <h2 id="nf-title" className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">playlist_add</span>
            {existing ? "Editar característica" : "Agregar característica con icono"}
          </h2>
          <CloseButton onClick={onClose} />
        </div>

        <PField label="Categoría">
          {(id) => (
            <select id={id} className={pInput} value={catIdx} onChange={(e) => setCatIdx(Number(e.target.value))}>
              {groups.map((g, idx) => (
                <option key={`${g.title}-${idx}`} value={idx}>
                  {idx + 1}. {g.title}
                </option>
              ))}
            </select>
          )}
        </PField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PField
            label="Título (Español · ES)"
            required
            hint={
              err ? (
                <span className="text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {err}
                </span>
              ) : undefined
            }
          >
            {(id) => (
              <input
                id={id}
                className={pInput}
                value={label}
                onChange={(e) => {
                  setLabel(e.target.value);
                  setErr("");
                }}
                placeholder="Ej. Fibra óptica de alta velocidad"
                aria-invalid={err ? true : undefined}
              />
            )}
          </PField>
          <PField label="Título (English · EN)">
            {(id) => (
              <input
                id={id}
                className={pInput}
                value={labelEn}
                onChange={(e) => setLabelEn(e.target.value)}
                placeholder="E.g. High-speed fiber optic internet"
              />
            )}
          </PField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PField label="Subtítulo breve (Español · ES)">
            {(id) => (
              <input
                id={id}
                className={pInput}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Ej. Acometida canalizada hasta punto central"
              />
            )}
          </PField>
          <PField label="Subtítulo breve (English · EN)">
            {(id) => (
              <input
                id={id}
                className={pInput}
                value={detailEn}
                onChange={(e) => setDetailEn(e.target.value)}
                placeholder="E.g. Ducted connection to central hub"
              />
            )}
          </PField>
        </div>

        {/* Selector de Icono + Subida de SVG/PNG propio */}
        <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-surface-container-low border border-[#ECEAE7]">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white text-[#141414] border border-[#ECEAE7] shadow-sm flex items-center justify-center shrink-0">
                {customIcon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={customIcon} alt="Icono personalizado" className="w-5 h-5 object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                )}
              </div>
              <div>
                <p className="font-label-md text-label-md font-bold text-primary">Icono visual de la característica</p>
                <p className="font-body-sm text-[11px] text-secondary">
                  Elige uno de la librería o sube un archivo propio (SVG o PNG).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept={ICON_TYPES.join(",")}
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    readIconAsDataUrl(
                      f,
                      (url) => {
                        setIconErr(null);
                        setCustomIcon(url);
                      },
                      (msg) => setIconErr(msg),
                    );
                  }
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-9 px-3 rounded-lg bg-[#141414] text-[#F5F3EE] hover:bg-[#D9381E] font-label-sm text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">upload</span>
                Subir SVG / PNG
              </button>
              {customIcon && (
                <button
                  type="button"
                  onClick={() => {
                    setIconErr(null);
                    setCustomIcon(undefined);
                  }}
                  className="h-9 px-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-secondary hover:text-error font-label-sm text-[11px] cursor-pointer"
                >
                  Usar librería
                </button>
              )}
            </div>
          </div>

          {iconErr && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-error-container text-on-error-container flex items-start justify-between gap-2 animate-fade-in"
            >
              <span className="flex items-start gap-2 font-body-sm text-[12px]">
                <span className="material-symbols-outlined text-[17px] shrink-0 mt-0.5">error</span>
                <span>
                  <strong className="block font-semibold">No pudimos subir el icono personalizado</strong>
                  {iconErr}
                </span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="h-8 px-2.5 rounded-md bg-surface-container-lowest text-primary font-label-sm text-[11px] font-semibold cursor-pointer"
                >
                  Reintentar
                </button>
                <button
                  type="button"
                  aria-label="Cerrar aviso"
                  onClick={() => setIconErr(null)}
                  className="w-7 h-7 rounded-md hover:bg-black/10 flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-44 overflow-y-auto pt-1 pr-1">
            {TECH_ICON_LIBRARY.map((ic) => {
              const selected = !customIcon && icon === ic.id;
              return (
                <button
                  key={ic.id}
                  type="button"
                  onClick={() => {
                    setIcon(ic.id);
                    setCustomIcon(undefined);
                  }}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    selected
                      ? "bg-[#141414] text-[#F5F3EE] border-[#141414] font-semibold"
                      : "bg-surface-container-lowest text-primary border-[#ECEAE7] hover:border-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] shrink-0">{ic.id}</span>
                  <span className="font-label-sm text-[11px] truncate">{ic.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-11 px-5 rounded-lg bg-surface-container font-label-md text-label-md cursor-pointer">
            Cancelar
          </button>
          <button type="submit" className="h-11 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold cursor-pointer">
            {existing ? "Guardar cambios" : "Crear campo"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function NewCategoryModal({ onClose, onCreate }: { onClose: () => void; onCreate: (g: FeatureGroup) => void }) {
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [icon, setIcon] = useState("chair");

  return (
    <Modal open onClose={onClose} labelledBy="nc-title" className="max-w-md">
      <form
        className="p-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim().length > 1) {
            onCreate({
              title: title.trim(),
              titleEn: titleEn.trim() || title.trim(),
              icon,
              visible: true,
              items: [],
            });
          }
        }}
      >
        <div className="flex items-start justify-between">
          <h2 id="nc-title" className="font-headline-sm text-headline-sm text-primary">
            Agregar categoría a Ficha Técnica
          </h2>
          <CloseButton onClick={onClose} />
        </div>
        <PField label="Nombre de la categoría (Español · ES)" required>
          {(id) => <input id={id} className={pInput} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Áreas comunales" />}
        </PField>
        <PField label="Nombre de la categoría (English · EN)">
          {(id) => <input id={id} className={pInput} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="E.g. Communal Areas" />}
        </PField>
        <PField label="Icono de la categoría">
          {(id) => (
            <select id={id} className={pInput} value={icon} onChange={(e) => setIcon(e.target.value)}>
              {CATEGORY_ICON_LIBRARY.map((ic) => (
                <option key={ic.id} value={ic.id}>
                  {ic.label}
                </option>
              ))}
            </select>
          )}
        </PField>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-11 px-5 rounded-lg bg-surface-container font-label-md text-label-md cursor-pointer">
            Cancelar
          </button>
          <button type="submit" className="h-11 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold cursor-pointer">
            Agregar categoría
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Parte 2.2 · Control Total de Cada Fotografía (Foto 1 a Foto 10)     */
/* ------------------------------------------------------------------ */

const DEFAULT_SLOT_ICONS = [
  "home",
  "weekend",
  "countertops",
  "bed",
  "bathtub",
  "balcony",
  "yard",
  "pool",
  "fireplace",
  "grid_view",
];

function createEmptyPhotoSlot(index: number): DraftPhoto {
  return {
    id: `slot-${index + 1}`,
    src: "",
    room: "",
    captionEs: "",
    captionEn: "",
    subEs: "",
    subEn: "",
    showCaption: true,
    icon: DEFAULT_SLOT_ICONS[index] ?? "home",
  };
}

function ensureTenSlots(photos: DraftPhoto[]): DraftPhoto[] {
  return Array.from({ length: MAX_PHOTOS }, (_, idx) => {
    const existing = photos[idx];
    if (!existing) return createEmptyPhotoSlot(idx);
    return {
      ...createEmptyPhotoSlot(idx),
      ...existing,
      id: existing.id || `slot-${idx + 1}`,
      showCaption: existing.showCaption !== false,
      icon: existing.icon || DEFAULT_SLOT_ICONS[idx] || "home",
    };
  });
}

const lastActivePhotoSlotByCode: Record<string, number> = {};

function readPhotoFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Error de lectura"));
    };
    reader.onerror = () => reject(new Error("Error de lectura"));
    reader.readAsDataURL(file);
  });
}

export function Photos({
  d,
  set,
  onSave,
  dirty,
}: {
  d: Draft;
  set: (p: Partial<Draft>) => void;
  onSave?: () => void;
  dirty?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const slotTargetRef = useRef<number | null>(null);
  const iconInputRef = useRef<HTMLInputElement | null>(null);
  const [photoErrors, setPhotoErrors] = useState<string[]>([]);
  const [iconError, setIconError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("es");
  const [activeIdx, setActiveIdxState] = useState<number>(() => {
    const saved = d.code ? lastActivePhotoSlotByCode[d.code] : undefined;
    return typeof saved === "number" && saved >= 0 && saved < MAX_PHOTOS ? saved : 0;
  });

  const setActiveIdx = (nextOrUpdater: number | ((prev: number) => number)) => {
    setPhotoErrors([]);
    setIconError(null);
    setActiveIdxState((prev) => {
      const raw = typeof nextOrUpdater === "function" ? nextOrUpdater(prev) : nextOrUpdater;
      const clamped = Math.min(MAX_PHOTOS - 1, Math.max(0, raw));
      if (d.code) {
        lastActivePhotoSlotByCode[d.code] = clamped;
      }
      return clamped;
    });
  };

  const slots = ensureTenSlots(d.photos);
  const uploadedCount = slots.filter((s) => Boolean(s.src && s.src.trim())).length;
  const autoplaySeconds = Math.min(10, Math.max(0, Math.round(d.galleryAutoplaySeconds ?? 4)));

  const setAutoplaySeconds = (raw: number) => {
    const clamped = Math.min(10, Math.max(0, Math.round(Number.isFinite(raw) ? raw : 4)));
    set({ galleryAutoplaySeconds: clamped });
  };

  const updateSlot = (slotIdx: number, patch: Partial<DraftPhoto>) => {
    const nextSlots = ensureTenSlots(d.photos).map((slot, idx) => {
      if (idx !== slotIdx) return slot;
      const updated: DraftPhoto = { ...slot, ...patch };
      if (patch.captionEs !== undefined) {
        updated.room = patch.captionEs;
      }
      return updated;
    });
    set({ photos: nextSlots });
  };

  /** Limpieza atómica del slot completo (url, icono, textos ES/EN y ojito) */
  const clearSlotAtomic = (slotIdx: number) => {
    const current = slots[slotIdx];
    if (current?.src && current.src.startsWith("blob:")) {
      URL.revokeObjectURL(current.src);
    }
    const nextSlots = ensureTenSlots(d.photos).map((slot, idx) =>
      idx === slotIdx ? createEmptyPhotoSlot(idx) : slot,
    );
    set({ photos: nextSlots });
  };

  /** Reordenamiento atómico del objeto completo (url, icono, textos ES/EN y ojito) manteniendo el foco en la foto movida */
  const moveSlotAtomic = (slotIdx: number, dir: -1 | 1) => {
    const targetIdx = slotIdx + dir;
    if (targetIdx < 0 || targetIdx >= MAX_PHOTOS) return;
    const nextSlots = ensureTenSlots(d.photos).map((s) => ({ ...s }));
    const temp = { ...nextSlots[slotIdx], id: `slot-${targetIdx + 1}` };
    nextSlots[slotIdx] = { ...nextSlots[targetIdx], id: `slot-${slotIdx + 1}` };
    nextSlots[targetIdx] = temp;
    set({ photos: nextSlots });
    setActiveIdx(targetIdx);
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const errs: string[] = [];
    const nextSlots = ensureTenSlots(d.photos);
    const targetIdx = slotTargetRef.current;
    slotTargetRef.current = null;

    const validFiles: File[] = [];
    for (const f of Array.from(files)) {
      if (!TYPES.includes(f.type)) {
        errs.push(`“${f.name}” no es JPG, PNG ni WebP.`);
        continue;
      }
      const mb = f.size / 1024 / 1024;
      if (mb > MAX_MB) {
        errs.push(`Esta foto pesa ${Math.round(mb)} MB. El máximo es ${MAX_MB} MB. Redúcela y vuelve a subirla.`);
        continue;
      }
      validFiles.push(f);
    }

    if (targetIdx !== null && validFiles[0]) {
      try {
        const dataUrl = await readPhotoFileAsDataUrl(validFiles[0]);
        nextSlots[targetIdx] = {
          ...nextSlots[targetIdx],
          src: dataUrl,
        };
        set({ photos: nextSlots });
        setActiveIdx(targetIdx);
      } catch {
        errs.push("No se pudo procesar la imagen seleccionada.");
      }
      setPhotoErrors(errs);
      return;
    }

    let firstUploadedIdx: number | null = null;
    for (const f of validFiles) {
      // Prioriza el slot activo si está vacío; de lo contrario busca el primer slot vacío disponible
      const emptyIdx =
        !nextSlots[activeIdx]?.src || !nextSlots[activeIdx]?.src.trim()
          ? activeIdx
          : nextSlots.findIndex((s) => !s.src || !s.src.trim());
      if (emptyIdx === -1) {
        errs.push(`Ya tienes las ${MAX_PHOTOS} fotos ocupadas. Quita o reemplaza una para subir otra.`);
        break;
      }
      try {
        const dataUrl = await readPhotoFileAsDataUrl(f);
        nextSlots[emptyIdx] = {
          ...nextSlots[emptyIdx],
          src: dataUrl,
        };
        if (firstUploadedIdx === null) {
          firstUploadedIdx = emptyIdx;
        }
      } catch {
        errs.push(`No pudimos leer “${f.name}”.`);
      }
    }

    set({ photos: nextSlots });
    if (firstUploadedIdx !== null) {
      setActiveIdx(firstUploadedIdx);
    }
    setPhotoErrors(errs);
  };

  const goPrevPhoto = () => setActiveIdx((prev) => Math.max(0, prev - 1));
  const goNextPhoto = () => setActiveIdx((prev) => Math.min(MAX_PHOTOS - 1, prev + 1));

  const k = Math.min(MAX_PHOTOS - 1, Math.max(0, activeIdx));
  const ph = slots[k] ?? createEmptyPhotoSlot(k);
  const hasImage = Boolean(ph.src && ph.src.trim());
  const showCap = ph.showCaption !== false;
  const currentCaption = lang === "es" ? (ph.captionEs ?? ph.room ?? "") : (ph.captionEn ?? "");
  const currentSub = lang === "es" ? (ph.subEs ?? "") : (ph.subEn ?? "");
  const selectedIcon = ph.icon || DEFAULT_SLOT_ICONS[k] || "home";

  return (
    <div className="flex flex-col gap-6">
      <Card
        icon="photo_library"
        title="Fotos y planos · Galería Expanding Flex Cards"
        subtitle={`${uploadedCount} de ${MAX_PHOTOS} fotos cargadas · Editor individual paso a paso (ES/EN)`}
        aside={
          <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div
              role="radiogroup"
              aria-label="Idioma de pies de foto"
              className="inline-flex items-center gap-1 p-1 rounded-lg bg-surface-container border border-[#ECEAE7] shrink-0"
            >
              {(
                [
                  { v: "es", l: "Español · ES" },
                  { v: "en", l: "English · EN" },
                ] as const
              ).map((o) => (
                <button
                  key={o.v}
                  type="button"
                  role="radio"
                  aria-checked={lang === o.v}
                  onClick={() => setLang(o.v)}
                  className={`h-9 px-3.5 rounded-md font-label-md text-label-md whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    lang === o.v
                      ? "bg-[#141414] text-[#F5F3EE] font-semibold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
            <input
              ref={input}
              type="file"
              accept={TYPES.join(",")}
              multiple
              className="sr-only"
              onChange={(e) => {
                void onFiles(e.target.files);
                e.target.value = "";
              }}
              aria-label="Subir fotos"
            />
            <button
              type="button"
              disabled={uploadedCount >= MAX_PHOTOS}
              onClick={() => {
                slotTargetRef.current = null;
                input.current?.click();
              }}
              className="h-11 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>+ Subir fotos
            </button>
          </div>
        }
      >
        {/* Control de Autoplay Configurable (0 a 10 segundos · Defecto 4s) */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-[#ECEAE7] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#141414] text-[#F5F3EE] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]" aria-hidden>
                {autoplaySeconds === 0 ? "pause_circle" : "autoplay"}
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-title-md text-label-md font-bold text-primary">
                  Avance automático de la galería (0 a 10 s)
                </p>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-semibold ${
                    autoplaySeconds === 0
                      ? "bg-surface-container text-secondary"
                      : "bg-[#141414] text-[#F5F3EE]"
                  }`}
                >
                  {autoplaySeconds === 0
                    ? "Manual / Pausado (0s)"
                    : `Activo · Cada ${autoplaySeconds}s`}
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-secondary mt-0.5">
                Por defecto <strong>4s</strong>. En <strong>0s</strong> queda manual/pausado. En la ficha pública se pausa automáticamente al pasar el cursor o tocar en móvil.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5 bg-surface-container-lowest px-3.5 py-2 rounded-lg border border-[#ECEAE7]">
              <label htmlFor="gallery-autoplay-range" className="font-label-sm text-[11px] text-secondary uppercase tracking-wider font-semibold">
                Intervalo:
              </label>
              <input
                id="gallery-autoplay-range"
                type="range"
                min={0}
                max={10}
                step={1}
                value={autoplaySeconds}
                onChange={(e) => setAutoplaySeconds(Number(e.target.value))}
                className="w-28 sm:w-36 accent-[#141414] cursor-pointer"
                aria-label="Segundos de avance automático de la galería (0 a 10)"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={1}
                  value={autoplaySeconds}
                  onChange={(e) => setAutoplaySeconds(Number(e.target.value))}
                  aria-label="Segundos de avance automático (número)"
                  className="w-14 h-8 px-2 rounded-md border border-[#ECEAE7] bg-surface-container-low text-center font-mono font-bold text-primary text-body-sm"
                />
                <span className="font-label-sm text-[11px] text-secondary font-semibold">s</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAutoplaySeconds(4)}
                className={`h-9 px-3 rounded-lg font-label-sm text-[11px] font-semibold border transition-colors cursor-pointer ${
                  autoplaySeconds === 4
                    ? "bg-[#141414] text-[#F5F3EE] border-[#141414]"
                    : "bg-surface-container-lowest text-primary border-[#ECEAE7] hover:border-primary"
                }`}
              >
                4s (Defecto)
              </button>
              <button
                type="button"
                onClick={() => setAutoplaySeconds(0)}
                className={`h-9 px-3 rounded-lg font-label-sm text-[11px] font-semibold border transition-colors cursor-pointer ${
                  autoplaySeconds === 0
                    ? "bg-[#D9381E] text-white border-[#D9381E]"
                    : "bg-surface-container-lowest text-secondary border-[#ECEAE7] hover:border-primary hover:text-primary"
                }`}
              >
                0s (Manual)
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-container-low flex flex-wrap items-center justify-between gap-2 font-body-sm text-body-sm">
          <span className="flex items-center gap-2 text-secondary">
            <span className="material-symbols-outlined text-[18px] text-primary">security</span>
            <span>
              Formato recomendado: <strong>1920 × 1080 px</strong> · JPG, PNG o WebP · máx. 5 MB. Se eliminan metadatos GPS por privacidad.
            </span>
          </span>
          <span className="font-label-sm text-[11px] text-primary font-semibold">
            Navega del 1 al 10 con las flechas o números
          </span>
        </div>

        {/* Barra Paginadora / Selector de Paso (Foto 1 de 10) */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-[#ECEAE7] flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-lg bg-[#141414] text-[#F5F3EE] font-label-md text-[12px] font-bold tracking-wide">
                Foto {k + 1} de {MAX_PHOTOS}
              </span>
              <span className="font-body-sm text-[12px] text-secondary">
                {k === 0 ? "Portada principal de la propiedad" : `Espacio #${k + 1} de la galería`}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={goPrevPhoto}
                disabled={k === 0}
                aria-label="Ir a la foto anterior"
                className="h-9 px-3 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-primary hover:border-primary font-label-sm text-[12px] font-semibold inline-flex items-center gap-1 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Anterior</span>
              </button>
              <button
                type="button"
                onClick={goNextPhoto}
                disabled={k === MAX_PHOTOS - 1}
                aria-label="Ir a la siguiente foto"
                className="h-9 px-3 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-primary hover:border-primary font-label-sm text-[12px] font-semibold inline-flex items-center gap-1 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <span>Siguiente</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Tira horizontal de pasos 1 a 10 */}
          <div
            role="tablist"
            aria-label="Selector de fotografía (1 a 10)"
            className="grid grid-cols-5 sm:grid-cols-10 gap-1.5"
          >
            {slots.map((slot, idx) => {
              const isCurrent = idx === k;
              const slotHasImg = Boolean(slot.src && slot.src.trim());
              return (
                <button
                  key={slot.id || `step-${idx}`}
                  type="button"
                  role="tab"
                  aria-selected={isCurrent}
                  aria-label={`Editar Foto ${idx + 1}${slotHasImg ? " (con imagen)" : " (sin imagen)"}`}
                  onClick={() => setActiveIdx(idx)}
                  className={`h-10 px-2 rounded-lg border font-label-sm text-[12px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-[#141414] text-[#F5F3EE] border-[#141414] font-bold shadow-sm"
                      : slotHasImg
                        ? "bg-surface-container-lowest text-primary border-[#ECEAE7] hover:border-primary font-semibold"
                        : "bg-surface-container/60 text-secondary border-transparent hover:border-[#ECEAE7] hover:text-primary"
                  }`}
                >
                  <span>{idx + 1}</span>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      slotHasImg
                        ? isCurrent
                          ? "bg-[#4ADE80]"
                          : "bg-st-available"
                        : isCurrent
                          ? "bg-[#F5F3EE]/40"
                          : "bg-secondary/30"
                    }`}
                    title={slotHasImg ? "Imagen cargada" : "Sin imagen"}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Tarjeta Única de Edición de Fotografía (Carrusel Individual) */}
        <div
          key={`photo-wizard-card-${k}`}
          className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-surface-container-low/60 border border-[#ECEAE7] shadow-sm"
        >
          {/* Barra superior de la tarjeta activa: Identificador + Ojito + Navegación estandarizada */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#ECEAE7]">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-md font-label-sm text-[11px] uppercase tracking-wider font-bold ${
                  k === 0
                    ? "bg-[#141414] text-[#F5F3EE]"
                    : "bg-surface-container text-primary"
                }`}
              >
                {k === 0 ? "Foto 1 · Portada" : `Foto ${k + 1} de ${MAX_PHOTOS}`}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-semibold ${
                  hasImage
                    ? "bg-st-available-bg text-st-available"
                    : "bg-surface-container text-secondary"
                }`}
              >
                {hasImage ? "Imagen cargada" : "Pendiente de imagen"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {/* Botón de Ojito siempre visible */}
              <button
                type="button"
                onClick={() => updateSlot(k, { showCaption: !showCap })}
                aria-pressed={showCap}
                title={
                  showCap
                    ? "Ojito activo: se muestra el Título, Subtítulo y sombra inferior en la ficha pública. Clic para ocultar texto."
                    : "Ojito desactivado: la foto se muestra 100% limpia en la ficha pública. Clic para mostrar texto."
                }
                className={`h-8 px-3 rounded-lg font-label-sm text-[11px] font-semibold inline-flex items-center gap-1.5 border transition-colors cursor-pointer shrink-0 ${
                  showCap
                    ? "bg-[#141414] text-[#F5F3EE] border-[#141414] hover:bg-[#D9381E] hover:border-[#D9381E]"
                    : "bg-surface-container-lowest text-secondary border-[#ECEAE7] hover:border-primary hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {showCap ? "visibility" : "visibility_off"}
                </span>
                <span>{showCap ? "Texto visible" : "Solo foto limpia"}</span>
              </button>

              {hasImage && (
                <>
                  <button
                    type="button"
                    aria-label={`Mover Foto ${k + 1} una posición antes`}
                    disabled={k === 0}
                    onClick={() => moveSlotAtomic(k, -1)}
                    className="h-8 px-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-secondary hover:text-primary font-label-sm text-[11px] inline-flex items-center gap-1 disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                    title="Reordenar: mover esta foto con su icono y textos una posición antes"
                  >
                    <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
                    <span className="hidden xl:inline">Mover ←</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Mover Foto ${k + 1} una posición después`}
                    disabled={k === MAX_PHOTOS - 1}
                    onClick={() => moveSlotAtomic(k, 1)}
                    className="h-8 px-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-secondary hover:text-primary font-label-sm text-[11px] inline-flex items-center gap-1 disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                    title="Reordenar: mover esta foto con su icono y textos una posición después"
                  >
                    <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
                    <span className="hidden xl:inline">Mover →</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Eliminar y limpiar Foto ${k + 1}`}
                    onClick={() => clearSlotAtomic(k)}
                    className="h-8 px-2.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-secondary hover:text-error font-label-sm text-[11px] inline-flex items-center gap-1 cursor-pointer"
                    title="Eliminar foto y limpiar su icono, textos y ojito"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                </>
              )}

              {/* Flechas de navegación secuencial entre fotos (función única estandarizada) */}
              <div className="inline-flex items-center gap-1 pl-1">
                <button
                  type="button"
                  aria-label="Ver foto anterior"
                  disabled={k === 0}
                  onClick={goPrevPhoto}
                  className="w-8 h-8 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-primary hover:border-primary flex items-center justify-center disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                  title="Foto anterior"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                </button>
                <button
                  type="button"
                  aria-label="Ver siguiente foto"
                  disabled={k === MAX_PHOTOS - 1}
                  onClick={goNextPhoto}
                  className="w-8 h-8 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-primary hover:border-primary flex items-center justify-center disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                  title="Siguiente foto"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cuerpo en 2 columnas en escritorio para evitar scroll vertical */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Columna izquierda: Vista previa 16:10 y carga de imagen */}
            <div className="lg:col-span-6 flex flex-col gap-2.5">
              {photoErrors.map((e) => (
                <div
                  key={e}
                  role="alert"
                  className="p-3 rounded-xl bg-error-container text-on-error-container flex items-start justify-between gap-2 animate-fade-in"
                >
                  <span className="flex items-start gap-2 font-body-sm text-[12px]">
                    <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                    <span>
                      <strong className="block font-semibold">No pudimos subir la fotografía</strong>
                      {e}
                    </span>
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        slotTargetRef.current = k;
                        input.current?.click();
                      }}
                      className="h-8 px-2.5 rounded-lg bg-surface-container-lowest text-primary font-label-sm text-[11px] font-semibold cursor-pointer"
                    >
                      Reintentar
                    </button>
                    <button
                      type="button"
                      aria-label="Cerrar aviso de foto"
                      onClick={() => setPhotoErrors([])}
                      className="w-7 h-7 rounded-md hover:bg-black/10 flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">close</span>
                    </button>
                  </div>
                </div>
              ))}

              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#141414] border border-[#ECEAE7]">
                {hasImage ? (
                  <>
                    <Image
                      src={ph.src}
                      alt={ph.captionEs || ph.room || `Foto ${k + 1}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 560px"
                      className="object-cover"
                      unoptimized={ph.src.startsWith("blob:") || ph.src.startsWith("data:")}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        slotTargetRef.current = k;
                        input.current?.click();
                      }}
                      className="absolute top-2.5 right-2.5 z-10 h-8 px-3 rounded-lg bg-black/75 hover:bg-[#D9381E] text-white font-label-sm text-[11px] font-semibold inline-flex items-center gap-1.5 backdrop-blur-sm transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                      Cambiar imagen
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      slotTargetRef.current = k;
                      input.current?.click();
                    }}
                    className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#F5F3EE] hover:bg-[#ECEAE4] text-primary transition-colors cursor-pointer p-6 text-center"
                  >
                    <span className="w-12 h-12 rounded-full bg-white border border-[#ECEAE7] shadow-sm flex items-center justify-center text-[#141414]">
                      <span className="material-symbols-outlined text-[24px]">add_photo_alternate</span>
                    </span>
                    <span className="font-label-md text-label-md font-bold text-[#141414]">
                      + Subir imagen para Foto {k + 1}
                    </span>
                    <span className="font-body-sm text-[11px] text-secondary max-w-xs">
                      JPG, PNG o WebP · Máx. 5 MB · El icono y los textos de la derecha se conservan al cambiar de foto
                    </span>
                  </button>
                )}

                {/* Gradiente oscuro inferior si el ojito está activo */}
                {showCap && (hasImage || currentCaption.trim() || currentSub.trim()) && (
                  <div
                    className="absolute inset-x-0 bottom-0 h-20 pointer-events-none transition-opacity"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,.78), transparent)" }}
                  />
                )}

                {/* Vista previa real del círculo blanco de 40px + Pie de foto en vivo */}
                <div className="absolute left-3 bottom-2.5 right-3 flex items-center gap-2.5 pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-white text-[#141414] border border-[#ECEAE7] shadow-md flex items-center justify-center shrink-0">
                    {ph.customIcon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ph.customIcon} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                      <span className="material-symbols-outlined text-[20px] text-[#141414]" aria-hidden>
                        {selectedIcon}
                      </span>
                    )}
                  </div>
                  {showCap ? (
                    <div className="min-w-0 text-white drop-shadow">
                      <p className="font-label-md text-[13px] font-bold leading-tight truncate">
                        {currentCaption.trim() ||
                          (lang === "es" ? `Título de Foto ${k + 1}` : `Photo ${k + 1} Title`)}
                      </p>
                      <p className="font-body-sm text-[11px] text-white/85 leading-tight truncate">
                        {currentSub.trim() ||
                          (lang === "es"
                            ? "Subtítulo / descripción breve"
                            : "Short subtitle / description")}
                      </p>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-black/65 text-white/90 font-label-sm text-[10px]">
                      Ojito oculto · Solo foto limpia
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Columna derecha: Selector de icono independiente + Campos de texto ES/EN */}
            <div className="lg:col-span-6 flex flex-col gap-3.5">
              {/* Selector visual permanente del Icono del círculo blanco de 40px */}
              <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-surface-container-lowest border border-[#ECEAE7]">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-white text-[#141414] border border-[#141414]/15 shadow-sm flex items-center justify-center shrink-0">
                      {ph.customIcon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ph.customIcon} alt="" className="w-5 h-5 object-contain" />
                      ) : (
                        <span className="material-symbols-outlined text-[20px] text-[#141414]" aria-hidden>
                          {selectedIcon}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="block font-label-sm text-[11px] text-primary uppercase tracking-wider font-bold">
                        Icono de Foto {k + 1} (Círculo 40px)
                      </span>
                      <span className="block font-body-sm text-[11px] text-secondary">
                        Independiente para esta foto · No cambia al navegar
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      ref={iconInputRef}
                      type="file"
                      accept={ICON_TYPES.join(",")}
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          readIconAsDataUrl(
                            f,
                            (dataUrl) => {
                              setIconError(null);
                              updateSlot(k, { customIcon: dataUrl });
                            },
                            (errMsg) => setIconError(errMsg),
                          );
                        }
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => iconInputRef.current?.click()}
                      className="h-8 px-2.5 rounded-lg bg-[#141414] text-[#F5F3EE] hover:bg-[#D9381E] font-label-sm text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <span className="material-symbols-outlined text-[14px]">upload</span>
                      Subir SVG/PNG
                    </button>
                    {ph.customIcon && (
                      <button
                        type="button"
                        onClick={() => {
                          setIconError(null);
                          updateSlot(k, { customIcon: undefined });
                        }}
                        className="h-8 px-2.5 rounded-lg bg-surface-container text-secondary hover:text-error font-label-sm text-[11px] cursor-pointer shrink-0"
                      >
                        Usar librería
                      </button>
                    )}
                  </div>
                </div>

                {/* Aviso contextual inmediato justo dentro del apartado del icono */}
                {iconError && (
                  <div
                    role="alert"
                    className="p-3 rounded-lg bg-error-container text-on-error-container flex items-start justify-between gap-2 animate-fade-in"
                  >
                    <span className="flex items-start gap-2 font-body-sm text-[12px]">
                      <span className="material-symbols-outlined text-[17px] shrink-0 mt-0.5">error</span>
                      <span>
                        <strong className="block font-semibold">No pudimos subir el icono personalizado</strong>
                        {iconError}
                      </span>
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => iconInputRef.current?.click()}
                        className="h-8 px-2.5 rounded-md bg-surface-container-lowest text-primary font-label-sm text-[11px] font-semibold cursor-pointer"
                      >
                        Elegir otro icono
                      </button>
                      <button
                        type="button"
                        aria-label="Cerrar aviso de icono"
                        onClick={() => setIconError(null)}
                        className="w-7 h-7 rounded-md hover:bg-black/10 flex items-center justify-center cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">close</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Cuadrícula visual de iconos de ambiente */}
                <div
                  className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 pt-1"
                  role="radiogroup"
                  aria-label={`Seleccionar icono para Foto ${k + 1}`}
                >
                  {PHOTO_ICON_LIBRARY.map((ic) => {
                    const active = !ph.customIcon && selectedIcon === ic.id;
                    return (
                      <button
                        key={ic.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => {
                          setIconError(null);
                          updateSlot(k, { icon: ic.id, customIcon: undefined });
                        }}
                        title={ic.label}
                        className={`py-1.5 px-1 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          active
                            ? "bg-[#141414] text-[#F5F3EE] border-[#141414] shadow-sm font-semibold"
                            : "bg-surface-container-low/60 text-primary border-[#ECEAE7] hover:border-primary"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden>
                          {ic.id}
                        </span>
                        <span className="font-label-sm text-[9px] leading-tight truncate max-w-full">
                          {ic.label.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campos siempre visibles: «Título» y «Subtítulo / Descripción breve» (ES / EN) */}
              <div className="grid grid-cols-1 gap-3 p-3.5 rounded-xl bg-surface-container-lowest border border-[#ECEAE7]">
                <label className="flex flex-col gap-1">
                  <span className="font-label-sm text-[11px] text-secondary uppercase tracking-wider font-semibold flex items-center justify-between">
                    <span>Título de Foto {k + 1} ({lang === "es" ? "Español · ES" : "English · EN"})</span>
                    {!showCap && <span className="text-[10px] text-secondary font-normal">Texto oculto en web</span>}
                  </span>
                  <input
                    className={`${pInput} h-10 text-body-sm`}
                    placeholder={
                      lang === "es"
                        ? "Ej. Suite principal con vestidor"
                        : "E.g. Primary Suite with Walk-in Closet"
                    }
                    value={currentCaption}
                    onChange={(e) =>
                      updateSlot(
                        k,
                        lang === "es"
                          ? { captionEs: e.target.value, room: e.target.value }
                          : { captionEn: e.target.value },
                      )
                    }
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-label-sm text-[11px] text-secondary uppercase tracking-wider font-semibold">
                    Subtítulo / Descripción breve ({lang === "es" ? "ES" : "EN"})
                  </span>
                  <input
                    className={`${pInput} h-10 text-body-sm`}
                    placeholder={
                      lang === "es"
                        ? "Ej. Salida directa a terraza privada"
                        : "E.g. Direct access to private terrace"
                    }
                    value={currentSub}
                    onChange={(e) =>
                      updateSlot(k, lang === "es" ? { subEs: e.target.value } : { subEn: e.target.value })
                    }
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Pie de la tarjeta: Navegación anterior/siguiente + Guardado en sitio sin redirección */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#ECEAE7]">
            <button
              type="button"
              onClick={goPrevPhoto}
              disabled={k === 0}
              className="h-10 px-3.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-primary hover:border-primary font-label-sm text-[12px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Foto anterior</span>
            </button>

            <div className="flex items-center gap-2">
              {onSave && (
                <button
                  type="button"
                  onClick={onSave}
                  className={`h-10 px-4 rounded-lg font-label-sm text-[12px] font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    dirty
                      ? "bg-[#D9381E] text-white shadow-sm hover:bg-[#B82D16]"
                      : "bg-[#141414] text-[#F5F3EE] hover:bg-primary-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Guardar fotos</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={goNextPhoto}
              disabled={k === MAX_PHOTOS - 1}
              className="h-10 px-3.5 rounded-lg bg-surface-container-lowest border border-[#ECEAE7] text-primary hover:border-primary font-label-sm text-[12px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <span>Siguiente foto</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function VideoTab({ d, set }: { d: Draft; set: (p: Partial<Draft>) => void }) {
  const initialParsed = parseVideoUrl(d.video);
  const [validated, setValidated] = useState<boolean>(() => initialParsed.valid);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(() =>
    initialParsed.valid
      ? { ok: true, t: `✓ Video válido · ${initialParsed.label}. Se mostrará en formato horizontal 16:9 en la ficha pública.` }
      : null,
  );

  const parsed = parseVideoUrl(d.video);

  const validate = () => {
    const res = parseVideoUrl(d.video);
    if (res.valid) {
      setValidated(true);
      setMsg({
        ok: true,
        t: `✓ Video válido · ${res.label}. El reproductor 16:9 está listo para mostrarse en la ficha pública.`,
      });
    } else {
      setValidated(false);
      setMsg({
        ok: false,
        t: "Enlace no válido. Ingresa una URL de YouTube (watch, youtu.be, shorts), Vimeo, TikTok o un archivo directo .mp4.",
      });
    }
  };

  const removeVideo = () => {
    set({ video: "" });
    setValidated(false);
    setMsg({ ok: true, t: "Video eliminado del borrador. Haz clic en «Guardar cambios» arriba para confirmar." });
  };

  return (
    <Card
      icon="smart_display"
      title="Video de la propiedad (Reproductor 16:9)"
      subtitle="Un recorrido en video multi-plataforma aumenta la conversión de visitas"
      aside={
        d.video.trim() ? (
          <button
            type="button"
            onClick={removeVideo}
            className="h-10 px-3.5 rounded-lg border border-outline-variant text-label-sm font-semibold text-on-surface-variant hover:border-[#D9381E] hover:text-[#D9381E] inline-flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Quitar video
          </button>
        ) : undefined
      }
    >
      <PField
        label="ENLACE DE VIDEO (YOUTUBE, VIMEO O TIKTOK)"
        hint="Acepta enlaces de YouTube (watch, youtu.be, shorts), Vimeo, TikTok o archivo directo .mp4."
      >
        {(id) => (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-secondary">
                link
              </span>
              <input
                id={id}
                className={`${pInput} pl-10`}
                value={d.video}
                onChange={(e) => {
                  const val = e.target.value;
                  set({ video: val });
                  const check = parseVideoUrl(val);
                  if (check.valid) {
                    setValidated(true);
                    setMsg({
                      ok: true,
                      t: `✓ Video válido · ${check.label}. Vista previa 16:9 activa abajo.`,
                    });
                  } else {
                    setValidated(false);
                    setMsg(null);
                  }
                }}
                placeholder="https://www.youtube.com/watch?v=... | https://vimeo.com/... | https://www.tiktok.com/@.../video/..."
              />
            </div>
            <button
              type="button"
              onClick={validate}
              className="h-12 px-6 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all active:scale-[0.98] cursor-pointer shrink-0 inline-flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              Validar
            </button>
          </div>
        )}
      </PField>

      {msg && (
        <div
          role="status"
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 font-body-sm text-body-sm ${
            msg.ok
              ? "bg-st-available-bg/60 border-st-available/30 text-st-available"
              : "bg-error-container/70 border-error/30 text-error"
          }`}
        >
          <span className="flex items-center gap-2 font-medium">
            <span className="material-symbols-outlined text-[18px]">{msg.ok ? "check_circle" : "error"}</span>
            {msg.t}
          </span>
          {parsed.valid && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#141414] text-[#F5F3EE] font-label-sm text-[11px] font-semibold uppercase tracking-wider shrink-0">
              {parsed.label} · 16:9
            </span>
          )}
        </div>
      )}

      {(validated || parsed.valid) && parsed.valid && (
        <div className="mt-2 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#D9381E]">play_circle</span>
              Vista previa en vivo del reproductor (16:9 horizontal)
            </span>
            <a
              href={parsed.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label-sm text-label-sm text-primary hover:text-[#D9381E] underline inline-flex items-center gap-1"
            >
              Abrir enlace original
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          </div>

          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#141414] border border-[#141414]/15 shadow-lg flex items-center justify-center">
            {parsed.platform === "mp4" && parsed.embedUrl ? (
              <video
                src={parsed.embedUrl}
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            ) : parsed.platform === "tiktok" ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#141414] text-[#F5F3EE] p-4">
                {parsed.embedUrl ? (
                  <iframe
                    src={parsed.embedUrl}
                    title="Vista previa TikTok RG"
                    className="w-full max-w-[340px] h-full border-0 bg-[#141414]"
                    allow="encrypted-media; fullscreen"
                  />
                ) : (
                  <div className="text-center space-y-2 max-w-md">
                    <span className="material-symbols-outlined text-[40px] text-[#D9381E]">smart_display</span>
                    <p className="font-title-md text-title-md font-semibold">Video de TikTok validado en marco 16:9</p>
                    <p className="text-body-sm text-[#F5F3EE]/75">
                      El enlace corto de TikTok está listo. Si el navegador bloquea el embed de terceros, el visitante verá el botón directo a TikTok.
                    </p>
                  </div>
                )}
                <a
                  href={parsed.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#141414]/90 border border-[#F5F3EE]/20 text-[#F5F3EE] text-label-sm font-semibold hover:bg-[#D9381E] hover:border-[#D9381E] transition-colors inline-flex items-center gap-1.5"
                >
                  Ver en TikTok
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
            ) : parsed.embedUrl ? (
              <iframe
                src={parsed.embedUrl}
                title={`Vista previa ${parsed.label}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : null}
          </div>
        </div>
      )}
    </Card>
  );
}
