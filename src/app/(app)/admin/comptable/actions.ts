"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export type GrantState = { error?: string; ok?: string };

/**
 * Donne l'accès comptable (lecture seule) à un compte existant. La personne
 * crée d'abord son compte sur le site, avec cette adresse, puis l'académie
 * lui ouvre la comptabilité ici.
 */
export async function grantAccountant(
  _prev: GrantState,
  formData: FormData,
): Promise<GrantState> {
  await requireRole("admin");
  const parsed = z.string().trim().email("Adresse e-mail invalide").safeParse(
    formData.get("email"),
  );
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const email = parsed.data.toLowerCase();

  const { data } = await createAdminClient().auth.admin.listUsers({ perPage: 1000 });
  const user = data?.users.find((u) => u.email?.toLowerCase() === email);
  if (!user) {
    return {
      error:
        "Aucun compte avec cette adresse. Demande à ton comptable de créer un compte sur le site (bouton « Créer un compte » ou « Continuer avec Google ») avec cette adresse, puis recommence.",
    };
  }

  const supabase = await createClient();
  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (prof?.role === "admin" || prof?.role === "coach") {
    return { error: "Ce compte est déjà administrateur ou coach : son rôle n'est pas modifié." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: "comptable" })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/admin/comptable");
  return { ok: `Accès comptable ouvert à ${email}.` };
}

export async function revokeAccountant(profileId: string): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ role: "client" })
    .eq("id", profileId)
    .eq("role", "comptable");
  revalidatePath("/admin/comptable");
}
