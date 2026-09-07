/** Préférences de notification — sans dépendance serveur (utilisable côté client). */

export type NotifKey =
  | "demande_recue"
  | "groupe_constitue"
  | "paiement_confirme"
  | "rappel_seance";

export const OPTIONAL_NOTIFS: { key: NotifKey; label: string }[] = [
  { key: "demande_recue", label: "Accusé de réception d'une demande d'inscription" },
  { key: "groupe_constitue", label: "Constitution de mon groupe" },
  { key: "paiement_confirme", label: "Confirmation de réception d'un paiement" },
  { key: "rappel_seance", label: "Rappel avant la première séance" },
];

/** Une notification optionnelle est envoyée sauf refus explicite. */
export function wantsNotif(
  prefs: Record<string, boolean> | null | undefined,
  key: NotifKey,
): boolean {
  return prefs?.[key] !== false;
}
