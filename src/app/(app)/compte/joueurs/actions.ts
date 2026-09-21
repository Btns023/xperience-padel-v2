"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser, getCurrentProfile } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { playerAddedMail } from "@/lib/emails";

export type FormState = { error?: string; fieldErrors?: Record<string, string> };

const schema = z.object({
  first_name: z.string().trim().min(1, "Prénom requis"),
  last_name: z.string().trim().min(1, "Nom requis"),
  email: z.string().trim().email("Adresse e-mail invalide"),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date de naissance requise"),
  level_code: z.string().trim().min(1, "Niveau requis"),
  image_consent: z.enum(["oui", "non"], { message: "Réponse requise" }),
});

function parse(formData: FormData) {
  return schema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    birthdate: formData.get("birthdate"),
    level_code: formData.get("level_code"),
    image_consent: formData.get("image_consent"),
  });
}

function fieldErrors(err: z.ZodError) {
  return Object.fromEntries(
    err.issues.map((i) => [String(i.path[0]), i.message]),
  );
}

function toRow(d: z.infer<typeof schema>) {
  return {
    first_name: d.first_name,
    last_name: d.last_name,
    email: d.email,
    birthdate: d.birthdate,
    level_code: d.level_code,
    image_consent: d.image_consent === "oui",
  };
}

export async function createPlayer(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const isSelf = formData.get("is_self") === "on";
  const supabase = await createClient();
  const { error } = await supabase.from("players").insert({
    ...toRow(parsed.data),
    // « C'est moi » : le joueur, c'est le titulaire du compte, donc son
    // adresse est celle du compte.
    ...(isSelf && user.email ? { email: user.email } : {}),
    managed_by: user.id,
    profile_id: isSelf ? user.id : null,
    invitation_status: isSelf ? "accepted" : "pending",
  });
  if (error) return { error: error.message };

  if (!isSelf) {
    const me = await getCurrentProfile();
    await sendEmail({
      to: parsed.data.email,
      ...playerAddedMail({
        playerName: parsed.data.first_name,
        addedBy: `${me?.first_name ?? ""} ${me?.last_name ?? ""}`.trim() ||
          "Un membre",
      }),
    });
  }

  revalidatePath("/compte/joueurs");
  redirect("/compte/joueurs");
}

export async function updatePlayer(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("players")
    .update(toRow(parsed.data))
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/compte/joueurs");
  revalidatePath(`/compte/joueurs/${id}`);
  redirect("/compte/joueurs");
}

export async function deletePlayer(id: string): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/compte/joueurs");
}
