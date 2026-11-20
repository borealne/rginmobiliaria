import Link from "next/link";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { LogoMark } from "./Logo";

export function Footer({ lang }: { lang: Lang }) {
  const d = t(lang).footer;
  const col = (title: string, items: { label: string; href: string }[]) => (
    <div className="flex flex-col gap-space-sm">
      <span className="font-title-md text-title-md text-on-primary tracking-tight border-b border-primary-container pb-space-xs">{title}</span>
      <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-primary-fixed-dim">
        {items.map((i) => (
          <li key={i.label}>
            <Link className="hover:text-on-primary transition-colors inline-flex min-h-8 items-center" href={i.href}>
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer id="contacto" className="print:hidden w-full bg-primary text-on-primary">
      <div className="max-w-7xl mx-auto px-gutter-mobile md:px-gutter py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl">
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <LogoMark inverted />
              <span className="font-title-md text-title-md text-on-primary tracking-tight">{t(lang).brand}</span>
            </div>
            <p className="font-body-md text-body-md text-primary-fixed-dim max-w-sm">{d.about}</p>
            <div className="flex flex-col gap-space-xs pt-space-xs font-body-sm text-body-sm text-primary-fixed-dim">
              <a href="tel:+59372840000" className="flex items-center gap-space-xs hover:text-on-primary">
                <span className="material-symbols-outlined text-[18px] text-on-primary">call</span>
                <span>+593 7 284 0000</span>
              </a>
              <a href="mailto:info@rginmobiliaria.ec" className="flex items-center gap-space-xs hover:text-on-primary">
                <span className="material-symbols-outlined text-[18px] text-on-primary">mail</span>
                <span>info@rginmobiliaria.ec</span>
              </a>
              <div className="flex items-center gap-space-md pt-space-sm">
                {["Facebook", "Instagram", "LinkedIn"].map((s) => (
                  <a
                    key={s}
                    className="font-label-sm text-label-sm text-primary-fixed-dim hover:text-on-primary transition-colors uppercase tracking-wider min-h-8 inline-flex items-center"
                    href={`https://${s.toLowerCase()}.com`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </div>
          {col(d.properties, [
            { label: d.houses, href: `/${lang}/propiedades?tipo=casa` },
            { label: d.apartments, href: `/${lang}/propiedades?tipo=departamento` },
            { label: d.land, href: `/${lang}/propiedades?tipo=terreno` },
            { label: d.plans, href: `/${lang}/propiedades?etapa=sobre-planos` },
            { label: d.exclusives, href: `/${lang}/propiedades?exclusivas=1` },
            { label: t(lang).nav.favoritos, href: `/${lang}/favoritos` },
          ])}
          {col(d.company, [
            { label: t(lang).nav.quienes, href: `/${lang}#quienes-somos` },
            { label: t(lang).nav.servicios, href: `/${lang}#servicios` },
            { label: t(lang).nav.blog, href: `/${lang}/blog` },
            { label: t(lang).nav.faq, href: `/${lang}/preguntas-frecuentes` },
            { label: t(lang).nav.contacto, href: `/${lang}/vende-o-alquila` },
          ])}
          {col(d.legal, [
            { label: d.privacy, href: `/${lang}/legal/privacidad` },
            { label: d.terms, href: `/${lang}/legal/terminos` },
            { label: d.transparency, href: `/${lang}/legal/transparencia` },
          ])}
        </div>
        <div className="mt-space-xl pt-space-md border-t border-primary-container flex flex-col md:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm text-primary-fixed-dim">
          <span>
            © {new Date().getFullYear()} {d.rights}
          </span>
          <div className="flex items-center gap-space-md">
            <Link className="hover:text-on-primary transition-colors" href={`/${lang}/legal/privacidad`}>
              {d.privacy}
            </Link>
            <span className="text-primary-container">•</span>
            <Link className="hover:text-on-primary transition-colors" href={`/${lang}/legal/terminos`}>
              {d.termsShort}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
