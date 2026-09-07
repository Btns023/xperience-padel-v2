import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatTime, weekdayLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Mes groupes" };

type CoachGroup = {
  group_id: string;
  group_label: string | null;
  group_status: string;
  weekday: number;
  start_time: string;
  product_name: string | null;
  location_name: string | null;
  member_count: number;
};

export default async function CoachGroupesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("coach_groups");
  const groups = (data ?? []) as CoachGroup[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mes groupes</h1>
        <p className="text-muted-foreground">
          Les groupes de tes créneaux. Clique pour voir la liste des joueurs et
          pointer les présences.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Erreur : {error.message}</p>
      ) : groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun groupe pour l&apos;instant.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {groups.map((g) => (
            <li key={g.group_id}>
              <Link
                href={`/coach/groupes/${g.group_id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 transition-colors hover:border-foreground/20"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {g.group_label ?? "Groupe"}
                    </span>
                    <Badge
                      variant={
                        g.group_status === "confirmed" ? "default" : "secondary"
                      }
                    >
                      {g.group_status === "confirmed"
                        ? "Confirmé"
                        : "En constitution"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {g.member_count} joueur(s)
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {weekdayLabel(g.weekday)} {formatTime(g.start_time)} ·{" "}
                    {g.product_name ?? ""}
                    {g.location_name ? ` · ${g.location_name}` : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
