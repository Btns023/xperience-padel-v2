import { type NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { homePathForRole } from "@/lib/auth";
import type { AppRole } from "@/lib/types";

/**
 * Point d'atterrissage des liens e-mail (activation de compte, changement
 * d'e-mail, réinitialisation de mot de passe).
 * Nécessite des templates e-mail utilisant `{{ .TokenHash }}`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/connexion?error=lien_invalide`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    return NextResponse.redirect(`${origin}/connexion?error=lien_expire`);
  }

  if (next?.startsWith("/")) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const { data } = await supabase.from("profiles").select("role").single();
  return NextResponse.redirect(
    `${origin}${homePathForRole((data?.role as AppRole) ?? "client")}`,
  );
}
