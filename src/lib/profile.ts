import type { Profile } from "@/lib/types";

/**
 * Coordonnées indispensables d'un client : elles figurent sur ses factures
 * (le nom et l'adresse du client sont des mentions obligatoires en Belgique).
 * Un compte Google n'apporte que le nom et l'e-mail : le reste est demandé
 * à l'étape « Complète ton profil ».
 */
type RequiredField =
  | "first_name"
  | "last_name"
  | "phone"
  | "address_line"
  | "postal_code"
  | "city";

const REQUIRED: [RequiredField, string][] = [
  ["first_name", "prénom"],
  ["last_name", "nom"],
  ["phone", "téléphone"],
  ["address_line", "adresse"],
  ["postal_code", "code postal"],
  ["city", "localité"],
];

type ProfileLike = Pick<
  Profile,
  | "role"
  | "first_name"
  | "last_name"
  | "phone"
  | "address_line"
  | "postal_code"
  | "city"
  | "terms_accepted_at"
>;

/** Ce qui manque au profil, en clair (vide = complet). */
export function missingProfileFields(p: ProfileLike | null): string[] {
  if (!p) return REQUIRED.map(([, label]) => label);
  const missing = REQUIRED.filter(([key]) => !String(p[key] ?? "").trim()).map(
    ([, label]) => label,
  );
  if (!p.terms_accepted_at) missing.push("acceptation des conditions");
  return missing;
}

/**
 * Le profil doit-il être complété avant d'aller plus loin ? Seuls les
 * clients sont concernés : les coachs et l'académie ne sont pas facturés.
 */
export function needsProfileCompletion(p: ProfileLike | null): boolean {
  if (p && p.role !== "client") return false;
  return missingProfileFields(p).length > 0;
}

/** Page « Complète ton profil », avec retour éventuel vers `next`. */
export function profileCompletionPath(next?: string | null): string {
  const url = "/compte/profil?completer=1";
  return next && next.startsWith("/") && !next.startsWith("//")
    ? `${url}&next=${encodeURIComponent(next)}`
    : url;
}
