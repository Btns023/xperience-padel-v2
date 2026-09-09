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
      <h1 className="d text-5xl">{CGV_TITLE}</h1>
      <p className="mt-3 text-sm text-[var(--ink-40)]">Padel XP ASBL · Xperience Padel Academy</p>

      <div className="mt-10 flex flex-col gap-8">
        {CGV_ARTICLES.map((a) => (
          <section key={a.n} className="border-t border-[var(--line)] pt-6">
            <h2 className="d text-lg">
              {a.n}. {a.title}
            </h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ink-55)]">
              {a.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm text-[var(--ink-40)]">
        Voir aussi la{" "}
        <a href="/confidentialite" className="text-[var(--gold)]">
          politique de confidentialité
        </a>
        .
      </p>
    </Section>
  );
}
