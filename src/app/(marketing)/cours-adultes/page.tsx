import Link from "next/link";
import { Reveal } from "../_components/motion";
import {
  CtaLink,
  FeatureCard,
  PageHero,
  PriceCard,
  Section,
  SectionHead,
} from "../_components/ui";
import { COURS_PRIVE, CYCLE_ADULTE, prix } from "../_components/tarifs";

export const metadata = {
  title: "Cours de padel adultes",
  description:
    "Cours collectifs de padel adultes à Gembloux : 9 séances de 1h30, groupes de niveau, dès 230 € / joueur. Cours à la carte solo et duo.",
};

const FEATURES = [
  ["Niveau homogène", "Groupes constitués par niveau pour progresser avec des joueurs comme vous."],
  ["Coachs certifiés", "Nicolas Bertholet P1000 · Stéphane Stellings P700 · Antonin Hulster P500."],
  ["Planning fixe", "9 séances planifiées, rien à organiser. Vous réservez, on s'occupe du reste."],
];

export default function CoursAdultesPage() {
  return (
    <>
      <PageHero
        eyebrow="Padel Smash Gembloutois · Saison 2026"
        title={
          <>
            Cours collectifs <span className="gold">adultes</span>
          </>
        }
        lead="Progressez entouré d'autres passionnés, encadré par des coachs qui jouent eux-mêmes à haut niveau. 9 séances de 1h30, location comprise, aucune surprise."
        primary={{ href: "/inscription", label: "Réserver ma place" }}
        secondary={{ href: "/coachs", label: "Voir nos coachs" }}
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

      <div className="border-y border-[var(--line)] bg-[var(--bg-2)] band">
        <Section>
          <SectionHead
            eyebrow="Tarifs cycles collectifs"
            title={
              <>
                Ce que vous <span className="out">payez</span>
              </>
            }
            lead={`Cycle de ${CYCLE_ADULTE.sessions} cours · ${CYCLE_ADULTE.duree} · terrain, matériel et coaching compris. Le prix par joueur dépend de l'effectif du groupe.`}
          />
          <div className="scene mt-10 grid gap-4 sm:grid-cols-3">
            {CYCLE_ADULTE.tarifs.map((t, i) => (
              <Reveal key={t.label} delay={i * 50}>
                <PriceCard
                  label={`En ${t.label.toLowerCase()}`}
                  price={prix(t.cents)}
                  unit={t.unit}
                  highlight={t.highlight}
                />
              </Reveal>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-[var(--ink-55)]">
            Les séances ne sont ni données ni comptées pendant les{" "}
            <Link
              href="/calendrier-tarifs#conges"
              className="text-[var(--gold)] hover:underline"
            >
              congés scolaires
            </Link>{" "}
            : le cycle reprend ensuite au même jour et à la même heure.
          </p>
        </Section>
      </div>

      <Section>
        <SectionHead
          eyebrow="Vous préférez la souplesse ?"
          title={<>Cours <span className="gold">à la carte</span></>}
          lead="Flexible, sans engagement, terrain et matériel compris. 1h30 disponible sur demande (tarif ×1,5)."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <PriceCard
            label="Cours solo · 1 joueur"
            price={prix(COURS_PRIVE.solo.h1)}
            unit="/ 1h"
            note={`${prix(COURS_PRIVE.solo.h15)} / 1h30`}
          />
          <PriceCard
            label="Cours duo · 2 joueurs · prix total"
            price={prix(COURS_PRIVE.duo.h1)}
            unit="/ 1h"
            note={`${prix(COURS_PRIVE.duo.h15)} / 1h30`}
          />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <CtaLink href="/inscription">Réserver un cours</CtaLink>
          <CtaLink href="/cours-prives" variant="ghost">
            Les cours privés
          </CtaLink>
        </div>
      </Section>
    </>
  );
}
