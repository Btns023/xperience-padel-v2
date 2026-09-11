import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  sendFirstSessionReminders,
  sendAdminWeeklyDigest,
  sendExtensionOffers,
} from "@/lib/reminders";

/**
 * Rappels quotidiens. Vercel Cron (voir vercel.json).
 * - rappel « 1re séance dans 3 jours » : chaque jour
 * - récap hebdo des nouvelles demandes aux admins : le lundi
 * - proposition de prolonger un cycle qui se termine dans 3 semaines
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  const sessionReminders = await sendFirstSessionReminders(supabase);
  const extensionOffers = await sendExtensionOffers(supabase);
  const digest =
    new Date().getUTCDay() === 1 ? await sendAdminWeeklyDigest(supabase) : 0;

  return NextResponse.json({
    ok: true,
    sessionReminders,
    extensionOffers,
    digest,
  });
}
