"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { PadelLevel, Player } from "@/lib/types";
import type { FormState } from "./actions";
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
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function PlayerForm({
  action,
  player,
  levels,
  submitLabel,
  allowSelf,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  player?: Player;
  levels: PadelLevel[];
  submitLabel: string;
  allowSelf?: boolean;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const fe = state.fieldErrors ?? {};
  const levelItems = Object.fromEntries(levels.map((l) => [l.code, l.label]));

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      {allowSelf ? (
        <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
          <input type="checkbox" name="is_self" className="size-4" />
          C&apos;est moi (je m&apos;inscris en tant que joueur)
        </label>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Prénom" htmlFor="first_name" error={fe.first_name}>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={player?.first_name}
            required
          />
        </Field>
        <Field label="Nom" htmlFor="last_name" error={fe.last_name}>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={player?.last_name}
            required
          />
        </Field>
      </div>

      <Field label="E-mail" htmlFor="email" error={fe.email}>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={player?.email}
          required
        />
        <p className="text-xs text-muted-foreground">
          Sert à envoyer l&apos;invitation d&apos;activation du compte du joueur.
        </p>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Date de naissance" htmlFor="birthdate" error={fe.birthdate}>
          <Input
            id="birthdate"
            name="birthdate"
            type="date"
            defaultValue={player?.birthdate}
            required
          />
        </Field>
        <Field label="Niveau" htmlFor="level_code" error={fe.level_code}>
          <Select
            name="level_code"
            defaultValue={player?.level_code ?? "NC"}
            items={levelItems}
          >
            <SelectTrigger id="level_code">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {levels.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Droit à l'image" error={fe.image_consent}>
        <p className="text-xs text-muted-foreground">
          J&apos;autorise Xperience Padel à utiliser des photos/vidéos du joueur
          à des fins de communication.
        </p>
        <div className="mt-1 flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="image_consent"
              value="oui"
              defaultChecked={player?.image_consent === true}
              className="size-4"
              required
            />
            Oui
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="image_consent"
              value="non"
              defaultChecked={player?.image_consent === false}
              className="size-4"
            />
            Non
          </label>
        </div>
      </Field>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Submit label={submitLabel} />
        <Link
          href="/compte/joueurs"
          className={buttonVariants({ variant: "ghost" })}
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
