import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { dunningMail, type DunningLevel } from "@/lib/emails";
import { recipientForProfile } from "@/lib/recipients";
import { formatDate } from "@/lib/format";

/**
 * Passe en revue les factures « envoyées » impayées et non mises en pause,
 * échues, dont la dernière relance date de plus de 7 jours (ou jamais).
 *
 * Trois niveaux, repris des courriers de l'académie : rappel amical,
 * dernier rappel, puis mise en demeure. Au-delà, plus d'e-mail automatique :
 * la mise en demeure officielle part par courrier postal, à l'initiative de
 * l'académie (voir la page « Impayés & relances »).
 */
export async function processDunning(
  supabase: SupabaseClient,
): Promise<{ processed: number; ids: string[] }> {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data: due, error } = await supabase
    .from("invoices")
    .select(
      "id, number, total_cents, issued_on, due_on, structured_comm, dunning_count, billed_to_profile_id, issuer_snapshot",
    )
    .eq("kind", "invoice")
    .eq("status", "sent")
    .eq("dunning_paused", false)
    .lt("dunning_count", 3)
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

    try {
      const { email } = await recipientForProfile(inv.billed_to_profile_id);
      if (email) {
        const iss = inv.issuer_snapshot as Record<string, string>;
        await sendEmail({
          to: email,
          ...dunningMail({
            level: Math.min(3, (inv.dunning_count ?? 0) + 1) as DunningLevel,
            number: inv.number ?? "",
            amountCents: inv.total_cents,
            issuedOn: inv.issued_on ? formatDate(inv.issued_on) : null,
            dueOn: inv.due_on ? formatDate(inv.due_on) : null,
            comm: inv.structured_comm,
            iban: iss?.issuer_iban ?? "",
            url: `${site}/facture/${inv.id}`,
          }),
        });
      }
    } catch {
      /* l'e-mail ne bloque pas le traitement */
    }
    ids.push(inv.id as string);
  }
  return { processed: ids.length, ids };
}
