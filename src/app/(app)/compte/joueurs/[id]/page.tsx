import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PadelLevel, Player } from "@/lib/types";
import { updatePlayer, type FormState } from "../actions";
import { PlayerForm } from "../player-form";

export const metadata = { title: "Modifier un joueur" };

export default async function EditJoueurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: playerData }, { data: levelsData }] = await Promise.all([
    supabase.from("players").select("*").eq("id", id).single(),
    supabase.from("padel_levels").select("*").order("rank"),
  ]);
  if (!playerData) notFound();

  const player = playerData as Player;
  const levels = (levelsData ?? []) as PadelLevel[];
  const action = updatePlayer.bind(null, id) as (
    prev: FormState,
    fd: FormData,
  ) => Promise<FormState>;

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
          {player.first_name} {player.last_name}
        </h1>
      </div>
      <PlayerForm
        action={action}
        player={player}
        levels={levels}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
