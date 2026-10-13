import { Reveal } from "../_components/motion";
import {
  CtaLink,
  FeatureCard,
  PageHero,
  PriceCard,
  Section,
  SectionHead,
} from "../_components/ui";
import { STAGE_ETE, prix } from "../_components/tarifs";

export const metadata = {
  title: "Stage intensif adultes",
  description:
    "Stage intensif de padel adultes en octobre 2026 à Gembloux : 3 × 2h en soirée, dès 105 € / personne. Groupe de 2 à 4 joueurs.",
};

const FEATURES = [
  ["3 × 2h en une semaine", "Lundi, mardi et jeudi soir. La formule intensive pour progresser vite."],
  ["2 créneaux au choix", "17h30 ou 19h30 selon vos disponibilités. Groupe à constituer par les joueurs."],
  ["Groupe de 2 à 4", "Vous choisissez avec qui vous venez. Plus vous êtes nombreux, moins c'est cher."],
];

/**
 * Les semaines de stage, chacune avec ses deux groupes horaires.
 * Reprend le calendrier publié sur padelxp.be.
 */
const WEEKS: {
  name: string;
  dates: string;
  coach: string;
  groups: { label: string; time: string; full?: boolean }[];
}[] = [
  {
    name: "Semaine 1",
    dates: "19 – 23 octobre 2026",
    coach: "Andréa Maronet",
    groups: [
      { label: "Groupe 1", time: "17h30" },
      { label: "Groupe 2", time: "19h30" },
    ],
  },
  {
    name: "Semaine 2",
    dates: "26 – 30 octobre 2026",
    coach: "Stéphane Stellings",
    groups: [
      { label: "Groupe 1", time: "17h30" },
      { label: "Groupe 2", time: "19h30", full: true },
    ],
  },
];

export default function StagesEtePage() {
  return (
    <>
      <PageHero
        eyebrow="Octobre 2026 · en soirée"
        title={
          <>
            Stage intensif <span className="gold">adultes</span>
          </>
        }
        lead="3 séances de 2h en une semaine. Le format le plus efficace pour franchir un cap technique rapidement. Deux semaines disponibles en octobre."
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

      <div className="border-y border-[var(--line)] bg-[var(--bg-2)] band">
        <Section>
          <SectionHead
            eyebrow="Calendrier des stages"
            title={<>Choisissez <span className="gold">votre semaine</span></>}
          />
          <ul className="mt-10 flex flex-col gap-3">
            {WEEKS.map((w) => (
              <li key={w.name} className="card p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="d text-lg">{w.name}</span>
                  <span className="d text-lg text-[var(--gold)]">{w.dates}</span>
                </div>
                <div className="mt-1 text-sm text-[var(--ink-40)]">
                  Coach : {w.coach}
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {w.groups.map((g) => (
                    <div
                      key={g.label}
                      className="flex items-center justify-between gap-3 rounded-[3px] border border-[var(--line)] px-4 py-2.5"
                    >
                      <span className="text-sm">
                        <span className="font-semibold text-white">{g.label}</span>
                        <span className="text-[var(--ink-55)]"> · {g.time}</span>
                      </span>
                      <span
                        className={`shrink-0 rounded-[2px] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          g.full
                            ? "bg-white/[0.08] text-[var(--ink-40)]"
                            : "bg-[var(--gold)] text-black"
                        }`}
                      >
                        {g.full ? "Complet" : "Disponible"}
                      </span>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[var(--ink-40)]">
            Formule : 3 séances de 2h · lundi, mardi et jeudi.
          </p>
        </Section>
      </div>

      <Section>
        <SectionHead
          eyebrow="Tarifs · par personne, tout compris"
          title={<>Tarif stage <span className="gold">(3 × 2h)</span></>}
          lead="Terrain, matériel et coaching compris. Groupe constitué par les joueurs eux-mêmes."
        />
        <div className="scene mt-10 grid gap-4 sm:grid-cols-3">
          {STAGE_ETE.tarifs.map((t, i) => (
            <Reveal key={t.label} delay={i * 50}>
              <PriceCard
                label={t.label}
                price={prix(t.cents)}
                unit={t.unit}
                highlight={t.highlight}
              />
            </Reveal>
          ))}
        </div>
        <div className="mt-8">
          <CtaLink href="/inscription">S&apos;inscrire à un stage</CtaLink>
        </div>
      </Section>
    </>
  );
}
