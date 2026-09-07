"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { parseEurosToCents } from "@/lib/format";
import { commBaseFor, structuredCommunication } from "@/lib/belgium";

function refresh(invoiceId?: string) {
  revalidatePath("/admin/factures");
  revalidatePath("/admin");
  revalidatePath("/compte/factures");
  if (invoiceId) revalidatePath(`/admin/factures/${invoiceId}`);
}

type Settings = Record<string, string> & {
  issuer_name: string;
  issuer_legal_name: string;
  issuer_address: string;
  issuer_bce: string;
  issuer_iban: string;
  issuer_bic: string;
  vat_note: string;
  payment_terms_days: number;
};

function docNumber(kind: "invoice" | "credit_note", year: number, n: number) {
  const seq = String(n).padStart(3, "0");
  return kind === "credit_note" ? `NC ${year}-${seq}` : `${year}-${seq}`;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function loadSettings(): Promise<Settings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", "default")
    .single();
  return data as Settings;
}

/**
 * Génère un brouillon de facture par payeur pour un groupe confirmé.
 * Les inscriptions doivent être « validée » et avoir un prix/joueur.
 */
export async function generateInvoicesForGroup(
  groupId: string,
  slotId: string,
): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const settings = await loadSettings();

  const { data: group } = await supabase
    .from("groups")
    .select("id, slot_id, slots(season_id)")
    .eq("id", groupId)
    .single();

  const { data: regs } = await supabase
    .from("registrations")
    .select(
      "id, unit_price_cents, promo_code, billed_to_profile_id, billed_to_org_id, players(first_name,last_name), slots(weekday,start_time,product_id,products(name))",
    )
    .eq("group_id", groupId)
    .eq("status", "validee");

  if (!regs || regs.length === 0) return;

  const seasonId =
    (group?.slots as unknown as { season_id: string } | null)?.season_id ?? null;

  // Payeurs déjà facturés pour ce groupe (hors notes de crédit / annulées).
  const { data: existing } = await supabase
    .from("invoices")
    .select("billed_to_profile_id")
    .eq("group_id", groupId)
    .eq("kind", "invoice")
    .neq("status", "cancelled");
  const alreadyBilled = new Set(
    (existing ?? []).map((i) => i.billed_to_profile_id),
  );

  // Regroupe par payeur.
  const byPayer = new Map<string, typeof regs>();
  for (const r of regs) {
    if (alreadyBilled.has(r.billed_to_profile_id)) continue;
    const list = byPayer.get(r.billed_to_profile_id) ?? [];
    list.push(r);
    byPayer.set(r.billed_to_profile_id, list);
  }

  for (const [payerId, payerRegs] of byPayer) {
    const orgId = payerRegs[0].billed_to_org_id;

    // Snapshot destinataire
    let recipient: Record<string, string>;
    if (orgId) {
      const { data: org } = await supabase
        .from("organizations")
        .select("name, address, vat_number")
        .eq("id", orgId)
        .single();
      recipient = {
        name: org?.name ?? "",
        address: org?.address ?? "",
        vat_number: org?.vat_number ?? "",
        type: "organisation",
      };
    } else {
      const { data: prof } = await supabase
        .from("profiles")
        .select("first_name, last_name, address_line, postal_code, city")
        .eq("id", payerId)
        .single();
      let email = "";
      try {
        const { data: u } = await createAdminClient().auth.admin.getUserById(
          payerId,
        );
        email = u.user?.email ?? "";
      } catch {
        /* e-mail facultatif sur la facture */
      }
      recipient = {
        name: `${prof?.first_name ?? ""} ${prof?.last_name ?? ""}`.trim(),
        address: [prof?.address_line, `${prof?.postal_code ?? ""} ${prof?.city ?? ""}`.trim()]
          .filter(Boolean)
          .join(", "),
        email,
        type: "particulier",
      };
    }

    const today = new Date().toISOString().slice(0, 10);
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .insert({
        kind: "invoice",
        status: "draft",
        billed_to_profile_id: payerId,
        billed_to_org_id: orgId,
        group_id: groupId,
        season_id: seasonId,
        issued_on: today,
        due_on: addDays(today, Number(settings.payment_terms_days) || 15),
        issuer_snapshot: { ...settings },
        recipient_snapshot: recipient,
        vat_note: settings.vat_note,
        total_cents: 0,
      })
      .select("id")
      .single();
    if (invErr) throw new Error(invErr.message);

    let total = 0;
    const lines = [];
    for (let i = 0; i < payerRegs.length; i++) {
      const r = payerRegs[i];
      const slot = r.slots as unknown as {
        weekday: number;
        start_time: string;
        product_id: string;
        products: { name: string } | null;
      } | null;
      const player = r.players as unknown as {
        first_name: string;
        last_name: string;
      } | null;
      const unit = r.unit_price_cents ?? 0;

      // Remise éventuelle via code promo.
      let discount = 0;
      let promoCode: string | null = null;
      if (r.promo_code) {
        const { data: promo } = await supabase
          .from("promo_codes")
          .select("amount_cents, product_id, active")
          .eq("code", r.promo_code)
          .maybeSingle();
        if (
          promo &&
          promo.active &&
          (promo.product_id === null || promo.product_id === slot?.product_id)
        ) {
          discount = Math.min(promo.amount_cents, unit);
          promoCode = r.promo_code;
        }
      }

      const amount = unit - discount;
      total += amount;
      lines.push({
        invoice_id: invoice!.id,
        registration_id: r.id,
        description: `${slot?.products?.name ?? "Cours"} — ${player?.first_name ?? ""} ${player?.last_name ?? ""}`.trim(),
        quantity: 1,
        unit_price_cents: unit,
        discount_cents: discount,
        promo_code: promoCode,
        amount_cents: amount,
        position: i,
      });
    }

    await supabase.from("invoice_lines").insert(lines);
    await supabase
      .from("invoices")
      .update({ total_cents: total })
      .eq("id", invoice!.id);
  }

  refresh();
  revalidatePath(`/admin/creneaux/${slotId}/groupes`);
  redirect("/admin/factures");
}

// --- Édition d'un brouillon --------------------------------------------

async function recomputeTotal(invoiceId: string) {
  const supabase = await createClient();
  const { data: lines } = await supabase
    .from("invoice_lines")
    .select("amount_cents")
    .eq("invoice_id", invoiceId);
  const total = (lines ?? []).reduce((s, l) => s + l.amount_cents, 0);
  await supabase.from("invoices").update({ total_cents: total }).eq("id", invoiceId);
}

export async function addLine(invoiceId: string): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("invoice_lines").insert({
    invoice_id: invoiceId,
    description: "Prestation",
    quantity: 1,
    unit_price_cents: 0,
    discount_cents: 0,
    amount_cents: 0,
    position: 999,
  });
  await recomputeTotal(invoiceId);
  refresh(invoiceId);
}

export async function updateLine(
  invoiceId: string,
  lineId: string,
  formData: FormData,
): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const qty = Math.max(1, Number(formData.get("quantity") ?? 1));
  const unit = parseEurosToCents(String(formData.get("unit_price") ?? "")) ?? 0;
  const discount =
    parseEurosToCents(String(formData.get("discount") ?? "")) ?? 0;
  const amount = qty * unit - discount;
  await supabase
    .from("invoice_lines")
    .update({
      description: String(formData.get("description") ?? "").trim() || "Prestation",
      quantity: qty,
      unit_price_cents: unit,
      discount_cents: discount,
      amount_cents: amount,
    })
    .eq("id", lineId);
  await recomputeTotal(invoiceId);
  refresh(invoiceId);
}

export async function deleteLine(
  invoiceId: string,
  lineId: string,
): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("invoice_lines").delete().eq("id", lineId);
  await recomputeTotal(invoiceId);
  refresh(invoiceId);
}

export async function updateInvoiceMeta(
  invoiceId: string,
  formData: FormData,
): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase
    .from("invoices")
    .update({
      issued_on: String(formData.get("issued_on") ?? "") || undefined,
      due_on: String(formData.get("due_on") ?? "") || null,
      vat_note: String(formData.get("vat_note") ?? ""),
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", invoiceId);
  refresh(invoiceId);
}

// --- Transitions ------------------------------------------------------

export async function issueInvoice(invoiceId: string): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: inv } = await supabase
    .from("invoices")
    .select("id, kind, status, number, issuer_snapshot")
    .eq("id", invoiceId)
    .single();
  if (!inv || inv.status !== "draft") return;

  const { data: n, error: nErr } = await supabase.rpc("next_document_number", {
    p_kind: inv.kind,
  });
  if (nErr) throw new Error(nErr.message);

  const year = new Date().getFullYear();
  const number = docNumber(inv.kind, year, n as number);
  const comm = structuredCommunication(commBaseFor(year, n as number));

  const { data: full } = await supabase
    .from("invoices")
    .select("issued_on, due_on, issuer_snapshot")
    .eq("id", invoiceId)
    .single();
  const terms =
    Number(
      (full?.issuer_snapshot as Record<string, string>)?.payment_terms_days,
    ) || 15;

  const { error } = await supabase
    .from("invoices")
    .update({
      number,
      structured_comm: inv.kind === "invoice" ? comm : null,
      due_on: full?.due_on ?? addDays(full?.issued_on ?? new Date().toISOString().slice(0, 10), terms),
      status: "sent",
      sent_at: new Date().toISOString(),
    })
    .eq("id", invoiceId);
  if (error) throw new Error(error.message);

  // TODO Lot 7 : envoyer la facture PDF par e-mail au destinataire.
  refresh(invoiceId);
}

export async function markPaid(invoiceId: string): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase
    .from("invoices")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", invoiceId)
    .eq("status", "sent");
  refresh(invoiceId);
}

export async function markUnpaid(invoiceId: string): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase
    .from("invoices")
    .update({ status: "sent", paid_at: null })
    .eq("id", invoiceId)
    .eq("status", "paid");
  refresh(invoiceId);
}

export async function deleteDraft(invoiceId: string): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("status", "draft");
  refresh();
  redirect("/admin/factures");
}

/** Note de crédit intégrale : annule la facture et rembourse tout (V1). */
export async function createCreditNote(invoiceId: string): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: inv } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .single();
  if (!inv || inv.kind !== "invoice" || inv.status === "draft") return;
  if (inv.status === "cancelled") return;

  const { data: lines } = await supabase
    .from("invoice_lines")
    .select("*")
    .eq("invoice_id", invoiceId);

  const { data: n, error: nErr } = await supabase.rpc("next_document_number", {
    p_kind: "credit_note",
  });
  if (nErr) throw new Error(nErr.message);
  const year = new Date().getFullYear();
  const number = docNumber("credit_note", year, n as number);

  const { data: cn, error: cnErr } = await supabase
    .from("invoices")
    .insert({
      kind: "credit_note",
      number,
      status: "sent",
      billed_to_profile_id: inv.billed_to_profile_id,
      billed_to_org_id: inv.billed_to_org_id,
      group_id: inv.group_id,
      season_id: inv.season_id,
      parent_invoice_id: inv.id,
      issuer_snapshot: inv.issuer_snapshot,
      recipient_snapshot: inv.recipient_snapshot,
      vat_note: inv.vat_note,
      total_cents: -inv.total_cents,
      notes: `Annulation de la facture ${inv.number ?? ""}`.trim(),
      sent_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (cnErr) throw new Error(cnErr.message);

  if (lines && lines.length > 0) {
    await supabase.from("invoice_lines").insert(
      lines.map((l, i) => ({
        invoice_id: cn!.id,
        registration_id: l.registration_id,
        description: l.description,
        quantity: l.quantity,
        unit_price_cents: -l.unit_price_cents,
        discount_cents: 0,
        amount_cents: -l.amount_cents,
        position: i,
      })),
    );
  }

  // La facture d'origine est annulée ; les inscriptions repassent en annulée.
  await supabase
    .from("invoices")
    .update({ status: "cancelled" })
    .eq("id", inv.id);
  const regIds = (lines ?? [])
    .map((l) => l.registration_id)
    .filter((v): v is string => !!v);
  if (regIds.length > 0) {
    await supabase
      .from("registrations")
      .update({ status: "annulee" })
      .in("id", regIds);
  }

  refresh(invoiceId);
  redirect(`/admin/factures/${cn!.id}`);
}
