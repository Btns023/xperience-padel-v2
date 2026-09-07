"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireUser, getCurrentProfile } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { cancellationRequestAdminMail } from "@/lib/emails";
import { adminEmails } from "@/lib/recipients";
import { weekdayLabel, formatTime } from "@/lib/format";

export async function requestCancellation(registrationId: string): Promise<void> {
  const user = await requireUser();

  const supabase = await createClient();
  const { data: reg } = await supabase
    .from("registrations")
    .select(
      "id, billed_to_profile_id, status, players(first_name,last_name), slots(weekday,start_time,products(name))",
    )
    .eq("id", registrationId)
    .single();

  if (!reg || reg.billed_to_profile_id !== user.id) {
    throw new Error("Inscription introuvable.");
  }
  if (reg.status === "annulee") return;

  const admin = createAdminClient();
  const { error } = await admin
    .from("registrations")
    .update({ cancel_requested_at: new Date().toISOString() })
    .eq("id", registrationId);
  if (error) throw new Error(error.message);

  // Notifie les administrateurs (indispensable).
  try {
    const to = await adminEmails();
    if (to.length > 0) {
      const pl = reg.players as unknown as {
        first_name: string;
        last_name: string;
      } | null;
      const sl = reg.slots as unknown as {
        weekday: number;
        start_time: string;
        products: { name: string } | null;
      } | null;
      const me = await getCurrentProfile();
      await sendEmail({
        to,
        ...cancellationRequestAdminMail({
          playerName: `${pl?.first_name ?? ""} ${pl?.last_name ?? ""}`.trim(),
          slotLabel: sl
            ? `${weekdayLabel(sl.weekday)} ${formatTime(sl.start_time)} — ${sl.products?.name ?? ""}`.trim()
            : "un créneau",
          requester: `${me?.first_name ?? ""} ${me?.last_name ?? ""}`.trim(),
        }),
      });
    }
  } catch {
    /* silencieux */
  }

  revalidatePath("/compte/inscriptions");
}
