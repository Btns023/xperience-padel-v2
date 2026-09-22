import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { formatDate, formatEuros } from "@/lib/format";
import {
  INVOICE_KIND_LABEL,
  INVOICE_STATUS_LABEL,
  type InvoiceKind,
  type InvoiceStatus,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Factures émises" };

type Row = {
  id: string;
  kind: InvoiceKind;
  number: string | null;
  status: InvoiceStatus;
  issued_on: string;
  due_on: string | null;
  paid_at: string | null;
  total_cents: number;
  recipient_snapshot: { name?: string } | null;
};

/** Factures et notes de crédit émises (hors brouillons), en lecture seule. */
export default async function ComptaFacturesPage() {
  await requireRole(["admin", "comptable"]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("id, kind, number, status, issued_on, due_on, paid_at, total_cents, recipient_snapshot")
    .neq("status", "draft")
    .order("issued_on", { ascending: false });
  const rows = (data ?? []) as Row[];

  const open = rows.filter((r) => r.kind === "invoice" && r.status === "sent");
  const openTotal = open.reduce((s, r) => s + r.total_cents, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Factures émises</h1>
        <p className="text-muted-foreground">
          {rows.length} document{rows.length > 1 ? "s" : ""} · {open.length} facture
          {open.length > 1 ? "s" : ""} en attente de paiement ({formatEuros(openTotal)}).
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune facture émise.</p>
      ) : (
        <ul className="flex flex-col divide-y rounded-lg border">
          {rows.map((r) => (
            <li key={r.id}>
              <a
                href={`/facture/${r.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
              >
                <span className="w-24 shrink-0 tabular-nums text-muted-foreground">
                  {formatDate(r.issued_on)}
                </span>
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <span className="font-medium tabular-nums">
                    {r.kind === "credit_note" ? INVOICE_KIND_LABEL.credit_note + " " : ""}
                    {r.number ?? "—"}
                  </span>
                  <span className="truncate">{r.recipient_snapshot?.name || "—"}</span>
                  <Badge variant={r.status === "paid" ? "default" : r.status === "cancelled" ? "outline" : "secondary"}>
                    {INVOICE_STATUS_LABEL[r.status]}
                  </Badge>
                </span>
                <span className="shrink-0 font-medium tabular-nums">{formatEuros(r.total_cents)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
