import { createClient } from "@/lib/supabase/server";
import type { Coach } from "@/lib/types";
import { NewCoachForm, CoachRow } from "./coachs-client";

export const metadata = { title: "Coachs" };

export default async function CoachsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coaches")
    .select("*")
    .order("last_name");
  const coaches = (data ?? []) as Coach[];

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
          <CoachRow key={c.id} coach={c} />
        ))}
      </div>

      <NewCoachForm />
    </div>
  );
}
