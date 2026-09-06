"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { Coach } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createCoach,
  updateCoach,
  deleteCoach,
  type FormState,
} from "./actions";

function Save({ label = "Enregistrer" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "…" : label}
    </Button>
  );
}

export function NewCoachForm() {
  const [state, action] = useActionState<FormState, FormData>(createCoach, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form
      ref={ref}
      action={action}
      className="flex flex-col gap-3 rounded-lg border p-4"
    >
      <p className="text-sm font-medium">Ajouter un coach</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="c-first">Prénom</Label>
          <Input id="c-first" name="first_name" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="c-last">Nom</Label>
          <Input id="c-last" name="last_name" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="c-email">E-mail</Label>
          <Input id="c-email" name="email" type="email" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="active" defaultChecked value="on" />
        Actif
      </label>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <div>
        <Save label="Ajouter" />
      </div>
    </form>
  );
}

export function CoachRow({ coach }: { coach: Coach }) {
  const action = updateCoach.bind(null, coach.id) as (
    prev: FormState,
    formData: FormData,
  ) => Promise<FormState>;
  const [state, formAction] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`first-${coach.id}`}>Prénom</Label>
          <Input
            id={`first-${coach.id}`}
            name="first_name"
            defaultValue={coach.first_name}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`last-${coach.id}`}>Nom</Label>
          <Input
            id={`last-${coach.id}`}
            name="last_name"
            defaultValue={coach.last_name}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`email-${coach.id}`}>E-mail</Label>
          <Input
            id={`email-${coach.id}`}
            name="email"
            type="email"
            defaultValue={coach.email ?? ""}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="active" defaultChecked={coach.active} value="on" />
          Actif
        </label>
        <div className="flex items-center gap-2">
          {state.error ? (
            <span className="text-sm text-destructive">{state.error}</span>
          ) : state.ok ? (
            <span className="text-sm text-muted-foreground">Enregistré</span>
          ) : null}
          <Save />
        </div>
      </div>
      <div className="border-t pt-3 text-sm text-muted-foreground">
        {coach.profile_id
          ? "Compte coach lié."
          : "Pas encore de compte — l'invitation se fera au Lot 6."}
        <button
          type="submit"
          formAction={deleteCoach}
          name="id"
          value={coach.id}
          className="ml-3 text-destructive underline-offset-4 hover:underline"
        >
          Supprimer
        </button>
      </div>
    </form>
  );
}
