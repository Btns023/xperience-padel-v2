import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { formatEuros } from "@/lib/format";
import { computeAnnexB, type AnnexLine } from "@/lib/ledger";
import { buttonVariants } from "@/components/ui/button";
import { loadCategories, loadEntries, loadYears, pickYear } from "../data";

export const metadata = { title: "Annexe B" };

/** État des recettes et des dépenses, au format des comptes annuels d'ASBL. */
export default async function AnnexeBPage({
  searchParams,
}: {
  searchParams: Promise<{ annee?: string }>;
}) {
  await requireRole(["admin", "comptable"]);
  const { annee } = await searchParams;
  const supabase = await createClient();
  const years = await loadYears(supabase);
  const year = pickYear(years, annee);
  const [entries, categories] = await Promise.all([
    loadEntries(supabase, year),
    loadCategories(supabase),
  ]);
  const a = computeAnnexB(entries, categories);
  const result = a.totalRecettesCents - a.totalDepensesCents;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Annexe B — exercice {year}
          </h1>
          <p className="text-muted-foreground">
            État des recettes et des dépenses, calculé à partir du journal.
          </p>
        </div>
        <a
          href={`/compta/export?annee=${year}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Exporter en Excel
        </a>
      </div>

      {years.length > 1 ? (
        <div className="flex flex-wrap gap-1">
          {years.map((y) => (
            <Link
              key={y}
              href={`/compta/annexe-b?annee=${y}`}
              className={buttonVariants({ variant: y === year ? "default" : "ghost", size: "sm" })}
            >
              {y}
            </Link>
          ))}
        </div>
      ) : null}

      {a.unclassified.count > 0 ? (
        <Link
          href={`/compta?annee=${year}&categorie=_aucune`}
          className="rounded-md border border-amber-400 bg-amber-50 px-3 py-2 text-sm dark:border-amber-500/50 dark:bg-amber-500/10"
        >
          ⚠ {a.unclassified.count} opération{a.unclassified.count > 1 ? "s" : ""} non classée
          {a.unclassified.count > 1 ? "s" : ""} ({formatEuros(Math.abs(a.unclassified.cents))}) :
          elles ne figurent pas encore dans l&apos;Annexe B. Les classer →
        </Link>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Column title="Dépenses" lines={a.depenses} total={a.totalDepensesCents} />
        <Column title="Recettes" lines={a.recettes} total={a.totalRecettesCents} />
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border p-4">
        <span className="font-medium">
          {result >= 0 ? "Excédent de l'exercice" : "Déficit de l'exercice"}
        </span>
        <span
          className={`text-xl font-semibold tabular-nums ${
            result >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
          }`}
        >
          {formatEuros(result)}
        </span>
      </div>
      {a.transfersCents !== 0 ? (
        <p className="text-xs text-muted-foreground">
          Virements internes (entre comptes de l&apos;ASBL), exclus de l&apos;Annexe B :{" "}
          {formatEuros(a.transfersCents)}.
        </p>
      ) : null}
    </div>
  );
}

function Column({ title, lines, total }: { title: string; lines: AnnexLine[]; total: number }) {
  return (
    <div className="flex flex-col rounded-lg border">
      <div className="border-b px-4 py-2.5 text-sm font-semibold">{title}</div>
      <ul className="flex flex-1 flex-col divide-y text-sm">
        {lines.map((l) => (
          <li key={l.post} className="px-4 py-2.5">
            <div className="flex justify-between gap-3">
              <span className="font-medium">{l.post}</span>
              <span className="tabular-nums">{formatEuros(l.totalCents)}</span>
            </div>
            {l.details.length > 0 ? (
              <ul className="mt-1 flex flex-col gap-0.5 text-muted-foreground">
                {l.details.map((d) => (
                  <li key={d.label} className="flex justify-between gap-3 pl-3">
                    <span>– {d.label}</span>
                    <span className="tabular-nums">{formatEuros(d.totalCents)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="flex justify-between gap-3 border-t px-4 py-2.5 text-sm font-semibold">
        <span>Total des {title.toLowerCase()}</span>
        <span className="tabular-nums">{formatEuros(total)}</span>
      </div>
    </div>
  );
}
