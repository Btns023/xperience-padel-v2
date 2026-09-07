"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function inviteCoach(coachId: string): Promise<void> {
  const admin = await requireRole("admin");
  const supabase = await createClient();

  const { data: coach } = await supabase
    .from("coaches")
    .select("id, email, profile_id")
    .eq("id", coachId)
    .single();
  if (!coach) throw new Error("Coach introuvable");
  if (coach.profile_id) throw new Error("Ce coach a déjà un compte lié");
  if (!coach.email) throw new Error("Renseigne d'abord l'e-mail du coach");

  // Remplace une éventuelle invitation en attente.
  await supabase
    .from("coach_invites")
    .delete()
    .eq("coach_id", coachId)
    .is("accepted_at", null);

  const token = randomBytes(24).toString("base64url");
  const { error } = await supabase.from("coach_invites").insert({
    coach_id: coachId,
    token,
    email: coach.email,
    created_by: admin.id,
  });
  if (error) throw new Error(error.message);

  // TODO Lot 7 : envoyer le lien d'invitation par e-mail au coach.
  revalidatePath("/admin/coachs");
}

export async function revokeInvite(inviteId: string): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase
    .from("coach_invites")
    .delete()
    .eq("id", inviteId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/coachs");
}
