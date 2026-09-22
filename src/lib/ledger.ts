/**
 * Comptabilité simplifiée des petites ASBL : journal financier et Annexe B.
 * Module sans dépendance serveur.
 */

export type LedgerDirection = "recette" | "depense";
export type LedgerAccount = "banque" | "caisse" | "epargne";

export type LedgerCategory = {
  code: string;
  direction: LedgerDirection;
  label: string;
  /** Poste de l'Annexe B ; null pour les virements internes. */
  annex_post: string | null;
  position: number;
};

export type LedgerEntry = {
  id: string;
  account: LedgerAccount;
  fiscal_year: number;
  operation_date: string;
  /** N° de suite de l'extrait bancaire. */
  statement_seq: string | null;
  description: string;
  counterparty: string | null;
  communication: string | null;
  /** Signé : positif = recette, négatif = dépense. */
  amount_cents: number;
  category_code: string | null;
  piece_number: string | null;
  invoice_id: string | null;
  source: string;
  notes: string | null;
};

export const ACCOUNT_LABEL: Record<LedgerAccount, string> = {
  banque: "Banque BNP",
  caisse: "Caisse",
  epargne: "Compte d'épargne",
};

/** Ordre des postes, tel que dans l'Annexe B légale. */
export const ANNEX_POSTS: Record<LedgerDirection, string[]> = {
  depense: [
    "Marchandises et services",
    "Rémunérations",
    "Services et biens divers",
    "Autres dépenses",
  ],
  recette: ["Cotisations", "Dons et legs", "Subsides", "Autres recettes"],
};

export type AnnexLine = {
  post: string;
  totalCents: number;
  details: { label: string; totalCents: number }[];
};

export type AnnexB = {
  depenses: AnnexLine[];
  recettes: AnnexLine[];
  totalDepensesCents: number;
  totalRecettesCents: number;
  /** Écritures sans catégorie : à classer avant de clôturer. */
  unclassified: { count: number; cents: number };
  /** Virements internes, exclus de l'Annexe B. */
  transfersCents: number;
};

/**
 * État des recettes et des dépenses (Annexe B) d'un ensemble d'écritures.
 * Les virements internes sont exclus : l'argent ne fait que changer de compte.
 */
export function computeAnnexB(
  entries: Pick<LedgerEntry, "amount_cents" | "category_code">[],
  categories: LedgerCategory[],
): AnnexB {
  const byCode = new Map(categories.map((c) => [c.code, c]));
  const catTotals = new Map<string, number>();
  let unclassified = { count: 0, cents: 0 };
  let transfersCents = 0;

  for (const e of entries) {
    const cat = e.category_code ? byCode.get(e.category_code) : undefined;
    if (!cat) {
      unclassified = {
        count: unclassified.count + 1,
        cents: unclassified.cents + e.amount_cents,
      };
      continue;
    }
    if (!cat.annex_post) {
      transfersCents += e.amount_cents;
      continue;
    }
    catTotals.set(cat.code, (catTotals.get(cat.code) ?? 0) + Math.abs(e.amount_cents));
  }

  const build = (direction: LedgerDirection): AnnexLine[] =>
    ANNEX_POSTS[direction].map((post) => {
      const cats = categories
        .filter((c) => c.direction === direction && c.annex_post === post)
        .sort((a, b) => a.position - b.position);
      const details = cats.map((c) => ({
        label: c.label,
        totalCents: catTotals.get(c.code) ?? 0,
      }));
      return {
        post,
        totalCents: details.reduce((s, d) => s + d.totalCents, 0),
        // Un poste à une seule catégorie homonyme n'a pas besoin de détail.
        details: details.length === 1 && details[0].label === post ? [] : details,
      };
    });

  const depenses = build("depense");
  const recettes = build("recette");
  return {
    depenses,
    recettes,
    totalDepensesCents: depenses.reduce((s, l) => s + l.totalCents, 0),
    totalRecettesCents: recettes.reduce((s, l) => s + l.totalCents, 0),
    unclassified,
    transfersCents,
  };
}

/** Une dépense a-t-elle besoin d'une pièce justificative ? */
export function needsPiece(e: Pick<LedgerEntry, "amount_cents" | "category_code">) {
  return e.amount_cents < 0 && !e.category_code?.startsWith("virement_interne");
}
