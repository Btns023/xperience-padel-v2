import { formatDayMonth } from "@/lib/format";
import { sessionDate, type Period } from "@/lib/engagement";

const TONE = {
  ok: "border-border text-foreground",
  low: "border-transparent bg-orange-500/15 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  over: "border-transparent bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

/**
 * Effectif prévu par période d'un cycle à durée choisie.
 * Orange : sous l'effectif minimum. Rouge : au-delà de la capacité.
 */
export function PeriodOccupancy({
  periods,
  occupancy,
  capacity,
  minCapacity,
  startsOn,
}: {
  periods: Period[];
  occupancy: number[];
  capacity: number;
  minCapacity: number | null;
  startsOn: string | null;
}) {
  const anyone = occupancy.some((n) => n > 0);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-1.5">
        {periods.map((p, i) => {
          const n = occupancy[i] ?? 0;
          const tone =
            n > capacity
              ? "over"
              : anyone && minCapacity != null && n < minCapacity
                ? "low"
                : "ok";
          return (
            <span
              key={p.index}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs tabular-nums ${TONE[tone]}`}
            >
              <span className="font-medium">P{p.index}</span>
              {startsOn ? (
                <span className="opacity-70">
                  {formatDayMonth(sessionDate(startsOn, p.first))} →{" "}
                  {formatDayMonth(sessionDate(startsOn, p.last))}
                </span>
              ) : (
                <span className="opacity-70">
                  séances {p.first}–{p.last}
                </span>
              )}
              <span className="font-medium">
                {n}/{capacity}
              </span>
            </span>
          );
        })}
      </div>
      <span className="text-xs text-muted-foreground">
        {minCapacity ? `Minimum ${minCapacity} · ` : ""}maximum {capacity} par
        période
        {anyone && occupancy.some((n) => minCapacity != null && n < minCapacity)
          ? " — orange : groupe trop petit, à fusionner ou à relancer"
          : ""}
        {occupancy.some((n) => n > capacity) ? " — rouge : au-delà de la capacité" : ""}
      </span>
    </div>
  );
}
