"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { formatDayMonth, formatEuros } from "@/lib/format";
import type { ExtensionOption } from "@/lib/engagement";
import { Button } from "@/components/ui/button";
import { extendMyRegistration, type ExtendState } from "./actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Enregistrement…" : label}
    </Button>
  );
}

/** Prolonger le cycle d'un joueur : on ne paie que la différence de palier. */
export function ExtendForm({
  registrationId,
  options,
}: {
  registrationId: string;
  options: ExtensionOption[];
}) {
  const [state, action] = useActionState<ExtendState, FormData>(
    extendMyRegistration.bind(null, registrationId),
    {},
  );
  const [count, setCount] = useState(options[0]?.count ?? 0);
  const chosen = options.find((o) => o.count === count);

  if (state.ok) {
    return (
      <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
        {state.ok}
      </p>
    );
  }

  return (
    <form
      action={action}
      className="flex flex-col gap-2 rounded-md border border-dashed p-3 text-sm"
    >
      <span className="font-medium">Prolonger le cycle</span>
      <div className="flex flex-wrap items-center gap-2">
        <select
          name="count"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="h-8 rounded-md border bg-background px-2 text-sm"
        >
          {options.map((o) => (
            <option key={o.count} value={o.count}>
              {o.count} cours
              {o.toDate ? ` — jusqu'au ${formatDayMonth(o.toDate)}` : ""} (+{" "}
              {formatEuros(o.extraCents)})
            </option>
          ))}
        </select>
        <Submit
          label={
            chosen ? `Prolonger (+ ${formatEuros(chosen.extraCents)})` : "Prolonger"
          }
        />
      </div>
      <span className="text-xs text-muted-foreground">
        Tu ne paies que la différence avec ta formule actuelle.
      </span>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
