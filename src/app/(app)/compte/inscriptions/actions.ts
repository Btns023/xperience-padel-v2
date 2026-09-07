"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function requestCancellation(registrationId: string): Promise<void> {
  const user = await requireUser();

  // Vérifie que l'inscription appartient bien à l'utilisateur.
  const supabase = await createClient();
  const { data: reg } = await supabase
    .from("registrations")
    .select("id, billed_to_profile_id, status")
    .eq("id", registrationId)
    .single();

  if (!reg || reg.billed_to_profile_id !== user.id) {
    throw new Error("Inscription introuvable.");
  }
  if (reg.status === "annulee") return;

  // L'écriture du champ passe par le client admin : les clients n'ont pas le
  // droit de modifier une inscription (RLS), seulement d'en demander l'annulation.
  const admin = createAdminClient();
  const { error } = await admin
    .from("registrations")
    .update({ cancel_requested_at: new Date().toISOString() })
    .eq("id", registrationId);
  if (error) throw new Error(error.message);

  // TODO Lot 7 : notifier l'administrateur de la demande d'annulation.

  revalidatePath("/compte/inscriptions");
}
