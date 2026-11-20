import type { Metadata } from "next";
import "../../globals.css";
import { PanelShell } from "@/components/panel/Shell";
import { ICONS_HREF, fontVars } from "@/lib/fonts";

export const metadata: Metadata = {
  title: { default: "Panel · RG Inmobiliaria", template: "%s · Panel RG" },
  robots: { index: false, follow: false },
};

/** Panel del equipo (solo RG). El acceso con usuario y contraseña entra en la segunda tanda. */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fontVars}>
      <head>
        <link rel="stylesheet" href={ICONS_HREF} />
      </head>
      <body>
        <PanelShell>{children}</PanelShell>
      </body>
    </html>
  );
}
