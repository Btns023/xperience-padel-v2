import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { formatEuros } from "@/lib/format";
import { type Invoice, type InvoiceLine } from "@/lib/types";
import { PrintButton } from "./print-button";

export const metadata = { title: "Document" };

function fmtShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getFullYear() % 100,
  ).padStart(2, "0")}`;
}

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
  const s = inv.issuer_snapshot;
  const r = inv.recipient_snapshot;
  const isCredit = inv.kind === "credit_note";
  const abs = (n: number) => formatEuros(Math.abs(n));

  return (
    <div className="sheet">
      <style>{`
        .sheet {
          --ink: #111;
          max-width: 820px;
          margin: 0 auto;
          padding: 48px 44px 28px;
          color: var(--ink);
          font-family: Georgia, "Times New Roman", "Iowan Old Style", serif;
          font-size: 14px;
          line-height: 1.45;
          background: #fff;
        }
        .sheet .toolbar { margin-bottom: 20px; }
        .sheet a { color: #1155cc; }

        .head { display: flex; justify-content: space-between; gap: 32px; align-items: flex-start; }
        .head .logo { width: 210px; height: auto; }
        .head .title { font-size: 30px; text-align: right; margin: 0 0 14px; }
        .recipient { border-left: 3px solid var(--ink); padding-left: 12px; text-align: left; white-space: pre-line; }

        .issuer { margin-top: 26px; font-size: 13px; line-height: 1.5; }
        .issuer .name { font-weight: 700; }

        .meta { display: flex; gap: 56px; margin-top: 34px; font-size: 13px; }
        .meta b { font-weight: 700; }
        .meta .kv { display: grid; grid-template-columns: auto auto; gap: 6px 40px; }

        table.services { width: 100%; border-collapse: collapse; margin-top: 30px; }
        table.services th { font-weight: 700; border-bottom: 1px solid var(--ink); padding: 6px 8px; }
        table.services td { padding: 8px; }
        table.services .c-serv { text-align: left; }
        table.services .c-num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
        table.services .c-qty { text-align: center; }
        .rule-strong { border: 0; border-top: 2px solid var(--ink); margin: 40px 0 0; }

        .total { display: flex; justify-content: flex-end; gap: 48px; align-items: baseline;
                 border-bottom: 2px solid var(--ink); padding: 12px 8px; font-size: 17px; font-weight: 700; }
        .total .amt { font-variant-numeric: tabular-nums; }
        .vatline { text-align: right; font-size: 12px; color: #444; margin-top: 6px; }

        .pay { margin-top: 34px; }
        .pay h3 { font-size: 14px; font-weight: 700; margin: 0 0 8px; }
        .pay .box { display: flex; border: 1px solid var(--ink); font-size: 12px; }
        .pay .box > div { flex: 1; padding: 7px 10px; }
        .pay .box > div + div { border-left: 1px solid var(--ink); }
        .pay .box b { font-weight: 700; }

        .legal { border-top: 1px solid var(--ink); margin-top: 34px; padding-top: 14px;
                 font-style: italic; text-align: right; font-size: 12px; color: #333; }
        .pagefoot { text-align: center; margin-top: 40px; font-size: 12px; color: #444; }

        @media print {
          .toolbar { display: none !important; }
          .sheet { padding: 0; max-width: none; }
          @page { margin: 18mm 16mm; }
        }
      `}</style>

      <div className="toolbar">
        <PrintButton />
      </div>

      <div className="head">
        {s.logo_data_uri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="logo" src={s.logo_data_uri} alt="Xperience Padel" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="logo" src="/logo.svg" alt="Xperience Padel" />
        )}
        <div>
          <p className="title">{isCredit ? "Note de crédit" : "Facture"}</p>
          <div className="recipient">
            {[
              r.name,
              r.address,
              r.vat_number ? `TVA ${r.vat_number}` : "",
              r.email,
            ]
              .filter(Boolean)
              .join("\n")}
          </div>
        </div>
      </div>

      <div className="issuer">
        <div className="name">{s.issuer_legal_name}</div>
        <div>{s.issuer_address}</div>
        {s.issuer_phone ? <div>Tél : {s.issuer_phone}</div> : null}
        {s.issuer_email ? (
          <div>
            Email : <a href={`mailto:${s.issuer_email}`}>{s.issuer_email}</a>
          </div>
        ) : null}
        <div>N° Entreprise : {s.issuer_bce}</div>
        <div>IBAN : {s.issuer_iban}</div>
      </div>

      <div className="meta">
        <div className="kv">
          <b>{isCredit ? "Numéro de note de crédit :" : "Numéro de facture :"}</b>
          <span>{inv.number ?? "brouillon"}</span>
        </div>
        <div className="kv">
          <b>Date :</b>
          <span>{fmtShort(inv.issued_on)}</span>
          {!isCredit ? (
            <>
              <b>Date d&apos;échéance :</b>
              <span>{fmtShort(inv.due_on)}</span>
            </>
          ) : null}
        </div>
      </div>

      <table className="services">
        <thead>
          <tr>
            <th className="c-serv">Services</th>
            <th className="c-num">Tarif</th>
            <th className="c-qty">Quantité</th>
            <th className="c-num">Montant TTC</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.id}>
              <td className="c-serv">
                {l.description}
                {l.promo_code ? ` (code ${l.promo_code})` : ""}
                {l.discount_cents
                  ? ` — remise ${abs(l.discount_cents)}`
                  : ""}
              </td>
              <td className="c-num">{abs(l.unit_price_cents)}</td>
              <td className="c-qty">{l.quantity}</td>
              <td className="c-num">{abs(l.amount_cents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr className="rule-strong" />

      <div className="total">
        <span>TOTAL</span>
        <span className="amt">
          {inv.total_cents < 0 ? "-" : ""}
          {abs(inv.total_cents)}
        </span>
      </div>
      {inv.vat_note ? <div className="vatline">{inv.vat_note}</div> : null}

      {!isCredit ? (
        <div className="pay">
          <h3>Informations de paiement :</h3>
          <div className="box">
            <div>
              <b>{s.issuer_bank || "Banque"}</b> : {s.issuer_iban}
            </div>
            <div>
              <b>BIC</b> : {s.issuer_bic}
            </div>
            <div>
              <b>Communication</b> :{" "}
              {inv.structured_comm ?? inv.number ?? "à l'émission"}
            </div>
          </div>
        </div>
      ) : (
        <div className="pay">
          <p style={{ fontSize: 13, color: "#333" }}>
            {inv.notes ??
              `Cette note de crédit annule la facture ${
                inv.parent_invoice_id ? "correspondante" : ""
              }.`}
          </p>
        </div>
      )}

      {!isCredit && (s.footer_legal || s.cgv_note) ? (
        <div className="legal">
          {s.footer_legal ? <div>{s.footer_legal}</div> : null}
          {s.cgv_note ? <div>{s.cgv_note}</div> : null}
        </div>
      ) : null}

      <div className="pagefoot">{s.issuer_legal_name}</div>
    </div>
  );
}
