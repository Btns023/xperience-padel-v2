/**
 * Conditions générales de vente — Padel XP ASBL.
 * Texte de référence, repris tel quel du verso de la facture papier.
 * Utilisé par la page /conditions et par le document de facture (verso).
 */

export const CGV_TITLE = "Conditions générales de vente";

export const CGV_ARTICLES: { n: string; title: string; body: string[] }[] = [
  {
    n: "1",
    title: "Objet",
    body: [
      "Les présentes conditions générales de vente s'appliquent à l'ensemble des prestations de cours de padel organisées par Xperience Padel Academy ASBL, qu'il s'agisse de cours individuels, collectifs, stages ou entraînements.",
    ],
  },
  {
    n: "2",
    title: "Inscription et réservation",
    body: [
      "Toute inscription à une activité implique l'acceptation pleine et entière des présentes conditions générales. Les réservations sont considérées comme fermes dès confirmation par Xperience Padel Academy ASBL.",
    ],
  },
  {
    n: "3",
    title: "Tarifs",
    body: [
      "Les tarifs sont exprimés en euros (€).",
      "Les prix comprennent la mise à disposition des terrains ainsi que le matériel nécessaire à la pratique (balles, matériel pédagogique, etc.), sauf mention contraire.",
      "Xperience Padel Academy ASBL n'est pas assujettie à la TVA conformément à l'article 44 du Code de la TVA.",
    ],
  },
  {
    n: "4",
    title: "Modalités de paiement",
    body: [
      "Les prestations sont payables selon les modalités mentionnées sur la facture.",
      "Toute facture est payable au plus tard à la date d'échéance indiquée.",
      "En cas de non-paiement, Xperience Padel Academy ASBL se réserve le droit de suspendre l'accès aux cours ou activités en cours.",
    ],
  },
  {
    n: "5",
    title: "Retard de paiement",
    body: [
      "Toute facture non payée à l'échéance entraînera, de plein droit et sans mise en demeure préalable :",
      "l'application d'intérêts de retard au taux légal belge,",
      "une indemnité forfaitaire de 10 % du montant restant dû, avec un minimum de 40 €, conformément à la législation belge.",
    ],
  },
  {
    n: "6",
    title: "Annulation et report",
    body: [
      "Toute annulation doit être communiquée au minimum 48 heures à l'avance.",
      "En cas d'annulation tardive ou d'absence non justifiée, le cours est intégralement dû.",
      "En cas de conditions météorologiques défavorables, d'indisponibilité des installations ou de force majeure, Xperience Padel Academy ASBL se réserve le droit de reporter la séance à une date ultérieure, sans remboursement.",
    ],
  },
  {
    n: "7",
    title: "Responsabilité",
    body: [
      "Xperience Padel Academy ASBL ne peut être tenue responsable des accidents survenus en dehors du temps effectif des cours ou résultant du non-respect des consignes données par l'encadrant. Les participants déclarent être médicalement aptes à la pratique du padel.",
    ],
  },
  {
    n: "8",
    title: "Assurance",
    body: [
      "Chaque participant doit être couvert par une assurance responsabilité civile personnelle valable en Belgique. L'affiliation à la fédération « TPPWB » couvre tous leurs membres pendant leur pratique via un contrat d'assurance chez Ethias. Xperience Padel Academy ASBL décline toute responsabilité en cas de défaut d'assurance du participant.",
    ],
  },
  {
    n: "9",
    title: "Comportement et discipline",
    body: [
      "Tout comportement inapproprié, dangereux ou contraire à l'esprit sportif pourra entraîner l'exclusion temporaire ou définitive du participant, sans remboursement des sommes déjà versées.",
    ],
  },
  {
    n: "10",
    title: "Protection des données",
    body: [
      "Les données personnelles sont traitées conformément au Règlement Général sur la Protection des Données (RGPD) et utilisées uniquement dans le cadre de la gestion administrative et sportive des activités de l'ASBL.",
    ],
  },
  {
    n: "11",
    title: "Droit applicable et juridiction compétente",
    body: [
      "Les présentes conditions générales sont soumises au droit belge. En cas de litige, les tribunaux de l'arrondissement judiciaire du siège social de Xperience Padel Academy ASBL sont seuls compétents.",
    ],
  },
];
