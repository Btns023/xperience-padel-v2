import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import {
  firstSessionReminderMail,
  adminWeeklyDigestMail,
  extensionOfferMail,
} from "@/lib/emails";
import { engagementRange, extensionOptions } from "@/lib/engagement";
import { addDays } from "@/lib/invoicing";
import {
  recipientForProfile,
  wantsNotif,
  adminEmails,
} from "@/lib/recipients";
import {
  formatDate,
  formatTime,
  todayInBrussels,
  weekdayLabel,
} from "@/lib/format";

/** Rappel « première séance dans 3 jours » (à lancer chaque jour). */
export async function sendFirstSessionReminders(
  supabase: SupabaseClient,
): Promise<number> {
  const target = new Date(Date.now() + 3 * 86_400_000)
    .toISOString()
    .slice(0, 10);

  // Toutes les séances du jour cible : un joueur entré en cours de cycle
  // (cycle à durée choisie) a sa « 1re séance » à la séance n° first_session.
  const { data: sessions } = await supabase
    .from("sessions")
    .select(
      "id, seq, date, start_time, group_id, groups(label, coach_id, slots(location_id, coach_id, locations(name), coaches(email)))",
    )
    .eq("date", target);

  let sent = 0;
  for (const se of sessions ?? []) {
    const g = se.groups as unknown as {
      label: string | null;
      slots: {
        locations: { name: string } | null;
        coaches: { email: string | null } | null;
      } | null;
    } | null;
    const place = g?.slots?.locations?.name ?? "";
    const time = se.start_time ? formatTime(se.start_time) : "";

    const { data: regs } = await supabase
      .from("registrations")
      .select("billed_to_profile_id, players(first_name)")
      .eq("group_id", se.group_id)
      .eq("first_session", se.seq)
      .neq("status", "annulee");

    const seen = new Set<string>();
    for (const r of regs ?? []) {
      if (seen.has(r.billed_to_profile_id)) continue;
      seen.add(r.billed_to_profile_id);
      const { email, prefs } = await recipientForProfile(
        r.billed_to_profile_id,
      );
      if (email && wantsNotif(prefs, "rappel_seance")) {
        await sendEmail({
          to: email,
          ...firstSessionReminderMail({
            name:
              (r.players as unknown as { first_name: string } | null)
                ?.first_name ?? "",
            date: formatDate(se.date),
            time,
            place,
            groupLabel: g?.label ?? "ton groupe",
          }),
        });
        sent++;
      }
    }

    const coachEmail = g?.slots?.coaches?.email;
    if (coachEmail && se.seq === 1) {
      await sendEmail({
        to: coachEmail,
        ...firstSessionReminderMail({
          name: "coach",
          date: formatDate(se.date),
          time,
          place,
          groupLabel: g?.label ?? "un groupe",
        }),
      });
      sent++;
    }
  }
  return sent;
}

/** Récap hebdomadaire des nouvelles demandes pour les administrateurs. */
export async function sendAdminWeeklyDigest(
  supabase: SupabaseClient,
): Promise<number> {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { data: regs } = await supabase
    .from("registrations")
    .select(
      "requested_at, players(first_name,last_name), slots(weekday,start_time,products(name))",
    )
    .eq("status", "demande_recue")
    .gte("requested_at", weekAgo)
    .order("requested_at", { ascending: true });

  if (!regs || regs.length === 0) return 0;

  const lines = regs.map((r) => {
    const pl = r.players as unknown as {
      first_name: string;
      last_name: string;
    } | null;
    const sl = r.slots as unknown as {
      weekday: number;
      start_time: string;
      products: { name: string } | null;
    } | null;
    return `${pl?.first_name ?? ""} ${pl?.last_name ?? ""} — ${
      sl
        ? `${weekdayLabel(sl.weekday)} ${formatTime(sl.start_time)} ${sl.products?.name ?? ""}`
        : ""
    }`.trim();
  });

  const to = await adminEmails();
  if (to.length === 0) return 0;
  await sendEmail({
    to,
    ...adminWeeklyDigestMail({ count: regs.length, lines }),
  });
  return regs.length;
}

type OfferSlot = {
  weekday: number;
  start_time: string;
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
};

/**
 * Cycles à durée choisie : propose de prolonger quand la dernière séance de
 * l'engagement d'un joueur tombe dans les 3 semaines. Une seule proposition
 * par inscription (extension_offer_sent_at). Fenêtre glissante : un jour de
 * tâche manqué ne fait perdre aucune proposition.
 */
export async function sendExtensionOffers(
  supabase: SupabaseClient,
): Promise<number> {
  const today = todayInBrussels();
  const { data: sessions } = await supabase
    .from("sessions")
    .select(
      "seq, date, group_id, groups(slots(weekday, start_time, session_count, starts_on, products(name, pricing_model, price_tiers(kind, session_count, amount_cents, active))))",
    )
    .gte("date", today)
    .lte("date", addDays(today, 21));

  let sent = 0;
  for (const se of sessions ?? []) {
    const slot = (se.groups as unknown as { slots: OfferSlot | null } | null)
      ?.slots;
    if (!slot?.products || slot.products.pricing_model !== "per_duration") {
      continue;
    }

    const { data: regs } = await supabase
      .from("registrations")
      .select(
        "id, first_session, session_count, billed_to_profile_id, players(first_name,last_name), billed_to:profiles(first_name)",
      )
      .eq("group_id", se.group_id)
      .neq("status", "annulee")
      .is("extension_offer_sent_at", null)
      .is("cancel_requested_at", null)
      .eq("late_cancellation", false);

    for (const r of regs ?? []) {
      if (engagementRange(r, slot.session_count).last !== se.seq) continue;
      const options = extensionOptions(
        r,
        slot.products.price_tiers,
        slot.session_count,
        slot.starts_on,
      );
      if (options.length === 0) continue;

      const { email, prefs } = await recipientForProfile(r.billed_to_profile_id);
      if (email && wantsNotif(prefs, "offre_prolongation")) {
        const pl = r.players as unknown as {
          first_name: string;
          last_name: string;
        } | null;
        await sendEmail({
          to: email,
          ...extensionOfferMail({
            name:
              (r.billed_to as unknown as { first_name: string | null } | null)
                ?.first_name ?? "",
            playerName: pl?.first_name ?? "",
            slotLabel: `${weekdayLabel(slot.weekday)} ${formatTime(slot.start_time)} — ${slot.products.name}`,
            currentCount: engagementRange(r, slot.session_count).count,
            endDate: formatDate(se.date),
            options: options.map((o) => ({
              ...o,
              toDate: o.toDate ? formatDate(o.toDate) : null,
            })),
          }),
        });
        sent++;
      }
      // Marquée même sans envoi (refus de notification) : on ne repasse pas.
      await supabase
        .from("registrations")
        .update({ extension_offer_sent_at: new Date().toISOString() })
        .eq("id", r.id);
    }
  }
  return sent;
}
