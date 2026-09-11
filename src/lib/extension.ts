import { createAdminClient } from "@/lib/supabase/server";
import {
  engagementRange,
  extensionOptions,
  occupancyByPeriod,
  periodLength,
  periodsOf,
  type EngagementRef,
} from "@/lib/engagement";
import {
  addDays,
  loadInvoiceSettings,
  recipientSnapshot,
} from "@/lib/invoicing";

/**
 * Prolongation d'un cycle à durée choisie (ex. 9 → 18 cours).
 *
 * Le supplément est la différence entre les deux paliers (18 cours 275 € −
 * 9 cours 150 € = 125 €). Selon l'avancement de l'inscription :
 *   * pas encore de prix figé     → seule la durée change ; le prix sera
 *                                   calculé à la confirmation du groupe ;
 *   * prix figé, pas encore facturé → la durée et le prix figé changent ;
 *   * déjà facturée               → la durée et le prix figé changent, et
 *                                   une facture complémentaire est créée en
 *                                   BROUILLON pour relecture par l'académie.
 *
 * Écrit avec le client admin : appelé après vérification des droits par
 * l'action appelante (payeur ou administrateur).
 */

export type ExtendResult = {
  error?: string;
  extraCents?: number;
  /** Facture complémentaire créée (brouillon), le cas échéant. */
  invoiceId?: string;
};

type RegForExtension = EngagementRef & {
  id: string;
  status: string;
  slot_id: string;
  group_id: string | null;
  season_id: string;
  unit_price_cents: number | null;
  billed_to_profile_id: string;
  billed_to_org_id: string | null;
  players: { first_name: string; last_name: string } | null;
  slots: {
    capacity: number;
    session_count: number;
    starts_on: string | null;
    products: {
      name: string;
      pricing_model: string;
      price_tiers: {
        kind: string;
        session_count: number | null;
        amount_cents: number;
        active: boolean;
      }[];
    } | null;
  } | null;
};

export async function extendRegistration(
  registrationId: string,
  newCount: number,
  opts: {
    /** Refuse si une période ajoutée est complète (côté client). */
    enforceCapacity: boolean;
  },
): Promise<ExtendResult> {
  const db = createAdminClient();

  const { data } = await db
    .from("registrations")
    .select(
      "id, status, slot_id, group_id, season_id, unit_price_cents, first_session, session_count, billed_to_profile_id, billed_to_org_id, players(first_name,last_name), slots(capacity, session_count, starts_on, products(name, pricing_model, price_tiers(kind, session_count, amount_cents, active)))",
    )
    .eq("id", registrationId)
    .single();
  const reg = data as unknown as RegForExtension | null;
  if (!reg || !reg.slots?.products) return { error: "Inscription introuvable." };
  if (reg.status === "annulee") return { error: "Cette inscription est annulée." };

  const slot = reg.slots;
  const product = reg.slots.products;
  if (product.pricing_model !== "per_duration") {
    return { error: "Ce cours ne se prolonge pas." };
  }

  const option = extensionOptions(
    reg,
    product.price_tiers,
    slot.session_count,
    slot.starts_on,
  ).find((o) => o.count === newCount);
  if (!option) return { error: "Cette prolongation n'est pas possible." };

  const before = engagementRange(reg, slot.session_count);
  const after = { first: before.first, last: before.first + newCount - 1 };

  if (opts.enforceCapacity) {
    // Places sur les périodes AJOUTÉES, en comptant les autres inscrits.
    const { data: others } = await db
      .from("registrations")
      .select("first_session, session_count")
      .eq("slot_id", reg.slot_id)
      .neq("status", "annulee")
      .neq("id", reg.id);
    const periods = periodsOf(
      slot.session_count,
      periodLength(product.pricing_model, product.price_tiers, slot.session_count),
    ).filter((p) => p.first > before.last && p.first <= after.last);
    const load = occupancyByPeriod(others ?? [], slot.session_count, periods);
    if (load.some((n) => n >= slot.capacity)) {
      return {
        error:
          "Le groupe est complet sur la période suivante. Contacte l'académie : on te trouve une solution.",
      };
    }
  }

  // Déjà facturée ? (facture non annulée portant cette inscription)
  const { data: lines } = await db
    .from("invoice_lines")
    .select("id, invoices!inner(kind, status)")
    .eq("registration_id", reg.id);
  const invoiced = (lines ?? []).some((l) => {
    const inv = l.invoices as unknown as { kind: string; status: string };
    return inv.kind === "invoice" && inv.status !== "cancelled";
  });

  const { error: upErr } = await db
    .from("registrations")
    .update({
      session_count: newCount,
      unit_price_cents:
        reg.unit_price_cents != null
          ? reg.unit_price_cents + option.extraCents
          : null,
    })
    .eq("id", reg.id);
  if (upErr) return { error: upErr.message };

  if (!invoiced || option.extraCents <= 0) {
    return { extraCents: option.extraCents };
  }

  // Facture complémentaire, en brouillon : l'académie la relit puis l'émet.
  const settings = await loadInvoiceSettings(db);
  const recipient = await recipientSnapshot(
    db,
    reg.billed_to_profile_id,
    reg.billed_to_org_id,
  );
  const today = new Date().toISOString().slice(0, 10);
  const { data: invoice, error: invErr } = await db
    .from("invoices")
    .insert({
      kind: "invoice",
      status: "draft",
      billed_to_profile_id: reg.billed_to_profile_id,
      billed_to_org_id: reg.billed_to_org_id,
      group_id: reg.group_id,
      season_id: reg.season_id,
      issued_on: today,
      due_on: addDays(today, Number(settings.payment_terms_days) || 15),
      issuer_snapshot: { ...settings },
      recipient_snapshot: recipient,
      vat_note: settings.vat_note,
      total_cents: option.extraCents,
      notes: `Prolongation de ${before.count} à ${newCount} cours.`,
    })
    .select("id")
    .single();
  if (invErr) return { error: invErr.message };

  const player = `${reg.players?.first_name ?? ""} ${reg.players?.last_name ?? ""}`.trim();
  await db.from("invoice_lines").insert({
    invoice_id: invoice!.id,
    registration_id: reg.id,
    description: `Prolongation ${product.name} : ${before.count} → ${newCount} cours — ${player}`,
    quantity: 1,
    unit_price_cents: option.extraCents,
    discount_cents: 0,
    amount_cents: option.extraCents,
    position: 0,
  });

  return { extraCents: option.extraCents, invoiceId: invoice!.id };
}
