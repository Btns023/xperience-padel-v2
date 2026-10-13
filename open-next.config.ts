import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Adaptation de Next.js pour Cloudflare Workers.
 *
 * Configuration volontairement nue : pas de cache incrémental ni de file
 * d'attente externe, l'application rend ses pages à la demande et lit tout
 * dans Supabase. On n'ajoutera un cache que si une page le réclame.
 */
export default defineCloudflareConfig();
