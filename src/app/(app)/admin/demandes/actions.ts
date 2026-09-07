"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

function refresh(slotId?: string) {
  revalidatePath("/admin/demandes");
  revalidatePath("/admin");
  if (slotId) revalidatePath(`/admin/creneaux/${slotId}/groupes`);
  revalidatePath("/compte/inscriptions");
}

/** Valide la demande d'annulation : l'inscription passe en « Annulée » et
 *  quitte son groupe éventuel. (V1 : remboursement intégral — la note de
 *  crédit sera gérée au Lot 4 si une facture existe déjà.) */
export async function confirmCancellation(
  registrationId: string,
  slotId?: string,
): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase
    .from("registrations")
    .update({
      status: "annulee",
      group_id: null,
      unit_price_cents: null,
      cancel_requested_at: null,
    })
    .eq("id", registrationId);
  if (error) throw new Error(error.message);
  refresh(slotId);
}

/** Refuse la demande d'annulation : on efface simplement le drapeau. */
export async function dismissCancellation(
  registrationId: string,
  slotId?: string,
): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase
    .from("registrations")
    .update({ cancel_requested_at: null })
    .eq("id", registrationId);
  if (error) throw new Error(error.message);
  refresh(slotId);
}
