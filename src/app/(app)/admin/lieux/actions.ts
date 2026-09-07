"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export type FormState = { error?: string; ok?: boolean };

const schema = z.object({
  name: z.string().trim().min(1, "Nom requis"),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  active: z.boolean(),
});

function parse(formData: FormData) {
  return schema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") || undefined,
    notes: formData.get("notes") || undefined,
    active: formData.get("active") === "on" || formData.get("active") === "true",
  });
}

export async function createLocation(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("locations").insert({
    name: parsed.data.name,
    address: parsed.data.address ?? null,
    notes: parsed.data.notes ?? null,
    active: parsed.data.active,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/lieux");
  return { ok: true };
}

export async function updateLocation(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("locations")
    .update({
      name: parsed.data.name,
      address: parsed.data.address ?? null,
      notes: parsed.data.notes ?? null,
      active: parsed.data.active,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/lieux");
  return { ok: true };
}

export async function deleteLocation(id: string): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("locations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/lieux");
}
