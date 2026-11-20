"use client";

/**
 * Sin servidor en esta etapa: los contactos que llegan desde la web
 * (visita, formulario, propietarios, asistente) se guardan en este navegador
 * para que aparezcan en el pipeline del panel. Se reemplaza por la API real.
 */
export type LeadOrigin = "web-visita" | "web-formulario" | "web-propietario" | "web-asistente" | "web-busqueda" | "manual";

export interface LocalLead {
  id: string;
  createdAt: string;
  origin: LeadOrigin;
  kind: "comprador" | "arrendatario" | "propietario";
  name: string;
  phone: string;
  email?: string;
  propertyCode?: string;
  propertyTitle?: string;
  note?: string;
  campaign?: string;
  source?: string;
  advisor?: string;
  stage?: string;
}

const KEY = "rg-leads";
const EVT = "rg-leads-change";

export function readLocalLeads(): LocalLead[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as LocalLead[];
  } catch {
    return [];
  }
}

export function saveLocalLead(lead: Omit<LocalLead, "id" | "createdAt">): LocalLead {
  const full: LocalLead = { ...lead, id: `L-${Date.now().toString(36)}`, createdAt: new Date().toISOString() };
  try {
    const all = readLocalLeads();
    all.unshift(full);
    localStorage.setItem(KEY, JSON.stringify(all.slice(0, 200)));
    window.dispatchEvent(new Event(EVT));
  } catch {
    /* almacenamiento no disponible: la solicitud se muestra igual como enviada */
  }
  return full;
}

export function updateLocalLead(id: string, patch: Partial<LocalLead>) {
  try {
    const all = readLocalLeads().map((l) => (l.id === id ? { ...l, ...patch } : l));
    localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event(EVT));
  } catch {
    /* sin almacenamiento */
  }
}

export function onLocalLeadsChange(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Simula el envío (para mostrar el estado "Enviando…"). */
export const fakeNetwork = (ms = 700) => new Promise((r) => setTimeout(r, ms));

/** Envía el lead al endpoint real /api/leads y mantiene respaldo local para el modo sin servidor. */
export async function submitLead(lead: Omit<LocalLead, "id" | "createdAt">): Promise<LocalLead> {
  const saved = saveLocalLead(lead);
  try {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
  } catch {
    /* Mantiene respaldo local si no hay conexión o servidor */
  }
  return saved;
}
