"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { Product, PromoCode } from "@/lib/types";
import { formatEuros } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createPromo, updatePromo, deletePromo, type FormState } from "./actions";

function Save({ label = "Enregistrer" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "…" : label}
    </Button>
  );
}

function ProductSelect({
  products,
  defaultValue,
}: {
  products: Product[];
  defaultValue?: string;
}) {
  return (
    <select
      name="product_id"
      defaultValue={defaultValue ?? ""}
      className="h-8 rounded-md border bg-background px-2 text-sm"
    >
      <option value="">Tous les produits</option>
      {products.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

export function NewPromoForm({ products }: { products: Product[] }) {
  const [state, action] = useActionState<FormState, FormData>(createPromo, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form
      ref={ref}
      action={action}
      className="flex flex-wrap items-end gap-3 rounded-lg border p-4"
    >
      <p className="w-full text-sm font-medium">Nouveau code</p>
      <div className="flex flex-col gap-1">
        <Label htmlFor="np-code" className="text-xs">
          Code
        </Label>
        <Input id="np-code" name="code" placeholder="RENTREE25" className="h-8 w-40" />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="np-amount" className="text-xs">
          Remise (€)
        </Label>
        <Input
          id="np-amount"
          name="amount"
          inputMode="decimal"
          className="h-8 w-24"
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs">Portée</span>
        <ProductSelect products={products} />
      </div>
      <label className="flex items-center gap-2 pb-1.5 text-sm">
        <Checkbox name="active" defaultChecked value="on" />
        Actif
      </label>
      {state.error ? (
        <p className="w-full text-sm text-destructive">{state.error}</p>
      ) : null}
      <Save label="Créer" />
    </form>
  );
}

export function PromoRow({
  promo,
  products,
}: {
  promo: PromoCode;
  products: Product[];
}) {
  const action = updatePromo.bind(null, promo.id) as (
    p: FormState,
    f: FormData,
  ) => Promise<FormState>;
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-lg border p-4"
    >
      <div className="flex flex-col gap-1">
        <Label htmlFor={`c-${promo.id}`} className="text-xs">
          Code
        </Label>
        <Input
          id={`c-${promo.id}`}
          name="code"
          defaultValue={promo.code}
          className="h-8 w-40"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`a-${promo.id}`} className="text-xs">
          Remise (€)
        </Label>
        <Input
          id={`a-${promo.id}`}
          name="amount"
          inputMode="decimal"
          defaultValue={(promo.amount_cents / 100).toString()}
          className="h-8 w-24"
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs">Portée</span>
        <ProductSelect products={products} defaultValue={promo.product_id ?? ""} />
      </div>
      <label className="flex items-center gap-2 pb-1.5 text-sm">
        <Checkbox name="active" defaultChecked={promo.active} value="on" />
        Actif
      </label>
      <span className="pb-1.5 text-xs text-muted-foreground">
        {formatEuros(promo.amount_cents)}
      </span>
      <Save />
      {state.error ? (
        <span className="pb-1.5 text-sm text-destructive">{state.error}</span>
      ) : state.ok ? (
        <span className="pb-1.5 text-sm text-muted-foreground">Enregistré</span>
      ) : null}
      <button
        type="submit"
        formAction={deletePromo.bind(null, promo.id)}
        className="pb-1.5 text-xs text-destructive underline-offset-4 hover:underline"
      >
        Supprimer
      </button>
    </form>
  );
}
