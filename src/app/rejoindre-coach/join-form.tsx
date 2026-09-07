"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { joinAsCoach, acceptInvite, type JoinState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "…" : label}
    </Button>
  );
}

export function AcceptButton({ token }: { token: string }) {
  return (
    <form action={acceptInvite.bind(null, token)}>
      <Submit label="Rejoindre l'équipe coach" />
    </form>
  );
}

export function CoachSignupForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const action = joinAsCoach.bind(null, token, email) as (
    prev: JoinState,
    fd: FormData,
  ) => Promise<JoinState>;
  const [state, formAction] = useActionState<JoinState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>E-mail</Label>
        <Input value={email} readOnly disabled />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="first_name">Prénom</Label>
          <Input id="first_name" name="first_name" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="last_name">Nom</Label>
          <Input id="last_name" name="last_name" required />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.message ? (
        <p className="text-sm text-muted-foreground">{state.message}</p>
      ) : null}
      <Submit label="Créer mon compte coach" />
    </form>
  );
}
