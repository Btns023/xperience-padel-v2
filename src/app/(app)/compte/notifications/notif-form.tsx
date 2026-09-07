"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { OPTIONAL_NOTIFS } from "@/lib/notif-prefs";
import { updateNotifPrefs, type PrefState } from "./actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

function Save() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "…" : "Enregistrer"}
    </Button>
  );
}

export function NotifForm({ prefs }: { prefs: Record<string, boolean> }) {
  const [state, action] = useActionState<PrefState, FormData>(
    updateNotifPrefs,
    {},
  );
  return (
    <form action={action} className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {OPTIONAL_NOTIFS.map(({ key, label }) => (
          <li key={key}>
            <label className="flex items-center gap-3 text-sm">
              <Checkbox
                name={key}
                value="on"
                defaultChecked={prefs[key] !== false}
              />
              {label}
            </label>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Les e-mails essentiels (activation, facture, relances de paiement) sont
        toujours envoyés.
      </p>
      <div className="flex items-center gap-3">
        <Save />
        {state.ok ? (
          <span className="text-sm text-muted-foreground">Enregistré</span>
        ) : state.error ? (
          <span className="text-sm text-destructive">{state.error}</span>
        ) : null}
      </div>
    </form>
  );
}
