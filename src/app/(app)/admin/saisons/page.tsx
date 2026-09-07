import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { SEASON_STATUS_LABEL, type Season } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { deleteSeason } from "./actions";

export const metadata = { title: "Saisons" };

export default async function SaisonsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .order("starts_on", { ascending: false });

  const seasons = (data ?? []) as Season[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Saisons</h1>
          <p className="text-muted-foreground">
            Une saison regroupe les créneaux et les inscriptions d&apos;une
            période.
          </p>
        </div>
        <Link href="/admin/saisons/nouvelle" className={buttonVariants()}>
          Nouvelle saison
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-destructive">
          Erreur de chargement : {error.message}
        </p>
      ) : seasons.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune saison. Crée la première pour commencer.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {seasons.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4"
            >
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/saisons/${s.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {s.name}
                  </Link>
                  <Badge
                    variant={s.status === "active" ? "default" : "secondary"}
                  >
                    {SEASON_STATUS_LABEL[s.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(s.starts_on)} → {formatDate(s.ends_on)}
                </p>
                {s.registration_opens_on || s.registration_closes_on ? (
                  <p className="text-sm text-muted-foreground">
                    Inscriptions : {formatDate(s.registration_opens_on)} →{" "}
                    {formatDate(s.registration_closes_on)}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/saisons/${s.id}`}
                  className="text-sm underline underline-offset-4"
                >
                  Modifier
                </Link>
                <form action={deleteSeason}>
                  <input type="hidden" name="id" value={s.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                  >
                    Supprimer
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
