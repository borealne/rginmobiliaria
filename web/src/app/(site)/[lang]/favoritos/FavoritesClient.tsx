"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useFavorites } from "@/components/site/Favorites";
import { PropertyCard } from "@/components/site/PropertyCard";
import { useVisit } from "@/components/site/VisitProvider";
import type { Lang, Property } from "@/lib/types";

export function FavoritesClient({ lang, properties }: { lang: Lang; properties: Property[] }) {
  const { codes, clear } = useFavorites();
  const { openVisit } = useVisit();
  const [copied, setCopied] = useState(false);

  const saved = useMemo(() => properties.filter((p) => codes.includes(p.code)), [properties, codes]);

  const handleShare = async () => {
    const summary = saved.map((p) => `${p.code} — ${p.title}`).join("\n");
    try {
      await navigator.clipboard.writeText(summary || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* sin portapapeles */
    }
  };

  return (
    <div className="bg-surface text-on-surface">
      <section className="border-b border-outline-variant bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-gutter py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[3px] w-8 bg-rg-red" aria-hidden="true" />
            <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">
              {lang === "en" ? "Personal Collection" : "Colección personal"}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-display-xl text-on-surface">
                {lang === "en" ? "Your favorite properties" : "Tus propiedades favoritas"}
              </h1>
              <p className="mt-3 text-body-lg text-on-surface-variant max-w-2xl">
                {lang === "en"
                  ? "Properties you have marked to compare and review."
                  : "Inmuebles que has marcado para comparar y revisar."}
              </p>
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 flex items-center gap-3 max-w-md">
              <span className="material-symbols-outlined text-primary text-[22px] shrink-0">phonelink_lock</span>
              <div>
                <p className="text-label-md font-semibold text-on-surface">
                  {lang === "en" ? "Saved on this device" : "Guardado en este dispositivo"}
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  {lang === "en"
                    ? "Stored in your browser without accounts or passwords."
                    : "Se conservan en este navegador sin crear cuenta ni contraseñas."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-outline-variant">
            <p className="text-label-md font-semibold text-on-surface">
              {saved.length}{" "}
              {lang === "en"
                ? saved.length === 1
                  ? "saved property"
                  : "saved properties"
                : saved.length === 1
                  ? "propiedad guardada"
                  : "propiedades guardadas"}
            </p>
            {saved.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-label-md font-medium hover:border-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all cursor-pointer motion-reduce:transition-none"
                >
                  <span className="material-symbols-outlined text-[17px]">share</span>
                  {copied
                    ? lang === "en"
                      ? "List copied"
                      : "Lista copiada"
                    : lang === "en"
                      ? "Share list"
                      : "Compartir"}
                </button>
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-label-md font-medium text-on-surface-variant hover:text-on-surface hover:border-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all cursor-pointer motion-reduce:transition-none"
                >
                  <span className="material-symbols-outlined text-[17px]">delete_sweep</span>
                  {lang === "en" ? "Clear" : "Limpiar"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-gutter py-10 md:py-14 space-y-10">
        {saved.length === 0 ? (
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-12 text-center max-w-xl mx-auto">
            <span className="material-symbols-outlined text-[42px] text-on-surface-variant">favorite_border</span>
            <h2 className="font-display text-headline-sm text-on-surface mt-3">
              {lang === "en" ? "No saved properties yet" : "No tienes propiedades guardadas"}
            </h2>
            <p className="mt-2 text-body-md text-on-surface-variant">
              {lang === "en"
                ? "Explore our Cuenca portfolio and tap the heart icon to save and compare without signing in."
                : "Explora nuestro portafolio en Cuenca y toca el ícono de corazón para guardar y comparar sin iniciar sesión."}
            </p>
            <Link
              href={`/${lang}/propiedades`}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-on-primary text-label-md font-semibold hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all motion-reduce:transition-none"
            >
              {lang === "en" ? "View properties" : "Ver propiedades"}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {saved.map((p) => (
                <PropertyCard key={p.code} p={p} lang={lang} />
              ))}
            </div>

            <section className="rounded-2xl bg-primary text-on-primary p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl space-y-2">
                <div className="inline-flex items-center gap-2 text-rg-gold text-label-sm uppercase tracking-widest font-semibold">
                  <span className="material-symbols-outlined text-[18px]">route</span>
                  {lang === "en" ? "Combined Tour" : "Recorrido coordinado"}
                </div>
                <h2 className="font-display text-headline-sm">
                  {lang === "en"
                    ? "Want a joint visit to these properties?"
                    : "¿Deseas una visita conjunta a estas propiedades?"}
                </h2>
                <p className="text-body-md text-on-primary/80">
                  {lang === "en"
                    ? "An RG advisor coordinates a single-day route across Cuenca according to your availability, with zero brokerage fee."
                    : "Un asesor de RG coordina la ruta de visitas en un solo día según tu disponibilidad en Cuenca, sin costo de corretaje."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openVisit(saved[0])}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-on-primary text-primary text-label-md font-semibold hover:bg-on-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary transition-all shrink-0 cursor-pointer motion-reduce:transition-none"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                {lang === "en" ? "Schedule favorites tour" : "Coordinar recorrido de favoritos"}
              </button>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
