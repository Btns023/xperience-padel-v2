import { Section } from "../_components/ui";

export const metadata = {
  title: "Conditions d'inscription",
  description:
    "Conditions générales d'inscription aux cours et stages de Xperience Padel Academy (Padel XP ASBL) : réservation, tarifs, paiement, annulation.",
};

function Article({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-white/10 pt-6">
      <h2 className="text-lg font-semibold text-white">
        {n}. {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/65">
        {children}
      </div>
    </section>
  );
}

export default function ConditionsPage() {
  return (
    <Section className="max-w-3xl">
      <h1 className="text-4xl font-semibold text-white">
        Conditions d&apos;inscription
      </h1>
      <p className="mt-3 text-sm text-white/45">
        Applicables aux cours et stages organisés par Padel XP ASBL. Dernière
        mise à jour : {new Date().toLocaleDateString("fr-BE")}.
      </p>

      <div className="mt-10 flex flex-col gap-8">
        <Article n="1" title="Organisateur">
          <p>
            Padel XP ASBL (Xperience Padel Academy), Chaussée de Wavre 79, 5030
            Gembloux — n° d&apos;entreprise BE 1031.094.162 — info@padelxp.be —
            0473 / 607 207.
          </p>
        </Article>

        <Article n="2" title="Inscription">
          <p>
            L&apos;inscription se fait en ligne depuis un compte. La personne
            qui inscrit indique le ou les joueurs concernés (nom, prénom,
            e-mail, date de naissance, niveau) et répond au droit à
            l&apos;image. Pour une inscription au nom d&apos;une entreprise ou
            d&apos;une équipe, le responsable communique les coordonnées de
            chaque joueur ; une seule facture est adressée à
            l&apos;entreprise / au responsable.
          </p>
          <p>
            L&apos;inscription vaut demande. Elle devient définitive lorsque
            l&apos;académie a constitué le groupe et émis la facture
            correspondante.
          </p>
        </Article>

        <Article n="3" title="Groupes et niveaux">
          <p>
            L&apos;académie constitue les groupes par niveau et fixe
            l&apos;effectif. Un joueur peut s&apos;inscrire sur un créneau dont
            l&apos;étiquette de niveau ne correspond pas exactement au sien :
            l&apos;académie ajuste si nécessaire.
          </p>
        </Article>

        <Article n="4" title="Tarifs">
          <p>
            Les tarifs des cours collectifs sont indiqués par joueur et{" "}
            <strong className="text-white">dépendent de l&apos;effectif du
            groupe</strong> (plus le groupe est nombreux, plus le tarif par
            joueur est réduit). Le montant définitif est communiqué une fois
            l&apos;effectif confirmé. Le terrain, le matériel pédagogique et le
            coaching sont compris.
          </p>
          <p>
            En cas d&apos;inscription en cours de cycle, le tarif est ramené au
            prorata des séances restantes, arrondi à l&apos;euro.
          </p>
          <p>
            Padel XP ASBL n&apos;est pas assujettie à la TVA ; les factures sont
            émises sans TVA (mention légale portée sur la facture).
          </p>
        </Article>

        <Article n="5" title="Paiement">
          <p>
            Le paiement s&apos;effectue{" "}
            <strong className="text-white">exclusivement par virement</strong>{" "}
            bancaire, sur la base de la facture, en indiquant la communication
            structurée qui y figure. Aucun paiement en ligne n&apos;est demandé
            lors de l&apos;inscription.
          </p>
          <p>
            La facture est payable dans le délai qui y est indiqué. À défaut de
            paiement à l&apos;échéance, des rappels sont envoyés. Tout retard de
            paiement peut donner lieu, de plein droit et sans mise en demeure
            préalable, à une indemnité forfaitaire de 10 % du montant impayé avec
            un minimum de 40 euros.
          </p>
        </Article>

        <Article n="6" title="Annulation et remboursement">
          <p>
            Toute demande d&apos;annulation se fait en contactant
            l&apos;académie depuis l&apos;espace client. En cas d&apos;annulation
            acceptée, le montant déjà facturé est intégralement remboursé au
            moyen d&apos;une note de crédit.
          </p>
          <p>
            L&apos;académie se réserve le droit d&apos;annuler ou de reporter un
            créneau faute de participants suffisants ; le cas échéant, les
            sommes correspondantes sont remboursées.
          </p>
        </Article>

        <Article n="7" title="Droit à l'image">
          <p>
            Le consentement à l&apos;utilisation de photos ou vidéos est
            recueilli joueur par joueur, séparément de l&apos;inscription, et
            peut être retiré à tout moment par e-mail. Un refus n&apos;empêche
            pas l&apos;inscription.
          </p>
        </Article>

        <Article n="8" title="Données personnelles">
          <p>
            Le traitement des données est décrit dans la{" "}
            <a href="/confidentialite" className="text-[#c9a24b]">
              politique de confidentialité
            </a>
            .
          </p>
        </Article>

        <Article n="9" title="Droit applicable">
          <p>
            Les présentes conditions sont régies par le droit belge. Tout litige
            relève des tribunaux de l&apos;arrondissement du siège de
            l&apos;ASBL.
          </p>
        </Article>
      </div>
    </Section>
  );
}
