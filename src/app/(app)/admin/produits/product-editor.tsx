"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { PriceTier, Product } from "@/lib/types";
import { formatEuros } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  updateProduct,
  updateTier,
  createTier,
  deleteTier,
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

function Status({ state }: { state: FormState }) {
  if (state.error)
    return <span className="text-sm text-destructive">{state.error}</span>;
  if (state.ok)
    return <span className="text-sm text-muted-foreground">Enregistré</span>;
  return null;
}

export function ProductForm({ product }: { product: Product }) {
  const action = updateProduct.bind(null, product.id) as (
    p: FormState,
    f: FormData,
  ) => Promise<FormState>;
  const [state, formAction] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nom</Label>
        <Input id="name" name="name" defaultValue={product.name} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          defaultValue={product.description ?? ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="default_session_count">Séances (défaut)</Label>
          <Input
            id="default_session_count"
            name="default_session_count"
            type="number"
            min={1}
            defaultValue={product.default_session_count ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="default_session_minutes">Durée d&apos;une séance (min)</Label>
          <Input
            id="default_session_minutes"
            name="default_session_minutes"
            type="number"
            min={1}
            defaultValue={product.default_session_minutes}
            required
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="active" defaultChecked={product.active} value="on" />
          Produit actif
        </label>
        <div className="flex items-center gap-2">
          <Status state={state} />
          <Save />
        </div>
      </div>
    </form>
  );
}

const KIND_LABEL: Record<string, string> = {
  group_size: "Effectif",
  duration: "Durée",
  unit: "Unitaire",
  flat: "Forfait",
};

function TierRow({ tier }: { tier: PriceTier }) {
  const action = updateTier.bind(null, tier.id, tier.product_id) as (
    p: FormState,
    f: FormData,
  ) => Promise<FormState>;
  const [state, formAction] = useActionState<FormState, FormData>(action, {});

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 border-b py-3 last:border-b-0"
    >
      <span className="w-16 text-xs uppercase text-muted-foreground">
        {KIND_LABEL[tier.kind]}
      </span>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`label-${tier.id}`} className="text-xs">
          Libellé
        </Label>
        <Input
          id={`label-${tier.id}`}
          name="label"
          defaultValue={tier.label}
          className="h-8 w-48"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`amount-${tier.id}`} className="text-xs">
          Montant (€)
        </Label>
        <Input
          id={`amount-${tier.id}`}
          name="amount"
          defaultValue={(tier.amount_cents / 100).toString()}
          inputMode="decimal"
          className="h-8 w-28 tabular-nums"
        />
      </div>
      {tier.kind === "group_size" ? (
        <input type="hidden" name="group_size" defaultValue={tier.group_size ?? ""} />
      ) : null}
      {tier.kind === "duration" ? (
        <input
          type="hidden"
          name="session_count"
          defaultValue={tier.session_count ?? ""}
        />
      ) : null}
      {tier.kind === "unit" ? (
        <>
          <input
            type="hidden"
            name="duration_minutes"
            defaultValue={tier.duration_minutes ?? ""}
          />
          <input type="hidden" name="variant" defaultValue={tier.variant ?? ""} />
        </>
      ) : null}
      <label className="flex items-center gap-1.5 pb-1.5 text-xs">
        <Checkbox name="active" defaultChecked={tier.active} value="on" />
        Actif
      </label>
      <div className="flex items-center gap-2 pb-0.5">
        <Save label="OK" />
        <Status state={state} />
        <button
          type="submit"
          formAction={deleteTier.bind(null, tier.product_id, tier.id)}
          className="text-xs text-destructive underline-offset-4 hover:underline"
        >
          Suppr.
        </button>
      </div>
    </form>
  );
}

export function TierList({
  product,
  tiers,
}: {
  product: Product;
  tiers: PriceTier[];
}) {
  const createKind =
    product.pricing_model === "per_group_size"
      ? "group_size"
      : product.pricing_model === "per_duration"
        ? "duration"
        : product.pricing_model === "unit"
          ? "unit"
          : "flat";

  const create = createTier.bind(null, product.id, createKind) as (
    p: FormState,
    f: FormData,
  ) => Promise<FormState>;
  const [state, createAction] = useActionState<FormState, FormData>(create, {});
  const newTierRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) newTierRef.current?.reset();
  }, [state]);

  return (
    <div className="rounded-lg border p-4">
      <p className="mb-2 text-sm font-medium">Grille tarifaire</p>
      <p className="mb-3 text-xs text-muted-foreground tabular-nums">
        {tiers.map((t) => `${t.label} : ${formatEuros(t.amount_cents)}`).join("  ·  ")}
      </p>
      <div className="flex flex-col">
        {tiers
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((t) => (
            <TierRow key={`${t.id}:${t.updated_at}`} tier={t} />
          ))}
      </div>

      <form
        ref={newTierRef}
        action={createAction}
        className="mt-4 flex flex-wrap items-end gap-3 border-t pt-4"
      >
        <span className="w-16 text-xs uppercase text-muted-foreground">
          {KIND_LABEL[createKind]}
        </span>
        <div className="flex flex-col gap-1">
          <Label htmlFor="new-tier-label" className="text-xs">
            Libellé
          </Label>
          <Input
            id="new-tier-label"
            name="label"
            className="h-8 w-48"
            placeholder="Groupe de 5"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="new-tier-amount" className="text-xs">
            Montant (€)
          </Label>
          <Input
            id="new-tier-amount"
            name="amount"
            inputMode="decimal"
            className="h-8 w-28"
          />
        </div>
        {createKind === "group_size" ? (
          <div className="flex flex-col gap-1">
            <Label htmlFor="new-tier-gs" className="text-xs">
              Effectif
            </Label>
            <Input
              id="new-tier-gs"
              name="group_size"
              type="number"
              min={1}
              className="h-8 w-20"
            />
          </div>
        ) : null}
        {createKind === "duration" ? (
          <div className="flex flex-col gap-1">
            <Label htmlFor="new-tier-sc" className="text-xs">
              Séances
            </Label>
            <Input
              id="new-tier-sc"
              name="session_count"
              type="number"
              min={1}
              className="h-8 w-20"
            />
          </div>
        ) : null}
        {createKind === "unit" ? (
          <>
            <div className="flex flex-col gap-1">
              <Label htmlFor="new-tier-var" className="text-xs">
                Variante
              </Label>
              <Input
                id="new-tier-var"
                name="variant"
                className="h-8 w-24"
                placeholder="solo"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="new-tier-dm" className="text-xs">
                Durée (min)
              </Label>
              <Input
                id="new-tier-dm"
                name="duration_minutes"
                type="number"
                min={1}
                className="h-8 w-20"
              />
            </div>
          </>
        ) : null}
        <label className="flex items-center gap-1.5 pb-1.5 text-xs">
          <Checkbox name="active" defaultChecked value="on" />
          Actif
        </label>
        <div className="flex items-center gap-2 pb-0.5">
          <Save label="Ajouter" />
          <Status state={state} />
        </div>
      </form>
    </div>
  );
}
