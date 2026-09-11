import Link from "next/link";
import { Reveal } from "./_components/motion";
import { Parallax, Tilt } from "./_components/depth";
import { FormuleFinder } from "./_components/formule-finder";
import { RENTREE, SEASON_YEAR } from "./_components/season";
import {
  CourtBackdrop,
  CtaLink,
  Eyebrow,
  FeatureCard,
  PriceTable,
  Section,
  SectionHead,
} from "./_components/ui";

const OFFERS = [
  { href: "/cours-adultes", k: "Adultes", t: "Cycles collectifs", d: "9 séances de 1h30, groupes de niveau. Dès 230 € / joueur." },
  { href: "/cours-enfants", k: "6–18 ans", t: "Cours enfants & ados", d: "Mercredis après-midi et samedis matin, groupes par âge. Dès 150 €." },
  { href: "/cours-prives", k: "Solo ou duo", t: "Cours privés", d: "Un coach rien que pour vous, 7 j/7. Solo 60 € / 1h." },
  { href: "/stages-ete", k: "Juillet–Août", t: "Stages d'été", d: "3 × 2h sur une semaine, en soirée. Dès 105 € / personne." },
  { href: "/ete-indien", k: "Interclubs", t: "Été indien", d: "5 cours pour préparer la saison d'équipe. Offre équipe 400 €." },
];

export const metadata = {
  title: "Cours & stages de padel à Gembloux",
  description:
    "Xperience Padel Academy — cours collectifs adultes et enfants, cours privés, stages d'été et préparation interclubs à Gembloux. Coachs P1000, P700, P500, P300.",
};

/** Le calendrier se met à jour tout seul : re-rendu toutes les heures. */
export const revalidate = 3600;

const CALENDAR = [
  {
    start: "2026-07-01",
    end: "2026-08-31",
    period: "Juillet – Août",
    title: "Stages adultes",
    text: "Formule courte et intensive : 3 × 2h en une semaine.",
    href: "/stages-ete",
  },
  {
    start: "2026-08-24",
    end: "2026-09-30",
    period: "Fin août – Septembre",
    title: "Été indien",
    text: "5 cours pour préparer les interclubs. Offre équipe dédiée.",
    href: "/ete-indien",
  },
  {
    start: RENTREE.enfants.iso,
    end: "2027-06-30",
    period: "Septembre 2026 – juin 2027",
    title: "Cycles enfants",
    date: RENTREE.enfants.label,
    text: "À l'année, dégressif : 9, 18 ou 27 cours.",
    href: "/cours-enfants",
  },
  {
    start: RENTREE.adultes.iso,
    end: "2026-12-31",
    period: "Octobre – Décembre",
    title: "Cycle adultes",
    date: RENTREE.adultes.label,
    text: "Cycle complet de 9 séances de 1h30, en groupes de niveau.",
    href: "/cours-adultes",
  },
];

type Phase = "passe" | "encours" | "avenir";

function phaseOf(start: string, end: string, today: string): Phase {
  if (today > end) return "passe";
  if (today >= start) return "encours";
  return "avenir";
}

const PHASE_TAG: Record<Phase, string> = {
  passe: "Terminé",
  encours: "En cours",
  avenir: "À venir",
};

const PRIVE_POINTS: [string, string][] = [
  ["Quand vous voulez", "7 j/7, l'horaire se fixe directement avec le coach."],
  ["Seul ou à deux", "À deux, vous partagez le court et le tarif."],
  ["1 h ou 1 h 30", "La séance longue laisse le temps de vraiment travailler."],
  ["Tout compris", "Location du terrain et matériel inclus dans le prix."],
];

const COACHES = [
  { name: "Nicolas Bertholet", role: "Co-fondateur · P1000", text: "Lecture du terrain chirurgicale, schémas tactiques offensifs." },
  { name: "Stéphane Stellings", role: "Co-fondateur · P700", text: "Prof de tennis certifié. Technique, régularité, progression structurée." },
  { name: "Antonin Hulster", role: "Coach adultes · P500", text: "Automatismes, corrections, développement du jeu offensif." },
  { name: "Andréa Maronet", role: "Coach enfants · P300", text: "Éducatrice physique. Motricité, coordination et bases techniques pour les 6–18 ans." },
];

/** Les 7 mois de la saison, avec leur numéro (1 = janvier). */
const MONTHS: [string, number][] = [
  ["Juin", 6],
  ["Juil", 7],
  ["Août", 8],
  ["Sept", 9],
  ["Oct", 10],
  ["Nov", 11],
  ["Déc", 12],
];

export default function HomePage() {
  // Date du jour à Bruxelles, au format AAAA-MM-JJ (comparable tel quel).
  const today = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Brussels",
  }).format(new Date());
  const [yearNow, monthNow] = today.split("-").map(Number);

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
                <CtaLink href="#guide" variant="ghost">
                  Trouver ma formule
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

      {/* Guide — trouve ta formule */}
      <Section id="guide">
        <SectionHead
          eyebrow="En trois questions"
          title={
            <>
              Trouvez <span className="gold">votre formule</span>
            </>
          }
          lead="Vous ne savez pas par où commencer ? Répondez à trois questions, on vous oriente vers le bon cours."
        />
        <Reveal className="mt-10">
          <FormuleFinder />
        </Reveal>
      </Section>

      <div className="mx-auto max-w-6xl px-5">
        <hr className="rule-gold" />
      </div>

      {/* Formules */}
      <Section id="formules">
        <SectionHead
          eyebrow="Toutes nos formules"
          title={<>Le détail, <span className="gold">formule par formule</span></>}
          lead="Cinq façons de progresser, du cours à l'unité au cycle interclubs. Terrain, matériel et coaching toujours compris."
        />
        <div className="scene mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map((o, i) => (
            <Reveal key={o.href} delay={i * 50}>
              <Tilt max={7}>
                <Link
                  href={o.href}
                  className="card group flex h-full flex-col p-6"
                >
                  <span className="pop flex h-full flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                      {o.k}
                    </span>
                    <span className="d mt-2 text-2xl">{o.t}</span>
                    <span className="mt-3 flex-1 text-sm leading-relaxed text-[var(--ink-55)]">
                      {o.d}
                    </span>
                    <span className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-40)] transition-colors group-hover:text-[var(--gold-bright)]">
                      En savoir plus →
                    </span>
                  </span>
                </Link>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Calendrier de la saison */}
      <div className="border-y border-[var(--line)] bg-[var(--bg-2)] band">
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
          <div className="mt-10 flex gap-2 text-[11px] font-semibold uppercase tracking-[0.2em]">
            {MONTHS.map(([label, m]) => {
              const past =
                yearNow > SEASON_YEAR ||
                (yearNow === SEASON_YEAR && monthNow > m);
              const now = yearNow === SEASON_YEAR && monthNow === m;
              return (
                <span
                  key={label}
                  className={`flex-1 border-t pt-2 ${
                    now
                      ? "border-[var(--gold)] text-[var(--gold)]"
                      : past
                        ? "border-[var(--line)] text-white/20"
                        : "border-[var(--line-3)] text-[var(--ink-40)]"
                  }`}
                >
                  {label}
                  {now ? (
                    <span className="ml-1.5 hidden text-[9px] tracking-normal sm:inline">
                      • en cours
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
          <div className="scene mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {CALENDAR.map((c, i) => {
              const phase = phaseOf(c.start, c.end, today);
              return (
              <Reveal key={c.title} delay={i * 50}>
                <Tilt max={7}>
                  <Link
                    href={c.href}
                    className={`card flex h-full flex-col p-6 ${
                      phase === "passe"
                        ? "opacity-45 grayscale transition-opacity hover:opacity-80"
                        : ""
                    } ${phase === "encours" ? "card--gold" : ""}`}
                  >
                    <span className="pop flex h-full flex-col">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">
                          {c.period}
                        </span>
                        <span
                          className={`shrink-0 rounded-[2px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${
                            phase === "encours"
                              ? "bg-[var(--gold)] text-black"
                              : "border border-[var(--line-2)] text-[var(--ink-40)]"
                          }`}
                        >
                          {PHASE_TAG[phase]}
                        </span>
                      </span>
                      <span className="d mt-2 text-xl">{c.title}</span>
                      {c.date ? (
                        <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
                          {c.date}
                        </span>
                      ) : null}
                      <span className="mt-3 flex-1 text-sm leading-relaxed text-[var(--ink-55)]">
                        {c.text}
                      </span>
                    </span>
                  </Link>
                </Tilt>
              </Reveal>
              );
            })}
          </div>
        </Section>
      </div>

      {/* Cours privés à la carte */}
      <Section>
        <SectionHead
          eyebrow="Sans engagement"
          title={<>Cours privés <span className="gold">à la carte</span></>}
          lead="La formule sans cycle ni groupe à constituer : vous réservez une séance quand vous en avez besoin."
        />
        <Reveal className="mt-10">
          <div className="card grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h3 className="d text-2xl sm:text-3xl">
                Un coach rien que <span className="gold">pour vous</span>
              </h3>
              <p className="mt-4 text-[var(--ink-55)]">
                Pas de groupe à attendre, pas de compromis sur le contenu :
                toute la séance est construite autour de votre jeu, de vos
                objectifs et de votre niveau. C&apos;est la formule la plus
                directe pour débloquer un geste qui résiste, partir sur de
                bonnes bases avant un cycle, ou préparer une échéance précise.
              </p>
              <ul className="mt-7 flex flex-col gap-4">
                {PRIVE_POINTS.map(([t, d]) => (
                  <li key={t} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-px w-4 shrink-0 bg-[var(--gold)]"
                    />
                    <span className="text-sm leading-relaxed">
                      <span className="font-semibold text-white">{t}</span>
                      <span className="text-[var(--ink-55)]"> — {d}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <CtaLink href="/inscription">Réserver un cours privé</CtaLink>
              </div>
            </div>

            <div className="lg:border-l lg:border-[var(--line)] lg:pl-16">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                Les tarifs
              </span>
              <div className="mt-4">
                <PriceTable
                  bare
                  columns={["1 h", "1 h 30"]}
                  rows={[
                    { label: "Solo", prices: ["60 €", "90 €"] },
                    {
                      label: "À deux",
                      hint: "prix total, pas par joueur",
                      prices: ["70 €", "105 €"],
                    },
                  ]}
                  note="Facturation après confirmation, par virement. Aucun paiement en ligne."
                />
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Coachs */}
      <div className="border-y border-[var(--line)] bg-[var(--bg-2)] band">
        <Section id="coachs">
          <SectionHead
            eyebrow="L'équipe encadrante"
            title={<>Des coachs qui <span className="gold">jouent vraiment</span></>}
            lead="P1000, P700, P500, P300 — ils pratiquent à haut niveau. Ce qu'ils transmettent, ils le vivent sur le court."
          />
          <div className="scene mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <h2 className="d extrude text-4xl sm:text-5xl">
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
