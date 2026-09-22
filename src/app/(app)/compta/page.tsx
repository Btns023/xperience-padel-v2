import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { formatDate, formatEuros } from "@/lib/format";
import { ACCOUNT_LABEL, needsPiece, type LedgerAccount } from "@/lib/ledger";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { loadCategories, loadEntries, loadYears, pickYear } from "./data";

export const metadata = { title: "Journal financier" };

type Search = {
  annee?: string;
  sens?: string;
  categorie?: string;
  compte?: string;
  q?: string;
};

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const profile = await requireRole(["admin", "comptable"]);
  const isAdmin = profile.role === "admin";
  const sp = await searchParams;
  const supabase = await createClient();

  const years = await loadYears(supabase);
  const year = pickYear(years, sp.annee);
  const [categories, all] = await Promise.all([
    loadCategories(supabase),
    loadEntries(supabase, year),
  ]);
  const catLabel = new Map(categories.map((c) => [c.code, c.label]));

  const q = (sp.q ?? "").trim().toLowerCase();
  const entries = all.filter(
    (e) =>
      (!sp.sens ||
        (sp.sens === "recette" ? e.amount_cents > 0 : e.amount_cents < 0)) &&
      (!sp.categorie ||
        (sp.categorie === "_aucune"
          ? !e.category_code
          : e.category_code === sp.categorie)) &&
      (!sp.compte || e.account === sp.compte) &&
      (!q ||
        e.description.toLowerCase().includes(q) ||
        (e.counterparty ?? "").toLowerCase().includes(q) ||
        (e.piece_number ?? "").toLowerCase().includes(q)),
  );

  const recettes = all.filter((e) => e.amount_cents > 0).reduce((s, e) => s + e.amount_cents, 0);
  const depenses = -all.filter((e) => e.amount_cents < 0).reduce((s, e) => s + e.amount_cents, 0);
  const aClasser = all.filter((e) => !e.category_code).length;
  const sansPiece = all.filter((e) => needsPiece(e) && e.attachment_count === 0).length;
  const filtered = entries.length !== all.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Journal financier {year}
          </h1>
          <p className="text-muted-foreground">
            Toutes les recettes et dépenses de l&apos;ASBL, avec leurs pièces.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/compta/export?annee=${year}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Exporter en Excel
          </a>
          {isAdmin ? (
            <>
              <Link
                href="/compta/ecritures/nouvelle?sens=depense"
                className={buttonVariants({ size: "sm" })}
              >
                + Dépense
              </Link>
              <Link
                href="/compta/ecritures/nouvelle?sens=recette"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                + Recette
              </Link>
            </>
          ) : null}
        </div>
      </div>

      {years.length > 1 ? (
        <div className="flex flex-wrap gap-1">
          {years.map((y) => (
            <Link
              key={y}
              href={`/compta?annee=${y}`}
              className={buttonVariants({
                variant: y === year ? "default" : "ghost",
                size: "sm",
              })}
            >
              {y}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Recettes" value={formatEuros(recettes)} tone="text-emerald-700 dark:text-emerald-400" />
        <Stat label="Dépenses" value={formatEuros(depenses)} tone="text-red-700 dark:text-red-400" />
        <Stat label="Solde" value={formatEuros(recettes - depenses)} />
      </div>

      {aClasser > 0 || sansPiece > 0 ? (
        <div className="flex flex-wrap gap-2 text-sm">
          {aClasser > 0 ? (
            <Link
              href={`/compta?annee=${year}&categorie=_aucune`}
              className="rounded-md border border-amber-400 bg-amber-50 px-3 py-1.5 dark:border-amber-500/50 dark:bg-amber-500/10"
            >
              {aClasser} opération{aClasser > 1 ? "s" : ""} à classer →
            </Link>
          ) : null}
          {sansPiece > 0 ? (
            <Link
              href={`/compta/pieces-manquantes?annee=${year}`}
              className="rounded-md border border-amber-400 bg-amber-50 px-3 py-1.5 dark:border-amber-500/50 dark:bg-amber-500/10"
            >
              {sansPiece} dépense{sansPiece > 1 ? "s" : ""} sans pièce justificative →
            </Link>
          ) : null}
        </div>
      ) : null}

      {/* Filtres : simple formulaire GET, partageable par lien */}
      <form className="flex flex-wrap items-end gap-2 rounded-lg border p-3 text-sm">
        <input type="hidden" name="annee" value={year} />
        <Filter label="Sens" name="sens" value={sp.sens}>
          <option value="">Tout</option>
          <option value="recette">Recettes</option>
          <option value="depense">Dépenses</option>
        </Filter>
        <Filter label="Catégorie" name="categorie" value={sp.categorie}>
          <option value="">Toutes</option>
          <option value="_aucune">— À classer —</option>
          {categories.map((c) => (
            <option key={c.code} value={c.code}>
              {c.direction === "recette" ? "Recette" : "Dépense"} · {c.label}
            </option>
          ))}
        </Filter>
        <Filter label="Compte" name="compte" value={sp.compte}>
          <option value="">Tous</option>
          {(Object.keys(ACCOUNT_LABEL) as LedgerAccount[]).map((a) => (
            <option key={a} value={a}>
              {ACCOUNT_LABEL[a]}
            </option>
          ))}
        </Filter>
        <label className="flex min-w-40 flex-1 flex-col gap-1">
          <span className="text-xs text-muted-foreground">Recherche</span>
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Nom, libellé, n° de pièce…"
            className="h-8 rounded-md border bg-background px-2"
          />
        </label>
        <button type="submit" className={buttonVariants({ size: "sm" })}>
          Filtrer
        </button>
        {filtered ? (
          <Link
            href={`/compta?annee=${year}`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Effacer
          </Link>
        ) : null}
      </form>

      <p className="text-sm text-muted-foreground">
        {entries.length} opération{entries.length > 1 ? "s" : ""}
        {filtered
          ? ` · ${formatEuros(entries.reduce((s, e) => s + e.amount_cents, 0))} au total`
          : ""}
      </p>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune opération.</p>
      ) : (
        <ul className="flex flex-col divide-y rounded-lg border">
          {entries.map((e) => (
            <li key={e.id}>
              <Link
                href={`/compta/ecritures/${e.id}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
              >
                <span className="w-24 shrink-0 tabular-nums text-muted-foreground">
                  {formatDate(e.operation_date)}
                </span>
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <span className="truncate font-medium">{e.description}</span>
                  {e.category_code ? (
                    <Badge variant="secondary">{catLabel.get(e.category_code)}</Badge>
                  ) : (
                    <Badge className="border-transparent bg-amber-500/15 text-amber-800 dark:text-amber-300">
                      à classer
                    </Badge>
                  )}
                  {e.piece_number ? (
                    <Badge variant="outline">{e.piece_number}</Badge>
                  ) : null}
                  {e.attachment_count > 0 ? (
                    <Badge variant="outline">📎 {e.attachment_count}</Badge>
                  ) : needsPiece(e) ? (
                    <Badge className="border-transparent bg-amber-500/15 text-amber-800 dark:text-amber-300">
                      sans pièce
                    </Badge>
                  ) : null}
                  {e.account !== "banque" ? (
                    <Badge variant="outline">{ACCOUNT_LABEL[e.account]}</Badge>
                  ) : null}
                </span>
                <span
                  className={`shrink-0 font-medium tabular-nums ${
                    e.amount_cents > 0
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {e.amount_cents > 0 ? "+" : "−"}
                  {formatEuros(Math.abs(e.amount_cents))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${tone}`}>{value}</div>
    </div>
  );
}

function Filter({
  label,
  name,
  value,
  children,
}: {
  label: string;
  name: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="h-8 rounded-md border bg-background px-2"
      >
        {children}
      </select>
    </label>
  );
}
