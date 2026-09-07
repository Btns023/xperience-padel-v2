import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AttendanceRow } from "./attendance-row";

export const metadata = { title: "Présences" };

type Row = {
  registration_id: string;
  first_name: string;
  last_name: string;
  present: boolean | null;
};

export default async function SeancePage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id, sessionId } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("coach_session_attendance", {
    p_session_id: sessionId,
  });
  const rows = (data ?? []) as Row[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/coach/groupes/${id}`}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Retour au groupe
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Présences</h1>
        <p className="text-muted-foreground">
          Pointage facultatif — pour ton suivi.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Erreur : {error.message}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun joueur (ou séance hors de tes groupes).
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <AttendanceRow
              key={r.registration_id}
              sessionId={sessionId}
              groupId={id}
              registrationId={r.registration_id}
              name={`${r.first_name} ${r.last_name}`}
              present={r.present}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
