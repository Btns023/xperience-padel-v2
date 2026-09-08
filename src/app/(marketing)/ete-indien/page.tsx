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
  title: "Été indien 2026 — préparation interclubs",
  description:
    "Préparez vos interclubs avec l'Été indien 2026 : 5 cours collectifs de 1h30 dès 130 € / joueur, offre équipe à 400 €. Fin août – septembre à Gembloux.",
};

export default function EteIndienPage() {
  return (
    <>
      <PageHero
        eyebrow="Fin août – septembre 2026 · interclubs"
        title={<>Été indien 2026</>}
        lead="Préparez votre saison interclubs avec un cycle court et intensif. 5 cours collectifs, offre spéciale équipes juniors & vétérans."
        primary={{ href: "/inscription", label: "Réserver ma place" }}
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          <FeatureCard
            title="Spécial interclubs"
            text="Programme conçu pour préparer efficacement les matchs d'équipe de l'automne."
          />
          <FeatureCard
            title="5 cours intensifs"
            text="Un cycle court mais puissant, fin août et septembre, idéal avant la reprise."
          />
          <FeatureCard
            title="Offre équipe"
            text="Tarif préférentiel pour les équipes inscrites en interclubs au Padel Smash Gembloux."
          />
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Offre spéciale équipes</Eyebrow>
        <div className="mt-6 flex flex-col items-start gap-2 rounded-2xl border border-[#c9a24b]/40 bg-[#c9a24b]/[0.07] p-8">
          <span className="text-sm text-white/60">
            Accès illimité équipe · tous les joueurs aux 5 séances du cycle
          </span>
          <span className="text-4xl font-bold text-white">
            400 € <span className="text-base font-normal text-white/50">/ équipe</span>
          </span>
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Cours collectifs · 5 cours, tous niveaux</Eyebrow>
        <h2 className="mt-4 text-4xl text-white sm:text-5xl">
          <Display>Cycle été indien</Display>
        </h2>
        <p className="mt-4 max-w-2xl text-white/60">
          5 cours × 1h30 · à partir du 24 août. Terrain, matériel et coaching
          compris. Prix par joueur selon l&apos;effectif.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <PriceCard
            label="4 joueurs"
            price="130 €"
            unit="/ joueur"
            highlight="Meilleur tarif"
          />
          <PriceCard label="3 joueurs" price="170 €" unit="/ joueur" />
          <PriceCard label="2 joueurs" price="235 €" unit="/ joueur" />
        </div>
        <div className="mt-8">
          <CtaLink href="/inscription">Réserver l&apos;été indien</CtaLink>
        </div>
      </Section>
    </>
  );
}
