"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { Logo } from "./Logo";
import { useFavorites } from "./Favorites";
import { useVisit } from "./VisitProvider";

export function Header({ lang }: { lang: Lang }) {
  const d = t(lang);
  const pathname = usePathname();
  const search = useSearchParams();
  const [open, setOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeHash, setActiveHash] = useState("");
  const { openVisit } = useVisit();
  const { codes } = useFavorites();

  useEffect(() => setOpen(false), [pathname, search]);
  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash || "");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname, search]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // El selector de idioma conserva la página (PRD 7.1).
  const switchTo = (l: Lang) => {
    const rest = pathname.replace(/^\/(es|en)(?=\/|$)/, "");
    const qs = search.toString();
    return `/${l}${rest}${qs ? `?${qs}` : ""}`;
  };

  const op = search.get("op");
  const onHome = pathname === `/${lang}` || pathname === `/${lang}/`;
  const onResults = pathname.startsWith(`/${lang}/propiedades`) && !pathname.split("/")[3];
  const links = [
    { href: `/${lang}/propiedades?op=venta`, label: d.nav.comprar, active: onResults && op !== "alquiler" },
    { href: `/${lang}/propiedades?op=alquiler`, label: d.nav.alquilar, active: onResults && op === "alquiler" },
    { href: `/${lang}#zonas`, label: d.nav.zonas, hash: "#zonas", active: onHome && activeHash === "#zonas" },
    { href: `/${lang}#servicios`, label: d.nav.servicios, hash: "#servicios", active: onHome && activeHash === "#servicios" },
    { href: `/${lang}/blog`, label: d.nav.blog, active: pathname.startsWith(`/${lang}/blog`) },
    { href: `/${lang}#quienes-somos`, label: d.nav.quienes, hash: "#quienes-somos", active: onHome && activeHash === "#quienes-somos" },
    { href: `/${lang}/vende-o-alquila`, label: d.nav.contacto, active: pathname.startsWith(`/${lang}/vende-o-alquila`) },
  ];

  const langSwitch = (
    <div className="flex items-center gap-space-xs" aria-label="Idioma">
      {(["es", "en"] as Lang[]).map((l, i) => (
        <span key={l} className="flex items-center gap-space-xs">
          {i > 0 && <span className="text-outline-variant font-label-sm text-label-sm">|</span>}
          <Link
            href={switchTo(l)}
            hrefLang={l}
            aria-current={l === lang ? "true" : undefined}
            className={
              l === lang
                ? "font-label-md text-label-md text-primary font-bold px-1 min-h-11 flex items-center"
                : "font-label-md text-label-md text-on-surface-variant hover:text-on-surface px-1 transition-colors min-h-11 flex items-center"
            }
          >
            {l.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );

  return (
    <header className="print:hidden fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-surface-variant">
      <div className="h-16 md:h-20 max-w-7xl mx-auto px-gutter-mobile md:px-gutter flex items-center justify-between gap-space-md">
        <Logo lang={lang} />
        <nav
          className="hidden xl:flex items-center gap-space-lg"
          aria-label="Principal"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {links.map((l, i) => {
            const dist = hoveredIndex === null ? null : Math.abs(hoveredIndex - i);
            const dockClass =
              dist === 0
                ? "xl:-translate-y-1 xl:scale-115 text-[#141414] font-semibold"
                : dist === 1
                  ? "xl:-translate-y-0.5 xl:scale-105 text-[#141414]/85"
                  : dist !== null
                    ? "text-[#6B6560]/55"
                    : l.active
                      ? "text-[#141414] font-semibold"
                      : "text-on-surface-variant";

            return (
              <Link
                key={l.label}
                href={l.href}
                aria-current={l.active ? "page" : undefined}
                onClick={() => setActiveHash(l.hash ?? "")}
                onMouseEnter={() => {
                  if (typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
                    setHoveredIndex(i);
                  }
                }}
                className={`relative inline-block py-2 font-label-md text-label-md origin-center transition-all duration-200 ease-out will-change-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded motion-reduce:transition-none motion-reduce:transform-none ${dockClass}`}
              >
                {l.label}
                {l.active && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#D9381E]"
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-space-sm md:gap-space-md flex-shrink-0">
          <div className="pr-space-sm md:pr-space-md border-r border-surface-variant">{langSwitch}</div>
          <Link
            href={`/${lang}/favoritos`}
            aria-label={d.nav.favoritos}
            className="group relative w-11 h-11 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-rg-red hover:bg-surface-container-low active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200 cursor-pointer motion-reduce:transition-none"
          >
            <span className="material-symbols-outlined text-[20px] transition-all duration-200 group-hover:text-rg-red group-hover:scale-110 motion-reduce:transition-none">favorite</span>
            {codes.length > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rg-red text-white text-[11px] font-bold grid place-items-center leading-none">
                {codes.length}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => openVisit()}
            className="hidden sm:flex h-12 px-space-lg rounded-lg bg-primary text-on-primary font-label-md text-label-md items-center justify-center hover:bg-rg-red hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rg-red focus-visible:ring-offset-2 transition-all duration-300 ease-out cursor-pointer motion-reduce:transition-none motion-reduce:hover:translate-y-0 shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
          >
            {d.visit}
          </button>
          <button
            type="button"
            className="xl:hidden w-11 h-11 rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-container-low active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all cursor-pointer motion-reduce:transition-none"
            aria-label={open ? d.close : d.menu}
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="material-symbols-outlined">{open ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div id="menu-movil" className="xl:hidden fixed inset-x-0 top-16 md:top-20 bottom-0 bg-surface-container-lowest overflow-y-auto">
          <nav className="flex flex-col px-gutter-mobile py-space-md" aria-label="Menú">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="min-h-12 flex items-center justify-between border-b border-[#ECEAE7] font-title-md text-title-md text-on-surface"
              >
                {l.label}
                <span className="material-symbols-outlined text-secondary">chevron_right</span>
              </Link>
            ))}
            <Link
              href={`/${lang}/favoritos`}
              className="min-h-12 flex items-center justify-between border-b border-[#ECEAE7] font-title-md text-title-md text-on-surface"
            >
              <span>
                {d.nav.favoritos}
                {codes.length > 0 ? ` (${codes.length})` : ""}
              </span>
              <span className="material-symbols-outlined text-secondary">chevron_right</span>
            </Link>
            <Link
              href={`/${lang}/preguntas-frecuentes`}
              className="min-h-12 flex items-center justify-between border-b border-[#ECEAE7] font-title-md text-title-md text-on-surface"
            >
              {d.nav.faq}
              <span className="material-symbols-outlined text-secondary">chevron_right</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openVisit();
              }}
              className="mt-space-lg h-12 w-full rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-rg-red active:scale-[0.98] transition-all cursor-pointer motion-reduce:transition-none"
            >
              {d.visit}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
