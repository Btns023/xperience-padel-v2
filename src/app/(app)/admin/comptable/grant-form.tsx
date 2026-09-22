"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { grantAccountant, type GrantState } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "…" : "Ouvrir l'accès"}
    </Button>
  );
}

export function GrantForm() {
  const [state, action] = useActionState<GrantState, FormData>(grantAccountant, {});
  return (
    <form action={action} className="flex max-w-lg flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Input
          name="email"
          type="email"
          placeholder="adresse du comptable"
          required
          className="min-w-56 flex-1"
        />
        <Submit />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">{state.error}</p>
      ) : state.ok ? (
        <p className="text-sm text-muted-foreground">{state.ok}</p>
      ) : null}
    </form>
  );
}
