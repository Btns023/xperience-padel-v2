import { CtaLink, Display, Eyebrow, PageHero, Section } from "../_components/ui";

export const metadata = {
  title: "Nos coachs de padel",
  description:
    "Les coachs de Xperience Padel Academy : Nicolas Bertholet P1000, Stéphane Stellings P700, Antonin Hulster P500. Cours privés disponibles à Gembloux.",
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
        title={<>Des coachs qui jouent vraiment</>}
        lead="P1000, P700, P500 — nos coachs ne parlent pas de padel en théorie, ils le pratiquent à haut niveau. Ce qu'ils vous transmettent, ils le vivent sur le court."
        primary={{ href: "/inscription", label: "Réserver un cours privé" }}
      />

      <Section>
        <Eyebrow>L&apos;équipe adultes</Eyebrow>
        <div className="mt-8 flex flex-col gap-4">
          {COACHES.map((c) => (
            <div
              key={c.name}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-[#c9a24b]">
                {c.role}
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {c.name}
              </h2>
              <p className="mt-3 max-w-2xl text-white/65">{c.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <Eyebrow>Encadrement kids</Eyebrow>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="text-2xl text-white">
            <Display>Poste coach kids — recrutement ouvert</Display>
          </h2>
          <p className="mt-3 max-w-2xl text-white/65">
            Nous recherchons un coach passionné et diplômé pour encadrer nos
            jeunes talents. Vous avez l&apos;expérience, l&apos;énergie et le goût
            du travail bien fait ?
          </p>
          <p className="mt-4">
            <a
              href="mailto:info@padelxp.be?subject=Candidature%20Coach%20Padel%20Kids%20XPA"
              className="text-sm font-semibold text-[#c9a24b] hover:underline"
            >
              Postuler → info@padelxp.be
            </a>
          </p>
        </div>
        <div className="mt-8">
          <CtaLink href="/inscription">Réserver un cours privé</CtaLink>
        </div>
      </Section>
    </>
  );
}
