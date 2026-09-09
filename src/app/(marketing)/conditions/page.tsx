import { Section } from "../_components/ui";
import { CGV_ARTICLES, CGV_TITLE } from "@/lib/cgv";

export const metadata = {
  title: "Conditions générales de vente",
  description:
    "Conditions générales de vente de Xperience Padel Academy (Padel XP ASBL) : inscription, tarifs, paiement, retard, annulation, assurance.",
};

export default function ConditionsPage() {
  return (
    <Section className="max-w-3xl">
      <h1 className="text-4xl font-semibold text-white">{CGV_TITLE}</h1>
      <p className="mt-3 text-sm text-white/45">Padel XP ASBL · Xperience Padel Academy</p>

      <div className="mt-10 flex flex-col gap-8">
        {CGV_ARTICLES.map((a) => (
          <section key={a.n} className="border-t border-white/10 pt-6">
            <h2 className="text-lg font-semibold text-white">
              {a.n}. {a.title}
            </h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-white/65">
              {a.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm text-white/50">
        Voir aussi la{" "}
        <a href="/confidentialite" className="text-[#c9a24b]">
          politique de confidentialité
        </a>
        .
      </p>
    </Section>
  );
}
