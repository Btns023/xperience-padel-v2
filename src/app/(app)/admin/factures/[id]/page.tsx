import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatEuros } from "@/lib/format";
import {
  INVOICE_KIND_LABEL,
  INVOICE_STATUS_LABEL,
  type Invoice,
  type InvoiceLine,
  type Payment,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  MetaForm,
  LinesEditor,
  InvoiceActions,
  PaymentsPanel,
  DunningPanel,
} from "../facture-editor";

export const metadata = { title: "Facture" };

export default async function FactureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: invData }, { data: linesData }, { data: pmtData }] =
    await Promise.all([
      supabase.from("invoices").select("*").eq("id", id).single(),
      supabase
        .from("invoice_lines")
        .select("*")
        .eq("invoice_id", id)
        .order("position"),
      supabase
        .from("payments")
        .select("*")
        .eq("invoice_id", id)
        .order("paid_on"),
    ]);
  if (!invData) notFound();
  const invoice = invData as Invoice;
  const lines = (linesData ?? []) as InvoiceLine[];
  const payments = (pmtData ?? []) as Payment[];
  const isDraft = invoice.status === "draft";
  const showPayments =
    invoice.kind === "invoice" &&
    (invoice.status === "sent" || invoice.status === "paid");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/factures"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Factures
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {invoice.number ?? `${INVOICE_KIND_LABEL[invoice.kind]} (brouillon)`}
          </h1>
          <Badge
            variant={
              invoice.status === "paid"
                ? "default"
                : invoice.status === "cancelled"
                  ? "destructive"
                  : invoice.status === "sent"
                    ? "secondary"
                    : "outline"
            }
          >
            {INVOICE_STATUS_LABEL[invoice.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {invoice.recipient_snapshot?.name} · émise le{" "}
          {formatDate(invoice.issued_on)}
          {invoice.structured_comm
            ? ` · communication ${invoice.structured_comm}`
            : ""}
        </p>
      </div>

      <InvoiceActions invoice={invoice} />

      {showPayments ? (
        <>
          <PaymentsPanel invoice={invoice} payments={payments} />
          <DunningPanel invoice={invoice} />
        </>
      ) : null}

      {isDraft ? (
        <>
          <MetaForm invoice={invoice} />
          <LinesEditor invoiceId={invoice.id} lines={lines} />
        </>
      ) : (
        <div className="rounded-lg border p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="py-1.5">Description</th>
                <th className="py-1.5 text-right">Qté</th>
                <th className="py-1.5 text-right">PU</th>
                <th className="py-1.5 text-right">Remise</th>
                <th className="py-1.5 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.id} className="border-b last:border-b-0">
                  <td className="py-1.5">{l.description}</td>
                  <td className="py-1.5 text-right tabular-nums">{l.quantity}</td>
                  <td className="py-1.5 text-right tabular-nums">
                    {formatEuros(l.unit_price_cents)}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">
                    {l.discount_cents ? `-${formatEuros(l.discount_cents)}` : "—"}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">
                    {formatEuros(l.amount_cents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end text-lg font-semibold tabular-nums">
        Total : {formatEuros(invoice.total_cents)}
      </div>
      <p className="text-sm text-muted-foreground">{invoice.vat_note}</p>
    </div>
  );
}
