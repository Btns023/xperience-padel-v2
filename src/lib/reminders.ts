import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import {
  firstSessionReminderMail,
  adminWeeklyDigestMail,
} from "@/lib/emails";
import {
  recipientForProfile,
  wantsNotif,
  adminEmails,
} from "@/lib/recipients";
import { formatDate, formatTime, weekdayLabel } from "@/lib/format";

/** Rappel « première séance dans 3 jours » (à lancer chaque jour). */
export async function sendFirstSessionReminders(
  supabase: SupabaseClient,
): Promise<number> {
  const target = new Date(Date.now() + 3 * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const { data: sessions } = await supabase
    .from("sessions")
    .select(
      "id, date, start_time, group_id, groups(label, coach_id, slots(location_id, coach_id, locations(name), coaches(email)))",
    )
    .eq("seq", 1)
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
    if (coachEmail) {
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
