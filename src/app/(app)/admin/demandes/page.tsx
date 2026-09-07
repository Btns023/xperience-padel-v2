import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatTime, weekdayLabel } from "@/lib/format";
import { CancellationActions } from "./cancel-actions";
import {
  REGISTRATION_STATUS_LABEL,
  type RegistrationStatus,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Demandes d'inscription" };

type Row = {
  id: string;
  status: RegistrationStatus;
  requested_at: string;
  cancel_requested_at: string | null;
  level_mismatch: boolean;
  slot_id: string;
  players: { first_name: string; last_name: string; level_code: string } | null;
  slots:
    | {
        weekday: number;
        start_time: string;
        products: { name: string } | null;
      }
    | null;
  billed_to: { first_name: string | null; last_name: string | null } | null;
  organizations: { name: string } | null;
};

export default async function DemandesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registrations")
    .select(
      "id, status, requested_at, cancel_requested_at, level_mismatch, slot_id, players(first_name,last_name,level_code), slots(weekday,start_time,products(name)), billed_to:profiles(first_name,last_name), organizations(name)",
    )
    .order("requested_at", { ascending: false });

  const rows = (data ?? []) as unknown as Row[];
  const pending = rows.filter(
    (r) => r.status === "demande_recue" && !r.cancel_requested_at,
  ).length;
  const cancelReq = rows.filter(
    (r) => r.cancel_requested_at && r.status !== "annulee",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Demandes d&apos;inscription
        </h1>
        <p className="text-muted-foreground">
          {pending} en attente de traitement
          {cancelReq > 0 ? ` · ${cancelReq} demande(s) d'annulation` : ""}. La
          constitution des groupes se fera au module suivant.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Erreur : {error.message}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune demande.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => {
            const billedTo = r.organizations
              ? r.organizations.name
              : `${r.billed_to?.first_name ?? ""} ${
                  r.billed_to?.last_name ?? ""
                }`.trim() || "—";
            return (
              <li key={r.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {r.players?.first_name} {r.players?.last_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {r.players?.level_code}
                  </span>
                  <Badge
                    variant={
                      r.status === "annulee"
                        ? "destructive"
                        : r.status === "demande_recue"
                          ? "secondary"
                          : "default"
                    }
                  >
                    {REGISTRATION_STATUS_LABEL[r.status]}
                  </Badge>
                  {r.level_mismatch ? (
                    <Badge className="border-transparent bg-orange-500/15 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                      écart de niveau
                    </Badge>
                  ) : null}
                  {r.cancel_requested_at && r.status !== "annulee" ? (
                    <Badge variant="destructive">annulation demandée</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {r.slots ? (
                    <Link
                      href={`/admin/creneaux/${r.slot_id}/groupes`}
                      className="underline-offset-4 hover:underline"
                    >
                      {weekdayLabel(r.slots.weekday)}{" "}
                      {formatTime(r.slots.start_time)} ·{" "}
                      {r.slots.products?.name ?? ""} → constituer le groupe
                    </Link>
                  ) : (
                    "Créneau supprimé"
                  )}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Facturé à {billedTo} · demandé le{" "}
                  {formatDate(r.requested_at)}
                </p>
                {r.cancel_requested_at && r.status !== "annulee" ? (
                  <div className="mt-3 border-t pt-3">
                    <CancellationActions
                      registrationId={r.id}
                      slotId={r.slot_id}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
