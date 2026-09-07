import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Player } from "@/lib/types";
import { DeletePlayerButton } from "./joueurs-client";

export const metadata = { title: "Mes joueurs" };

const INVIT_LABEL: Record<string, string> = {
  none: "",
  pending: "Invitation en attente",
  accepted: "Compte actif",
};

export default async function JoueursPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("last_name");
  const players = (data ?? []) as Player[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mes joueurs</h1>
          <p className="text-muted-foreground">
            Toi-même, tes enfants, ou les joueurs d&apos;une équipe que tu inscris.
          </p>
        </div>
        <Link href="/compte/joueurs/nouveau" className={buttonVariants()}>
          Ajouter un joueur
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Erreur : {error.message}</p>
      ) : players.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun joueur. Ajoute-toi ou ajoute une personne à inscrire.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {players.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {p.first_name} {p.last_name}
                  </span>
                  <Badge variant="secondary">{p.level_code}</Badge>
                  {INVIT_LABEL[p.invitation_status] ? (
                    <Badge
                      variant={
                        p.invitation_status === "accepted" ? "default" : "outline"
                      }
                    >
                      {INVIT_LABEL[p.invitation_status]}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  Né(e) le {formatDate(p.birthdate)} · {p.email} · droit à
                  l&apos;image : {p.image_consent ? "oui" : "non"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/compte/joueurs/${p.id}`}
                  className="text-sm underline underline-offset-4"
                >
                  Modifier
                </Link>
                <DeletePlayerButton id={p.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
