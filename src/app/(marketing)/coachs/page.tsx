import { Reveal } from "../_components/motion";
import {
  CtaLink,
  PageHero,
  Section,
  SectionHead,
} from "../_components/ui";

export const metadata = {
  title: "Nos coachs de padel",
  description:
    "Les coachs de Xperience Padel Academy : Nicolas Bertholet P1000, Stéphane Stellings P700, Antonin Hulster P500, Andréa Maronet P300 pour les enfants. Cours privés à Gembloux.",
};

const COACHES = [
  {
    name: "Nicolas Bertholet",
    role: "Co-fondateur · classement P1000",
    text: "P1000, le niveau parle de lui-même. Nicolas transmet une lecture du terrain chirurgicale et l'ambition de vous pousser au-delà de vos limites. Spécialiste tactique et schémas offensifs.",
  },
  {
    name: "Stéphane Stellings",
    role: "Co-fondateur · P700 · prof de tennis",
    text: "P700 et professeur de tennis certifié. Sa double maîtrise lui permet de décoder votre jeu en quelques échanges. Expert technique, régularité et progression structurée.",
  },
  {
    name: "Antonin Hulster",
    role: "Coach adultes · classement P500",
    text: "P500 et coach adultes de référence chez XPA. Antonin identifie ce qui freine votre jeu et le corrige. Spécialiste automatismes, corrections et développement du jeu offensif.",
  },
];

export default function CoachsPage() {
  return (
    <>
      <PageHero
        eyebrow="Équipe encadrante · Xperience Padel Academy"
        title={
          <>
            Des coachs qui <span className="gold">jouent vraiment</span>
          </>
        }
        lead="P1000, P700, P500, P300 — nos coachs ne parlent pas de padel en théorie, ils le pratiquent à haut niveau. Ce qu'ils vous transmettent, ils le vivent sur le court."
        primary={{ href: "/inscription", label: "Réserver un cours privé" }}
      />

      <Section>
        <SectionHead eyebrow="L'équipe adultes" title={<>Trois profils, <span className="gold">une méthode</span></>} />
        <div className="mt-8 flex flex-col gap-4">
          {COACHES.map((c, i) => (
            <Reveal key={c.name} delay={i * 60}>
              <div className="card p-6 sm:p-8">
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">
                  {c.role}
                </div>
                <h2 className="d mt-2 text-3xl">{c.name}</h2>
                <p className="mt-3 max-w-2xl text-[var(--ink-55)]">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <div className="border-t border-[var(--line)] bg-[var(--bg-2)] band">
        <Section>
          <SectionHead
            eyebrow="Encadrement kids"
            title={
              <>
                Une <span className="gold">enseignante</span> pour nos jeunes
              </>
            }
            lead="Le poste de coach kids est pourvu : Andréa Maronet rejoint XPA pour encadrer les 6–18 ans, les mercredis après-midi et les samedis matin."
          />
          <div className="mt-8">
            <Reveal>
              <div className="card card--gold p-6 sm:p-8">
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">
                  Coach enfants &amp; ados · classement P300
                </div>
                <h2 className="d mt-2 text-3xl">Andréa Maronet</h2>
                <p className="mt-3 max-w-2xl text-[var(--ink-55)]">
                  P300 et enseignante de profession, Andréa a l&apos;habitude de
                  travailler avec les enfants au quotidien. Elle assure aussi la
                  préparation physique de jeunes équipes de hockey, apportant
                  rigueur, pédagogie et énergie à chaque séance.
                </p>
              </div>
            </Reveal>
          </div>
          <div className="mt-8">
            <CtaLink href="/cours-enfants">Voir les cours enfants</CtaLink>
          </div>
        </Section>
      </div>
    </>
  );
}
