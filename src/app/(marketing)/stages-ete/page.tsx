import { Reveal } from "../_components/motion";
import {
  CtaLink,
  FeatureCard,
  PageHero,
  PriceCard,
  Section,
  SectionHead,
  StoryNav,
} from "../_components/ui";

export const metadata = {
  title: "Stages adultes été 2026",
  description:
    "Stages de padel adultes juillet et août 2026 à Gembloux : 3 × 2h en soirée, dès 105 € / personne. Groupe de 2 à 4 joueurs.",
};

const FEATURES = [
  ["3 × 2h en une semaine", "Lundi, mardi et jeudi soir. La formule intensive pour progresser vite."],
  ["2 créneaux au choix", "17h30 ou 19h30 selon vos disponibilités. Groupe à constituer par les joueurs."],
  ["Groupe de 2 à 4", "Vous choisissez avec qui vous venez. Plus vous êtes nombreux, moins c'est cher."],
];

const WEEKS = [
  ["Été 1", "6 – 10 juillet 2026", "Stéphane Stellings", "Complet"],
  ["Été 2", "13 – 17 juillet 2026", "Nicolas Bertholet", "Complet"],
  ["Été 6", "10 – 14 août 2026", "Antonin Hulster", "Disponible"],
  ["Été 7", "17 – 21 août 2026", "À confirmer", "Disponible"],
];

export default function StagesEtePage() {
  return (
    <>
      <PageHero
        story="/stages-ete"
        eyebrow="Juillet & août 2026 · en soirée"
        title={
          <>
            Stages adultes <span className="gold">été 2026</span>
          </>
        }
        lead="3 séances de 2h en une semaine. Le format le plus efficace pour franchir un cap technique rapidement. Places limitées."
        primary={{ href: "/inscription", label: "S'inscrire" }}
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
          <SectionHead
            eyebrow="Calendrier des stages"
            title="Choisissez votre semaine"
          />
          <ul className="mt-10 flex flex-col gap-3">
            {WEEKS.map(([name, dates, coach, status]) => (
              <li
                key={name}
                className="card flex flex-wrap items-center justify-between gap-3 p-5"
              >
                <div>
                  <div className="d text-lg">
                    {name} · {dates}
                  </div>
                  <div className="text-sm text-[var(--ink-40)]">
                    Coach : {coach}
                  </div>
                </div>
                <span
                  className={`rounded-[2px] px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    status === "Complet"
                      ? "bg-white/[0.08] text-[var(--ink-40)]"
                      : "bg-[var(--gold)] text-black"
                  }`}
                >
                  {status}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section>
        <SectionHead
          eyebrow="Tarifs · par personne, tout compris"
          title="Tarif stage (3 × 2h)"
          lead="Terrain, matériel et coaching compris. Groupe constitué par les joueurs eux-mêmes."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <PriceCard label="4 joueurs" price="105 €" unit="/ personne" highlight="Le plus avantageux" />
          <PriceCard label="3 joueurs" price="140 €" unit="/ personne" />
          <PriceCard label="2 joueurs" price="210 €" unit="/ personne" />
        </div>
        <div className="mt-8">
          <CtaLink href="/inscription">S&apos;inscrire à un stage</CtaLink>
        </div>
      </Section>

      <StoryNav story="/stages-ete" />
    </>
  );
}
