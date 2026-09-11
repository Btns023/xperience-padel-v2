"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { Player } from "@/lib/types";
import { formatDate, formatDayMonth, formatEuros } from "@/lib/format";
import type { DurationOption } from "@/lib/engagement";
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

/** Choix de la durée d'un cycle « par durée » (ex. 9 / 18 / 27 cours). */
function DurationPicker({
  options,
  openPeriodIndex,
}: {
  options: DurationOption[];
  openPeriodIndex: number;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium">Durée du cycle</legend>
      {openPeriodIndex > 1 && options[0] ? (
        <p className="text-xs text-muted-foreground">
          Le cycle a déjà commencé : l&apos;inscription démarre à la période{" "}
          {openPeriodIndex}, séance n° {options[0].first}.
        </p>
      ) : null}
      <input type="hidden" name="first_session" value={options[0]?.first ?? 1} />
      {options.map((o) => (
        <label
          key={o.count}
          className="flex items-start gap-3 rounded-md border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
        >
          <input
            type="radio"
            name="session_count"
            value={o.count}
            required
            className="mt-0.5 size-4"
          />
          <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span>
              <span className="font-medium">{o.count} cours</span>
              {o.fromDate && o.toDate ? (
                <span className="text-muted-foreground">
                  {" "}
                  · du {formatDayMonth(o.fromDate)} au {formatDayMonth(o.toDate)}
                </span>
              ) : null}
              {o.placesLeft <= 0 ? (
                <span className="mt-1 block font-medium text-amber-700 dark:text-amber-400">
                  Complet — ta demande sera placée en liste d&apos;attente.
                </span>
              ) : o.placesLeft <= 2 ? (
                <span className="mt-1 block text-muted-foreground">
                  Plus que {o.placesLeft} place{o.placesLeft > 1 ? "s" : ""}.
                </span>
              ) : null}
            </span>
            <span className="font-medium tabular-nums">
              {formatEuros(o.amountCents)}
            </span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

export function RegisterForm({
  slotId,
  players,
  warnByPlayer,
  durations = null,
  openPeriodIndex = 1,
}: {
  slotId: string;
  players: Player[];
  warnByPlayer: Record<string, boolean>;
  /** Cycle « par durée » : options proposées ; null sinon. */
  durations?: DurationOption[] | null;
  openPeriodIndex?: number;
}) {
  const [state, formAction] = useActionState<RegState, FormData>(
    createRegistrations,
    {},
  );
  const [asOrg, setAsOrg] = useState(false);

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

      {durations ? (
        <DurationPicker options={durations} openPeriodIndex={openPeriodIndex} />
      ) : null}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">
          Joueur(s) à inscrire sur ce créneau
        </legend>
        {players.map((p) => {
          const warn = warnByPlayer[p.id];
          return (
            <label
              key={p.id}
              className={`flex items-start gap-3 rounded-md border p-3 text-sm ${
                warn
                  ? "border-amber-400 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-500/10"
                  : ""
              }`}
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
                  <span className="mt-1 block font-medium text-amber-700 dark:text-amber-400">
                    ⚠ Niveau hors de l&apos;étiquette du créneau (
                    {p.level_code}). L&apos;inscription reste possible,
                    l&apos;académie ajustera si besoin.
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="promo_code">
          Code promo <span className="text-muted-foreground">(facultatif)</span>
        </Label>
        <Input
          id="promo_code"
          name="promo_code"
          placeholder="Ex. RENTREE25"
          className="max-w-xs uppercase"
        />
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
