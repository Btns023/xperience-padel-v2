/**
 * Types applicatifs partagés.
 *
 * À terme, les types de base de données seront générés automatiquement avec :
 *   pnpm supabase gen types typescript --linked > src/lib/database.types.ts
 * Ce fichier ne conserve alors que les alias métier.
 */

export type AppRole = "client" | "coach" | "admin";

export interface Profile {
  id: string;
  role: AppRole;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address_line: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  notif_prefs: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}
