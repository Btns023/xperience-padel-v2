"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { parseEurosToCents } from "@/lib/format";

export type FormState = { error?: string; ok?: boolean };

const schema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Code trop court")
    .transform((v) => v.toUpperCase()),
  amount: z.string().trim().min(1, "Montant requis"),
  product_id: z.string().trim().optional(),
  active: z.boolean(),
});

function parse(formData: FormData) {
  return schema.safeParse({
    code: formData.get("code"),
    amount: formData.get("amount"),
    product_id: formData.get("product_id") || undefined,
    active: formData.get("active") === "on" || formData.get("active") === "true",
  });
}

function toRow(d: z.infer<typeof schema>) {
  const cents = parseEurosToCents(d.amount);
  if (cents === null || cents <= 0) return null;
  return {
    code: d.code,
    amount_cents: cents,
    product_id: d.product_id && d.product_id !== "" ? d.product_id : null,
    active: d.active,
  };
}

export async function createPromo(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const parsed = parse(formData);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  const row = toRow(parsed.data);
  if (!row) return { error: "Montant invalide" };
  const supabase = await createClient();
  const { error } = await supabase.from("promo_codes").insert(row);
  if (error) return { error: error.message };
  revalidatePath("/admin/codes-promo");
  return { ok: true };
}

export async function updatePromo(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const parsed = parse(formData);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  const row = toRow(parsed.data);
  if (!row) return { error: "Montant invalide" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("promo_codes")
    .update(row)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/codes-promo");
  return { ok: true };
}

export async function deletePromo(id: string): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("promo_codes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/codes-promo");
}
