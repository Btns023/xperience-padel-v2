"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { computeUnitPriceCents } from "@/lib/pricing";
import { regenerateSessions } from "@/lib/sessions";
import { parseEurosToCents, weekdayLabel, formatTime } from "@/lib/format";
import { sendEmail } from "@/lib/email";
import { groupConfirmedMail } from "@/lib/emails";
import { recipientForProfile, wantsNotif } from "@/lib/recipients";
import type { PriceTier, PricingModel } from "@/lib/types";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function refresh(slotId: string) {
  revalidatePath(`/admin/creneaux/${slotId}/groupes`);
  revalidatePath("/admin/demandes");
  revalidatePath("/admin");
}

export async function createGroup(slotId: string): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const { count } = await supabase
    .from("groups")
    .select("*", { count: "exact", head: true })
    .eq("slot_id", slotId);
  const label = `Groupe ${LETTERS[count ?? 0] ?? String((count ?? 0) + 1)}`;
  const { error } = await supabase
    .from("groups")
    .insert({ slot_id: slotId, label });
  if (error) throw new Error(error.message);
  refresh(slotId);
}

export async function assignRegistration(
  slotId: string,
  registrationId: string,
  groupId: string,
): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();

  let targetGroupId = groupId;
  if (groupId === "new") {
    const { count } = await supabase
      .from("groups")
      .select("*", { count: "exact", head: true })
      .eq("slot_id", slotId);
    const { data, error } = await supabase
      .from("groups")
      .insert({
        slot_id: slotId,
        label: `Groupe ${LETTERS[count ?? 0] ?? String((count ?? 0) + 1)}`,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    targetGroupId = data!.id;
  }

  const { error } = await supabase
    .from("registrations")
    .update({ group_id: targetGroupId, status: "groupe_constitue" })
    .eq("id", registrationId)
    .in("status", ["demande_recue", "groupe_constitue"]);
  if (error) throw new Error(error.message);
  refresh(slotId);
}

export async function unassignRegistration(
  slotId: string,
  registrationId: string,
): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase
    .from("registrations")
    .update({ group_id: null, status: "demande_recue", unit_price_cents: null })
    .eq("id", registrationId)
    .neq("status", "annulee");
  if (error) throw new Error(error.message);
  refresh(slotId);
}

export async function updateGroup(
  slotId: string,
  groupId: string,
  formData: FormData,
): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const label = String(formData.get("label") ?? "").trim() || null;
  const { error } = await supabase
    .from("groups")
    .update({ label })
    .eq("id", groupId);
  if (error) throw new Error(error.message);
  refresh(slotId);
}

export async function deleteGroup(
  slotId: string,
  groupId: string,
): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  // Les membres repassent en demande non assignée.
  await supabase
    .from("registrations")
    .update({ group_id: null, status: "demande_recue", unit_price_cents: null })
    .eq("group_id", groupId)
    .neq("status", "annulee");
  const { error } = await supabase.from("groups").delete().eq("id", groupId);
  if (error) throw new Error(error.message);
  refresh(slotId);
}

export async function reopenGroup(
  slotId: string,
  groupId: string,
): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase
    .from("registrations")
    .update({ status: "groupe_constitue", unit_price_cents: null })
    .eq("group_id", groupId)
    .eq("status", "validee");
  const { error } = await supabase
    .from("groups")
    .update({ status: "forming", confirmed_at: null })
    .eq("id", groupId);
  if (error) throw new Error(error.message);
  await supabase.from("sessions").delete().eq("group_id", groupId);
  refresh(slotId);
}

/**
 * Confirme le groupe : l'effectif est le nombre de joueurs réellement
 * assignés (Option A). Fige la taille, calcule le prix/joueur selon la
 * grille, fait passer les inscriptions membres en « Validée ».
 * Un prix manuel (€) par inscription reste possible (prorata, forfait,
 * cours privé).
 */
export type ConfirmState = { error?: string; ok?: boolean };

export async function confirmGroup(
  slotId: string,
  groupId: string,
  _prev: ConfirmState,
  formData: FormData,
): Promise<ConfirmState> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("id, slot_id")
    .eq("id", groupId)
    .single();
  if (!group) return { error: "Groupe introuvable." };

  const { data: slot } = await supabase
    .from("slots")
    .select(
      "id, session_count, products(pricing_model, price_tiers(*))",
    )
    .eq("id", slotId)
    .single();
  if (!slot) return { error: "Créneau introuvable." };

  const { data: members } = await supabase
    .from("registrations")
    .select("id, prorata_sessions")
    .eq("group_id", groupId)
    .neq("status", "annulee");
  if (!members || members.length === 0) {
    return { error: "Le groupe ne contient aucun joueur." };
  }

  // Option A : l'effectif = le nombre de joueurs assignés.
  const size = members.length;

  const product = slot.products as unknown as {
    pricing_model: PricingModel;
    price_tiers: PriceTier[];
  } | null;

  if (product?.pricing_model === "per_group_size" && size < 2) {
    return {
      error:
        "Un cours collectif compte au moins 2 joueurs. Ajoute des joueurs au groupe, ou traite ce joueur en cours privé.",
    };
  }

  for (const m of members) {
    const override = parseEurosToCents(
      String(formData.get(`price_${m.id}`) ?? ""),
    );
    let price = override;
    if (price == null && product) {
      price = computeUnitPriceCents({
        pricingModel: product.pricing_model,
        tiers: product.price_tiers,
        groupSize: size,
        sessionCount: slot.session_count,
        prorataSessions: m.prorata_sessions,
      });
    }
    const { error } = await supabase
      .from("registrations")
      .update({ status: "validee", unit_price_cents: price })
      .eq("id", m.id);
    if (error) return { error: error.message };
  }

  const { error } = await supabase
    .from("groups")
    .update({
      size,
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", groupId);
  if (error) return { error: error.message };

  await regenerateSessions(supabase, groupId);

  // E-mail « groupe constitué » aux payeurs (optionnel).
  try {
    const { data: g } = await supabase
      .from("groups")
      .select("label, slots(weekday, start_time, products(name))")
      .eq("id", groupId)
      .single();
    const sl = g?.slots as unknown as {
      weekday: number;
      start_time: string;
      products: { name: string } | null;
    } | null;
    const slotLabel = sl
      ? `${weekdayLabel(sl.weekday)} ${formatTime(sl.start_time)} — ${sl.products?.name ?? ""}`.trim()
      : "ton créneau";

    const { data: mm } = await supabase
      .from("registrations")
      .select(
        "billed_to_profile_id, unit_price_cents, players(first_name)",
      )
      .eq("group_id", groupId)
      .eq("status", "validee");

    const seen = new Set<string>();
    for (const m of mm ?? []) {
      if (seen.has(m.billed_to_profile_id)) continue;
      seen.add(m.billed_to_profile_id);
      const { email, prefs } = await recipientForProfile(
        m.billed_to_profile_id,
      );
      if (email && wantsNotif(prefs, "groupe_constitue")) {
        await sendEmail({
          to: email,
          ...groupConfirmedMail({
            name:
              (m.players as unknown as { first_name: string } | null)
                ?.first_name ?? "",
            slotLabel,
            groupLabel: g?.label ?? "ton groupe",
            unitPriceCents: m.unit_price_cents,
          }),
        });
      }
    }
  } catch {
    /* l'e-mail ne bloque pas la confirmation */
  }

  refresh(slotId);
  return { ok: true };
}
