"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { Player } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { createRegistrations, type RegState } from "./actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Envoi…" : "Envoyer la demande d'inscription"}
    </Button>
  );
}

export function RegisterForm({
  slotId,
  players,
  levelRank,
  slotMinRank,
  slotMaxRank,
}: {
  slotId: string;
  players: Player[];
  levelRank: Record<string, number>;
  slotMinRank: number | null;
  slotMaxRank: number | null;
}) {
  const [state, formAction] = useActionState<RegState, FormData>(
    createRegistrations,
    {},
  );
  const [asOrg, setAsOrg] = useState(false);

  function mismatch(p: Player) {
    const r = levelRank[p.level_code];
    if (r === undefined) return false;
    return (
      (slotMinRank !== null && r < slotMinRank) ||
      (slotMaxRank !== null && r > slotMaxRank)
    );
  }

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Tu n&apos;as encore aucun joueur. Ajoute-toi ou ajoute une personne à
          inscrire.
        </p>
        <Link href="/compte/joueurs/nouveau" className={buttonVariants()}>
          Ajouter un joueur
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-6">
      <input type="hidden" name="slot_id" value={slotId} />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">
          Joueur(s) à inscrire sur ce créneau
        </legend>
        {players.map((p) => {
          const warn = mismatch(p);
          return (
            <label
              key={p.id}
              className="flex items-start gap-3 rounded-md border p-3 text-sm"
            >
              <input
                type="checkbox"
                name="player_ids"
                value={p.id}
                className="mt-0.5 size-4"
              />
              <span>
                <span className="font-medium">
                  {p.first_name} {p.last_name}
                </span>{" "}
                <span className="text-muted-foreground">
                  · {p.level_code} · né(e) le {formatDate(p.birthdate)}
                </span>
                {warn ? (
                  <span className="mt-1 block text-xs text-amber-600 dark:text-amber-500">
                    Niveau hors de l&apos;étiquette du créneau — l&apos;inscription
                    reste possible, l&apos;académie ajustera si besoin.
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="as_org"
            checked={asOrg}
            onChange={(e) => setAsOrg(e.target.checked)}
            className="size-4"
          />
          J&apos;inscris au nom d&apos;une entreprise (facture à l&apos;entreprise)
        </label>
        {asOrg ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org_name">Raison sociale</Label>
              <Input id="org_name" name="org_name" required={asOrg} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org_address">Adresse</Label>
              <Input id="org_address" name="org_address" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org_vat">
                N° de TVA <span className="text-muted-foreground">(facultatif)</span>
              </Label>
              <Input id="org_vat" name="org_vat" placeholder="BE0123.456.789" />
            </div>
          </div>
        ) : null}
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Submit />
        <Link
          href="/compte/inscription"
          className={buttonVariants({ variant: "ghost" })}
        >
          Retour
        </Link>
      </div>
    </form>
  );
}
