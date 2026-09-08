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
  title: "Cours de padel adultes",
  description:
    "Cours collectifs de padel adultes à Gembloux : 9 séances de 1h30, groupes de niveau, dès 230 € / joueur. Cours à la carte solo et duo.",
};

export default function CoursAdultesPage() {
  return (
    <>
      <PageHero
        eyebrow="Padel Smash Gembloux · Saison 2026"
        title={<>Cours collectifs adultes</>}
        lead="Progressez entouré d'autres passionnés, encadré par des coachs qui jouent eux-mêmes à haut niveau. 9 séances de 1h30, location comprise, aucune surprise."
        primary={{ href: "/inscription", label: "Réserver ma place" }}
        secondary={{ href: "/coachs", label: "Voir nos coachs" }}
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          <FeatureCard
            title="Niveau homogène"
            text="Groupes constitués par niveau pour progresser avec des joueurs comme vous."
          />
          <FeatureCard
            title="Coachs certifiés"
            text="Nicolas Bertholet P1000 · Stéphane Stellings P700 · Antonin Hulster P500."
          />
          <FeatureCard
            title="Planning fixe"
            text="9 séances planifiées, rien à organiser. Vous réservez, on s'occupe du reste."
          />
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Tarifs cycles collectifs</Eyebrow>
        <h2 className="mt-4 text-4xl text-white sm:text-5xl">
          <Display>Ce que vous payez</Display>
        </h2>
        <p className="mt-4 max-w-2xl text-white/60">
          Cycle de 9 cours · 1h30 · terrain, matériel et coaching compris. Le
          prix par joueur dépend de l&apos;effectif du groupe.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <PriceCard
            label="En groupe de 4"
            price="230 €"
            unit="/ joueur"
            highlight="Le plus avantageux"
          />
          <PriceCard label="En groupe de 3" price="300 €" unit="/ joueur" />
          <PriceCard label="En groupe de 2" price="425 €" unit="/ joueur" />
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Vous préférez la souplesse ?</Eyebrow>
        <h2 className="mt-4 text-4xl text-white sm:text-5xl">
          <Display>Cours à la carte</Display>
        </h2>
        <p className="mt-4 max-w-2xl text-white/60">
          Flexible, sans engagement, terrain et matériel compris. 1h30
          disponible sur demande (tarif ×1,5).
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <PriceCard
            label="Cours solo · 1 joueur"
            price="60 €"
            unit="/ 1h"
            note="90 € / 1h30"
          />
          <PriceCard
            label="Cours duo · 2 joueurs · prix total"
            price="70 €"
            unit="/ 1h"
            note="105 € / 1h30"
          />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <CtaLink href="/inscription">Réserver un cours</CtaLink>
          <CtaLink href="/cours-prives" variant="ghost">
            En savoir plus sur les cours privés
          </CtaLink>
        </div>
      </Section>
    </>
  );
}
