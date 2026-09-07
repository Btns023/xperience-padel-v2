import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { processDunning } from "@/lib/dunning";

/**
 * Relances hebdomadaires. Déclenché par Vercel Cron (voir vercel.json).
 * Protégé par CRON_SECRET (en-tête Authorization: Bearer <secret>).
 * Vercel Cron envoie cet en-tête automatiquement si la variable est définie.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  const { processed, ids } = await processDunning(supabase);
  return NextResponse.json({ ok: true, processed, ids });
}
