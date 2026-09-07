import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatEuros, formatTime, weekdayLabel } from "@/lib/format";
import type { PadelLevel, Player, ProductCategory } from "@/lib/types";
import { PRODUCT_CATEGORY_LABEL } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { RegisterForm } from "../register-form";

export const metadata = { title: "S'inscrire à un créneau" };

type Slot = {
  id: string;
  status: string;
  weekday: number;
  start_time: string;
  duration_minutes: number;
  session_count: number;
  capacity: number;
  level_note: string | null;
  min_level_code: string | null;
  max_level_code: string | null;
  products: {
    name: string;
    category: ProductCategory;
    price_tiers: { label: string; amount_cents: number; active: boolean }[];
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
  const supabase = await createClient();

  const [{ data: slotData }, { data: playersData }, { data: levelsData }] =
    await Promise.all([
      supabase
        .from("slots")
        .select(
          "id, status, weekday, start_time, duration_minutes, session_count, capacity, level_note, min_level_code, max_level_code, products(name, category, price_tiers(label, amount_cents, active)), locations(name), coaches(first_name,last_name), seasons(name)",
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
      </div>

      <RegisterForm
        slotId={slot.id}
        players={players}
        warnByPlayer={warnByPlayer}
      />
    </div>
  );
}
