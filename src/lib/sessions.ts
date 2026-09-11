import type { SupabaseClient } from "@supabase/supabase-js";
import { sessionDate } from "@/lib/engagement";

/**
 * (Re)génère les séances d'un groupe à partir du créneau : 1re séance =
 * slot.starts_on, puis une par semaine, `session_count` au total.
 * Si le créneau n'a pas de date de 1re séance, aucune séance n'est créée.
 */
export async function regenerateSessions(
  supabase: SupabaseClient,
  groupId: string,
): Promise<void> {
  const { data: group } = await supabase
    .from("groups")
    .select("id, slot_id, slots(starts_on, start_time, session_count)")
    .eq("id", groupId)
    .single();

  await supabase.from("sessions").delete().eq("group_id", groupId);

  const slot = group?.slots as unknown as {
    starts_on: string | null;
    start_time: string | null;
    session_count: number;
  } | null;
  if (!slot?.starts_on) return;

  // Dates calculées en UTC (sessionDate) : en heure locale, le passage à
  // l'heure d'été décalait les séances suivantes d'un jour.
  const rows = [];
  for (let seq = 1; seq <= (slot.session_count ?? 0); seq++) {
    rows.push({
      group_id: groupId,
      seq,
      date: sessionDate(slot.starts_on, seq),
      start_time: slot.start_time,
    });
  }
  if (rows.length > 0) await supabase.from("sessions").insert(rows);
}
