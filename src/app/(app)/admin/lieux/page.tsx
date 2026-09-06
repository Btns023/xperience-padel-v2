import { createClient } from "@/lib/supabase/server";
import type { Location } from "@/lib/types";
import { NewLocationForm, LocationRow } from "./lieux-client";

export const metadata = { title: "Lieux" };

export default async function LieuxPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("name");
  const locations = (data ?? []) as Location[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lieux</h1>
        <p className="text-muted-foreground">
          Clubs et terrains où se déroulent les créneaux.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Erreur : {error.message}</p>
      ) : null}

      <div className="flex flex-col gap-4">
        {locations.map((l) => (
          <LocationRow key={l.id} location={l} />
        ))}
      </div>

      <NewLocationForm />
    </div>
  );
}
