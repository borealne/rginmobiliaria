import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/site/property/PrintButton";
import { MAP_NOTICE, ZoneMapSingle } from "@/components/site/ZoneMap";
import { OFFICE_HOURS, PHONE } from "@/lib/data/content";
import { getProperty, isPublic, priceText, statusText, TYPE_LABEL } from "@/lib/properties";

export const metadata: Metadata = { title: "Ficha de la propiedad", robots: { index: false } };

/** Ficha en PDF (se guarda con "Imprimir → Guardar como PDF"). Lleva fecha y "La información puede cambiar". */
export default async function FichaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p || !isPublic(p)) notFound();
  const today = new Intl.DateTimeFormat("es-EC", { dateStyle: "long" }).format(new Date());
  const rows: [string, string | undefined][] = [
    ["Código", p.code],
    ["Tipo", TYPE_LABEL[p.type]],
    ["Operación", p.operation === "venta" ? "Venta" : "Alquiler"],
    ["Estado", statusText(p)],
    ["Zona", `${p.city} · ${p.zone}`],
    ["Habitaciones", p.bedrooms?.toString()],
    ["Baños", p.bathrooms?.toString()],
    ["Parqueaderos", p.parking?.toString()],
    ["Área de construcción", p.areaBuilt ? `${p.areaBuilt} m²` : undefined],
    ["Área de terreno", p.areaLand ? `${p.areaLand} m²` : undefined],
    ["Entrega estimada", p.delivery],
  ];
  return (
    <div className="max-w-[820px] mx-auto px-gutter-mobile md:px-gutter py-space-lg print:py-0 print:px-0">
      <div className="flex items-center justify-between gap-4 mb-6 print:hidden">
        <p className="font-body-sm text-body-sm text-secondary">Usa “Guardar como PDF” en la ventana de impresión.</p>
        <PrintButton />
      </div>
      <article className="bg-surface-container-lowest border border-[#ECEAE7] rounded-xl p-6 md:p-10 print:border-0 print:p-0">
        <header className="flex items-start justify-between gap-4 pb-4 border-b border-[#ECEAE7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">RG</div>
            <div>
              <p className="font-title-md text-title-md">RG Inmobiliaria y Constructora</p>
              <p className="font-label-sm text-label-sm text-secondary">
                {PHONE} · {OFFICE_HOURS}
              </p>
            </div>
          </div>
          <p className="font-label-sm text-label-sm text-secondary text-right">
            Generada el {today}
            <br />
            La información puede cambiar
          </p>
        </header>
        <h1 className="font-headline-lg text-headline-lg mt-6">{p.title}</h1>
        <p className="font-price-display text-price-display mt-1">{priceText(p)}</p>
        <div className="grid grid-cols-3 gap-2 mt-6">
          {p.photos.slice(0, 3).map((ph, k) => (
            <div key={ph.src} className={`relative ${k === 0 ? "col-span-3 aspect-[16/8]" : "aspect-[4/3]"} rounded-lg overflow-hidden`}>
              <Image src={ph.src} alt={ph.room} fill sizes="800px" className="object-cover" />
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div>
            <h2 className="font-title-md text-title-md mb-3">Datos principales</h2>
            <dl className="divide-y divide-[#ECEAE7] font-body-sm text-body-sm">
              {rows
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2">
                    <dt className="text-secondary">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
          <div>
            <h2 className="font-title-md text-title-md mb-3">Zona</h2>
            <ZoneMapSingle zone={p.zone} className="h-44" />
            <p className="font-body-sm text-[12px] text-secondary mt-2">{MAP_NOTICE}</p>
          </div>
        </div>
        <h2 className="font-title-md text-title-md mt-8 mb-2">Descripción</h2>
        {p.description.map((d, k) => (
          <p key={`${k}-${d.slice(0, 20)}`} className="font-body-sm text-body-sm text-on-surface-variant mb-2">
            {d}
          </p>
        ))}
        {p.features.length > 0 && <p className="font-body-sm text-body-sm mt-4">Características: {p.features.join(" · ")}</p>}
      </article>
    </div>
  );
}
