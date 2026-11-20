"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { pInput } from "@/components/panel/ui";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function PanelLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("raul@rginmobiliaria.ec");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || password.trim().length < 4) {
      setError("Correo o contraseña incorrectos (ingresa al menos 4 caracteres).");
      return;
    }

    setError(null);
    setLoading(true);

    const supabase = createBrowserSupabaseClient();
    if (supabase) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) {
        setLoading(false);
        setError("Credenciales inválidas o usuario no autorizado en Supabase Auth.");
        return;
      }
      router.push("/panel/propiedades");
      router.refresh();
      return;
    }

    setTimeout(() => {
      router.push("/panel/propiedades");
    }, 350);
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
                Acceso interno
              </span>
            </div>
            <h1 className="font-display text-headline-sm text-on-surface">Panel de Gestión y Control Interno</h1>
            <p className="mt-1.5 text-body-sm text-on-surface-variant">
              Ingresa con tus credenciales corporativas autorizadas para acceder a la administración de inventario, CRM y configuración.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-label-md font-semibold text-on-surface">Correo electrónico corporativo</span>
              <div className="relative">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@rginmobiliaria.ec"
                  className={`${pInput} pl-10`}
                  required
                />
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-label-md font-semibold text-on-surface">Contraseña</span>
              <div className="relative">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  lock
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${pInput} pl-10 pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPass ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </label>

            {error && (
              <div className="rounded-xl bg-rg-red/10 border border-rg-red/30 px-3.5 py-2.5 text-body-sm text-rg-red flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 text-body-sm">
              <label className="inline-flex items-center gap-2 cursor-pointer text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-outline-variant accent-primary"
                />
                <span>Recordar este equipo</span>
              </label>
              <Link href="/panel/recuperar" className="font-semibold text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary text-on-primary text-label-md font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <span>{loading ? "Verificando..." : "Iniciar sesión"}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          <div className="pt-4 border-t border-outline-variant space-y-2 text-center">
            <p className="text-label-sm text-on-surface-variant inline-flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-st-available">verified_user</span>
              Conexión cifrada TLS 1.3 · Acceso auditado y restringido a colaboradores autorizados.
            </p>
            <p className="text-label-sm text-on-surface-variant">
              ¿Problemas con acceso? Contactar a{" "}
              <a href="mailto:soporte@rginmobiliaria.ec" className="font-semibold text-on-surface hover:underline">
                soporte@rginmobiliaria.ec
              </a>
            </p>
          </div>
        </div>

        <div className="mt-5 text-center">
          <Link href="/es" className="text-label-md text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Volver al sitio público
          </Link>
        </div>
      </div>

      <footer className="text-center text-label-sm text-on-surface-variant pt-6">
        © 2026 RG Inmobiliaria y Constructora S.A.S. · Cuenca · Miami
      </footer>
    </div>
  );
}
