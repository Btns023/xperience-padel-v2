import {
  CtaLink,
  Display,
  Eyebrow,
  FeatureCard,
  PageHero,
  PriceCard,
  Section,
} from "../_components/ui";

export const metadata = {
  title: "Cours privés de padel",
  description:
    "Cours privés de padel à Gembloux : solo 60 € / 1h, duo 70 € / 1h. Coaching individuel avec P1000, P700, P500. Horaires flexibles, terrain inclus.",
};

const STEPS = [
  ["01", "Vous nous contactez", "Par e-mail avec votre niveau, vos objectifs et vos disponibilités."],
  ["02", "On vous oriente", "Vers le coach et le créneau les plus adaptés à votre profil."],
  ["03", "Vous arrivez, on est prêts", "Terrain réservé, matériel disponible, coach au rendez-vous."],
  ["04", "Retour personnalisé", "À la fin de chaque séance, le coach vous donne des axes de travail concrets."],
];

export default function CoursPrivesPage() {
  return (
    <>
      <PageHero
        eyebrow="Disponible toute l'année · solo ou duo"
        title={<>Progressez 3× plus vite</>}
        lead="Un coach rien que pour vous. Pas de groupe, pas de compromis : chaque séance est construite autour de votre jeu, vos objectifs, votre niveau."
        primary={{ href: "/inscription", label: "Réserver un cours privé" }}
        secondary={{ href: "/coachs", label: "Voir nos coachs" }}
      />

      <Section>
        <Eyebrow>Tarifs clairs, sans surprise</Eyebrow>
        <h2 className="mt-4 text-4xl text-white sm:text-5xl">
          <Display>Choisissez votre formule</Display>
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <PriceCard
            label="Cours solo · 1 joueur · coaching 100 % personnalisé"
            price="60 €"
            unit="/ 1h"
            note="90 € / 1h30 (×1,5)"
          />
          <PriceCard
            label="Cours duo · 2 joueurs · prix total"
            price="70 €"
            unit="/ 1h"
            note="105 € / 1h30 (×1,5)"
          />
        </div>
        <p className="mt-4 text-xs text-white/45">
          Terrain, matériel et coaching compris.
        </p>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Pourquoi un cours privé ?</Eyebrow>
        <h2 className="mt-4 text-4xl text-white sm:text-5xl">
          <Display>Ce que vous ne trouvez pas en collectif</Display>
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            title="Attention totale du coach"
            text="Chaque correction, chaque conseil vous est adressé — rien n'est dilué dans un groupe."
          />
          <FeatureCard
            title="Vous choisissez l'horaire"
            text="À convenir directement avec votre coach, flexible 7 j/7 selon les disponibilités."
          />
          <FeatureCard
            title="Résultats en 1 séance"
            text="Un point technique ciblé, travaillé en profondeur. Les progrès se voient immédiatement."
          />
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>C&apos;est fait pour vous si…</Eyebrow>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            ["Vous débutez", "Partir sur de bonnes bases avant de rejoindre un collectif."],
            ["Vous avez un point à corriger", "Coup droit, lob, service, placement — une séance ciblée suffit."],
            ["Vous préparez un tournoi", "Monter en intensité rapidement avant une compétition ou des interclubs."],
            ["Vos horaires ne collent pas", "Le cours privé s'adapte à vous, pas l'inverse."],
          ].map(([t, d]) => (
            <li
              key={t}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="text-sm font-semibold text-white">{t}</div>
              <div className="mt-1 text-sm text-white/60">{d}</div>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="pt-0">
        <Eyebrow>En 4 étapes</Eyebrow>
        <h2 className="mt-4 text-4xl text-white sm:text-5xl">
          <Display>Comment ça se passe ?</Display>
        </h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([n, t, d]) => (
            <li
              key={n}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="font-[family-name:var(--font-display)] text-3xl text-[#c9a24b]">
                {n}
              </div>
              <div className="mt-2 text-sm font-semibold text-white">{t}</div>
              <div className="mt-1 text-sm text-white/60">{d}</div>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <CtaLink href="/inscription">Demander mon cours privé</CtaLink>
        </div>
      </Section>
    </>
  );
}
