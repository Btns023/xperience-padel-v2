/**
 * Communication structurée belge (OGM / VCS).
 * Format : +++DDD/DDDD/DDDDD+++  — 12 chiffres, les 2 derniers = contrôle
 * modulo 97 (97 si le reste est 0).
 */
export function structuredCommunication(base10: string): string {
  const digits = base10.replace(/\D/g, "").padStart(10, "0").slice(-10);
  // 10 chiffres tiennent largement dans un Number sûr.
  const mod = Number(digits) % 97;
  const check = String(mod === 0 ? 97 : mod).padStart(2, "0");
  const full = digits + check; // 12 chiffres
  return `+++${full.slice(0, 3)}/${full.slice(3, 7)}/${full.slice(7, 12)}+++`;
}

/**
 * Base 10 chiffres à partir de l'année et du numéro séquentiel :
 *  "26" + numéro sur 8 chiffres.
 */
export function commBaseFor(year: number, sequence: number): string {
  return String(year % 100).padStart(2, "0") + String(sequence).padStart(8, "0");
}
