"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile, type ProfileState } from "./actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enregistrement…" : label}
    </Button>
  );
}

function Field({
  id,
  label,
  defaultValue,
  autoComplete,
  type = "text",
  className = "",
}: {
  id: string;
  label: string;
  defaultValue: string | null;
  autoComplete: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue ?? ""}
        required
      />
    </div>
  );
}

export function ProfileForm({
  profile,
  email,
  next,
}: {
  profile: Profile;
  email: string;
  next: string | null;
}) {
  const [state, action] = useActionState<ProfileState, FormData>(
    updateProfile,
    {},
  );
  const needsTerms = !profile.terms_accepted_at;

  return (
    <form action={action} className="flex max-w-lg flex-col gap-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" value={email} disabled readOnly />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="first_name" label="Prénom" defaultValue={profile.first_name} autoComplete="given-name" />
        <Field id="last_name" label="Nom" defaultValue={profile.last_name} autoComplete="family-name" />
      </div>

      <Field id="phone" label="Téléphone" type="tel" defaultValue={profile.phone} autoComplete="tel" />

      <Field
        id="address_line"
        label="Adresse (rue et numéro)"
        defaultValue={profile.address_line}
        autoComplete="street-address"
      />
      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <Field id="postal_code" label="Code postal" defaultValue={profile.postal_code} autoComplete="postal-code" />
        <Field id="city" label="Localité" defaultValue={profile.city} autoComplete="address-level2" />
      </div>

      {needsTerms ? (
        <label className="flex items-start gap-3 rounded-md border p-3 text-sm">
          <input type="checkbox" name="accept_terms" required className="mt-0.5 size-4" />
          <span>
            J&apos;accepte les{" "}
            <Link href="/conditions" target="_blank" className="underline underline-offset-4">
              conditions d&apos;inscription
            </Link>{" "}
            et la{" "}
            <Link href="/confidentialite" target="_blank" className="underline underline-offset-4">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
      ) : null}

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : state.ok ? (
        <p className="text-sm text-muted-foreground">Profil enregistré.</p>
      ) : null}

      <div>
        <Submit label={next ? "Enregistrer et continuer" : "Enregistrer"} />
      </div>
    </form>
  );
}
