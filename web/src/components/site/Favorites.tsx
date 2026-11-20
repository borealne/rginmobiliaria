"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

/** Favoritos sin cuentas: se guardan en este dispositivo (regla 2). */
const KEY = "rg-favoritos";
type Ctx = { codes: string[]; has: (code: string) => boolean; toggle: (code: string) => void; clear: () => void };
const FavCtx = createContext<Ctx>({ codes: [], has: () => false, toggle: () => {}, clear: () => {} });
export const useFavorites = () => useContext(FavCtx);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [codes, setCodes] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      setCodes(JSON.parse(localStorage.getItem(KEY) || "[]"));
    } catch {
      /* sin almacenamiento */
    }
  }, []);

  const toggle = useCallback((code: string) => {
    setCodes((prev) => {
      const added = !prev.includes(code);
      const next = added ? [...prev, code] : prev.filter((c) => c !== code);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* sin almacenamiento */
      }
      setToast(added ? "Guardado en este dispositivo" : "Quitado de tus favoritos");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 2600);
      return next;
    });
  }, []);

  const has = useCallback((code: string) => codes.includes(code), [codes]);

  const clear = useCallback(() => {
    setCodes([]);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* sin almacenamiento */
    }
    setToast("Lista de favoritos vaciada");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  return (
    <FavCtx.Provider value={{ codes, has, toggle, clear }}>
      {children}
      <div aria-live="polite" className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[90] pointer-events-none">
        {toast && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-lg animate-fade-in">
            <span className="material-symbols-outlined icon-fill text-[18px]">favorite</span>
            {toast}
          </div>
        )}
      </div>
    </FavCtx.Provider>
  );
}

export function FavoriteButton({ code, className = "" }: { code: string; className?: string }) {
  const { has, toggle } = useFavorites();
  const on = has(code);
  return (
    <button
      type="button"
      aria-label={on ? "Quitar de favoritos" : "Guardar en favoritos"}
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(code);
      }}
      className={`group/fav w-11 h-11 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none ${on ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-[#111111] hover:bg-primary hover:text-on-primary"} ${className}`}
    >
      <span className={`material-symbols-outlined text-[20px] transition-colors duration-200 ${on ? "icon-fill text-rg-gold" : ""}`}>{on ? "favorite" : "favorite_border"}</span>
    </button>
  );
}
