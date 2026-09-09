import Link from "next/link";
import { Reveal } from "./motion";
import { Parallax, Tilt } from "./depth";
import { CHAPTERS, chapterOf, neighbours } from "./story";

/** Titre Bebas Neue. `parts` : chaque segment avec sa variante de couleur. */
export function Display({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={`d ${className}`}>{children}</span>;
}

export function Eyebrow({
  children,
  left,
}: {
  children: React.ReactNode;
  left?: boolean;
}) {
  return (
    <span className={`eyebrow ${left ? "eyebrow--left" : ""}`}>{children}</span>
  );
}

export function CtaLink({
  href,
  children,
  variant = "gold",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "ghost";
}) {
  return (
    <Link href={href} className={`btn btn--${variant}`}>
      {children}
    </Link>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`mx-auto max-w-6xl px-5 py-16 sm:py-24 ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  center,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={`flex flex-col gap-4 ${center ? "items-center text-center" : ""}`}>
      <Eyebrow left={!center}>{eyebrow}</Eyebrow>
      <h2 className="d max-w-3xl text-[2.75rem] leading-[0.9] sm:text-6xl">
        {title}
      </h2>
      {lead ? (
        <p
          className={`text-pretty text-[var(--ink-55)] ${center ? "max-w-2xl" : "max-w-xl"}`}
        >
          {lead}
        </p>
      ) : null}
    </Reveal>
  );
}

export function PriceCard({
  label,
  price,
  unit,
  highlight,
  note,
}: {
  label: string;
  price: string;
  unit?: string;
  highlight?: string;
  note?: string;
}) {
  return (
    <Tilt max={7}>
      <div
        className={`flex h-full flex-col p-6 ${highlight ? "card card--gold" : "card"}`}
      >
        <div className="pop flex h-full flex-col">
          {highlight ? (
            <span className="mb-3 w-fit rounded-[2px] bg-[var(--gold)] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
              {highlight}
            </span>
          ) : null}
          <span className="text-sm text-[var(--ink-55)]">{label}</span>
          <span className="d mt-3 text-5xl tabular-nums">
            {price}
            {unit ? (
              <span className="ml-1.5 align-baseline text-sm font-normal not-italic tracking-normal text-[var(--ink-40)] [font-family:var(--font-body)]">
                {unit}
              </span>
            ) : null}
          </span>
          {note ? (
            <span className="mt-2 text-xs text-[var(--ink-40)]">{note}</span>
          ) : null}
        </div>
      </div>
    </Tilt>
  );
}

export function FeatureCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <Tilt max={5}>
      <div className="card h-full p-6">
        <div className="pop">
          <h3 className="d text-xl leading-none">{title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-55)]">
            {text}
          </p>
        </div>
      </div>
    </Tilt>
  );
}

/** Décor de fond en profondeur : la photo du court dérive plus lentement. */
export function CourtBackdrop({ opacity = 78 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Parallax speed={0.22} className="absolute inset-0">
        <div className="absolute -inset-y-[22%] inset-x-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/court-bg.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-full scale-110 object-cover"
          />
        </div>
      </Parallax>
      <div
        className="absolute inset-0"
        style={{ background: `rgba(7,7,7,${opacity / 100})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070707]/40 to-[#070707]" />
      {/* Vignettage : creuse le centre de l'image */}
      <div className="absolute inset-0 [background:radial-gradient(120%_80%_at_50%_35%,transparent,rgba(0,0,0,0.75))]" />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  primary,
  secondary,
  story,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  /** Chemin de la page, pour afficher son numéro de chapitre. */
  story?: string;
}) {
  const chapter = story ? chapterOf(story) : undefined;

  return (
    <div className="relative overflow-hidden border-b border-[var(--line)]">
      <CourtBackdrop />

      <div className="scene relative z-10 mx-auto max-w-4xl px-5 py-24 text-center sm:py-32">
        <Parallax speed={-0.06}>
          <div className="hero-rise flex flex-col items-center gap-6">
            {chapter ? (
              <span className="chapter-badge">
                Chapitre {chapter.n}
                <span className="text-[var(--ink-40)]">·</span>
                <span className="text-[var(--ink-70)]">{chapter.title}</span>
              </span>
            ) : (
              <Eyebrow>{eyebrow}</Eyebrow>
            )}
            <h1 className="d extrude text-5xl leading-[0.9] sm:text-7xl">
              {title}
            </h1>
            <p className="max-w-xl text-pretty text-[var(--ink-55)]">{lead}</p>
            {primary || secondary ? (
              <div className="flex flex-wrap justify-center gap-3">
                {primary ? (
                  <CtaLink href={primary.href}>{primary.label}</CtaLink>
                ) : null}
                {secondary ? (
                  <CtaLink href={secondary.href} variant="ghost">
                    {secondary.label}
                  </CtaLink>
                ) : null}
              </div>
            ) : null}
          </div>
        </Parallax>
      </div>
    </div>
  );
}

/* ===========================================================================
   Le fil du récit
   =========================================================================== */

/** Fin de page : d'où l'on vient, où l'on va dans l'histoire. */
export function StoryNav({ story }: { story: string }) {
  const { prev, next } = neighbours(story);
  if (!prev && !next) return null;

  return (
    <div className="border-t border-[var(--line)] bg-[var(--bg-2)]">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex items-center justify-between gap-4">
          <Eyebrow left>Suite du récit</Eyebrow>
          <Link
            href="/#le-fil"
            className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-40)] transition-colors hover:text-[var(--gold-bright)]"
          >
            Tout le fil →
          </Link>
        </div>

        <div className="scene mt-6 grid gap-4 md:grid-cols-2">
          {prev ? <StoryCard chapter={prev} direction="prev" /> : <div />}
          {next ? <StoryCard chapter={next} direction="next" /> : null}
        </div>
      </div>
    </div>
  );
}

function StoryCard({
  chapter,
  direction,
}: {
  chapter: { n: string; href: string; title: string; teaser: string };
  direction: "prev" | "next";
}) {
  const isNext = direction === "next";
  return (
    <Tilt max={5}>
      <Link
        href={chapter.href}
        className={`card group flex h-full flex-col p-6 ${isNext ? "card--gold" : ""}`}
      >
        <div className={`pop flex h-full flex-col ${isNext ? "items-end text-right" : ""}`}>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-40)]">
            {isNext ? "Chapitre suivant" : "Chapitre précédent"}
          </span>
          <span className="d mt-2 text-3xl">
            <span className="gold">{chapter.n}</span> — {chapter.title}
          </span>
          <span className="mt-3 flex-1 text-sm leading-relaxed text-[var(--ink-55)]">
            {chapter.teaser}
          </span>
          <span className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--gold)] transition-colors group-hover:text-[var(--gold-bright)]">
            {isNext ? "Lire la suite →" : "← Revenir"}
          </span>
        </div>
      </Link>
    </Tilt>
  );
}

/** Accueil : le récit complet, en profondeur. */
export function StoryTimeline() {
  return (
    <div className="scene relative mt-12">
      {/* Rail doré */}
      <div className="story-rail absolute left-[15px] top-0 hidden h-full w-px sm:block" />

      <ol className="flex flex-col gap-4">
        {CHAPTERS.filter((c) => c.href !== "/").map((c, i) => (
          <li key={c.href} className="relative sm:pl-14">
            <span
              aria-hidden="true"
              className="absolute left-[9px] top-8 hidden h-3.5 w-3.5 rounded-full border border-[var(--gold)] bg-[#070707] sm:block"
            />
            <Reveal delay={i * 45}>
              <Tilt max={4}>
                <Link href={c.href} className="card group flex h-full gap-5 p-6">
                  <div className="pop flex flex-1 flex-col sm:flex-row sm:items-center sm:gap-6">
                    <span className="d text-4xl leading-none text-[var(--ink-40)] transition-colors group-hover:text-[var(--gold)] sm:w-16">
                      {c.n}
                    </span>
                    <div className="mt-2 flex-1 sm:mt-0">
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                        {c.tag}
                      </span>
                      <h3 className="d mt-1 text-2xl">{c.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--ink-55)]">
                        {c.teaser}
                      </p>
                    </div>
                    <span className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-40)] transition-colors group-hover:text-[var(--gold-bright)] sm:mt-0">
                      Lire →
                    </span>
                  </div>
                </Link>
              </Tilt>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}
