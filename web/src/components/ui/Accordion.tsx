"use client";

import { useId, useState } from "react";

/** Acordeón de preguntas (PRD sección 5): cerrado / abierto. */
export function Accordion({
  items,
  defaultOpen = 0,
  variant = "home",
  initialVisible,
}: {
  items: { q: string; a: string }[];
  defaultOpen?: number | null;
  variant?: "home" | "compact";
  /** Cuántas se ven antes de "Ver más". */
  initialVisible?: number;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const [all, setAll] = useState(!initialVisible || items.length <= initialVisible);
  const base = useId();
  const list = all ? items : items.slice(0, initialVisible);

  return (
    <div className={variant === "home" ? "flex flex-col gap-4" : "flex flex-col gap-3"}>
      {list.map((it, k) => {
        const isOpen = open === k;
        const id = `${base}-${k}`;
        return (
          <div key={it.q} className={`group transition-all duration-300 ease-out motion-reduce:transition-none ${variant === "home" ? "bg-surface-container-low rounded-xl p-5 md:p-6 hover:shadow-sm" : "bg-surface-container-lowest border border-[#ECEAE7] rounded-xl px-5 py-4 hover:border-outline-variant hover:shadow-sm"}`}>
            <h3>
              <button
                type="button"
                className="w-full min-h-11 flex items-center justify-between text-left gap-4 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.99] transition-transform duration-150 motion-reduce:transition-none"
                aria-expanded={isOpen}
                aria-controls={`${id}-panel`}
                id={`${id}-btn`}
                onClick={() => setOpen(isOpen ? null : k)}
              >
                <span className={variant === "home" ? "font-title-md text-[17px] md:font-headline-sm md:text-headline-sm text-on-surface font-semibold transition-colors duration-200 group-hover:text-primary" : "font-title-md text-title-md text-on-surface transition-colors duration-200 group-hover:text-primary"}>
                  {it.q}
                </span>
                <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 motion-reduce:transition-none ${isOpen ? "bg-primary text-on-primary" : "bg-surface-container text-primary group-hover:bg-primary group-hover:text-on-primary"}`}>
                  <span className={`material-symbols-outlined text-[22px] transition-transform duration-300 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} aria-hidden>
                    expand_more
                  </span>
                </span>
              </button>
            </h3>
            <div
              id={`${id}-panel`}
              role="region"
              aria-labelledby={`${id}-btn`}
              hidden={!isOpen}
              className={variant === "home" ? "mt-3 pt-3 text-secondary font-body-md text-body-md leading-relaxed" : "mt-2 text-secondary font-body-md text-body-md leading-relaxed"}
            >
              {it.a}
            </div>
          </div>
        );
      })}
      {!all && (
        <button
          type="button"
          onClick={() => setAll(true)}
          className="self-start min-h-11 inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary hover:underline cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md px-1 transition-all motion-reduce:transition-none"
        >
          Ver más preguntas ({items.length - (initialVisible ?? 0)})
          <span className="material-symbols-outlined text-[18px]">expand_more</span>
        </button>
      )}
    </div>
  );
}
