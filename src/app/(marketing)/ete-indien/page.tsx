import { Reveal } from "../_components/motion";
import {
  CtaLink,
  FeatureCard,
  PageHero,
  PriceCard,
  Section,
  SectionHead,
} from "../_components/ui";

export const metadata = {
  title: "Été indien 2026 — préparation interclubs",
  description:
    "Préparez vos interclubs avec l'Été indien 2026 : 5 cours collectifs de 1h30 dès 130 € / joueur, offre équipe à 400 €. Fin août – septembre à Gembloux.",
};

const FEATURES = [
  ["Spécial interclubs", "Programme conçu pour préparer efficacement les matchs d'équipe de l'automne."],
  ["5 cours intensifs", "Un cycle court mais puissant, fin août et septembre, idéal avant la reprise."],
  ["Offre équipe", "Tarif préférentiel pour les équipes inscrites en interclubs au Padel Smash Gembloux."],
];

export default function EteIndienPage() {
  return (
    <>
      <PageHero
        eyebrow="Fin août – septembre 2026 · interclubs"
        title={
          <>
            Été <span className="gold">indien</span> 2026
          </>
        }
        lead="Préparez votre saison interclubs avec un cycle court et intensif. 5 cours collectifs, offre spéciale équipes juniors & vétérans."
        primary={{ href: "/inscription", label: "Réserver ma place" }}
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map(([t, d], i) => (
            <Reveal key={t} delay={i * 60}>
              <FeatureCard title={t} text={d} />
            </Reveal>
          ))}
        </div>
      </Section>

      <div className="border-y border-[var(--line)] bg-[var(--bg-2)]">
        <Section>
          <SectionHead eyebrow="Offre spéciale équipes" title="Accès illimité équipe" />
          <div className="card card--gold mt-6 flex flex-col items-start gap-2 p-8">
            <span className="text-sm text-[var(--ink-55)]">
              Tous les joueurs de l&apos;équipe aux 5 séances du cycle
            </span>
            <span className="d text-5xl">
              400 €{" "}
              <span className="align-baseline text-sm font-normal tracking-normal text-[var(--ink-40)] [font-family:var(--font-body)]">
                / équipe
              </span>
            </span>
          </div>
        </Section>
      </div>

      <Section>
        <SectionHead
          eyebrow="Cours collectifs · 5 cours, tous niveaux"
          title="Cycle été indien"
          lead="5 cours × 1h30 · à partir du 24 août. Terrain, matériel et coaching compris. Prix par joueur selon l'effectif."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <PriceCard label="4 joueurs" price="130 €" unit="/ joueur" highlight="Meilleur tarif" />
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
