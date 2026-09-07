"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { computeUnitPriceCents } from "@/lib/pricing";
import { parseEurosToCents } from "@/lib/format";
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
  const sizeRaw = formData.get("size");
  const size = sizeRaw && sizeRaw !== "" ? Number(sizeRaw) : null;
  const { error } = await supabase
    .from("groups")
    .update({ label, size })
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
  refresh(slotId);
}

/**
 * Confirme l'effectif d'un groupe : fige la taille, calcule le prix/joueur
 * selon la grille, et fait passer les inscriptions membres en « Validée ».
 * `overrides` : prix manuel (€) par inscription, pour les cas non couverts
 * par la grille (forfait, cours privé) ou les prorata.
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
    .select("id, slot_id, size")
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

  const sizeRaw = formData.get("size");
  const size =
    sizeRaw && sizeRaw !== "" ? Number(sizeRaw) : (group.size ?? members.length);

  const product = slot.products as unknown as {
    pricing_model: PricingModel;
    price_tiers: PriceTier[];
  } | null;

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

  refresh(slotId);
  return { ok: true };
}
