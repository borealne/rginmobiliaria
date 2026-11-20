"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ADVISORS, SEED_LEADS, type Lead, type LeadNote, type OriginKey } from "@/lib/data/leads";
import { PROPERTIES } from "@/lib/data/properties";
import { onLocalLeadsChange, readLocalLeads, type LocalLead } from "@/lib/leads-local";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Property } from "@/lib/types";

/**
 * Estado del panel guardado en este navegador mientras no hay servidor:
 * rol de prueba, cambios a propiedades y contactos (de prueba + los que llegan de la web).
 */
type Role = "super" | "asesor";
const K_ROLE = "rg-panel-rol";
const K_PROPS = "rg-panel-propiedades";
const K_ADDED_PROPS = "rg-panel-propiedades-nuevas";
const K_LEADS = "rg-panel-leads";

interface LeadPersistedState {
  added: Lead[];
  stage: Record<string, string>;
  replied: string[];
  notes?: Record<string, LeadNote[]>;
  advisors?: Record<string, string>;
}

interface Ctx {
  role: Role;
  setRole: (r: Role) => void;
  user: (typeof ADVISORS)[number];
  properties: Property[];
  addProperty: (p: Property) => void;
  updateProperty: (code: string, patch: Partial<Property>) => void;
  resetProperty: (code: string) => void;
  leads: Lead[];
  addLead: (l: Omit<Lead, "id" | "minutesAgo">) => void;
  moveLead: (id: string, stage: string) => void;
  markReplied: (id: string) => void;
  addLeadNote: (id: string, text: string) => void;
  assignLeadAdvisor: (id: string, advisorId: string) => void;
  toast: (msg: string) => void;
}

const PanelCtx = createContext<Ctx | null>(null);
export const usePanel = () => {
  const c = useContext(PanelCtx);
  if (!c) throw new Error("usePanel fuera de PanelProvider");
  return c;
};

function load<T>(k: string, fallback: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("rg-panel-updated"));
    }
  } catch {
    /* sin almacenamiento */
  }
}

const WEB_ORIGIN: Record<LocalLead["origin"], { origin: OriginKey; campaign: string }> = {
  "web-visita": { origin: "web", campaign: "Agendar visita" },
  "web-formulario": { origin: "web", campaign: "Formulario de la ficha" },
  "web-propietario": { origin: "web", campaign: "Vende o alquila con nosotros" },
  "web-asistente": { origin: "web", campaign: "Asistente de IA" },
  "web-busqueda": { origin: "web", campaign: "Dejó su búsqueda" },
  manual: { origin: "manual", campaign: "Cargada a mano" },
};

function fromLocal(l: LocalLead): Lead {
  const o = WEB_ORIGIN[l.origin];
  return {
    id: l.id,
    name: l.name,
    phone: l.phone,
    email: l.email,
    kind: l.kind,
    origin: o.origin,
    campaign: l.campaign ?? o.campaign,
    propertyCode: l.propertyCode,
    note: l.note,
    advisor: l.advisor ?? "raul",
    stage: l.stage ?? "nuevo",
    minutesAgo: Math.max(0, Math.round((Date.now() - new Date(l.createdAt).getTime()) / 60000)),
    noReply: true,
  };
}

export function PanelProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("super");
  const [overrides, setOverrides] = useState<Record<string, Partial<Property>>>({});
  const [addedProps, setAddedProps] = useState<Property[]>([]);
  const [leadState, setLeadState] = useState<LeadPersistedState>({ added: [], stage: {}, replied: {}, notes: {}, advisors: {} } as unknown as LeadPersistedState);
  const [webLeads, setWebLeads] = useState<Lead[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setRoleState(load<Role>(K_ROLE, "super"));
    setOverrides(load(K_PROPS, {}));
    setAddedProps(load<Property[]>(K_ADDED_PROPS, []));
    const loadedLeads = load<LeadPersistedState>(K_LEADS, { added: [], stage: {}, replied: [], notes: {}, advisors: {} });
    setLeadState({
      added: loadedLeads.added ?? [],
      stage: loadedLeads.stage ?? {},
      replied: Array.isArray(loadedLeads.replied) ? loadedLeads.replied : [],
      notes: loadedLeads.notes ?? {},
      advisors: loadedLeads.advisors ?? {},
    });
    const sync = () => setWebLeads(readLocalLeads().map(fromLocal));
    sync();

    const supabase = createBrowserSupabaseClient();
    if (supabase) {
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.role === "super" || profile?.role === "asesor") {
          setRoleState(profile.role);
        }
      });
    }

    return onLocalLeadsChange(sync);
  }, []);

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    save(K_ROLE, r);
  }, []);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg((m) => (m === msg ? null : m)), 2800);
  }, []);

  const addProperty = useCallback((p: Property) => {
    setAddedProps((prev) => {
      const next = [p, ...prev];
      save(K_ADDED_PROPS, next);
      return next;
    });
    fetch("/api/panel/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    }).catch(() => {});
  }, []);
  const updateProperty = useCallback((code: string, patch: Partial<Property>) => {
    setOverrides((o) => {
      const next = { ...o, [code]: { ...o[code], ...patch } };
      save(K_PROPS, next);
      return next;
    });
    const base = [...addedProps, ...PROPERTIES].find((item) => item.code === code);
    if (base) {
      fetch("/api/panel/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...base, ...overrides[code], ...patch }),
      }).catch(() => {});
    }
  }, [addedProps, overrides]);
  const resetProperty = useCallback((code: string) => {
    setOverrides((o) => {
      const next = { ...o };
      delete next[code];
      save(K_PROPS, next);
      return next;
    });
  }, []);

  const properties = useMemo(() => [...addedProps, ...PROPERTIES].map((p) => (overrides[p.code] ? { ...p, ...overrides[p.code] } : p)), [addedProps, overrides]);

  const user = role === "super" ? ADVISORS[0] : ADVISORS[1];

  const leads = useMemo(() => {
    const notesMap = leadState.notes ?? {};
    const advisorsMap = leadState.advisors ?? {};
    const repliedList = Array.isArray(leadState.replied) ? leadState.replied : [];
    const all = [...webLeads, ...leadState.added, ...SEED_LEADS].map((l) => ({
      ...l,
      stage: leadState.stage[l.id] ?? l.stage,
      advisor: advisorsMap[l.id] ?? l.advisor,
      noReply: repliedList.includes(l.id) ? false : l.noReply,
      notes: notesMap[l.id] ?? l.notes ?? [],
    }));
    // Cada asesor ve solo sus tarjetas; el super admin ve todas (PRD 7.5).
    return role === "super" ? all : all.filter((l) => l.advisor === user.id);
  }, [webLeads, leadState, role, user.id]);

  const persistLeads = (next: LeadPersistedState) => {
    setLeadState(next);
    save(K_LEADS, next);
  };
  const addLead = (l: Omit<Lead, "id" | "minutesAgo">) => {
    persistLeads({ ...leadState, added: [{ ...l, id: `M-${Date.now().toString(36)}`, minutesAgo: 0 }, ...leadState.added] });
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: "manual",
        kind: l.kind,
        name: l.name,
        phone: l.phone,
        email: l.email,
        propertyCode: l.propertyCode,
        note: l.note,
        campaign: l.campaign,
        stage: l.stage,
      }),
    }).catch(() => {});
  };
  const moveLead = (id: string, stage: string) => {
    persistLeads({ ...leadState, stage: { ...leadState.stage, [id]: stage } });
    fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stage }),
    }).catch(() => {});
  };
  const markReplied = (id: string) => {
    const repliedList = Array.isArray(leadState.replied) ? leadState.replied : [];
    persistLeads({ ...leadState, replied: Array.from(new Set([...repliedList, id])) });
    fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, markReplied: true }),
    }).catch(() => {});
  };
  const addLeadNote = (id: string, text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const now = new Date();
    const formattedDate = now.toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const entry: LeadNote = {
      id: `note-${Date.now().toString(36)}`,
      text: clean,
      author: user.name,
      date: formattedDate,
    };
    const prevNotes = leadState.notes?.[id] ?? [];
    const repliedList = Array.isArray(leadState.replied) ? leadState.replied : [];
    persistLeads({
      ...leadState,
      replied: Array.from(new Set([...repliedList, id])),
      notes: {
        ...(leadState.notes ?? {}),
        [id]: [entry, ...prevNotes],
      },
    });
  };
  const assignLeadAdvisor = (id: string, advisorId: string) => {
    persistLeads({
      ...leadState,
      advisors: {
        ...(leadState.advisors ?? {}),
        [id]: advisorId,
      },
    });
  };

  return (
    <PanelCtx.Provider
      value={{
        role,
        setRole,
        user,
        properties,
        addProperty,
        updateProperty,
        resetProperty,
        leads,
        addLead,
        moveLead,
        markReplied,
        addLeadNote,
        assignLeadAdvisor,
        toast,
      }}
    >
      {children}
      <div aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] pointer-events-none">
        {toastMsg && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-lg animate-fade-in">
            <span className="material-symbols-outlined icon-fill text-[18px]">check_circle</span>
            {toastMsg}
          </div>
        )}
      </div>
    </PanelCtx.Provider>
  );
}

export function timeAgo(min: number) {
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h${min % 60 ? ` ${min % 60} min` : ""}`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Ayer" : `Hace ${d} días`;
}
