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

// --- Lot 1 : catalogue -------------------------------------------------

export type SeasonStatus = "draft" | "active" | "archived";

export type ProductCategory =
  | "cycle_adulte"
  | "cycle_enfant"
  | "stage"
  | "ete_indien"
  | "cours_prive";

export type PricingModel =
  | "per_group_size"
  | "per_duration"
  | "unit"
  | "flat";

export type PriceTierKind = "group_size" | "duration" | "unit" | "flat";

export type SlotStatus = "draft" | "open" | "closed";

export interface PadelLevel {
  code: string;
  label: string;
  rank: number;
}

export interface Location {
  id: string;
  name: string;
  address: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  profile_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: string;
  name: string;
  starts_on: string;
  ends_on: string;
  status: SeasonStatus;
  registration_opens_on: string | null;
  registration_closes_on: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  pricing_model: PricingModel;
  default_session_count: number | null;
  default_session_minutes: number;
  description: string | null;
  active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface PriceTier {
  id: string;
  product_id: string;
  kind: PriceTierKind;
  group_size: number | null;
  session_count: number | null;
  duration_minutes: number | null;
  variant: string | null;
  label: string;
  amount_cents: number;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Slot {
  id: string;
  season_id: string;
  product_id: string;
  location_id: string | null;
  coach_id: string | null;
  weekday: number;
  start_time: string;
  duration_minutes: number;
  session_count: number;
  starts_on: string | null;
  capacity: number;
  min_level_code: string | null;
  max_level_code: string | null;
  level_note: string | null;
  status: SlotStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const SEASON_STATUS_LABEL: Record<SeasonStatus, string> = {
  draft: "Brouillon",
  active: "Active",
  archived: "Archivée",
};

export const PRODUCT_CATEGORY_LABEL: Record<ProductCategory, string> = {
  cycle_adulte: "Cycle adultes",
  cycle_enfant: "Cycle enfants",
  stage: "Stage",
  ete_indien: "Été indien",
  cours_prive: "Cours privés",
};

export const PRICING_MODEL_LABEL: Record<PricingModel, string> = {
  per_group_size: "Selon l'effectif du groupe",
  per_duration: "Selon la durée du cycle",
  unit: "Prix unitaire",
  flat: "Forfait unique",
};

export const SLOT_STATUS_LABEL: Record<SlotStatus, string> = {
  draft: "Brouillon",
  open: "Ouvert",
  closed: "Fermé",
};
