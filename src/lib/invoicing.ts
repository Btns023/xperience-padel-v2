import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Briques communes à la création de factures (groupe, prolongation).
 * Hors fichier "use server" : ce ne sont pas des actions appelables.
 */

export type InvoiceSettings = Record<string, string> & {
  issuer_name: string;
  issuer_legal_name: string;
  issuer_address: string;
  issuer_bce: string;
  issuer_iban: string;
  issuer_bic: string;
  vat_note: string;
  payment_terms_days: number;
};

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function loadInvoiceSettings(
  supabase: SupabaseClient,
): Promise<InvoiceSettings> {
  const { data } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", "default")
    .single();
  return data as InvoiceSettings;
}

/** Destinataire figé sur la facture : l'entreprise, sinon le particulier. */
export async function recipientSnapshot(
  supabase: SupabaseClient,
  payerId: string,
  orgId: string | null,
): Promise<Record<string, string>> {
  if (orgId) {
    const { data: org } = await supabase
      .from("organizations")
      .select("name, address, vat_number")
      .eq("id", orgId)
      .single();
    return {
      name: org?.name ?? "",
      address: org?.address ?? "",
      vat_number: org?.vat_number ?? "",
      type: "organisation",
    };
  }

  const { data: prof } = await supabase
    .from("profiles")
    .select("first_name, last_name, address_line, postal_code, city")
    .eq("id", payerId)
    .single();
  let email = "";
  try {
    const { data: u } = await createAdminClient().auth.admin.getUserById(payerId);
    email = u.user?.email ?? "";
  } catch {
    /* e-mail facultatif sur la facture */
  }
  return {
    name: `${prof?.first_name ?? ""} ${prof?.last_name ?? ""}`.trim(),
    address: [
      prof?.address_line,
      `${prof?.postal_code ?? ""} ${prof?.city ?? ""}`.trim(),
    ]
      .filter(Boolean)
      .join(", "),
    email,
    type: "particulier",
  };
}

/** Libellé de ligne : « Cycle enfants — 18 cours — Léa Dupont ». */
export function lineDescription(o: {
  productName: string | null | undefined;
  engagementCount: number | null;
  playerName: string;
}): string {
  return [
    o.productName ?? "Cours",
    o.engagementCount ? `${o.engagementCount} cours` : null,
    o.playerName || null,
  ]
    .filter(Boolean)
    .join(" — ");
}
