import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatEuros } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { RunDunningButton } from "./run-button";

export const metadata = { title: "Impayés & relances" };

type Row = {
  id: string;
  number: string | null;
  issued_on: string;
  due_on: string | null;
  total_cents: number;
  dunning_count: number;
  dunning_paused: boolean;
  last_dunned_at: string | null;
  recipient_snapshot: Record<string, string>;
  payments: { amount_cents: number }[];
};

function daysOverdue(due: string | null): number | null {
  if (!due) return null;
  const d = Math.floor(
    (Date.now() - new Date(due).getTime()) / 86_400_000,
  );
  return d > 0 ? d : 0;
}

export default async function RelancesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, number, issued_on, due_on, total_cents, dunning_count, dunning_paused, last_dunned_at, recipient_snapshot, payments(amount_cents)",
    )
    .eq("kind", "invoice")
    .eq("status", "sent")
    .order("due_on", { ascending: true });

  const rows = (data ?? []) as unknown as Row[];
  const flagged = rows.filter((r) => r.dunning_count >= 3).length;
  const totalDue = rows.reduce(
    (s, r) =>
      s +
      (r.total_cents - r.payments.reduce((p, x) => p + x.amount_cents, 0)),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Impayés &amp; relances
          </h1>
          <p className="text-muted-foreground">
            {rows.length} facture(s) impayée(s) · {formatEuros(totalDue)} en
            attente · {flagged} signalée(s). Relances automatiques chaque lundi ;
            ici tu peux les déclencher à la main.
          </p>
        </div>
        <RunDunningButton />
      </div>

      {error ? (
        <p className="text-sm text-destructive">Erreur : {error.message}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun impayé. 🎉</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => {
            const paid = r.payments.reduce((s, x) => s + x.amount_cents, 0);
            const remaining = r.total_cents - paid;
            const overdue = daysOverdue(r.due_on);
            return (
              <li key={r.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/factures/${r.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {r.number ?? "brouillon"}
                  </Link>
                  <span className="tabular-nums font-medium">
                    {formatEuros(remaining)}
                  </span>
                  {r.dunning_count >= 3 ? (
                    <Badge className="border-transparent bg-orange-500/15 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                      signalée
                    </Badge>
                  ) : null}
                  {r.dunning_paused ? (
                    <Badge variant="outline">relances en pause</Badge>
                  ) : null}
                  {overdue && overdue > 0 ? (
                    <Badge variant="destructive">
                      {overdue} j de retard
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {r.recipient_snapshot?.name ?? "—"} · échéance{" "}
                  {formatDate(r.due_on)} · {r.dunning_count} relance(s)
                  {r.last_dunned_at
                    ? ` · dernière ${formatDate(r.last_dunned_at)}`
                    : ""}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
