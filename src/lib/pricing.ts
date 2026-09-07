import type { PriceTier, PricingModel } from "@/lib/types";

/**
 * Prix par joueur (centimes) figé à la confirmation d'un groupe.
 *
 * - per_group_size : palier dont group_size = effectif confirmé
 *   (à défaut, le plus grand palier défini).
 * - per_duration   : palier dont session_count = nombre de séances du créneau
 *   (à défaut, le plus proche défini).
 * - flat / unit    : renvoie null → l'administrateur saisit le prix manuellement.
 *
 * Si `prorataSessions` est fourni et inférieur au total, le prix est ramené
 * au prorata : (base / total) × restantes, arrondi à l'euro.
 */
export function computeUnitPriceCents(opts: {
  pricingModel: PricingModel;
  tiers: PriceTier[];
  groupSize: number | null;
  sessionCount: number;
  prorataSessions?: number | null;
}): number | null {
  const active = opts.tiers.filter((t) => t.active);
  let base: number | null = null;

  if (opts.pricingModel === "per_group_size" && opts.groupSize != null) {
    const gs = active.filter((t) => t.kind === "group_size");
    const exact = gs.find((t) => t.group_size === opts.groupSize);
    base =
      exact?.amount_cents ??
      [...gs].sort((a, b) => (b.group_size ?? 0) - (a.group_size ?? 0))[0]
        ?.amount_cents ??
      null;
  } else if (opts.pricingModel === "per_duration") {
    const dur = active.filter((t) => t.kind === "duration");
    const exact = dur.find((t) => t.session_count === opts.sessionCount);
    base =
      exact?.amount_cents ??
      [...dur].sort(
        (a, b) =>
          Math.abs((a.session_count ?? 0) - opts.sessionCount) -
          Math.abs((b.session_count ?? 0) - opts.sessionCount),
      )[0]?.amount_cents ??
      null;
  }

  if (base == null) return null;

  const p = opts.prorataSessions;
  if (p != null && p > 0 && p < opts.sessionCount && opts.sessionCount > 0) {
    // (base ÷ total) × restantes, arrondi à l'euro.
    const euros = (base / 100 / opts.sessionCount) * p;
    return Math.round(euros) * 100;
  }

  return base;
}
