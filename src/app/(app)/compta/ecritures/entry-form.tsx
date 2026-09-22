"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { LedgerCategory } from "@/lib/ledger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveEntry, type EntryState } from "../actions";

export type EntryValues = {
  account: string;
  operation_date: string;
  sens: "recette" | "depense";
  montant: string;
  description: string;
  category_code: string;
  counterparty: string;
  communication: string;
  notes: string;
};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enregistrement…" : label}
    </Button>
  );
}

const selectCls = "h-9 rounded-md border bg-background px-2 text-sm";

export function EntryForm({
  id,
  values,
  categories,
}: {
  id: string | null;
  values: EntryValues;
  categories: LedgerCategory[];
}) {
  const [state, action] = useActionState<EntryState, FormData>(
    saveEntry.bind(null, id),
    {},
  );
  const [sens, setSens] = useState(values.sens);
  const [category, setCategory] = useState(values.category_code);
  const options = categories.filter((c) => c.direction === sens);

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sens">Sens</Label>
          <select
            id="sens"
            name="sens"
            value={sens}
            onChange={(e) => {
              setSens(e.target.value as "recette" | "depense");
              setCategory("");
            }}
            className={selectCls}
          >
            <option value="depense">Dépense</option>
            <option value="recette">Recette</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="operation_date">Date</Label>
          <Input
            id="operation_date"
            name="operation_date"
            type="date"
            defaultValue={values.operation_date}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="montant">Montant (€)</Label>
          <Input
            id="montant"
            name="montant"
            inputMode="decimal"
            placeholder="125,50"
            defaultValue={values.montant}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Libellé</Label>
        <Input
          id="description"
          name="description"
          placeholder={sens === "depense" ? "Padel Smash — location des terrains (septembre)" : "Cotisation Dupont Léa"}
          defaultValue={values.description}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category_code">Catégorie</Label>
          <select
            id="category_code"
            name="category_code"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectCls}
          >
            <option value="">— À classer —</option>
            {options.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
                {c.annex_post && c.annex_post !== c.label ? ` (${c.annex_post})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="account">Compte</Label>
          <select id="account" name="account" defaultValue={values.account} className={selectCls}>
            <option value="banque">Banque BNP</option>
            <option value="caisse">Caisse</option>
            <option value="epargne">Compte d&apos;épargne</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="counterparty">
            {sens === "depense" ? "Fournisseur" : "Payeur"}{" "}
            <span className="text-muted-foreground">(facultatif)</span>
          </Label>
          <Input id="counterparty" name="counterparty" defaultValue={values.counterparty} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="communication">
            Communication <span className="text-muted-foreground">(facultatif)</span>
          </Label>
          <Input id="communication" name="communication" defaultValue={values.communication} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">
          Note pour le comptable <span className="text-muted-foreground">(facultatif)</span>
        </Label>
        <Input id="notes" name="notes" defaultValue={values.notes} />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : state.ok ? (
        <p className="text-sm text-muted-foreground">Enregistré.</p>
      ) : null}

      <div>
        <Submit label={id ? "Enregistrer" : "Créer et joindre la pièce →"} />
      </div>
    </form>
  );
}
