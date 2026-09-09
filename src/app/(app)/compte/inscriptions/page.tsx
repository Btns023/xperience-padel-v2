import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatEuros, formatTime, weekdayLabel } from "@/lib/format";
import {
  REGISTRATION_STATUS_LABEL,
  type RegistrationStatus,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CancelButton } from "./cancel-button";

export const metadata = { title: "Mes inscriptions" };

type Row = {
  id: string;
  status: RegistrationStatus;
  requested_at: string;
  cancel_requested_at: string | null;
  late_cancellation: boolean;
  level_mismatch: boolean;
  group_id: string | null;
  unit_price_cents: number | null;
  players: { first_name: string; last_name: string } | null;
  slots:
    | {
        weekday: number;
        start_time: string;
        products: { name: string } | null;
        locations: { name: string } | null;
      }
    | null;
  organizations: { name: string } | null;
};

type RosterEntry = { first_name: string; level_code: string };

export default async function InscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registrations")
    .select(
      "id, status, requested_at, cancel_requested_at, late_cancellation, level_mismatch, group_id, unit_price_cents, players(first_name,last_name), slots(weekday, start_time, products(name), locations(name)), organizations(name)",
    )
    .order("requested_at", { ascending: false });

  const rows = (data ?? []) as unknown as Row[];

  const groupIds = [
    ...new Set(rows.map((r) => r.group_id).filter((v): v is string => !!v)),
  ];
  const rosterByGroup = new Map<string, RosterEntry[]>();
  await Promise.all(
    groupIds.map(async (gid) => {
      const { data: roster } = await supabase.rpc("group_roster", {
        p_group_id: gid,
      });
      rosterByGroup.set(gid, (roster ?? []) as RosterEntry[]);
    }),
  );

  const active = rows.filter((r) => r.status !== "annulee");
  const past = rows.filter((r) => r.status === "annulee");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Mes inscriptions
          </h1>
          <p className="text-muted-foreground">
            Suivi de tes demandes. Toute annulation se fait en nous contactant
            via le bouton ci-dessous.
          </p>
        </div>
        <Link href="/compte/inscription" className={buttonVariants()}>
          Nouvelle inscription
        </Link>
      </div>

      {ok ? (
        <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          Demande envoyée. Tu recevras une facture après constitution du groupe.
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive">Erreur : {error.message}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune inscription pour l&apos;instant.
        </p>
      ) : (
        <>
          <RegList rows={active} rosterByGroup={rosterByGroup} />
          {past.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                Annulées
              </h2>
              <RegList rows={past} rosterByGroup={rosterByGroup} muted />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function RegList({
  rows,
  rosterByGroup,
  muted,
}: {
  rows: Row[];
  rosterByGroup: Map<string, RosterEntry[]>;
  muted?: boolean;
}) {
  return (
    <ul className={`flex flex-col gap-3 ${muted ? "opacity-60" : ""}`}>
      {rows.map((r) => {
        const roster = r.group_id ? rosterByGroup.get(r.group_id) : undefined;
        return (
          <li
            key={r.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4"
          >
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">
                  {r.players?.first_name} {r.players?.last_name}
                </span>
                <Badge
                  variant={
                    r.status === "payee"
                      ? "default"
                      : r.status === "annulee"
                        ? "outline"
                        : "secondary"
                  }
                >
                  {REGISTRATION_STATUS_LABEL[r.status]}
                </Badge>
                {r.cancel_requested_at && r.status !== "annulee" ? (
                  <Badge variant="outline">Annulation demandée</Badge>
                ) : null}
                {r.late_cancellation ? (
                  <Badge variant="outline">
                    Annulation tardive — montant dû
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {r.slots
                  ? `${weekdayLabel(r.slots.weekday)} ${formatTime(
                      r.slots.start_time,
                    )} · ${r.slots.products?.name ?? ""}`
                  : "Créneau supprimé"}
                {r.slots?.locations ? ` · ${r.slots.locations.name}` : ""}
                {r.organizations ? ` · facturé à ${r.organizations.name}` : ""}
              </p>
              {roster && roster.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Groupe :{" "}
                  {roster.map((m) => m.first_name).join(", ")}
                </p>
              ) : null}
              {r.unit_price_cents != null ? (
                <p className="text-sm tabular-nums">
                  Prix : {formatEuros(r.unit_price_cents)} / joueur
                </p>
              ) : null}
            </div>
            {r.status !== "annulee" &&
            r.status !== "facturee" &&
            r.status !== "payee" &&
            !r.late_cancellation ? (
              <CancelButton
                registrationId={r.id}
                alreadyRequested={!!r.cancel_requested_at}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
