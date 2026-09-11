/** Formatage FR / EUR partagé. */

const EUR = new Intl.NumberFormat("fr-BE", {
  style: "currency",
  currency: "EUR",
});

/** 42500 -> "425,00 €" */
export function formatEuros(amountCents: number): string {
  return EUR.format(amountCents / 100);
}

/** "425" ou "425,50" (saisie) -> 42550 (centimes). Renvoie null si invalide. */
export function parseEurosToCents(input: string): number | null {
  const normalized = input.trim().replace(/\s/g, "").replace(",", ".");
  if (normalized === "") return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

const WEEKDAYS = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

/** 1..7 -> "lundi".."dimanche" */
export function weekdayLabel(weekday: number): string {
  return WEEKDAYS[weekday - 1] ?? "—";
}

export const WEEKDAY_OPTIONS = WEEKDAYS.map((label, i) => ({
  value: i + 1,
  label: label[0].toUpperCase() + label.slice(1),
}));

const DATE_FMT = new Intl.DateTimeFormat("fr-BE", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

/** "2026-09-15" -> "15 septembre 2026" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : DATE_FMT.format(d);
}

const DAY_MONTH_FMT = new Intl.DateTimeFormat("fr-BE", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** "2027-01-06" -> "6 janv." (dates de séances, sans année) */
export function formatDayMonth(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? "—" : DAY_MONTH_FMT.format(d);
}

/** Date du jour à Bruxelles, "AAAA-MM-JJ" (comparable telle quelle). */
export function todayInBrussels(): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Brussels",
  }).format(new Date());
}

/** "19:30:00" -> "19h30" */
export function formatTime(time: string | null | undefined): string {
  if (!time) return "—";
  const [h, m] = time.split(":");
  return m && m !== "00" ? `${Number(h)}h${m}` : `${Number(h)}h`;
}
