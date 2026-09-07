import { createClient } from "@/lib/supabase/server";
import type { Coach } from "@/lib/types";
import { NewCoachForm, CoachRow } from "./coachs-client";

export const metadata = { title: "Coachs" };

export default async function CoachsPage() {
  const supabase = await createClient();
  const [{ data, error }, { data: invites }] = await Promise.all([
    supabase.from("coaches").select("*").order("last_name"),
    supabase
      .from("coach_invites")
      .select("id, coach_id, token")
      .is("accepted_at", null),
  ]);
  const coaches = (data ?? []) as Coach[];
  const inviteByCoach = new Map(
    (invites ?? []).map((i) => [i.coach_id, { id: i.id, token: i.token }]),
  );
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Coachs</h1>
        <p className="text-muted-foreground">
          Identités affichées sur les créneaux. Les comptes coachs et leurs
          invitations viendront au Lot 6.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Erreur : {error.message}</p>
      ) : null}

      <div className="flex flex-col gap-4">
        {coaches.map((c) => (
          <CoachRow
            key={`${c.id}:${c.updated_at}`}
            coach={c}
            invite={inviteByCoach.get(c.id) ?? null}
            siteUrl={siteUrl}
          />
        ))}
      </div>

      <NewCoachForm />
    </div>
  );
}
