"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function markAttendance(
  sessionId: string,
  groupId: string,
  registrationId: string,
  present: boolean,
): Promise<void> {
  await requireRole(["coach", "admin"]);
  const supabase = await createClient();
  const { error } = await supabase.rpc("coach_mark_attendance", {
    p_session_id: sessionId,
    p_registration_id: registrationId,
    p_present: present,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/coach/groupes/${groupId}/seance/${sessionId}`);
  revalidatePath(`/coach/groupes/${groupId}`);
}
