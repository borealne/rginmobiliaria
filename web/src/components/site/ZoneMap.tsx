/**
 * Mapa de zona (regla 3): solo zonas sombreadas (#111111 al 15 %, borde de 2 px).
 * Nunca pines, calles, dirección ni coordenadas. Es un esquema de las parroquias
 * de Cuenca, no un mapa geográfico.
 */

const CENTERS: Record<string, [number, number]> = {
  "San Joaquín": [62, 108],
  "San Sebastián": [150, 104],
  Bellavista: [196, 76],
  Machángara: [256, 62],
  Ricaurte: [308, 50],
  Challuabamba: [362, 72],
  "El Batán": [112, 140],
  "El Centro Histórico": [202, 124],
  Totoracocha: [266, 118],
  Misicata: [64, 168],
  Yanuncay: [146, 172],
  "Puertas del Sol": [200, 168],
  Baños: [86, 214],
  Turi: [194, 214],
  Tarqui: [262, 222],
};

function hex(cx: number, cy: number, r: number, seed: number) {
  const pts: string[] = [];
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k + Math.PI / 6;
    const jitter = 1 + (((seed * (k + 3)) % 7) - 3) / 22;
    pts.push(`${Math.round(cx + Math.cos(a) * r * jitter * 1.15)},${Math.round(cy + Math.sin(a) * r * jitter)}`);
  }
  return pts.join(" ");
}

const ZONE_NAMES = Object.keys(CENTERS);

function Contours() {
  return (
    <g stroke="currentColor" strokeDasharray="4 4" strokeWidth="0.8" fill="none">
      <path d="M-220 20 Q -100 40, 0 10 T 220 40 T 440 20 T 660 40" />
      <path d="M-220 60 Q -100 80, 0 50 T 220 80 T 440 60 T 660 80" />
      <path d="M-220 140 Q -100 120, 20 160 T 240 130 T 460 150 T 680 130" />
      <path d="M-220 200 Q -50 210, 60 190 T 280 220 T 500 200 T 720 220" />
      <path d="M-220 260 Q -50 250, 60 270 T 280 250 T 500 270 T 720 250" />
    </g>
  );
}

/** Una sola zona sombreada (ficha de propiedad). */
export function ZoneMapSingle({ zone, className = "h-52" }: { zone: string; className?: string }) {
  const c = CENTERS[zone] ?? [200, 130];
  const k = ZONE_NAMES.indexOf(zone) + 2;
  return (
    <div className={`relative w-full rounded-lg overflow-hidden bg-[#F5F3F1] border border-[#ECEAE7] ${className}`}>
      <svg
        className="w-full h-full text-secondary/30"
        viewBox={`${c[0] - 160} ${c[1] - 100} 320 200`}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={`Zona aproximada: ${zone}`}
      >
        <rect x={c[0] - 400} y={c[1] - 400} width="800" height="800" fill="#F5F3F1" />
        <Contours />
        {ZONE_NAMES.filter((z) => z !== zone).map((z, i) => (
          <polygon key={z} points={hex(CENTERS[z][0], CENTERS[z][1], 26, i + 2)} fill="none" stroke="currentColor" strokeWidth="0.8" />
        ))}
        <polygon points={hex(c[0], c[1], 44, k)} fill="#111111" fillOpacity="0.15" stroke="#111111" strokeWidth="2" />
        <text fill="#111111" fontFamily="var(--font-montserrat)" fontSize="11" fontWeight="700" letterSpacing="1.2" textAnchor="middle" x={c[0]} y={c[1] + 4}>
          {zone.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}

/** Vista "Mapa" de resultados: zonas con número de propiedades; sin pines. */
export function ZoneMapOverview({ counts, onPick, active }: { counts: Map<string, number>; onPick: (zone: string) => void; active?: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-[#ECEAE7] p-4 md:p-6">
      <div className="relative w-full rounded-lg overflow-hidden bg-[#F5F3F1] border border-[#ECEAE7]">
        <svg className="w-full h-auto text-secondary/30" viewBox="0 0 420 260" role="group" aria-label="Zonas de Cuenca con propiedades">
          <Contours />
          {ZONE_NAMES.map((z, i) => {
            const n = counts.get(z) ?? 0;
            const [x, y] = CENTERS[z];
            const on = active === z;
            return (
              <g
                key={z}
                role="button"
                tabIndex={n ? 0 : -1}
                aria-label={`${z}: ${n} ${n === 1 ? "propiedad" : "propiedades"}`}
                aria-pressed={on}
                aria-disabled={!n}
                onClick={() => n && onPick(z)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && n) {
                    e.preventDefault();
                    onPick(z);
                  }
                }}
                className={n ? "cursor-pointer focus:outline-none [&:focus-visible>polygon]:stroke-[3]" : ""}
              >
                <polygon
                  points={hex(x, y, 27, i + 2)}
                  fill="#111111"
                  fillOpacity={n ? (on ? 0.35 : 0.15) : 0.03}
                  stroke={n ? "#111111" : "currentColor"}
                  strokeWidth={n ? 2 : 0.8}
                />
                <text x={x} y={y - 2} textAnchor="middle" fontSize="8" fontWeight="600" fill={n ? "#111111" : "#6B6560"} fontFamily="var(--font-inter)">
                  {z.replace("El Centro Histórico", "Centro")}
                </text>
                {n > 0 && (
                  <text x={x} y={y + 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#111111" fontFamily="var(--font-montserrat)">
                    {n}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="font-body-sm text-body-sm text-secondary mt-3 flex items-start gap-1.5">
        <span className="material-symbols-outlined text-[16px] mt-0.5" aria-hidden>
          info
        </span>
        Mostramos zonas, nunca la ubicación exacta. Toca una zona para ver sus propiedades.
      </p>
    </div>
  );
}

export const MAP_NOTICE = "Ubicación aproximada. La dirección exacta te la damos al coordinar la visita.";
