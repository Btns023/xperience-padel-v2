import { Section } from "../_components/ui";

export const metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment Xperience Padel Academy (Padel XP ASBL) traite vos données personnelles : finalités, base légale, durées de conservation et vos droits.",
};

function Article({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[var(--line)] pt-6">
      <h2 className="d text-lg">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--ink-55)]">
        {children}
      </div>
    </section>
  );
}

export default function ConfidentialitePage() {
  return (
    <Section className="max-w-3xl">
      <h1 className="d text-5xl">
        Politique de confidentialité
      </h1>
      <p className="mt-3 text-sm text-[var(--ink-40)]">
        Dernière mise à jour : {new Date().toLocaleDateString("fr-BE")}.
      </p>

      <div className="mt-10 flex flex-col gap-8">
        <Article title="1. Responsable du traitement">
          <p>
            <strong className="text-white">Padel XP ASBL</strong> — nom
            commercial <em>Xperience Padel Academy</em>. Siège : Chaussée de
            Wavre 79, 5030 Gembloux, Belgique. Numéro d&apos;entreprise BE
            1031.094.162. Contact :{" "}
            <a href="mailto:info@padelxp.be" className="text-[var(--gold)]">
              info@padelxp.be
            </a>{" "}
            · 0473 / 607 207.
          </p>
        </Article>

        <Article title="2. Données que nous collectons">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-white">Compte</strong> : nom, prénom,
              adresse e-mail, téléphone, adresse postale.
            </li>
            <li>
              <strong className="text-white">Joueurs inscrits</strong> : nom,
              prénom, adresse e-mail, date de naissance, niveau de jeu, réponse
              au droit à l&apos;image (oui / non).
            </li>
            <li>
              <strong className="text-white">Entreprises clientes</strong> :
              raison sociale, adresse, numéro de TVA éventuel.
            </li>
            <li>
              <strong className="text-white">Inscriptions et facturation</strong>{" "}
              : créneaux choisis, groupe, factures, paiements, communications
              structurées.
            </li>
            <li>
              <strong className="text-white">Présences</strong> (facultatif,
              saisies par le coach) pour le suivi pédagogique.
            </li>
          </ul>
          <p>
            Nous ne collectons <strong className="text-white">aucune donnée de
            santé</strong> (pas d&apos;information médicale ni de certificat).
          </p>
        </Article>

        <Article title="3. Finalités et bases légales">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Gestion des inscriptions, constitution des groupes, planning,
              facturation et suivi des paiements —{" "}
              <em>exécution du contrat</em> (art. 6.1.b RGPD).
            </li>
            <li>
              Envoi des e-mails liés à votre dossier (accusé de réception,
              facture, relances) — <em>exécution du contrat</em> ; les e-mails
              non essentiels sont paramétrables dans votre espace.
            </li>
            <li>
              Utilisation de photos ou vidéos à des fins de communication —{" "}
              <em>consentement</em> distinct, donné joueur par joueur et
              révocable à tout moment.
            </li>
            <li>
              Respect de nos obligations comptables et fiscales —{" "}
              <em>obligation légale</em>.
            </li>
          </ul>
        </Article>

        <Article title="4. Mineurs">
          <p>
            Les données des joueurs mineurs sont fournies et gérées par le
            parent ou le responsable via son compte. Le consentement au droit à
            l&apos;image pour un mineur est donné par ce représentant.
          </p>
        </Article>

        <Article title="5. Destinataires et sous-traitants">
          <p>
            Vos données sont accessibles aux administrateurs de l&apos;ASBL et,
            de façon limitée, à votre coach (liste de ses groupes, coordonnées,
            statut payé / impayé — sans les montants). Nous faisons appel à :
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-white">Supabase</strong> — hébergement de
              la base de données et de l&apos;authentification (région Union
              européenne).
            </li>
            <li>
              <strong className="text-white">Vercel</strong> — hébergement de
              l&apos;application (région Union européenne).
            </li>
            <li>
              <strong className="text-white">Resend</strong> — envoi des e-mails
              transactionnels.
            </li>
          </ul>
          <p>
            Aucune donnée n&apos;est vendue ni transmise à des fins publicitaires.
          </p>
        </Article>

        <Article title="6. Durées de conservation">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Compte et joueurs : pendant la relation, puis{" "}
              <strong className="text-white">3 ans</strong> après la dernière
              activité.
            </li>
            <li>
              Factures et pièces comptables :{" "}
              <strong className="text-white">7 ans</strong> (obligation légale
              belge).
            </li>
          </ul>
        </Article>

        <Article title="7. Cookies">
          <p>
            Le site n&apos;utilise que des cookies{" "}
            <strong className="text-white">strictement nécessaires</strong> au
            fonctionnement (session de connexion). Aucun cookie de mesure
            d&apos;audience ni de publicité — aucune bannière de consentement
            n&apos;est donc requise.
          </p>
        </Article>

        <Article title="8. Vos droits">
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de rectification,
            d&apos;effacement, de limitation, d&apos;opposition et de
            portabilité. Pour l&apos;exercer, écrivez à{" "}
            <a href="mailto:info@padelxp.be" className="text-[var(--gold)]">
              info@padelxp.be
            </a>
            . Vous pouvez aussi introduire une réclamation auprès de
            l&apos;Autorité de protection des données (
            <a
              href="https://www.autoriteprotectiondonnees.be"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--gold)]"
            >
              autoriteprotectiondonnees.be
            </a>
            ).
          </p>
        </Article>

        <Article title="9. Sécurité">
          <p>
            L&apos;accès aux données est protégé par authentification et par des
            règles de séparation par rôle. Les échanges sont chiffrés (HTTPS).
          </p>
        </Article>
      </div>
    </Section>
  );
}
