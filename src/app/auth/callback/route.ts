import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { homePathForRole } from "@/lib/auth";
import type { AppRole } from "@/lib/types";

/**
 * Échange le `code` PKCE contre une session (flux OAuth / lien magique
 * configuré en mode "code").
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

  if (next?.startsWith("/")) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const { data } = await supabase.from("profiles").select("role").single();
  return NextResponse.redirect(
    `${origin}${homePathForRole((data?.role as AppRole) ?? "client")}`,
  );
}
