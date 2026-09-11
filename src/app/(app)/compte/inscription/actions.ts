"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser, getCurrentProfile } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { registrationReceivedMail } from "@/lib/emails";
import { recipientForProfile, wantsNotif } from "@/lib/recipients";
import { weekdayLabel, formatTime, todayInBrussels } from "@/lib/format";
import { tierPrice } from "@/lib/engagement";
import { loadEngagements, slotCycle } from "@/lib/slot-cycle";

export type RegState = { error?: string };

type SlotForRegistration = {
  id: string;
  season_id: string;
  min_level_code: string | null;
  max_level_code: string | null;
  status: string;
  session_count: number;
  starts_on: string | null;
  products: {
    pricing_model: string;
    price_tiers: {
      kind: string;
      session_count: number | null;
      amount_cents: number;
      active: boolean;
    }[];
  } | null;
};

const schema = z.object({
  slot_id: z.string().uuid(),
  player_ids: z.array(z.string().uuid()).min(1, "Choisis au moins un joueur"),
  as_org: z.boolean(),
  org_name: z.string().trim().optional(),
  org_address: z.string().trim().optional(),
  org_vat: z.string().trim().optional(),
  promo_code: z.string().trim().optional(),
  session_count: z.coerce.number().int().positive().optional(),
});

export async function createRegistrations(
  _prev: RegState,
  formData: FormData,
): Promise<RegState> {
  const user = await requireUser();

  const parsed = schema.safeParse({
    slot_id: formData.get("slot_id"),
    player_ids: formData.getAll("player_ids"),
    as_org: formData.get("as_org") === "on",
    org_name: formData.get("org_name") || undefined,
    org_address: formData.get("org_address") || undefined,
    org_vat: formData.get("org_vat") || undefined,
    promo_code: formData.get("promo_code") || undefined,
    session_count: formData.get("session_count") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }
  const { slot_id, player_ids, as_org, org_name, org_address, org_vat } =
    parsed.data;
  const promoCode = parsed.data.promo_code
    ? parsed.data.promo_code.toUpperCase()
    : null;

  if (as_org && !org_name) {
    return { error: "Nom de l'entreprise requis." };
  }

  const supabase = await createClient();

  // Créneau + niveaux
  const { data: slotRow } = await supabase
    .from("slots")
    .select(
      "id, season_id, min_level_code, max_level_code, status, session_count, starts_on, products(pricing_model, price_tiers(kind, session_count, amount_cents, active))",
    )
    .eq("id", slot_id)
    .single();
  if (!slotRow) return { error: "Créneau introuvable." };
  const slot = slotRow as unknown as SlotForRegistration;
  if (slot.status !== "open") return { error: "Ce créneau n'est plus ouvert." };

  // Cycle à durée choisie : durée obligatoire, entrée à la période ouverte.
  // Tout est recalculé ici — rien n'est pris tel quel du formulaire.
  let engagement: { first_session: number; session_count: number | null } = {
    first_session: 1,
    session_count: null,
  };
  const engagements = (await loadEngagements(supabase, [slot.id])).get(slot.id) ?? [];
  const cycle = slotCycle(slot, engagements, todayInBrussels());
  if (cycle.byDuration) {
    if (!cycle.open) {
      return { error: "Ce cycle a déjà commencé : contacte l'académie." };
    }
    const count = parsed.data.session_count;
    if (!count) return { error: "Choisis la durée du cycle." };
    const tiers = slot.products?.price_tiers ?? [];
    if (tierPrice(tiers, count) == null) {
      return { error: "Cette durée n'est pas proposée." };
    }
    if (cycle.open.first + count - 1 > slot.session_count) {
      return { error: "Cette durée dépasse la fin du cycle." };
    }
    engagement = { first_session: cycle.open.first, session_count: count };
  }

  const { data: levels } = await supabase
    .from("padel_levels")
    .select("code, rank");
  const rank = new Map((levels ?? []).map((l) => [l.code, l.rank]));
  const minRank = slot.min_level_code ? rank.get(slot.min_level_code) : undefined;
  const maxRank = slot.max_level_code ? rank.get(slot.max_level_code) : undefined;

  // Joueurs : ne garder que ceux réellement gérés par l'utilisateur
  const { data: players } = await supabase
    .from("players")
    .select("id, level_code")
    .in("id", player_ids)
    .eq("managed_by", user.id);
  if (!players || players.length === 0) {
    return { error: "Aucun joueur valide sélectionné." };
  }

  // Entreprise (créée / réutilisée)
  let orgId: string | null = null;
  if (as_org && org_name) {
    const { data: existing } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", user.id)
      .eq("name", org_name)
      .maybeSingle();
    if (existing) {
      orgId = existing.id;
      await supabase
        .from("organizations")
        .update({ address: org_address ?? null, vat_number: org_vat ?? null })
        .eq("id", existing.id);
    } else {
      const { data: created, error: orgErr } = await supabase
        .from("organizations")
        .insert({
          owner_id: user.id,
          name: org_name,
          address: org_address ?? null,
          vat_number: org_vat ?? null,
        })
        .select("id")
        .single();
      if (orgErr) return { error: orgErr.message };
      orgId = created!.id;
    }
  }

  const rows = players.map((p) => {
    const r = rank.get(p.level_code);
    const mismatch =
      r !== undefined &&
      ((minRank !== undefined && r < minRank) ||
        (maxRank !== undefined && r > maxRank));
    return {
      player_id: p.id,
      slot_id,
      season_id: slot.season_id,
      status: "demande_recue" as const,
      billed_to_profile_id: user.id,
      billed_to_org_id: orgId,
      level_mismatch: mismatch,
      promo_code: promoCode,
      ...engagement,
    };
  });

  const { error } = await supabase
    .from("registrations")
    .upsert(rows, { onConflict: "player_id,slot_id", ignoreDuplicates: true });
  if (error) return { error: error.message };

  // E-mail « demande reçue » au payeur (optionnel).
  try {
    const { email, prefs } = await recipientForProfile(user.id);
    if (email && wantsNotif(prefs, "demande_recue")) {
      const { data: s } = await supabase
        .from("slots")
        .select("weekday, start_time, products(name)")
        .eq("id", slot_id)
        .single();
      const label = s
        ? `${weekdayLabel(s.weekday)} ${formatTime(s.start_time)} — ${
            (s.products as unknown as { name: string } | null)?.name ?? ""
          }`.trim()
        : "ton créneau";
      const me = await getCurrentProfile();
      await sendEmail({
        to: email,
        ...registrationReceivedMail({
          name: me?.first_name ?? "",
          slotLabel: label,
        }),
      });
    }
  } catch {
    /* l'e-mail ne doit pas bloquer l'inscription */
  }

  revalidatePath("/compte/inscriptions");
  revalidatePath("/compte");
  redirect("/compte/inscriptions?ok=1");
}
