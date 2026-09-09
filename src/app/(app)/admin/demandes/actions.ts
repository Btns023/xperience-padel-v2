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

/**
 * Traite une demande d'annulation (CGV art. 6).
 * - `late = false` (dans les délais, ≥ 48 h avant le cours) : l'inscription
 *   passe « Annulée », quitte son groupe, prix effacé. Si une facture existe,
 *   l'admin émet ensuite une note de crédit.
 * - `late = true` (annulation tardive / absence non justifiée) : l'inscription
 *   est marquée annulée par le joueur mais **le cours reste dû** — le statut
 *   et la facturation sont conservés.
 */
export async function confirmCancellation(
  registrationId: string,
  late: boolean,
  slotId?: string,
): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();

  const patch = late
    ? { late_cancellation: true, cancel_requested_at: null }
    : {
        status: "annulee" as const,
        group_id: null,
        unit_price_cents: null,
        cancel_requested_at: null,
      };

  const { error } = await supabase
    .from("registrations")
    .update(patch)
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
