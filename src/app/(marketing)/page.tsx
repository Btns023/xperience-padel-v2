import Link from "next/link";
import { Reveal } from "./_components/motion";
import { Parallax, Tilt } from "./_components/depth";
import {
  CourtBackdrop,
  CtaLink,
  Eyebrow,
  FeatureCard,
  PriceCard,
  Section,
  SectionHead,
  StoryTimeline,
} from "./_components/ui";

export const metadata = {
  title: "Cours & stages de padel à Gembloux",
  description:
    "Xperience Padel Academy — cours collectifs adultes et enfants, cours privés, stages d'été et préparation interclubs à Gembloux. Coachs P1000, P700, P500.",
};

const CALENDAR = [
  { period: "Juillet – Août", title: "Stages adultes", text: "Formule courte et intensive : 3 × 2h en une semaine.", href: "/stages-ete" },
  { period: "Fin août – Septembre", title: "Été indien", text: "5 cours pour préparer les interclubs. Offre équipe dédiée.", href: "/ete-indien" },
  { period: "Septembre – Décembre", title: "Cycles d'automne", text: "Cycle complet de 9 séances, adultes & enfants.", href: "/cours-adultes" },
  { period: "Septembre – Juin", title: "Cycles enfants", text: "À l'année, dégressif : 9, 18 ou 27 cours.", href: "/cours-enfants" },
];

const COACHES = [
  { name: "Nicolas Bertholet", role: "Co-fondateur · P1000", text: "Lecture du terrain chirurgicale, schémas tactiques offensifs." },
  { name: "Stéphane Stellings", role: "Co-fondateur · P700", text: "Prof de tennis certifié. Technique, régularité, progression structurée." },
  { name: "Antonin Hulster", role: "Coach adultes · P500", text: "Automatismes, corrections, développement du jeu offensif." },
];

const MONTHS = ["Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <CourtBackdrop opacity={72} />

        <div className="scene relative z-10 mx-auto flex max-w-4xl flex-col items-center px-5 py-28 text-center sm:py-40">
          <Parallax speed={-0.08}>
            <div className="hero-rise flex flex-col items-center gap-7">
              <Eyebrow>Xperience Padel Academy · Gembloux, Belgique</Eyebrow>
              <h1 className="d extrude text-[3.5rem] leading-[0.86] sm:text-[7.5rem]">
                Élevez
                <br />
                <span className="gold extrude-gold">votre</span>{" "}
                <span className="out">jeu</span>
              </h1>
              <p className="max-w-lg text-pretty text-[var(--ink-55)]">
                Que vous découvriez le padel ou que vous souhaitiez perfectionner
                votre technique, nous vous accompagnons pour progresser
                efficacement.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <CtaLink href="/inscription">Réserver un cours</CtaLink>
                <CtaLink href="#le-fil" variant="ghost">
                  Suivre l&apos;histoire
                </CtaLink>
              </div>
            </div>
          </Parallax>
        </div>
      </div>

      {/* Notre approche */}
      <Section id="approche">
        <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-start">
          <SectionHead
            eyebrow="Notre approche"
            title={
              <>
                Progresser,
                <br />
                c&apos;est une <span className="gold">xperience</span>
              </>
            }
          />
          <Reveal className="space-y-4 text-[var(--ink-55)] md:pt-2">
            <p>
              Chez XPA, on ne fait pas semblant de coacher. Chaque séance est
              construite pour vous faire progresser — pas pour remplir un
              créneau. Nos coachs analysent, corrigent, poussent. Et ça se voit
              sur le court.
            </p>
            <p>
              Du premier cours découverte au programme interclubs, vous êtes
              entre les mains de fondateurs qui jouent eux-mêmes à haut niveau —
              Nicolas Bertholet (P1000) et Stéphane Stellings (P700). Pas de
              discours : des résultats.
            </p>
            <p className="text-xs text-[var(--ink-40)]">
              (Texte provisoire — à réécrire avec vos mots : année de démarrage,
              déclic, ce qui vous distingue.)
            </p>
          </Reveal>
        </div>
      </Section>

      <div className="mx-auto max-w-6xl px-5">
        <hr className="rule-gold" />
      </div>

      {/* Le fil — le récit, chapitre par chapitre */}
      <Section id="le-fil">
        <SectionHead
          eyebrow="Le fil XPA · 7 chapitres"
          title={
            <>
              Votre histoire,
              <br />
              <span className="gold">chapitre après chapitre</span>
            </>
          }
          lead="Du premier échange à la préparation des interclubs, chaque page raconte une étape du parcours. Suivez-les dans l'ordre, ou entrez par celle qui vous ressemble."
        />
        <StoryTimeline />
      </Section>

      {/* Calendrier de la saison */}
      <div className="border-y border-[var(--line)] bg-[var(--bg-2)]">
        <Section>
          <SectionHead
            eyebrow="Toute la saison 2026"
            title={
              <>
                L&apos;Xperience Padel XP
                <br />
                de <span className="gold">juin à décembre</span>
              </>
            }
          />
          <div className="mt-10 flex gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-40)]">
            {MONTHS.map((m) => (
              <span
                key={m}
                className="flex-1 border-t border-[var(--line-3)] pt-2"
              >
                {m}
              </span>
            ))}
          </div>
          <div className="scene mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {CALENDAR.map((c, i) => (
              <Reveal key={c.title} delay={i * 50}>
                <Tilt max={7}>
                  <Link href={c.href} className="card flex h-full flex-col p-6">
                    <span className="pop flex h-full flex-col">
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">
                        {c.period}
                      </span>
                      <span className="d mt-2 text-xl">{c.title}</span>
                      <span className="mt-3 flex-1 text-sm leading-relaxed text-[var(--ink-55)]">
                        {c.text}
                      </span>
                    </span>
                  </Link>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </Section>
      </div>

      {/* Cours privés à la carte */}
      <Section>
        <SectionHead
          eyebrow="Sans engagement"
          title="Cours privés à la carte"
          lead="En solo ou en duo. Séance 1h standard, 1h30 possible (×1,5). Terrain et matériel compris."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-4">
          <PriceCard label="Solo · 1h" price="60 €" />
          <PriceCard label="Solo · 1h30" price="90 €" />
          <PriceCard label="Duo · 1h" price="70 €" note="prix total" />
          <PriceCard label="Duo · 1h30" price="105 €" note="prix total" />
        </div>
      </Section>

      {/* Coachs */}
      <div className="border-y border-[var(--line)] bg-[var(--bg-2)]">
        <Section id="coachs">
          <SectionHead
            eyebrow="L'équipe encadrante"
            title="Des coachs qui jouent vraiment"
            lead="P1000, P700, P500 — ils pratiquent à haut niveau. Ce qu'ils transmettent, ils le vivent sur le court."
          />
          <div className="scene mt-10 grid gap-4 sm:grid-cols-3">
            {COACHES.map((c, i) => (
              <Reveal key={c.name} delay={i * 60}>
                <Tilt max={6}>
                  <div className="card h-full p-6">
                    <div className="pop">
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">
                        {c.role}
                      </div>
                      <div className="d mt-2 text-xl">{c.name}</div>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--ink-55)]">
                        {c.text}
                      </p>
                    </div>
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
          <div className="mt-8">
            <CtaLink href="/coachs" variant="ghost">
              Toute l&apos;équipe
            </CtaLink>
          </div>
        </Section>
      </div>

      {/* Valeurs */}
      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          <Reveal>
            <FeatureCard
              title="Encadrement professionnel"
              text="Des coachs qui jouent à haut niveau et transmettent ce qu'ils vivent sur le court."
            />
          </Reveal>
          <Reveal delay={60}>
            <FeatureCard
              title="Progression personnalisée"
              text="Groupes de niveau, retours concrets à chaque séance, cap clair sur tout le cycle."
            />
          </Reveal>
          <Reveal delay={120}>
            <FeatureCard
              title="Ambiance conviviale"
              text="On vient pour progresser et pour le plaisir de jouer. Les deux vont ensemble."
            />
          </Reveal>
        </div>
      </Section>

      {/* CTA final */}
      <Section className="pt-0">
        <div className="scene">
          <Tilt max={3}>
            <div className="card card--gold px-6 py-14 text-center">
              <div className="pop">
                <span className="chapter-badge">Épilogue · à vous d&apos;écrire</span>
                <h2 className="d extrude mt-5 text-4xl sm:text-5xl">
                  Prêt à jouer ?
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-[var(--ink-55)]">
                  Crée ton compte, choisis un créneau, on te recontacte pour
                  former ton groupe. Paiement par virement, aucune surprise.
                </p>
                <div className="mt-7 flex justify-center">
                  <CtaLink href="/inscription">Réserver ma place</CtaLink>
                </div>
              </div>
            </div>
          </Tilt>
        </div>
      </Section>
    </>
  );
}
