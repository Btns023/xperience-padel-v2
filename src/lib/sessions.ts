import type { SupabaseClient } from "@supabase/supabase-js";

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

  const first = new Date(slot.starts_on);
  const rows = [];
  for (let i = 0; i < (slot.session_count ?? 0); i++) {
    const d = new Date(first);
    d.setDate(d.getDate() + i * 7);
    rows.push({
      group_id: groupId,
      seq: i + 1,
      date: d.toISOString().slice(0, 10),
      start_time: slot.start_time,
    });
  }
  if (rows.length > 0) await supabase.from("sessions").insert(rows);
}
