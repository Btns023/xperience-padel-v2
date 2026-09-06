"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { Location } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createLocation,
  updateLocation,
  deleteLocation,
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

export function NewLocationForm() {
  const [state, action] = useActionState<FormState, FormData>(createLocation, {});
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
      <p className="text-sm font-medium">Ajouter un lieu</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-name">Nom</Label>
          <Input id="new-name" name="name" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-address">Adresse</Label>
          <Input id="new-address" name="address" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-notes">Notes</Label>
        <Input id="new-notes" name="notes" />
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

export function LocationRow({ location }: { location: Location }) {
  const action = updateLocation.bind(null, location.id) as (
    prev: FormState,
    formData: FormData,
  ) => Promise<FormState>;
  const [state, formAction] = useActionState<FormState, FormData>(action, {});

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`name-${location.id}`}>Nom</Label>
          <Input
            id={`name-${location.id}`}
            name="name"
            defaultValue={location.name}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`address-${location.id}`}>Adresse</Label>
          <Input
            id={`address-${location.id}`}
            name="address"
            defaultValue={location.address ?? ""}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`notes-${location.id}`}>Notes</Label>
        <Input
          id={`notes-${location.id}`}
          name="notes"
          defaultValue={location.notes ?? ""}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="active" defaultChecked={location.active} value="on" />
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
      <div className="border-t pt-3">
        <button
          type="submit"
          formAction={deleteLocation}
          name="id"
          value={location.id}
          className="text-sm text-destructive underline-offset-4 hover:underline"
        >
          Supprimer ce lieu
        </button>
      </div>
    </form>
  );
}
