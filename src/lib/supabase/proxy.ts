import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rafraîchit la session Supabase à chaque requête et protège les espaces
 * authentifiés. Appelé depuis `src/proxy.ts`.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT : ne rien exécuter entre createServerClient et getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  /**
   * Vrai si le chemin est cette racine ou l'un de ses sous-chemins.
   * Comparaison par segment : "/coach" ne doit pas capter "/coachs",
   * qui est la page publique de présentation des coachs.
   */
  const under = (root: string) =>
    pathname === root || pathname.startsWith(`${root}/`);

  const isAuthRoute =
    under("/connexion") || under("/inscription") || under("/auth");

  // Espaces protégés
  const isProtected =
    under("/compte") ||
    under("/coach") ||
    under("/admin") ||
    under("/compta") ||
    under("/facture");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute && !under("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/compte";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
