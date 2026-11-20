import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { OwnerForm } from "@/components/site/OwnerForm";
import { OFFICE_HOURS, PHONE, WHATSAPP } from "@/lib/data/content";
import type { Lang } from "@/lib/types";

export const metadata: Metadata = {
  title: "Vende o alquila con nosotros",
  description: "Déjanos tus datos y un asesor de RG te contactará para valorar tu propiedad sin compromiso.",
};

const BENEFITS = [
  {
    icon: "architecture",
    title: "Valoración técnica y comercial",
    text: "Calculamos un precio realista con los metros de construcción, el terreno y las ventas recientes en tu sector de Cuenca.",
  },
  {
    icon: "shield_lock",
    title: "Compradores calificados y tu privacidad cuidada",
    text: "Revisamos a cada interesado antes de coordinar visitas. La dirección exacta de tu propiedad nunca se publica.",
  },
  {
    icon: "gavel",
    title: "Acompañamiento legal de inicio a fin",
    text: "Promesa de compraventa, escrituras, certificados y trámites con el banco o el BIESS, sin intermediarios informales.",
  },
];

const STEPS = [
  { title: "Contacto y revisión de documentos", text: "Revisamos escrituras y certificados para que tu propiedad esté lista para una venta rápida y transparente." },
  { title: "Visita técnica y fotografías", text: "Medimos las áreas reales (construcción y terreno por separado) y hacemos las fotos y el video." },
  { title: "Publicación y promoción", text: "Publicamos en nuestra web y la mostramos a nuestra red de clientes en Ecuador y Estados Unidos." },
  { title: "Negociación y escritura", text: "Preparamos los contratos, acompañamos el crédito y la firma de la escritura en la notaría." },
];

const OWNER_FAQS = [
  { icon: "help_outline", q: "¿Cobran por la valoración inicial?", a: "No. La visita técnica y la valoración dentro de Cuenca no tienen costo." },
  { icon: "schedule", q: "¿Cuánto tiempo toma publicar mi propiedad?", a: "Con la documentación revisada y las fotos listas, la publicamos en menos de 72 horas." },
  { icon: "security", q: "¿Mi propiedad sale con la dirección exacta?", a: "No. Solo mostramos la zona aproximada. La dirección se comparte en la visita, con personas ya revisadas." },
];

export default async function OwnersPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  return (
    <div className="flex flex-col w-full">
      <section className="w-full bg-surface-container-low py-space-xl">
        <div className="max-w-7xl mx-auto px-gutter-mobile md:px-gutter flex flex-col gap-space-md">
          <nav aria-label="Ruta de navegación" className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
            <Link className="hover:text-primary transition-colors" href={`/${lang}`}>
              Inicio
            </Link>
            <span className="text-outline-variant" aria-hidden>
              /
            </span>
            <span>Propietarios</span>
            <span className="text-outline-variant" aria-hidden>
              /
            </span>
            <span className="text-primary font-medium" aria-current="page">
              Vende o alquila con nosotros
            </span>
          </nav>
          <div className="flex flex-col max-w-4xl">
            <h1 className="font-display-xl-mobile text-display-xl-mobile md:font-display-xl md:text-display-xl text-on-surface tracking-tight leading-tight">
              Vende o alquila tu propiedad con el respaldo de RG
            </h1>
            <div className="w-16 h-[3px] bg-rg-red mt-space-sm mb-space-md" aria-hidden />
            <p className="font-body-md text-body-md md:font-body-lg md:text-body-lg text-on-surface-variant leading-relaxed">
              Nos encargamos de la valoración, la promoción y el cierre legal, con discreción y comisiones claras desde el primer día.
            </p>
          </div>
          <div className="pt-space-sm flex items-center gap-space-sm text-on-surface">
            <span className="material-symbols-outlined icon-fill text-[20px] text-primary" aria-hidden>
              verified
            </span>
            <span className="font-title-md text-title-md tracking-tight">Más de 15 años construyendo y vendiendo propiedades en Cuenca</span>
          </div>
        </div>
      </section>

      <section className="w-full bg-surface py-space-xl">
        <div className="max-w-7xl mx-auto px-gutter-mobile md:px-gutter grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {BENEFITS.map((b) => (
            <div key={b.title} className="group bg-surface-container-lowest p-space-lg rounded-xl border border-transparent hover:border-outline-variant shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:hover:translate-y-0 flex flex-col gap-space-sm">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-on-primary motion-reduce:transition-none">
                <span className="material-symbols-outlined text-[26px]" aria-hidden>
                  {b.icon}
                </span>
              </div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">{b.title}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full bg-surface-container-low py-space-xl" id="formulario">
        <div className="max-w-7xl mx-auto px-gutter-mobile md:px-gutter grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg md:p-space-xl rounded-xl shadow-sm flex flex-col gap-space-lg">
            <div className="flex flex-col gap-space-xs">
              <h2 className="font-headline-md text-headline-md text-on-surface">Cuéntanos sobre ti y tu propiedad</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Completa este formulario y un asesor de RG te contactará en menos de 24 horas hábiles para coordinar una visita sin costo.</p>
            </div>
            <Suspense>
              <OwnerForm lang={lang} />
            </Suspense>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">Asesoría directa</span>
                <span className="px-space-xs py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface">Propietarios</span>
              </div>
              <div className="flex items-center gap-space-md">
                <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
                  <Image src="/img/p/72.jpg" alt="" fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-title-md text-title-md text-on-surface leading-snug">Arq. Fernando Gómez</h3>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Director comercial de RG</span>
                </div>
              </div>
              <div className="flex flex-col gap-space-xs pt-space-xs font-body-sm text-body-sm text-on-surface">
                <a href="tel:+59372840000" className="flex items-center gap-space-sm min-h-9">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant" aria-hidden>
                    phone
                  </span>
                  {PHONE}
                </a>
                <span className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant" aria-hidden>
                    schedule
                  </span>
                  {OFFICE_HOURS}
                </span>
              </div>
              <a
                className="h-11 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-space-xs hover:bg-primary hover:text-on-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200 cursor-pointer motion-reduce:transition-none"
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola, quiero vender o alquilar mi propiedad con RG.")}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Escribir por WhatsApp ahora</span>
              </a>
            </div>

            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
              <h3 className="font-title-md text-title-md text-on-surface">Preguntas frecuentes de propietarios</h3>
              <div className="flex flex-col gap-space-sm">
                {OWNER_FAQS.map((x) => (
                  <div key={x.q} className="flex flex-col gap-space-xs bg-surface-container-low p-space-sm rounded-lg">
                    <span className="font-label-md text-label-md text-on-surface flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden>
                        {x.icon}
                      </span>
                      {x.q}
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant pl-6">{x.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-surface py-space-xl">
        <div className="max-w-7xl mx-auto px-gutter-mobile md:px-gutter flex flex-col gap-space-xl">
          <div className="flex flex-col max-w-2xl">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">Cómo trabajamos</span>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface tracking-tight mt-space-xs">Así trabajamos tu propiedad, paso a paso</h2>
            <div className="w-12 h-[3px] bg-rg-red mt-space-sm" aria-hidden />
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {STEPS.map((s, k) => (
              <li key={s.title} className="group bg-surface-container-low p-space-lg rounded-xl border border-transparent hover:border-outline-variant flex flex-col gap-space-sm shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <span className="font-display-xl text-display-xl text-outline-variant font-bold leading-none transition-colors duration-300 group-hover:text-rg-red motion-reduce:transition-none" aria-hidden>
                  {String(k + 1).padStart(2, "0")}
                </span>
                <h3 className="font-title-md text-title-md text-on-surface">{s.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="w-full bg-surface-container-high py-space-xl">
        <div className="max-w-7xl mx-auto px-gutter-mobile md:px-gutter">
          <div className="bg-surface-container-lowest p-space-lg md:p-space-xl rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between gap-space-lg">
            <div className="flex flex-col gap-space-xs max-w-2xl">
              <h3 className="font-headline-md text-headline-md text-on-surface">¿Prefieres conversar en nuestras oficinas de Cuenca?</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">Te atendemos de lunes a viernes de 9:00 a 18:00. Escríbenos y coordinamos la reunión.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-space-sm w-full md:w-auto flex-shrink-0">
              <a
                className="h-12 px-space-md w-full sm:w-auto rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-space-xs hover:bg-surface-variant active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all cursor-pointer motion-reduce:transition-none"
                href={`https://wa.me/${WHATSAPP}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Hablar por WhatsApp</span>
              </a>
              <Link className="h-12 px-space-md w-full sm:w-auto rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-space-xs hover:bg-rg-red active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rg-red transition-all duration-200 cursor-pointer motion-reduce:transition-none" href={`/${lang}#quienes-somos`}>
                <span>Ver nuestras obras</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
