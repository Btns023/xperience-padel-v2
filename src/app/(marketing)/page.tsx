import Link from "next/link";
import {
  CtaLink,
  Display,
  Eyebrow,
  FeatureCard,
  Section,
} from "./_components/ui";

export const metadata = {
  title: "Cours & stages de padel à Gembloux",
  description:
    "Xperience Padel Academy — cours collectifs adultes et enfants, cours privés, stages d'été et préparation interclubs à Gembloux. Coachs P1000, P700, P500.",
};

const OFFERS = [
  {
    href: "/cours-adultes",
    kicker: "Adultes",
    title: "Cycles collectifs",
    text: "9 séances de 1h30, groupes de niveau, location comprise. Dès 230 € / joueur.",
  },
  {
    href: "/cours-enfants",
    kicker: "6–18 ans",
    title: "Cours enfants & ados",
    text: "Mercredis après-midi et samedis matin, groupes par âge. Cycles dès 150 €.",
  },
  {
    href: "/cours-prives",
    kicker: "Solo ou duo",
    title: "Cours privés",
    text: "Un coach rien que pour vous, 7 j/7. Solo 60 € / 1h, duo 70 € / 1h.",
  },
  {
    href: "/stages-ete",
    kicker: "Juillet–Août",
    title: "Stages d'été",
    text: "3 × 2h sur une semaine, en soirée. Format intensif dès 105 € / personne.",
  },
  {
    href: "/ete-indien",
    kicker: "Interclubs",
    title: "Été indien",
    text: "5 cours pour préparer la saison d'équipe. Offre équipe à 400 €.",
  },
];

const COACHES = [
  {
    name: "Nicolas Bertholet",
    role: "Co-fondateur · P1000",
    text: "Lecture du terrain chirurgicale, schémas tactiques offensifs.",
  },
  {
    name: "Stéphane Stellings",
    role: "Co-fondateur · P700",
    text: "Prof de tennis certifié. Technique, régularité, progression structurée.",
  },
  {
    name: "Antonin Hulster",
    role: "Coach adultes · P500",
    text: "Automatismes, corrections, développement du jeu offensif.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[url(/court-bg.jpg)] bg-cover bg-center" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b0b0c]/75 via-[#0b0b0c]/85 to-[#0b0b0c]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(201,162,75,0.22),transparent_65%)]" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-5 py-24 text-center sm:py-32">
          <Eyebrow>Xperience Padel Academy · Gembloux, Belgique</Eyebrow>
          <h1 className="mt-6 text-6xl text-white sm:text-8xl">
            <Display>
              Élevez
              <br />
              <span className="text-[#c9a24b]">votre</span> jeu
            </Display>
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-white/65">
            Que vous découvriez le padel ou que vous souhaitiez perfectionner
            votre technique, nous vous accompagnons pour progresser
            efficacement.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <CtaLink href="/inscription">Réserver un cours</CtaLink>
            <CtaLink href="/cours-adultes" variant="ghost">
              Voir les formules
            </CtaLink>
          </div>
          <div className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 text-sm sm:grid-cols-4">
            {[
              ["Tous niveaux", "Adultes & enfants"],
              ["Location", "comprise"],
              ["Coachs", "P1000 · P700 · P500"],
              ["Lieu", "Padel Smash Gembloux"],
            ].map(([a, b]) => (
              <div key={a} className="bg-[#0b0b0c] px-4 py-4">
                <div className="font-semibold text-white">{a}</div>
                <div className="text-white/50">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Approche */}
      <Section>
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <Eyebrow>Notre approche</Eyebrow>
            <h2 className="mt-4 text-4xl text-white sm:text-5xl">
              <Display>
                Progresser,
                <br />
                c&apos;est une xperience
              </Display>
            </h2>
          </div>
          <div className="space-y-4 text-white/65">
            <p>
              Chez XPA, on ne fait pas semblant de coacher. Chaque séance est
              construite pour vous faire progresser — pas pour remplir un
              créneau. Nos coachs analysent, corrigent, poussent. Et ça se voit
              sur le court.
            </p>
            <p>
              Du premier cours découverte au programme interclubs, vous êtes
              entre les mains de fondateurs qui jouent eux-mêmes à haut niveau.
              Pas de discours — des résultats.
            </p>
          </div>
        </div>
      </Section>

      {/* Formules */}
      <Section className="pt-0">
        <Eyebrow>Nos formules</Eyebrow>
        <h2 className="mt-4 text-4xl text-white sm:text-5xl">
          <Display>Trouvez la vôtre</Display>
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map((o) => (
            <Link
              key={o.href}
              href={o.href}
              className="group flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-[#c9a24b]/50"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c9a24b]">
                {o.kicker}
              </span>
              <span className="mt-2 text-lg font-semibold text-white">
                {o.title}
              </span>
              <span className="mt-2 flex-1 text-sm leading-relaxed text-white/60">
                {o.text}
              </span>
              <span className="mt-4 text-sm text-white/50 group-hover:text-white">
                En savoir plus →
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Coachs */}
      <Section className="pt-0">
        <Eyebrow>L&apos;équipe encadrante</Eyebrow>
        <h2 className="mt-4 text-4xl text-white sm:text-5xl">
          <Display>Nos coachs</Display>
        </h2>
        <p className="mt-4 max-w-2xl text-white/60">
          Une équipe passionnée, certifiée et dédiée à votre progression.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {COACHES.map((c) => (
            <div
              key={c.name}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-[#c9a24b]">
                {c.role}
              </div>
              <div className="mt-2 text-lg font-semibold text-white">
                {c.name}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {c.text}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <CtaLink href="/coachs" variant="ghost">
            Toute l&apos;équipe
          </CtaLink>
        </div>
      </Section>

      {/* Pourquoi */}
      <Section className="pt-0">
        <div className="grid gap-4 sm:grid-cols-3">
          <FeatureCard
            title="Encadrement professionnel"
            text="Des coachs qui jouent à haut niveau et transmettent ce qu'ils vivent sur le court."
          />
          <FeatureCard
            title="Progression personnalisée"
            text="Groupes de niveau, retours concrets à chaque séance, suivi sur tout le cycle."
          />
          <FeatureCard
            title="Sans surprise"
            text="Terrain, matériel et coaching compris. Vous réservez, on s'occupe du reste."
          />
        </div>
      </Section>

      {/* CTA final */}
      <Section className="pt-0">
        <div className="rounded-2xl border border-[#c9a24b]/40 bg-[#c9a24b]/[0.07] px-6 py-12 text-center">
          <h2 className="text-3xl text-white sm:text-4xl">
            <Display>Prêt à jouer ?</Display>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-white/65">
            Crée ton compte, choisis un créneau, on te recontacte pour former
            ton groupe. Paiement par virement, aucune surprise.
          </p>
          <div className="mt-7">
            <CtaLink href="/inscription">Réserver ma place</CtaLink>
          </div>
        </div>
      </Section>
    </>
  );
}
