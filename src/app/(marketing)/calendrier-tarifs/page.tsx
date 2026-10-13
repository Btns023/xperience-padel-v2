import Link from "next/link";
import { Reveal } from "../_components/motion";
import { CtaLink, PageHero, PriceCard, Section, SectionHead } from "../_components/ui";
import { RENTREE } from "../_components/season";
import {
  CONGES_2026_2027,
  DEBUT_VACANCES_ETE,
  periodeLabel,
} from "../_components/vacances";
import {
  CYCLE_ADULTE,
  CYCLE_ENFANT_TARIFS,
  COURS_PRIVE_TARIFS,
  ETE_INDIEN,
  STAGE_ETE,
  type Tarif,
  prix,
} from "../_components/tarifs";

export const metadata = {
  title: "Calendrier & tarifs",
  description:
    "Tous les tarifs de l'Xperience Padel Academy et le calendrier de la saison 2026-2027 : dates de rentrée, congés scolaires, cycles adultes et enfants, cours privés et stages.",
};

/** Une grille de trois cartes de prix. */
function TarifGrid({ tarifs }: { tarifs: Tarif[] }) {
  return (
    <div className="scene mt-8 grid gap-4 sm:grid-cols-3">
      {tarifs.map((t, i) => (
        <Reveal key={t.label} delay={i * 50}>
          <PriceCard
            name={t.name}
            label={t.hint ? `${t.label} — ${t.hint}` : t.label}
            price={prix(t.cents)}
            unit={t.unit}
            highlight={t.highlight}
            note={t.note}
          />
        </Reveal>
      ))}
    </div>
  );
}

function Bloc({
  eyebrow,
  title,
  lead,
  tarifs,
  href,
  hrefLabel,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead: string;
  tarifs: Tarif[];
  href: string;
  hrefLabel: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <SectionHead eyebrow={eyebrow} title={title} lead={lead} />
      <TarifGrid tarifs={tarifs} />
      {children}
      <div className="mt-8">
        <CtaLink href={href} variant="ghost">
          {hrefLabel}
        </CtaLink>
      </div>
    </>
  );
}

export default function CalendrierTarifsPage() {
  return (
    <>
      <PageHero
        eyebrow="Saison 2026-2027 · Padel Smash Gembloutois"
        title={
          <>
            Le calendrier et <span className="gold">tous les tarifs</span>
          </>
        }
        lead="Les dates de la saison, les congés scolaires et le prix de chaque formule, réunis sur une seule page. Terrain, matériel et coaching sont toujours compris."
        primary={{ href: "/inscription", label: "Réserver ma place" }}
        secondary={{ href: "/contact", label: "Poser une question" }}
      />

      {/* --- Le calendrier de la saison ----------------------------------- */}
      <Section id="calendrier">
        <SectionHead
          eyebrow="Le calendrier"
          title={
            <>
              Quand est-ce que <span className="gold">ça commence</span> ?
            </>
          }
          lead="Les cycles suivent l'année scolaire. Chaque groupe garde le même jour et la même heure d'un bout à l'autre du cycle."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Reveal>
            <div className="card card--gold h-full p-6">
              <div className="pop">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                  Cycles adultes
                </span>
                <div className="d mt-2 text-2xl">{RENTREE.adultes.label}</div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ink-55)]">
                  {CYCLE_ADULTE.sessions} séances de {CYCLE_ADULTE.duree}, en
                  groupes de niveau.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div className="card card--gold h-full p-6">
              <div className="pop">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                  Cycles enfants &amp; ados
                </span>
                <div className="d mt-2 text-2xl">{RENTREE.enfants.label}</div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ink-55)]">
                  Séances d&apos;1h, le mercredi après-midi ou le samedi matin,
                  en groupes d&apos;âge.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* --- Congés scolaires : énoncé une seule fois sur tout le site ----- */}
      <div className="border-y border-[var(--line)] bg-[var(--bg-2)] band">
        <Section id="conges">
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <SectionHead
              eyebrow="Une règle simple"
              title={
                <>
                  Pas de cours pendant
                  <br />
                  les <span className="gold">congés scolaires</span>
                </>
              }
            />
            <Reveal className="md:pt-2">
              <p className="text-[var(--ink-55)]">
                Les séances ne sont ni données ni comptées pendant les congés
                scolaires : le cycle reprend simplement à la rentrée, au même
                jour et à la même heure. Vous ne payez que des séances qui ont
                lieu, et un cycle de 27 cours reste un cycle de 27 cours.
              </p>
              <ul className="mt-7 flex flex-col divide-y divide-[var(--line)] rounded-[3px] border border-[var(--line)]">
                {CONGES_2026_2027.map((c) => (
                  <li
                    key={c.nom}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"
                  >
                    <span className="font-semibold text-white">{c.nom}</span>
                    <span className="text-sm text-[var(--ink-55)]">
                      {periodeLabel(c)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-[var(--ink-40)]">
                Calendrier de la Fédération Wallonie-Bruxelles. La saison
                s&apos;arrête avec le début des vacances d&apos;été, le{" "}
                {new Date(`${DEBUT_VACANCES_ETE}T00:00:00Z`).toLocaleDateString(
                  "fr-BE",
                  { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" },
                )}
                .
              </p>
            </Reveal>
          </div>
        </Section>
      </div>

      {/* --- Tarifs -------------------------------------------------------- */}
      <Section id="adultes">
        <Bloc
          eyebrow="Cycles adultes"
          title={
            <>
              Cours collectifs <span className="gold">adultes</span>
            </>
          }
          lead={`${CYCLE_ADULTE.sessions} séances de ${CYCLE_ADULTE.duree}, en groupe de niveau. Le prix par joueur baisse à mesure que le groupe se remplit.`}
          tarifs={CYCLE_ADULTE.tarifs}
          href="/cours-adultes"
          hrefLabel="Voir les cours adultes"
        />
      </Section>

      <div className="mx-auto max-w-6xl px-5">
        <hr className="rule-gold" />
      </div>

      <Section id="enfants">
        <Bloc
          eyebrow="Cycles enfants & ados · 6-18 ans"
          title={
            <>
              Trois formules, <span className="gold">un seul groupe</span>
            </>
          }
          lead="Votre enfant rejoint le groupe de son âge ; vous choisissez seulement la durée de son engagement. Plus le cycle est long, moins la séance coûte cher."
          tarifs={CYCLE_ENFANT_TARIFS}
          href="/cours-enfants"
          hrefLabel="Voir les cours enfants"
        >
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-[var(--ink-55)]">
            Les trois formules se donnent dans le même cours : un enfant inscrit
            en « Découverte » qui veut continuer garde sa place et ne paie que
            la différence.
          </p>
        </Bloc>
      </Section>

      <div className="mx-auto max-w-6xl px-5">
        <hr className="rule-gold" />
      </div>

      <Section id="prives">
        <Bloc
          eyebrow="Cours privés · sans engagement"
          title={
            <>
              Un coach rien que <span className="gold">pour vous</span>
            </>
          }
          lead="Une séance quand vous en avez besoin, 7 j/7, à l'horaire convenu avec le coach. La séance d'1h30 est facturée une fois et demie la séance d'1h."
          tarifs={COURS_PRIVE_TARIFS}
          href="/cours-prives"
          hrefLabel="Voir les cours privés"
        />
      </Section>

      <div className="mx-auto max-w-6xl px-5">
        <hr className="rule-gold" />
      </div>

      <Section id="stages">
        <Bloc
          eyebrow="Stage intensif · semaines du 19 et du 26 octobre"
          title={
            <>
              Court et <span className="gold">intensif</span>
            </>
          }
          lead={`${STAGE_ETE.format}, en soirée. On progresse vite quand on ne redescend pas entre deux séances.`}
          tarifs={STAGE_ETE.tarifs}
          href="/stages-ete"
          hrefLabel="Voir le stage intensif"
        />
      </Section>

      <div className="mx-auto max-w-6xl px-5">
        <hr className="rule-gold" />
      </div>

      <Section id="interclubs">
        <Bloc
          eyebrow="Été indien · cycle terminé, de retour en fin d'été"
          title={
            <>
              Préparation <span className="gold">interclubs</span>
            </>
          }
          lead={`${ETE_INDIEN.sessions} cours de ${ETE_INDIEN.duree} pour arriver prêts à la saison d'équipe. Le prochain cycle aura lieu fin août ; les tarifs sont donnés à titre indicatif.`}
          tarifs={ETE_INDIEN.tarifs}
          href="/ete-indien"
          hrefLabel="Voir l'été indien"
        >
          <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-[3px] border border-[var(--line)] px-4 py-3">
            <span className="font-semibold text-white">Forfait équipe</span>
            <span className="d figure text-2xl tabular-nums text-[var(--gold)]">
              {prix(ETE_INDIEN.forfaitEquipeCents)}
            </span>
            <span className="text-sm text-[var(--ink-55)]">
              pour l&apos;équipe complète, quel que soit le nombre de joueurs
              présents.
            </span>
          </div>
        </Bloc>
      </Section>

      {/* --- Ce qui est compris -------------------------------------------- */}
      <div className="border-t border-[var(--line)] bg-[var(--bg-2)] band">
        <Section>
          <SectionHead
            eyebrow="Sans supplément"
            title={
              <>
                Ce qui est <span className="gold">toujours compris</span>
              </>
            }
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["La location du terrain", "Le court est réservé à votre nom, le prix affiché est le prix final."],
              ["Le matériel", "Balles et matériel pédagogique fournis. Raquettes disponibles pour débuter."],
              ["Le coaching", "Un coach diplômé et classé par groupe, du premier au dernier cours."],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 60}>
                <div className="card h-full p-6">
                  <div className="pop">
                    <h3 className="d text-xl leading-none">{t}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--ink-55)]">
                      {d}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm text-[var(--ink-55)]">
            Le paiement se fait par virement, après confirmation de votre
            inscription et réception de la facture. Aucun paiement en ligne,
            aucune donnée bancaire ne nous est communiquée. Les conditions
            complètes figurent dans nos{" "}
            <Link href="/conditions" className="text-[var(--gold)] hover:underline">
              conditions générales
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaLink href="/inscription">Réserver ma place</CtaLink>
            <CtaLink href="/contact" variant="ghost">
              Une question ? Écrivez-nous
            </CtaLink>
          </div>
        </Section>
      </div>
    </>
  );
}
