"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { priceText } from "@/lib/properties";
import { PanelProvider, usePanel } from "./PanelProvider";

const NAV = [
  { href: "/panel/propiedades", label: "Propiedades", icon: "apartment" },
  { href: "/panel/contenido", label: "Contenido web", icon: "web" },
  { href: "/panel/blog", label: "Blog", icon: "edit_note" },
  { href: "/panel/pipeline", label: "Contactos y pipeline", icon: "view_kanban" },
  { href: "/panel/configuracion", label: "Configuración", icon: "settings", superOnly: true },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole, user } = usePanel();
  const supabaseReady = isSupabaseConfigured();

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/panel/login");
  };
  return (
    <div className="h-full w-[260px] bg-primary text-on-primary flex flex-col justify-between select-none">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="h-20 px-5 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-surface text-primary flex items-center justify-center font-title-md text-title-md shrink-0 shadow-sm">
            <span className="tracking-tighter">RG</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-title-md text-title-md leading-tight text-surface tracking-tight truncate">RG Inmobiliaria</span>
            <span className="font-label-sm text-label-sm text-surface-variant/80 tracking-wide truncate uppercase">Panel de control</span>
          </div>
        </div>
        <div className="px-4 py-2">
          <div className="h-px w-full bg-inverse-surface" />
        </div>
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto" aria-label="Módulos del panel">
          {NAV.filter((n) => !n.superOnly || role === "super").map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 px-3 min-h-11 rounded-lg transition-all duration-150 ${
                  active ? "bg-surface-container-lowest text-primary font-title-md text-[15px]" : "text-surface-variant font-label-md text-label-md hover:bg-inverse-surface hover:text-on-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden>
                  {n.icon}
                </span>
                <span className="truncate">{n.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 bg-primary-container">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-surface-container-low text-primary flex items-center justify-center shrink-0 font-label-md text-label-md font-semibold">
            {user.initials}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-label-md text-label-md text-surface font-semibold truncate">{user.name}</span>
            <span className="font-label-sm text-label-sm text-surface-variant/70 truncate">
              {role === "super" ? "Super admin" : "Asesor comercial"}
            </span>
          </div>
        </div>
        {!supabaseReady && (
          <label className="block mb-3">
            <span className="font-label-sm text-[11px] text-surface-variant/70 uppercase tracking-wider">Ver como (prueba)</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "super" | "asesor")}
              className="mt-1 w-full h-10 px-2 rounded bg-inverse-surface text-surface font-label-sm text-label-sm focus:outline-none focus:ring-1 focus:ring-surface"
            >
              <option value="super">Ec. Raúl García · Super admin</option>
              <option value="asesor">Arq. Mateo Silva · Asesor</option>
            </select>
          </label>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 min-h-10 px-3 rounded bg-inverse-surface hover:bg-surface hover:text-primary text-surface font-label-sm text-label-sm transition-colors duration-150 cursor-pointer active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { properties, leads } = usePanel();

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { props: [], contacts: [] };
    const props = properties
      .filter((p) => `${p.code} ${p.title} ${p.zone} ${p.city}`.toLowerCase().includes(q))
      .slice(0, 5);
    const contacts = leads
      .filter((l) => `${l.name} ${l.phone} ${l.email ?? ""} ${l.propertyCode ?? ""} ${l.campaign ?? ""}`.toLowerCase().includes(q))
      .slice(0, 5);
    return { props, contacts };
  }, [searchQuery, properties, leads]);

  if (pathname === "/panel/login" || pathname === "/panel/recuperar") {
    return <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">{children}</div>;
  }

  const totalMatches = searchResults.props.length + searchResults.contacts.length;

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      <aside className="hidden lg:block fixed left-0 top-0 h-full z-50">
        <Sidebar />
      </aside>
      {open && (
        <div className="lg:hidden fixed inset-0 z-[70] flex">
          <div className="absolute inset-0 bg-primary/40" onClick={() => setOpen(false)} aria-hidden />
          <div className="relative h-full animate-fade-in" role="dialog" aria-modal="true" aria-label="Menú del panel">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
      <div className="lg:pl-[260px]">
        <header className="sticky top-0 h-16 lg:h-20 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-gutter-mobile md:px-gutter flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setOpen(true)}
              className="lg:hidden w-11 h-11 rounded-lg flex items-center justify-center hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[18px]" aria-hidden>
                dashboard
              </span>
              <span aria-hidden>/</span>
              <span className="text-on-surface font-semibold uppercase tracking-wider">Administración</span>
            </div>
            <div ref={searchBoxRef} className="relative flex-1 hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline" aria-hidden>
                search
              </span>
              <label htmlFor="panel-search" className="sr-only">
                Buscar propiedades, contactos o códigos en el panel
              </label>
              <input
                id="panel-search"
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                placeholder="Buscar propiedades, contactos, códigos…"
                type="search"
                autoComplete="off"
              />
              {searchOpen && searchQuery.trim().length > 0 && (
                <div
                  id="panel-search-results"
                  role="listbox"
                  aria-label="Resultados de búsqueda rápida"
                  className="absolute left-0 right-0 top-12 z-50 rounded-xl bg-surface-container-lowest border border-[#141414]/15 shadow-2xl overflow-hidden max-h-[420px] overflow-y-auto animate-fade-in"
                >
                  {totalMatches === 0 ? (
                    <div className="p-4 text-center font-body-sm text-body-sm text-secondary">
                      No se encontraron propiedades ni contactos para &ldquo;{searchQuery.trim()}&rdquo;.
                    </div>
                  ) : (
                    <div className="divide-y divide-outline-variant/60">
                      {searchResults.props.length > 0 && (
                        <div className="p-2">
                          <p className="px-2.5 py-1 text-[11px] font-label-sm uppercase tracking-wider text-secondary font-semibold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">apartment</span>
                            Propiedades ({searchResults.props.length})
                          </p>
                          <ul className="mt-1 space-y-0.5">
                            {searchResults.props.map((p) => (
                              <li key={p.code}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSearchOpen(false);
                                    setSearchQuery("");
                                    router.push(`/panel/propiedades/${p.code}`);
                                  }}
                                  className="w-full px-2.5 py-2 rounded-lg text-left hover:bg-[#F5F3EE] flex items-center justify-between gap-3 transition-colors cursor-pointer"
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="px-1.5 py-0.5 rounded bg-[#141414] text-[#F5F3EE] font-mono text-[11px] font-semibold">
                                        {p.code}
                                      </span>
                                      <span className="font-title-md text-body-sm font-semibold text-primary truncate">{p.title}</span>
                                    </div>
                                    <p className="text-[12px] text-secondary truncate mt-0.5">
                                      {p.city} · {p.zone}
                                    </p>
                                  </div>
                                  <span className="font-mono text-label-sm font-bold text-[#D9381E] shrink-0">{priceText(p)}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {searchResults.contacts.length > 0 && (
                        <div className="p-2">
                          <p className="px-2.5 py-1 text-[11px] font-label-sm uppercase tracking-wider text-secondary font-semibold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            Contactos del Pipeline ({searchResults.contacts.length})
                          </p>
                          <ul className="mt-1 space-y-0.5">
                            {searchResults.contacts.map((l) => (
                              <li key={l.id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSearchOpen(false);
                                    setSearchQuery("");
                                    router.push(`/panel/pipeline?lead=${encodeURIComponent(l.id)}`);
                                  }}
                                  className="w-full px-2.5 py-2 rounded-lg text-left hover:bg-[#F5F3EE] flex items-center justify-between gap-3 transition-colors cursor-pointer"
                                >
                                  <div className="min-w-0">
                                    <p className="font-title-md text-body-sm font-semibold text-primary truncate">{l.name}</p>
                                    <p className="text-[12px] text-secondary truncate">
                                      {l.phone} {l.propertyCode ? `· Interés: ${l.propertyCode}` : ""}
                                    </p>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-[11px] font-label-sm font-semibold text-on-surface shrink-0">
                                    Ver ficha
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/es"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              Ver web
            </Link>
            <Link
              href="/panel/pipeline"
              aria-label="Avisos del pipeline"
              className="relative w-11 h-11 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-error" aria-hidden />
            </Link>
          </div>
        </header>
        <main className="w-full px-gutter-mobile md:px-gutter pb-16">{children}</main>
      </div>
    </div>
  );
}

export function PanelShell({ children }: { children: ReactNode }) {
  return (
    <PanelProvider>
      <Frame>{children}</Frame>
    </PanelProvider>
  );
}

export function PageHeader({ crumbs, title, text, actions }: { crumbs: string[]; title: string; text?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pt-6 pb-8">
      <div className="flex flex-col gap-2">
        <nav className="flex items-center gap-2 text-secondary font-label-sm text-label-sm flex-wrap" aria-label="Ruta">
          {crumbs.map((c, k) => (
            <span key={c} className="flex items-center gap-2">
              {k > 0 && <span className="text-outline-variant">/</span>}
              <span className={k === crumbs.length - 1 ? "text-primary font-medium" : ""}>{c}</span>
            </span>
          ))}
        </nav>
        <div className="relative pt-1">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary tracking-tight flex items-baseline gap-3">
            {title}
            <span className="inline-block w-8 h-[3px] bg-rg-red self-center rounded-full" aria-hidden />
          </h1>
          {text && <p className="font-body-md text-body-md text-secondary mt-1 max-w-2xl">{text}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
