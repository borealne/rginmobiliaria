import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";

const PUBLIC_PANEL_ROUTES = new Set(["/panel/login", "/panel/recuperar"]);

/** "/" va a /es y /panel/* exige sesión de Supabase Auth cuando está configurado. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/" || pathname === "") {
    const url = req.nextUrl.clone();
    url.pathname = "/es";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/panel") && !PUBLIC_PANEL_ROUTES.has(pathname) && isSupabaseConfigured()) {
    let res = NextResponse.next({ request: req });
    const { url, anonKey } = getSupabaseEnv();

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/panel/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/panel/:path*"],
};
