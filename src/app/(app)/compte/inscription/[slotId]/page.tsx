import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  formatDayMonth,
  formatEuros,
  formatTime,
  todayInBrussels,
  weekdayLabel,
} from "@/lib/format";
import type { PadelLevel, Player, ProductCategory } from "@/lib/types";
import { PRODUCT_CATEGORY_LABEL } from "@/lib/types";
import { durationOptions, sessionDate } from "@/lib/engagement";
import { loadEngagements, slotCycle } from "@/lib/slot-cycle";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/auth";
import { needsProfileCompletion, profileCompletionPath } from "@/lib/profile";
import { RegisterForm } from "../register-form";

export const metadata = { title: "S'inscrire à un créneau" };

type Slot = {
  id: string;
  status: string;
  weekday: number;
  start_time: string;
  duration_minutes: number;
  session_count: number;
  starts_on: string | null;
  capacity: number;
  min_capacity: number | null;
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
      label: string;
      amount_cents: number;
      active: boolean;
    }[];
  } | null;
  locations: { name: string } | null;
  coaches: { first_name: string; last_name: string } | null;
  seasons: { name: string } | null;
};

export default async function SlotInscriptionPage({
  params,
}: {
  params: Promise<{ slotId: string }>;
}) {
  const { slotId } = await params;

  // Les coordonnées de facturation d'abord : sans elles, pas de facture valable.
  if (needsProfileCompletion(await getCurrentProfile())) {
    redirect(profileCompletionPath(`/compte/inscription/${slotId}`));
  }

  const supabase = await createClient();

  const [{ data: slotData }, { data: playersData }, { data: levelsData }] =
    await Promise.all([
      supabase
        .from("slots")
        .select(
          "id, status, weekday, start_time, duration_minutes, session_count, starts_on, capacity, min_capacity, level_note, min_level_code, max_level_code, products(name, category, pricing_model, price_tiers(kind, session_count, label, amount_cents, active)), locations(name), coaches(first_name,last_name), seasons(name)",
        )
        .eq("id", slotId)
        .single(),
      supabase.from("players").select("*").order("last_name"),
      supabase.from("padel_levels").select("*").order("rank"),
    ]);

  if (!slotData) notFound();
  const slot = slotData as unknown as Slot;
  const players = (playersData ?? []) as Player[];
  const levels = (levelsData ?? []) as PadelLevel[];

  const rankByCode = new Map(levels.map((l) => [l.code, Number(l.rank)]));
  const minRank = slot.min_level_code
    ? (rankByCode.get(slot.min_level_code) ?? null)
    : null;
  const maxRank = slot.max_level_code
    ? (rankByCode.get(slot.max_level_code) ?? null)
    : null;

  // Écart de niveau calculé côté serveur, une fois, par joueur.
  const warnByPlayer: Record<string, boolean> = {};
  for (const p of players) {
    const r = rankByCode.get(p.level_code);
    warnByPlayer[p.id] =
      r !== undefined &&
      ((minRank !== null && r < minRank) || (maxRank !== null && r > maxRank));
  }

  const tiers = (slot.products?.price_tiers ?? []).filter((t) => t.active);
  const level =
    slot.level_note ||
    [slot.min_level_code, slot.max_level_code].filter(Boolean).join("–");

  // Cycle à durée choisie : périodes, places et options proposées.
  const engagements = (await loadEngagements(supabase, [slot.id])).get(slot.id) ?? [];
  const cycle = slotCycle(slot, engagements, todayInBrussels());
  const durations =
    cycle.byDuration && cycle.open
      ? durationOptions({
          tiers,
          slotCount: slot.session_count,
          startsOn: slot.starts_on,
          capacity: slot.capacity,
          periods: cycle.periods,
          occupancy: cycle.occupancy,
          start: cycle.open,
        })
      : null;
  const closed = cycle.byDuration && !cycle.open;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/compte/inscription"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Créneaux
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {weekdayLabel(slot.weekday)} {formatTime(slot.start_time)} —{" "}
          {slot.products?.name}
        </h1>
      </div>

      <div className="rounded-lg border p-4 text-sm">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {slot.products ? (
            <Badge variant="secondary">
              {PRODUCT_CATEGORY_LABEL[slot.products.category]}
            </Badge>
          ) : null}
          {level ? <Badge variant="outline">{level}</Badge> : null}
        </div>
        {cycle.byDuration ? (
          <p className="text-muted-foreground">
            {slot.seasons?.name} · séances de {slot.duration_minutes} min
            {slot.starts_on
              ? ` · du ${formatDayMonth(slot.starts_on)} au ${formatDayMonth(
                  sessionDate(slot.starts_on, slot.session_count),
                )}`
              : ""}
            {" · "}
            {slot.min_capacity ? `${slot.min_capacity} à ` : "jusqu'à "}
            {slot.capacity} enfants par groupe
            {slot.locations ? ` · ${slot.locations.name}` : ""}
            {slot.coaches
              ? ` · ${slot.coaches.first_name} ${slot.coaches.last_name}`
              : ""}
          </p>
        ) : (
          <>
            <p className="text-muted-foreground">
              {slot.seasons?.name} · {slot.session_count} séances de{" "}
              {slot.duration_minutes} min · capacité {slot.capacity}
              {slot.locations ? ` · ${slot.locations.name}` : ""}
              {slot.coaches
                ? ` · ${slot.coaches.first_name} ${slot.coaches.last_name}`
                : ""}
            </p>
            {tiers.length > 0 ? (
              <p className="mt-2 text-muted-foreground tabular-nums">
                Tarif :{" "}
                {tiers
                  .map((t) => `${t.label} ${formatEuros(t.amount_cents)}`)
                  .join(" · ")}{" "}
                — le montant exact dépend de l&apos;effectif final du groupe.
              </p>
            ) : null}
          </>
        )}
      </div>

      {closed ? (
        <p className="rounded-lg border p-4 text-sm text-muted-foreground">
          Ce cycle a déjà commencé et plus aucune période n&apos;est ouverte aux
          nouvelles inscriptions. Contacte l&apos;académie pour une entrée en
          cours de route.
        </p>
      ) : (
        <RegisterForm
          slotId={slot.id}
          players={players}
          warnByPlayer={warnByPlayer}
          durations={durations}
          openPeriodIndex={cycle.open?.index ?? 1}
        />
      )}
    </div>
  );
}
