"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Ventana accesible: se cierra con Esc, con la X o tocando el fondo;
 * mantiene el foco adentro y lo devuelve al cerrar.
 */
export function Modal({
  open,
  onClose,
  labelledBy,
  children,
  className = "max-w-[680px]",
  align = "center",
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  className?: string;
  align?: "center" | "right";
}) {
  const panel = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () =>
      Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select,textarea,[tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    const first = focusables().find((el) => !el.hasAttribute("data-skip-autofocus"));
    (first ?? panel.current)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
      } else if (e.key === "Tab") {
        const els = focusables();
        if (!els.length) return;
        const a = els[0];
        const z = els[els.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[80] flex ${
        align === "right" ? "justify-end" : "items-end sm:items-center justify-center p-0 sm:p-gutter"
      } overflow-y-auto`}
    >
      <div className="fixed inset-0 bg-primary/40 backdrop-blur-[4px] animate-[fadeInUp_.2s_ease-out_both]" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`relative z-10 w-full ${className} bg-surface-container-lowest shadow-2xl overflow-hidden flex flex-col outline-none animate-fade-in ${
          align === "right" ? "h-full sm:rounded-l-2xl" : "rounded-t-2xl sm:rounded-2xl sm:my-auto max-h-[100dvh] sm:max-h-[calc(100dvh-3rem)]"
        }`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function CloseButton({ onClick, label = "Cerrar ventana", className = "" }: { onClick: () => void; label?: string; className?: string }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      data-skip-autofocus
      type="button"
      className={`w-11 h-11 rounded-full flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-container-low transition-colors flex-shrink-0 ${className}`}
    >
      <span className="material-symbols-outlined text-[24px]">close</span>
    </button>
  );
}
