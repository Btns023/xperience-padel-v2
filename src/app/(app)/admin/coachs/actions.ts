"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export type FormState = { error?: string; ok?: boolean };

const schema = z.object({
  first_name: z.string().trim().min(1, "Prénom requis"),
  last_name: z.string().trim().min(1, "Nom requis"),
  email: z.string().trim().email("E-mail invalide").or(z.literal("")),
  active: z.boolean(),
});

function parse(formData: FormData) {
  return schema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email") ?? "",
    active: formData.get("active") === "on" || formData.get("active") === "true",
  });
}

function toRow(d: z.infer<typeof schema>) {
  return {
    first_name: d.first_name,
    last_name: d.last_name,
    email: d.email || null,
    active: d.active,
  };
}

export async function createCoach(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("coaches").insert(toRow(parsed.data));
  if (error) return { error: error.message };
  revalidatePath("/admin/coachs");
  return { ok: true };
}

export async function updateCoach(
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
    .from("coaches")
    .update(toRow(parsed.data))
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/coachs");
  return { ok: true };
}

export async function deleteCoach(id: string): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("coaches").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/coachs");
}
