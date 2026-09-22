import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { formatDate, formatEuros, todayInBrussels } from "@/lib/format";
import type { Invoice } from "@/lib/types";
import { PrintButton } from "@/app/facture/[id]/print-button";

export const metadata = { title: "Mise en demeure" };

/**
 * Mise en demeure officielle, à imprimer et envoyer par courrier recommandé.
 * Quatrième et dernier niveau de relance : les trois premiers partent par
 * e-mail automatiquement (voir src/lib/dunning.ts).
 */
export default async function MiseEnDemeurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("invoices").select("*").eq("id", id).single();
  if (!data) notFound();
  const inv = data as Invoice;
  const s = inv.issuer_snapshot as Record<string, string>;
  const r = inv.recipient_snapshot as Record<string, string>;

  return (
    <div className="sheet">
      <style>{`
        .sheet { --ink:#111; max-width:820px; margin:0 auto; padding:48px 44px 28px; color:var(--ink);
                 font-family: Georgia, "Times New Roman", serif; font-size:14px; line-height:1.55; background:#fff; }
        .sheet .toolbar { margin-bottom:20px; }
        .sheet h1 { font-size:22px; margin:34px 0 6px; }
        .sheet h2 { font-size:13px; margin:0 0 4px; text-transform:uppercase; letter-spacing:.06em; }
        .head { display:flex; justify-content:space-between; gap:32px; }
        .issuer { font-size:13px; line-height:1.5; }
        .issuer .name { font-weight:700; }
        .recipient { border-left:3px solid var(--ink); padding-left:12px; white-space:pre-line; }
        .place { margin-top:26px; text-align:right; font-size:13px; }
        .ref { margin:18px 0; border:1px solid var(--ink); padding:10px 14px; font-size:13px; }
        .ref div { display:flex; justify-content:space-between; gap:24px; }
        .ref b { font-weight:700; }
        .sheet ul { margin:0 0 14px; padding-left:20px; }
        .pay { border:1px solid var(--ink); padding:10px 14px; font-size:13px; }
        .sign { margin-top:46px; display:flex; justify-content:space-between; gap:32px; font-size:13px; }
        .note { margin-top:34px; font-size:11.5px; font-style:italic; color:#333; border-top:1px solid #999; padding-top:10px; }
        @media print { .toolbar { display:none !important; } .sheet { padding:0; max-width:none; } @page { margin:20mm 18mm; } }
      `}</style>

      <div className="toolbar">
        <PrintButton />
      </div>

      <div className="head">
        <div className="issuer">
          <div className="name">{s?.issuer_legal_name}</div>
          <div style={{ whiteSpace: "pre-line" }}>{s?.issuer_address}</div>
          <div>N° d&apos;entreprise : {s?.issuer_bce}</div>
          <div>{s?.issuer_email ?? "info@padelxp.be"}</div>
        </div>
        <div className="recipient">
          <h2>Destinataire</h2>
          {r?.name}
          {r?.address ? `\n${r.address}` : ""}
          {r?.vat_number ? `\nTVA : ${r.vat_number}` : ""}
        </div>
      </div>

      <div className="place">
        Gembloux, le {formatDate(todayInBrussels())}
        <br />
        <strong>Envoi recommandé</strong>
      </div>

      <h1>Mise en demeure — facture impayée</h1>

      <p>Madame, Monsieur,</p>
      <p>
        Malgré notre précédent rappel, sauf erreur ou omission de notre part, la
        facture reprise ci-dessous demeure impayée à ce jour :
      </p>

      <div className="ref">
        <div>
          <span>Numéro de facture</span>
          <b>{inv.number ?? "—"}</b>
        </div>
        <div>
          <span>Date de facture</span>
          <b>{formatDate(inv.issued_on)}</b>
        </div>
        <div>
          <span>Date d&apos;échéance</span>
          <b>{formatDate(inv.due_on)}</b>
        </div>
        <div>
          <span>Montant principal</span>
          <b>{formatEuros(inv.total_cents)}</b>
        </div>
      </div>

      <p>
        À ce jour, le montant total dû s&apos;élève à{" "}
        <strong>{formatEuros(inv.total_cents)}</strong>.
      </p>
      <p>
        Par la présente, l&apos;ASBL {s?.issuer_legal_name}, inscrite à la
        Banque-Carrefour des Entreprises sous le numéro {s?.issuer_bce}, vous met
        formellement en demeure de procéder au paiement intégral de cette somme{" "}
        <strong>dans un délai de 8 jours calendrier</strong> à compter de la
        réception du présent courrier.
      </p>
      <p>
        À défaut de paiement dans ce délai, nous appliquerons de plein droit et
        sans nouvelle mise en demeure :
      </p>
      <ul>
        <li>les intérêts de retard conformément à nos conditions générales ;</li>
        <li>l&apos;indemnité forfaitaire prévue par nos conditions générales ;</li>
        <li>tous frais de recouvrement complémentaires éventuels.</li>
      </ul>
      <p>
        À défaut de régularisation, nous nous verrons contraints d&apos;envisager
        toute mesure utile pour le recouvrement de notre créance, y compris par
        voie judiciaire.
      </p>

      <div className="pay">
        Le paiement est à effectuer sur le compte suivant :<br />
        IBAN : <b>{s?.issuer_iban}</b>
        <br />
        Communication : <b>{inv.structured_comm ?? inv.number ?? "—"}</b>
      </div>

      <p style={{ marginTop: 16 }}>
        Si votre paiement a été effectué entre-temps, nous vous remercions de ne
        pas tenir compte du présent courrier. Nous vous invitons à nous contacter
        sans délai si vous constatez une erreur ou si vous souhaitez convenir
        d&apos;un arrangement.
      </p>
      <p>
        Dans l&apos;attente de votre règlement, nous vous prions d&apos;agréer,
        Madame, Monsieur, l&apos;expression de nos salutations distinguées.
      </p>

      <div className="sign">
        <div>
          Pour l&apos;ASBL {s?.issuer_legal_name},
          <br />
          <br />
          <strong>STELLINGS Stéphane</strong>
          <br />
          <strong>BERTHOLET Nicolas</strong>
          <br />
          Administrateurs
        </div>
        <div style={{ whiteSpace: "pre-line" }}>{s?.issuer_address}</div>
      </div>

      <p className="note">
        À envoyer par courrier recommandé : c&apos;est la preuve d&apos;envoi qui
        fait courir le délai de 8 jours. Conserve le récépissé avec la facture.
      </p>
    </div>
  );
}
