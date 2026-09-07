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
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Mes factures" };

type Row = {
  id: string;
  kind: InvoiceKind;
  number: string | null;
  status: InvoiceStatus;
  issued_on: string;
  total_cents: number;
  structured_comm: string | null;
};

export default async function MesFacturesPage() {
  const supabase = await createClient();
  // Le client ne voit que les documents émis (RLS + filtre statut).
  const { data, error } = await supabase
    .from("invoices")
    .select("id, kind, number, status, issued_on, total_cents, structured_comm")
    .neq("status", "draft")
    .order("issued_on", { ascending: false });

  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mes factures</h1>
        <p className="text-muted-foreground">
          Règlement par virement, avec la communication structurée indiquée sur
          la facture.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Erreur : {error.message}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune facture pour l&apos;instant.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
            >
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {r.number ?? INVOICE_KIND_LABEL[r.kind]}
                  </span>
                  <Badge
                    variant={
                      r.status === "paid"
                        ? "default"
                        : r.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {INVOICE_STATUS_LABEL[r.status]}
                  </Badge>
                  {r.kind === "credit_note" ? (
                    <Badge variant="outline">note de crédit</Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {formatEuros(r.total_cents)} · émise le{" "}
                  {formatDate(r.issued_on)}
                  {r.structured_comm ? ` · ${r.structured_comm}` : ""}
                </p>
              </div>
              <Link
                href={`/facture/${r.id}`}
                target="_blank"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Voir / PDF
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
