import Link from "next/link";
import { Marquee, Reveal } from "./_components/motion";
import {
  CtaLink,
  Display,
  Eyebrow,
  FeatureCard,
  Section,
  SectionHead,
  XWatermark,
} from "./_components/ui";

export const metadata = {
  title: "Cours & stages de padel à Gembloux",
  description:
    "Xperience Padel Academy — cours collectifs adultes et enfants, cours privés, stages d'été et préparation interclubs à Gembloux. Coachs P1000, P700, P500.",
};

const OFFERS = [
  {
    href: "/cours-adultes",
    kicker: "Adultes",
    title: "Cycles collectifs",
    text: "9 séances de 1h30, groupes de niveau, location comprise. Dès 230 € / joueur.",
  },
  {
    href: "/cours-enfants",
    kicker: "6–18 ans",
    title: "Cours enfants & ados",
    text: "Mercredis après-midi et samedis matin, groupes par âge. Cycles dès 150 €.",
  },
  {
    href: "/cours-prives",
    kicker: "Solo ou duo",
    title: "Cours privés",
    text: "Un coach rien que pour vous, 7 j/7. Solo 60 € / 1h, duo 70 € / 1h.",
  },
  {
    href: "/stages-ete",
    kicker: "Juillet–Août",
    title: "Stages d'été",
    text: "3 × 2h sur une semaine, en soirée. Format intensif dès 105 € / personne.",
  },
  {
    href: "/ete-indien",
    kicker: "Interclubs",
    title: "Été indien",
    text: "5 cours pour préparer la saison d'équipe. Offre équipe à 400 €.",
  },
];

const CALENDAR = [
  {
    period: "Juillet – Août",
    title: "Stages adultes",
    text: "Formule courte et intensive : 3 × 2h en une semaine, en soirée.",
    href: "/stages-ete",
  },
  {
    period: "Fin août – Septembre",
    title: "Été indien",
    text: "5 cours pour préparer les interclubs. Offre équipe dédiée.",
    href: "/ete-indien",
  },
  {
    period: "Septembre – Décembre",
    title: "Cycles d'automne",
    text: "Cycle complet de 9 séances, adultes & enfants. Progrès mesurable.",
    href: "/cours-adultes",
  },
  {
    period: "Septembre – Juin",
    title: "Cycles enfants",
    text: "À l'année, dégressif : 9, 18 ou 27 cours. Jusqu'à 13 € la séance.",
    href: "/cours-enfants",
  },
];

const COACHES = [
  {
    name: "Nicolas Bertholet",
    role: "Co-fondateur · P1000",
    text: "Lecture du terrain chirurgicale, schémas tactiques offensifs.",
  },
  {
    name: "Stéphane Stellings",
    role: "Co-fondateur · P700",
    text: "Prof de tennis certifié. Technique, régularité, progression structurée.",
  },
  {
    name: "Antonin Hulster",
    role: "Coach adultes · P500",
    text: "Automatismes, corrections, développement du jeu offensif.",
  },
];

const MONTHS = ["Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/court-bg.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/78 via-[#0a0a0b]/88 to-[var(--bg)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_55%_at_50%_0%,var(--gold-glow),transparent_68%)]" />
        <XWatermark className="left-1/2 top-[46%] w-[min(96vw,760px)] -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 py-28 text-center sm:py-40">
          <div className="hero-rise flex flex-col items-center gap-7">
            <Eyebrow>Xperience Padel Academy · Gembloux</Eyebrow>
            <h1 className="text-6xl text-[var(--ink)] sm:text-[7.5rem]">
              <Display>
                Élevez
                <br />
                <span className="text-[var(--gold)]">votre</span> jeu
              </Display>
            </h1>
            <p className="max-w-xl text-pretty text-[var(--ink-dim)]">
              Que vous découvriez le padel ou que vous vouliez perfectionner
              votre technique, on vous fait progresser — pas juste passer le
              temps.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <CtaLink href="/inscription">Réserver un cours</CtaLink>
              <CtaLink href="#formules" variant="ghost">
                Voir les formules
              </CtaLink>
            </div>
          </div>
        </div>
      </div>

      <Marquee
        items={[
          "Cours adultes",
          "Cours enfants",
          "Cours privés",
          "Stages été",
          "Été indien",
          "Interclubs",
        ]}
      />

      {/* À propos */}
      <Section id="a-propos">
        <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-start">
          <SectionHead
            n="01"
            eyebrow="Notre histoire"
            title={
              <>
                Deux joueurs,
                <br />
                une exigence
              </>
            }
          />
          <Reveal className="space-y-4 text-[var(--ink-dim)] md:pt-2">
            <p>
              Xperience Padel Academy est née de l&apos;envie de deux joueurs de
              compétition — Nicolas Bertholet (P1000) et Stéphane Stellings
              (P700) — de transmettre un padel exigeant et lisible.
            </p>
            <p>
              Frustrés par des cours qui « remplissent un créneau », ils ont
              construit une méthode : on analyse, on corrige, on pousse. Du
              premier cours découverte au programme interclubs, chaque joueur
              avance avec un cap clair.
            </p>
            <p className="text-xs text-[var(--ink-faint)]">
              (Texte provisoire — à réécrire avec vos mots : année de démarrage,
              déclic, ce qui vous distingue.)
            </p>
          </Reveal>
        </div>
      </Section>

      <div className="mx-auto max-w-6xl px-5">
        <hr className="court-rule" />
      </div>

      {/* Formules */}
      <Section id="formules">
        <SectionHead
          n="02"
          eyebrow="Nos formules"
          title="Trouvez la vôtre"
          lead="Cinq façons de progresser, du cours à l'unité au cycle interclubs. Terrain, matériel et coaching toujours compris."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map((o, i) => (
            <Reveal key={o.href} delay={i * 60}>
              <Link
                href={o.href}
                className="group flex h-full flex-col rounded-xl border border-[var(--line)] bg-white/[0.03] p-6 transition-colors hover:border-[var(--gold)]/50"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
                  {o.kicker}
                </span>
                <span className="mt-2 font-[family-name:var(--font-display)] text-2xl uppercase text-[var(--ink)]">
                  {o.title}
                </span>
                <span className="mt-3 flex-1 text-sm leading-relaxed text-[var(--ink-dim)]">
                  {o.text}
                </span>
                <span className="mt-5 text-sm font-semibold uppercase tracking-wide text-[var(--ink-faint)] transition-colors group-hover:text-[var(--gold-bright)]">
                  En savoir plus →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Calendrier de la saison */}
      <div className="border-y border-[var(--line)] bg-[var(--bg-2)]">
        <Section>
          <SectionHead
            n="03"
            eyebrow="Calendrier de la saison"
            title="Toute l'année, un cap"
          />
          <div className="mt-10 flex gap-3 text-xs font-semibold uppercase tracking-widest text-[var(--ink-faint)]">
            {MONTHS.map((m) => (
              <span key={m} className="flex-1 border-t border-[var(--line-strong)] pt-2">
                {m}
              </span>
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {CALENDAR.map((c, i) => (
              <Reveal key={c.title} delay={i * 60}>
                <Link
                  href={c.href}
                  className="group flex h-full flex-col rounded-xl border border-[var(--line)] bg-white/[0.03] p-6 transition-colors hover:border-[var(--gold)]/50"
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
                    {c.period}
                  </span>
                  <span className="mt-2 font-[family-name:var(--font-display)] text-xl uppercase text-[var(--ink)]">
                    {c.title}
                  </span>
                  <span className="mt-3 flex-1 text-sm leading-relaxed text-[var(--ink-dim)]">
                    {c.text}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Section>
      </div>

      {/* Coachs */}
      <Section id="coachs">
        <SectionHead
          n="04"
          eyebrow="L'équipe encadrante"
          title="Des coachs qui jouent vraiment"
          lead="P1000, P700, P500 — ils pratiquent à haut niveau. Ce qu'ils transmettent, ils le vivent sur le court."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {COACHES.map((c, i) => (
            <Reveal key={c.name} delay={i * 70}>
              <div className="h-full rounded-xl border border-[var(--line)] bg-white/[0.03] p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
                  {c.role}
                </div>
                <div className="mt-2 font-[family-name:var(--font-display)] text-xl uppercase text-[var(--ink)]">
                  {c.name}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ink-dim)]">
                  {c.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-8">
          <CtaLink href="/coachs" variant="ghost">
            Toute l&apos;équipe
          </CtaLink>
        </div>
      </Section>

      {/* Pourquoi */}
      <Section className="pt-0">
        <div className="grid gap-4 sm:grid-cols-3">
          <Reveal delay={0}>
            <FeatureCard
              n="01"
              title="Encadrement pro"
              text="Des coachs qui jouent à haut niveau et transmettent ce qu'ils vivent sur le court."
            />
          </Reveal>
          <Reveal delay={70}>
            <FeatureCard
              n="02"
              title="Progression suivie"
              text="Groupes de niveau, retours concrets à chaque séance, cap clair sur tout le cycle."
            />
          </Reveal>
          <Reveal delay={140}>
            <FeatureCard
              n="03"
              title="Sans surprise"
              text="Terrain, matériel et coaching compris. Vous réservez, on s'occupe du reste."
            />
          </Reveal>
        </div>
      </Section>

      {/* CTA final */}
      <Section className="pt-0">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--gold)]/40 bg-[var(--gold-glow)] px-6 py-16 text-center">
          <XWatermark className="right-0 top-1/2 w-[320px] -translate-y-1/2 translate-x-1/4 opacity-[0.07]" />
          <h2 className="relative text-4xl text-[var(--ink)] sm:text-5xl">
            <Display>Prêt à jouer ?</Display>
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-[var(--ink-dim)]">
            Crée ton compte, choisis un créneau, on te recontacte pour former ton
            groupe. Paiement par virement, aucune surprise.
          </p>
          <div className="relative mt-8">
            <CtaLink href="/inscription">Réserver ma place</CtaLink>
          </div>
        </div>
      </Section>
    </>
  );
}
