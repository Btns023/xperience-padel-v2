/**
 * Dates de rentrée de la saison, affichées sur l'accueil (calendrier)
 * et dans le guide « Trouvez votre formule ».
 * Un seul endroit à modifier d'une saison à l'autre.
 */
export const SEASON_YEAR = 2026;

export const RENTREE = {
  adultes: {
    iso: "2026-10-03",
    label: "Début le samedi 3 octobre 2026",
  },
  enfants: {
    iso: "2026-09-16",
    label: "Début le mercredi 16 septembre 2026",
  },
} as const;
