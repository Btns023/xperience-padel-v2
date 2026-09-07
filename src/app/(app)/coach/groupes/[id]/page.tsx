import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Groupe" };

type RosterRow = {
  registration_id: string;
  first_name: string;
  last_name: string;
  level_code: string;
  email: string;
  phone: string | null;
  payment_status: string;
};

type SessionRow = {
  session_id: string;
  seq: number;
  date: string;
  start_time: string | null;
  present_count: number;
  marked_count: number;
};

export default async function CoachGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: rosterData }, { data: sessionData }] = await Promise.all([
    supabase.rpc("coach_group_roster", { p_group_id: id }),
    supabase.rpc("coach_group_sessions", { p_group_id: id }),
  ]);
  const roster = (rosterData ?? []) as RosterRow[];
  const sessions = (sessionData ?? []) as SessionRow[];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/coach"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        ← Mes groupes
      </Link>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Joueurs ({roster.length})</h2>
        {roster.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun joueur (ou groupe hors de tes créneaux).
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {roster.map((r) => (
              <li
                key={r.registration_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {r.first_name} {r.last_name}
                  </span>
                  <Badge variant="secondary">{r.level_code}</Badge>
                  <span className="text-muted-foreground">
                    {r.email}
                    {r.phone ? ` · ${r.phone}` : ""}
                  </span>
                </span>
                <Badge
                  variant={
                    r.payment_status === "payé"
                      ? "default"
                      : r.payment_status === "impayé"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {r.payment_status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Séances ({sessions.length})</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune séance générée (le créneau n&apos;a pas de date de 1re
            séance).
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sessions.map((s) => (
              <li key={s.session_id}>
                <Link
                  href={`/coach/groupes/${id}/seance/${s.session_id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm transition-colors hover:border-foreground/20"
                >
                  <span>
                    <span className="font-medium">Séance {s.seq}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {formatDate(s.date)}
                      {s.start_time ? ` · ${formatTime(s.start_time)}` : ""}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {s.marked_count > 0
                      ? `${s.present_count}/${s.marked_count} présent(s)`
                      : "présences non saisies"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
