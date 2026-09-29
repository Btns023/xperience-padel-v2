/**
 * Tous les tarifs affichés sur le site vitrine, à un seul endroit.
 *
 * Avant, chaque page recopiait ses prix à la main : le duo 1h30 était annoncé
 * 105 € ici et 100 € dans le catalogue. Un prix ne se modifie plus qu'ici.
 *
 * ⚠ La facturation, elle, lit la table `price_tiers`. Les deux doivent rester
 * alignés : voir la note en bas de ce fichier.
 */

export type Tarif = {
  /** Ce que le visiteur reconnaît : « Groupe de 4 », « 27 cours ». */
  label: string;
  /** Nom de la formule, mis en avant au-dessus du libellé. */
  name?: string;
  /** Précision courte sous le libellé. */
  hint?: string;
  cents: number;
  /** « / joueur », « / 1h »… */
  unit: string;
  /** Bandeau doré sur la carte. */
  highlight?: string;
  note?: string;
};

/** 23000 -> « 230 € », 10550 -> « 105,50 € ». */
export function prix(cents: number): string {
  const euros = cents / 100;
  const body = Number.isInteger(euros)
    ? String(euros)
    : euros.toFixed(2).replace(".", ",");
  return `${body} €`;
}

/** « 35000 € pour 27 séances » -> « ≈ 13 € / séance ». */
export function parSeance(cents: number, sessions: number): string {
  return `≈ ${Math.round(cents / sessions / 100)} € / séance`;
}

// --- Cycles adultes --------------------------------------------------------

export const CYCLE_ADULTE = {
  sessions: 9,
  duree: "1h30",
  tarifs: [
    { label: "Groupe de 4", cents: 23000, unit: "/ joueur", highlight: "Le plus avantageux" },
    { label: "Groupe de 3", cents: 30000, unit: "/ joueur" },
    { label: "Groupe de 2", cents: 42500, unit: "/ joueur" },
  ] satisfies Tarif[],
};

// --- Cycles enfants --------------------------------------------------------

/**
 * Les trois durées, avec un nom avant le chiffre.
 *
 * « 27 / 18 / 9 cours » est notre langage interne : c'est le chiffre qui fait
 * le prix et l'engagement, donc il reste — mais un parent a besoin d'un nom
 * pour choisir. On évite « trimestre » : nos blocs de 9 ne collent pas aux
 * trimestres scolaires, le mot créerait une attente fausse.
 */
export const CYCLES_ENFANTS = [
  {
    count: 9,
    nom: "Découverte",
    portee: "Le premier bloc de la saison",
    cents: 15000,
  },
  {
    count: 18,
    nom: "Progression",
    portee: "Les deux premiers blocs",
    cents: 27500,
  },
  {
    count: 27,
    nom: "Saison complète",
    portee: "Toute la saison, du premier au dernier cours",
    cents: 35000,
    highlight: "Le meilleur calcul",
  },
] as const;

/** Le même, prêt à passer à une grille de cartes. */
export const CYCLE_ENFANT_TARIFS: Tarif[] = CYCLES_ENFANTS.map((c) => ({
  name: c.nom,
  label: `${c.count} cours · ${c.portee.toLowerCase()}`,
  cents: c.cents,
  unit: "/ enfant",
  highlight: "highlight" in c ? c.highlight : undefined,
  note: parSeance(c.cents, c.count),
}));

// --- Cours privés ----------------------------------------------------------

export const COURS_PRIVE = {
  solo: { h1: 6000, h15: 9000 },
  duo: { h1: 7000, h15: 10500 },
  enfant: { h1: 4500, h15: 6500 },
};

export const COURS_PRIVE_TARIFS: Tarif[] = [
  {
    label: "Solo",
    hint: "1 joueur",
    cents: COURS_PRIVE.solo.h1,
    unit: "/ 1h",
    note: `${prix(COURS_PRIVE.solo.h15)} / 1h30`,
  },
  {
    label: "À deux",
    hint: "prix total, pas par joueur",
    cents: COURS_PRIVE.duo.h1,
    unit: "/ 1h",
    note: `${prix(COURS_PRIVE.duo.h15)} / 1h30`,
  },
  {
    label: "Enfant",
    hint: "coaching individuel",
    cents: COURS_PRIVE.enfant.h1,
    unit: "/ 1h",
    note: `${prix(COURS_PRIVE.enfant.h15)} / 1h30`,
  },
];

// --- Stages d'été ----------------------------------------------------------

export const STAGE_ETE = {
  format: "3 × 2h sur une semaine",
  tarifs: [
    { label: "4 joueurs", cents: 10500, unit: "/ personne", highlight: "Le plus avantageux" },
    { label: "3 joueurs", cents: 14000, unit: "/ personne" },
    { label: "2 joueurs", cents: 21000, unit: "/ personne" },
  ] satisfies Tarif[],
};

// --- Été indien ------------------------------------------------------------

export const ETE_INDIEN = {
  sessions: 5,
  duree: "1h30",
  forfaitEquipeCents: 40000,
  tarifs: [
    { label: "4 joueurs", cents: 13000, unit: "/ joueur", highlight: "Meilleur tarif" },
    { label: "3 joueurs", cents: 17000, unit: "/ joueur" },
    { label: "2 joueurs", cents: 23500, unit: "/ joueur" },
  ] satisfies Tarif[],
};

/**
 * À faire quand la base pourra être modifiée :
 *  - `price_tiers` : cours privé duo 1h30 est à 100 € alors que la règle
 *    annoncée est « 1h30 = 1h × 1,5 », soit 105 €. Le solo (60 → 90) et le
 *    duo 1h (70 → 105) respectent la règle : c'est le palier à 100 qui dévie.
 *  - `price_tiers` : le cours privé enfant (45 € / 65 €) est annoncé ici mais
 *    absent du catalogue — il ne peut donc pas être facturé au bon tarif.
 *  - les libellés des cycles enfants en base valent « 9 cours », « 18 cours »,
 *    « 27 cours » : à renommer comme ci-dessus pour que le visiteur retrouve
 *    le même nom au moment de s'inscrire.
 */
