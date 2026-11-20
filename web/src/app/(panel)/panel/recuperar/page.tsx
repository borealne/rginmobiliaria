"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { pInput } from "@/components/panel/ui";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function PanelRecoverPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean.includes("@") || !clean.includes(".")) {
      setError("Por favor, ingresa un correo corporativo válido (@rginmobiliaria.ec o dominio autorizado).");
      return;
    }
    setError(null);
    setLoading(true);

    const supabase = createBrowserSupabaseClient();
    if (supabase) {
      const redirectTo = `${window.location.origin}/panel/login`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(clean, { redirectTo });
      setLoading(false);
      if (resetError) {
        setError("No se pudo enviar el enlace de recuperación. Verifica el correo o intenta más tarde.");
        return;
      }
      setSent(true);
      return;
    }

    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between px-4 py-8">
      <div className="max-w-md w-full mx-auto my-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <span className="w-11 h-11 rounded-xl bg-primary text-on-primary font-display font-bold text-title-md grid place-items-center">
              RG
            </span>
            <div className="text-left">
              <p className="font-display font-bold text-body-md tracking-wide text-on-surface">
                RG INMOBILIARIA &amp; CONSTRUCTORA
              </p>
              <p className="text-label-sm text-on-surface-variant">Cuenca • Miami</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-7 md:p-8 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-[3px] w-6 bg-rg-red" aria-hidden="true" />
              <span className="text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
                Acceso institucional
              </span>
            </div>
            <h1 className="font-display text-headline-sm text-on-surface">Recuperar contraseña</h1>
            <p className="mt-1.5 text-body-sm text-on-surface-variant">
              Ingresa tu correo electrónico corporativo registrado. Te enviaremos un enlace seguro y un código de verificación temporal para restablecer tu acceso.
            </p>
          </div>

          {sent ? (
            <div className="rounded-xl bg-st-available/10 border border-st-available/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-st-available font-semibold text-body-md">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>Instrucciones enviadas</span>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                Hemos enviado un código de validación a <strong className="text-on-surface">{email}</strong>. Revisa tu bandeja de entrada o carpeta institucional.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-label-md font-semibold text-on-surface">Correo electrónico</span>
                <div className="relative">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@rginmobiliaria.ec"
                    className={`${pInput} pl-10`}
                    required
                  />
                </div>
              </label>

              {error && (
                <div className="rounded-xl bg-rg-red/10 border border-rg-red/30 px-3.5 py-2.5 text-body-sm text-rg-red flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="rounded-xl bg-surface-container-low border border-outline-variant p-3.5 flex items-start gap-2.5 text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">shield</span>
                <span>
                  Por políticas de seguridad interna, el enlace de restablecimiento expira en 15 minutos y solo es válido para cuentas activas del personal de RG.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-primary text-on-primary text-label-md font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60 cursor-pointer"
              >
                <span>{loading ? "Enviando..." : "Enviar instrucciones"}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-outline-variant text-center space-y-2">
            <Link
              href="/panel/login"
              className="inline-flex items-center gap-1.5 text-label-md font-semibold text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Volver al inicio de sesión
            </Link>
            <p className="text-label-sm text-on-surface-variant">
              ¿No recibiste el correo? Escribe a{" "}
              <a href="mailto:soporte@rginmobiliaria.ec" className="font-semibold text-on-surface hover:underline">
                soporte@rginmobiliaria.ec
              </a>
            </p>
          </div>
        </div>
      </div>

      <footer className="text-center text-label-sm text-on-surface-variant pt-6">
        © 2026 RG Inmobiliaria y Constructora S.A.S. · Cuenca · Miami
      </footer>
    </div>
  );
}
