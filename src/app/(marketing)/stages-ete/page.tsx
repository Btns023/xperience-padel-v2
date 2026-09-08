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
  title: "Stages adultes été 2026",
  description:
    "Stages de padel adultes juillet et août 2026 à Gembloux : 3 × 2h en soirée, dès 105 € / personne. Groupe de 2 à 4 joueurs.",
};

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
        eyebrow="Juillet & août 2026 · en soirée"
        title={<>Stages adultes été 2026</>}
        lead="3 séances de 2h en une semaine. Le format le plus efficace pour franchir un cap technique rapidement. Places limitées."
        primary={{ href: "/inscription", label: "S'inscrire" }}
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          <FeatureCard
            title="3 × 2h en une semaine"
            text="Lundi, mardi et jeudi soir. La formule intensive pour progresser vite."
          />
          <FeatureCard
            title="2 créneaux au choix"
            text="17h30 ou 19h30 selon vos disponibilités. Groupe à constituer par les joueurs."
          />
          <FeatureCard
            title="Groupe de 2 à 4"
            text="Vous choisissez avec qui vous venez. Plus vous êtes nombreux, moins c'est cher."
          />
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Calendrier des stages</Eyebrow>
        <h2 className="mt-4 text-4xl text-white sm:text-5xl">
          <Display>Choisissez votre semaine</Display>
        </h2>
        <ul className="mt-10 flex flex-col gap-3">
          {WEEKS.map(([name, dates, coach, status]) => (
            <li
              key={name}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div>
                <div className="font-semibold text-white">
                  {name} · {dates}
                </div>
                <div className="text-sm text-white/55">Coach : {coach}</div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  status === "Complet"
                    ? "bg-white/10 text-white/50"
                    : "bg-[#c9a24b] text-[#0b0b0c]"
                }`}
              >
                {status}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Tarifs · par personne, tout compris</Eyebrow>
        <h2 className="mt-4 text-4xl text-white sm:text-5xl">
          <Display>Tarif stage (3 × 2h)</Display>
        </h2>
        <p className="mt-4 max-w-2xl text-white/60">
          Terrain, matériel et coaching compris. Groupe constitué par les
          joueurs eux-mêmes.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <PriceCard
            label="4 joueurs"
            price="105 €"
            unit="/ personne"
            highlight="Le plus avantageux"
          />
          <PriceCard label="3 joueurs" price="140 €" unit="/ personne" />
          <PriceCard label="2 joueurs" price="210 €" unit="/ personne" />
        </div>
        <div className="mt-8">
          <CtaLink href="/inscription">S&apos;inscrire à un stage</CtaLink>
        </div>
      </Section>
    </>
  );
}
