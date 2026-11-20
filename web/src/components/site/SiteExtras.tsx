"use client";

import { WHATSAPP } from "@/lib/data/content";
import type { Lang } from "@/lib/types";
import { Assistant } from "./Assistant";
import { Popup } from "./Popup";

/** Elementos flotantes del sitio: botón de WhatsApp (celular), asistente y ventana emergente. */
export function SiteExtras({ lang }: { lang: Lang }) {
  return (
    <>
      <a
        href={`https://wa.me/${WHATSAPP}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribir por WhatsApp"
        className="fab-lift print:hidden sm:hidden fixed bottom-4 left-4 z-40 w-14 h-14 rounded-full bg-[#111111] text-on-primary flex items-center justify-center shadow-lg"
      >
        <span className="material-symbols-outlined icon-fill text-[26px]">chat</span>
      </a>
      <Assistant lang={lang} />
      <Popup lang={lang} />
    </>
  );
}
