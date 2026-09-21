import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { formatTime, todayInBrussels, weekdayLabel } from "@/lib/format";
import { PRODUCT_CATEGORY_LABEL, type ProductCategory } from "@/lib/types";
import { loadEngagements, slotCycle } from "@/lib/slot-cycle";
import { buttonVariants } from "@/components/ui/button";
import { SeasonPicker } from "./season-picker";
import { assignLanes } from "./layout-day";

export const metadata = { title: "Planning" };

/** Hauteur d'une minute, en pixels : 90 min de cours = 108 px. */
const PX_PER_MIN = 1.2;
const DAYS = [1, 2, 3, 4, 5, 6, 7];

type SlotRow = {
  id: string;
  weekday: number;
  start_time: string;
  duration_minutes: number;
  session_count: number;
  starts_on: string | null;
  capacity: number;
  min_capacity: number | null;
  level_note: string | null;
  status: "draft" | "open" | "closed";
  products: {
    name: string;
    category: ProductCategory;
    pricing_model: string;
    price_tiers: {
      kind: string;
      session_count: number | null;
      amount_cents: number;
      active: boolean;
    }[];
  } | null;
  coaches: { first_name: string; last_name: string } | null;
  locations: { name: string } | null;
};

/** Une couleur par type de cours, pour repérer les blocs d'un coup d'œil. */
const CATEGORY_STYLE: Record<ProductCategory, string> = {
  cycle_adulte:
    "border-sky-500/40 bg-sky-500/10 text-sky-900 dark:text-sky-100 hover:bg-sky-500/20",
  cycle_enfant:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-500/20",
  stage:
    "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100 hover:bg-amber-500/20",
  ete_indien:
    "border-violet-500/40 bg-violet-500/10 text-violet-900 dark:text-violet-100 hover:bg-violet-500/20",
  cours_prive:
    "border-rose-500/40 bg-rose-500/10 text-rose-900 dark:text-rose-100 hover:bg-rose-500/20",
};

function minutesOf(time: string): number {
  const [h, m] = time.split(":");
  return Number(h) * 60 + Number(m);
}

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ saison?: string }>;
}) {
  await requireRole("admin");
  const { saison } = await searchParams;
  const supabase = await createClient();

  const { data: seasonsData } = await supabase
    .from("seasons")
    .select("id, name, status")
    .order("starts_on", { ascending: false });
  const seasons = (seasonsData ?? []) as {
    id: string;
    name: string;
    status: string;
  }[];
  const seasonId =
    saison && seasons.some((s) => s.id === saison)
      ? saison
      : (seasons.find((s) => s.status === "active")?.id ?? seasons[0]?.id ?? null);

  const { data: slotsData } = seasonId
    ? await supabase
        .from("slots")
        .select(
          "id, weekday, start_time, duration_minutes, session_count, starts_on, capacity, min_capacity, level_note, status, products(name, category, pricing_model, price_tiers(kind, session_count, amount_cents, active)), coaches(first_name,last_name), locations(name)",
        )
        .eq("season_id", seasonId)
        .order("start_time")
    : { data: [] };
  const slots = (slotsData ?? []) as unknown as SlotRow[];

  const engagements = await loadEngagements(
    supabase,
    slots.map((s) => s.id),
  );
  const today = todayInBrussels();

  // Amplitude horaire : du premier début à la dernière fin, arrondie à l'heure.
  const starts = slots.map((s) => minutesOf(s.start_time));
  const ends = slots.map((s) => minutesOf(s.start_time) + s.duration_minutes);
  const from = slots.length ? Math.floor(Math.min(...starts) / 60) * 60 : 9 * 60;
  const to = slots.length ? Math.ceil(Math.max(...ends) / 60) * 60 : 22 * 60;
  const height = (to - from) * PX_PER_MIN;
  const hours = Array.from(
    { length: (to - from) / 60 + 1 },
    (_, i) => from + i * 60,
  );
  const usedDays = DAYS.filter((d) => slots.some((s) => s.weekday === d));
  const days = usedDays.length > 0 ? usedDays : [1, 2, 3, 4, 5, 6, 7];

  const cards = new Map(
    slots.map((s) => {
      const cycle = slotCycle(s, engagements.get(s.id) ?? [], today);
      const i = cycle.open ? cycle.periods.indexOf(cycle.open) : 0;
      return [s.id, { taken: cycle.occupancy[i] ?? 0, cycle }];
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Planning</h1>
          <p className="text-muted-foreground">
            La semaine type de la saison. Chaque bloc mène à la constitution
            des groupes.
          </p>
        </div>
        <Link
          href="/admin/creneaux"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Vue liste
        </Link>
      </div>

      {seasons.length > 1 ? (
        <SeasonPicker seasons={seasons} current={seasonId} />
      ) : null}

      {slots.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun créneau dans cette saison.
        </p>
      ) : (
        <>
          {/* Grille : défile horizontalement sur petit écran, jamais la page. */}
          <div className="overflow-x-auto pb-2">
            <div
              className="grid min-w-[640px] gap-px"
              style={{
                gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(7rem, 1fr))`,
              }}
            >
              <div />
              {days.map((d) => (
                <div
                  key={d}
                  className="pb-2 text-center text-sm font-medium capitalize"
                >
                  {weekdayLabel(d)}
                </div>
              ))}

              {/* Colonne des heures */}
              <div className="relative" style={{ height }}>
                {hours.map((h) => (
                  <span
                    key={h}
                    className="absolute -translate-y-1/2 text-xs tabular-nums text-muted-foreground"
                    style={{ top: (h - from) * PX_PER_MIN }}
                  >
                    {formatTime(`${String(h / 60).padStart(2, "0")}:00`)}
                  </span>
                ))}
              </div>

              {days.map((d) => (
                <div
                  key={d}
                  className="relative rounded-md border bg-muted/20"
                  style={{ height }}
                >
                  {hours.slice(1, -1).map((h) => (
                    <div
                      key={h}
                      className="absolute inset-x-0 border-t border-dashed border-border/60"
                      style={{ top: (h - from) * PX_PER_MIN }}
                    />
                  ))}

                  {assignLanes(
                    slots
                      .filter((s) => s.weekday === d)
                      .map((s) => ({
                        id: s.id,
                        start: minutesOf(s.start_time),
                        duration: s.duration_minutes,
                      })),
                  )
                    .map((placed) => ({
                      placed,
                      slot: slots.find((x) => x.id === placed.id)!,
                    }))
                    .map(({ placed, slot: s }) => {
                      const info = cards.get(s.id)!;
                      const full = info.taken >= s.capacity;
                      const low =
                        s.min_capacity != null &&
                        info.taken > 0 &&
                        info.taken < s.min_capacity;
                      return (
                        <Link
                          key={s.id}
                          href={`/admin/creneaux/${s.id}/groupes`}
                          style={{
                            top: (placed.start - from) * PX_PER_MIN,
                            height: placed.duration * PX_PER_MIN - 2,
                            left: `calc(${placed.left}% + 2px)`,
                            width: `calc(${placed.width}% - 4px)`,
                          }}
                          className={`absolute flex flex-col gap-0.5 overflow-hidden rounded-md border p-1.5 text-[11px] leading-tight transition-colors ${
                            s.products
                              ? CATEGORY_STYLE[s.products.category]
                              : "border-border bg-muted"
                          } ${s.status !== "open" ? "opacity-60" : ""}`}
                        >
                          <span className="font-semibold tabular-nums">
                            {formatTime(s.start_time)}
                            {s.status !== "open" ? (
                              <span className="ml-1 font-normal opacity-70">
                                {s.status === "draft" ? "· brouillon" : "· fermé"}
                              </span>
                            ) : null}
                          </span>
                          <span className="truncate font-medium">
                            {s.level_note || s.products?.name}
                          </span>
                          {s.coaches ? (
                            <span className="truncate opacity-80">
                              {s.coaches.first_name}
                            </span>
                          ) : null}
                          <span className="mt-auto font-semibold tabular-nums">
                            {info.taken}/{s.capacity}
                            {full ? " · complet" : low ? " · trop peu" : ""}
                          </span>
                        </Link>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {(
              Object.keys(CATEGORY_STYLE) as ProductCategory[]
            ).map((c) =>
              slots.some((s) => s.products?.category === c) ? (
                <span key={c} className="inline-flex items-center gap-1.5">
                  <span
                    className={`size-3 rounded-sm border ${CATEGORY_STYLE[c]}`}
                  />
                  {PRODUCT_CATEGORY_LABEL[c]}
                </span>
              ) : null,
            )}
            <span>
              Le compteur indique les inscrits de la période ouverte, sur la
              capacité du créneau. Les créneaux en brouillon ou fermés sont
              estompés.
            </span>
          </div>
        </>
      )}
    </div>
  );
}
