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
  title: "Cours privés de padel",
  description:
    "Cours privés de padel à Gembloux : solo 60 € / 1h, duo 70 € / 1h. Coaching individuel avec P1000, P700, P500. Horaires flexibles, terrain inclus.",
};

const WHY = [
  ["Attention totale du coach", "Chaque correction, chaque conseil vous est adressé — rien n'est dilué dans un groupe."],
  ["Vous choisissez l'horaire", "À convenir directement avec votre coach, flexible 7 j/7 selon les disponibilités."],
  ["Résultats en 1 séance", "Un point technique ciblé, travaillé en profondeur. Les progrès se voient immédiatement."],
];

const FOR_YOU = [
  ["Vous débutez", "Partir sur de bonnes bases avant de rejoindre un collectif."],
  ["Vous avez un point à corriger", "Coup droit, lob, service, placement — une séance ciblée suffit."],
  ["Vous préparez un tournoi", "Monter en intensité rapidement avant une compétition ou des interclubs."],
  ["Vos horaires ne collent pas", "Le cours privé s'adapte à vous, pas l'inverse."],
];

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
        title={
          <>
            Progressez <span className="gold">3× plus vite</span>
          </>
        }
        lead="Un coach rien que pour vous. Pas de groupe, pas de compromis : chaque séance est construite autour de votre jeu, vos objectifs, votre niveau."
        primary={{ href: "/inscription", label: "Réserver un cours privé" }}
        secondary={{ href: "/coachs", label: "Voir nos coachs" }}
      />

      <Section>
        <SectionHead
          eyebrow="Tarifs clairs, sans surprise"
          title={<>Choisissez <span className="gold">votre formule</span></>}
        />
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
        <p className="mt-4 text-xs text-[var(--ink-40)]">
          Terrain, matériel et coaching compris.
        </p>
      </Section>

      <div className="border-y border-[var(--line)] bg-[var(--bg-2)] band">
        <Section>
          <SectionHead
            eyebrow="Pourquoi un cours privé ?"
            title={
              <>
                Ce que vous ne trouvez pas <span className="out">en collectif</span>
              </>
            }
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {WHY.map(([t, d], i) => (
              <Reveal key={t} delay={i * 60}>
                <FeatureCard title={t} text={d} />
              </Reveal>
            ))}
          </div>
        </Section>
      </div>

      <Section>
        <SectionHead eyebrow="C'est fait pour vous si…" title={<>Un besoin, <span className="gold">une séance</span></>} />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {FOR_YOU.map(([t, d]) => (
            <li key={t} className="card p-5">
              <div className="d text-base">{t}</div>
              <div className="mt-1 text-sm text-[var(--ink-55)]">{d}</div>
            </li>
          ))}
        </ul>
      </Section>

      <div className="border-t border-[var(--line)] bg-[var(--bg-2)] band">
        <Section>
          <SectionHead eyebrow="En 4 étapes" title={<>Comment <span className="gold">ça se passe</span> ?</>} />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([n, t, d]) => (
              <li key={n} className="card p-6">
                <div className="d text-3xl text-[var(--gold)]">{n}</div>
                <div className="d mt-2 text-lg">{t}</div>
                <div className="mt-1 text-sm text-[var(--ink-55)]">{d}</div>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <CtaLink href="/inscription">Demander mon cours privé</CtaLink>
          </div>
        </Section>
      </div>
    </>
  );
}
