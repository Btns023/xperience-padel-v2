"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { parseEurosToCents } from "@/lib/format";
import { processDunning } from "@/lib/dunning";

function refresh(invoiceId?: string) {
  revalidatePath("/admin/factures");
  revalidatePath("/admin/relances");
  revalidatePath("/admin");
  revalidatePath("/compte/factures");
  if (invoiceId) revalidatePath(`/admin/factures/${invoiceId}`);
}

/** Recalcule le statut « payée / envoyée » d'après la somme des paiements. */
async function recomputePaid(invoiceId: string) {
  const supabase = await createClient();
  const [{ data: inv }, { data: pmts }] = await Promise.all([
    supabase
      .from("invoices")
      .select("total_cents, status")
      .eq("id", invoiceId)
      .single(),
    supabase.from("payments").select("amount_cents, paid_on").eq("invoice_id", invoiceId),
  ]);
  if (!inv) return;
  const paid = (pmts ?? []).reduce((s, p) => s + p.amount_cents, 0);
  const fullyPaid = paid >= inv.total_cents && inv.total_cents > 0;

  async function setRegStatus(from: string, to: string) {
    const { data: ls } = await supabase
      .from("invoice_lines")
      .select("registration_id")
      .eq("invoice_id", invoiceId);
    const ids = (ls ?? [])
      .map((l) => l.registration_id)
      .filter((v): v is string => !!v);
    if (ids.length > 0) {
      await supabase
        .from("registrations")
        .update({ status: to })
        .in("id", ids)
        .eq("status", from);
    }
  }

  if (fullyPaid && inv.status === "sent") {
    const lastDate = (pmts ?? [])
      .map((p) => p.paid_on)
      .sort()
      .at(-1);
    await supabase
      .from("invoices")
      .update({ status: "paid", paid_at: lastDate ?? new Date().toISOString() })
      .eq("id", invoiceId);
    await setRegStatus("facturee", "payee");
  } else if (!fullyPaid && inv.status === "paid") {
    await supabase
      .from("invoices")
      .update({ status: "sent", paid_at: null })
      .eq("id", invoiceId);
    await setRegStatus("payee", "facturee");
  }
}

export async function recordPayment(
  invoiceId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireRole("admin");
  const amount = parseEurosToCents(String(formData.get("amount") ?? ""));
  if (amount === null || amount === 0) throw new Error("Montant invalide");

  const supabase = await createClient();
  const { error } = await supabase.from("payments").insert({
    invoice_id: invoiceId,
    amount_cents: amount,
    paid_on: String(formData.get("paid_on") ?? "") || new Date().toISOString().slice(0, 10),
    method: String(formData.get("method") ?? "virement").trim() || "virement",
    reference: String(formData.get("reference") ?? "").trim() || null,
    note: String(formData.get("note") ?? "").trim() || null,
    recorded_by: user.id,
  });
  if (error) throw new Error(error.message);
  await recomputePaid(invoiceId);
  refresh(invoiceId);
}

export async function deletePayment(
  invoiceId: string,
  paymentId: string,
): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("payments").delete().eq("id", paymentId);
  if (error) throw new Error(error.message);
  await recomputePaid(invoiceId);
  refresh(invoiceId);
}

export async function toggleDunningPause(
  invoiceId: string,
  paused: boolean,
): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase
    .from("invoices")
    .update({ dunning_paused: paused })
    .eq("id", invoiceId);
  refresh(invoiceId);
}

/** Relance manuelle d'une facture (incrémente le compteur). */
export async function dunOne(invoiceId: string): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: inv } = await supabase
    .from("invoices")
    .select("dunning_count, status, kind")
    .eq("id", invoiceId)
    .single();
  if (!inv || inv.status !== "sent" || inv.kind !== "invoice") return;
  await supabase
    .from("invoices")
    .update({
      dunning_count: (inv.dunning_count ?? 0) + 1,
      last_dunned_at: new Date().toISOString(),
    })
    .eq("id", invoiceId);
  // TODO Lot 7 : e-mail de relance.
  refresh(invoiceId);
}

/** Passe toutes les factures éligibles en revue (bouton admin). */
export async function runDunningNow(): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  await processDunning(supabase);
  refresh();
}
