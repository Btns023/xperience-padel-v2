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
  title: "Cours de padel enfants & ados",
  description:
    "Cours de padel enfants 6–18 ans à Gembloux : mercredis après-midi et samedis matin, groupes par âge. Cycles annuels dès 150 € (13 € / séance).",
};

const MERCREDI = [
  ["6 – 8 ans", "13h00"],
  ["9 – 12 ans", "14h00"],
  ["13 – 15 ans", "15h00"],
  ["16 – 18 ans", "16h00"],
];
const SAMEDI = [
  ["8 – 12 ans", "10h00"],
  ["13 – 18 ans", "11h00"],
];

function Planning({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: string[][];
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="text-xs text-white/45">{subtitle}</div>
      <ul className="mt-4 flex flex-col divide-y divide-white/10 text-sm">
        {rows.map(([age, h]) => (
          <li key={age} className="flex justify-between py-2 text-white/70">
            <span>{age}</span>
            <span className="tabular-nums text-white">{h}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-white/45">
        Durée 1h · location du terrain comprise
      </p>
    </div>
  );
}

export default function CoursEnfantsPage() {
  return (
    <>
      <PageHero
        eyebrow="Mercredi après-midi & samedi matin · Padel Smash Gembloux"
        title={<>Offrez-leur la passion du padel</>}
        lead="Des cours adaptés par tranche d'âge, dans une ambiance dynamique et bienveillante. Votre enfant progresse à son rythme, avec des coachs formés pour les jeunes."
        primary={{ href: "/inscription", label: "Inscrire mon enfant" }}
        secondary={{ href: "/coachs", label: "Voir les coachs" }}
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          <FeatureCard
            title="Groupes par âge"
            text="9–12 ans · 13–15 ans · 16–18 ans. Chaque groupe évolue à son rythme."
          />
          <FeatureCard
            title="Technique & plaisir"
            text="Bases solides, coordination, esprit d'équipe — sans pression de résultat."
          />
          <FeatureCard
            title="Terrain compris"
            text="Location du court, matériel pédagogique et coaching inclus dans le tarif."
          />
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Créneaux</Eyebrow>
        <h2 className="mt-4 text-4xl text-white sm:text-5xl">
          <Display>À quelle heure ?</Display>
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Planning
            title="Planning mercredis"
            subtitle="Padel Smash Gembloux · après-midi"
            rows={MERCREDI}
          />
          <Planning
            title="Planning samedis · Nouveau"
            subtitle="Padel Smash Gembloux · matin"
            rows={SAMEDI}
          />
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Tarifs cycles annuels 2026–2027</Eyebrow>
        <h2 className="mt-4 text-4xl text-white sm:text-5xl">
          <Display>Plus vous prenez, moins c&apos;est cher</Display>
        </h2>
        <p className="mt-4 max-w-2xl text-white/60">
          Séances d&apos;1h · location comprise. Le cycle annuel complet revient
          à seulement 13 € par séance.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <PriceCard
            label="9 cours · sept. → déc. 2026"
            price="150 €"
            unit="/ enfant"
          />
          <PriceCard
            label="18 cours · sept. 2026 → mars 2027"
            price="275 €"
            unit="/ enfant"
          />
          <PriceCard
            label="27 cours · sept. 2026 → juin 2027"
            price="350 €"
            unit="/ enfant"
            highlight="Le meilleur calcul"
            note="≈ 13 € / séance"
          />
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Coaching individuel enfant</Eyebrow>
        <h2 className="mt-4 text-4xl text-white sm:text-5xl">
          <Display>Cours à la carte</Display>
        </h2>
        <p className="mt-4 max-w-2xl text-white/60">
          Coaching individuel, terrain et matériel compris. Horaires à convenir
          avec le coach, flexible 7 j/7. 1h30 sur demande (tarif ×1,5).
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <PriceCard label="Par enfant · 1h" price="45 €" unit="/ 1h" />
          <PriceCard label="Par enfant · 1h30" price="65 €" unit="/ 1h30" />
        </div>
        <div className="mt-8">
          <CtaLink href="/inscription">Inscrire mon enfant</CtaLink>
        </div>
      </Section>
    </>
  );
}
