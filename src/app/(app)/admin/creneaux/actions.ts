"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { weekdayLabel } from "@/lib/format";

export type FormState = { error?: string; fieldErrors?: Record<string, string> };

const optionalId = z
  .string()
  .uuid()
  .or(z.literal(""))
  .transform((v) => (v === "" ? null : v));

const schema = z
  .object({
    season_id: z.string().uuid("Saison requise"),
    product_id: z.string().uuid("Produit requis"),
    location_id: optionalId,
    coach_id: optionalId,
    weekday: z.coerce.number().int().min(1).max(7),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, "Heure invalide"),
    duration_minutes: z.coerce.number().int().positive(),
    session_count: z.coerce.number().int().positive(),
    starts_on: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide")
      .or(z.literal(""))
      .transform((v) => (v === "" ? null : v)),
    capacity: z.coerce.number().int().positive(),
    min_level_code: z.string().or(z.literal("")).transform((v) => v || null),
    max_level_code: z.string().or(z.literal("")).transform((v) => v || null),
    level_note: z.string().trim().optional(),
    status: z.enum(["draft", "open", "closed"]),
    notes: z.string().trim().optional(),
  })
  // Les séances sont générées de semaine en semaine à partir de starts_on
  // (src/lib/sessions.ts) : la 1re séance doit donc tomber le jour du
  // créneau. Même règle en base : contrainte slots_starts_on_weekday_chk.
  .superRefine((v, ctx) => {
    if (!v.starts_on) return;
    const day = isoWeekday(v.starts_on);
    if (Number.isNaN(day)) {
      ctx.addIssue({ code: "custom", message: "Date invalide", path: ["starts_on"] });
    } else if (day !== v.weekday) {
      ctx.addIssue({
        code: "custom",
        message: `La date de début doit tomber un ${weekdayLabel(v.weekday)} (jour du créneau).`,
        path: ["starts_on"],
      });
    }
  });

/** "2026-10-07" -> 3 (1 = lundi … 7 = dimanche, comme isodow en SQL). */
function isoWeekday(isoDate: string): number {
  const d = new Date(`${isoDate}T00:00:00Z`).getUTCDay();
  return d === 0 ? 7 : d;
}

function parse(formData: FormData) {
  return schema.safeParse({
    season_id: formData.get("season_id"),
    product_id: formData.get("product_id"),
    location_id: formData.get("location_id") ?? "",
    coach_id: formData.get("coach_id") ?? "",
    weekday: formData.get("weekday"),
    start_time: formData.get("start_time"),
    duration_minutes: formData.get("duration_minutes"),
    session_count: formData.get("session_count"),
    starts_on: formData.get("starts_on") ?? "",
    capacity: formData.get("capacity"),
    min_level_code: formData.get("min_level_code") ?? "",
    max_level_code: formData.get("max_level_code") ?? "",
    level_note: formData.get("level_note") || undefined,
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });
}

function toRow(d: z.infer<typeof schema>) {
  return {
    season_id: d.season_id,
    product_id: d.product_id,
    location_id: d.location_id,
    coach_id: d.coach_id,
    weekday: d.weekday,
    start_time: d.start_time,
    duration_minutes: d.duration_minutes,
    session_count: d.session_count,
    starts_on: d.starts_on,
    capacity: d.capacity,
    min_level_code: d.min_level_code,
    max_level_code: d.max_level_code,
    level_note: d.level_note ?? null,
    status: d.status,
    notes: d.notes ?? null,
  };
}

function fieldErrors(err: z.ZodError) {
  return Object.fromEntries(
    err.issues.map((i) => [String(i.path[0]), i.message]),
  );
}

export async function createSlot(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("slots").insert(toRow(parsed.data));
  if (error) return { error: error.message };

  revalidatePath("/admin/creneaux");
  redirect("/admin/creneaux");
}

export async function updateSlot(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("admin");
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("slots")
    .update(toRow(parsed.data))
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/creneaux");
  revalidatePath(`/admin/creneaux/${id}`);
  redirect("/admin/creneaux");
}

export async function deleteSlot(formData: FormData): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase
    .from("slots")
    .delete()
    .eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/creneaux");
}
