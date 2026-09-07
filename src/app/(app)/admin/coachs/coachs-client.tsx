"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
import { inviteCoach, revokeInvite } from "./invite-actions";

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

export function CoachRow({
  coach,
  invite,
  siteUrl,
}: {
  coach: Coach;
  invite: { id: string; token: string } | null;
  siteUrl: string;
}) {
  const action = updateCoach.bind(null, coach.id) as (
    prev: FormState,
    formData: FormData,
  ) => Promise<FormState>;
  const [state, formAction] = useActionState<FormState, FormData>(action, {});

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
    <form action={formAction} className="flex flex-col gap-3">
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
    </form>

      <div className="flex flex-col gap-2 border-t pt-3 text-sm">
        {coach.profile_id ? (
          <span className="text-muted-foreground">Compte coach lié ✓</span>
        ) : invite ? (
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground">
              Invitation en attente — envoie ce lien au coach :
            </span>
            <CopyLink
              url={`${siteUrl}/rejoindre-coach?token=${invite.token}`}
            />
            <form action={revokeInvite.bind(null, invite.id)}>
              <button
                type="submit"
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Révoquer l&apos;invitation
              </button>
            </form>
          </div>
        ) : (
          <form action={inviteCoach.bind(null, coach.id)}>
            <Button type="submit" variant="outline" size="sm">
              Inviter ce coach
            </Button>
          </form>
        )}
        <form action={deleteCoach.bind(null, coach.id)}>
          <button
            type="submit"
            className="text-destructive underline-offset-4 hover:underline"
          >
            Supprimer le coach
          </button>
        </form>
      </div>
    </div>
  );
}

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1 text-xs">
        {url}
      </code>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* ignore */
          }
        }}
      >
        {copied ? "Copié" : "Copier"}
      </Button>
    </div>
  );
}
