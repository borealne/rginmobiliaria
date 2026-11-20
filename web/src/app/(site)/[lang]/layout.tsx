import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import "../../globals.css";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { SiteExtras } from "@/components/site/SiteExtras";
import { VisitProvider } from "@/components/site/VisitProvider";
import { FavoritesProvider } from "@/components/site/Favorites";
import { ICONS_HREF, fontVars } from "@/lib/fonts";
import { isLang, LANGS } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

export const metadata: Metadata = {
  title: {
    default: "RG Inmobiliaria y Constructora · Casas, departamentos y terrenos en Cuenca",
    template: "%s · RG Inmobiliaria y Constructora",
  },
  description: "Venta y alquiler de propiedades y proyectos de construcción en Cuenca, Ecuador y Miami. Busca con tus palabras o con filtros y agenda una visita.",
};

export const viewport: Viewport = { themeColor: "#111111" };

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const l = lang as Lang;
  return (
    <html lang={l} className={fontVars}>
      <head>
        <link rel="stylesheet" href={ICONS_HREF} />
      </head>
      <body className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col overflow-x-hidden">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-on-primary focus:px-4 focus:py-3 focus:rounded-lg">
          Saltar al contenido
        </a>
        <FavoritesProvider>
          <VisitProvider lang={l}>
            <Suspense>
              <Header lang={l} />
            </Suspense>
            <main id="contenido" className="w-full pt-16 md:pt-20 bg-surface flex-grow">
              {children}
            </main>
            <Footer lang={l} />
            <SiteExtras lang={l} />
          </VisitProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}
