/** Gabarits d'e-mails (HTML simple, compatible clients de messagerie). */

import { formatEuros } from "@/lib/format";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const ACCENT = "#0E7C6B";

function layout(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f2f4f1;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#17211c">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 16px">
    <table role="presentation" width="100%" style="max-width:560px;background:#fff;border:1px solid #e0e4de;border-radius:12px">
      <tr><td style="padding:22px 28px;border-bottom:1px solid #eef0ec">
        <span style="font-weight:700;letter-spacing:.04em;color:${ACCENT}">XPERIENCE PADEL ACADEMY</span>
      </td></tr>
      <tr><td style="padding:26px 28px">
        <h1 style="margin:0 0 14px;font-size:19px">${title}</h1>
        ${body}
      </td></tr>
      <tr><td style="padding:18px 28px;border-top:1px solid #eef0ec;font-size:12px;color:#5c6b64">
        Xperience Padel Academy · Chaussée de Wavre 79, 5030 Gembloux · info@padelxp.be
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:${ACCENT};color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">${label}</a>`;
const p = (t: string) => `<p style="margin:0 0 12px;line-height:1.5">${t}</p>`;

/**
 * Neutralise le HTML d'un texte saisi par un visiteur. Les autres gabarits
 * reprennent des données que nous avons nous-mêmes écrites en base ; le
 * formulaire de contact, lui, est ouvert à tout le monde.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type Mail = { subject: string; html: string };

export function coachInviteMail(o: { coachName: string; url: string }): Mail {
  return {
    subject: "Ton accès coach Xperience Padel",
    html: layout(
      "Rejoins l'équipe coach",
      p(`Bonjour ${o.coachName},`) +
        p(
          "L'académie t'a créé un accès coach. Clique pour activer ton compte et voir tes groupes :",
        ) +
        `<p style="margin:18px 0">${btn(o.url, "Activer mon accès coach")}</p>` +
        p(
          `<span style="font-size:13px;color:#5c6b64">Ou copie ce lien : ${o.url}</span>`,
        ),
    ),
  };
}

export function playerAddedMail(o: {
  playerName: string;
  addedBy: string;
}): Mail {
  return {
    subject: "Tu as été inscrit à Xperience Padel",
    html: layout(
      "Une inscription à ton nom",
      p(`Bonjour ${o.playerName},`) +
        p(
          `${o.addedBy} t'a inscrit à une activité de l'Xperience Padel Academy.`,
        ) +
        p(
          "Crée un compte avec cette adresse e-mail pour suivre tes cours, ton groupe et tes factures :",
        ) +
        `<p style="margin:18px 0">${btn(`${SITE}/inscription`, "Créer mon compte")}</p>`,
    ),
  };
}

export function registrationReceivedMail(o: {
  name: string;
  slotLabel: string;
}): Mail {
  return {
    subject: "Ta demande d'inscription est bien reçue",
    html: layout(
      "Demande reçue",
      p(`Bonjour ${o.name},`) +
        p(`Nous avons bien reçu ta demande d'inscription pour : <strong>${o.slotLabel}</strong>.`) +
        p(
          "L'académie constitue les groupes, puis t'enverra une facture une fois l'effectif confirmé. Aucun paiement n'est demandé à ce stade.",
        ) +
        `<p style="margin:18px 0">${btn(`${SITE}/compte/inscriptions`, "Voir mes inscriptions")}</p>`,
    ),
  };
}

export function groupConfirmedMail(o: {
  name: string;
  slotLabel: string;
  groupLabel: string;
  unitPriceCents: number | null;
}): Mail {
  return {
    subject: "Ton groupe est constitué",
    html: layout(
      "Groupe constitué",
      p(`Bonjour ${o.name},`) +
        p(
          `Ton groupe <strong>${o.groupLabel}</strong> pour ${o.slotLabel} est constitué.` +
            (o.unitPriceCents != null
              ? ` Tarif : <strong>${formatEuros(o.unitPriceCents)} / joueur</strong>.`
              : ""),
        ) +
        p("La facture correspondante te sera envoyée prochainement.") +
        `<p style="margin:18px 0">${btn(`${SITE}/compte/inscriptions`, "Voir mes inscriptions")}</p>`,
    ),
  };
}

export function invoiceIssuedMail(o: {
  number: string;
  amountCents: number;
  dueOn: string | null;
  comm: string | null;
  iban: string;
  url: string;
}): Mail {
  return {
    subject: `Facture ${o.number} — Xperience Padel`,
    html: layout(
      `Facture ${o.number}`,
      p(`Montant : <strong>${formatEuros(o.amountCents)}</strong>` +
        (o.dueOn ? ` · échéance ${o.dueOn}` : "")) +
        p(
          `Paiement par virement sur <strong>${o.iban}</strong>` +
            (o.comm ? `<br>Communication : <strong>${o.comm}</strong>` : ""),
        ) +
        `<p style="margin:18px 0">${btn(o.url, "Voir / imprimer la facture")}</p>`,
    ),
  };
}

export function paymentConfirmedMail(o: {
  number: string;
  amountCents: number;
}): Mail {
  return {
    subject: `Paiement reçu — facture ${o.number}`,
    html: layout(
      "Paiement bien reçu",
      p(
        `Nous confirmons la réception de ton paiement de <strong>${formatEuros(o.amountCents)}</strong> pour la facture ${o.number}. Merci !`,
      ),
    ),
  };
}

export type DunningLevel = 1 | 2 | 3;

export const DUNNING_LEVEL_LABEL: Record<DunningLevel, string> = {
  1: "Rappel amical",
  2: "Dernier rappel",
  3: "Mise en demeure",
};

/** Bloc de signature des administrateurs, commun aux relances. */
const SIGNATURE =
  p("Bien cordialement,") +
  p(
    "<strong>STELLINGS Stéphane</strong><br><strong>BERTHOLET Nicolas</strong><br>" +
      "Administrateurs<br>Xperience Padel Academy ASBL<br>BE 1031.094.162<br>info@padelxp.be",
  );

/** Tableau de référence de la facture. */
function invoiceBlock(o: {
  number: string;
  issuedOn: string | null;
  dueOn: string | null;
  amountCents: number;
}): string {
  const line = (k: string, v: string) =>
    `<tr><td style="padding:2px 12px 2px 0;color:#5c6b64">${k}</td><td style="padding:2px 0"><strong>${v}</strong></td></tr>`;
  return (
    `<table role="presentation" style="margin:0 0 12px;font-size:15px">` +
    line("Numéro de facture", o.number) +
    (o.issuedOn ? line("Date de facture", o.issuedOn) : "") +
    (o.dueOn ? line("Date d'échéance", o.dueOn) : "") +
    line("Montant", formatEuros(o.amountCents)) +
    `</table>`
  );
}

function paymentBlock(iban: string, comm: string | null): string {
  return p(
    `IBAN : <strong>${iban}</strong><br>Communication : <strong>${comm ?? "numéro de facture"}</strong>`,
  );
}

/**
 * Relance de facture impayée, en trois niveaux, repris des courriers de
 * l'académie : rappel amical, dernier rappel (5 jours), mise en demeure
 * (8 jours). Le quatrième niveau, la mise en demeure officielle, part par
 * courrier postal depuis l'administration.
 */
export function dunningMail(o: {
  level: DunningLevel;
  number: string;
  issuedOn: string | null;
  dueOn: string | null;
  amountCents: number;
  comm: string | null;
  iban: string;
  url: string;
}): Mail {
  const ref = invoiceBlock(o);
  const pay = paymentBlock(o.iban, o.comm);
  const voir = `<p style="margin:18px 0">${btn(o.url, "Voir la facture")}</p>`;

  if (o.level === 1) {
    return {
      subject: `Rappel amical — facture ${o.number} arrivée à échéance`,
      html: layout(
        "Rappel amical",
        p("Madame, Monsieur,") +
          p("Nous espérons que tout se passe au mieux pour vous.") +
          p(
            `Sauf erreur ou omission de notre part, la facture mentionnée ci-dessous, arrivée à échéance${o.dueOn ? ` le ${o.dueOn}` : ""}, resterait impayée à ce jour :`,
          ) +
          ref +
          p(
            "Il est bien entendu possible que votre règlement soit en cours de traitement ou qu'un simple oubli se soit produit, raison pour laquelle nous nous permettons de vous adresser ce rappel.",
          ) +
          p(
            "Nous vous serions reconnaissants de bien vouloir procéder au paiement dans les prochains jours sur le compte suivant :",
          ) +
          pay +
          p(
            "Si vous rencontrez la moindre difficulté administrative ou financière, n'hésitez pas à nous en informer. Nous restons ouverts au dialogue afin de trouver une solution adaptée.",
          ) +
          p(
            "À défaut de régularisation, les intérêts et indemnités prévus par nos conditions générales pourraient être appliqués, mais nous privilégions naturellement une résolution rapide et amiable.",
          ) +
          voir +
          SIGNATURE,
      ),
    };
  }

  if (o.level === 2) {
    return {
      subject: `Dernier rappel de paiement — facture ${o.number} échue`,
      html: layout(
        "Dernier rappel de paiement",
        p("Madame, Monsieur,") +
          p(
            "Sauf erreur ou omission de notre part, il apparaît que la facture référencée ci-dessous demeure impayée à ce jour, malgré l'échéance arrivée à terme.",
          ) +
          ref +
          p(
            "Nous vous rappelons que nos factures sont payables à l'échéance mentionnée sur celles-ci, conformément à nos conditions générales de vente.",
          ) +
          p(
            "Nous vous remercions dès lors de bien vouloir procéder au règlement du montant dû dans les plus brefs délais, et <strong>au plus tard dans les 5 jours suivant la réception du présent e-mail</strong>, sur le compte bancaire suivant :",
          ) +
          pay +
          p(
            "À défaut de paiement dans le délai précité, nous nous verrons contraints d'appliquer, de plein droit et sans mise en demeure supplémentaire, les intérêts de retard ainsi que l'indemnité forfaitaire prévus par nos conditions générales et par la législation applicable en matière de retard de paiement.",
          ) +
          p(
            "Si votre paiement a été effectué entre-temps, nous vous prions d'ignorer le présent message et vous en remercions.",
          ) +
          voir +
          SIGNATURE,
      ),
    };
  }

  return {
    subject: `Mise en demeure — facture ${o.number} impayée`,
    html: layout(
      "Mise en demeure",
      p("Madame, Monsieur,") +
        p(
          "Malgré notre précédent rappel, sauf erreur ou omission de notre part, la facture mentionnée ci-dessous demeure impayée à ce jour :",
        ) +
        ref +
        p(
          "En conséquence, par la présente, nous vous mettons formellement en demeure de procéder au paiement de la somme totale due <strong>dans un délai de 8 jours calendrier</strong> à compter de la réception du présent message.",
        ) +
        p("À défaut de paiement dans ce délai, nous appliquerons, de plein droit et sans autre mise en demeure :") +
        `<ul style="margin:0 0 12px;padding-left:18px;line-height:1.5">
          <li>les intérêts de retard, calculés conformément à nos conditions générales et à la législation applicable en matière de retard de paiement ;</li>
          <li>l'indemnité forfaitaire prévue contractuellement ;</li>
          <li>ainsi que tous frais de recouvrement supplémentaires éventuels.</li>
        </ul>` +
        p(
          "Nous nous verrons également contraints d'envisager toute procédure de recouvrement appropriée, y compris par voie judiciaire, aux frais du débiteur.",
        ) +
        pay +
        p(
          "Si votre paiement a été effectué entre-temps, nous vous prions de ne pas tenir compte du présent message. Nous vous invitons à nous contacter sans délai si vous estimez que cette demande repose sur une erreur ou si vous souhaitez convenir d'un arrangement.",
        ) +
        voir +
        SIGNATURE,
    ),
  };
}

export function cancellationRequestAdminMail(o: {
  playerName: string;
  slotLabel: string;
  requester: string;
}): Mail {
  return {
    subject: "Demande d'annulation d'inscription",
    html: layout(
      "Demande d'annulation",
      p(
        `${o.requester} demande l'annulation de l'inscription de <strong>${o.playerName}</strong> (${o.slotLabel}).`,
      ) +
        `<p style="margin:18px 0">${btn(`${SITE}/admin/demandes`, "Traiter la demande")}</p>`,
    ),
  };
}

export function firstSessionReminderMail(o: {
  name: string;
  date: string;
  time: string;
  place: string;
  groupLabel: string;
}): Mail {
  return {
    subject: "Ta première séance approche",
    html: layout(
      "Première séance dans 3 jours",
      p(`Bonjour ${o.name},`) +
        p(
          `Rappel : première séance du groupe <strong>${o.groupLabel}</strong> le <strong>${o.date}</strong> à ${o.time}${o.place ? ` — ${o.place}` : ""}.`,
        ),
    ),
  };
}

export function adminWeeklyDigestMail(o: {
  count: number;
  lines: string[];
}): Mail {
  return {
    subject: `Récap hebdo : ${o.count} nouvelle(s) demande(s)`,
    html: layout(
      "Nouvelles demandes cette semaine",
      p(`${o.count} demande(s) d'inscription reçue(s) :`) +
        `<ul style="margin:0 0 12px;padding-left:18px">${o.lines
          .map((l) => `<li style="margin-bottom:4px">${l}</li>`)
          .join("")}</ul>` +
        `<p style="margin:18px 0">${btn(`${SITE}/admin/demandes`, "Ouvrir les demandes")}</p>`,
    ),
  };
}

export function extensionOfferMail(o: {
  name: string;
  playerName: string;
  slotLabel: string;
  currentCount: number;
  endDate: string;
  options: { count: number; extraCents: number; toDate: string | null }[];
}): Mail {
  return {
    subject: `Prolonger le cycle de ${o.playerName} ?`,
    html: layout(
      "Le cycle touche à sa fin",
      p(`Bonjour ${o.name},`) +
        p(
          `Les ${o.currentCount} cours de <strong>${o.playerName}</strong> (${o.slotLabel}) se terminent le <strong>${o.endDate}</strong>.`,
        ) +
        p("Pour continuer avec le même groupe, tu peux prolonger dès maintenant — tu ne paies que la différence :") +
        `<ul style="margin:0 0 12px;padding-left:18px">${o.options
          .map(
            (x) =>
              `<li style="margin-bottom:4px"><strong>${x.count} cours</strong>${x.toDate ? ` (jusqu'au ${x.toDate})` : ""} : + ${formatEuros(x.extraCents)}</li>`,
          )
          .join("")}</ul>` +
        p("Les places libérées sont ensuite proposées aux nouveaux inscrits.") +
        `<p style="margin:18px 0">${btn(`${SITE}/compte/inscriptions`, "Prolonger")}</p>`,
    ),
  };
}

export function extensionAdminMail(o: {
  playerName: string;
  slotLabel: string;
  from: number;
  to: number;
  extraCents: number;
  invoiced: boolean;
}): Mail {
  return {
    subject: `Prolongation : ${o.playerName} passe à ${o.to} cours`,
    html: layout(
      "Prolongation demandée",
      p(
        `<strong>${o.playerName}</strong> (${o.slotLabel}) passe de ${o.from} à ${o.to} cours — supplément ${formatEuros(o.extraCents)}.`,
      ) +
        p(
          o.invoiced
            ? "Une facture complémentaire a été créée en brouillon : relis-la puis émets-la."
            : "L'inscription n'était pas encore facturée : le nouveau montant sera repris sur la facture du groupe.",
        ) +
        `<p style="margin:18px 0">${btn(
          `${SITE}/admin/${o.invoiced ? "factures" : "demandes"}`,
          o.invoiced ? "Voir les factures" : "Voir les demandes",
        )}</p>`,
    ),
  };
}

/**
 * Message envoyé depuis le formulaire de contact du site.
 * Tout ce que le visiteur écrit est échappé : c'est la seule entrée publique.
 */
export function contactMessageMail(o: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}): Mail {
  const safe = {
    name: escapeHtml(o.name),
    email: escapeHtml(o.email),
    phone: o.phone ? escapeHtml(o.phone) : null,
    subject: escapeHtml(o.subject),
    message: escapeHtml(o.message).replace(/\n/g, "<br>"),
  };
  const row = (k: string, v: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#5c6b64;white-space:nowrap">${k}</td><td style="padding:4px 0">${v}</td></tr>`;

  return {
    subject: `Site — ${safe.subject}`,
    html: layout(
      "Message depuis le site",
      `<table role="presentation" style="font-size:14px;margin-bottom:16px">
        ${row("Nom", safe.name)}
        ${row("E-mail", `<a href="mailto:${safe.email}">${safe.email}</a>`)}
        ${safe.phone ? row("Téléphone", safe.phone) : ""}
        ${row("Objet", safe.subject)}
      </table>` +
        `<div style="border-left:3px solid ${ACCENT};padding:2px 0 2px 14px;line-height:1.5">${safe.message}</div>` +
        p(
          `<span style="font-size:12px;color:#5c6b64">Répondre à cet e-mail écrit directement à ${safe.name}.</span>`,
        ),
    ),
  };
}
