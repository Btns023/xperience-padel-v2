/**
 * Le fil du récit : chaque page de la vitrine est un chapitre.
 * Source unique — sert au badge du hero, au bloc « chapitre suivant »
 * et à la timeline de l'accueil.
 */
export type Chapter = {
  /** Numéro affiché ("00" pour le prologue). */
  n: string;
  href: string;
  /** Titre narratif du chapitre. */
  title: string;
  /** Ce que raconte le chapitre, en une phrase. */
  teaser: string;
  /** Rattachement à l'offre, pour la timeline. */
  tag: string;
};

export const CHAPTERS: Chapter[] = [
  {
    n: "00",
    href: "/",
    title: "Le déclic",
    teaser:
      "Une raquette, un mur, trois échanges — et l'envie de recommencer dès le lendemain.",
    tag: "Prologue",
  },
  {
    n: "01",
    href: "/cours-adultes",
    title: "Les premiers cycles",
    teaser:
      "Neuf séances, un groupe de votre niveau, un coach qui corrige. C'est là que tout commence vraiment.",
    tag: "Adultes",
  },
  {
    n: "02",
    href: "/cours-enfants",
    title: "La relève",
    teaser:
      "Les 6-18 ans prennent le court le mercredi et le samedi. Le jeu d'abord, la technique juste derrière.",
    tag: "6–18 ans",
  },
  {
    n: "03",
    href: "/cours-prives",
    title: "Le face-à-face",
    teaser:
      "Un coach, rien que pour vous. Une heure pour débloquer ce qui résiste depuis des mois.",
    tag: "Solo ou duo",
  },
  {
    n: "04",
    href: "/stages-ete",
    title: "L'été qui accélère",
    teaser:
      "Trois séances de deux heures en une semaine. On progresse vite quand on ne redescend pas.",
    tag: "Juillet–Août",
  },
  {
    n: "05",
    href: "/ete-indien",
    title: "La montée en puissance",
    teaser:
      "Cinq cours pour arriver prêts aux interclubs. L'équipe se soude, le jeu se structure.",
    tag: "Interclubs",
  },
  {
    n: "06",
    href: "/coachs",
    title: "Ceux qui vous guident",
    teaser:
      "P1000, P700, P500. Ils ne racontent pas le padel : ils le jouent, puis ils vous le transmettent.",
    tag: "L'équipe",
  },
  {
    n: "07",
    href: "/sponsors",
    title: "Ceux qui nous soutiennent",
    teaser:
      "Des partenaires locaux sans qui l'académie n'existerait pas sous cette forme.",
    tag: "Partenaires",
  },
];

/** Le chapitre correspondant à une page, ou undefined hors du fil. */
export function chapterOf(href: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.href === href);
}

/** Chapitre précédent / suivant dans l'ordre du récit. */
export function neighbours(href: string): {
  prev?: Chapter;
  next?: Chapter;
} {
  const i = CHAPTERS.findIndex((c) => c.href === href);
  if (i < 0) return {};
  return { prev: CHAPTERS[i - 1], next: CHAPTERS[i + 1] };
}
