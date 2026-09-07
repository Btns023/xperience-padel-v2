"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { OPTIONAL_NOTIFS } from "@/lib/notif-prefs";

export type PrefState = { ok?: boolean; error?: string };

export async function updateNotifPrefs(
  _prev: PrefState,
  formData: FormData,
): Promise<PrefState> {
  const user = await requireUser();
  const prefs: Record<string, boolean> = {};
  for (const { key } of OPTIONAL_NOTIFS) {
    prefs[key] = formData.get(key) === "on";
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ notif_prefs: prefs })
    .eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/compte/notifications");
  return { ok: true };
}
