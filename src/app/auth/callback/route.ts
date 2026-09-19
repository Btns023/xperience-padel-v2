import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { homePathForRole } from "@/lib/auth";
import type { AppRole } from "@/lib/types";
import { needsProfileCompletion, profileCompletionPath } from "@/lib/profile";

/**
 * Échange le `code` PKCE contre une session (connexion Google, lien
 * magique configuré en mode "code"), puis envoie compléter le profil si
 * des coordonnées de facturation manquent.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/connexion?error=lien_invalide`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/connexion?error=lien_expire`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "role, first_name, last_name, phone, address_line, postal_code, city, terms_accepted_at",
    )
    .single();
  const target =
    next?.startsWith("/") && !next.startsWith("//")
      ? next
      : homePathForRole((profile?.role as AppRole) ?? "client");

  // Premier passage avec Google : téléphone, adresse et conditions manquent.
  if (profile && needsProfileCompletion(profile)) {
    return NextResponse.redirect(`${origin}${profileCompletionPath(target)}`);
  }
  return NextResponse.redirect(`${origin}${target}`);
}
