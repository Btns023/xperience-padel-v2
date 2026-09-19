"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export type ProfileState = { error?: string; ok?: boolean };

const schema = z.object({
  first_name: z.string().trim().min(1, "Prénom requis"),
  last_name: z.string().trim().min(1, "Nom requis"),
  phone: z.string().trim().min(6, "Téléphone requis"),
  address_line: z.string().trim().min(3, "Adresse requise (rue et numéro)"),
  postal_code: z.string().trim().min(4, "Code postal requis").max(10),
  city: z.string().trim().min(1, "Localité requise"),
});

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  const parsed = schema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone"),
    address_line: formData.get("address_line"),
    postal_code: formData.get("postal_code"),
    city: formData.get("city"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("profiles")
    .select("terms_accepted_at")
    .eq("id", user.id)
    .single();

  // Conditions : obligatoires tant qu'elles n'ont jamais été acceptées
  // (cas d'un compte créé avec Google).
  const accepting = formData.get("accept_terms") === "on";
  if (!current?.terms_accepted_at && !accepting) {
    return {
      error:
        "Merci d'accepter les conditions d'inscription et la politique de confidentialité.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...parsed.data,
      ...(current?.terms_accepted_at
        ? {}
        : { terms_accepted_at: new Date().toISOString() }),
    })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/compte", "layout");

  const next = String(formData.get("next") ?? "");
  if (next.startsWith("/") && !next.startsWith("//")) redirect(next);
  return { ok: true };
}
