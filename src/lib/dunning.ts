import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Passe en revue les factures « envoyées » impayées et non mises en pause,
 * échues, dont la dernière relance date de plus de 7 jours (ou jamais).
 * Incrémente le compteur de relances et marque la date.
 * L'envoi de l'e-mail de relance sera branché au Lot 7.
 */
export async function processDunning(
  supabase: SupabaseClient,
): Promise<{ processed: number; ids: string[] }> {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const { data: due, error } = await supabase
    .from("invoices")
    .select("id, dunning_count")
    .eq("kind", "invoice")
    .eq("status", "sent")
    .eq("dunning_paused", false)
    .lte("due_on", today)
    .or(`last_dunned_at.is.null,last_dunned_at.lt.${weekAgo}`);
  if (error) throw new Error(error.message);

  const ids: string[] = [];
  for (const inv of due ?? []) {
    const { error: upErr } = await supabase
      .from("invoices")
      .update({
        dunning_count: (inv.dunning_count ?? 0) + 1,
        last_dunned_at: new Date().toISOString(),
      })
      .eq("id", inv.id);
    if (upErr) throw new Error(upErr.message);
    // TODO Lot 7 : envoyer l'e-mail de relance au destinataire.
    ids.push(inv.id as string);
  }
  return { processed: ids.length, ids };
}
