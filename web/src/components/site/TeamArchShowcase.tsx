"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { WHATSAPP, isDarkHexColor, type TeamMemberItem } from "@/lib/data/content";
import type { Lang } from "@/lib/types";

const DEFAULT_LIGHT_HEXES = ["#F5F3EE", "#D5CFC4", "#E6DFD3", "#CFC7BA"];

const FALLBACK_TEAM_PNGS = [
  "/images/team/raul-garcia.png",
  "/images/team/valeria-andrade.png",
  "/images/team/sebastian-cordero.png",
  "/images/team/camila-villavicencio.png",
  "/images/team/mateo-benitez.png",
  "/images/team/daniela-ortiz.png",
];

function getShortFirstName(name: string): string {
  const cleaned = name
    .replace(/^(Ec\.|Arq\.|Ing\.|Abg\.|Lic\.|Dr\.)\s*/i, "")
    .trim();
  return cleaned.split(/\s+/)[0] || name;
}

export function TeamArchShowcase({
  team,
  lang,
}: {
  team: TeamMemberItem[];
  lang: Lang;
}) {
  const visibleMembers = useMemo(
    () => team.filter((m) => m.visible !== false),
    [team],
  );

  // Orden determinístico en SSR para evitar Hydration Mismatch; rotación dinámica en cliente
  const [clientShift, setClientShift] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [desktopOffset, setDesktopOffset] = useState(0);
  const [mobileIdx, setMobileIdx] = useState(0);
  const mobileTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const othersCount = visibleMembers.filter((m) => !m.isDirector).length;
    if (othersCount > 1) {
      setClientShift(new Date().getMinutes() % othersCount);
    }
  }, [visibleMembers]);

  const orderedMembers = useMemo(() => {
    if (visibleMembers.length <= 1 || clientShift === 0) return visibleMembers;
    const directors = visibleMembers.filter((m) => m.isDirector);
    const others = visibleMembers.filter((m) => !m.isDirector);
    if (others.length <= 1) return [...directors, ...others];
    const shift = clientShift % others.length;
    const rotatedOthers = [...others.slice(shift), ...others.slice(0, shift)];
    return [...directors, ...rotatedOthers];
  }, [visibleMembers, clientShift]);

  if (orderedMembers.length === 0) return null;

  const maxDesktopOffset = Math.max(0, orderedMembers.length - 4);
  const safeOffset = Math.min(desktopOffset, maxDesktopOffset);
  const desktopWindow = orderedMembers.slice(safeOffset, safeOffset + 4);

  const handleCardKeyDown = (e: KeyboardEvent<HTMLElement>, memberId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveId((cur) => (cur === memberId ? null : memberId));
    }
  };

  const handleMobileScroll = () => {
    const el = mobileTrackRef.current;
    if (!el) return;
    const step = 281; // 265px card + 16px gap
    const idx = Math.min(
      orderedMembers.length - 1,
      Math.max(0, Math.round(el.scrollLeft / step)),
    );
    setMobileIdx(idx);
  };

  const scrollToMobileIdx = (idx: number) => {
    const el = mobileTrackRef.current;
    if (!el) return;
    const clamped = Math.min(orderedMembers.length - 1, Math.max(0, idx));
    setMobileIdx(clamped);
    setActiveId(orderedMembers[clamped].id);
    el.scrollTo({ left: clamped * 281, behavior: "smooth" });
  };

  const renderArchCard = (
    member: TeamMemberItem,
    slotIndex: number,
    globalIndex: number,
    isMobile: boolean,
  ) => {
    const isActive = activeId === member.id;
    const isDirector = Boolean(member.isDirector);
    // Posiciones 1 y 3 (índices 0, 2) = Arcos altos (470px); 2 y 4 (índices 1, 3) = Arcos bajos (360px)
    const isTallRest = slotIndex % 2 === 0;
    const role = (lang === "en" ? member.roleEn || member.roleEs : member.roleEs).trim();
    const exp = (
      lang === "en" ? member.experienceEn || member.experienceEs : member.experienceEs
    ).trim();
    const bio = (lang === "en" ? member.bioEn || member.bioEs : member.bioEs).trim();
    const firstName = getShortFirstName(member.name);

    const archHex =
      member.archColor ||
      (isDirector
        ? "#242424"
        : DEFAULT_LIGHT_HEXES[globalIndex % DEFAULT_LIGHT_HEXES.length]);
    const isDarkBg = isDarkHexColor(archHex);

    const photoSrc =
      member.photo && member.photo.trim()
        ? member.photo.trim()
        : FALLBACK_TEAM_PNGS[globalIndex % FALLBACK_TEAM_PNGS.length];

    const desktopHeightClass = isActive
      ? "h-[505px] shadow-2xl"
      : isTallRest
        ? "h-[470px]"
        : "h-[360px]";

    const mobileHeightClass = isActive ? "h-[465px] shadow-2xl" : "h-[390px]";

    const whatsappMsg = encodeURIComponent(
      lang === "en"
        ? `Hello ${member.name}, I would like to speak with you about RG Inmobiliaria.`
        : `Hola ${member.name}, me gustaría conversar con usted sobre RG Inmobiliaria.`,
    );
    const whatsappHref = `https://wa.me/${WHATSAPP}?text=${whatsappMsg}`;

    return (
      <article
        key={`${isMobile ? "mob" : "desk"}-${member.id}`}
        role="button"
        tabIndex={0}
        aria-expanded={isActive}
        aria-label={`${member.name} — ${role}`}
        onMouseEnter={() => {
          if (!isMobile) setActiveId(member.id);
        }}
        onFocus={() => setActiveId(member.id)}
        onClick={() => {
          if (isMobile) {
            setActiveId((cur) => (cur === member.id ? null : member.id));
          } else {
            setActiveId(member.id);
          }
        }}
        onKeyDown={(e) => handleCardKeyDown(e, member.id)}
        style={{
          backgroundColor: archHex,
          color: isDarkBg ? "#F5F3EE" : "#141414",
        }}
        className={`group relative rounded-t-full border overflow-hidden flex flex-col justify-between cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#D9381E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          isDarkBg ? "border-white/15" : "border-black/10"
        } ${
          isMobile
            ? `w-[265px] shrink-0 snap-center ${mobileHeightClass}`
            : `w-full min-w-0 ${desktopHeightClass}`
        }`}
      >
        {/* Parte superior dentro de la bóveda semicircular (pt-16 md:pt-20 px-6 z-10) para evitar recortes en esquinas curvas */}
        <header className="pt-16 md:pt-20 px-6 text-center z-10 shrink-0">
          <h3 className="font-display text-[17px] lg:text-[19px] font-bold leading-tight text-balance break-words">
            {member.name}
          </h3>
          <p
            className={`mt-1.5 text-[11px] lg:text-[12px] font-medium leading-snug text-balance break-words ${
              isDarkBg ? "text-[#F5F3EE]/80" : "text-[#141414]/75"
            }`}
          >
            {role}
          </p>
        </header>

        {/* Parte inferior del arco: Retrato PNG silueteado de plano medio apoyado limpiamente en la base */}
        <div className="relative flex-1 w-full flex items-end justify-center overflow-hidden mt-auto pointer-events-none select-none">
          <Image
            src={photoSrc}
            alt={member.name}
            width={480}
            height={560}
            sizes="(max-width: 768px) 265px, 320px"
            className={`grayscale contrast-110 object-contain object-bottom w-full max-h-[72%] h-auto transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              isActive ? "scale-[1.04]" : ""
            }`}
            unoptimized={photoSrc.startsWith("data:") || photoSrc.startsWith("blob:")}
          />
        </div>

        {/* Panel inferior deslizable de alto contraste al pasar cursor / enfocar / tocar */}
        <div
          className={`absolute inset-x-0 bottom-0 z-20 bg-[#141414]/92 backdrop-blur-md text-[#F5F3EE] p-5 border-t border-white/10 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            isActive
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          {exp && (
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D9381E] text-white font-label-sm text-[10px] font-bold tracking-wide mb-2">
              {exp}
            </span>
          )}
          <p className="font-body-sm text-[12px] text-[#F5F3EE]/90 leading-relaxed mb-3.5 line-clamp-4">
            {bio}
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full min-h-10 px-4 py-2 rounded-full bg-[#F5F3EE] text-[#141414] hover:bg-[#D9381E] hover:text-white font-label-sm text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden>
              chat
            </span>
            <span>
              {lang === "en" ? `Talk with ${firstName}` : `Conversar con ${firstName}`}
            </span>
          </a>
        </div>
      </article>
    );
  };

  return (
    <div className="w-full">
      {/* Flechas discretas en escritorio (solo si hay más de 4 integrantes activos) */}
      {orderedMembers.length > 4 && (
        <div className="hidden md:flex items-center justify-end gap-2 mb-4">
          <span className="text-[12px] text-[#F5F3EE]/60 mr-2 font-mono">
            {safeOffset + 1}–{Math.min(safeOffset + 4, orderedMembers.length)} /{" "}
            {orderedMembers.length}
          </span>
          <button
            type="button"
            disabled={safeOffset === 0}
            onClick={() => setDesktopOffset((o) => Math.max(0, o - 1))}
            aria-label={lang === "en" ? "Previous team members" : "Integrantes anteriores"}
            className="w-9 h-9 rounded-full border border-[#F5F3EE]/25 text-[#F5F3EE] hover:border-[#F5F3EE] hover:bg-[#F5F3EE]/10 flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <button
            type="button"
            disabled={safeOffset >= maxDesktopOffset}
            onClick={() => setDesktopOffset((o) => Math.min(maxDesktopOffset, o + 1))}
            aria-label={lang === "en" ? "Next team members" : "Siguientes integrantes"}
            className="w-9 h-9 rounded-full border border-[#F5F3EE]/25 text-[#F5F3EE] hover:border-[#F5F3EE] hover:bg-[#F5F3EE]/10 flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      )}

      {/* Pista Escritorio (>= 768px): 4 arcos escalonados pegados al borde inferior */}
      <div
        onMouseLeave={() => setActiveId(null)}
        className="hidden md:grid md:grid-cols-4 gap-4 lg:gap-6 items-end min-h-[510px]"
      >
        {desktopWindow.map((member, slotIdx) =>
          renderArchCard(member, slotIdx, safeOffset + slotIdx, false),
        )}
      </div>

      {/* Carrusel Táctil Móvil (< 768px / 390px): snap horizontal con arcos de 265px */}
      <div className="md:hidden pb-6">
        <div
          ref={mobileTrackRef}
          onScroll={handleMobileScroll}
          className="flex items-end gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 px-1"
        >
          {orderedMembers.map((member, idx) => renderArchCard(member, idx, idx, true))}
        </div>

        {/* Indicadores inferiores (1 / N) */}
        <div className="mt-4 flex items-center justify-between gap-3 px-1">
          <span className="font-mono text-[12px] font-bold text-[#F5F3EE]/80">
            {mobileIdx + 1} / {orderedMembers.length}
          </span>
          <div className="flex items-center gap-1.5">
            {orderedMembers.map((m, idx) => (
              <button
                key={`dot-${m.id}`}
                type="button"
                aria-label={`${lang === "en" ? "Go to" : "Ver a"} ${m.name}`}
                onClick={() => scrollToMobileIdx(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === mobileIdx ? "w-6 bg-[#D9381E]" : "w-2 bg-[#F5F3EE]/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
