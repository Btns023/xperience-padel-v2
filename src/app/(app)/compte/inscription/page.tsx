import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  formatEuros,
  formatTime,
  todayInBrussels,
  weekdayLabel,
} from "@/lib/format";
import { loadEngagements, slotCycle } from "@/lib/slot-cycle";
import { PRODUCT_CATEGORY_LABEL, type ProductCategory } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "S'inscrire" };

type SlotRow = {
  id: string;
  weekday: number;
  start_time: string;
  capacity: number;
  session_count: number;
  starts_on: string | null;
  level_note: string | null;
  min_level_code: string | null;
  max_level_code: string | null;
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
  locations: { name: string } | null;
  coaches: { first_name: string; last_name: string } | null;
  seasons: { name: string } | null;
};

function priceRange(tiers: { amount_cents: number; active: boolean }[]) {
  const amounts = tiers.filter((t) => t.active).map((t) => t.amount_cents);
  if (amounts.length === 0) return null;
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  return min === max
    ? formatEuros(min)
    : `${formatEuros(min)} – ${formatEuros(max)}`;
}

export default async function InscriptionPage() {
  const supabase = await createClient();

  const { data: slotsData, error } = await supabase
    .from("slots")
    .select(
      "id, weekday, start_time, capacity, session_count, starts_on, level_note, min_level_code, max_level_code, products(name, category, pricing_model, price_tiers(kind, session_count, amount_cents, active)), locations(name), coaches(first_name,last_name), seasons(name)",
    )
    .eq("status", "open")
    .order("weekday")
    .order("start_time");

  const slots = (slotsData ?? []) as unknown as SlotRow[];

  // Inscrits sur la période ouverte aux nouveaux venus (le cycle entier
  // quand le créneau n'est pas découpé en périodes).
  const engagementsBySlot = await loadEngagements(
    supabase,
    slots.map((s) => s.id),
  );
  const today = todayInBrussels();
  const takenBySlot = new Map<string, number>();
  for (const s of slots) {
    const cycle = slotCycle(s, engagementsBySlot.get(s.id) ?? [], today);
    const i = cycle.open ? cycle.periods.indexOf(cycle.open) : 0;
    takenBySlot.set(s.id, cycle.occupancy[i] ?? 0);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">S&apos;inscrire</h1>
        <p className="text-muted-foreground">
          Choisis un créneau, puis les joueurs à inscrire. Aucun paiement à cette
          étape : une facture te sera envoyée après constitution du groupe.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Erreur : {error.message}</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun créneau ouvert pour le moment.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {slots.map((s) => {
            const taken = takenBySlot.get(s.id) ?? 0;
            const full = taken >= s.capacity;
            const price = s.products
              ? priceRange(s.products.price_tiers)
              : null;
            const level =
              s.level_note ||
              [s.min_level_code, s.max_level_code].filter(Boolean).join("–");
            return (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {weekdayLabel(s.weekday)} {formatTime(s.start_time)}
                    </span>
                    {s.products ? (
                      <Badge variant="secondary">
                        {PRODUCT_CATEGORY_LABEL[s.products.category]}
                      </Badge>
                    ) : null}
                    {level ? <Badge variant="outline">{level}</Badge> : null}
                    {full ? <Badge>Complet</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {s.products?.name}
                    {s.locations ? ` · ${s.locations.name}` : ""}
                    {s.coaches
                      ? ` · ${s.coaches.first_name} ${s.coaches.last_name}`
                      : ""}
                  </p>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {taken}/{s.capacity} inscrit(s)
                    {price ? ` · ${price} / joueur` : ""}
                  </p>
                </div>
                <Link
                  href={`/compte/inscription/${s.id}`}
                  className={buttonVariants({
                    variant: full ? "outline" : "default",
                  })}
                >
                  {full ? "Liste d'attente" : "S'inscrire"}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
