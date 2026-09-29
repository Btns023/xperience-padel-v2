/**
 * Congés scolaires de la Fédération Wallonie-Bruxelles, année 2026-2027.
 *
 * Règle de l'académie : **pas de cours pendant les congés scolaires**. Elle
 * n'est énoncée qu'à un seul endroit du site, la page « Calendrier & tarifs »,
 * et les autres pages y renvoient — sinon elle se répète partout et finit par
 * diverger.
 *
 * Les bornes reprennent le découpage officiel, qui court du lundi au dimanche
 * inclus : un cours du samedi tombant dans ces deux semaines ne se donne donc
 * pas non plus.
 *
 * Source : enseignement.be — calendrier scolaire 2026-2027.
 */

export type Conge = {
  nom: string;
  /** Premier jour sans cours (AAAA-MM-JJ). */
  debut: string;
  /** Dernier jour sans cours, inclus. */
  fin: string;
};

export const CONGES_2026_2027: Conge[] = [
  { nom: "Congé d'automne", debut: "2026-10-19", fin: "2026-11-01" },
  { nom: "Vacances d'hiver", debut: "2026-12-21", fin: "2027-01-03" },
  { nom: "Congé de détente", debut: "2027-02-22", fin: "2027-03-07" },
  { nom: "Vacances de printemps", debut: "2027-04-26", fin: "2027-05-09" },
];

/** Premier jour des vacances d'été 2027 : la saison s'arrête avant. */
export const DEBUT_VACANCES_ETE = "2027-07-03";

/** Le congé qui couvre cette date (AAAA-MM-JJ), s'il y en a un. */
export function congeDu(iso: string): Conge | undefined {
  return CONGES_2026_2027.find((c) => iso >= c.debut && iso <= c.fin);
}

const JOUR_MOIS = new Intl.DateTimeFormat("fr-BE", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** « du 19 octobre au 1er novembre 2026 ». */
export function periodeLabel(c: Conge): string {
  const debut = new Date(`${c.debut}T00:00:00Z`);
  const fin = new Date(`${c.fin}T00:00:00Z`);
  const meme = debut.getUTCFullYear() === fin.getUTCFullYear();
  const jour = (d: Date) => JOUR_MOIS.format(d).replace(/^1 /, "1er ");
  return meme
    ? `du ${jour(debut)} au ${jour(fin)} ${fin.getUTCFullYear()}`
    : `du ${jour(debut)} ${debut.getUTCFullYear()} au ${jour(fin)} ${fin.getUTCFullYear()}`;
}
