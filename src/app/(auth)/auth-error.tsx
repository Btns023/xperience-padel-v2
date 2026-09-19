"use client";

import { useSearchParams } from "next/navigation";

const MESSAGES: Record<string, string> = {
  google: "La connexion avec Google n'a pas abouti. Réessaie, ou utilise ton e-mail.",
  lien_invalide: "Ce lien de connexion n'est pas valide.",
  lien_expire: "Ce lien a expiré ou a déjà été utilisé. Reconnecte-toi.",
};

/** Message d'erreur transmis dans l'URL (?error=…) après une redirection. */
export function AuthError() {
  const code = useSearchParams().get("error");
  const message = code ? MESSAGES[code] : null;
  if (!message) return null;
  return (
    <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}
