import type { SupabaseClient } from "@supabase/supabase-js";
import {
  nextOpenPeriod,
  occupancyByPeriod,
  periodLength,
  periodsOf,
  type EngagementRef,
  type Period,
} from "@/lib/engagement";

/**
 * Engagements des inscriptions actives, par créneau. Passe par la fonction
 * slot_engagements (SECURITY DEFINER, sans donnée personnelle) : un client
 * ne voit que ses propres inscriptions en lecture directe, ce qui fausserait
 * le calcul des places restantes.
 */
export async function loadEngagements(
  supabase: SupabaseClient,
  slotIds: string[],
): Promise<Map<string, EngagementRef[]>> {
  const out = new Map<string, EngagementRef[]>();
  if (slotIds.length === 0) return out;
  const { data } = await supabase.rpc("slot_engagements", {
    p_slot_ids: slotIds,
  });
  for (const row of (data ?? []) as (EngagementRef & { slot_id: string })[]) {
    const list = out.get(row.slot_id) ?? [];
    list.push({
      first_session: row.first_session,
      session_count: row.session_count,
    });
    out.set(row.slot_id, list);
  }
  return out;
}

type CycleSlot = {
  session_count: number;
  starts_on: string | null;
  products: {
    pricing_model: string;
    price_tiers: {
      kind: string;
      session_count: number | null;
      amount_cents: number;
      active: boolean;
    }[];
  } | null;
};

export type SlotCycle = {
  /** Découpé en périodes (produit « par durée ») ? */
  byDuration: boolean;
  periods: Period[];
  occupancy: number[];
  /** Période où un nouvel inscrit peut entrer ; null si le cycle est lancé. */
  open: Period | null;
};

/** Périodes, effectif par période et période d'entrée d'un créneau. */
export function slotCycle(
  slot: CycleSlot,
  engagements: EngagementRef[],
  today: string,
): SlotCycle {
  const tiers = slot.products?.price_tiers ?? [];
  const length = periodLength(
    slot.products?.pricing_model,
    tiers,
    slot.session_count,
  );
  const periods = periodsOf(slot.session_count, length);
  return {
    byDuration: slot.products?.pricing_model === "per_duration",
    periods,
    occupancy: occupancyByPeriod(engagements, slot.session_count, periods),
    open: nextOpenPeriod(periods, slot.starts_on, today),
  };
}
