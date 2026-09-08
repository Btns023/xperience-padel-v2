import { Section } from "../_components/ui";

export const metadata = {
  title: "Confidentialité",
  description:
    "Politique de confidentialité de Xperience Padel Academy — traitement des données personnelles.",
};

export default function ConfidentialitePage() {
  return (
    <Section className="prose-invert max-w-3xl">
      <h1 className="text-3xl font-semibold text-white">
        Politique de confidentialité
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/65">
        <p>
          <strong className="text-white">Responsable du traitement.</strong>{" "}
          Padel XP ASBL (Xperience Padel Academy), Chaussée de Wavre 79, 5030
          Gembloux — n° d&apos;entreprise BE 1031.094.162 — info@padelxp.be.
        </p>
        <p>
          <strong className="text-white">Données collectées.</strong> Lors
          d&apos;une inscription : identité, coordonnées, date de naissance et
          niveau des joueurs, réponse au droit à l&apos;image. Pour les
          entreprises : raison sociale, adresse et numéro de TVA éventuel.
        </p>
        <p>
          <strong className="text-white">Finalités et base légale.</strong>{" "}
          Gestion des inscriptions, constitution des groupes, facturation et
          suivi des paiements — exécution du contrat. Le droit à l&apos;image
          fait l&apos;objet d&apos;un consentement distinct, révocable à tout
          moment.
        </p>
        <p>
          <strong className="text-white">Conservation.</strong> Les données de
          compte sont conservées pendant la durée de la relation puis 3 ans ;
          les factures sont conservées 7 ans conformément à la législation
          comptable belge.
        </p>
        <p>
          <strong className="text-white">Vos droits.</strong> Accès,
          rectification, effacement, limitation et opposition : par e-mail à
          info@padelxp.be. Vous pouvez introduire une réclamation auprès de
          l&apos;Autorité de protection des données (autoriteprotectiondonnees.be).
        </p>
        <p>
          <strong className="text-white">Hébergement.</strong> Les données sont
          hébergées au sein de l&apos;Union européenne.
        </p>
        <p className="text-white/40">
          Document en cours de finalisation — version complète disponible sur
          demande.
        </p>
      </div>
    </Section>
  );
}
