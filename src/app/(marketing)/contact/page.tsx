import Link from "next/link";
import { Reveal } from "../_components/motion";
import { PageHero, Section, SectionHead } from "../_components/ui";
import { ContactForm } from "./contact-form";
import { CONTACT_EMAIL, CONTACT_PHONE } from "./coordonnees";

export const metadata = {
  title: "Contact",
  description:
    "Contactez l'Xperience Padel Academy à Gembloux : 0473 60 72 07, info@padelxp.be, Padel Smash Gembloux, Chaussée de Charleroi 206.",
};

const TERRAIN = {
  nom: "Padel Smash Gembloux",
  rue: "Chaussée de Charleroi 206",
  ville: "5030 Gembloux",
};

const ASBL = {
  nom: "Padel XP ASBL",
  rue: "Chaussée de Wavre 79",
  ville: "5030 Gembloux",
  bce: "BE 1031.094.162",
};

const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${TERRAIN.nom}, ${TERRAIN.rue}, ${TERRAIN.ville}`,
)}`;

/** Les questions les plus fréquentes, avec la page qui y répond vraiment. */
const RACCOURCIS: { q: string; r: string; href: string; label: string }[] = [
  {
    q: "Vous cherchez un prix ou une date ?",
    r: "Tous les tarifs et le calendrier de la saison, congés scolaires compris, sont réunis sur une seule page.",
    href: "/calendrier-tarifs",
    label: "Calendrier & tarifs",
  },
  {
    q: "Vous ne savez pas quelle formule choisir ?",
    r: "Trois questions suffisent pour vous orienter vers le bon cours.",
    href: "/#guide",
    label: "Trouver ma formule",
  },
  {
    q: "Vous voulez réserver une place ?",
    r: "L'inscription se fait en ligne. Nous vous confirmons le groupe et l'horaire avant toute facturation.",
    href: "/inscription",
    label: "S'inscrire",
  },
];

function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[var(--line)] py-4 last:border-b-0">
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">
        {label}
      </span>
      <span className="text-[var(--ink-55)]">{children}</span>
    </div>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Gembloux · Belgique"
        title={
          <>
            Parlons de <span className="gold">votre jeu</span>
          </>
        }
        lead="Une question sur un cours, un groupe, un horaire ou une facture ? Écrivez-nous, ou appelez : c'est un des coachs qui répond, pas un standard."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Coordonnées */}
          <div>
            <SectionHead
              eyebrow="Nous joindre"
              title={
                <>
                  Directement, <span className="gold">sans détour</span>
                </>
              }
            />

            <Reveal className="mt-8">
              <div className="card p-6">
                <Ligne label="Téléphone">
                  <a
                    href={`tel:+32${CONTACT_PHONE.replace(/\D/g, "").slice(1)}`}
                    className="text-white transition-colors hover:text-[var(--gold-bright)]"
                  >
                    {CONTACT_PHONE}
                  </a>
                  <span className="block text-xs text-[var(--ink-40)]">
                    En semaine, de 9h à 20h.
                  </span>
                </Ligne>
                <Ligne label="E-mail">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-white transition-colors hover:text-[var(--gold-bright)]"
                  >
                    {CONTACT_EMAIL}
                  </a>
                  <span className="block text-xs text-[var(--ink-40)]">
                    Réponse sous 48 heures.
                  </span>
                </Ligne>
                <Ligne label="Où se donnent les cours">
                  <a
                    href={MAPS}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white transition-colors hover:text-[var(--gold-bright)]"
                  >
                    {TERRAIN.nom}
                  </a>
                  <span className="block text-xs text-[var(--ink-40)]">
                    {TERRAIN.rue} · {TERRAIN.ville}
                  </span>
                </Ligne>
                <Ligne label="Siège de l'ASBL">
                  {ASBL.nom}
                  <span className="block text-xs text-[var(--ink-40)]">
                    {ASBL.rue} · {ASBL.ville} · {ASBL.bce}
                  </span>
                </Ligne>
              </div>
            </Reveal>

            <Reveal className="mt-4" delay={60}>
              <p className="text-sm leading-relaxed text-[var(--ink-55)]">
                Vous êtes déjà inscrit ? Vos factures, vos séances et vos
                joueurs se trouvent dans{" "}
                <Link href="/connexion" className="text-[var(--gold)] hover:underline">
                  votre espace personnel
                </Link>
                .
              </p>
            </Reveal>
          </div>

          {/* Formulaire */}
          <div>
            <SectionHead
              eyebrow="Écrivez-nous"
              title={
                <>
                  Votre message
                  <br />
                  en <span className="gold">deux minutes</span>
                </>
              }
            />
            <Reveal className="mt-8">
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Raccourcis : beaucoup de questions ont déjà leur page */}
      <div className="border-t border-[var(--line)] bg-[var(--bg-2)] band">
        <Section>
          <SectionHead
            eyebrow="Avant d'écrire"
            title={
              <>
                La réponse est peut-être <span className="gold">déjà là</span>
              </>
            }
          />
          <div className="scene mt-10 grid gap-4 md:grid-cols-3">
            {RACCOURCIS.map((r, i) => (
              <Reveal key={r.href} delay={i * 60}>
                <Link href={r.href} className="card group flex h-full flex-col p-6">
                  <span className="pop flex h-full flex-col">
                    <span className="d text-xl leading-tight">{r.q}</span>
                    <span className="mt-3 flex-1 text-sm leading-relaxed text-[var(--ink-55)]">
                      {r.r}
                    </span>
                    <span className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-40)] transition-colors group-hover:text-[var(--gold-bright)]">
                      {r.label} →
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
