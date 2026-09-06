import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Client Supabase pour les Composants Serveur, Route Handlers et Server Actions.
 * Lit / rafraîchit la session via les cookies de la requête.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Appelé depuis un Composant Serveur — sans effet si un middleware
            // rafraîchit déjà la session. On ignore.
          }
        },
      },
    },
  );
}

/**
 * Client Supabase à privilèges élevés (clé secrète). SERVEUR UNIQUEMENT.
 * Contourne les politiques RLS — à réserver aux traitements d'administration
 * (imports, tâches planifiées, webhooks).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
