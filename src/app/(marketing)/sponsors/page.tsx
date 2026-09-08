import { Display, Eyebrow, PageHero, Section } from "../_components/ui";

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
        title={<>Nos partenaires</>}
        lead="Des acteurs locaux engagés à nos côtés, qui partagent nos valeurs d'excellence, de proximité et de passion."
      />

      <Section>
        <Eyebrow>Partenaires actuels</Eyebrow>
        <h2 className="mt-4 text-4xl text-white sm:text-5xl">
          <Display>Merci pour leur soutien</Display>
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PARTNERS.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-8 transition-colors hover:border-[#c9a24b]/50"
            >
              <span className="text-lg font-semibold text-white">{p.name}</span>
              <span className="text-sm text-[#c9a24b]">Visiter →</span>
            </a>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="rounded-2xl border border-[#c9a24b]/40 bg-[#c9a24b]/[0.07] p-8 text-center">
          <h2 className="text-2xl text-white">
            <Display>Vous voulez devenir partenaire ?</Display>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/65">
            Rejoignez les acteurs locaux qui soutiennent le développement du
            padel à Gembloux. Contactez-nous pour discuter d&apos;un partenariat
            adapté à vos objectifs.
          </p>
          <p className="mt-6">
            <a
              href="mailto:info@padelxp.be?subject=Partenariat%20XPA"
              className="text-sm font-semibold text-[#c9a24b] hover:underline"
            >
              Nous contacter → info@padelxp.be
            </a>
          </p>
        </div>
      </Section>
    </>
  );
}
