import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/lib/types";

/**
 * Utilisateur courant (ou null). Revalidé auprès du serveur Auth Supabase.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Profil applicatif du membre courant (rôle, identité, coordonnées) ou null.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
}

/**
 * Exige une session. Redirige vers /connexion sinon.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  return user;
}

/**
 * Exige un rôle précis (ou l'un des rôles listés). Redirige sinon.
 */
export async function requireRole(role: AppRole | AppRole[]) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion");

  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(profile.role)) redirect("/compte");

  return profile;
}

/**
 * Route d'accueil selon le rôle après connexion.
 */
export function homePathForRole(role: AppRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "coach":
      return "/coach";
    default:
      return "/compte";
  }
}
