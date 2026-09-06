"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export type FormState = { error?: string; fieldErrors?: Record<string, string> };

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide");

const schema = z
  .object({
    name: z.string().trim().min(1, "Nom requis"),
    starts_on: dateStr,
    ends_on: dateStr,
    registration_opens_on: dateStr.or(z.literal("")).optional(),
    registration_closes_on: dateStr.or(z.literal("")).optional(),
    status: z.enum(["draft", "active", "archived"]),
  })
  .refine((v) => v.ends_on >= v.starts_on, {
    message: "La fin doit suivre le début",
    path: ["ends_on"],
  });

function parse(formData: FormData) {
  return schema.safeParse({
    name: formData.get("name"),
    starts_on: formData.get("starts_on"),
    ends_on: formData.get("ends_on"),
    registration_opens_on: formData.get("registration_opens_on") ?? "",
    registration_closes_on: formData.get("registration_closes_on") ?? "",
    status: formData.get("status"),
  });
}

function toRow(data: z.infer<typeof schema>) {
  return {
    name: data.name,
    starts_on: data.starts_on,
    ends_on: data.ends_on,
    registration_opens_on: data.registration_opens_on || null,
    registration_closes_on: data.registration_closes_on || null,
    status: data.status,
  };
}

export async function createSeason(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const parsed = parse(formData);
  if (!parsed.success) {
    return {
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
      ),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("seasons").insert(toRow(parsed.data));
  if (error) return { error: error.message };

  revalidatePath("/admin/saisons");
  redirect("/admin/saisons");
}

export async function updateSeason(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const parsed = parse(formData);
  if (!parsed.success) {
    return {
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
      ),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("seasons")
    .update(toRow(parsed.data))
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/saisons");
  revalidatePath(`/admin/saisons/${id}`);
  redirect("/admin/saisons");
}

export async function deleteSeason(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("seasons").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/saisons");
}
