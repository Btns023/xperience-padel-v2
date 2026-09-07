import { createAdminClient } from "@/lib/supabase/server";

export { OPTIONAL_NOTIFS, wantsNotif, type NotifKey } from "@/lib/notif-prefs";

/** E-mail + préférences d'un profil (l'e-mail vit dans auth.users). */
export async function recipientForProfile(
  profileId: string,
): Promise<{ email: string | null; prefs: Record<string, boolean> }> {
  const admin = createAdminClient();
  let email: string | null = null;
  let prefs: Record<string, boolean> = {};
  try {
    const { data: u } = await admin.auth.admin.getUserById(profileId);
    email = u.user?.email ?? null;
  } catch {
    /* e-mail introuvable */
  }
  try {
    const { data: prof } = await admin
      .from("profiles")
      .select("notif_prefs")
      .eq("id", profileId)
      .single();
    prefs = (prof?.notif_prefs as Record<string, boolean>) ?? {};
  } catch {
    /* préférences par défaut */
  }
  return { email, prefs };
}

/** E-mails de tous les administrateurs. */
export async function adminEmails(): Promise<string[]> {
  const admin = createAdminClient();
  const { data: profs } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "admin");
  const emails: string[] = [];
  for (const p of profs ?? []) {
    const { data: u } = await admin.auth.admin
      .getUserById(p.id)
      .catch(() => ({ data: null }));
    const e = (u as { user?: { email?: string } } | null)?.user?.email;
    if (e) emails.push(e);
  }
  return emails;
}
