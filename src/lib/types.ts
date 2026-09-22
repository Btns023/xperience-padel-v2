/**
 * Types applicatifs partagés.
 *
 * À terme, les types de base de données seront générés automatiquement avec :
 *   pnpm supabase gen types typescript --linked > src/lib/database.types.ts
 * Ce fichier ne conserve alors que les alias métier.
 */

export type AppRole = "client" | "coach" | "admin" | "comptable";

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
  /** Acceptation des conditions d'inscription et de confidentialité. */
  terms_accepted_at: string | null;
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
  /** Effectif minimum par période ; en dessous, alerte « groupe trop petit ». */
  min_capacity: number | null;
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

// --- Lot 2 : joueurs, entreprises, inscriptions ----------------------

export type InvitationStatus = "none" | "pending" | "accepted";

export type RegistrationStatus =
  | "demande_recue"
  | "groupe_constitue"
  | "validee"
  | "facturee"
  | "payee"
  | "annulee";

export interface Organization {
  id: string;
  owner_id: string;
  name: string;
  address: string | null;
  vat_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  managed_by: string;
  profile_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  birthdate: string;
  level_code: string;
  image_consent: boolean;
  invitation_status: InvitationStatus;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  player_id: string;
  slot_id: string;
  season_id: string;
  status: RegistrationStatus;
  billed_to_profile_id: string;
  billed_to_org_id: string | null;
  level_mismatch: boolean;
  late_cancellation: boolean;
  promo_code: string | null;
  prorata_sessions: number | null;
  /** N° de la 1re séance suivie dans le cycle du créneau (1 = début). */
  first_session: number;
  /** Séances suivies à partir de first_session ; null = jusqu'à la fin. */
  session_count: number | null;
  extension_offer_sent_at: string | null;
  notes: string | null;
  cancel_requested_at: string | null;
  requested_at: string;
  created_at: string;
  updated_at: string;
}

export const REGISTRATION_STATUS_LABEL: Record<RegistrationStatus, string> = {
  demande_recue: "Demande reçue",
  groupe_constitue: "Groupe constitué",
  validee: "Validée",
  facturee: "Facturée",
  payee: "Payée",
  annulee: "Annulée",
};

export type GroupStatus = "forming" | "confirmed";

export interface Group {
  id: string;
  slot_id: string;
  label: string | null;
  size: number | null;
  status: GroupStatus;
  coach_id: string | null;
  starts_on: string | null;
  confirmed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const GROUP_STATUS_LABEL: Record<GroupStatus, string> = {
  forming: "En constitution",
  confirmed: "Confirmé",
};

// --- Lot 4 : facturation --------------------------------------------

export type InvoiceKind = "invoice" | "credit_note";
export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled";

export interface AppSettings {
  id: string;
  issuer_name: string;
  issuer_legal_name: string;
  issuer_address: string;
  issuer_bce: string;
  issuer_iban: string;
  issuer_bic: string;
  issuer_phone: string;
  issuer_email: string;
  issuer_bank: string;
  logo_data_uri: string | null;
  vat_note: string;
  footer_legal: string;
  cgv_note: string;
  invoice_prefix: string;
  credit_note_prefix: string;
  payment_terms_days: number;
  updated_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  amount_cents: number;
  product_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  kind: InvoiceKind;
  number: string | null;
  status: InvoiceStatus;
  issued_on: string;
  billed_to_profile_id: string;
  billed_to_org_id: string | null;
  group_id: string | null;
  season_id: string | null;
  parent_invoice_id: string | null;
  due_on: string | null;
  issuer_snapshot: Record<string, string>;
  recipient_snapshot: Record<string, string>;
  vat_note: string;
  structured_comm: string | null;
  total_cents: number;
  notes: string | null;
  sent_at: string | null;
  paid_at: string | null;
  dunning_paused: boolean;
  dunning_count: number;
  last_dunned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount_cents: number;
  paid_on: string;
  method: string;
  reference: string | null;
  note: string | null;
  recorded_by: string | null;
  created_at: string;
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  registration_id: string | null;
  description: string;
  quantity: number;
  unit_price_cents: number;
  discount_cents: number;
  promo_code: string | null;
  amount_cents: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyée",
  paid: "Payée",
  cancelled: "Annulée",
};

export const INVOICE_KIND_LABEL: Record<InvoiceKind, string> = {
  invoice: "Facture",
  credit_note: "Note de crédit",
};
