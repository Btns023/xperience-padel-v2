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

export function dunningMail(o: {
  number: string;
  amountCents: number;
  dueOn: string | null;
  comm: string | null;
  iban: string;
  url: string;
  count: number;
}): Mail {
  return {
    subject: `Rappel — facture ${o.number} en attente de paiement`,
    html: layout(
      `Facture ${o.number} impayée`,
      p(
        `La facture ${o.number} d'un montant de <strong>${formatEuros(o.amountCents)}</strong>` +
          (o.dueOn ? ` (échéance ${o.dueOn})` : "") +
          " reste en attente de règlement.",
      ) +
        p(
          `Virement sur <strong>${o.iban}</strong>` +
            (o.comm ? `<br>Communication : <strong>${o.comm}</strong>` : ""),
        ) +
        `<p style="margin:18px 0">${btn(o.url, "Voir la facture")}</p>` +
        p(
          `<span style="font-size:12px;color:#5c6b64">Si le paiement a déjà été effectué, merci d'ignorer ce message.</span>`,
        ),
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
