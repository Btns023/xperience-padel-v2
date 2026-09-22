import type { SupabaseClient } from "@supabase/supabase-js";
import type { LedgerCategory, LedgerEntry } from "@/lib/ledger";

/** Chargements communs aux pages de la comptabilité (RLS : admin + comptable). */

export async function loadCategories(
  supabase: SupabaseClient,
): Promise<LedgerCategory[]> {
  const { data } = await supabase
    .from("ledger_categories")
    .select("code, direction, label, annex_post, position")
    .eq("active", true)
    .order("position");
  return (data ?? []) as LedgerCategory[];
}

export type EntryRow = LedgerEntry & { attachment_count: number };

export async function loadEntries(
  supabase: SupabaseClient,
  year: number,
): Promise<EntryRow[]> {
  const { data } = await supabase
    .from("ledger_entries")
    .select(
      "id, account, fiscal_year, operation_date, statement_seq, description, counterparty, communication, amount_cents, category_code, piece_number, invoice_id, source, notes, ledger_attachments(count)",
    )
    .eq("fiscal_year", year)
    .order("operation_date", { ascending: false })
    .order("created_at", { ascending: false });
  return ((data ?? []) as unknown as (LedgerEntry & {
    ledger_attachments: { count: number }[];
  })[]).map(({ ledger_attachments, ...e }) => ({
    ...e,
    attachment_count: ledger_attachments?.[0]?.count ?? 0,
  }));
}

/** Exercices disponibles, du plus récent au plus ancien (au moins l'année en cours). */
export async function loadYears(supabase: SupabaseClient): Promise<number[]> {
  const { data } = await supabase
    .from("ledger_entries")
    .select("fiscal_year")
    .order("fiscal_year", { ascending: false });
  const years = new Set<number>((data ?? []).map((r) => r.fiscal_year as number));
  years.add(new Date().getFullYear());
  return [...years].sort((a, b) => b - a);
}

export function pickYear(years: number[], requested?: string): number {
  const n = Number(requested);
  return years.includes(n) ? n : years[0];
}
