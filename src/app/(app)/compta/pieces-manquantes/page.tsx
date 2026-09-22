import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { formatDate, formatEuros } from "@/lib/format";
import { needsPiece } from "@/lib/ledger";
import { loadCategories, loadEntries, loadYears, pickYear } from "../data";

export const metadata = { title: "Pièces manquantes" };

export default async function PiecesManquantesPage({
  searchParams,
}: {
  searchParams: Promise<{ annee?: string }>;
}) {
  const profile = await requireRole(["admin", "comptable"]);
  const { annee } = await searchParams;
  const supabase = await createClient();
  const years = await loadYears(supabase);
  const year = pickYear(years, annee);
  const [entries, categories] = await Promise.all([
    loadEntries(supabase, year),
    loadCategories(supabase),
  ]);
  const catLabel = new Map(categories.map((c) => [c.code, c.label]));
  const missing = entries.filter((e) => needsPiece(e) && e.attachment_count === 0);
  const total = -missing.reduce((s, e) => s + e.amount_cents, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Pièces manquantes {year}
        </h1>
        <p className="text-muted-foreground">
          Chaque dépense doit être justifiée par une pièce (facture du
          fournisseur, ticket, contrat).{" "}
          {profile.role === "admin"
            ? "Ouvre une ligne pour y joindre le document."
            : "L'académie les complète au fil de l'eau."}
        </p>
      </div>

      {missing.length === 0 ? (
        <p className="rounded-lg border p-4 text-sm">
          ✓ Toutes les dépenses {year} ont leur pièce justificative.
        </p>
      ) : (
        <>
          <p className="text-sm">
            <span className="font-medium">{missing.length} dépense{missing.length > 1 ? "s" : ""}</span>{" "}
            sans pièce, pour {formatEuros(total)}.
          </p>
          <ul className="flex flex-col divide-y rounded-lg border">
            {missing.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/compta/ecritures/${e.id}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                >
                  <span className="w-24 shrink-0 tabular-nums text-muted-foreground">
                    {formatDate(e.operation_date)}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{e.description}</span>
                  <span className="text-muted-foreground">
                    {e.category_code ? catLabel.get(e.category_code) : "à classer"}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-red-700 dark:text-red-400">
                    −{formatEuros(-e.amount_cents)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
