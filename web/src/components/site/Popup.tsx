"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { POPUP } from "@/lib/data/content";
import { getProperty, money, propertyHref } from "@/lib/properties";
import type { Lang } from "@/lib/types";

const KEY = "rg-popup-visto";
const POPUP_CMS_STORAGE_KEY = "rg_popup_cms_v1";

/**
 * Ventana emergente (S9, regla 7): anuncia una propiedad o un proyecto.
 * Nunca descuentos, porcentajes, "oferta" ni cuentas regresivas.
 * Se sincroniza con el CMS del panel (rg_popup_cms_v1).
 */
export function Popup({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const [cms, setCms] = useState({
    enabled: true,
    code: POPUP.code,
    kicker: POPUP.kicker,
    title: POPUP.subtitle,
    text: POPUP.text,
    image: POPUP.image,
    delay: 5,
  });
  const pathname = usePathname();

  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem(POPUP_CMS_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        setCms((prev) => ({
          enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : prev.enabled,
          code: typeof parsed.code === "string" && parsed.code ? parsed.code : prev.code,
          kicker: typeof parsed.kicker === "string" && parsed.kicker ? parsed.kicker : prev.kicker,
          title: typeof parsed.title === "string" && parsed.title ? parsed.title : prev.title,
          text: typeof parsed.text === "string" && parsed.text ? parsed.text : prev.text,
          image: typeof parsed.image === "string" && parsed.image ? parsed.image : prev.image,
          delay: typeof parsed.delay === "number" && parsed.delay >= 3 ? parsed.delay : prev.delay,
        }));
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
  }, []);

  const p = getProperty(cms.code) ?? getProperty(POPUP.code);

  useEffect(() => {
    if (!cms.enabled || !p || pathname.includes(p.slug)) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      /* sin almacenamiento: se muestra igual una vez */
    }
    if (seen) return;
    const t = setTimeout(() => {
      setOpen(true);
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* sin almacenamiento */
      }
    }, cms.delay * 1000);
    return () => clearTimeout(t);
  }, [cms.enabled, cms.delay, p, pathname]);

  if (!cms.enabled || !p || !open) return null;
  const units = p.units ?? [];
  const beds = units.length ? `${Math.min(...units.map((u) => u.bedrooms))} a ${Math.max(...units.map((u) => u.bedrooms))} hab.` : `${p.bedrooms} hab.`;
  const areas = units.length ? `${Math.min(...units.map((u) => u.area))} a ${Math.max(...units.map((u) => u.area))} m²` : `${p.areaBuilt} m²`;
  const close = () => setOpen(false);
  const popupImg = cms.image || POPUP.image;

  return (
    <Modal open onClose={close} labelledBy="popup-title" className="max-w-[780px]">
      <div className="relative flex flex-col md:flex-row overflow-y-auto">
        <button
          aria-label="Cerrar ventana emergente"
          onClick={close}
          type="button"
          data-skip-autofocus
          className="absolute top-3 right-3 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-surface-container-lowest/90 hover:bg-surface-container-high text-on-surface shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div className="relative w-full md:w-[48%] h-56 md:h-auto md:min-h-[500px] overflow-hidden bg-surface-container">
          <Image
            src={popupImg}
            alt={`${p.title}: vista general`}
            fill
            sizes="(min-width: 768px) 380px, 100vw"
            className="object-cover"
            unoptimized={popupImg.startsWith("data:") || popupImg.startsWith("blob:")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          <div className="absolute top-4 left-4 flex flex-col items-start gap-2 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/95 shadow-sm font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden />
              {p.operation === "venta" ? "Venta" : "Alquiler"}
            </span>
            {p.exclusive && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-rg-gold shadow-sm font-label-sm text-label-sm font-semibold tracking-wider uppercase">
                <span className="material-symbols-outlined icon-fill text-[14px]" aria-hidden>
                  star
                </span>
                Exclusiva RG
              </span>
            )}
          </div>
          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-end">
            <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded bg-surface-container-lowest/30 backdrop-blur-md text-surface-bright uppercase tracking-wider">
              {p.status === "en-construccion" ? `En construcción ${p.progress} %` : p.status === "sobre-planos" ? "Sobre planos" : "Disponible"}
            </span>
          </div>
        </div>
        <div className="w-full md:w-[52%] p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-surface-container-lowest">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-5 h-[2.5px] bg-rg-red rounded-full inline-block" aria-hidden />
              <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase font-medium">{cms.kicker}</span>
            </div>
            <h2 id="popup-title" className="font-headline-md text-headline-md text-on-surface tracking-tight leading-snug">
              {p.title}
            </h2>
            <p className="font-title-md text-title-md text-on-surface-variant font-normal mt-0.5 mb-2">{cms.title}</p>
            <div className="flex items-center gap-1.5 text-secondary mb-5">
              <span className="material-symbols-outlined text-[18px]" aria-hidden>
                location_on
              </span>
              <span className="font-body-sm text-body-sm">
                {p.city} · {p.zone}
              </span>
            </div>
            <div className="bg-surface-container-low px-4 py-3 rounded-lg flex items-baseline justify-between mb-5 gap-3">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Precio</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  {p.priceFrom && <span className="font-label-md text-label-md text-secondary">desde</span>}
                  <span className="font-price-display text-price-display text-on-surface font-bold tracking-tight">{money(p.price)}</span>
                </div>
              </div>
              {p.delivery && (
                <div className="text-right">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">Entrega estimada</span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">{p.delivery}</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { icon: "bed", t: beds },
                { icon: "straighten", t: areas },
                { icon: "balcony", t: "Terrazas" },
              ].map((x) => (
                <div key={x.icon} className="flex flex-col items-center justify-center p-2 rounded-md bg-surface-container text-center">
                  <span className="material-symbols-outlined text-secondary text-[18px]" aria-hidden>
                    {x.icon}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface font-medium mt-0.5">{x.t}</span>
                </div>
              ))}
            </div>
            <p className="font-body-sm text-body-sm text-secondary leading-relaxed mb-6">{cms.text}</p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href={propertyHref(lang, p)}
                onClick={close}
                className="w-full sm:flex-1 h-12 inline-flex items-center justify-center px-6 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm group"
              >
                Ver propiedad
                <span className="material-symbols-outlined text-[18px] ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <button type="button" onClick={close} className="w-full sm:w-auto h-12 px-5 inline-flex items-center justify-center rounded-lg font-label-md text-label-md text-secondary hover:text-on-surface hover:bg-surface-container">
                Ahora no
              </button>
            </div>
            <p className="hidden sm:flex items-center justify-end gap-1 font-label-sm text-label-sm text-outline">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-secondary text-[10px] font-sans">Esc</kbd> para cerrar
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
