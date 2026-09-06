import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Proxy Next.js (ex-"middleware", renommé en Next 16).
 * Rafraîchit la session Supabase et protège les espaces authentifiés.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf :
     * - fichiers statiques Next (_next/static, _next/image)
     * - favicon, robots, sitemap
     * - fichiers avec extension (images, polices…)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
