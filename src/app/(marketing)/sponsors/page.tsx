import { PageHero, Section, SectionHead } from "../_components/ui";

export const metadata = {
  title: "Sponsors & partenaires",
  description:
    "Les partenaires de Xperience Padel Academy à Gembloux : Pano Gembloux, Bowling Le Leader. Devenez partenaire XPA.",
};

const PARTNERS = [
  { name: "Pano Gembloux", url: "https://pano-gembloux.be" },
  { name: "Bowling Le Leader", url: "https://bowlingleleader.be" },
];

export default function SponsorsPage() {
  return (
    <>
      <PageHero
        eyebrow="Ils croient au projet XPA"
        title={
          <>
            Nos <span className="gold">partenaires</span>
          </>
        }
        lead="Des acteurs locaux engagés à nos côtés, qui partagent nos valeurs d'excellence, de proximité et de passion."
      />

      <Section>
        <SectionHead eyebrow="Partenaires actuels" title={<>Merci pour <span className="gold">leur soutien</span></>} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PARTNERS.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="card flex items-center justify-between p-8"
            >
              <span className="d text-2xl">{p.name}</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
                Visiter →
              </span>
            </a>
          ))}
        </div>
      </Section>

      <div className="border-t border-[var(--line)] bg-[var(--bg-2)] band">
        <Section>
          <div className="card card--gold p-8 text-center">
            <h2 className="d text-3xl sm:text-4xl">
              Vous voulez devenir partenaire ?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[var(--ink-55)]">
              Rejoignez les acteurs locaux qui soutiennent le développement du
              padel à Gembloux. Contactez-nous pour discuter d&apos;un
              partenariat adapté à vos objectifs.
            </p>
            <p className="mt-6">
              <a
                href="mailto:info@padelxp.be?subject=Partenariat%20XPA"
                className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--gold)] hover:text-[var(--gold-bright)]"
              >
                Nous contacter → info@padelxp.be
              </a>
            </p>
          </div>
        </Section>
      </div>
    </>
  );
}
