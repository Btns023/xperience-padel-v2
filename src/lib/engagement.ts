/**
 * Cycles à durée choisie (ex. cycles enfants 9 / 18 / 27 cours).
 *
 * Un créneau porte le cycle complet (ex. 27 séances). Chaque inscription
 * suit une partie du cycle : à partir de `first_session`, pendant
 * `session_count` séances (null = jusqu'à la fin).
 *
 * Pour les produits « par durée », le cycle est découpé en périodes dont la
 * longueur est le plus petit palier (9) : séances 1–9, 10–18, 19–27. Les
 * engagements commencent et finissent sur des bornes de période, donc un
 * groupe ne varie qu'aux changements de période.
 *
 * Module sans dépendance serveur : utilisable côté client comme serveur.
 */

import type { PricingModel } from "@/lib/types";

export type EngagementRef = {
  first_session: number;
  session_count: number | null;
};

type TierLike = {
  kind: string;
  session_count: number | null;
  amount_cents: number;
  active: boolean;
};

export type Period = { index: number; first: number; last: number };

/** Séances suivies, bornes incluses. */
export function engagementRange(e: EngagementRef, slotCount: number) {
  const first = Math.max(1, e.first_session);
  const count = e.session_count ?? Math.max(0, slotCount - first + 1);
  return { first, last: first + count - 1, count };
}

/** La séance n° `seq` fait-elle partie de l'engagement ? */
export function covers(e: EngagementRef, slotCount: number, seq: number) {
  const r = engagementRange(e, slotCount);
  return seq >= r.first && seq <= r.last;
}

/** Paliers « durée » actifs, du plus court au plus long. */
export function durationTiers(tiers: TierLike[]) {
  return tiers
    .filter((t) => t.active && t.kind === "duration" && t.session_count)
    .map((t) => ({ count: t.session_count!, amountCents: t.amount_cents }))
    .sort((a, b) => a.count - b.count);
}

/** Prix du palier de `count` séances, ou null s'il n'existe pas. */
export function tierPrice(tiers: TierLike[], count: number): number | null {
  return durationTiers(tiers).find((t) => t.count === count)?.amountCents ?? null;
}

/**
 * Longueur d'une période : le plus petit palier. null quand le produit n'est
 * pas « par durée » — le créneau forme alors une seule période.
 */
export function periodLength(
  pricingModel: PricingModel | string | null | undefined,
  tiers: TierLike[],
  slotCount: number,
): number | null {
  if (pricingModel !== "per_duration") return null;
  const shortest = durationTiers(tiers)[0]?.count;
  if (!shortest || shortest >= slotCount) return null;
  return shortest;
}

/** Découpage du cycle en périodes (une seule si `length` est null). */
export function periodsOf(slotCount: number, length: number | null): Period[] {
  const L = length ?? slotCount;
  const out: Period[] = [];
  for (let first = 1, i = 1; first <= slotCount; first += L, i++) {
    out.push({ index: i, first, last: Math.min(first + L - 1, slotCount) });
  }
  return out;
}

/**
 * Date de la séance n° `seq` (AAAA-MM-JJ), une par semaine à partir de
 * `startsOn`. Calcul en UTC : l'heure d'été ne décale jamais la date.
 */
export function sessionDate(startsOn: string, seq: number): string {
  const d = new Date(`${startsOn}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + (seq - 1) * 7);
  return d.toISOString().slice(0, 10);
}

/** Nombre d'inscrits engagés sur au moins une séance de chaque période. */
export function occupancyByPeriod(
  engagements: EngagementRef[],
  slotCount: number,
  periods: Period[],
): number[] {
  return periods.map(
    (p) =>
      engagements.filter((e) => {
        const r = engagementRange(e, slotCount);
        return r.first <= p.last && r.last >= p.first;
      }).length,
  );
}

/**
 * Période à laquelle un nouvel inscrit peut entrer : la première qui n'a
 * pas encore commencé. Sans date de début, la première. null si le cycle
 * est entièrement commencé.
 */
export function nextOpenPeriod(
  periods: Period[],
  startsOn: string | null,
  today: string,
): Period | null {
  if (!startsOn) return periods[0] ?? null;
  return periods.find((p) => sessionDate(startsOn, p.first) >= today) ?? null;
}

export type DurationOption = {
  count: number;
  amountCents: number;
  first: number;
  last: number;
  fromDate: string | null;
  toDate: string | null;
  /** Places restantes sur la période la plus chargée de l'engagement. */
  placesLeft: number;
};

/** Durées proposées à l'inscription, pour une entrée à la période `start`. */
export function durationOptions(o: {
  tiers: TierLike[];
  slotCount: number;
  startsOn: string | null;
  capacity: number;
  periods: Period[];
  occupancy: number[];
  start: Period;
}): DurationOption[] {
  return durationTiers(o.tiers)
    .map((t) => {
      const first = o.start.first;
      const last = first + t.count - 1;
      const load = Math.max(
        0,
        ...o.periods
          .map((p, i) => (p.first <= last && p.last >= first ? o.occupancy[i] : 0)),
      );
      return {
        count: t.count,
        amountCents: t.amountCents,
        first,
        last,
        fromDate: o.startsOn ? sessionDate(o.startsOn, first) : null,
        toDate: o.startsOn ? sessionDate(o.startsOn, last) : null,
        placesLeft: o.capacity - load,
      };
    })
    .filter((opt) => opt.last <= o.slotCount);
}

export type ExtensionOption = {
  count: number;
  /** Supplément à payer : différence entre les deux paliers. */
  extraCents: number;
  toDate: string | null;
};

/** Prolongations possibles : paliers plus longs qui tiennent dans le cycle. */
export function extensionOptions(
  e: EngagementRef,
  tiers: TierLike[],
  slotCount: number,
  startsOn: string | null,
): ExtensionOption[] {
  const r = engagementRange(e, slotCount);
  const current = tierPrice(tiers, r.count);
  if (current == null) return [];
  return durationTiers(tiers)
    .filter((t) => t.count > r.count && r.first + t.count - 1 <= slotCount)
    .map((t) => ({
      count: t.count,
      extraCents: t.amountCents - current,
      toDate: startsOn ? sessionDate(startsOn, r.first + t.count - 1) : null,
    }));
}
