import { createClient } from "@/lib/supabase/server";
import { formatDate, formatTime, weekdayLabel } from "@/lib/format";
import {
  REGISTRATION_STATUS_LABEL,
  type RegistrationStatus,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Demandes d'inscription" };

type Row = {
  id: string;
  status: RegistrationStatus;
  requested_at: string;
  cancel_requested_at: string | null;
  level_mismatch: boolean;
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
      "id, status, requested_at, cancel_requested_at, level_mismatch, players(first_name,last_name,level_code), slots(weekday,start_time,products(name)), billed_to:profiles(first_name,last_name), organizations(name)",
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
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Joueur</TableHead>
                <TableHead>Créneau</TableHead>
                <TableHead>Facturé à</TableHead>
                <TableHead>Demandé le</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.players?.first_name} {r.players?.last_name}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {r.players?.level_code}
                    </span>
                    {r.level_mismatch ? (
                      <Badge variant="outline" className="ml-2">
                        écart de niveau
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.slots
                      ? `${weekdayLabel(r.slots.weekday)} ${formatTime(
                          r.slots.start_time,
                        )} · ${r.slots.products?.name ?? ""}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.organizations
                      ? r.organizations.name
                      : `${r.billed_to?.first_name ?? ""} ${
                          r.billed_to?.last_name ?? ""
                        }`.trim() || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(r.requested_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge
                        variant={
                          r.status === "demande_recue" ? "secondary" : "default"
                        }
                      >
                        {REGISTRATION_STATUS_LABEL[r.status]}
                      </Badge>
                      {r.cancel_requested_at && r.status !== "annulee" ? (
                        <Badge variant="outline">annulation demandée</Badge>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
