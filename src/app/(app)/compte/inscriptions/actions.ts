"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireUser, getCurrentProfile } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import {
  cancellationRequestAdminMail,
  extensionAdminMail,
} from "@/lib/emails";
import { adminEmails } from "@/lib/recipients";
import { weekdayLabel, formatTime, formatEuros } from "@/lib/format";
import { engagementRange } from "@/lib/engagement";
import { extendRegistration } from "@/lib/extension";

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

export type ExtendState = { error?: string; ok?: string };

/** Le payeur prolonge le cycle d'un joueur (ex. 9 → 18 cours). */
export async function extendMyRegistration(
  registrationId: string,
  _prev: ExtendState,
  formData: FormData,
): Promise<ExtendState> {
  const user = await requireUser();
  const newCount = Number(formData.get("count"));
  if (!Number.isInteger(newCount) || newCount <= 0) {
    return { error: "Choisis une durée." };
  }

  const supabase = await createClient();
  const { data: reg } = await supabase
    .from("registrations")
    .select(
      "id, billed_to_profile_id, first_session, session_count, players(first_name,last_name), slots(weekday,start_time,session_count,products(name))",
    )
    .eq("id", registrationId)
    .single();
  if (!reg || reg.billed_to_profile_id !== user.id) {
    return { error: "Inscription introuvable." };
  }
  const sl = reg.slots as unknown as {
    weekday: number;
    start_time: string;
    session_count: number;
    products: { name: string } | null;
  } | null;
  const from = sl ? engagementRange(reg, sl.session_count).count : 0;

  const res = await extendRegistration(registrationId, newCount, {
    enforceCapacity: true,
  });
  if (res.error) return { error: res.error };

  // Prévient l'académie (indispensable : une facture est peut-être à émettre).
  try {
    const to = await adminEmails();
    if (to.length > 0) {
      const pl = reg.players as unknown as {
        first_name: string;
        last_name: string;
      } | null;
      await sendEmail({
        to,
        ...extensionAdminMail({
          playerName: `${pl?.first_name ?? ""} ${pl?.last_name ?? ""}`.trim(),
          slotLabel: sl
            ? `${weekdayLabel(sl.weekday)} ${formatTime(sl.start_time)} — ${sl.products?.name ?? ""}`.trim()
            : "un créneau",
          from,
          to: newCount,
          extraCents: res.extraCents ?? 0,
          invoiced: !!res.invoiceId,
        }),
      });
    }
  } catch {
    /* silencieux */
  }

  revalidatePath("/compte/inscriptions");
  revalidatePath("/admin/factures");
  return {
    ok:
      `Prolongation enregistrée : ${newCount} cours.` +
      (res.invoiceId && res.extraCents
        ? ` Une facture complémentaire de ${formatEuros(res.extraCents)} te sera envoyée.`
        : ""),
  };
}
