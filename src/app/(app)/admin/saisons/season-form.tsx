"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "./actions";
import type { Season } from "@/lib/types";
import { SEASON_STATUS_LABEL } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enregistrement…" : label}
    </Button>
  );
}

function Field({
  name,
  label,
  error,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function SeasonForm({
  action,
  season,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  season?: Season;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <Field name="name" label="Nom de la saison" error={fe.name}>
        <Input
          id="name"
          name="name"
          defaultValue={season?.name}
          placeholder="Saison 2026–2027"
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field name="starts_on" label="Début" error={fe.starts_on}>
          <Input
            id="starts_on"
            name="starts_on"
            type="date"
            defaultValue={season?.starts_on}
            required
          />
        </Field>
        <Field name="ends_on" label="Fin" error={fe.ends_on}>
          <Input
            id="ends_on"
            name="ends_on"
            type="date"
            defaultValue={season?.ends_on}
            required
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          name="registration_opens_on"
          label="Ouverture des inscriptions"
          error={fe.registration_opens_on}
        >
          <Input
            id="registration_opens_on"
            name="registration_opens_on"
            type="date"
            defaultValue={season?.registration_opens_on ?? ""}
          />
        </Field>
        <Field
          name="registration_closes_on"
          label="Clôture des inscriptions"
          error={fe.registration_closes_on}
        >
          <Input
            id="registration_closes_on"
            name="registration_closes_on"
            type="date"
            defaultValue={season?.registration_closes_on ?? ""}
          />
        </Field>
      </div>

      <Field name="status" label="Statut" error={fe.status}>
        <Select name="status" defaultValue={season?.status ?? "draft"}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SEASON_STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Submit label={submitLabel} />
        <Link
          href="/admin/saisons"
          className={buttonVariants({ variant: "ghost" })}
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
