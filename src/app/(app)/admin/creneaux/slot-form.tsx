"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type {
  Coach,
  Location,
  PadelLevel,
  Product,
  Season,
  Slot,
} from "@/lib/types";
import { SLOT_STATUS_LABEL } from "@/lib/types";
import { WEEKDAY_OPTIONS } from "@/lib/format";
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

/** Base UI : `items` (valeur → libellé) permet à <SelectValue> d'afficher le
 *  libellé de l'option sélectionnée au lieu de la valeur brute. */
function toItems(pairs: [string, string][]): Record<string, string> {
  return Object.fromEntries(pairs);
}

export function SlotForm({
  action,
  slot,
  seasons,
  products,
  locations,
  coaches,
  levels,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  slot?: Slot;
  seasons: Season[];
  products: Product[];
  locations: Location[];
  coaches: Coach[];
  levels: PadelLevel[];
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const fe = state.fieldErrors ?? {};

  const seasonItems = toItems(seasons.map((s) => [s.id, s.name]));
  const productItems = toItems(products.map((p) => [p.id, p.name]));
  const locationItems = toItems([
    ["", "—"],
    ...locations.map((l) => [l.id, l.name] as [string, string]),
  ]);
  const coachItems = toItems([
    ["", "—"],
    ...coaches.map(
      (c) => [c.id, `${c.first_name} ${c.last_name}`] as [string, string],
    ),
  ]);
  const weekdayItems = toItems(
    WEEKDAY_OPTIONS.map((d) => [String(d.value), d.label]),
  );
  const levelItems = toItems([
    ["", "—"],
    ...levels.map((l) => [l.code, l.label] as [string, string]),
  ]);
  const statusItems = SLOT_STATUS_LABEL as Record<string, string>;

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Saison" htmlFor="season_id" error={fe.season_id}>
          <Select name="season_id" defaultValue={slot?.season_id} items={seasonItems}>
            <SelectTrigger id="season_id">
              <SelectValue placeholder="Choisir…" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Produit" htmlFor="product_id" error={fe.product_id}>
          <Select
            name="product_id"
            defaultValue={slot?.product_id}
            items={productItems}
          >
            <SelectTrigger id="product_id">
              <SelectValue placeholder="Choisir…" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Lieu" htmlFor="location_id">
          <Select
            name="location_id"
            defaultValue={slot?.location_id ?? ""}
            items={locationItems}
          >
            <SelectTrigger id="location_id">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">—</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Coach" htmlFor="coach_id">
          <Select
            name="coach_id"
            defaultValue={slot?.coach_id ?? ""}
            items={coachItems}
          >
            <SelectTrigger id="coach_id">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">—</SelectItem>
              {coaches.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Jour" htmlFor="weekday" error={fe.weekday}>
          <Select
            name="weekday"
            defaultValue={String(slot?.weekday ?? 2)}
            items={weekdayItems}
          >
            <SelectTrigger id="weekday">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WEEKDAY_OPTIONS.map((d) => (
                <SelectItem key={d.value} value={String(d.value)}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Heure" htmlFor="start_time" error={fe.start_time}>
          <Input
            id="start_time"
            name="start_time"
            type="time"
            defaultValue={slot?.start_time?.slice(0, 5) ?? "19:00"}
            required
          />
        </Field>

        <Field
          label="Durée (min)"
          htmlFor="duration_minutes"
          error={fe.duration_minutes}
        >
          <Input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min={1}
            defaultValue={slot?.duration_minutes ?? 90}
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Nombre de séances"
          htmlFor="session_count"
          error={fe.session_count}
        >
          <Input
            id="session_count"
            name="session_count"
            type="number"
            min={1}
            defaultValue={slot?.session_count ?? 9}
            required
          />
        </Field>

        <Field label="1re séance" htmlFor="starts_on">
          <Input
            id="starts_on"
            name="starts_on"
            type="date"
            defaultValue={slot?.starts_on ?? ""}
          />
        </Field>

        <Field label="Capacité" htmlFor="capacity" error={fe.capacity}>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={slot?.capacity ?? 4}
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Niveau min." htmlFor="min_level_code">
          <Select
            name="min_level_code"
            defaultValue={slot?.min_level_code ?? ""}
            items={levelItems}
          >
            <SelectTrigger id="min_level_code">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">—</SelectItem>
              {levels.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Niveau max." htmlFor="max_level_code">
          <Select
            name="max_level_code"
            defaultValue={slot?.max_level_code ?? ""}
            items={levelItems}
          >
            <SelectTrigger id="max_level_code">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">—</SelectItem>
              {levels.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Étiquette de niveau (visible de tous)" htmlFor="level_note">
        <Input
          id="level_note"
          name="level_note"
          defaultValue={slot?.level_note ?? ""}
          placeholder="Intermédiaire · P200–P300"
        />
      </Field>

      <Field label="Statut" htmlFor="status">
        <Select
          name="status"
          defaultValue={slot?.status ?? "draft"}
          items={statusItems}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SLOT_STATUS_LABEL).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Notes internes" htmlFor="notes">
        <Input id="notes" name="notes" defaultValue={slot?.notes ?? ""} />
      </Field>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Submit label={submitLabel} />
        <Link
          href="/admin/creneaux"
          className={buttonVariants({ variant: "ghost" })}
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
