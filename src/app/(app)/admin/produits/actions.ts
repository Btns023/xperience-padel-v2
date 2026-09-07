"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { parseEurosToCents } from "@/lib/format";

export type FormState = { error?: string; ok?: boolean };

// --- Produit : champs éditables (le modèle tarifaire et la catégorie sont figés) ---
const productSchema = z.object({
  name: z.string().trim().min(1, "Nom requis"),
  description: z.string().trim().optional(),
  default_session_count: z.coerce.number().int().positive().optional(),
  default_session_minutes: z.coerce.number().int().positive(),
  active: z.boolean(),
});

export async function updateProduct(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    default_session_count: formData.get("default_session_count") || undefined,
    default_session_minutes: formData.get("default_session_minutes"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      default_session_count: parsed.data.default_session_count ?? null,
      default_session_minutes: parsed.data.default_session_minutes,
      active: parsed.data.active,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/produits/${id}`);
  revalidatePath("/admin/produits");
  return { ok: true };
}

// --- Tarif ---------------------------------------------------------------
function tierValuesFromForm(formData: FormData) {
  const amount = parseEurosToCents(String(formData.get("amount") ?? ""));
  if (amount === null) return { error: "Montant invalide" as const };
  const num = (k: string) => {
    const v = formData.get(k);
    return v === null || v === "" ? null : Number(v);
  };
  return {
    values: {
      label: String(formData.get("label") ?? "").trim(),
      amount_cents: amount,
      group_size: num("group_size"),
      session_count: num("session_count"),
      duration_minutes: num("duration_minutes"),
      variant: (String(formData.get("variant") ?? "").trim() || null) as string | null,
      active: formData.get("active") === "on",
    },
  };
}

export async function updateTier(
  tierId: string,
  productId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const res = tierValuesFromForm(formData);
  if ("error" in res) return { error: res.error };
  if (!res.values.label) return { error: "Libellé requis" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("price_tiers")
    .update(res.values)
    .eq("id", tierId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/produits/${productId}`);
  return { ok: true };
}

export async function createTier(
  productId: string,
  kind: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const res = tierValuesFromForm(formData);
  if ("error" in res) return { error: res.error };
  if (!res.values.label) return { error: "Libellé requis" };

  const supabase = await createClient();
  const { error } = await supabase.from("price_tiers").insert({
    ...res.values,
    product_id: productId,
    kind,
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/produits/${productId}`);
  return { ok: true };
}

export async function deleteTier(
  productId: string,
  tierId: string,
): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("price_tiers").delete().eq("id", tierId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/produits/${productId}`);
}
