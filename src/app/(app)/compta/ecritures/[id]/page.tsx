import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { formatDate, formatEuros } from "@/lib/format";
import { ACCOUNT_LABEL, needsPiece, type LedgerEntry } from "@/lib/ledger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadCategories } from "../../data";
import { deleteAttachment, deleteEntry } from "../../actions";
import { EntryForm } from "../entry-form";
import { PieceUpload } from "../piece-upload";

export const metadata = { title: "Opération" };

type Attachment = {
  id: string;
  file_name: string;
  size_bytes: number | null;
  created_at: string;
};

export default async function EntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cree?: string }>;
}) {
  const profile = await requireRole(["admin", "comptable"]);
  const isAdmin = profile.role === "admin";
  const { id } = await params;
  const { cree } = await searchParams;
  const supabase = await createClient();

  const [{ data: entryData }, { data: attData }, categories] = await Promise.all([
    supabase
      .from("ledger_entries")
      .select(
        "id, account, fiscal_year, operation_date, statement_seq, description, counterparty, communication, amount_cents, category_code, piece_number, invoice_id, source, notes, invoices(number)",
      )
      .eq("id", id)
      .single(),
    supabase
      .from("ledger_attachments")
      .select("id, file_name, size_bytes, created_at")
      .eq("entry_id", id)
      .order("created_at"),
    loadCategories(supabase),
  ]);
  if (!entryData) notFound();
  const entry = entryData as unknown as LedgerEntry & {
    invoices: { number: string | null } | null;
  };
  const attachments = (attData ?? []) as Attachment[];
  const category = categories.find((c) => c.code === entry.category_code);
  const isExpense = entry.amount_cents < 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/compta?annee=${entry.fiscal_year}`}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Journal {entry.fiscal_year}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {entry.description}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span
            className={`font-semibold tabular-nums ${
              isExpense
                ? "text-red-700 dark:text-red-400"
                : "text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {isExpense ? "−" : "+"}
            {formatEuros(Math.abs(entry.amount_cents))}
          </span>
          <span className="text-muted-foreground">
            · {formatDate(entry.operation_date)} · {ACCOUNT_LABEL[entry.account]}
          </span>
          {entry.piece_number ? <Badge variant="outline">{entry.piece_number}</Badge> : null}
          {entry.invoices?.number ? (
            <Badge variant="secondary">Facture {entry.invoices.number}</Badge>
          ) : null}
          {entry.source === "classeur" ? (
            <Badge variant="outline">repris du classeur 2026</Badge>
          ) : null}
        </div>
      </div>

      {cree ? (
        <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          Opération créée. {isExpense ? "Joins maintenant la pièce justificative ci-dessous." : ""}
        </p>
      ) : null}

      {/* Pièces justificatives */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">
          Pièces justificatives ({attachments.length})
        </h2>
        {attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {needsPiece(entry)
              ? "Aucune pièce : cette dépense apparaît dans les pièces manquantes."
              : "Aucune pièce jointe."}
          </p>
        ) : (
          <ul className="flex flex-col divide-y rounded-lg border">
            {attachments.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <a
                  href={`/compta/piece/${a.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 truncate font-medium underline-offset-4 hover:underline"
                >
                  📎 {a.file_name}
                </a>
                <span className="flex items-center gap-3 text-xs text-muted-foreground">
                  {a.size_bytes ? `${Math.max(1, Math.round(a.size_bytes / 1024))} Ko` : ""}
                  {isAdmin ? (
                    <form action={deleteAttachment.bind(null, entry.id, a.id)}>
                      <button type="submit" className="text-destructive underline-offset-4 hover:underline">
                        Retirer
                      </button>
                    </form>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}
        {isAdmin ? <PieceUpload entryId={entry.id} year={entry.fiscal_year} /> : null}
      </section>

      {isAdmin ? (
        <section className="flex flex-col gap-3 border-t pt-6">
          <h2 className="text-sm font-medium">Modifier</h2>
          <EntryForm
            key={`${entry.id}:${entry.amount_cents}:${entry.category_code}`}
            id={entry.id}
            categories={categories}
            values={{
              account: entry.account,
              operation_date: entry.operation_date,
              sens: isExpense ? "depense" : "recette",
              montant: (Math.abs(entry.amount_cents) / 100).toFixed(2).replace(".", ","),
              description: entry.description,
              category_code: entry.category_code ?? "",
              counterparty: entry.counterparty ?? "",
              communication: entry.communication ?? "",
              notes: entry.notes ?? "",
            }}
          />
          <form action={deleteEntry.bind(null, entry.id)} className="border-t pt-4">
            <Button type="submit" variant="ghost" size="sm" className="text-destructive">
              Supprimer cette opération
            </Button>
          </form>
        </section>
      ) : (
        <dl className="grid gap-x-6 gap-y-2 rounded-lg border p-4 text-sm sm:grid-cols-[10rem_1fr]">
          <dt className="text-muted-foreground">Catégorie</dt>
          <dd>{category ? `${category.label}${category.annex_post ? ` — ${category.annex_post}` : ""}` : "À classer"}</dd>
          <dt className="text-muted-foreground">{isExpense ? "Fournisseur" : "Payeur"}</dt>
          <dd>{entry.counterparty ?? "—"}</dd>
          <dt className="text-muted-foreground">Communication</dt>
          <dd>{entry.communication ?? "—"}</dd>
          <dt className="text-muted-foreground">Note</dt>
          <dd>{entry.notes ?? "—"}</dd>
        </dl>
      )}
    </div>
  );
}
