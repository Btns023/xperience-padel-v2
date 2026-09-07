import { createClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/format";

export const metadata = { title: "Planning" };

type Row = {
  session_id: string;
  date: string;
  start_time: string | null;
  group_label: string | null;
  product_name: string | null;
  location_name: string | null;
};

export default async function CoachPlanningPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("coach_upcoming_sessions");
  const rows = (data ?? []) as Row[];

  const byDate = new Map<string, Row[]>();
  for (const r of rows) {
    const list = byDate.get(r.date) ?? [];
    list.push(r);
    byDate.set(r.date, list);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Planning</h1>
        <p className="text-muted-foreground">Tes prochaines séances.</p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Erreur : {error.message}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune séance à venir.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {[...byDate.entries()].map(([date, list]) => (
            <div key={date} className="flex flex-col gap-2">
              <h2 className="text-sm font-medium capitalize">
                {formatDate(date)}
              </h2>
              <ul className="flex flex-col gap-2">
                {list.map((r) => (
                  <li
                    key={r.session_id}
                    className="rounded-lg border p-3 text-sm"
                  >
                    <span className="font-medium">
                      {r.start_time ? formatTime(r.start_time) : "—"}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {r.group_label ?? "Groupe"} · {r.product_name ?? ""}
                      {r.location_name ? ` · ${r.location_name}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
