import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { PadelLevel } from "@/lib/types";
import { createPlayer } from "../actions";
import { PlayerForm } from "../player-form";

export const metadata = { title: "Ajouter un joueur" };

export default async function NouveauJoueurPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("padel_levels")
    .select("*")
    .order("rank");
  const levels = (data ?? []) as PadelLevel[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/compte/joueurs"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Mes joueurs
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Ajouter un joueur
        </h1>
      </div>
      <PlayerForm
        action={createPlayer}
        levels={levels}
        submitLabel="Ajouter le joueur"
        allowSelf
      />
    </div>
  );
}
