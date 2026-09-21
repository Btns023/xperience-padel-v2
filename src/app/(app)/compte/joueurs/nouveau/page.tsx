import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import type { PadelLevel } from "@/lib/types";
import { createPlayer } from "../actions";
import { PlayerForm } from "../player-form";

export const metadata = { title: "Ajouter un joueur" };

export default async function NouveauJoueurPage() {
  const supabase = await createClient();
  const [{ data }, user, profile] = await Promise.all([
    supabase.from("padel_levels").select("*").order("rank"),
    getCurrentUser(),
    getCurrentProfile(),
  ]);
  const levels = (data ?? []) as PadelLevel[];
  const self = {
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    email: user?.email ?? "",
  };

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
        self={self}
      />
    </div>
  );
}
