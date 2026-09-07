import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { formatDate, formatEuros } from "@/lib/format";
import { INVOICE_KIND_LABEL, type Invoice, type InvoiceLine } from "@/lib/types";
import { PrintButton } from "./print-button";

export const metadata = { title: "Document" };

export default async function FactureDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: invData }, { data: linesData }] = await Promise.all([
    supabase.from("invoices").select("*").eq("id", id).single(),
    supabase
      .from("invoice_lines")
      .select("*")
      .eq("invoice_id", id)
      .order("position"),
  ]);
  if (!invData) notFound();
  const inv = invData as Invoice;
  const lines = (linesData ?? []) as InvoiceLine[];
  const issuer = inv.issuer_snapshot;
  const rcpt = inv.recipient_snapshot;
  const isCredit = inv.kind === "credit_note";

  return (
    <div className="doc">
      <style>{`
        .doc { max-width: 800px; margin: 0 auto; padding: 40px 32px; color: #111; font-size: 14px; line-height: 1.5; }
        .doc h1 { font-size: 22px; margin: 0 0 4px; }
        .doc .muted { color: #555; }
        .doc .row { display: flex; justify-content: space-between; gap: 32px; }
        .doc .block { margin-top: 24px; }
        .doc table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        .doc th, .doc td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #ddd; }
        .doc td.num, .doc th.num { text-align: right; font-variant-numeric: tabular-nums; }
        .doc .total { text-align: right; font-size: 16px; font-weight: 700; margin-top: 16px; }
        .doc .comm { margin-top: 16px; padding: 10px 12px; background: #f3f4f6; border-radius: 6px; font-family: monospace; }
        .doc .foot { margin-top: 32px; font-size: 12px; color: #555; white-space: pre-line; }
        .no-print { margin-bottom: 16px; }
        @media print { .no-print { display: none !important; } .doc { padding: 0; } body { background: #fff; } }
      `}</style>

      <div className="no-print">
        <PrintButton />
      </div>

      <div className="row">
        <div>
          <h1>{isCredit ? "Note de crédit" : "Facture"}</h1>
          <div className="muted">
            {inv.number ?? `${INVOICE_KIND_LABEL[inv.kind]} — brouillon`}
          </div>
          <div className="muted">Émise le {formatDate(inv.issued_on)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <strong>{issuer.issuer_name}</strong>
          <div className="muted">{issuer.issuer_legal_name}</div>
          <div className="muted">{issuer.issuer_address}</div>
          <div className="muted">BCE {issuer.issuer_bce}</div>
        </div>
      </div>

      <div className="block">
        <div className="muted">Facturé à</div>
        <strong>{rcpt.name}</strong>
        {rcpt.address ? <div className="muted">{rcpt.address}</div> : null}
        {rcpt.vat_number ? (
          <div className="muted">TVA {rcpt.vat_number}</div>
        ) : null}
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th className="num">Qté</th>
            <th className="num">P.U.</th>
            <th className="num">Remise</th>
            <th className="num">Montant</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.id}>
              <td>
                {l.description}
                {l.promo_code ? (
                  <span className="muted"> (code {l.promo_code})</span>
                ) : null}
              </td>
              <td className="num">{l.quantity}</td>
              <td className="num">{formatEuros(l.unit_price_cents)}</td>
              <td className="num">
                {l.discount_cents ? `-${formatEuros(l.discount_cents)}` : "—"}
              </td>
              <td className="num">{formatEuros(l.amount_cents)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="total">Total : {formatEuros(inv.total_cents)}</div>
      <div className="muted" style={{ textAlign: "right" }}>
        {inv.vat_note}
      </div>

      {!isCredit && inv.total_cents > 0 ? (
        <div className="comm">
          Paiement par virement sur {issuer.issuer_iban} (BIC {issuer.issuer_bic})
          {inv.structured_comm ? (
            <>
              <br />
              Communication structurée : <strong>{inv.structured_comm}</strong>
            </>
          ) : null}
        </div>
      ) : null}

      {inv.notes ? <div className="foot">{inv.notes}</div> : null}
    </div>
  );
}
