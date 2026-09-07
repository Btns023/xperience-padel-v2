import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatEuros } from "@/lib/format";
import {
  INVOICE_KIND_LABEL,
  INVOICE_STATUS_LABEL,
  type InvoiceKind,
  type InvoiceStatus,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Factures" };

type Row = {
  id: string;
  kind: InvoiceKind;
  number: string | null;
  status: InvoiceStatus;
  issued_on: string;
  total_cents: number;
  recipient_snapshot: Record<string, string>;
  structured_comm: string | null;
};

const statusVariant = (s: InvoiceStatus) =>
  s === "paid"
    ? "default"
    : s === "cancelled"
      ? "destructive"
      : s === "sent"
        ? "secondary"
        : "outline";

export default async function FacturesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, kind, number, status, issued_on, total_cents, recipient_snapshot, structured_comm",
    )
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as Row[];
  const unpaid = rows.filter((r) => r.kind === "invoice" && r.status === "sent");
  const unpaidTotal = unpaid.reduce((s, r) => s + r.total_cents, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Factures</h1>
          <p className="text-muted-foreground">
            {rows.filter((r) => r.status === "draft").length} brouillon(s) ·{" "}
            {unpaid.length} impayée(s) ({formatEuros(unpaidTotal)}). Les factures
            se génèrent depuis un groupe confirmé.
          </p>
        </div>
        <Link
          href="/admin/factures/export"
          prefetch={false}
          className="text-sm underline underline-offset-4"
        >
          Exporter en CSV
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Erreur : {error.message}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune facture. Confirme un groupe puis clique « Facturer ce groupe ».
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/factures/${r.id}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {r.number ?? `${INVOICE_KIND_LABEL[r.kind]} (brouillon)`}
                </Link>
                <Badge variant={statusVariant(r.status)}>
                  {INVOICE_STATUS_LABEL[r.status]}
                </Badge>
                {r.kind === "credit_note" ? (
                  <Badge variant="outline">note de crédit</Badge>
                ) : null}
                <span className="ml-auto font-medium tabular-nums">
                  {formatEuros(r.total_cents)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {r.recipient_snapshot?.name ?? "—"} · émise le{" "}
                {formatDate(r.issued_on)}
                {r.structured_comm ? ` · ${r.structured_comm}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
