/**
 * Datos internos del panel. NUNCA se usan en el sitio público (reglas 3 y 4):
 * dirección exacta, con quién se comparte, comisión, vencimiento y nota interna.
 * En la versión con servidor viven en una tabla con acceso solo para el equipo.
 */
export interface PrivateListing {
  kind: "exclusiva" | "compartida";
  expires?: string;
  sharedWith?: string;
  advisor: string;
  note?: string;
  address?: string;
  fee?: string;
}

export const PRIVATE: Record<string, PrivateListing> = {
  "CA-001": {
    kind: "exclusiva",
    expires: "2027-03-31",
    advisor: "raul",
    note: "El propietario acepta negociar hasta $140.000 sin línea blanca. Documentos de gravamen al día.",
    address: "Calle de ejemplo y referencia interna, Ricaurte (solo equipo)",
    fee: "4 %",
  },
  "DP-021": { kind: "exclusiva", expires: "2027-01-15", advisor: "andrea", address: "Referencia interna, Centro Histórico" },
  "ED-003": { kind: "exclusiva", expires: "2027-12-31", advisor: "mateo", note: "Obra propia de RG Constructora." },
  "DP-008": { kind: "exclusiva", expires: "2027-02-28", advisor: "raul" },
  "PH-002": { kind: "exclusiva", expires: "2027-04-30", advisor: "mateo" },
  "DP-014": { kind: "compartida", sharedWith: "Inmobiliaria aliada (ejemplo)", advisor: "andrea", fee: "2 %" },
};

export function privateOf(code: string): PrivateListing {
  return PRIVATE[code] ?? { kind: "compartida", advisor: "raul" };
}
