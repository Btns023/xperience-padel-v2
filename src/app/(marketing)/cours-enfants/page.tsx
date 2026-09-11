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
  title: "Cours de padel enfants & ados",
  description:
    "Cours de padel enfants 6–18 ans à Gembloux : mercredis après-midi et samedis matin, groupes par âge. Cycles annuels dès 150 € (13 € / séance).",
};

const FEATURES = [
  ["Groupes par âge", "9–12 ans · 13–15 ans · 16–18 ans. Chaque groupe évolue à son rythme."],
  ["Technique & plaisir", "Bases solides, coordination, esprit d'équipe — sans pression de résultat."],
  ["Terrain compris", "Location du court, matériel pédagogique et coaching inclus dans le tarif."],
];

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
    <div className="card p-6">
      <div className="d text-lg">{title}</div>
      <div className="text-xs text-[var(--ink-40)]">{subtitle}</div>
      <ul className="mt-4 flex flex-col divide-y divide-[var(--line)] text-sm">
        {rows.map(([age, h]) => (
          <li
            key={age}
            className="flex justify-between py-2 text-[var(--ink-55)]"
          >
            <span>{age}</span>
            <span className="tabular-nums text-white">{h}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-[var(--ink-40)]">
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
        title={
          <>
            Offrez-leur la passion <span className="gold">du padel</span>
          </>
        }
        lead="Des cours adaptés par tranche d'âge, dans une ambiance dynamique et bienveillante. Votre enfant progresse à son rythme, encadré par Andréa Maronet, joueuse P300 et éducatrice physique."
        primary={{ href: "/inscription", label: "Inscrire mon enfant" }}
        secondary={{ href: "/coachs", label: "Voir les coachs" }}
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
          <SectionHead eyebrow="Créneaux" title={<>À quelle <span className="gold">heure</span> ?</>} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Reveal>
              <Planning
                title="Planning mercredis"
                subtitle="Padel Smash Gembloux · après-midi"
                rows={MERCREDI}
              />
            </Reveal>
            <Reveal delay={60}>
              <Planning
                title="Planning samedis · Nouveau"
                subtitle="Padel Smash Gembloux · matin"
                rows={SAMEDI}
              />
            </Reveal>
          </div>
        </Section>
      </div>

      <Section>
        <SectionHead
          eyebrow="Tarifs cycles annuels 2026–2027"
          title={
            <>
              Plus vous prenez, <span className="gold">moins c&apos;est cher</span>
            </>
          }
          lead="Séances d'1h · location comprise. Le cycle annuel complet revient à seulement 13 € par séance."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <PriceCard label="9 cours · sept. → déc. 2026" price="150 €" unit="/ enfant" />
          <PriceCard label="18 cours · sept. 2026 → mars 2027" price="275 €" unit="/ enfant" />
          <PriceCard
            label="27 cours · sept. 2026 → juin 2027"
            price="350 €"
            unit="/ enfant"
            highlight="Le meilleur calcul"
            note="≈ 13 € / séance"
          />
        </div>
      </Section>

      <div className="border-t border-[var(--line)] bg-[var(--bg-2)] band">
        <Section>
          <SectionHead
            eyebrow="Coaching individuel enfant"
            title={<>Cours <span className="gold">à la carte</span></>}
            lead="Coaching individuel, terrain et matériel compris. Horaires à convenir avec le coach, flexible 7 j/7. 1h30 sur demande (×1,5)."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <PriceCard label="Par enfant · 1h" price="45 €" unit="/ 1h" />
            <PriceCard label="Par enfant · 1h30" price="65 €" unit="/ 1h30" />
          </div>
          <div className="mt-8">
            <CtaLink href="/inscription">Inscrire mon enfant</CtaLink>
          </div>
        </Section>
      </div>
    </>
  );
}
