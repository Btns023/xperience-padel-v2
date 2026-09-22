"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { parseEurosToCents } from "@/lib/format";
import { needsPiece } from "@/lib/ledger";

export type EntryState = { error?: string; ok?: boolean };

const schema = z.object({
  account: z.enum(["banque", "caisse", "epargne"]),
  operation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  sens: z.enum(["recette", "depense"]),
  montant: z.string().trim().min(1, "Montant requis"),
  description: z.string().trim().min(2, "Libellé requis"),
  category_code: z.string().trim(),
  counterparty: z.string().trim(),
  communication: z.string().trim(),
  notes: z.string().trim(),
});

function refresh(id?: string) {
  revalidatePath("/compta", "layout");
  if (id) revalidatePath(`/compta/ecritures/${id}`);
}

/** Crée (id null) ou met à jour une opération du journal. */
export async function saveEntry(
  id: string | null,
  _prev: EntryState,
  formData: FormData,
): Promise<EntryState> {
  const profile = await requireRole("admin");
  const parsed = schema.safeParse(Object.fromEntries(
    ["account", "operation_date", "sens", "montant", "description", "category_code", "counterparty", "communication", "notes"]
      .map((k) => [k, String(formData.get(k) ?? "")]),
  ));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }
  const d = parsed.data;

  const cents = parseEurosToCents(d.montant);
  if (!cents) return { error: "Montant invalide (ex. 125,50)." };

  const supabase = await createClient();
  if (d.category_code) {
    const { data: cat } = await supabase
      .from("ledger_categories")
      .select("direction")
      .eq("code", d.category_code)
      .single();
    if (!cat || cat.direction !== d.sens) {
      return { error: "Cette catégorie ne correspond pas au sens (recette / dépense)." };
    }
  }

  const row = {
    account: d.account,
    fiscal_year: Number(d.operation_date.slice(0, 4)),
    operation_date: d.operation_date,
    description: d.description,
    amount_cents: d.sens === "depense" ? -cents : cents,
    category_code: d.category_code || null,
    counterparty: d.counterparty || null,
    communication: d.communication || null,
    notes: d.notes || null,
  };

  if (id) {
    const { error } = await supabase.from("ledger_entries").update(row).eq("id", id);
    if (error) return { error: error.message };
    refresh(id);
    return { ok: true };
  }

  const { data, error } = await supabase
    .from("ledger_entries")
    .insert({ ...row, source: "manuel", created_by: profile.id })
    .select("id")
    .single();
  if (error) return { error: error.message };
  refresh();
  // Direction la fiche, pour y joindre la pièce justificative.
  redirect(`/compta/ecritures/${data.id}?cree=1`);
}

export async function deleteEntry(id: string): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: files } = await supabase
    .from("ledger_attachments")
    .select("storage_path")
    .eq("entry_id", id);
  const paths = (files ?? []).map((f) => f.storage_path);
  if (paths.length > 0) await supabase.storage.from("pieces").remove(paths);
  const { error } = await supabase.from("ledger_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
  redirect("/compta");
}

/**
 * Enregistre une pièce déjà déposée dans le bucket par le navigateur.
 * Première pièce d'une dépense : attribue le numéro suivant (PJ 2026-002…).
 */
export async function registerAttachment(
  entryId: string,
  file: { path: string; name: string; type: string; size: number },
): Promise<{ error?: string }> {
  const profile = await requireRole("admin");
  const supabase = await createClient();

  const { data: entry } = await supabase
    .from("ledger_entries")
    .select("id, fiscal_year, amount_cents, category_code, piece_number")
    .eq("id", entryId)
    .single();
  if (!entry) return { error: "Opération introuvable." };
  if (!file.path.startsWith(`${entry.fiscal_year}/${entryId}/`)) {
    return { error: "Emplacement de fichier inattendu." };
  }

  const { error } = await supabase.from("ledger_attachments").insert({
    entry_id: entryId,
    storage_path: file.path,
    file_name: file.name,
    mime_type: file.type || null,
    size_bytes: file.size,
    uploaded_by: profile.id,
  });
  if (error) return { error: error.message };

  if (!entry.piece_number && needsPiece(entry)) {
    const { data: n } = await supabase.rpc("next_piece_number", {
      p_year: entry.fiscal_year,
    });
    if (n) {
      await supabase.from("ledger_entries").update({ piece_number: n }).eq("id", entryId);
    }
  }

  refresh(entryId);
  return {};
}

export async function deleteAttachment(
  entryId: string,
  attachmentId: string,
): Promise<void> {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: att } = await supabase
    .from("ledger_attachments")
    .select("storage_path")
    .eq("id", attachmentId)
    .single();
  if (att) await supabase.storage.from("pieces").remove([att.storage_path]);
  await supabase.from("ledger_attachments").delete().eq("id", attachmentId);
  refresh(entryId);
}
