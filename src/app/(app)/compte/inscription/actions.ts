"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser, getCurrentProfile } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { registrationReceivedMail } from "@/lib/emails";
import { recipientForProfile, wantsNotif } from "@/lib/recipients";
import { weekdayLabel, formatTime } from "@/lib/format";

export type RegState = { error?: string };

const schema = z.object({
  slot_id: z.string().uuid(),
  player_ids: z.array(z.string().uuid()).min(1, "Choisis au moins un joueur"),
  as_org: z.boolean(),
  org_name: z.string().trim().optional(),
  org_address: z.string().trim().optional(),
  org_vat: z.string().trim().optional(),
  promo_code: z.string().trim().optional(),
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
  const { data: slot } = await supabase
    .from("slots")
    .select("id, season_id, min_level_code, max_level_code, status")
    .eq("id", slot_id)
    .single();
  if (!slot) return { error: "Créneau introuvable." };
  if (slot.status !== "open") return { error: "Ce créneau n'est plus ouvert." };

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
